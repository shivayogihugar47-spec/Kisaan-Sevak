import { motion } from "framer-motion";

export default function PageWrapper({ children, className = "" }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className={`min-h-screen w-full bg-leaf-50 pb-20 md:pb-8 font-sans text-leaf-900 selection:bg-leaf-200 ${className}`}
        >
            {children}
        </motion.div>
    );
}