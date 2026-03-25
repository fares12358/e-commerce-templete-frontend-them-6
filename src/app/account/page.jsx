"use client";
import { useAuth } from "@/context/AuthContext";
import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { FaBox, FaMapMarkerAlt, FaShoppingBag, FaPlus, FaChevronLeft, FaLock } from "react-icons/fa";

export default function AccountPage() {
  const { user } = useAuth();
  const router = useRouter();
  useEffect(() => { if (!user) router.push('/'); }, [user]);
  if (!user) return null;

  const menuItems = [
    { icon: <FaBox size={13} />, title: "طلباتي", desc: "تتبع الطلبات أو الشراء مرة أخرى", link: "/myOrders", accent: false },
    { icon: <FaMapMarkerAlt size={13} />, title: "عناويني", desc: "تعديل أو تعيين عنوان الشحن", link: "/myAddress", accent: true },
    { icon: <FaShoppingBag size={13} />, title: "حقيبتي", desc: "عناصرك في انتظارك", link: "/cart", accent: false },
  ];

  return (
    <main dir="rtl" className="min-h-screen" style={{ background: "var(--bg-secondary)" }}>
      <div className="max-w-[560px] mx-auto px-5 md:px-8 py-12">

        {/* Profile card */}
        <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}
          className="mb-5 overflow-hidden"
          style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius-2xl)", boxShadow: "var(--shadow-card)" }}>
          <div className="h-[2px]" style={{ background: "var(--accent)" }} />
          <div className="px-6 py-8 flex flex-col items-center text-center gap-4">
            <div className="w-20 h-20 rounded-full overflow-hidden shrink-0"
              style={{ border: "2px solid var(--border)", boxShadow: "var(--shadow-sm)" }}>
              <img src="/img/account-img.webp" alt={user.name} className="w-full h-full object-cover" />
            </div>
            <div>
              <h1 className="text-[clamp(18px,3vw,24px)] leading-[1.2] tracking-[-0.01em]"
                style={{ fontFamily: "var(--font-display)", color: "var(--text)", fontWeight: 400 }}>
                {user.name}
              </h1>
              <p className="text-[13px] mt-1" style={{ color: "var(--text-muted)" }}>{user.email}</p>
            </div>
          </div>
        </motion.div>

        {/* Section label */}
        <p className="text-[11px] font-medium tracking-[0.1em] uppercase mb-3 px-1" style={{ color: "var(--text-subtle)" }}>
          إعدادات الحساب
        </p>

        {/* Menu list */}
        <div className="mb-4 overflow-hidden"
          style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius-xl)", boxShadow: "var(--shadow-card)" }}>
          {menuItems.map((item, idx) => (
            <Link key={item.link} href={item.link}
              className="flex items-center gap-4 px-5 py-4 transition-colors duration-150 group cursor-pointer"
              style={{ borderBottom: idx < menuItems.length - 1 ? "1px solid var(--border)" : "none" }}
              onMouseEnter={e => { e.currentTarget.style.background = "var(--bg-secondary)"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}>
              <div className="w-9 h-9 rounded-full flex items-center justify-center shrink-0"
                style={{
                  background: item.accent ? "var(--accent-light)" : "var(--bg-secondary)",
                  border: `1px solid ${item.accent ? "var(--accent-border)" : "var(--border)"}`,
                  color: item.accent ? "var(--accent)" : "var(--text-muted)",
                }}>
                {item.icon}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[14px] font-medium" style={{ color: "var(--text)" }}>{item.title}</p>
                <p className="text-[12px] mt-0.5" style={{ color: "var(--text-muted)" }}>{item.desc}</p>
              </div>
              <FaChevronLeft size={11} style={{ color: "var(--border-strong)" }} className="shrink-0 transition-colors duration-150 group-hover:text-[var(--accent)]" />
            </Link>
          ))}
        </div>

        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row gap-2.5">
          <Link href="/addAddress"
            className="flex-1 flex items-center justify-center gap-2 text-[13px] font-semibold py-3 rounded-[10px] transition-all duration-200"
            style={{ background: "var(--accent)", color: "var(--text-inverse)", boxShadow: "var(--shadow-accent)" }}>
            <FaPlus size={10} /> إضافة عنوان جديد
          </Link>
          <Link href="/change-password"
            className="flex-1 flex items-center justify-center gap-2 text-[13px] font-medium py-3 rounded-[10px] transition-all duration-200"
            style={{ background: "var(--surface)", color: "var(--text-secondary)", border: "1px solid var(--border)" }}>
            <FaLock size={10} /> تغيير كلمة المرور
          </Link>
        </div>
      </div>
    </main>
  );
}
