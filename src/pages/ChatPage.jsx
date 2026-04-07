import { Mic, SendHorizontal, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";
import Button from "../components/Button";
import ChatBubble from "../components/ChatBubble";
import Header from "../components/Header";
import { useLanguage } from "../context/LanguageContext";
import { getCurrentTimeLabel } from "../utils/helpers";

export default function ChatPage() {
  const { content } = useLanguage();
  const [messages, setMessages] = useState(() => [
    {
      id: crypto.randomUUID(),
      sender: "ai",
      text: content.chat.initialMessage,
      time: getCurrentTimeLabel(content.locale),
    },
  ]);
  const [draft, setDraft] = useState("");

  useEffect(() => {
    setMessages((current) => {
      if (current.length !== 1 || current[0].sender !== "ai") {
        return current;
      }

      return [
        {
          ...current[0],
          text: content.chat.initialMessage,
        },
      ];
    });
  }, [content.chat.initialMessage]);

  const sendMessage = (text, responseKey) => {
    const cleanText = text.trim();

    if (!cleanText) {
      return;
    }

    const userTime = getCurrentTimeLabel(content.locale);
    const aiReply = responseKey
      ? content.chat.responses[responseKey]
      : content.chat.responses.fallback;

    setMessages((current) => [
      ...current,
      { id: crypto.randomUUID(), sender: "user", text: cleanText, time: userTime },
      {
        id: crypto.randomUUID(),
        sender: "ai",
        text: aiReply,
        time: getCurrentTimeLabel(content.locale),
      },
    ]);
    setDraft("");
  };

  return (
    <main className="screen-shell pb-28">
      <Header
        title={content.chat.title}
        subtitle={content.chat.subtitle}
        showBack
        action={
          <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-white/85 text-leaf-700 ring-1 ring-leaf-100">
            <Sparkles size={18} />
          </span>
        }
      />

      <section className="panel flex-1 overflow-hidden p-3">
        <div className="mb-3 flex flex-wrap gap-2">
          {content.chat.suggestions.map((suggestion) => (
            <button
              key={suggestion.id}
              type="button"
              onClick={() => sendMessage(suggestion.label, suggestion.id)}
              className="rounded-full bg-leaf-50 px-4 py-2 text-xs font-semibold text-leaf-700 ring-1 ring-leaf-100"
            >
              {suggestion.label}
            </button>
          ))}
        </div>

        <div className="flex max-h-[55vh] flex-col gap-3 overflow-y-auto px-1 py-2">
          {messages.map((message) => (
            <ChatBubble key={message.id} message={message} />
          ))}
        </div>
      </section>

      <form
        className="fixed bottom-20 left-1/2 z-10 flex w-[calc(100%-2rem)] max-w-md -translate-x-1/2 items-center gap-2 rounded-[28px] bg-white/95 p-3 shadow-soft ring-1 ring-leaf-100 backdrop-blur"
        onSubmit={(event) => {
          event.preventDefault();
          sendMessage(draft);
        }}
      >
        <button
          type="button"
          aria-label={content.chat.voiceInput}
          className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-leaf-50 text-leaf-700"
        >
          <Mic size={20} />
        </button>
        <input
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          placeholder={content.chat.placeholder}
          className="h-12 flex-1 rounded-2xl bg-soil-50 px-4 text-sm text-leaf-800 outline-none"
        />
        <Button type="submit" className="h-12 min-h-0 rounded-2xl px-4">
          <SendHorizontal size={18} />
        </Button>
      </form>
    </main>
  );
}
