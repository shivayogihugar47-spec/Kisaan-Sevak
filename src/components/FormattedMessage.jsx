import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export default function FormattedMessage({ text, isUser }) {
  if (isUser) {
    return <div className="whitespace-pre-wrap">{text}</div>;
  }

  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        h1: ({ children }) => <h1 className="text-lg font-black text-emerald-900 mt-4 mb-2">{children}</h1>,
        h2: ({ children }) => <h2 className="text-base font-bold text-emerald-800 mt-3 mb-2">{children}</h2>,
        h3: ({ children }) => <h3 className="text-sm font-bold text-emerald-700 mt-2 mb-1">{children}</h3>,
        p: ({ children }) => <p className="mb-3 text-slate-800 leading-relaxed">{children}</p>,
        ul: ({ children }) => <ul className="list-disc list-inside mb-3 space-y-1.5 text-slate-800">{children}</ul>,
        ol: ({ children }) => <ol className="list-decimal list-inside mb-3 space-y-1.5 text-slate-800">{children}</ol>,
        li: ({ children }) => <li className="text-slate-800 ml-2">{children}</li>,
        strong: ({ children }) => <strong className="font-bold text-emerald-900">{children}</strong>,
        em: ({ children }) => <em className="italic text-slate-700">{children}</em>,
        code: ({ children }) => (
          <code className="bg-slate-100 text-emerald-800 px-2 py-1 rounded font-mono text-xs font-semibold">
            {children}
          </code>
        ),
        pre: ({ children }) => (
          <pre className="bg-slate-900 text-emerald-300 p-4 rounded-lg overflow-x-auto mb-3 font-mono text-xs">
            {children}
          </pre>
        ),
        blockquote: ({ children }) => (
          <blockquote className="border-l-4 border-emerald-500 pl-4 py-2 my-3 bg-emerald-50 text-slate-700 italic">
            {children}
          </blockquote>
        ),
        a: ({ href, children }) => (
          <a href={href} className="text-emerald-700 font-semibold hover:underline" target="_blank" rel="noreferrer">
            {children}
          </a>
        ),
        table: ({ children }) => (
          <table className="border-collapse border border-slate-300 mb-3">{children}</table>
        ),
        thead: ({ children }) => <thead className="bg-emerald-100">{children}</thead>,
        th: ({ children }) => <th className="border border-slate-300 px-3 py-2 text-left font-bold">{children}</th>,
        td: ({ children }) => <td className="border border-slate-300 px-3 py-2">{children}</td>,
        hr: () => <hr className="my-4 border-slate-300" />,
      }}
    >
      {text}
    </ReactMarkdown>
  );
}
