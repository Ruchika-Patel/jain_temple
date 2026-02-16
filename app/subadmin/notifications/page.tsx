"use client";
import React, { useState, useEffect } from "react";
import { Send, Megaphone, ArrowLeft, GraduationCap } from "lucide-react";
import { useRouter } from "next/navigation";

export default function SubadminNotification() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [currentTemple, setCurrentTemple] = useState("");

  // 1. English Comment: Define the state properly to fix the 'Cannot find name' error
  const [formData, setFormData] = useState({
    title: "",
    message: "",
  });

  // English Comment: Retrieve subadmin's temple name from storage or URL
  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    let temple = searchParams.get("temple");

    if (!temple) {
      temple = localStorage.getItem("subadmin_temple_name");
    }

    if (temple) {
      setCurrentTemple(temple);
      // Sync to localStorage if it was only in the URL
      if (localStorage.getItem("subadmin_temple_name") !== temple) {
        localStorage.setItem("subadmin_temple_name", temple);
      }
    } else {
      router.push("/subadmin/auth");
    }
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // English Comment: Sending request to the subadmin specific API route
      const res = await fetch("/api/subadmin/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: formData.title,
          message: formData.message,
          templeName: currentTemple,
        }),
      });

      const result = await res.json();

      if (result.success) {
        alert(`Notice sent to students of ${currentTemple}!`);
        setFormData({ title: "", message: "" }); // Reset form
      } else {
        alert("Error: " + result.message);
      }
    } catch (error) {
      console.error("Fetch Error:", error);
      alert("Network error. Please check connection.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FFFBF7] p-4 md:p-12 font-sans">
      <button
        onClick={() => router.back()}
        className="mb-6 md:mb-8 flex items-center gap-2 text-stone-400 hover:text-stone-900 font-bold text-[10px] uppercase tracking-[0.2em] transition-all"
      >
        <ArrowLeft size={16} /> Back
      </button>

      <div className="max-w-xl mx-auto bg-white rounded-[2rem] md:rounded-[2.5rem] shadow-2xl p-6 md:p-12 border border-amber-100">
        <div className="flex flex-col items-center text-center mb-10">
          <div className="w-16 h-16 bg-rose-500 rounded-3xl flex items-center justify-center text-white shadow-xl shadow-rose-100 mb-4">
            <Megaphone size={32} />
          </div>
          <h2 className="text-3xl font-black text-stone-900 tracking-tighter italic">
            SEND <span className="text-rose-500 not-italic ml-1">NOTICE</span>
          </h2>
          <div className="mt-3 px-4 py-1 bg-stone-100 rounded-full flex items-center gap-2">
            <GraduationCap size={14} className="text-stone-500" />
            <span className="text-[10px] font-black text-stone-500 uppercase tracking-widest leading-none">
              Portal: {currentTemple}
            </span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title Input */}
          <div className="space-y-2">
            <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest ml-1 italic">
              Notice Heading
            </label>
            <input
              required
              className="w-full p-5 bg-stone-50 border border-stone-100 rounded-2xl outline-none focus:border-rose-500 font-bold text-stone-800 placeholder:text-stone-300"
              placeholder="e.g. Tomorrow's Class Timing"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
            />
          </div>

          {/* Message Textarea */}
          <div className="space-y-2">
            <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest ml-1 italic">
              Message Content
            </label>
            <textarea
              required
              className="w-full p-5 bg-stone-50 border border-stone-100 rounded-2xl outline-none focus:border-rose-500 font-bold text-stone-800 min-h-[160px] placeholder:text-stone-300"
              placeholder="Write information for students..."
              value={formData.message}
              onChange={(e) =>
                setFormData({ ...formData, message: e.target.value })
              }
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-5 bg-stone-900 text-white rounded-2xl font-black text-xs uppercase tracking-[0.4em] hover:bg-rose-600 transition-all flex items-center justify-center gap-3 shadow-xl disabled:opacity-50"
          >
            {loading ? (
              "Sending..."
            ) : (
              <>
                Broadcast Now <Send size={18} />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
