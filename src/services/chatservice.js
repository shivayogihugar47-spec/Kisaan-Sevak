export const sendChatRequest = async ({ 
  model = "poolside/laguna-m.1:free",
  messages, 
  temperature = 0.5 
}) => {
  try {
    if (typeof window === "undefined") {
      throw new Error("This service must be called in the browser.");
    }

    const apiKey = import.meta.env.VITE_OPENROUTER_API_KEY || import.meta.env.OPENROUTER_API_KEY || "";
    if (!apiKey) {
      throw new Error("OpenRouter API key is not configured.");
    }

    const systemMsg = messages.find((m) => m.role === "system");
    const userMsg = messages[messages.length - 1];
    const prompt = systemMsg ? `[INSTRUCTIONS]\n${systemMsg.content}\n\n[QUESTION]\n${userMsg?.content || ""}` : (userMsg?.content || "");

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        messages: [{ role: "user", content: prompt }],
        reasoning: { enabled: true },
      }),
    });

    const payload = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(payload?.error?.message || `OpenRouter request failed with status ${response.status}.`);
    }

    const reply = payload?.choices?.[0]?.message?.content || "No response received.";
    return { reply };
  } catch (error) {
    console.error("Chat Service Error:", error);
    throw new Error(error?.message || "Failed to get response. Please check your internet connection and try again.");
  }
};