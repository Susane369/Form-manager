import React, { useState, useRef, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  IconButton, 
  TextField, 
  Avatar, 
  CircularProgress 
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import SendIcon from '@mui/icons-material/Send';
import { getAIResponse } from '../services/aiService';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface ChatInterfaceProps {
  onClose: () => void;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ onClose }) => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage: Message = { role: 'user', content: input };
    const updatedMessages = [...messages, userMessage];
    
    setMessages(updatedMessages);
    setInput('');
    setIsLoading(true);

    try {
      const aiResponse = await getAIResponse(updatedMessages);
      setMessages([...updatedMessages, { role: 'assistant', content: aiResponse }]);
    } catch (error) {
      console.error('Error:', error);
      setMessages([...updatedMessages, { 
        role: 'assistant', 
        content: 'Lo siento, ocurrió un error al procesar tu mensaje.' 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box
      sx={{
        position: 'fixed',
        bottom: '100px',
        right: '20px',
        width: '350px',
        height: '500px',
        backgroundColor: 'white',
        boxShadow: '0 0 10px rgba(0,0,0,0.2)',
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        borderRadius: '12px',
        overflow: 'hidden',
      }}
    >
      <Box 
        sx={{ 
          backgroundColor: '#1976d2', 
          color: 'white', 
          p: 2, 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center' 
        }}
      >
        <Typography variant="h6">Asistente de Formularios</Typography>
        <IconButton onClick={onClose} size="small" sx={{ color: 'white' }}>
          <CloseIcon />
        </IconButton>
      </Box>

      <Box 
        sx={{ 
          flex: 1, 
          p: 2, 
          overflowY: 'auto',
          backgroundColor: '#f5f7fb',
          '&::-webkit-scrollbar': {
            width: '6px',
          },
          '&::-webkit-scrollbar-track': {
            background: '#f1f1f1',
          },
          '&::-webkit-scrollbar-thumb': {
            background: '#888',
            borderRadius: '3px',
          },
        }}
      >
        {messages.length === 0 ? (
          <Box sx={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            justifyContent: 'center', 
            height: '100%',
            textAlign: 'center',
            color: '#666',
            p: 2
          }}>
            <Typography variant="h6">¡Hola! 👋</Typography>
            <Typography variant="body1" sx={{ mt: 1, mb: 2 }}>Soy tu asistente de formularios. ¿En qué puedo ayudarte hoy?</Typography>
            <Typography variant="caption">Ejemplo: "¿Cómo puedo crear un formulario de contacto?"</Typography>
          </Box>
        ) : (
          messages.map((message, index) => (
            <Box 
              key={index} 
              sx={{ 
                display: 'flex', 
                mb: 2,
                justifyContent: message.role === 'user' ? 'flex-end' : 'flex-start',
              }}
            >
              {message.role === 'assistant' && (
                <Avatar sx={{ bgcolor: '#1976d2', width: 32, height: 32, mr: 1, alignSelf: 'flex-end' }}>A</Avatar>
              )}
              <Box
                sx={{
                  maxWidth: '80%',
                  p: 2,
                  borderRadius: message.role === 'user' 
                    ? '18px 18px 0 18px' 
                    : '18px 18px 18px 0',
                  backgroundColor: message.role === 'user' ? '#1976d2' : 'white',
                  color: message.role === 'user' ? 'white' : 'text.primary',
                  boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word',
                }}
              >
                <Typography variant="body2">{message.content}</Typography>
              </Box>
              {message.role === 'user' && (
                <Avatar sx={{ bgcolor: '#666', width: 32, height: 32, ml: 1, alignSelf: 'flex-end' }}>T</Avatar>
              )}
            </Box>
          ))
        )}
        {isLoading && (
          <Box sx={{ display: 'flex', mb: 2 }}>
            <Avatar sx={{ bgcolor: '#1976d2', width: 32, height: 32, mr: 1 }}>A</Avatar>
            <Box sx={{ p: 2, borderRadius: '18px 18px 18px 0', backgroundColor: 'white' }}>
              <CircularProgress size={16} />
            </Box>
          </Box>
        )}
        <div ref={messagesEndRef} />
      </Box>

      <Box 
        component="form" 
        onSubmit={handleSendMessage}
        sx={{ 
          p: 2, 
          borderTop: '1px solid #e0e0e0',
          backgroundColor: 'white',
        }}
      >
        <Box sx={{ display: 'flex', gap: 1 }}>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Escribe tu mensaje..."
            size="small"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isLoading}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage(e);
              }
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: '20px',
                '& fieldset': {
                  borderColor: '#e0e0e0',
                },
                '&:hover fieldset': {
                  borderColor: '#bdbdbd',
                },
                '&.Mui-focused fieldset': {
                  borderColor: '#1976d2',
                },
              },
            }}
          />
          <IconButton 
            type="submit" 
            color="primary" 
            disabled={!input.trim() || isLoading}
            sx={{ 
              backgroundColor: '#1976d2',
              color: 'white',
              '&:hover': {
                backgroundColor: '#1565c0',
              },
              '&:disabled': {
                backgroundColor: '#e0e0e0',
              },
            }}
          >
            <SendIcon />
          </IconButton>
        </Box>
        <Typography variant="caption" color="textSecondary" sx={{ mt: 1, display: 'block', textAlign: 'center' }}>
          Presiona Enter para enviar
        </Typography>
      </Box>
    </Box>
  );
};

export default ChatInterface;
