// gemini-agent.mjs

// gemini-agent.mjs (Atualização dos imports)
import "dotenv/config"; // Continua aqui
import { GoogleGenAI } from "@google/genai";
import * as fs from "fs/promises";
import * as path from "path";
import * as crypto from "crypto";
// import * as fsSync from "fs"; // <-- Não vamos usar este, vamos usar fs/promises

// Define o caminho para o arquivo .env
const DOTENV_PATH = path.resolve(process.cwd(), ".env");
const GEMINI_MODEL = "gemini-2.5-flash-native-audio-dialog";
let aiClient;

// Define a pasta onde os históricos serão salvos (chat_data na raiz do projeto)
const DATA_DIR = path.join(process.cwd(), "chat_data");
// --- CONSTANTES DE CRIPTOGRAFIA ---
const ALGORITHM = "aes-256-cbc";
let ENCRYPTION_KEY;
const IV_LENGTH = 16;

// --- FUNÇÕES DE UTILIDADE E PERSISTÊNCIA ---

// gemini-agent.mjs (Adicione estas funções antes das funções loadChatHistoryFile/saveChatHistory)

/**
 * @function encrypt
 * @description Criptografa uma string de texto usando AES.
 * @param {string} text - A string de texto a ser criptografada (o JSON do histórico).
 * @returns {string} O texto criptografado (IV + Ciphertext).
 */
function encrypt(text) {
  const iv = crypto.randomBytes(IV_LENGTH); // Vetor de Inicialização aleatório
  const cipher = crypto.createCipheriv(ALGORITHM, ENCRYPTION_KEY, iv);

  let encrypted = cipher.update(text, "utf8", "hex");
  encrypted += cipher.final("hex");

  // Retorna o IV (primeira parte) e o dado criptografado (segunda parte), separados por ':'
  return iv.toString("hex") + ":" + encrypted;
}

/**
 * @function decrypt
 * @description Descriptografa uma string criptografada usando AES.
 * @param {string} text - O texto criptografado.
 * @returns {string} O texto descriptografado (o JSON do histórico).
 */
function decrypt(text) {
  const parts = text.split(":");
  if (parts.length !== 2) {
    throw new Error("Formato de criptografia inválido.");
  }

  const iv = Buffer.from(parts.shift(), "hex");
  const encryptedText = parts.join(":");

  const decipher = crypto.createDecipheriv(ALGORITHM, ENCRYPTION_KEY, iv);

  let decrypted = decipher.update(encryptedText, "hex", "utf8");
  decrypted += decipher.final("utf8");

  return decrypted;
}

/**
 * @description Garante que o diretório de dados existe.
 */
async function ensureDataDir() {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
  } catch (error) {
    console.error("Erro ao criar o diretório de dados:", error);
  }
}

/**
 * @description Carrega o histórico de uma sessão de chat de um arquivo .dat.
 */
async function loadChatHistoryFile(userId) {
  const filePath = path.join(DATA_DIR, `${userId}.dat`);

  try {
    const encryptedData = await fs.readFile(filePath, "utf-8"); // 1. Lê a versão ILEGÍVEL
    const decryptedData = decrypt(encryptedData); // 2. DESCRIPTOGRAFA

    return JSON.parse(decryptedData); // 3. Converte para objeto JSON
  } catch (error) {
    if (error.code === "ENOENT") {
      return null;
    }
    // Se a chave estiver errada ou o arquivo estiver corrompido, a descriptografia falhará
    console.error(
      `❌ Erro ao carregar (e descriptografar) histórico ${userId}:`,
      error
    );
    return null;
  }
}

/**
 * @description Salva o histórico de uma sessão de chat em um arquivo .dat.
 */
export async function saveChatHistory(chat, userId) {
  await ensureDataDir();
  const history = await chat.getHistory();
  const filePath = path.join(DATA_DIR, `${userId}.dat`);

  try {
    const jsonString = JSON.stringify(history); // 1. Converte para JSON
    const encryptedData = encrypt(jsonString); // 2. CRIPTOGRAFA

    await fs.writeFile(filePath, encryptedData, "utf-8"); // 3. Salva a versão ILEGÍVEL
  } catch (error) {
    console.error(
      `❌ Erro ao salvar (e criptografar) histórico ${userId}:`,
      error
    );
  }
}

/**
 * @function setupGemini
 * @description Configura, verifica chaves e gera/persiste a CHAT_ENCRYPTION_KEY autonomamente.
 */
export async function setupGemini() {
  // <--- AGORA É ASYNC
  const apiKey = process.env.GEMINI_API_KEY;
  let chatKey = process.env.CHAT_ENCRYPTION_KEY;

  if (!apiKey) {
    throw new Error("A variável de ambiente GEMINI_API_KEY não foi carregada.");
  }

  // --- LÓGICA AUTÔNOMA DE CRIPTOGRAFIA ---
  if (!chatKey || chatKey.length !== 64) {
    console.warn(
      "⚠️ CHAT_ENCRYPTION_KEY ausente ou inválida. Gerando nova chave..."
    );

    // 1. Gera a nova chave de forma segura
    const newKey = crypto.randomBytes(32).toString("hex");

    // 2. Salva a chave no arquivo .env (persiste no disco)
    await saveKeyToEnv(newKey);

    // 3. Injeta a nova chave na memória do processo para uso imediato
    process.env.CHAT_ENCRYPTION_KEY = newKey;
    chatKey = newKey; // Atualiza a variável local
  }

  // 4. Inicializa a chave de criptografia
  ENCRYPTION_KEY = Buffer.from(chatKey, "hex");

  aiClient = new GoogleGenAI({ apiKey });
  console.log(
    "✅ Cliente Gemini e Criptografia configurados autonomamente e prontos."
  );
}

/**
 * @function createNewChat
 * @description Cria uma nova sessão de chat. Tenta carregar o histórico de um arquivo persistente.
 * @param {string} userId - O ID do usuário/canal para persistência.
 * @returns {object} Um objeto 'Chat' da API Gemini.
 */
export async function createNewChat(userId) {
  if (!aiClient) {
    throw new Error(
      "Cliente Gemini não inicializado. Chame setupGemini() primeiro."
    );
  }

  let chatOptions = { model: GEMINI_MODEL };

  // Tenta carregar o histórico persistido
  const history = await loadChatHistoryFile(userId);

  if (history) {
    chatOptions.history = history;
    console.log(`✅ Histórico de chat carregado para o ID: ${userId}`);
  }

  // Cria o objeto 'Chat' (com ou sem histórico)
  const chat = aiClient.chats.create(chatOptions);

  return chat;
}

/**
 * @function sendMessage
 * @description Envia uma mensagem e salva o histórico imediatamente.
 * @param {object} chat - O objeto 'Chat' do Gemini para manter o contexto.
 * @param {string} userId - O ID do usuário/canal para salvar o arquivo.
 * @param {string} message - O texto da mensagem do usuário.
 * @returns {string} A resposta do modelo Gemini.
 */
export async function sendMessage(chat, userId, message) {
  if (!chat || !userId || !message) {
    throw new Error("Chat, ID do usuário e mensagem devem ser fornecidos.");
  }

  try {
    const response = await chat.sendMessage({ message: message });

    // Salva o histórico para persistência
    await saveChatHistory(chat, userId);

    return response.text;
  } catch (error) {
    console.error("Erro ao enviar mensagem para o Gemini:", error);
    return "Desculpe, houve um erro ao processar sua solicitação.";
  }
}

/**
 * @function saveKeyToEnv
 * @description Salva uma nova chave de criptografia no arquivo .env.
 * @param {string} newKey - A chave hexadecimal de 64 caracteres.
 */
async function saveKeyToEnv(newKey) {
  try {
    const envContent = await fs.readFile(DOTENV_PATH, { encoding: "utf-8" });

    let newContent;
    const keyLine = `CHAT_ENCRYPTION_KEY="${newKey}"`;

    // 1. Tenta substituir a linha existente (se a chave antiga for inválida, ela pode estar lá)
    if (envContent.includes("CHAT_ENCRYPTION_KEY")) {
      newContent = envContent.replace(
        /CHAT_ENCRYPTION_KEY=.*$/gm, // Expressão regular para substituir a linha CHAT_ENCRYPTION_KEY
        keyLine
      );
    } else {
      // 2. Se a chave não existir, adiciona no final do arquivo
      newContent = envContent + `\n${keyLine}\n`;
    }

    await fs.writeFile(DOTENV_PATH, newContent);
    console.log("✅ Nova CHAT_ENCRYPTION_KEY gerada e salva no arquivo .env.");
  } catch (error) {
    console.error(
      "❌ ERRO CRÍTICO: Falha ao salvar a nova chave no .env. O sistema não pode continuar de forma autônoma.",
      error
    );
    throw new Error("Falha na persistência da chave .env.");
  }
}

/**
 * @function listAvailableModels
 * @description Lista todos os modelos disponíveis para sua API Key.
 */
export async function listAvailableModels() {
  if (!aiClient) {
    throw new Error(
      "Cliente Gemini não inicializado. Chame setupGemini() primeiro."
    );
  }

  console.log("--- 🔎 MODELOS DISPONÍVEIS NA API ---");

  try {
    // 💡 CORREÇÃO: models.models para acessar a lista real (se necessário)
    const response = await aiClient.models.list();
    const modelsList = Array.isArray(response) ? response : response.models; // Tenta tratar os dois formatos

    if (!modelsList || modelsList.length === 0) {
        console.log("Nenhum modelo encontrado ou lista vazia.");
        return;
    }

    modelsList.forEach((model) => {
      // Filtra apenas modelos que suportam geração de conteúdo (como chats)
      if (model.supportedGenerativeMethods?.includes("generateContent")) {
        console.log(`✅ ID: ${model.name}`);
        console.log(
          `   Métodos Suportados: ${model.supportedGenerativeMethods.join(
            ", "
          )}`
        );
        console.log(`   Descrição: ${model.description}`);
        console.log("-----------------------------------------");
      }
    });
  } catch (error) {
    console.error("❌ Erro ao listar modelos:", error.message);
    // Se o erro for 429, ele ainda aparecerá aqui.
  }
}