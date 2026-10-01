import os
from fastapi import FastAPI, HTTPException, Depends, Header
from pydantic import BaseModel
from typing import Optional, List
import openai
import anthropic
import google.generativeai as genai

app = FastAPI(title="Aether Mind Production API")

# Carga de llaves desde el archivo .env
anthropic_client = anthropic.Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
openai.api_key = os.getenv("OPENAI_API_KEY")

class ChatRequest(BaseModel):
    user_id: str
    prompt: str

class ChatResponse(BaseModel):
    routed_model: str
    response_text: str

def route_intent(prompt: str) -> str:
    prompt_lower = prompt.lower()
    code_keywords = ["code", "python", "javascript", "script", "html", "css", "sql", "bug", "api"]
    doc_keywords = ["pdf", "resumen", "analizar", "documento", "texto largo"]
    
    if any(k in prompt_lower for k in code_keywords):
        return "claude-3-5-sonnet-latest"
    elif any(k in prompt_lower for k in doc_keywords):
        return "gemini-1.5-pro-latest"
    else:
        return "gpt-4o"

@app.post("/api/v1/chat", response_model=ChatResponse)
async def chat_endpoint(request: ChatRequest, authorization: Optional[str] = Header(None)):
    # 1. Seguridad: Verificar que el usuario envía su token
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Acceso no autorizado.")
    
    model_to_use = route_intent(request.prompt)
    output = ""

    try:
        # 2. Enrutamiento dinámico según especialidad
        if model_to_use == "claude-3-5-sonnet-latest":
            res = anthropic_client.messages.create(
                model="claude-3-5-sonnet-20241022",
                max_tokens=4096,
                messages=[{"role": "user", "content": request.prompt}]
            )
            output = res.content[0].text

        elif model_to_use == "gemini-1.5-pro-latest":
            model = genai.GenerativeModel('gemini-1.5-pro')
            res = model.generate_content(request.prompt)
            output = res.text

        else: # GPT-4o
            res = openai.ChatCompletion.create(
                model="gpt-4o",
                messages=[
                    {"role": "system", "content": "Eres Aether Mind, una IA ejecutiva y técnica de alto nivel."},
                    {"role": "user", "content": request.prompt}
                ]
            )
            output = res.choices[0].message.content

        return ChatResponse(routed_model=model_to_use, response_text=output)

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error en motor de IA: {str(e)}")