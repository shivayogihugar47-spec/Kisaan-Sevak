export default function Card({ children, className = "", ...props }) {
  return (
    <section className={`panel p-5 ${className}`} {...props}>
      {children}
    </section>
  );
}
