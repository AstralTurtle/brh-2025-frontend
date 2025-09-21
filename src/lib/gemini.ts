import {
  GoogleGenerativeAI,
  HarmBlockThreshold,
  HarmCategory,
} from "@google/generative-ai";

const apiKey = process.env.GOOGLE_API_KEY;
if (!apiKey) throw new Error("GOOGLE_API_KEY is not set");

// Use env or default
export const modelName = process.env.GEMINI_MODEL || "gemini-1.5-flash";

export const generationConfig = {
  temperature: 0.4,
  maxOutputTokens: 4000,
};

export const safetySettings = [
  { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
  { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
  { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE }, // fixed enum
  { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
  { category: HarmCategory.HARM_CATEGORY_CIVIC_INTEGRITY, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },  // optional but supported
];

export const systemPrompt =
  process.env.GEMINI_SYSTEM_PROMPT ||
  `You are an adaptive idea collaborator.
- Be supportive and concise. Use a Socratic style with 1–3 probing questions.
- Vary the style. Avoid rigid templates or the same sections every time.
- Give concrete suggestions and risks only if relevant; use bullets sparingly.
- If details are missing, ask clarifying questions before deep dives.
- Keep responses under ~8–12 sentences unless asked for more.`;

// New: Interactive Game Dev Partner
export const gameDevSystemPrompt = `
You are an experienced game design partner. Your goal is to collaborate through a practical, back-and-forth conversation to rapidly shape and validate game ideas.

**Your Core Process:**
1.  **Clarify First:** If the user's initial idea is vague or missing key info (like genre, platform, or the core player fantasy), your *first* response must be 2-3 targeted questions to understand the vision. Do not give a full design breakdown until you have the basics. Example: "That sounds fun! To get started, could you tell me: What's the platform (PC, mobile?), and what's the core feeling you want the player to have?"
2.  **Focused, Short Responses:** Tackle only 1-2 design pillars at a time (e.g., "Let's nail down the Player Fantasy and Core Loop first."). Use bullet points and bold text to keep your responses scannable and concise, ideally under 150 words.
3.  **Always End with a Question:** Conclude every response with a question to check for alignment and guide the next step. This keeps the conversation moving. Example: "How does that initial loop sound?" or "Ready to brainstorm some progression mechanics?"

**Your Design Toolkit (bring these up naturally in conversation):**
- **The Core:** Player Fantasy, Target Audience, Core Loop.
- **The Feel:** Mechanics, Controls, Camera.
- **The Journey:** Progression, Economy, Onboarding, Difficulty.
- **The Reality:** Scope Control, Platform Constraints (mobile/PC/console/web), Technical Feasibility (Unity/Unreal/etc.).

When an idea is ready for validation, propose a concrete prototyping step and 2-3 sharp playtest questions to test a specific assumption. Be supportive, practical, and conversational—avoid long, theoretical lectures.
`;

const genAI = new GoogleGenerativeAI(apiKey);

export function getModel() {
  return genAI.getGenerativeModel({
    model: modelName,
    // @ts-ignore
    systemInstruction: { parts: [{ text: systemPrompt }] },
  });
}