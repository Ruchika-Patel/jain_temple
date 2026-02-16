"use client";
import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Mail,
  Lock,
  ArrowLeft,
  LogIn,
  UserPlus,
  Loader2,
  User,
  ShieldCheck,
  MapPin,
  Sparkles,
} from "lucide-react";
import StatusModal from "@/components/StatusModal";

function SubAdminAuthContent() {
  const [isLogin, setIsLogin] = useState(true);
  const router = useRouter();
  const searchParams = useSearchParams();

  // Extract temple name from URL
  const templeFromURL = searchParams.get("temple") || "";

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    templeName: templeFromURL,
  });

  const [loading, setLoading] = useState(false);
  const [modal, setModal] = useState<{
    isOpen: boolean;
    status: "success" | "error" | "loading";
    title: string;
    message: string;
  }>({
    isOpen: false,
    status: "loading",
    title: "",
    message: "",
  });

  const showModal = (
    status: "success" | "error" | "loading",
    title: string,
    message: string
  ) => {
    setModal({ isOpen: true, status, title, message });
    if (status !== "loading") {
      setTimeout(() => setModal((prev) => ({ ...prev, isOpen: false })), 3000);
    }
  };

  useEffect(() => {
    if (templeFromURL) {
      setFormData((prev) => ({ ...prev, templeName: templeFromURL }));
    }
  }, [templeFromURL]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const endpoint = isLogin ? "/api/subadmin/login" : "/api/subadmin/register";
    showModal("loading", isLogin ? "Authenticating..." : "Creating Account...", "Please wait while we secure your session");
    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (data.success) {
        showModal("success", isLogin ? "Login Successful!" : "Account Created!", isLogin ? "Welcome back! Redirecting to dashboard..." : "Account verified. Please login now.");

        if (isLogin) {
          const canonicalTemple = data.templeName || formData.templeName;
          localStorage.setItem("subadmin_temple_name", canonicalTemple);

          // English Comment: Delay redirect by 2 seconds
          setTimeout(() => {
            router.push(
              `/subadmin/dashboard?temple=${encodeURIComponent(canonicalTemple)}`,
            );
          }, 2000);
        } else {
          setTimeout(() => {
            setIsLogin(true);
          }, 2000);
        }
      } else {
        showModal("error", "Access Denied", data.message || "Error occurred!");
      }
    } catch (err) {
      console.error("Auth Error:", err);
      showModal("error", "System Error", "Server is currently unavailable.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFCFB] flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Decorative background blur */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-orange-100 rounded-full blur-[120px] opacity-50"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-stone-200 rounded-full blur-[120px] opacity-50"></div>

      {/* Back Button */}
      <button
        onClick={() => router.back()}
        className="mb-8 flex items-center gap-2 text-stone-400 hover:text-orange-600 transition-colors font-bold text-xs uppercase tracking-[0.2em] group z-10"
      >
        <ArrowLeft
          size={16}
          className="group-hover:-translate-x-1 transition-transform"
        />
        Return to Directory
      </button>

      {/* Main Auth Card */}
      <div className="bg-white w-full max-w-[480px] rounded-[3rem] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] border border-stone-100 p-8 sm:p-12 z-10 relative">
        <div className="text-center mb-10">
          <div className="w-20 h-20 bg-stone-900 text-white rounded-[2rem] flex items-center justify-center mx-auto mb-6 shadow-2xl rotate-3 hover:rotate-0 transition-transform duration-500">
            {isLogin ? <ShieldCheck size={32} /> : <UserPlus size={32} />}
          </div>
          <h1 className="text-3xl font-black text-stone-900 uppercase tracking-tighter">
            Sub-Admin{" "}
            <span className="text-orange-600 italic font-medium">
              {isLogin ? "Portal" : "Join"}
            </span>
          </h1>
          <p className="text-stone-400 text-[10px] mt-3 font-bold tracking-[0.3em] uppercase">
            {isLogin
              ? "Authorized Personnel Only"
              : "Register New Admin Instance"}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* TEMPLE CONTEXT BADGE */}
          {formData.templeName && (
            <div className="mb-8 flex items-center justify-center gap-3 bg-orange-50 border border-orange-100 py-3 px-5 rounded-2xl animate-in fade-in zoom-in duration-500">
              <div className="bg-orange-600 p-1.5 rounded-lg">
                <MapPin size={12} className="text-white" />
              </div>
              <div className="flex flex-col">
                <span className="text-[9px] font-black text-orange-400 uppercase tracking-widest leading-none">
                  Management Unit
                </span>
                <span className="text-sm font-bold text-stone-800">
                  {formData.templeName}
                </span>
              </div>
            </div>
          )}

          {!isLogin && (
            <div className="space-y-2">
              <label className="text-[10px] font-black text-stone-500 uppercase ml-2 tracking-widest">
                Admin Full Name
              </label>
              <div className="relative">
                <User
                  className="absolute left-5 top-1/2 -translate-y-1/2 text-stone-300"
                  size={20}
                />
                <input
                  type="text"
                  required
                  placeholder="Enter Name"
                  className="w-full pl-14 pr-6 py-5 bg-stone-50 border-2 border-transparent rounded-[1.5rem] outline-none focus:border-orange-500/20 focus:bg-white transition-all text-stone-900 font-bold shadow-sm"
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                />
              </div>
            </div>
          )}

          <div className="space-y-2">
            <label className="text-[10px] font-black text-stone-500 uppercase ml-2 tracking-widest">
              Security Email
            </label>
            <div className="relative">
              <Mail
                className="absolute left-5 top-1/2 -translate-y-1/2 text-stone-300"
                size={20}
              />
              <input
                type="email"
                required
                placeholder="admin@temple.com"
                className="w-full pl-14 pr-6 py-5 bg-stone-50 border-2 border-transparent rounded-[1.5rem] outline-none focus:border-orange-500/20 focus:bg-white transition-all text-stone-900 font-bold shadow-sm"
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-stone-500 uppercase ml-2 tracking-widest">
              Access Password
            </label>
            <div className="relative">
              <Lock
                className="absolute left-5 top-1/2 -translate-y-1/2 text-stone-300"
                size={20}
              />
              <input
                type="password"
                required
                placeholder="••••••••"
                className="w-full pl-14 pr-6 py-5 bg-stone-50 border-2 border-transparent rounded-[1.5rem] outline-none focus:border-orange-500/20 focus:bg-white transition-all text-stone-900 font-bold shadow-sm"
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
              />
            </div>
          </div>

          <button
            disabled={loading}
            className="w-full py-5 bg-orange-600 text-white font-black rounded-[1.5rem] shadow-[0_20px_40px_-12px_rgba(234,88,12,0.3)] hover:bg-orange-700 hover:-translate-y-1 active:scale-95 transition-all duration-300 mt-8 flex items-center justify-center gap-3 disabled:bg-stone-300 uppercase text-xs tracking-[0.2em]"
          >
            {loading ? (
              <Loader2 className="animate-spin" size={20} />
            ) : (
              <>
                {isLogin ? "Authorize Login" : "Confirm Registration"}{" "}
                <LogIn size={18} />
              </>
            )}
          </button>
        </form>
      </div>

      <p className="mt-8 text-stone-300 text-[10px] font-black uppercase tracking-[0.4em] flex items-center gap-2">
        <Sparkles size={12} /> Secure Management System 2.0
      </p>

      <StatusModal
        isOpen={modal.isOpen}
        status={modal.status}
        title={modal.title}
        message={modal.message}
        onClose={() => setModal((prev) => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
}

export default function SubAdminAuth() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#FDFCFB] flex items-center justify-center">
        <Loader2 className="animate-spin text-orange-600" size={48} />
      </div>
    }>
      <SubAdminAuthContent />
    </Suspense>
  );
}
