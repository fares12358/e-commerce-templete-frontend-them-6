// ═══════════════════════════════════════════════════════════════
// OrderDetailsPage.jsx — ZEAL Theme  (v1.0.4: refund request)
// ═══════════════════════════════════════════════════════════════
"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { getOrderById, cancelOrder, getInvoice, requestRefund } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { motion } from "framer-motion";
import {
  FaCheckCircle, FaCog, FaTruck, FaBox, FaMapMarkerAlt,
  FaWallet, FaPrint, FaBoxOpen, FaTimes, FaUndo,
} from "react-icons/fa";
import Link from "next/link";
import Loader from "@/Components/Loader";
import ConfirmModal from "@/Components/ConfirmModal";

const steps = [
  { key: "ordered",    label: "تم الطلب",    icon: FaCheckCircle },
  { key: "processing", label: "قيد التجهيز", icon: FaCog         },
  { key: "shipped",    label: "تم الشحن",    icon: FaTruck       },
  { key: "delivered",  label: "تم التوصيل", icon: FaBox         },
];
const statusToStep = {
  pending: "ordered", confirmed: "processing",
  shipped: "shipped", delivered: "delivered", cancelled: "ordered",
};
const statusStyles = {
  pending:   { bg: "var(--warning-bg)",   border: "var(--warning-border)",  text: "var(--warning)",  label: "قيد الانتظار" },
  confirmed: { bg: "var(--bg-secondary)", border: "var(--border)",          text: "var(--text-secondary)", label: "تم التأكيد" },
  shipped:   { bg: "var(--accent-light)", border: "var(--accent-border)",   text: "var(--accent)",   label: "تم الشحن"     },
  delivered: { bg: "var(--success-bg)",   border: "var(--success-border)",  text: "var(--success)",  label: "تم التوصيل"  },
  cancelled: { bg: "var(--error-bg)",     border: "var(--error-border)",    text: "var(--error)",    label: "تم الإلغاء"   },
};

/* Refund status badge colours — all 5 states [v1.0.5] */
const refundMeta = {
  requested:        { bg: "var(--warning-bg)",  border: "var(--warning-border)",  text: "var(--warning)",  label: "طلب استرداد قيد المراجعة"   },
  approved:         { bg: "var(--accent-light)", border: "var(--accent-border)",   text: "var(--accent)",   label: "تمت الموافقة - أعد المنتج"    },
  product_received: { bg: "#ede9fe",            border: "#c4b5fd",               text: "#6d28d9",         label: "تم استلام المنتج - سيتم رد المبلغ" },
  money_refunded:   { bg: "var(--success-bg)",  border: "var(--success-border)",  text: "var(--success)",  label: "تم رد المبلغ ✓"          },
  rejected:         { bg: "var(--error-bg)",    border: "var(--error-border)",    text: "var(--error)",    label: "تم رفض طلب الاسترداد"       },
};

function Timeline({ current, status }) {
  if (status === "cancelled") return (
    <div className="rounded-[var(--radius-lg)] p-7 text-center flex flex-col items-center gap-3"
      style={{ background: "var(--error-bg)", border: "1px solid var(--error-border)" }}>
      <div className="w-12 h-12 rounded-full flex items-center justify-center border"
        style={{ background: "var(--surface)", borderColor: "var(--error-border)" }}>
        <FaTimes size={18} style={{ color: "var(--error)" }} />
      </div>
      <div>
        <h3 className="text-[17px] font-semibold" style={{ color: "var(--error)" }}>تم إلغاء الطلب</h3>
        <p className="text-[13px] mt-1" style={{ color: "var(--text-muted)" }}>تم إلغاء هذا الطلب ولن يتم شحنه</p>
      </div>
    </div>
  );
  const currentIdx = steps.findIndex(s => s.key === current);
  return (
    <div className="rounded-[var(--radius-lg)] border p-6 md:p-7"
      style={{ background: "var(--surface)", borderColor: "var(--border)", boxShadow: "var(--shadow-card)" }}>
      <div className="flex flex-col md:flex-row gap-5 md:gap-0 justify-between">
        {steps.map((step, i) => {
          const isActive = currentIdx >= i; const isLast = i === steps.length - 1;
          const Icon = step.icon;
          return (
            <div key={step.key} className="flex md:flex-col items-center gap-3 flex-1 relative">
              {!isLast && (
                <div className="hidden md:block absolute top-4 right-1/2 w-full h-[2px] -z-0 transition-colors duration-300"
                  style={{ background: isActive ? "var(--accent)" : "var(--border)" }} />
              )}
              <div className="relative z-10 w-9 h-9 rounded-full flex items-center justify-center border-2 transition-all duration-300 shrink-0"
                style={isActive
                  ? { borderColor: "var(--accent)", background: "var(--accent)", color: "#fff" }
                  : { borderColor: "var(--border)", background: "var(--surface)", color: "var(--border-strong)" }
                }>
                <Icon size={12} />
              </div>
              <p className="text-[13px] font-semibold md:text-center transition-colors duration-300"
                style={{ color: isActive ? "var(--text)" : "var(--text-disabled)" }}>{step.label}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function OrderDetailsPage() {
  // ── LOGIC ─────────────────────────────────────────────────────
  const { id } = useParams();
  const router  = useRouter();
  const { orders, setOrders, user, simple, setupData } = useAuth();
  const [order,          setOrder]          = useState(null);
  const [loading,        setLoading]        = useState(false);
  const [cancelLoading]                     = useState(false);
  const [invoceLoading,  setInvoceLoading]  = useState(false);
  const [modalOpen,      setModalOpen]      = useState(false);
  const [actionLoading,  setActionLoading]  = useState(false);

  /* [v1.0.4] Refund state */
  const [refundModalOpen,  setRefundModalOpen]  = useState(false);
  const [refundReason,     setRefundReason]     = useState("");
  const [refundLoading,    setRefundLoading]    = useState(false);

  const currentStatus = statusToStep[order?.status] || "ordered";

  const fetchOrder = async () => {
    try {
      setLoading(true);
      const res = await getOrderById(id);
      setOrder(res.data);
    } catch (err) {
      toast.error(err.message);
      router.push("/myOrders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { if (id) fetchOrder(); }, [id, orders]);

  const handleConfirmCancel = async () => {
    try {
      setActionLoading(true);
      await cancelOrder(order._id);
      setOrder(prev => ({ ...prev, status: "cancelled" }));
      setOrders(prev => {
        const u = {};
        for (const key in prev) {
          u[key] = prev[key].map(o => o._id === id ? { ...o, status: "cancelled" } : o);
        }
        return u;
      });
      toast.success("تم إلغاء الطلب بنجاح");
      setModalOpen(false);
    } catch { toast.error("فشل إلغاء الطلب"); }
    finally { setActionLoading(false); }
  };

  const HandlegetInvoice = async () => {
    try {
      setInvoceLoading(true);
      const res = await getInvoice(id);
      if (res.success) toast.success(res.message);
    } catch (err) { toast.error(err.message); }
    finally { setInvoceLoading(false); }
  };

  /* [v1.0.4] Submit refund request */
  const handleSubmitRefund = async () => {
    if (!refundReason.trim()) return toast.error("يرجى كتابة سبب طلب الاسترداد");
    try {
      setRefundLoading(true);
      const res = await requestRefund(order._id, { reason: refundReason.trim() });
      if (res.success) {
        toast.success(res.message);
        setRefundModalOpen(false);
        setRefundReason("");
        // Refresh local order so refund badge appears
        fetchOrder();
      }
    } catch (err) { toast.error(err.message); }
    finally { setRefundLoading(false); }
  };

  useEffect(() => { if (!user) router.push('/'); }, [user]);
  // ── END LOGIC ─────────────────────────────────────────────────

  if (loading) return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center gap-3" style={{ background: "var(--bg)" }}>
      <Loader size={32} color="var(--accent)" />
    </div>
  );

  if (!order) return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center gap-4" style={{ background: "var(--bg)" }}>
      <div className="w-14 h-14 rounded-[var(--radius-lg)] flex items-center justify-center border"
        style={{ background: "var(--bg-secondary)", borderColor: "var(--border)" }}>
        <FaBoxOpen size={20} style={{ color: "var(--border-strong)" }} />
      </div>
      <p className="text-[14px] font-semibold" style={{ color: "var(--text-muted)" }}>الطلب غير موجود</p>
    </div>
  );

  const s = statusStyles[order.status] || statusStyles.pending;

  /* [v1.0.4] Determine if "Request Refund" button should show:
     - order is delivered
     - refund feature flag is ON  (setupData.config.refundEnabled — injected by shell endpoint)
     - refund.status is 'none'    (no existing request yet) */
  const refundEnabled    = setupData?.config?.refundEnabled === true;
  const refundStatus     = order.refund?.status || "none";
  const canRequestRefund = order.status === "delivered" && refundEnabled && refundStatus === "none";
  const existingRefund   = refundStatus !== "none" ? refundMeta[refundStatus] : null;

  return (
    <main dir="rtl" className="min-h-screen" style={{ background: "var(--bg)" }}>
      <div className="max-w-[860px] mx-auto px-5 md:px-8 py-10 flex flex-col gap-5">

        {/* Header */}
        <div className="pb-6" style={{ borderBottom: "1px solid var(--border)" }}>
          <p className="text-[11px] font-semibold tracking-[0.1em] uppercase mb-1.5" style={{ color: "var(--text-subtle)" }}>طلباتي</p>
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <h1 className="text-[clamp(22px,3.5vw,34px)] tracking-[-0.02em]"
                style={{ fontFamily: "var(--font-display)", color: "var(--text)", fontWeight: 400 }}>تفاصيل الطلب</h1>
              <div className="flex items-center gap-3 mt-2 flex-wrap">
                <span className="text-[14px] font-bold tabular-nums" style={{ color: "var(--text)" }}>#{order.orderNumber}</span>
                <span className="inline-flex items-center text-[11px] font-semibold px-2.5 py-1 rounded-[var(--radius-full)] border"
                  style={{ background: s.bg, borderColor: s.border, color: s.text }}>{s.label}</span>
                <span className="text-[12px]" style={{ color: "var(--text-muted)" }}>
                  {new Date(order.createdAt).toLocaleDateString("ar-EG", { year: "numeric", month: "long", day: "numeric" })}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* [v1.0.4] Refund status badge — shown if a refund exists */}
        {existingRefund && (
          <div className="flex items-start gap-3 rounded-[var(--radius-lg)] border p-4"
            style={{ background: existingRefund.bg, borderColor: existingRefund.border }}>
            <FaUndo size={13} style={{ color: existingRefund.text, marginTop: 2, flexShrink: 0 }} />
            <div>
              <p className="text-[13px] font-semibold" style={{ color: existingRefund.text }}>
                {existingRefund.label}
              </p>
              {order.refund?.reason && (
                <p className="text-[12px] mt-0.5" style={{ color: "var(--text-muted)" }}>
                  السبب: {order.refund.reason}
                </p>
              )}
              {order.refund?.adminNote && (
                <p className="text-[12px] mt-0.5" style={{ color: "var(--text-muted)" }}>
                  ملاحظة الإدارة: {order.refund.adminNote}
                </p>
              )}
            </div>
          </div>
        )}

        <Timeline current={currentStatus} status={order.status} />

        {/* Info */}
        <div className="grid md:grid-cols-2 gap-4">
          <div className="rounded-[var(--radius-lg)] border p-5 flex flex-col gap-3"
            style={{ background: "var(--surface)", borderColor: "var(--border)", boxShadow: "var(--shadow-card)" }}>
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-[var(--radius-md)] flex items-center justify-center shrink-0 border"
                style={{ background: "var(--accent-light)", borderColor: "var(--accent-border)" }}>
                <FaMapMarkerAlt size={12} style={{ color: "var(--accent)" }} />
              </div>
              <p className="text-[13px] font-semibold" style={{ color: "var(--text)" }}>عنوان الشحن</p>
            </div>
            {order.location ? (
              <div className="text-[13px] leading-[1.75] flex flex-col gap-1 pr-1" style={{ color: "var(--text-secondary)" }}>
                {order.location.locationDescription && <p>{order.location.locationDescription}</p>}
                {order.location.strName && <p>شارع {order.location.strName}</p>}
                {order.location.government && <p>{order.location.government} - {order.location.city}</p>}
                {order.location.country && <p className="font-medium" style={{ color: "var(--text)" }}>{order.location.country}</p>}
                {order.location.phone && <p className="font-mono text-[12px]" style={{ color: "var(--text-muted)" }}>{order.location.phone}</p>}
                {order.location.locationLink && (
                  <a href={order.location.locationLink} target="_blank"
                    className="text-[12px] font-semibold underline underline-offset-2 transition-colors mt-1 w-fit"
                    style={{ color: "var(--accent)" }}>عرض على الخريطة ↗</a>
                )}
              </div>
            ) : <p className="text-[13px]" style={{ color: "var(--text-muted)" }}>لا يوجد عنوان مسجل</p>}
          </div>

          <div className="rounded-[var(--radius-lg)] border p-5 flex flex-col gap-3"
            style={{ background: "var(--surface)", borderColor: "var(--border)", boxShadow: "var(--shadow-card)" }}>
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-[var(--radius-md)] flex items-center justify-center shrink-0 border"
                style={{ background: "var(--bg-secondary)", borderColor: "var(--border)" }}>
                <FaWallet size={12} style={{ color: "var(--text-muted)" }} />
              </div>
              <p className="text-[13px] font-semibold" style={{ color: "var(--text)" }}>طريقة الدفع</p>
            </div>
            <div className="text-[13px]" style={{ color: "var(--text-secondary)" }}>
              <p className="font-medium">{order.paymentMethod === "cash" ? "الدفع عند الاستلام" : order.paymentMethod}</p>
              <p className="text-[12px] mt-1" style={{ color: "var(--text-muted)" }}>يتم التحصيل عند التسليم</p>
            </div>
          </div>
        </div>

        {/* Products */}
        <div className="rounded-[var(--radius-lg)] border overflow-hidden"
          style={{ background: "var(--surface)", borderColor: "var(--border)", boxShadow: "var(--shadow-card)" }}>
          <div className="px-5 md:px-6 py-3.5" style={{ borderBottom: "1px solid var(--border)", background: "var(--bg-secondary)" }}>
            <p className="text-[11px] font-semibold tracking-[0.08em] uppercase" style={{ color: "var(--text-subtle)" }}>
              المنتجات · {order.items.length}
            </p>
          </div>
          <div>
            {order.items.map((item, idx) => (
              <div key={item._id} className="flex items-start gap-4 px-5 md:px-6 py-4 transition-colors duration-150"
                style={{ borderBottom: idx < order.items.length - 1 ? "1px solid var(--border)" : "none" }}>
                {item.image && (
                  <div className="w-12 h-12 rounded-[var(--radius-md)] overflow-hidden shrink-0 border"
                    style={{ background: "var(--bg-secondary)", borderColor: "var(--border)" }}>
                    <img src={item.image} alt={item.name} className="w-full h-full object-contain p-1" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-[14px] font-semibold line-clamp-1" style={{ color: "var(--text)" }}>{item.name}</p>
                  {item.selections?.length > 0 && (
                    <p className="text-[12px] mt-0.5" style={{ color: "var(--text-muted)" }}>
                      {item.selections.map(s => `${s.name}: ${s.value}`).join(" · ")}
                    </p>
                  )}
                  <p className="text-[12px] mt-0.5" style={{ color: "var(--text-muted)" }}>الكمية: {item.quantity}</p>
                </div>
                <p className="text-[14px] font-bold shrink-0 tabular-nums" style={{ color: "var(--accent)" }}>
                  {(item.price * item.quantity).toLocaleString()} {simple}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Summary + actions */}
        <div className="rounded-[var(--radius-lg)] border overflow-hidden"
          style={{ background: "var(--surface)", borderColor: "var(--border)", boxShadow: "var(--shadow-card)" }}>
          <div className="h-[3px]" style={{ background: "var(--accent)" }} />
          <div className="p-5 flex flex-col gap-4">
            {order.shippingFee > 0 && (
              <div className="flex items-center justify-between text-[13px]">
                <span style={{ color: "var(--text-muted)" }}>الشحن</span>
                <span className="font-medium tabular-nums" style={{ color: "var(--text-secondary)" }}>
                  {order.shippingFee.toLocaleString()} {simple}
                </span>
              </div>
            )}
            <div className="flex items-center justify-between pt-3" style={{ borderTop: "1px solid var(--border)" }}>
              <span className="text-[14px] font-semibold" style={{ color: "var(--text)" }}>الإجمالي</span>
              <span className="text-[22px] font-bold tracking-[-0.02em] tabular-nums"
                style={{ fontFamily: "var(--font-display)", color: "var(--accent)" }}>
                {order.totalPrice.toLocaleString()} {simple}
              </span>
            </div>

            {/* Action buttons */}
            <div className="flex flex-col sm:flex-row gap-2.5 pt-2 mt-1" style={{ borderTop: "1px solid var(--border)" }}>
              {order.status !== "cancelled" && (
                <button onClick={HandlegetInvoice} disabled={invoceLoading}
                  className="flex-1 py-2 flex items-center justify-center gap-2 text-[13px] font-semibold rounded-[var(--radius-md)] border-none transition-all duration-200 cursor-pointer hover:-translate-y-px disabled:opacity-50"
                  style={{ background: "var(--accent)", color: "#fff", boxShadow: "var(--shadow-accent)" }}>
                  {invoceLoading ? <Loader size={16} color="#fff" /> : <><FaPrint size={11} /> طلب الفاتورة</>}
                </button>
              )}

              {order.status === "pending" && (
                <button onClick={() => setModalOpen(true)} disabled={cancelLoading}
                  className="flex-1 py-2 flex items-center justify-center gap-2 text-[13px] font-semibold rounded-[var(--radius-md)] border transition-all duration-150 cursor-pointer"
                  style={{ background: "var(--surface)", color: "var(--error)", borderColor: "var(--error-border)" }}>
                  <FaTimes size={10} /> إلغاء الطلب
                </button>
              )}

              {/* [v1.0.4] Refund request button */}
              {canRequestRefund && (
                <button
                  onClick={() => setRefundModalOpen(true)}
                  className="flex-1 py-2 flex items-center justify-center gap-2 text-[13px] font-semibold rounded-[var(--radius-md)] border transition-all duration-150 cursor-pointer"
                  style={{ background: "var(--surface)", color: "var(--warning)", borderColor: "var(--warning-border)" }}>
                  <FaUndo size={10} /> طلب استرداد
                </button>
              )}
            </div>
          </div>
        </div>

        <p className="text-center text-[13px]" style={{ color: "var(--text-muted)" }}>
          هل لديك استفسار؟{" "}
          <Link href="/contact" className="font-semibold underline underline-offset-2 transition-colors"
            style={{ color: "var(--accent)" }}>تواصل معنا</Link>
        </p>
      </div>

      {/* Cancel modal */}
      <ConfirmModal open={modalOpen} loading={actionLoading}
        onCancel={() => { if (!actionLoading) setModalOpen(false); }}
        onConfirm={handleConfirmCancel}
        icon={<FaTimes size={24} style={{ color: "var(--error)" }} />}
        title="إلغاء الطلب"
        message="هل أنت متأكد من إلغاء هذا الطلب؟ لا يمكن التراجع بعد ذلك." />

      {/* [v1.0.4] Refund request modal */}
      {refundModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(26,23,20,0.45)", backdropFilter: "blur(4px)" }}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 8 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="w-full max-w-sm rounded-[var(--radius-xl)] p-6"
            style={{ background: "var(--surface)", border: "1px solid var(--border)", boxShadow: "0 24px 48px rgba(0,0,0,0.15)" }}
            dir="rtl"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-[var(--radius-md)] flex items-center justify-center shrink-0"
                style={{ background: "var(--warning-bg)", border: "1px solid var(--warning-border)" }}>
                <FaUndo size={14} style={{ color: "var(--warning)" }} />
              </div>
              <div>
                <h3 className="text-[15px] font-semibold" style={{ color: "var(--text)" }}>طلب استرداد</h3>
                <p className="text-[11px]" style={{ color: "var(--text-muted)" }}>الطلب #{order.orderNumber}</p>
              </div>
            </div>

            <p className="text-[13px] mb-3" style={{ color: "var(--text-muted)" }}>
              يرجى كتابة سبب طلب الاسترداد بالتفصيل لمساعدتنا في معالجة طلبك بسرعة.
            </p>

            <textarea
              className="w-full rounded-[var(--radius-md)] border px-3 py-2.5 text-[13px] outline-none resize-none transition-all duration-150"
              rows={4}
              placeholder="مثال: المنتج وصل تالفاً / المنتج لا يطابق الوصف..."
              value={refundReason}
              onChange={e => setRefundReason(e.target.value)}
              style={{
                borderColor: "var(--border)",
                background: "var(--bg)",
                color: "var(--text)",
              }}
              onFocus={e => e.target.style.borderColor = "var(--accent)"}
              onBlur={e => e.target.style.borderColor = "var(--border)"}
            />

            <div className="flex gap-2.5 mt-4">
              <button
                onClick={handleSubmitRefund}
                disabled={refundLoading || !refundReason.trim()}
                className="flex-1 h-10 flex items-center justify-center gap-2 text-[13px] font-semibold rounded-[var(--radius-md)] border-none transition-all duration-150 cursor-pointer disabled:opacity-50"
                style={{ background: "var(--accent)", color: "#fff" }}>
                {refundLoading ? <Loader size={16} color="#fff" /> : <><FaUndo size={10} /> إرسال الطلب</>}
              </button>
              <button
                onClick={() => { setRefundModalOpen(false); setRefundReason(""); }}
                disabled={refundLoading}
                className="flex-1 h-10 flex items-center justify-center text-[13px] font-medium rounded-[var(--radius-md)] cursor-pointer border transition-all duration-150 disabled:opacity-50"
                style={{ background: "var(--surface)", color: "var(--text-muted)", borderColor: "var(--border)" }}>
                إلغاء
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </main>
  );
}
