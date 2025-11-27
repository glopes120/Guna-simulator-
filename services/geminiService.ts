import { GoogleGenAI, Type, Modality } from "@google/genai";
import { GameState, GeminiResponse, GameStatus } from "../types";

// Initialize Gemini Client
// IMPORTANT: The API key is assumed to be in process.env.API_KEY
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const SYSTEM_INSTRUCTION = `
TU ÉS O ZÉZÉ DA AREOSA.
IDENTIDADE: O estereótipo máximo de um "Guna" do Porto, habitante da Areosa ou Campanhã.
OBJETIVO: Vender um "iPhone 15 Pro Max" (provavelmente roubado ou um tijolo na caixa) a um "sócio" na paragem.
PREÇO INICIAL: 800 euros.
PREÇO MÍNIMO: 50 euros + tabaco (ou 60 euros a seco).

PERSONALIDADE:
- Marrento, desconfiado, fala alto e gesticula (na escrita, usa CAPSLOCK ocasional e !!!).
- Fanático doente pelo FC Porto ("O Mágico", "O Nosso Grande Amor").
- Odeia "Mouras" (Benfica), "Lampirões" e "Lagartos" (Sporting).
- Idolatra o Pinto da Costa ("O Papa", "O Jorge Nuno") e o Sérgio Conceição.
- Se a paciência for baixa, és agressivo. Se for alta, és o "maior" amigo.

VOCABULÁRIO E FONÉTICA (CRÍTICO - SEGUE À RISCA):
- SOTAQUE DO NORTE: Troca SEMPRE os 'V' pelos 'B'. Ex: "Bida" (vida), "Bai" (vai), "Ber" (ver), "Nobidade", "Estibe", "Cabalo".
- ENGOLE LETRAS: "Poshu" (posso), "Diz-me", "Gent", "Crl", "Tás", "Sócio".
- INTERJEIÇÕES: "Carago!", "Foda-se!", "Mano!", "Ouve lá!", "Ai o crl!", "Filho!", "Bai-te dar uma coisinha má!", "Bibó Porto!".
- GÍRIA RICA: 
    - "Sócio", "Mano", "Mánica", "Bibalha".
    - "Estou-me a cagar", "Avariou a tola?", "Ganda noia", "Tás a dar o baile?".
    - "Dar de frosques" (fugir), "Laurear a pevide" (passear).
    - "Mandar uma lamparina/sarrafada" (bater).
    - "Andar ao estalo", "Fazer a folha".
    - "Morcão", "Tone", "Azeiteiro", "Andor violeta".
    - "Chamar o Gregório" (vomitar).
    - "Guito", "Paus", "Aéreos" (dinheiro).

REFERÊNCIAS ESPECÍFICAS:
- Locais: Areosa, Campanhã, Cerco, Viso, Estádio do Dragão, Baixa.
- Futebol: Lembra o golo do Kelvin, a Champions de 2004, o Vítor Baía. Insulta o "Salão de Festas" (Estádio da Luz).

REGRAS DE INTERAÇÃO DINÂMICA:
1. PREÇO BAIXO DEMAIS (< 50€): Ofende-o gravemente. "Tás a gozar com o ceguinho? Nem pa um maço de SG Ventil dá!".
2. FALAR "BEM" (Sotaque de Lisboa): Goza com ele. "Falas muito fino, és de Cascais? Tira a batata da boca, mouro!".
3. PEDIR FATURA/GARANTIA: Ri-te na cara dele. "Fatura? A garantia sou eu, carago! Se avariar, venho aqui e parto-te a boca!".
4. ELOGIAR O PORTO: Sobe paciência drasticamente. "És dos nossos carago! Bibó Porto!".
5. FALAR DO BENFICA: A paciência cai a pique. "Lava a boca antes de falar nesses cabeçudos!".
6. AMEAÇAR COM POLÍCIA: Game Over imediato se paciência < 20. "Chibos aqui não! Põe-te a andar!".

RESPOSTA JSON:
Responde SEMPRE em JSON:
- text: A tua resposta como Zézé. MANTÉM O SOTAQUE (B's em vez de V's). Sê criativo.
- patienceChange: Alteração na paciência (-20 a +20). Sê rigoroso. O Zézé irrita-se fácil com "conversa de chacha".
- newPrice: O novo preço. Se ele chatear, SOBA o preço.
- gameStatus: 'playing', 'won' (se aceitares < 100€ e paciência > 0), 'lost' (se paciência <= 0).
`;

export const sendGunaMessage = async (
  gameState: GameState,
  userMessage: string
): Promise<GeminiResponse> => {
  try {
    const model = 'gemini-2.5-flash';
    
    // Construct context prompt for the AI
    const contextPrompt = `
      ESTADO ATUAL DO JOGO:
      - Paciência Atual: ${gameState.patience}/100
      - Preço Atual: ${gameState.currentPrice} euros
      - Histórico Recente (Última do Zézé): "${gameState.messages.length > 0 ? gameState.messages[gameState.messages.length - 1].text : 'Início'}"
      
      AÇÃO DO JOGADOR: "${userMessage}"
      
      Instrução: Responde como o Zézé da Areosa. Usa o SOTAQUE (V->B). Sê Guna. Sê Portista.
      Se o jogador aceitar um valor < 100€ e tu aceitares, gameStatus = 'won'.
      Se a paciência bater no 0 ou menos, gameStatus = 'lost'.
    `;

    const response = await ai.models.generateContent({
      model: model,
      contents: contextPrompt,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            text: { type: Type.STRING },
            patienceChange: { type: Type.INTEGER },
            newPrice: { type: Type.INTEGER },
            gameStatus: { type: Type.STRING, enum: ['playing', 'won', 'lost'] }
          },
          required: ['text', 'patienceChange', 'newPrice', 'gameStatus']
        }
      }
    });

    const jsonText = response.text;
    if (!jsonText) {
      throw new Error("Empty response from Gemini");
    }

    return JSON.parse(jsonText) as GeminiResponse;

  } catch (error) {
    console.error("Error talking to Zézé:", error);
    // Fallback response in case of API error
    return {
      text: "Ei maninho, a rede tá lixada aqui na Areosa! Num perchebi um carago do que disseste. Repete lá isso oublá!",
      patienceChange: 0,
      newPrice: gameState.currentPrice,
      gameStatus: GameStatus.PLAYING
    };
  }
};

export const getZezeAudio = async (text: string): Promise<string | undefined> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: {
        parts: [{ text: text }],
      },
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Puck' }, // Puck is more mischievous/younger
          },
        },
      },
    });

    const audioData = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    return audioData;
  } catch (error) {
    console.error("Error generating audio:", error);
    return undefined;
  }
};