"use client";
import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation"; // Added useSearchParams
import Script from "next/script";
import {
  Mail,
  Lock,
  LogIn,
  UserPlus,
  Loader2,
  User,
  GraduationCap,
  MapPin, // Added for temple icon
} from "lucide-react";
import StatusModal from "@/components/StatusModal";

function UserAuthContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const templeFromUrl = searchParams.get("temple"); // URL se temple name le raha hai

  // English Comment: If temple name exists in URL, default to Register (isLogin = false)
  const [isLogin, setIsLogin] = useState(!templeFromUrl);
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
  const [availableClasses, setAvailableClasses] = useState<any[]>([]);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    studentClass: "",
    templeName: templeFromUrl || "", // URL se seedha yahan set karein
    paymentId: "",
    paid: false,
    amount: 500,
  });

  useEffect(() => {
    const savedClasses = localStorage.getItem("all_classes");
    if (savedClasses) {
      const parsedClasses = JSON.parse(savedClasses);
      setAvailableClasses(parsedClasses);
      if (parsedClasses.length > 0) {
        setFormData((prev) => ({
          ...prev,
          studentClass: parsedClasses[0].grade,
        }));
      }
    }
  }, [isLogin]);

  const handlePayment = async () => {
    setLoading(true);
    const options = {
      key: "rzp_test_JoGd2dFYk5NKV1",
      amount: 500 * 100,
      currency: "INR",
      name: "Temple Education Portal",
      description: `Registration for ${formData.studentClass} at ${templeFromUrl || "Temple"}`,
      handler: function (response: any) {
        localStorage.setItem("payment_status", "success");
        localStorage.setItem("last_payment_id", response.razorpay_payment_id);

        // English Comment: Passing the payment ID directly to the final registration function
        handleFinalRegister(response.razorpay_payment_id);
      },
      prefill: { name: formData.name, email: formData.email },
      theme: { color: "#d97706" },
      modal: { ondismiss: () => setLoading(false) },
    };
    try {
      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } catch (error) {
      showModal("error", "Payment Error", "Razorpay SDK failed to load.");
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isLogin) {
      handleLogin();
    } else {
      const hasPaid = localStorage.getItem("payment_status") === "success";
      if (hasPaid) {
        handleFinalRegister(localStorage.getItem("last_payment_id") || "");
      } else {
        handlePayment();
      }
    }
  };

  const handleLogin = async () => {
    showModal("loading", "Authenticating...", "Verifying your credentials");
    // English Comment: Simulating login delay
    setTimeout(() => {
      showModal("success", "Login Successful", "Welcome back! Redirecting in 2 seconds...");
      setTimeout(() => {
        setLoading(false);
        router.push("/user/dashboard");
      }, 2000);
    }, 1500);
  };

  // English Comment: Modified to accept paymentId and send data to MongoDB
  // English Comment: Modified to send complete user data to MongoDB
  const handleFinalRegister = async (razorpayId: string) => {
    showModal("loading", "Processing...", "Saving your registration details");
    try {
      const userData = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        studentClass: formData.studentClass,
        templeName: templeFromUrl || "General",
        paymentId: razorpayId,
        amount: 500,
        paid: true,
      };

      const res = await fetch("/api/user/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData),
      });

      const result = await res.json();

      if (res.ok && result.success) {
        localStorage.setItem("current_user", JSON.stringify(userData));
        showModal("success", "Success!", "Account registered! Accessing dashboard in 2s...");
        localStorage.removeItem("payment_status");

        setTimeout(() => {
          router.push("/user/dashboard");
        }, 2000);
      } else {
        showModal("error", "Registration Failed", result.message || "Something went wrong.");
      }
    } catch (error) {
      console.error("DB Error:", error);
      showModal("error", "Database Error", "Failed to connect to registration server.");
    } finally {
      setLoading(false);
    }
  };

  const inputStyle =
    "w-full pl-12 pr-4 py-4 bg-white border border-stone-200 rounded-2xl outline-none focus:ring-2 focus:ring-amber-600 text-stone-900 font-semibold text-sm transition-all shadow-sm";

  return (
    <div className="min-h-screen bg-stone-50 flex flex-col items-center justify-center p-4">
      <Script src="https://checkout.razorpay.com/v1/checkout.js" />

      <div className="bg-white w-full max-w-[450px] rounded-[3rem] shadow-2xl border border-stone-100 p-8 sm:p-12">
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-amber-600 text-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-amber-200">
            {isLogin ? <LogIn size={28} /> : <UserPlus size={28} />}
          </div>
          <h1 className="text-2xl font-black text-stone-900 uppercase tracking-tighter">
            {isLogin ? "Welcome Back" : "Create Account"}
          </h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {!isLogin && (
            <>
              {/* Temple Display Badge - Under Heading */}
              {templeFromUrl && (
                <div className="p-4 bg-stone-50 border border-stone-100 rounded-2xl flex items-center gap-3 mb-6 animate-in fade-in slide-in-from-top-4">
                  <div className="w-10 h-10 bg-amber-600 text-white rounded-xl flex items-center justify-center shadow-md">
                    <MapPin size={20} />
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <p className="text-[8px] font-black text-stone-400 uppercase tracking-widest">
                      Selected Center
                    </p>
                    <p className="text-sm font-black text-stone-900 uppercase truncate italic">
                      {templeFromUrl}
                    </p>
                  </div>
                </div>
              )}

              <div className="space-y-1">
                <label className="text-[10px] font-black text-stone-500 uppercase ml-2">
                  Full Name
                </label>
                <div className="relative">
                  <User
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400"
                    size={18}
                  />
                  <input
                    type="text"
                    required
                    placeholder="Enter your name"
                    className={inputStyle}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-stone-500 uppercase ml-2">
                  Select Class
                </label>
                <div className="relative">
                  <GraduationCap
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400"
                    size={18}
                  />
                  <select
                    required
                    className={inputStyle + " appearance-none"}
                    value={formData.studentClass}
                    onChange={(e) =>
                      setFormData({ ...formData, studentClass: e.target.value })
                    }
                  >
                    {availableClasses.length > 0 ? (
                      availableClasses.map((cls, i) => (
                        <option key={i} value={cls.grade}>
                          {cls.grade}
                        </option>
                      ))
                    ) : (
                      <option disabled>No classes added by admin</option>
                    )}
                  </select>
                </div>
              </div>
            </>
          )}

          <div className="space-y-1">
            <label className="text-[10px] font-black text-stone-500 uppercase ml-2">
              Email Address
            </label>
            <div className="relative">
              <Mail
                className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400"
                size={18}
              />
              <input
                type="email"
                required
                placeholder="email@example.com"
                className={inputStyle}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-black text-stone-500 uppercase ml-2">
              Password
            </label>
            <div className="relative">
              <Lock
                className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400"
                size={18}
              />
              <input
                type="password"
                required
                placeholder="••••••••"
                className={inputStyle}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
              />
            </div>
          </div>

          <button
            disabled={loading || (!isLogin && availableClasses.length === 0)}
            className="w-full py-5 bg-stone-900 text-white font-black text-xs uppercase tracking-widest rounded-2xl shadow-xl hover:bg-black transition-all flex items-center justify-center gap-3 disabled:bg-stone-300"
          >
            {loading ? (
              <Loader2 className="animate-spin" size={18} />
            ) : isLogin ? (
              "Login Now"
            ) : (
              "Pay ₹500 & Register"
            )}
          </button>
        </form>

        <div className="mt-8 text-center">
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-stone-400 text-[11px] font-bold uppercase tracking-widest"
          >
            {isLogin ? "Don't have an account? " : "Already registered? "}
            <span className="text-amber-600 border-b-2 border-amber-100 ml-1">
              {isLogin ? "Sign Up" : "Login"}
            </span>
          </button>
        </div>
      </div>
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

export default function UserAuth() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <Loader2 className="animate-spin text-amber-600" size={48} />
      </div>
    }>
      <UserAuthContent />
    </Suspense>
  );
}
