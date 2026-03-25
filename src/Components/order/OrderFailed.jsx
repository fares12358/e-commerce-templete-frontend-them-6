"use client";

import { motion } from "framer-motion";
import { FaTimes, FaRedo, FaHeadset } from "react-icons/fa";

export default function OrderFailed({
  title = "فشل في إتمام الطلب",
  message = "حدث خطأ ما أثناء معالجة طلبك، يرجى المحاولة مرة أخرى أو التحقق من وسيلة الدفع الخاصة بك.",
  onRetry,
  onSupport,
}) {
  return (
    <main
      dir="rtl"
      className="min-h-screen flex items-center justify-center bg-[#f8f6f6] px-4 py-12"
    >
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-120 text-center space-y-8"
      >

        {/* Error circle */}
        <motion.div
          initial={{ scale: 0.5 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 120 }}
          className="mx-auto w-24 h-24 rounded-full bg-red-500/10 border-2 border-red-500/20 flex items-center justify-center"
        >
          <FaTimes className="text-red-500 text-4xl" />
        </motion.div>

        {/* Text */}
        <div className="space-y-4">
          <h1 className="text-3xl font-bold text-[#1b0d0d]">
            {title}
          </h1>

          <p className="text-gray-600 leading-relaxed max-w-sm mx-auto">
            {message}
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-col items-center gap-4 pt-4">

          <button
            onClick={onRetry}
            className="w-full py-3 px-8 rounded-lg font-bold text-white bg-linear-to-br cursor-pointer from-black to-black/70 hover:-translate-y-1 duration-300 ease-in-out transition flex items-center justify-center gap-2"
          >
            حاول مرة أخرى
            <FaRedo className="text-sm" />
          </button>

          <button
            onClick={onSupport}
            className="text-red-500 text-sm cursor-pointer font-medium transition flex items-center gap-2"
          >
            <FaHeadset />
            تواصل مع الدعم
          </button>

        </div>
      </motion.div>
    </main>
  );
}
