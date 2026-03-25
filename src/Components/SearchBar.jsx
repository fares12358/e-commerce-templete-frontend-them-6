"use client";
import { FaSearch, FaHistory, FaTimes } from "react-icons/fa";
import { useEffect, useRef, useState } from "react";
import { suggestProducts } from "@/lib/api";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import Loader from "./Loader";
import { motion, AnimatePresence } from "framer-motion";

export default function SearchBar() {
  // ── LOGIC UNTOUCHED ─────────────────────────────────────────
  const { simple } = useAuth();
  const router = useRouter();
  const [query, setQuery] = useState(""); const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false); const [history, setHistory] = useState([]);
  const [isFocused, setIsFocused] = useState(false);
  const controllerRef = useRef(null); const debounceRef = useRef(null); const wrapperRef = useRef(null);

  useEffect(() => {
    if (!query || query.length < 2) { setSuggestions([]); return; }
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      try {
        if (controllerRef.current) controllerRef.current.abort();
        controllerRef.current = new AbortController(); setLoading(true);
        const res = await suggestProducts(query, controllerRef.current.signal);
        setSuggestions(res?.data || []);
      } catch { } finally { setLoading(false); }
    }, 400);
    return () => clearTimeout(debounceRef.current);
  }, [query]);

  useEffect(() => {
    const handleClickOutside = (e) => { if (wrapperRef.current && !wrapperRef.current.contains(e.target)) { setSuggestions([]); setIsFocused(false); } };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  useEffect(() => { const saved = localStorage.getItem("search_history"); if (saved) setHistory(JSON.parse(saved)); }, []);

  const saveToHistory = (term) => {
    if (!term.trim()) return;
    let updated = [term, ...history.filter(h => h !== term)].slice(0, 6);
    setHistory(updated); localStorage.setItem("search_history", JSON.stringify(updated));
  };

  const submitSearch = () => {
    if (!query.trim()) return;
    saveToHistory(query); router.push(`/search?q=${encodeURIComponent(query)}`);
    setSuggestions([]); setIsFocused(false);
  };
  // ── END LOGIC ────────────────────────────────────────────────

  const showDropdown = isFocused && (loading || suggestions.length > 0 || (query.length >= 2 && !loading) || (query.length === 0 && history.length > 0));

  return (
    <div ref={wrapperRef} className="w-full max-w-2xl mx-auto mb-10 relative" dir="rtl">
      <div className="flex items-center rounded-[10px] overflow-hidden transition-all duration-200"
        style={{
          border: `1px solid ${isFocused ? "var(--accent-border)" : "var(--border)"}`,
          background: "var(--surface)",
          boxShadow: isFocused ? "0 0 0 3px rgba(200,131,26,0.12)" : "var(--shadow-xs)",
        }}>
        <div className="px-4 flex items-center shrink-0">
          {loading ? <Loader size={16} color="var(--accent)" /> : <FaSearch size={13} style={{ color: isFocused ? "var(--accent)" : "var(--text-subtle)" }} />}
        </div>
        <input value={query} onChange={e => setQuery(e.target.value)} onKeyDown={e => e.key === "Enter" && submitSearch()}
          onFocus={() => setIsFocused(true)} onBlur={() => setTimeout(() => setIsFocused(false), 150)}
          className="flex-1 h-11 bg-transparent outline-none text-[14px] placeholder:opacity-50"
          style={{ color: "var(--text)" }}
          placeholder="ابحث عن المنتجات والماركات..." />
        {query && (
          <button onClick={() => { setQuery(""); setSuggestions([]); }} className="px-3 flex items-center cursor-pointer"
            style={{ color: "var(--text-subtle)" }}>
            <FaTimes size={11} />
          </button>
        )}
        <button onClick={submitSearch}
          className="h-11 px-5 text-[13px] font-semibold transition-colors duration-150 cursor-pointer shrink-0 border-none"
          style={{ background: "var(--accent)", color: "var(--text-inverse)" }}>
          بحث
        </button>
      </div>

      <AnimatePresence>
        {showDropdown && (
          <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 3 }}
            transition={{ duration: 0.14, ease: [0.16, 1, 0.3, 1] }}
            className="absolute top-[calc(100%+6px)] right-0 left-0 z-[200] overflow-hidden"
            style={{
              background: "var(--bg)",
              border: "1px solid var(--border)",
              borderRadius: "var(--radius-lg)",
              boxShadow: "var(--shadow-md)",
            }}>
            {loading && <div className="flex items-center justify-center gap-2 py-5 text-[13px]" style={{ color: "var(--text-muted)" }}><Loader size={16} color="var(--accent)" />جاري البحث...</div>}
            {!loading && query.length >= 2 && suggestions.length === 0 && (
              <div className="py-6 text-center text-[13px]" style={{ color: "var(--text-muted)" }}>لا توجد نتائج لـ "<span style={{ color: "var(--text)", fontWeight: 500 }}>{query}</span>"</div>
            )}
            {!loading && suggestions.length > 0 && (
              <div>
                <p className="px-4 pt-3 pb-1 text-[10px] font-semibold tracking-[0.1em] uppercase" style={{ color: "var(--text-subtle)" }}>نتائج البحث</p>
                {suggestions.map(p => (
                  <div key={p._id} onClick={() => { router.push(`/product/${p._id}`); setIsFocused(false); }}
                    className="flex items-center gap-3 px-4 py-2.5 cursor-pointer transition-colors duration-100"
                    style={{ borderTop: "1px solid var(--border-light)" }}
                    onMouseEnter={e => { e.currentTarget.style.background = "var(--bg-secondary)"; }}
                    onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}>
                    <div className="w-10 h-10 rounded-[8px] overflow-hidden shrink-0"
                      style={{ background: "var(--bg-secondary)", border: "1px solid var(--border)" }}>
                      <img src={p.images?.[0]?.url} alt={p.name} className="w-full h-full object-contain" />
                    </div>
                    <div className="flex-1 text-right min-w-0">
                      <p className="text-[13px] font-medium line-clamp-1" style={{ color: "var(--text)" }}>{p.name}</p>
                      <p className="text-[12px] font-semibold mt-0.5" style={{ color: "var(--accent)" }}>{p.price} {simple}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
            {!loading && query.length === 0 && history.length > 0 && (
              <div>
                <div className="flex items-center justify-between px-4 pt-3 pb-1">
                  <p className="text-[10px] font-semibold tracking-[0.1em] uppercase" style={{ color: "var(--text-subtle)" }}>عمليات البحث الأخيرة</p>
                  <button onClick={() => { setHistory([]); localStorage.removeItem("search_history"); }} className="text-[11px] cursor-pointer" style={{ color: "var(--error)" }}>مسح الكل</button>
                </div>
                {history.map((item, i) => (
                  <div key={i} onClick={() => { setQuery(item); submitSearch(); }}
                    className="flex items-center gap-3 px-4 py-2.5 cursor-pointer transition-colors duration-100"
                    style={{ borderTop: "1px solid var(--border-light)" }}
                    onMouseEnter={e => { e.currentTarget.style.background = "var(--bg-secondary)"; }}
                    onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}>
                    <FaHistory size={10} style={{ color: "var(--border-strong)" }} className="shrink-0" />
                    <span className="text-[13px] flex-1 text-right" style={{ color: "var(--text-secondary)" }}>{item}</span>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
