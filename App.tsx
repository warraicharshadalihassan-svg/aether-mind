import React, { useState } from 'react';
import {
  StyleSheet, Text, View, TextInput, TouchableOpacity,
  FlatList, SafeAreaView, ActivityIndicator, KeyboardAvoidingView, Platform, Alert
} from 'react-native';
import { createClient } from '@supabase/supabase-supabase-js';

// Conexión con tu base de datos de usuarios
const supabaseUrl = 'https://tu-proyecto.supabase.co';
const supabaseAnonKey = 'TU_SUPABASE_ANON_KEY';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function App() {
  const [session, setSession] = useState(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);

  // Registro e Inicio de sesión real
  const handleAuth = async (type: 'LOGIN' | 'SIGNUP') => {
    setLoading(true);
    if (type === 'SIGNUP') {
      const { data, error } = await supabase.auth.signUp({ email, password });
      if (error) Alert.alert('Error', error.message);
      else Alert.alert('Éxito', 'Cuenta creada. Revisa tu correo.');
    } else {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) Alert.alert('Error', error.message);
      else setSession(data.session);
    }
    setLoading(false);
  };

  // Envío de mensajes al servidor backend
  const sendMessage = async () => {
    if (!inputText.trim()) return;

    const userMsg = { id: Date.now().toString(), sender: 'user', text: inputText };
    setMessages((prev) => [...prev, userMsg]);
    const promptToSend = inputText;
    setInputText('');
    setLoading(true);

    try {
      const response = await fetch('https://tu-backend-aether.onrender.com/api/v1/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`
        },
        body: JSON.stringify({
          user_id: session?.user?.id || 'guest',
          prompt: promptToSend
        })
      });

      const data = await response.json();
      const aetherMsg = {
        id: (Date.now() + 1).toString(),
        sender: 'aether',
        text: data.response_text,
        modelUsed: data.routed_model
      };
      setMessages((prev) => [...prev, aetherMsg]);
    } catch (err) {
      Alert.alert('Error', 'No se pudo conectar con los servidores de Aether Mind.');
    } finally {
      setLoading(false);
    }
  };

  if (!session) {
    return (
      
        AETHER MIND
        The Unified AI System
        
        
        {loading ?  : (
          
             handleAuth('LOGIN')}>
              Iniciar Sesión
            
             handleAuth('SIGNUP')}>
              Crear Cuenta Nuevo Usuario
            
          
        )}
      
    );
  }

  return (
    
      
        
          AETHER MIND
        
         item.id}
          renderItem={({ item }) => (
            
              {item.modelUsed && {item.modelUsed.toUpperCase()}}
              {item.text}
            
          )}
        />
        {loading && }
        
          
          
            →
          
        
      
    
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A0D14' },
  authContainer: { flex: 1, backgroundColor: '#0A0D14', justifyContent: 'center', padding: 24 },
  brandTitle: { fontSize: 32, fontWeight: 'bold', color: '#00F0FF', textAlign: 'center' },
  brandSubtitle: { fontSize: 14, color: '#8899A6', textAlign: 'center', marginBottom: 32 },
  input: { backgroundColor: '#161B22', color: '#FFF', borderRadius: 8, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: '#30363D' },
  primaryButton: { backgroundColor: '#00F0FF', padding: 16, borderRadius: 8, alignItems: 'center' },
  secondaryButton: { backgroundColor: 'transparent', padding: 16, borderRadius: 8, alignItems: 'center', borderWidth: 1, borderColor: '#30363D' },
  buttonText: { color: '#0A0D14', fontWeight: 'bold', fontSize: 16 },
  secondaryButtonText: { color: '#FFF', fontWeight: 'bold', fontSize: 14 },
  header: { padding: 16, borderBottomWidth: 1, borderBottomColor: '#161B22', alignItems: 'center' },
  headerTitle: { color: '#00F0FF', fontWeight: 'bold', fontSize: 18 },
  bubble: { padding: 14, borderRadius: 12, marginVertical: 6, marginHorizontal: 12, maxWidth: '80%' },
  userBubble: { backgroundColor: '#1F6FEB', alignSelf: 'flex-end' },
  aetherBubble: { backgroundColor: '#161B22', alignSelf: 'flex-start', borderWidth: 1, borderColor: '#30363D' },
  messageText: { color: '#F0F6FC', fontSize: 15 },
  modelTag: { color: '#00F0FF', fontSize: 10, fontWeight: 'bold', marginBottom: 4 },
  inputContainer: { flexDirection: 'row', padding: 12, borderTopWidth: 1, borderTopColor: '#161B22' },
  chatInput: { flex: 1, backgroundColor: '#161B22', color: '#FFF', borderRadius: 20, paddingHorizontal: 16, paddingVertical: 10 },
  sendButton: { backgroundColor: '#00F0FF', borderRadius: 20, width: 40, height: 40, justifyContent: 'center', alignItems: 'center', marginLeft: 8 },
  sendButtonText: { color: '#0A0D14', fontSize: 20, fontWeight: 'bold' }
});