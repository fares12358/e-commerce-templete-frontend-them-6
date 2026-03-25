// ═══════════════════════════════════════════════════════════════
// AddressesPage.jsx — ZEAL Theme
// ═══════════════════════════════════════════════════════════════
"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { FaPhone, FaTrash, FaPlus, FaMapMarkerAlt, FaStar, FaBoxOpen } from "react-icons/fa";
import { getLocation, deleteLocation, setDefaultLocation } from "@/lib/api";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import ConfirmModal from "@/Components/ConfirmModal";

export default function AddressesPage() {
  // ── LOGIC UNTOUCHED ─────────────────────────────────────────
  const { user, addresses, setAddresses } = useAuth();
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false); const [modalType, setModalType] = useState(null);
  const [selectedId, setSelectedId] = useState(null); const [actionLoading, setActionLoading] = useState(false);
  const router = useRouter();

  const fetchLocations = async () => {
    try { setLoading(true); const res = await getLocation(); if (res.success) setAddresses(res.data ?? []); }
    catch (err) { toast.error(err.message); } finally { setLoading(false); }
  };
  const openDeleteModal  = (id) => { setSelectedId(id); setModalType("delete");  setModalOpen(true); };
  const openDefaultModal = (id) => { setSelectedId(id); setModalType("default"); setModalOpen(true); };
  const handleConfirm = async () => {
    try {
      setActionLoading(true);
      let res;
      if (modalType === "delete")  { res = await deleteLocation(selectedId);     toast.success("تم حذف العنوان بنجاح"); }
      if (modalType === "default") { res = await setDefaultLocation(selectedId); toast.success("تم تعيين العنوان كافتراضي"); }
      if (res?.success) setAddresses(res.data);
      setModalOpen(false); setSelectedId(null); setModalType(null);
    } catch (err) { toast.error(err.message); } finally { setActionLoading(false); }
  };
  useEffect(() => { if (addresses.length > 0) return; fetchLocations(); }, []);
  useEffect(() => { if (!user) router.push('/'); }, [user]);
  // ── END LOGIC ────────────────────────────────────────────────

  return (
    <main dir="rtl" className="min-h-screen" style={{ background: "var(--bg)" }}>
      <div className="max-w-[1400px] mx-auto px-5 md:px-8 py-10">

        {/* Header */}
        <div className="flex items-end justify-between pb-6 mb-8 flex-wrap gap-4"
          style={{ borderBottom: "1px solid var(--border)" }}>
          <div>
            <p className="text-[11px] font-semibold tracking-[0.1em] uppercase mb-1.5" style={{ color: "var(--text-subtle)" }}>حسابي</p>
            <h1 className="text-[clamp(24px,4vw,40px)] tracking-[-0.02em]"
              style={{ fontFamily: "var(--font-display)", color: "var(--text)", fontWeight: 400 }}>عناويني</h1>
            <p className="text-[13px] mt-1" style={{ color: "var(--text-muted)" }}>إدارة عناوين الشحن الخاصة بك</p>
          </div>
          <button onClick={() => router.push("/addAddress")}
            className="inline-flex items-center gap-2 text-[13px] font-semibold px-5 py-2.5 rounded-[var(--radius-md)] border-none transition-all duration-200 cursor-pointer hover:-translate-y-px"
            style={{ background: "var(--accent)", color: "#fff", boxShadow: "var(--shadow-accent)" }}>
            <FaPlus size={10} /> إضافة عنوان جديد
          </button>
        </div>

        {/* Skeleton */}
        {loading && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[1, 2, 3].map(i => (
              <div key={i} className="rounded-[var(--radius-lg)] border p-5 animate-pulse space-y-3"
                style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
                <div className="h-4 rounded-full w-2/3" style={{ background: "var(--bg-tertiary)" }} />
                <div className="h-3 rounded-full w-full" style={{ background: "var(--bg-tertiary)" }} />
                <div className="h-3 rounded-full w-4/5" style={{ background: "var(--bg-tertiary)" }} />
              </div>
            ))}
          </div>
        )}

        {/* Empty */}
        {!loading && addresses.length === 0 && (
          <div className="flex flex-col items-center justify-center gap-4 py-24 text-center">
            <div className="w-14 h-14 rounded-[var(--radius-lg)] flex items-center justify-center border"
              style={{ background: "var(--surface)", borderColor: "var(--border)", boxShadow: "var(--shadow-card)" }}>
              <FaBoxOpen size={20} style={{ color: "var(--border-strong)" }} />
            </div>
            <div>
              <p className="text-[16px] font-semibold mb-1" style={{ color: "var(--text)" }}>لا توجد عناوين</p>
              <p className="text-[13px]" style={{ color: "var(--text-muted)" }}>أضف عنوان شحن للبدء</p>
            </div>
            <button onClick={() => router.push("/addAddress")}
              className="inline-flex items-center gap-2 text-[13px] font-semibold px-5 py-2.5 rounded-[var(--radius-md)] border-none transition-all duration-200 cursor-pointer mt-1"
              style={{ background: "var(--accent)", color: "#fff", boxShadow: "var(--shadow-accent)" }}>
              <FaPlus size={10} /> إضافة عنوان
            </button>
          </div>
        )}

        {/* Cards */}
        {!loading && addresses.length > 0 && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {addresses.map((addr, i) => (
              <motion.div key={addr._id} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: i * 0.05 }}
                className="rounded-[var(--radius-lg)] overflow-hidden flex flex-col transition-all duration-200"
                style={{
                  background: "var(--surface)",
                  border: addr.default ? "1px solid var(--accent)" : "1px solid var(--border)",
                  boxShadow: addr.default ? "var(--shadow-accent)" : "var(--shadow-card)",
                }}>

                {addr.default && <div className="h-[3px]" style={{ background: "var(--accent)" }} />}

                <div className="p-5 flex flex-col gap-3 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex flex-col gap-1.5">
                      {addr.default && (
                        <span className="inline-flex items-center gap-1.5 text-[10px] font-semibold tracking-[0.06em] uppercase px-2.5 py-1 rounded-[var(--radius-full)] border w-fit"
                          style={{ color: "var(--accent)", background: "var(--accent-light)", borderColor: "var(--accent-border)" }}>
                          <FaStar size={7} /> افتراضي
                        </span>
                      )}
                      <h3 className="text-[14px] font-semibold" style={{ color: "var(--text)" }}>{addr.strName || "عنوان بدون اسم"}</h3>
                    </div>
                    <div className="w-9 h-9 rounded-[var(--radius-md)] flex items-center justify-center shrink-0 border"
                      style={{ background: "var(--accent-light)", borderColor: "var(--accent-border)" }}>
                      <FaMapMarkerAlt size={12} style={{ color: "var(--accent)" }} />
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5 text-[13px]" style={{ color: "var(--text-secondary)" }}>
                    {addr.country && <p className="font-semibold" style={{ color: "var(--text)" }}>{addr.country}</p>}
                    {(addr.city || addr.government) && <p>{[addr.city, addr.government].filter(Boolean).join(" - ")}</p>}
                    {addr.locationDescription && <p className="text-[12px]" style={{ color: "var(--text-muted)" }}>{addr.locationDescription}</p>}
                  </div>

                  {addr.phone && (
                    <div className="flex items-center gap-2 text-[12px] font-mono" style={{ color: "var(--text-muted)" }}>
                      <FaPhone size={9} className="shrink-0" style={{ color: "var(--accent)" }} />
                      <span dir="ltr">{addr.phone}</span>
                    </div>
                  )}

                  {addr.locationLink && (
                    <a href={addr.locationLink} target="_blank" rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-[12px] font-semibold px-3 py-1.5 rounded-[var(--radius-md)] border w-fit transition-all duration-150"
                      style={{ color: "var(--accent)", background: "var(--accent-light)", borderColor: "var(--accent-border)" }}>
                      <FaMapMarkerAlt size={9} /> عرض على الخريطة
                    </a>
                  )}
                </div>

                <div className="px-5 py-3 flex items-center justify-between gap-2"
                  style={{ borderTop: "1px solid var(--border)", background: "var(--bg-secondary)" }}>
                  {!addr.default ? (
                    <button onClick={() => openDefaultModal(addr._id)}
                      className="inline-flex items-center gap-1.5 text-[12px] font-semibold transition-colors duration-150 cursor-pointer"
                      style={{ color: "var(--text-secondary)" }}>
                      <FaStar size={10} style={{ color: "var(--accent)" }} /> تعيين كافتراضي
                    </button>
                  ) : <span />}
                  <button onClick={() => openDeleteModal(addr._id)}
                    className="inline-flex items-center gap-1.5 text-[12px] font-medium transition-colors duration-150 cursor-pointer"
                    style={{ color: "var(--text-subtle)" }}>
                    <FaTrash size={10} /> حذف
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      <ConfirmModal open={modalOpen} loading={actionLoading}
        onCancel={() => { if (!actionLoading) setModalOpen(false); }}
        onConfirm={handleConfirm}
        icon={modalType === "delete" ? <FaTrash size={22} style={{ color: "var(--error)" }} /> : <FaStar size={22} style={{ color: "var(--accent)" }} />}
        title={modalType === "delete" ? "حذف العنوان" : "تعيين كافتراضي"}
        message={modalType === "delete" ? "هل أنت متأكد من حذف هذا العنوان؟ لا يمكن التراجع." : "هل تريد تعيين هذا العنوان كعنوان افتراضي؟"} />
    </main>
  );
}
