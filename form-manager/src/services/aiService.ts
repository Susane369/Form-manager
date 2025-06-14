import axios from 'axios';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

// Configuración garantizada
const HF_TOKEN = import.meta.env.VITE_HF_API_TOKEN || '';
const MODEL_NAME = "mistralai/Mistral-7B-Instruct-v0.1"; // Modelo principal
const BACKUP_MODEL = "HuggingFaceH4/zephyr-7b-beta"; // Alternativa comprobada
const API_BASE_URL = "https://api-inference.huggingface.co/models/";

// Verificación del entorno
if (!HF_TOKEN) {
  console.error("ERROR: Falta VITE_HF_API_TOKEN en .env");
  throw new Error("Configuración incompleta - Verifica tu archivo .env");
}

export const getAIResponse = async (messages: Message[]): Promise<string> => {
  const userMessage = messages.filter(m => m.role === 'user').pop()?.content || "";
  
  if (!userMessage.trim()) {
    return "Por favor envía un mensaje válido";
  }

  // Intenta primero con el modelo principal
  let response = await tryModel(MODEL_NAME, userMessage);
  
  // Si falla, usa el modelo de respaldo
  if (!response.success) {
    console.warn(`Falló ${MODEL_NAME}, intentando con ${BACKUP_MODEL}...`);
    response = await tryModel(BACKUP_MODEL, userMessage);
  }

  if (response.success) {
    return response.text;
  } else {
    console.error("Ambos modelos fallaron:", response.error);
    return "⚠️ Lo siento, nuestros sistemas están ocupados. Por favor inténtalo más tarde.";
  }
};

// Función auxiliar para manejar modelos
async function tryModel(model: string, prompt: string): Promise<{success: boolean, text?: string, error?: string}> {
  try {
    const response = await axios.post(
      `${API_BASE_URL}${model}`,
      {
        inputs: prompt,
        parameters: {
          max_new_tokens: 200,
          temperature: 0.7,
          return_full_text: false
        },
        options: {
          wait_for_model: true // Espera si el modelo está cargando
        }
      },
      { 
        headers: { 
          "Authorization": `Bearer ${HF_TOKEN}`,
          "Content-Type": "application/json" 
        },
        timeout: 45000 // 45 segundos máximo
      }
    );

    const generatedText = response.data[0]?.generated_text || "No pude generar una respuesta";
    return { success: true, text: generatedText };
    
  } catch (error: any) {
    const errorMsg = error.response?.data?.error || error.message;
    console.error(`Error con ${model}:`, errorMsg);
    return { success: false, error: errorMsg };
  }
}