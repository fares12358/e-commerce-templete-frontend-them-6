import Link from "next/link";
import { FaShoppingBag } from "react-icons/fa";

export default function FloatingShopButton() {
  return (
    <Link href="/shop"
      className="fixed bottom-6 left-5 z-[200] inline-flex items-center gap-2 text-[13px] font-semibold tracking-[0.02em] px-5 py-3 rounded-full transition-all duration-200"
      style={{
        background: "var(--accent)",
        color: "var(--text-inverse)",
        border: "1px solid rgba(200,131,26,0.25)",
        boxShadow: "0 4px 18px rgba(200,131,26,0.35)",
      }}>
      <FaShoppingBag size={13} />
      المتجر
    </Link>
  );
}
