"use client";
import Loader from "@/Components/Loader";
import { useAuth } from "@/context/AuthContext";
import { createOrders, getLocation } from "@/lib/api";
import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { FaMapMarkerAlt, FaPlus, FaMoneyBillWave, FaCheckCircle, FaBox, FaShoppingBag } from "react-icons/fa";
import { toast } from "react-toastify";

const formatSendTime = (minutes) => {
  if (!minutes && minutes !== 0) return "";
  const days = Math.floor(minutes / 1440); const hours = Math.floor((minutes % 1440) / 60);
  let result = ""; if (days > 0) result += `${days} يوم `; if (hours > 0) result += `${hours} ساعة`;
  return result.trim();
};

export default function CheckoutPage() {
  // ── LOGIC UNTOUCHED ─────────────────────────────────────────
  const { addresses, setAddresses, user, cart, setupData, simple } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false); const [orderLoading, setOrderLoading] = useState(false);
  const defaultAddress = addresses?.find(addr => addr.default);
  const toNumber = (val) => { const n = parseFloat(val); return isNaN(n) ? 0 : n; };
  const itemsCount = cart?.reduce((acc, item) => acc + toNumber(item.quantity), 0) || 0;
  const subtotal = cart?.reduce((acc, item) => acc + toNumber(item.price) * toNumber(item.quantity), 0) || 0;
  const vat = toNumber(setupData?.config?.vat);
  const tax = +(subtotal * (vat / 100)).toFixed(2);
  const total = +(subtotal + tax).toFixed(2);
  const fetchLocations = async () => { try { setLoading(true); const res = await getLocation(); if (res.success) setAddresses(res.data ?? []); } catch (err) { toast.error(err.message); } finally { setLoading(false); } };
  const handleCreateOrders = async () => {
    try { setOrderLoading(true); const res = await createOrders({ locationId: defaultAddress?._id }); if (res.success) { toast.success(res.message); router.replace(`/orderStatus?oid=${res.data._id}&num=${res.data.orderNumber}`); } }
    catch (err) { toast.error(err.message); } finally { setOrderLoading(false); }
  };
  useEffect(() => { if (!user) { router.push('/'); } if (!cart || cart.length === 0) { router.push('/cart'); } if (addresses.length <= 0) { fetchLocations(); } }, [user, cart]);
  // ── END LOGIC ────────────────────────────────────────────────

  if (loading) return (
    <div className="flex items-center justify-center w-full h-screen" style={{ background: "var(--bg)" }}>
      <Loader size={32} color="var(--accent)" />
    </div>
  );
  const canCheckout = itemsCount > 0 && !!defaultAddress;

  return (
    <main dir="rtl" className="min-h-screen" style={{ background: "var(--bg-secondary)" }}>
      <div className="max-w-[1200px] mx-auto px-5 md:px-10 py-10">

        {/* Header */}
        <div className="mb-8 pb-6" style={{ borderBottom: "1px solid var(--border)" }}>
          <p className="text-[11px] font-medium tracking-[0.1em] uppercase mb-1.5" style={{ color: "var(--text-subtle)" }}>الخطوة الأخيرة</p>
          <h1 className="text-[clamp(24px,4vw,38px)] leading-[1.1] tracking-[-0.01em]"
            style={{ fontFamily: "var(--font-display)", color: "var(--text)", fontWeight: 400 }}>
            إتمام الطلب
          </h1>
        </div>

        <div className="flex flex-col lg:flex-row gap-6 items-start">
          <div className="flex-1 min-w-0 flex flex-col gap-4">

            {/* Address card */}
            <div className="overflow-hidden"
              style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius-xl)", boxShadow: "var(--shadow-card)" }}>
              <div className="px-5 py-4 flex items-center justify-between" style={{ borderBottom: "1px solid var(--border)" }}>
                <div className="flex items-center gap-2.5">
                  <span className="w-6 h-6 rounded-full text-[11px] font-bold flex items-center justify-center shrink-0"
                    style={{ background: "var(--accent)", color: "var(--text-inverse)" }}>١</span>
                  <h2 className="text-[14px] font-medium" style={{ color: "var(--text)" }}>عنوان التوصيل</h2>
                </div>
                {defaultAddress && (
                  <span className="inline-flex items-center gap-1.5 text-[11px] font-medium px-2.5 py-1 rounded-full"
                    style={{ color: "var(--success)", background: "var(--success-bg)", border: "1px solid var(--success-border)" }}>
                    <span className="w-1.5 h-1.5 rounded-full" style={{ background: "var(--success)" }} />افتراضي
                  </span>
                )}
              </div>
              <div className="p-5">
                {defaultAddress ? (
                  <div className="flex flex-col gap-3">
                    <div className="flex items-start gap-3 p-4 rounded-[10px]"
                      style={{ background: "var(--bg-secondary)", border: "1px solid var(--border)" }}>
                      <div className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 mt-0.5"
                        style={{ background: "var(--accent-light)", border: "1px solid var(--accent-border)" }}>
                        <FaMapMarkerAlt size={13} style={{ color: "var(--accent)" }} />
                      </div>
                      <div className="flex flex-col gap-1 flex-1 min-w-0">
                        <p className="text-[14px] font-medium" style={{ color: "var(--text)" }}>{defaultAddress.strName || "عنوان التوصيل"}</p>
                        <p className="text-[13px] leading-[1.6]" style={{ color: "var(--text-secondary)" }}>
                          {[defaultAddress.country, defaultAddress.locationDescription, defaultAddress.government && defaultAddress.city ? `${defaultAddress.government} - ${defaultAddress.city}` : null].filter(Boolean).join("، ")}
                        </p>
                        {defaultAddress.phone && <p className="text-[12px] font-mono mt-0.5" style={{ color: "var(--text-muted)" }}>{defaultAddress.phone}</p>}
                        {defaultAddress.locationLink && (
                          <a href={defaultAddress.locationLink} target="_blank"
                            className="text-[12px] font-semibold underline underline-offset-2 mt-1 w-fit"
                            style={{ color: "var(--accent)" }}>
                            عرض على الخريطة ↗
                          </a>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2 pt-1">
                      <Link href="/myAddress"
                        className="inline-flex items-center gap-1.5 text-[12px] font-medium px-3.5 py-2 rounded-[7px] transition-all duration-150"
                        style={{ color: "var(--text-secondary)", background: "var(--bg-secondary)", border: "1px solid var(--border)" }}>
                        تغيير العنوان
                      </Link>
                      <Link href="/addAddress"
                        className="inline-flex items-center gap-1.5 text-[12px] font-medium px-3.5 py-2 rounded-[7px] transition-all duration-150"
                        style={{ color: "var(--text-secondary)", background: "transparent", border: "1px solid var(--border)" }}>
                        <FaPlus size={9} /> إضافة عنوان
                      </Link>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-3 py-7 text-center">
                    <div className="w-12 h-12 rounded-full flex items-center justify-center"
                      style={{ background: "var(--bg-secondary)", border: "1px solid var(--border)" }}>
                      <FaMapMarkerAlt size={16} style={{ color: "var(--border-strong)" }} />
                    </div>
                    <div>
                      <p className="text-[14px] font-medium mb-1" style={{ color: "var(--text)" }}>لا يوجد عنوان افتراضي</p>
                      <p className="text-[13px]" style={{ color: "var(--text-muted)" }}>يرجى إضافة عنوان توصيل</p>
                    </div>
                    <Link href="/addAddress"
                      className="inline-flex items-center gap-1.5 text-[13px] font-semibold px-4 py-2.5 rounded-[8px]"
                      style={{ background: "var(--accent)", color: "var(--text-inverse)", boxShadow: "var(--shadow-accent)" }}>
                      <FaPlus size={10} /> إضافة عنوان
                    </Link>
                  </div>
                )}
              </div>
            </div>

            {/* Payment card */}
            <div className="overflow-hidden"
              style={{ background: "var(--surface)", border: `2px solid var(--accent-border)`, borderRadius: "var(--radius-xl)", boxShadow: "var(--shadow-card)" }}>
              <div className="px-5 py-4 flex items-center justify-between" style={{ borderBottom: "1px solid var(--border)" }}>
                <div className="flex items-center gap-2.5">
                  <span className="w-6 h-6 rounded-full text-[11px] font-bold flex items-center justify-center shrink-0"
                    style={{ background: "var(--accent)", color: "var(--text-inverse)" }}>٢</span>
                  <h2 className="text-[14px] font-medium" style={{ color: "var(--text)" }}>طريقة الدفع</h2>
                </div>
                <FaCheckCircle size={15} style={{ color: "var(--accent)" }} />
              </div>
              <div className="p-5">
                <div className="flex items-center gap-4 p-4 rounded-[10px]"
                  style={{ background: "var(--bg-secondary)", border: "1px solid var(--border)" }}>
                  <div className="w-11 h-11 rounded-full flex items-center justify-center shrink-0"
                    style={{ background: "var(--success-bg)", border: "1px solid var(--success-border)" }}>
                    <FaMoneyBillWave size={16} style={{ color: "var(--success)" }} />
                  </div>
                  <div>
                    <p className="text-[14px] font-medium" style={{ color: "var(--text)" }}>الدفع عند الاستلام</p>
                    <p className="text-[12px] mt-0.5" style={{ color: "var(--text-muted)" }}>ادفع نقداً عند وصول الطلب</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Order summary sidebar */}
          <div className="w-full lg:w-[320px] shrink-0 lg:sticky lg:top-[84px]">
            <div className="overflow-hidden"
              style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius-xl)", boxShadow: "var(--shadow-card)" }}>
              <div className="h-[2px]" style={{ background: "var(--accent)" }} />
              <div className="p-5 flex flex-col gap-4">
                <p className="text-[11px] font-medium tracking-[0.1em] uppercase" style={{ color: "var(--text-subtle)" }}>ملخص الطلب</p>

                {/* Mini cart items */}
                {cart?.length > 0 && (
                  <div className="flex flex-col gap-2 pb-3" style={{ borderBottom: "1px solid var(--border)" }}>
                    {cart.map(item => (
                      <div key={item.itemId} className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-[7px] overflow-hidden shrink-0"
                          style={{ background: "var(--bg-secondary)", border: "1px solid var(--border)" }}>
                          <img src={item.image} alt={item.name} className="w-full h-full object-contain p-0.5" />
                        </div>
                        <p className="text-[12px] flex-1 line-clamp-1" style={{ color: "var(--text-secondary)" }}>{item.name}</p>
                        <span className="text-[12px] font-medium shrink-0 tabular-nums" style={{ color: "var(--text)" }}>×{item.quantity}</span>
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex flex-col gap-2.5">
                  <SummaryRow label={`المجموع الفرعي (${itemsCount} قطعة)`} value={`${subtotal.toLocaleString()} ${simple}`} />
                  {vat > 0 && <SummaryRow label={`الضريبة (${vat}%)`} value={`${tax.toLocaleString()} ${simple}`} />}
                  {setupData?.config?.shipment > 0 && <SummaryRow label="رسوم التوصيل" value={`${setupData?.config?.shipment?.toLocaleString()} ${simple}`} />}
                  {setupData?.config?.sendTime && <SummaryRow label="وقت التوصيل" value={formatSendTime(setupData?.config?.sendTime)} />}
                </div>

                <div className="flex items-center justify-between pt-3" style={{ borderTop: "1px solid var(--border)" }}>
                  <span className="text-[14px] font-medium" style={{ color: "var(--text)" }}>الإجمالي</span>
                  <span className="text-[22px] font-semibold tracking-[-0.01em] tabular-nums"
                    style={{ fontFamily: "var(--font-display)", color: "var(--accent)" }}>
                    {total.toLocaleString()} {simple}
                  </span>
                </div>

                <motion.button onClick={handleCreateOrders} disabled={!canCheckout || orderLoading} whileTap={canCheckout ? { scale: 0.98 } : {}}
                  className="w-full h-12 flex items-center justify-center gap-2 text-[14px] font-semibold rounded-[8px] border-none transition-all duration-200"
                  style={canCheckout ? {
                    background: "var(--accent)", color: "var(--text-inverse)", cursor: "pointer", boxShadow: "var(--shadow-accent)",
                  } : {
                    background: "var(--bg-tertiary)", color: "var(--text-disabled)", cursor: "not-allowed",
                  }}>
                  {orderLoading ? <Loader size={18} color="var(--text-inverse)" /> : (
                    <><FaBox size={13} />{!itemsCount ? "الحقيبة فارغة" : !defaultAddress ? "أضف عنواناً أولاً" : "إتمام الطلب"}</>
                  )}
                </motion.button>

                <Link href="/cart" className="flex items-center justify-center gap-1.5 text-[12px] transition-colors duration-150"
                  style={{ color: "var(--text-muted)" }}>
                  <FaShoppingBag size={10} />العودة للحقيبة
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

function SummaryRow({ label, value }) {
  return (
    <div className="flex items-center justify-between text-[13px]">
      <span style={{ color: "var(--text-muted)" }}>{label}</span>
      <span className="font-medium tabular-nums" style={{ color: "var(--text)" }}>{value}</span>
    </div>
  );
}
