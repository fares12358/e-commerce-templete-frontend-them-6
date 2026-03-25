import Navbar from "@/Components/Navbar";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Footer from "@/Components/Footer";
import FloatingShopButton from "@/Components/FloatingShopButton";

export const metadata = { title: "E-Commerce", description: "E-Commerce Website" };

export default function RootLayout({ children }) {
  return (
    <html lang="ar" dir="rtl">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,300;1,9..40,400&family=DM+Serif+Display:ital@0;1&display=swap" rel="stylesheet" />
      </head>
      <body style={{ fontFamily: "var(--font-body)", background: "var(--bg)", color: "var(--text)" }}>
        <AuthProvider>
          <Navbar />
          <main className="min-h-screen">{children}</main>
          <FloatingShopButton />
          <Footer />
          <ToastContainer
            position="top-center"
            autoClose={3000}
            toastStyle={{
              fontFamily: "var(--font-body)",
              fontSize: 13,
              borderRadius: 8,
              background: "#FDFCFA",
              color: "#1A1714",
              border: "1px solid #E2DDD6",
              boxShadow: "0 8px 24px rgba(26,23,20,0.10)",
            }}
          />
        </AuthProvider>
      </body>
    </html>
  );
}
