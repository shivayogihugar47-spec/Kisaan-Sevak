export default function Button({
  children,
  type = "button",
  variant = "primary",
  className = "",
  ...props
}) {
  const variants = {
    primary:
      "border border-leaf-700 bg-leaf-700 text-white shadow-soft hover:bg-leaf-800 focus-visible:outline-leaf-700",
    secondary:
      "border border-leaf-200 bg-white text-leaf-800 shadow-sm hover:bg-leaf-50 focus-visible:outline-leaf-500",
    earthy:
      "border border-soil-100 bg-soil-50 text-leaf-900 shadow-sm hover:bg-soil-100 focus-visible:outline-soil-500",
    ghost:
      "border border-transparent bg-transparent text-leaf-700 hover:bg-leaf-50 focus-visible:outline-leaf-500",
  };

  return (
    <button
      type={type}
      className={`inline-flex min-h-14 items-center justify-center gap-3 rounded-[20px] px-5 py-3 text-sm font-semibold transition duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-60 ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
