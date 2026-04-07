export default function ChatBubble({ message }) {
  const isUser = message.sender === "user";

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[80%] rounded-[22px] px-4 py-3 text-sm leading-relaxed shadow-sm ${
          isUser
            ? "rounded-br-md bg-leaf-600 text-white"
            : "rounded-bl-md bg-white text-leaf-800 ring-1 ring-leaf-100"
        }`}
      >
        <p>{message.text}</p>
        <span className={`mt-2 block text-[11px] ${isUser ? "text-white/75" : "text-leaf-600/70"}`}>
          {message.time}
        </span>
      </div>
    </div>
  );
}
