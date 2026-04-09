import { motion } from "framer-motion";
import { Zap } from "lucide-react";
import Header from "./Header";
import PageWrapper from "./PageWrapper"; // Import the wrapper we created earlier
import LanguageSwitcher from "./LanguageSwitcher"; // Assuming this exists based on your DashboardPage
import { useLanguage } from "../context/LanguageContext";

// Animation variants for smooth, staggered loading
const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } }
};

export default function DashboardShell({ badge, title, description, children, showBack = false }) {
  const { content } = useLanguage();
  return (
    <PageWrapper>
      <Header 
        title={title}
        subtitle={description}
        showBack={showBack}
        action={badge && (
          <span className="rounded-full bg-leaf-200/50 px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-leaf-800 shadow-sm border border-leaf-100">
            {badge}
          </span>
        )}
        maxWidth="max-w-5xl"
      />

      {/* --- MAIN SHELL CONTENT --- */}
      <motion.main
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="mx-auto max-w-5xl px-5 md:px-8"
      >


        {/* INJECTED PAGE CONTENT */}
        <motion.div variants={itemVariants} className="pb-12">
          {children}
        </motion.div>
      </motion.main>
    </PageWrapper>
  );
}