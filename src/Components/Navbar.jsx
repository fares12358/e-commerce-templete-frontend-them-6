"use client";
import Link from "next/link";
import { useState } from "react";
import { FaShoppingBag, FaUser, FaBars, FaSignOutAlt, FaTimes } from "react-icons/fa";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { logoutUser } from "@/lib/api";
import Loader from "./Loader";
import { toast } from "react-toastify";
import ConfirmModal from "./ConfirmModal";

export default function Navbar() {
  // ── LOGIC UNTOUCHED ─────────────────────────────────────────
  const { user, setUser, setIsAuth, setCart, setAddresses, setOrders, cart } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [showMenu, setShowMenu] = useState(false);
  const [logoutLoading, setLogoutLoading] = useState(false);
  const [viewConfirm, setViewConfirm] = useState(false);

  const logout = async () => {
    if (logoutLoading) return;
    try {
      setLogoutLoading(true);
      const res = await logoutUser();
      if (res?.success) {
        toast.success("تم تسجيل الخروج");
        setUser(null); setIsAuth(false); setCart([]); setAddresses([]); setOrders([]);
      } else toast.error(res?.message || "لم يتم تسجيل الخروج");
    } catch (error) {
      toast.error(error?.message || error?.response?.data?.message || "فشل الاتصال بالسيرفر");
    } finally { setLogoutLoading(false); setViewConfirm(false); setShowMenu(false); }
  };
  // ── END LOGIC ────────────────────────────────────────────────

  const navLinks = [
    { href: "/",        label: "الرئيسية" },
    { href: "/shop",    label: "المتجر" },
    { href: "/about",   label: "من نحن" },
    { href: "/contact", label: "تواصل معنا" },
  ];

  return (
    <header
      className="sticky top-0 z-[200]"
      style={{
        background: "rgba(253,252,250,0.96)",
        borderBottom: "1px solid var(--border)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        boxShadow: "var(--shadow-nav)",
      }}
    >
      <div className="max-w-[1400px] mx-auto px-5 md:px-10 h-[68px] flex items-center justify-between gap-6" dir="rtl">

        {/* Logo */}
        <div onClick={() => router.push("/")} className="cursor-pointer shrink-0">
          <img src="/img/logo.webp" alt="logo" className="h-8 w-auto object-contain" />
        </div>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-0.5">
          {navLinks.map(({ href, label }) => {
            const isActive = pathname === href;
            return (
              <Link key={href} href={href}
                className="px-4 py-2 rounded-[6px] text-[14px] transition-all duration-150"
                style={{
                  fontWeight: isActive ? 500 : 400,
                  color: isActive ? "var(--accent)" : "var(--text-secondary)",
                  background: isActive ? "var(--accent-light)" : "transparent",
                }}>
                {label}
              </Link>
            );
          })}
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-2 shrink-0">
          {user && (
            <>
              {/* Cart */}
              <button
                onClick={() => { setShowMenu(false); user ? router.push("/cart") : toast.error("سجل الدخول"); }}
                className="relative w-10 h-10 flex items-center justify-center rounded-[8px] transition-all duration-150 cursor-pointer"
                style={{
                  border: `1px solid ${pathname === "/cart" ? "var(--accent-border)" : "var(--border)"}`,
                  background: pathname === "/cart" ? "var(--accent-light)" : "transparent",
                  color: pathname === "/cart" ? "var(--accent)" : "var(--text-muted)",
                }}>
                <FaShoppingBag size={14} />
                {cart.length > 0 && (
                  <span className="absolute -top-1.5 -left-1.5 min-w-[18px] h-[18px] px-1 text-[10px] font-bold rounded-full flex items-center justify-center border-2"
                    style={{ background: "var(--accent)", color: "var(--text-inverse)", borderColor: "var(--bg)" }}>
                    {cart.length}
                  </span>
                )}
              </button>

              {/* Account */}
              <button
                onClick={() => { setShowMenu(false); user ? router.push("/account") : toast.error("سجل الدخول"); }}
                className="w-10 h-10 flex items-center justify-center rounded-[8px] transition-all duration-150 cursor-pointer"
                style={{
                  border: `1px solid ${pathname === "/account" ? "var(--accent-border)" : "var(--border)"}`,
                  background: pathname === "/account" ? "var(--accent-light)" : "transparent",
                  color: pathname === "/account" ? "var(--accent)" : "var(--text-muted)",
                }}>
                <FaUser size={12} />
              </button>
            </>
          )}

          {!user ? (
            <Link href="/auth/login"
              className="hidden md:flex items-center text-[13px] font-semibold px-5 py-2.5 rounded-[8px] transition-all duration-200"
              style={{ background: "var(--accent)", color: "var(--text-inverse)", boxShadow: "var(--shadow-accent)" }}>
              تسجيل الدخول
            </Link>
          ) : (
            <button onClick={() => setViewConfirm(true)} disabled={logoutLoading}
              className="hidden md:flex items-center gap-1.5 text-[13px] font-medium px-3.5 py-2 rounded-[8px] border transition-all duration-150 cursor-pointer disabled:opacity-50"
              style={{ color: "var(--error)", border: "1px solid var(--border)", background: "transparent" }}>
              {logoutLoading ? <Loader size={18} color="var(--error)" /> : <><FaSignOutAlt size={11} /> خروج</>}
            </button>
          )}

          {!user && (
            <Link href="/auth/login" onClick={() => setShowMenu(false)}
              className="md:hidden text-[13px] font-semibold px-4 py-2 rounded-[8px]"
              style={{ background: "var(--accent)", color: "var(--text-inverse)" }}>
              دخول
            </Link>
          )}

          <button onClick={() => setShowMenu(!showMenu)}
            className="md:hidden w-10 h-10 flex items-center justify-center rounded-[8px] transition-all duration-150 cursor-pointer"
            style={{
              border: `1px solid ${showMenu ? "var(--accent-border)" : "var(--border)"}`,
              background: showMenu ? "var(--accent-light)" : "transparent",
              color: showMenu ? "var(--accent)" : "var(--text-secondary)",
            }}>
            {showMenu ? <FaTimes size={12} /> : <FaBars size={12} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {showMenu && (
        <div dir="rtl" className="md:hidden px-4 py-3 flex flex-col gap-0.5"
          style={{ borderTop: "1px solid var(--border)", background: "var(--bg)", animation: "zealSlideDown 180ms var(--ease-out) both" }}>
          {navLinks.map(({ href, label }) => {
            const isActive = pathname === href;
            return (
              <Link key={href} href={href} onClick={() => setShowMenu(false)}
                className="flex items-center px-4 py-2.5 rounded-[8px] text-[14px] transition-all duration-150"
                style={{
                  fontWeight: isActive ? 500 : 400,
                  color: isActive ? "var(--accent)" : "var(--text-secondary)",
                  background: isActive ? "var(--accent-light)" : "transparent",
                }}>
                {label}
              </Link>
            );
          })}
          <div className="h-px my-1.5" style={{ background: "var(--border)" }} />
          {user && (
            <button onClick={() => setViewConfirm(true)} disabled={logoutLoading}
              className="flex items-center gap-2 text-[13px] font-medium px-4 py-2.5 rounded-[8px] w-fit cursor-pointer"
              style={{ color: "var(--error)", background: "var(--error-bg)" }}>
              {logoutLoading ? <Loader size={16} color="var(--error)" /> : <><FaSignOutAlt size={11} />تسجيل الخروج</>}
            </button>
          )}
        </div>
      )}

      <ConfirmModal open={viewConfirm} title="تسجيل الخروج" message="هل انت متاكد انك تريد تسجيل الخروج؟"
        onConfirm={logout} icon={<FaSignOutAlt size={28} />} loading={logoutLoading} onCancel={() => setViewConfirm(false)} />
    </header>
  );
}
