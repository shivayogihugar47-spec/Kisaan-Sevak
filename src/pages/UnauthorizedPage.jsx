import { Link } from "react-router-dom";

export default function UnauthorizedPage() {
  return (
    <main className="screen-shell justify-center">
      <section className="panel px-6 py-10 text-center">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-leaf-500">Kisaan Sevak</p>
        <h1 className="mt-3 font-display text-3xl font-extrabold text-leaf-800">Unauthorized</h1>
        <p className="mt-3 text-sm text-leaf-700/80">
          Your current role does not have access to this page.
        </p>
        <Link
          to="/"
          className="mt-6 inline-flex min-h-14 items-center justify-center rounded-2xl bg-leaf-600 px-5 py-3 text-sm font-semibold text-white"
        >
          Go Home
        </Link>
      </section>
    </main>
  );
}
