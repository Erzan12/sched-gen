import { 
    CopilotRuntime, 
    copilotRuntimeNextJSAppRouterEndpoint, 
    OpenAIAdapter,
} from "@copilotkit/runtime";
import { NextRequest } from "next/server";
import OpenAI from "openai";

// Groq exposes an OpenAI-compatible API, so we can reuse the standard
// OpenAIAdapter just by pointing the base URL at Groq instead of OpenAI.
// This keeps us free to swap providers later (OpenRouter, Ollama, etc.)
// by only changing baseURL + apiKey + model — no code changes needed.
const groqClient = new OpenAI({
    apiKey: process.env.NODE_ENV,
    baseURL: "https://api.groq.com/openai/v1",
})

const serviceAdapter = new OpenAIAdapter({
    openai: groqClient,
    model: process.env.GROQ_MODEL || "llama-3.3-70b-versatile",
});

const runtime = new CopilotRuntime();

export const POST = async (req: NextRequest) => {
    const { handleRequest } = copilotRuntimeNextJSAppRouterEndpoint({
        runtime,
        serviceAdapter,
        endpoint: "api/copilotkit",
    });

    return handleRequest(req);
}

/**
 * --- Optional fallback / alt provider ---
 * If you ever hit Groq rate limits, swap the client above for OpenRouter:
 *
 * const openrouterClient = new OpenAI({
 *   apiKey: process.env.OPENROUTER_API_KEY,
 *   baseURL: "https://openrouter.ai/api/v1",
 * });
 * const serviceAdapter = new OpenAIAdapter({
 *   openai: openrouterClient,
 *   model: "openrouter/free", // auto-routes to an available free model
 * });
 */

