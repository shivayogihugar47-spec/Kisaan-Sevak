import { MessageCircleMore } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";

export default function FloatingChatButton() {
  const location = useLocation();
  const { content } = useLanguage();

  if (location.pathname === "/chat") {
    return null;
  }

  return (
    <Link
      to="/chat"
      aria-label={content.common.openChat}
      className="fixed bottom-24 right-5 inline-flex h-16 w-16 items-center justify-center rounded-full bg-leaf-600 text-white shadow-xl shadow-leaf-700/30 transition hover:scale-105 md:right-[calc(50%-12rem)]"
    >
      <MessageCircleMore size={28} />
    </Link>
  );
}
