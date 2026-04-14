// Chat service using Puter.js - Free DeepSeek API
// No API keys needed, user-pays model

export const sendChatRequest = async ({ 
  model = "deepseek/deepseek-v3.2",
  messages, 
  temperature = 0.5 
}) => {
  try {
    // Check if puter is available (script should be loaded in HTML)
    if (typeof window === 'undefined' || !window.puter) {
      throw new Error("Puter.js not loaded. Make sure the script tag is included in your HTML.");
    }

    // Format message content
    let userContent = "";
    
    // If there's a system role message, prepend it
    const systemMsg = messages.find(m => m.role === 'system');
    const userMsg = messages[messages.length - 1];
    
    if (systemMsg) {
      userContent = `[INSTRUCTIONS]\n${systemMsg.content}\n\n[QUESTION]\n${userMsg?.content || ""}`;
    } else {
      userContent = userMsg?.content || "";
    }

    // Call Puter.js DeepSeek API
    const response = await window.puter.ai.chat(userContent, {
      model: model,
      temperature: temperature,
      max_tokens: 1024,
      stream: false // Set to false for single response
    });

    // Extract reply from response
    let reply = response?.message?.content || response?.content || response?.text || "No response received.";

    // Clean up markdown code blocks if present
    reply = reply
      .replace(/^```[\s\S]*?\n/, '') // Remove opening ```
      .replace(/\n```$/, '');        // Remove closing ```

    return {
      reply: reply
    };
  } catch (error) {
    console.error("Chat Service Error:", error);
    
    // Provide helpful error messages
    if (error.message.includes("Puter.js not loaded")) {
      throw new Error("Puter.js is not loaded. Please ensure the script tag is included in your HTML file.");
    }
    
    throw new Error(
      error.message || 
      "Failed to get response. Please check your internet connection and try again."
    );
  }
};