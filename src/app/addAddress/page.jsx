// ═══════════════════════════════════════════════════════════════
// AddAddressPage.jsx — ZEAL Theme
// ═══════════════════════════════════════════════════════════════
"use client";
import { useEffect, useRef, useState } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { motion } from "framer-motion";
import { FaMapMarkerAlt, FaCrosshairs, FaPlus, FaTimes } from "react-icons/fa";
import { addLocation, getLocation } from "@/lib/api";
import { toast } from "react-toastify";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

// ── RTL FIX UNTOUCHED ──────────────────────────────────────────
if (typeof window !== "undefined") {
  if (maplibregl.getRTLTextPluginStatus() === "unavailable") {
    maplibregl.setRTLTextPlugin("https://unpkg.com/@mapbox/mapbox-gl-rtl-text@0.2.3/mapbox-gl-rtl-text.js", null, true);
  }
}
const initialForm = { country: "", city: "", region: "", street: "", description: "", phone: "", locationLink: "", lat: null, lng: null };

export default function AddAddressPage() {
  // ── LOGIC UNTOUCHED ─────────────────────────────────────────
  const { user, setAddresses } = useAuth();
  const mapRef = useRef(null), map = useRef(null), marker = useRef(null);
  const [submitting, setSubmitting] = useState(false), [loadingLocation, setLoadingLocation] = useState(false);
  const [form, setForm] = useState(initialForm), [phoneFocused, setPhoneFocused] = useState(false);
  const [showLocationNote, setShowLocationNote] = useState(true);
  const router = useRouter();

  const resetPage = () => {
    setForm(initialForm);
    const defaultLng = 39.1925, defaultLat = 21.4858;
    if (marker.current && map.current) { marker.current.setLngLat([defaultLng, defaultLat]); map.current.flyTo({ center: [defaultLng, defaultLat], zoom: 13 }); }
    setSubmitting(false); setLoadingLocation(false);
  };

  useEffect(() => {
    if (!mapRef.current || map.current) return;
    map.current = new maplibregl.Map({ container: mapRef.current, style: "https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json", center: [39.1925, 21.4858], zoom: 13 });
    marker.current = new maplibregl.Marker({ draggable: true }).setLngLat([39.1925, 21.4858]).addTo(map.current);
    const updateAddress = async (lng, lat) => {
      try {
        const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
        const data = await res.json();
        setForm(prev => ({ ...prev, country: data.address?.country || "", city: data.address?.city || data.address?.town || data.address?.village || "", region: data.address?.state || "", street: data.address?.road || "", lat, lng, locationLink: generateLocationLink(lat, lng) }));
      } catch (err) { toast.error(err.message); }
    };
    marker.current.on("dragend", () => { const { lng, lat } = marker.current.getLngLat(); updateAddress(lng, lat); });
    map.current.on("click", (e) => { marker.current.setLngLat(e.lngLat); updateAddress(e.lngLat.lng, e.lngLat.lat); });
    return () => { if (map.current) { map.current.remove(); map.current = null; } };
  }, [user]);

  const detectMyLocation = () => {
    toast.info("جاري تحديد موقعك..."); setLoadingLocation(true);
    if (!navigator.geolocation) { toast.error("المتصفح لا يدعم تحديد الموقع"); setLoadingLocation(false); return; }
    navigator.geolocation.getCurrentPosition(async (pos) => {
      const lng = pos.coords.longitude, lat = pos.coords.latitude;
      marker.current.setLngLat([lng, lat]); map.current.flyTo({ center: [lng, lat], zoom: 15 });
      setForm(prev => ({ ...prev, lat, lng, locationLink: generateLocationLink(lat, lng) }));
      try {
        const controller = new AbortController(); const timeoutId = setTimeout(() => controller.abort(), 5000);
        const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`, { signal: controller.signal });
        clearTimeout(timeoutId); const data = await res.json();
        setForm(prev => ({ ...prev, country: data.address?.country || "", city: data.address?.city || data.address?.town || data.address?.village || "", region: data.address?.state || "", street: data.address?.road || "" }));
      } catch (err) { toast.error("Reverse geocode failed:", err); }
      setLoadingLocation(false);
    }, (error) => {
      setLoadingLocation(false);
      if (error.code === 1) toast.error("تم رفض إذن تحديد الموقع"); else toast.error("تعذر تحديد الموقع");
    }, { enableHighAccuracy: false, timeout: 8000, maximumAge: 60000 });
  };

  const generateLocationLink = (lat, lng) => { if (!lat || !lng) return ""; return `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}#map=18/${lat}/${lng}`; };
  const handleChange = (key, value) => setForm(prev => ({ ...prev, [key]: value }));
  const normalizePhoneNumber = (phone) => {
    if (!phone) return ""; let cleaned = phone.replace(/\s+/g, "");
    if (cleaned.startsWith("00")) cleaned = "+" + cleaned.slice(2);
    if (!cleaned.startsWith("+")) cleaned = "+" + cleaned;
    cleaned = "+" + cleaned.slice(1).replace(/\D/g, ""); return cleaned;
  };
  const handleSubmit = async () => {
    if (!form.phone) { toast.error("رقم الهاتف مطلوب"); return; }
    if (!form.description) { toast.error("وصف الموقع مطلوب"); return; }
    const normalizedPhone = normalizePhoneNumber(form.phone);
    if (normalizedPhone.length < 10) { toast.error("رقم الهاتف غير صحيح"); return; }
    const payload = { locationDescription: form.description, country: form.country, city: form.city, government: form.region, locationLink: form.locationLink, strName: form.street, phone: normalizedPhone };
    try {
      setSubmitting(true); await addLocation(payload); toast.success("تم إضافة العنوان بنجاح ✅");
      const res = await getLocation(); if (res.success) setAddresses(res.data ?? []); resetPage();
    } catch (err) { toast.error(err.message || "حدث خطأ أثناء الحفظ"); } finally { setSubmitting(false); }
  };
  useEffect(() => { if (!user) router.push('/'); }, [user]);
  if (!user) return null;
  // ── END LOGIC ────────────────────────────────────────────────

  return (
    <main dir="rtl" className="min-h-screen" style={{ background: "var(--bg)" }}>
      <div className="max-w-[960px] mx-auto px-5 md:px-8 py-10">

        <div className="mb-7 pb-6" style={{ borderBottom: "1px solid var(--border)" }}>
          <p className="text-[11px] font-semibold tracking-[0.1em] uppercase mb-1.5" style={{ color: "var(--text-subtle)" }}>عناويني</p>
          <h1 className="text-[clamp(22px,3.5vw,38px)] tracking-[-0.02em]"
            style={{ fontFamily: "var(--font-display)", color: "var(--text)", fontWeight: 400 }}>إضافة عنوان جديد</h1>
          <p className="text-[13px] mt-1" style={{ color: "var(--text-muted)" }}>حدّد موقعك على الخريطة وأكمل البيانات</p>
        </div>

        <div className="flex flex-col gap-5">

          {/* Map Card */}
          <div className="rounded-[var(--radius-lg)] border overflow-hidden"
            style={{ background: "var(--surface)", borderColor: "var(--border)", boxShadow: "var(--shadow-card)" }}>
            <div className="px-5 py-3.5 flex flex-col sm:flex-row items-start sm:items-center gap-3"
              style={{ borderBottom: "1px solid var(--border)", background: "var(--bg-secondary)" }}>
              <button onClick={detectMyLocation} disabled={loadingLocation}
                className="inline-flex items-center gap-2 text-[13px] font-semibold px-4 py-2 rounded-[var(--radius-md)] border transition-all duration-150 cursor-pointer shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  background: "var(--surface)",
                  borderColor: "var(--border)",
                  color: "var(--text-secondary)",
                  boxShadow: "var(--shadow-xs)",
                }}>
                <FaCrosshairs size={12} className={loadingLocation ? "animate-spin" : ""} style={{ color: loadingLocation ? "var(--accent)" : undefined }} />
                {loadingLocation ? "جاري التحديد..." : "تحديد موقعي الحالي"}
              </button>

              {showLocationNote && (
                <div className="flex items-start gap-2 text-[12px] px-3.5 py-2 rounded-[var(--radius-md)] border flex-1"
                  style={{ background: "var(--warning-bg)", borderColor: "var(--warning-border)", color: "var(--warning)" }}>
                  <FaCrosshairs size={11} className="shrink-0 mt-0.5" />
                  <span className="flex-1 leading-[1.6]">لتحديد موقعك تلقائيًا، اضغط على <strong>"تحديد موقعي الحالي"</strong>.</span>
                  <button onClick={() => setShowLocationNote(false)} className="cursor-pointer shrink-0 opacity-60 hover:opacity-100"><FaTimes size={10} /></button>
                </div>
              )}
            </div>

            <div ref={mapRef} className="relative h-[360px]">
              {loadingLocation && (
                <div className="absolute inset-0 z-10 flex items-center justify-center backdrop-blur-[2px]"
                  style={{ background: "rgba(253,252,250,0.8)" }}>
                  <div className="flex flex-col items-center gap-3">
                    <FaCrosshairs className="animate-spin" size={22} style={{ color: "var(--accent)" }} />
                    <p className="text-[13px] font-semibold" style={{ color: "var(--text)" }}>جاري تحديد موقعك...</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Form Card */}
          <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, delay: 0.1 }}
            className="rounded-[var(--radius-lg)] border overflow-hidden"
            style={{ background: "var(--surface)", borderColor: "var(--border)", boxShadow: "var(--shadow-card)" }}>
            <div className="px-5 py-3.5" style={{ borderBottom: "1px solid var(--border)", background: "var(--bg-secondary)" }}>
              <p className="text-[11px] font-semibold tracking-[0.08em] uppercase" style={{ color: "var(--text-subtle)" }}>بيانات الموقع</p>
            </div>
            <div className="p-5 md:p-7">
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                {[{ label: "الدولة", key: "country" }, { label: "المدينة", key: "city" }, { label: "المنطقة", key: "region" }, { label: "اسم الشارع", key: "street" }, { label: "رابط الموقع", key: "locationLink", placeholder: "https://maps.google.com" }].map(({ label, key, placeholder }) => (
                  <AddrInput key={key} label={label} placeholder={placeholder} value={form[key]} onChange={e => handleChange(key, e.target.value)} />
                ))}

                {/* Phone */}
                <div>
                  <label className="block text-[12px] font-semibold tracking-[0.07em] uppercase mb-2" style={{ color: "var(--text-muted)" }}>
                    رقم الهاتف <span style={{ color: "var(--error)" }}>*</span>
                  </label>
                  <input dir="ltr" value={form.phone} onChange={e => handleChange("phone", e.target.value)}
                    onFocus={() => setPhoneFocused(true)} onBlur={() => setPhoneFocused(false)}
                    placeholder="+20123456789"
                    className="w-full h-10 rounded-[var(--radius-md)] px-3.5 text-[14px] text-left outline-none transition-all duration-200"
                    style={{
                      background: phoneFocused ? "var(--surface)" : "var(--bg-secondary)",
                      border: phoneFocused ? "1px solid var(--border-focus)" : "1px solid var(--border)",
                      boxShadow: phoneFocused ? "0 0 0 3px rgba(200,131,26,0.15)" : "none",
                      color: "var(--text)",
                    }} />
                  {phoneFocused && <p className="mt-1.5 text-[11px]" dir="ltr" style={{ color: "var(--text-muted)" }}>أدخل رقم الهاتف مع كود الدولة (+20123456789)</p>}
                </div>

                {/* Description */}
                <div className="md:col-span-2 lg:col-span-3">
                  <label className="block text-[12px] font-semibold tracking-[0.07em] uppercase mb-2" style={{ color: "var(--text-muted)" }}>
                    وصف الموقع <span style={{ color: "var(--error)" }}>*</span>
                  </label>
                  <textarea value={form.description} onChange={e => handleChange("description", e.target.value)}
                    placeholder="خلف المجمع التجاري، الطابق الثاني..."
                    className="w-full rounded-[var(--radius-md)] px-3.5 py-2.5 text-[14px] outline-none resize-none min-h-[90px] transition-all duration-200"
                    style={{ background: "var(--bg-secondary)", border: "1px solid var(--border)", color: "var(--text)" }}
                    onFocus={e => { e.target.style.borderColor = "var(--border-focus)"; e.target.style.background = "var(--surface)"; e.target.style.boxShadow = "0 0 0 3px rgba(200,131,26,0.15)"; }}
                    onBlur={e => { e.target.style.borderColor = "var(--border)"; e.target.style.background = "var(--bg-secondary)"; e.target.style.boxShadow = "none"; }} />
                </div>
              </div>

              <button onClick={handleSubmit} disabled={submitting}
                className="w-full h-11 flex items-center justify-center gap-2.5 text-[14px] font-semibold rounded-[var(--radius-md)] border-none transition-all duration-200 cursor-pointer hover:-translate-y-px disabled:opacity-50 disabled:cursor-not-allowed disabled:translate-y-0"
                style={{ background: "var(--accent)", color: "#fff", boxShadow: "var(--shadow-accent)" }}>
                {submitting ? <><FaCrosshairs size={12} className="animate-spin" /> جاري الحفظ...</> : <><FaPlus size={11} /> إضافة العنوان</>}
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    </main>
  );
}

function AddrInput({ label, placeholder, value, onChange }) {
  const [focused, setFocused] = useState(false);
  return (
    <div>
      <label className="block text-[12px] font-semibold tracking-[0.07em] uppercase mb-2" style={{ color: "var(--text-muted)" }}>{label}</label>
      <input value={value} onChange={onChange} placeholder={placeholder}
        onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
        className="w-full h-10 rounded-[var(--radius-md)] px-3.5 text-[14px] outline-none transition-all duration-200"
        style={{
          background: focused ? "var(--surface)" : "var(--bg-secondary)",
          border: focused ? "1px solid var(--border-focus)" : "1px solid var(--border)",
          boxShadow: focused ? "0 0 0 3px rgba(200,131,26,0.15)" : "none",
          color: "var(--text)",
        }} />
    </div>
  );
}
