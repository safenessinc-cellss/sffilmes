import express from "express";
import path from "path";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Gemini safely
let ai: GoogleGenAI | null = null;
const apiKey = process.env.GEMINI_API_KEY;

function getGeminiClient(): GoogleGenAI {
  if (!ai) {
    if (!apiKey || apiKey === "MY_GEMINI_API_KEY") {
      throw new Error("GEMINI_API_KEY is not configured or contains placeholder in server environment");
    }
    ai = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return ai;
}

// API endpoint to generate budget using Gemini Flash
app.post("/api/generate-budget", async (req, res) => {
  try {
    const { pricing, clientNeeds, lang } = req.body;

    if (!clientNeeds) {
      return res.status(400).json({ error: "Client needs are required to generate a budget." });
    }

    const client = getGeminiClient();

    // Prepare a clear system prompt and pricing parameters
    const pricingPrompt = `
You are an expert sales and client billing AI assistant for "ST FILMES" (a high-end luxury photography & wedding film studio styled with high-fashion, clean minimalist luxury, and gold accents).
Your task is to analyze the client's needs and build a logical, highly coherent, and transparent budget proposal using ONLY the custom prices provided by the studio manager.

Here is the studio's pricing configuration (manager's rules):
- Base Wedding Package (Casamento): $${pricing.baseWedding || 1500}
- Base 15 Years Package (Debutante / 15 Anos): $${pricing.baseQuinceanera || 1200}
- Base Children Party Package (Festa Infantil): $${pricing.baseKids || 800}
- Base Cinematic / Other Video Session: $${pricing.baseCinematic || 1000}
- Additional Hour rate: $${pricing.hourlyRate || 150}/hour
- Extra Photographer / Videographer: $${pricing.extraStaffFee || 300} each
- Premium Drone Aerial Footage: $${pricing.droneFee || 400}
- Custom Physical Photo Album / Book: $${pricing.albumFee || 250}
- Cinematic Video Editing Upgrade (if not included in base): $${pricing.cinematicVideoUpgrade || 500}

Guidelines for Logic & Coherence:
1. Detect the Event Type: wedding (casamento), quinceanera (15 anos), kids (infantil), or cinematic/other.
2. Choose the correct Base Package price.
3. Calculate Extra Hours: If the client requests longer coverage (e.g., standard base packages usually cover 6 hours, so if they ask for 8 hours, 10 hours, etc., calculate additional hours based on the Additional Hour rate).
4. Additional Staff: If there are >150 guests or if they explicitly mention wanting multiple cameras or a second photographer, logically recommend and add the Extra Staff Fee.
5. Add Drone: If they mention aerial view, outdoor venue, beautiful landscape, or explicitly request drone, add the Premium Drone Fee.
6. Add Cinematic Video Upgrade: If they mention movie style, drone/cinematic highlights, or cinematic wedding films, add the Cinematic Video Upgrade.
7. Add Custom Album: If they mention printed book, fine art physical album, printed memories, add the Album Fee.
8. Compose a detailed break-down of line items. Sum them up to a total price.
9. Provide a logical justification for each choice so the client understands the necessity and value of each item.
10. Write a professional, warm, and highly persuasive sales message in ${lang === "pt" ? "Portuguese" : "Spanish"}.
`;

    const userPrompt = `
Generate a logical and highly professional event budget proposal based on these client needs:
"${clientNeeds}"

Generate the output in strict JSON format conforming to the provided schema. Ensure all fields are filled, logical, and matching the pricing rules.
`;

    console.log("Generating budget proposal via Gemini-3.5-flash...");
    const response = await client.models.generateContent({
      model: "gemini-3.5-flash",
      contents: userPrompt,
      config: {
        systemInstruction: pricingPrompt,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            eventType: { 
              type: Type.STRING, 
              description: "The detected type of event (wedding, quinceanera, kids, cinematic, custom)" 
            },
            baseHoursIncluded: {
              type: Type.INTEGER,
              description: "The standard baseline hours included in the base package"
            },
            summary: { 
              type: Type.STRING, 
              description: "A summary of the client needs analysis" 
            },
            lineItems: {
              type: Type.ARRAY,
              description: "Detailed line items of the budget breakdown",
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING, description: "Name of the service or addon" },
                  quantity: { type: Type.NUMBER, description: "Quantity or hours" },
                  unitPrice: { type: Type.NUMBER, description: "Unit cost based on configuration rules" },
                  totalPrice: { type: Type.NUMBER, description: "Quantity * UnitPrice" },
                  justification: { type: Type.STRING, description: "Why this was added/recommended based on client's specific requirements" }
                },
                required: ["name", "quantity", "unitPrice", "totalPrice", "justification"]
              }
            },
            totalPrice: { 
              type: Type.NUMBER, 
              description: "The total sum of all line item prices" 
            },
            recommendations: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "A list of 2-3 logical recommendations or tips to maximize coverage success"
            },
            salesPitch: {
              type: Type.OBJECT,
              properties: {
                subject: { type: Type.STRING, description: "Elegant subject line for the email/message" },
                intro: { type: Type.STRING, description: "Warm, sophisticated greeting analyzing their story/needs" },
                body: { type: Type.STRING, description: "Elegant presentation of ST FILMES custom approach" },
                closing: { type: Type.STRING, description: "Sophisticated call to action and warm sign-off" }
              },
              required: ["subject", "intro", "body", "closing"]
            }
          },
          required: ["eventType", "baseHoursIncluded", "summary", "lineItems", "totalPrice", "recommendations", "salesPitch"]
        }
      }
    });

    const text = response.text;
    if (!text) {
      throw new Error("Empty response from Gemini API");
    }

    const budgetData = JSON.parse(text.trim());
    return res.json(budgetData);

  } catch (error: any) {
    console.error("Error generating budget via Gemini:", error);
    return res.status(500).json({ 
      error: "Error generating budget via AI. Please check if GEMINI_API_KEY is configured.",
      details: error.message 
    });
  }
});

// API endpoint for interactive AI assistant chat
app.post("/api/chat-assistant", async (req, res) => {
  try {
    const { messages, lang } = req.body;

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: "Messages array is required for chat." });
    }

    const client = getGeminiClient();

    const assistantPrompt = `
You are the sophisticated, elegant virtual AI Assistant for "ST FILMES" (a high-end luxury photography & wedding film studio).
Your name is "ST Assistant". You speak with extreme politeness, charm, and refinement, fitting a luxury brand.

Your absolute primary objective in this conversation is to politely, logically, and coherently ask for the client's contact phone number (and their name / event type if they haven't shared it yet) so that our human team can follow up and send them a custom, official proposal.

Guidelines:
1. Greet the user warmly and answer any of their questions about weddings, quinceañeras, photography, filming packages, or locations in a very helpful and upscale manner.
2. Regardless of what they ask, you must ALWAYS find a logical and natural way to pivot and request their contact phone number or WhatsApp.
   - Example pivot in PT: "Para que possamos verificar a disponibilidade da data e enviar uma proposta personalizada com todos os detalhes e preços, por favor, nos informe o seu nome completo e o seu número de contato ou WhatsApp."
   - Example pivot in ES: "Para que podamos verificar la disponibilidad de la fecha y enviarle una propuesta personalizada con todos los detalles y precios, por favor, facilítenos su nombre completo y su número de contacto o WhatsApp."
3. Keep your response concise (maximum 3-4 sentences), warm, and highly professional.
4. Reply in the same language requested (${lang === "pt" ? "Portuguese" : "Spanish"}).
5. If they already provided a phone number or WhatsApp in the conversation history, thank them warmly and tell them our executive producer will contact them shortly!
`;

    // Map messages format to Gemini format: ensure only 'user' and 'model' (or 'assistant' mapped to 'model') roles are used
    const formattedContents = messages.map((msg: any) => {
      const role = (msg.role === "assistant" || msg.role === "model") ? "model" : "user";
      const text = typeof msg.content === "string" ? msg.content : (msg.content?.text || "");
      return {
        role,
        parts: [{ text }]
      };
    });

    console.log("Generating AI Assistant chat response via Gemini-3.5-flash...");
    const response = await client.models.generateContent({
      model: "gemini-3.5-flash",
      contents: formattedContents,
      config: {
        systemInstruction: assistantPrompt,
      }
    });

    const reply = response.text || "";
    return res.json({ reply });

  } catch (error: any) {
    console.error("Error in AI Assistant chat:", error);
    return res.status(500).json({ 
      error: "Error in AI Assistant chat. Please check if GEMINI_API_KEY is configured.",
      details: error.message 
    });
  }
});

// Vite & Static file handling
async function setupVite() {
  if (process.env.NODE_ENV !== "production") {
    console.log("Setting up Vite server middleware for development...");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    console.log("Setting up Express static file serving for production...");
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`ST FILMES Server listening on port ${PORT}`);
  });
}

setupVite().catch(err => {
  console.error("Vite setup error: ", err);
});
