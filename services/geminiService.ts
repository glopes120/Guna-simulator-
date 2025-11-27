
import { GoogleGenAI, Type, Modality } from "@google/genai";
import { GameState, GeminiResponse, GameStatus, StoryResponse } from "../types";

// Initialize Gemini Client
// IMPORTANT: The API key is assumed to be in process.env.API_KEY
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const NEGOTIATION_SYSTEM_INSTRUCTION = `
TU ÉS O ZÉZÉ DA AREOSA.
IDENTIDADE: O estereótipo máximo de um "Guna" do Porto.
OBJETIVO: Vender um "iPhone 15 Pro Max".

REGRAS CRÍTICAS DE FINAIS DE JOGO:
1. **WIN (Vitória do Jogador)**: Se o jogador aceitar pagar < 100€ e tu aceitares.
   - Status: 'won'.
   - Resposta: "Ganda negócio mano! Bibó Porto! Leva lá a máquina."

2. **SCAMMED (Burla)**: Se o jogador aceitar pagar > 400€ (Tu vendes-lhe um tijolo).
   - Status: 'scammed'.
   - Resposta: Goza com ele. "Vendido! (Hehe, boa sorte com o tijolo, morcão!). Desaparece!"

3. **PRISON (Prisão)**: Se o jogador disser que chamou a POLÍCIA ("bófia", "112") e for convincente, ou se aparecer policia à paisana.
   - Status: 'prison'.
   - Resposta: Pânico. "Ai a bófia?! Fugi!! Larga-me crl! Tou de pulseira!"

4. **ROBBED (Roubo)**: Se a paciência chegar a 0 de forma agressiva ou se o jogador insultar o FCP gravemente.
   - Status: 'robbed'.
   - Resposta: Agressão. "Passa para cá a carteira e o telemóvel antes que te fure todo! Tás a gozar com quem?!"

5. **LOST (Fuga)**: Se a paciência chegar a 0 por cansaço/aborrecimento.
   - Status: 'lost'.
   - Resposta: "Não tenho paciência para ti. Fica aí a falar sozinho."

PERSONALIDADE & LINGUAGEM:
- SOTAQUE DO NORTE OBRIGATÓRIO (Troca V por B, engole letras).
- Se o jogador disser "Aceito" ou "Fechado", avalia o preço atual para decidir entre WIN, PLAYING (se o preço for médio) ou SCAMMED.

RESPOSTA JSON:
- text: A tua fala.
- patienceChange: -20 a +20.
- newPrice: O preço atualizado.
- gameStatus: 'playing', 'won', 'lost', 'prison', 'scammed', 'robbed'.
`;

const STORY_SYSTEM_INSTRUCTION = `
TU ÉS O NARRADOR DE UM RPG DE ESCOLHAS ("CYOA") SITUADO NO PORTO (AREOSA/CERCO/CAMPANHÃ).
PERSONAGEM PRINCIPAL (NPC): Zézé da Areosa (Guna, Portista, Vendedor de esquemas).
JOGADOR: Um "sócio" que anda com o Zézé.

OBJETIVO:
Criar uma narrativa dinâmica, engraçada e perigosa. O jogador tem de tomar decisões morais ou estúpidas.
Cada turno deve apresentar uma situação e opções.

REGRAS DE TOM:
- Usa gíria do Porto pesada.
- Situações absurdas (ex: fugir do fiscal do autocarro, tentar entrar no Estádio do Dragão sem bilhete, vender perfumes falsos).
- O Zézé deve comentar as escolhas do jogador.

FORMATO JSON OBRIGATÓRIO:
{
  "narrative": "Descrição da cena + Fala do Zézé.",
  "options": ["Opção A", "Opção B", "Opção C"],
  "gameOver": boolean,
  "endingType": "good" | "bad" | "funny" | "death" (apenas se gameOver=true)
}
`;

export const sendGunaMessage = async (
  gameState: GameState,
  userMessage: string
): Promise<GeminiResponse> => {
  try {
    const model = 'gemini-2.5-flash';
    
    const contextPrompt = `
      ESTADO ATUAL:
      - Paciência: ${gameState.patience}/100
      - Preço Atual: ${gameState.currentPrice} euros
      
      AÇÃO DO JOGADOR: "${userMessage}"
      
      Instrução: Responde como o Zézé. Avalia se o jogo acaba.
    `;

    const response = await ai.models.generateContent({
      model: model,
      contents: contextPrompt,
      config: {
        systemInstruction: NEGOTIATION_SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            text: { type: Type.STRING },
            patienceChange: { type: Type.INTEGER },
            newPrice: { type: Type.INTEGER },
            gameStatus: { type: Type.STRING, enum: ['playing', 'won', 'lost', 'prison', 'scammed', 'robbed'] }
          },
          required: ['text', 'patienceChange', 'newPrice', 'gameStatus']
        }
      }
    });

    const jsonText = response.text;
    if (!jsonText) throw new Error("Empty response");
    return JSON.parse(jsonText) as GeminiResponse;

  } catch (error) {
    console.error("Error talking to Zézé:", error);
    return {
      text: "A rede foi abaixo sócio...",
      patienceChange: 0,
      newPrice: gameState.currentPrice,
      gameStatus: GameStatus.PLAYING
    };
  }
};

export const generateStoryTurn = async (
  history: string,
  userChoice: string
): Promise<StoryResponse> => {
  try {
    const model = 'gemini-2.5-flash';
    
    // If history is empty, it's the start of the story
    const isStart = history.length === 0;
    const prompt = isStart 
      ? "INÍCIO DA HISTÓRIA: O jogador encontrou o Zézé na paragem da Areosa. Cria uma situação inicial de 'problema' ou 'oportunidade'."
      : `HISTÓRICO RECENTE: ${history}\n\nESCOLHA DO JOGADOR: "${userChoice}"\n\nCONTINUA A HISTÓRIA. Gera consequências.`;

    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
      config: {
        systemInstruction: STORY_SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            narrative: { type: Type.STRING },
            options: { type: Type.ARRAY, items: { type: Type.STRING } },
            gameOver: { type: Type.BOOLEAN },
            endingType: { type: Type.STRING, enum: ["good", "bad", "funny", "death"], nullable: true }
          },
          required: ['narrative', 'options', 'gameOver']
        }
      }
    });

    const jsonText = response.text;
    if (!jsonText) throw new Error("Empty response");
    return JSON.parse(jsonText) as StoryResponse;

  } catch (error) {
    console.error("Story Error:", error);
    return {
      narrative: "O Zézé tropeçou e caiu. Fim da história (Erro de sistema).",
      options: [],
      gameOver: true,
      endingType: 'funny'
    };
  }
};

export const getZezeAudio = async (text: string): Promise<string | undefined> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: { parts: [{ text: text }] },
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Puck' } },
        },
      },
    });

    return response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
  } catch (error) {
    console.error("Error generating audio:", error);
    return undefined;
  }
};
