export default function Footer() {
  return (
    <footer style={{ borderTop: "1px solid var(--border)", background: "var(--bg-secondary)" }} className="py-8 px-5">
      <p className="text-center text-[12px] font-medium tracking-[0.03em]" style={{ color: "var(--text-subtle)" }} dir="ltr">
        © {new Date().getFullYear()} EGCODE — All Rights Reserved — Developed By Fares Mohamed
      </p>
    </footer>
  );
}
