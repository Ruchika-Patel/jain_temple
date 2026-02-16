"use client";
import React, { useState, useEffect } from "react";
import { Send, Megaphone, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import StatusModal from "@/components/StatusModal";

export default function CreateNotification() {
  const router = useRouter();
  const [verifiedTemples, setVerifiedTemples] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    title: "",
    message: "",
    type: "all",
    templeName: "All",
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

  // English Comment: Fetch only verified temples to populate the broadcast target list
  useEffect(() => {
    const fetchVerifiedOnes = async () => {
      try {
        const res = await fetch("/api/admin/temples?status=verified");
        const data = await res.json();
        // Handling both possible response structures
        const list = data.data || data;
        if (Array.isArray(list)) {
          setVerifiedTemples(list);
        }
      } catch (err) {
        console.error("Error fetching verified temples", err);
      }
    };
    fetchVerifiedOnes();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    showModal("loading", "Sending...", "Broadcasting to selected targets");
    try {
      const res = await fetch("/api/admin/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        showModal("success", "Broadcast Sent", "Notification successfully delivered! 🚀");
        setFormData({ title: "", message: "", type: "all", templeName: "All" });
      } else {
        const data = await res.json();
        showModal("error", "Failed", data.error || "Error sending notification");
      }
    } catch (error) {
      showModal("error", "Error", "Connection to broadcast server failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 p-4 md:p-8">
      <button
        onClick={() => router.back()}
        className="mb-6 flex items-center gap-2 text-stone-500 hover:text-stone-900 font-bold text-xs uppercase tracking-widest transition-all"
      >
        <ArrowLeft size={16} /> Back
      </button>

      <div className="max-w-2xl mx-auto bg-white rounded-[2rem] md:rounded-[3rem] shadow-xl p-6 md:p-10 border border-stone-100">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 bg-amber-600 rounded-2xl flex items-center justify-center text-white shadow-lg">
            <Megaphone size={24} />
          </div>
          <h2 className="text-3xl font-black text-stone-900 tracking-tight">
            BROADCAST <span className="text-amber-600">CENTER</span>
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest ml-1">
              Title
            </label>
            <input
              required
              className="w-full p-5 bg-stone-50 border border-stone-100 rounded-2xl outline-none focus:border-amber-500 font-bold text-stone-900"
              placeholder="Notice Heading..."
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest ml-1">
              Message
            </label>
            <textarea
              required
              className="w-full p-5 bg-stone-50 border border-stone-100 rounded-2xl outline-none focus:border-amber-500 font-bold text-stone-900 min-h-[120px]"
              placeholder="Write details..."
              value={formData.message}
              onChange={(e) =>
                setFormData({ ...formData, message: e.target.value })
              }
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest ml-1">
                Target Role
              </label>
              <select
                className="w-full p-5 bg-stone-50 border border-stone-100 rounded-2xl font-bold text-stone-900 cursor-pointer"
                value={formData.type}
                onChange={(e) =>
                  setFormData({ ...formData, type: e.target.value })
                }
              >
                <option value="all">Everyone</option>
                <option value="user">Students Only</option>
                <option value="subadmin">Sub-Admins Only</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest ml-1">
                Target Temple
              </label>
              <select
                required
                className="w-full p-5 bg-stone-50 border border-stone-100 rounded-2xl font-bold text-stone-900 cursor-pointer"
                value={formData.templeName}
                onChange={(e) =>
                  setFormData({ ...formData, templeName: e.target.value })
                }
              >
                <option value="All">All Temples</option>
                {verifiedTemples.map((temple) => (
                  <option key={temple._id || temple.id} value={temple.name}>
                    {temple.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-5 bg-stone-900 text-white rounded-2xl font-black text-xs uppercase tracking-[0.3em] hover:bg-amber-600 transition-all flex items-center justify-center gap-3 shadow-xl"
          >
            {loading ? (
              "Sending..."
            ) : (
              <>
                Send Notification <Send size={18} />
              </>
            )}
          </button>
        </form>
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
