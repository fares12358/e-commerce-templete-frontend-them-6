"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { getSetupData, getUserMe, logoutUser } from "@/lib/api";
import { toast } from "react-toastify";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuth, setIsAuth] = useState(false);
  const [loading, setLoading] = useState(true);
  const [setupData, setSetupData] = useState(null);
  const [setupLoading, setSetupLoading] = useState(true)
  const [data, setData] = useState({
    name: "",
    email: "",
    password: "",
    confirm: "",
    checkbox: false
  })
  const [cart, setCart] = useState([]);
  const [category, setCategory] = useState({})
  const [categoryCache, setCategoryCache] = useState({})
  const [addresses, setAddresses] = useState([]);
  const [orders, setOrders] = useState([]);
  const [simple, setSimple] = useState('');
  const [products, setProducts] = useState({});
  const [shopPag, setShopPag] = useState({
    page: 1,
    totalPages: 0,
    limit: 20
  });
  const [logoutLoading, setlogoutLoading] = useState(false)

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
    } catch (err) {
      setUser(null);
      setIsAuth(false);
    } finally {
      setLoading(false);
    }
  };

  const setup = async () => {
    try {
      setSetupLoading(true);
      const res = await getSetupData();
      if (res.success) {
        setSetupData(res.data);
        setSimple(res.data.config.simple);
      } else {
        setSetupData(null);
      }
    } catch (err) {
      toast.error(err.message)

      setSetupData(null);
    } finally {
      setSetupLoading(false);
    }
  };

  useEffect(() => {
    if (setupData) { return }
    setup()
  }, [setupData])

  useEffect(() => {
    checkAuth();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        isAuth,
        setIsAuth,
        loading,
        checkAuth,
        data, setData,
        user, setUser,
        setupData, setSetupData,
        setupLoading, setSetupLoading,
        products, setProducts,
        cart, setCart,
        category, setCategory,
        categoryCache, setCategoryCache,
        addresses, setAddresses,
        orders, setOrders,
        simple, setSimple,
        shopPag, setShopPag,
        logoutLoading, setlogoutLoading
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
