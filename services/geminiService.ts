import { GoogleGenAI, Type, Modality } from "@google/genai";
import { GameState, GeminiResponse, GameStatus, StoryResponse, ImageSize } from "../types";

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
- imagePrompt: (Opcional) Uma descrição curta em INGLÊS para gerar uma imagem do momento (ex: "broken iphone screen", "angry thug face", "bundle of cash"). Usa isto APENAS se for visualmente interessante.
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
  "endingType": "good" | "bad" | "funny" | "death" (apenas se gameOver=true),
  "imagePrompt": "Descrição visual curta em INGLÊS da cena para gerar uma imagem (Opcional, mas recomendado para novas cenas)."
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
            gameStatus: { type: Type.STRING, enum: ['playing', 'won', 'lost', 'prison', 'scammed', 'robbed'] },
            imagePrompt: { type: Type.STRING, nullable: true }
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
            endingType: { type: Type.STRING, enum: ["good", "bad", "funny", "death"], nullable: true },
            imagePrompt: { type: Type.STRING, nullable: true }
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

export const generateZezeImage = async (prompt: string, size: ImageSize): Promise<string | undefined> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-image-preview',
      contents: { parts: [{ text: prompt }] },
      config: {
        imageConfig: {
          aspectRatio: "1:1",
          imageSize: size
        }
      }
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
      }
    }
  } catch (error) {
    console.error("Image generation error:", error);
    return undefined;
  }
  return undefined;
};

// Helper for ending images
export const getEndingImagePrompt = (status: GameStatus): string | undefined => {
    switch (status) {
        case GameStatus.WON: return "Happy portuguese thug holding a lot of cash, celebrating, victory, fc porto vibe";
        case GameStatus.PRISON: return "View from inside a jail cell, iron bars, dark moody lighting, police sirens outside";
        case GameStatus.SCAMMED: return "An open iphone box containing a red brick inside, street pavement background, scam";
        case GameStatus.ROBBED: return "First person view of getting punched, stars, blurry vision, angry thug walking away";
        case GameStatus.LOST: return "Empty bus stop at night, rain, lonely atmosphere, melancholic";
        default: return undefined;
    }
};

export const generateVeoVideo = async (imageBase64: string, mimeType: string): Promise<string | null> => {
    try {
        // 1. Check for API Key (Required for Veo)
        // Access aistudio via explicit casting to avoid declaration conflicts
        const win = window as any;
        if (win.aistudio && await win.aistudio.hasSelectedApiKey() === false) {
            await win.aistudio.openSelectKey();
        }

        // Create fresh instance after potential key selection
        const veoAi = new GoogleGenAI({ apiKey: process.env.API_KEY });

        // 2. Start Generation
        let operation = await veoAi.models.generateVideos({
            model: 'veo-3.1-fast-generate-preview',
            image: {
                imageBytes: imageBase64,
                mimeType: mimeType,
            },
            config: {
                numberOfVideos: 1,
                resolution: '720p',
                aspectRatio: '9:16' // Portrait for mobile feel
            }
        });

        // 3. Poll for completion
        while (!operation.done) {
            await new Promise(resolve => setTimeout(resolve, 5000)); // Wait 5s
            operation = await veoAi.operations.getVideosOperation({ operation: operation });
        }

        // 4. Get Result
        const videoUri = operation.response?.generatedVideos?.[0]?.video?.uri;
        if (!videoUri) return null;

        // 5. Download Video Bytes
        const videoResponse = await fetch(`${videoUri}&key=${process.env.API_KEY}`);
        const videoBlob = await videoResponse.blob();
        
        return URL.createObjectURL(videoBlob);

    } catch (error) {
        console.error("Veo Video Error:", error);
        return null;
    }
}


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