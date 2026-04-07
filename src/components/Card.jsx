export default function Card({ children, className = "" }) {
  return <section className={`panel p-5 ${className}`}>{children}</section>;
}
