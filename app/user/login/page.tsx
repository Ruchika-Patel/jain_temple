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
  const modeFromUrl = searchParams.get("mode");

  // English Comment: Default to Register if temple exists in URL or mode is register
  const [isLogin, setIsLogin] = useState(!templeFromUrl && modeFromUrl !== "register");
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
    message: string,
  ) => {
    setModal({ isOpen: true, status, title, message });
    if (status !== "loading") {
      setTimeout(() => setModal((prev) => ({ ...prev, isOpen: false })), 3000);
    }
  };
  const [availableClasses, setAvailableClasses] = useState<any[]>([]);
  const [temples, setTemples] = useState<any[]>([]);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    studentClass: "",
    templeName: templeFromUrl || "",
    paymentId: "",
    paid: false,
    amount: 500,
    phone: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
  });

  useEffect(() => {
    const fetchRegClass = async () => {
      try {
        const res = await fetch("/api/classes?forRegistration=true");
        const result = await res.json();
        if (result.success && result.data && result.data.length > 0) {
          setAvailableClasses(result.data);
          setFormData((prev) => ({
            ...prev,
            studentClass: result.data[0].grade,
          }));
        } else {
          setAvailableClasses([]);
        }
      } catch (error) {
        console.error("Error fetching registration class:", error);
      }
    };

    const fetchTemples = async () => {
      try {
        const res = await fetch("/api/temples");
        const result = await res.json();
        if (result.success) {
          const verified = result.data.filter((t: any) => t.status === "verified");
          setTemples(verified);
          const defaultTemple = templeFromUrl || (verified.length > 0 ? verified[0].name : "");
          setFormData((prev) => ({
            ...prev,
            templeName: defaultTemple,
          }));
        }
      } catch (error) {
        console.error("Error fetching temples:", error);
      }
    };

    if (!isLogin) {
      fetchRegClass();
      fetchTemples();
    }
  }, [isLogin, templeFromUrl]);

  const handlePayment = async () => {
    if (formData.phone.length !== 10) {
      showModal(
        "error",
        "Invalid Phone",
        "Please enter a valid 10-digit mobile number.",
      );
      return;
    }
    if (formData.pincode.length !== 6) {
      showModal(
        "error",
        "Invalid Pincode",
        "Please enter a valid 6-digit pincode.",
      );
      return;
    }
    setLoading(true);
    const options = {
      key: "rzp_test_SQb3TYmH5ZnDvR",
      amount: 500 * 100,
      currency: "INR",
      name: "Temple Education Portal",
      description: `Registration for ${formData.studentClass} at ${formData.templeName || "Temple"}`,
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
      if (formData.phone.length !== 10) {
        showModal(
          "error",
          "Invalid Phone",
          "Please enter a valid 10-digit mobile number.",
        );
        return;
      }
      if (formData.pincode.length !== 6) {
        showModal(
          "error",
          "Invalid Pincode",
          "Please enter a valid 6-digit pincode.",
        );
        return;
      }
      handleFinalRegister("FREE");
    }
  };

  const handleLogin = async () => {
    showModal("loading", "Authenticating...", "Verifying your credentials");
    try {
      const res = await fetch("/api/user/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
        }),
      });

      const result = await res.json();

      if (res.ok && result.success) {
        // English Comment: Store the complete user object from DB
        const userData = {
          name: result.name,
          email: result.email,
          role: "user",
          templeName: result.templeName,
          studentClass: result.studentClass,
          paymentId: result.paymentId,
          phone: result.phone || "",
          address: result.address || "",
          city: result.city || "",
          state: result.state || "",
          pincode: result.pincode || "",
          studentId: result.studentId || "",
          rollNumber: result.rollNumber || "",
          section: result.section || "A",
          _id: result._id,
        };
        localStorage.setItem("current_user", JSON.stringify(userData));

        showModal(
          "success",
          "Login Successful",
          "Welcome back! Redirecting in 2 seconds...",
        );
        setTimeout(() => {
          setLoading(false);
          router.push("/user/dashboard");
        }, 2000);
      } else {
        showModal(
          "error",
          "Login Failed",
          result.message || "Invalid credentials.",
        );
      }
    } catch (error) {
      console.error("Login Error:", error);
      showModal(
        "error",
        "System Error",
        "Failed to connect to authentication server.",
      );
    } finally {
      setLoading(false);
    }
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
        templeName: formData.templeName || "General",
        paymentId: razorpayId,
        amount: 0,
        paid: true,
        phone: formData.phone,
        address: formData.address,
        city: formData.city,
        state: formData.state,
        pincode: formData.pincode,
      };

      const res = await fetch("/api/user/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData),
      });

      const result = await res.json();

      if (res.ok && result.success) {
        const registeredUser = {
          ...userData,
          _id: result.data?._id,
          studentId: result.data?.studentId || "",
          rollNumber: result.data?.rollNumber || "",
          section: result.data?.section || "A",
        };
        localStorage.setItem("current_user", JSON.stringify(registeredUser));
        showModal(
          "success",
          "Success!",
          "Account registered! Accessing dashboard in 2s...",
        );
        localStorage.removeItem("payment_status");

        setTimeout(() => {
          router.push("/user/dashboard");
        }, 2000);
      } else {
        showModal(
          "error",
          "Registration Failed",
          result.message || "Something went wrong.",
        );
      }
    } catch (error) {
      console.error("DB Error:", error);
      showModal(
        "error",
        "Database Error",
        "Failed to connect to registration server.",
      );
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
                    value={formData.name}
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

              <div className="space-y-1">
                <label className="text-[10px] font-black text-stone-500 uppercase ml-2">
                  School Name (Temple Name)
                </label>
                <div className="relative">
                  <MapPin
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400"
                    size={18}
                  />
                  <select
                    required
                    className={inputStyle + " appearance-none"}
                    value={formData.templeName}
                    onChange={(e) =>
                      setFormData({ ...formData, templeName: e.target.value })
                    }
                  >
                    {temples.length > 0 ? (
                      <>
                        {templeFromUrl && !temples.some((t) => t.name === templeFromUrl) && (
                          <option value={templeFromUrl}>{templeFromUrl}</option>
                        )}
                        {temples.map((t, i) => (
                          <option key={i} value={t.name}>
                            {t.name}
                          </option>
                        ))}
                      </>
                    ) : (
                      templeFromUrl ? (
                        <option value={templeFromUrl}>{templeFromUrl}</option>
                      ) : (
                        <option disabled>No exam centers available</option>
                      )
                    )}
                  </select>
                </div>
              </div>
            </>
          )}

           <div className="space-y-1">
            <label className="text-[10px] font-black text-stone-500 uppercase ml-2">
              {isLogin ? "Student ID / Mobile Number" : "Email Address"}
            </label>
            <div className="relative">
              <Mail
                className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400"
                size={18}
              />
              <input
                type={isLogin ? "text" : "email"}
                required={isLogin}
                placeholder={isLogin ? "e.g. STU1001 or Mobile" : "email@example.com (optional)"}
                className={inputStyle}
                value={formData.email}
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
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
              />
            </div>
          </div>

          {!isLogin && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-stone-500 uppercase ml-2">
                    Phone Number (10 Digits)
                  </label>
                  <input
                    type="tel"
                    required
                    maxLength={10}
                    placeholder="10 digit phone"
                    className={inputStyle + " pl-6"}
                    onChange={(e) => {
                      const val = e.target.value
                        .replace(/\D/g, "")
                        .slice(0, 10);
                      setFormData({ ...formData, phone: val });
                    }}
                    value={formData.phone}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-stone-500 uppercase ml-2">
                    City
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="City"
                    className={inputStyle + " pl-6"}
                    value={formData.city}
                    onChange={(e) =>
                      setFormData({ ...formData, city: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-stone-500 uppercase ml-2">
                    State
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="State"
                    className={inputStyle + " pl-6"}
                    value={formData.state}
                    onChange={(e) =>
                      setFormData({ ...formData, state: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-stone-500 uppercase ml-2">
                    Pincode (6 Digits)
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    placeholder="6 digit pincode"
                    className={inputStyle + " pl-6"}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, "").slice(0, 6);
                      setFormData({ ...formData, pincode: val });
                    }}
                    value={formData.pincode}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-stone-500 uppercase ml-2">
                  Full Address
                </label>
                <textarea
                  required
                  placeholder="Street, House No, Area..."
                  className={inputStyle + " pl-6 h-24 pt-4 resize-none"}
                  value={formData.address}
                  onChange={(e) =>
                    setFormData({ ...formData, address: e.target.value })
                  }
                />
              </div>
            </>
          )}

          <button
            disabled={loading || (!isLogin && availableClasses.length === 0)}
            className="w-full py-5 bg-stone-900 text-white font-black text-xs uppercase tracking-widest rounded-2xl shadow-xl hover:bg-black transition-all flex items-center justify-center gap-3 disabled:bg-stone-300"
          >
            {loading ? (
              <Loader2 className="animate-spin" size={18} />
            ) : isLogin ? (
              "Login Now"
            ) : (
              "Register Now"
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
    <Suspense
      fallback={
        <div className="min-h-screen bg-stone-50 flex items-center justify-center">
          <Loader2 className="animate-spin text-amber-600" size={48} />
        </div>
      }
    >
      <UserAuthContent />
    </Suspense>
  );
}
