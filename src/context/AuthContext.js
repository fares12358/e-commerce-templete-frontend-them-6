"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { getShellData, getHomepageProducts, getUserMe, getCart } from "@/lib/api";
import { toast } from "react-toastify";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuth, setIsAuth] = useState(false);
  const [loading, setLoading] = useState(true);

  // ── Setup data — Phase 1: shell (config · content · categories · ads) ──
  const [setupData, setSetupData] = useState(null);
  const [setupLoading, setSetupLoading] = useState(true);

  // ── Setup data — Phase 2: homepage products (featuredProducts · newProducts) ──
  const [homepageProducts, setHomepageProducts] = useState(null);
  const [productsLoading, setProductsLoading] = useState(true);

  const [data, setData] = useState({
    name: "",
    email: "",
    password: "",
    confirm: "",
    checkbox: false,
  });

  // ── Cart shared state ─────────────────────────────────────────────────────
  // cart        — the items array, consumed by Navbar badge, cart page, checkout
  // cartLoaded  — true once the server has been hit at least once this session.
  //               Used by cart/page.jsx to decide:
  //                 false → show full-screen spinner (first visit)
  //                 true  → render cached items immediately + silent refresh
  const [cart, setCart] = useState([]);
  const [cartLoaded, setCartLoaded] = useState(false);
  // ─────────────────────────────────────────────────────────────────────────

  const [category, setCategory] = useState({});
  const [categoryCache, setCategoryCache] = useState({});
  const [addresses, setAddresses] = useState([]);
  const [orders, setOrders] = useState([]);
  const [simple, setSimple] = useState("");
  const [products, setProducts] = useState({});
  const [shopPag, setShopPag] = useState({ page: 1, totalPages: 0, limit: 20 });
  const [logoutLoading, setlogoutLoading] = useState(false);

  /* ── Auth check ─────────────────────────────────────────────────────────── */
  const checkAuth = async () => {
    try {
      setLoading(true);
      const res = await getUserMe();
      if (res.success) {
        setUser(res.data);
        setIsAuth(true);
      } else {
        setUser(null);
        setIsAuth(false);
      }
    } catch {
      setUser(null);
      setIsAuth(false);
    } finally {
      setLoading(false);
    }
  };

  /* ── Phase 1: shell data ─────────────────────────────────────────────────
     config · content · categories · ads
     Fast: 4 parallel findOne queries, resolves in ~80–150ms.
     Sets setupLoading=false immediately so the page unblocks.
  ──────────────────────────────────────────────────────────────────────────── */
  const setupShell = async () => {
    try {
      setSetupLoading(true);
      const res = await getShellData();
      if (res.success) {
        setSetupData(res.data);
        setSimple(res.data.config?.simple || "");
      } else {
        setSetupData(null);
      }
    } catch (err) {
      toast.error(err.message);
      setSetupData(null);
    } finally {
      setSetupLoading(false);
    }
  };

  /* ── Phase 2: homepage products ──────────────────────────────────────────
     featuredProducts · newProducts
     Heavier: 2 parallel aggregations. Fires alongside setupShell.
     Page is already visible by the time this resolves.
  ──────────────────────────────────────────────────────────────────────────── */
  const setupProducts = async () => {
    try {
      setProductsLoading(true);
      const res = await getHomepageProducts();
      if (res.success) {
        setHomepageProducts(res.data);
      } else {
        setHomepageProducts(null);
      }
    } catch {
      setHomepageProducts(null);
    } finally {
      setProductsLoading(false);
    }
  };

  /* ── Shared cart fetch ───────────────────────────────────────────────────
     Single source of truth for fetching cart data from the server.

     Called by:
       • cart/page.jsx   — on page mount (first visit: shows spinner,
                           return visits: silent background refresh)
       • CartSidePanel   — immediately after addToCart, so the navbar
                           badge updates without requiring navigation
       • checkout/page   — (reads from cart state — no fetch needed there)

     Behaviour:
       • Does NOT set any loading flag — callers manage their own spinners.
       • On success: updates cart[] and marks cartLoaded=true.
       • On error: silently swallowed — individual callers toast if needed.

     v1.0.2: cartLoaded=true is set here, NOT in the cart page.
             This is the only place cart state is populated from the server.
  ──────────────────────────────────────────────────────────────────────────── */
  const fetchCart = async () => {
    try {
      const res = await getCart();
      if (res.success) {
        setCart(res.data.items || []);
        setCartLoaded(true);
      }
    } catch {
      // Silently swallowed — callers display errors if they need to
    }
  };

  /* ── Reset cart when user logs out ──────────────────────────────────────
     When isAuth flips to false, immediately wipe cart[] and reset
     cartLoaded so the next user who logs in triggers a fresh server
     fetch instead of seeing the previous user's data from memory.
  ──────────────────────────────────────────────────────────────────────────── */
  useEffect(() => {
    if (!isAuth) {
      setCart([]);
      setCartLoaded(false);
    }
  }, [isAuth]);

  /* ── Fire all three initializations on mount ────────────────────────────
     All three run in parallel on AuthProvider mount.
     checkAuth and setupShell resolve fast; setupProducts is slower but
     doesn't block anything — the page shows skeletons while it loads.
  ──────────────────────────────────────────────────────────────────────────── */
  useEffect(() => {
    checkAuth();
    setupShell();
    setupProducts();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <AuthContext.Provider
      value={{
        isAuth,
        setIsAuth,
        loading,
        checkAuth,
        data, setData,
        user, setUser,
        // Shell data (config · content · categories · ads)
        setupData, setSetupData,
        setupLoading, setSetupLoading,
        // Homepage products (featuredProducts · newProducts)
        homepageProducts, setHomepageProducts,
        productsLoading, setProductsLoading,
        // Cart — shared state + shared fetch function
        cart, setCart,
        cartLoaded, setCartLoaded,
        fetchCart,
        // Rest of app state
        products, setProducts,
        category, setCategory,
        categoryCache, setCategoryCache,
        addresses, setAddresses,
        orders, setOrders,
        simple, setSimple,
        shopPag, setShopPag,
        logoutLoading, setlogoutLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used inside AuthProvider");
  }
  return ctx;
};
