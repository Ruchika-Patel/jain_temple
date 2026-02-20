"use client";
import React, { useState, useEffect } from "react";
import { Send, Megaphone, ArrowLeft, GraduationCap, Trash2, Edit2, X, Info, Calendar } from "lucide-react";
import { useRouter } from "next/navigation";
import StatusModal from "@/components/StatusModal";

export default function SubadminNotification() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [currentTemple, setCurrentTemple] = useState("");
  const [notifications, setNotifications] = useState<any[]>([]);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingNotification, setEditingNotification] = useState<any>(null);

  const [formData, setFormData] = useState({
    title: "",
    message: "",
    targetClass: "all",
  });
  const [availableClasses, setAvailableClasses] = useState<any[]>([]);

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

  const fetchClasses = async (temple: string) => {
    try {
      const res = await fetch(`/api/classes?templeName=${encodeURIComponent(temple)}`);
      const data = await res.json();
      if (data.success) {
        setAvailableClasses(data.data);
      }
    } catch (err) {
      console.error("Error fetching classes:", err);
    }
  };

  const fetchNotifications = async (temple: string) => {
    try {
      const res = await fetch(`/api/subadmin/notifications?temple=${encodeURIComponent(temple)}`);
      const data = await res.json();
      if (data.success) {
        setNotifications(data.data);
      }
    } catch (err) {
      console.error("Error fetching notifications:", err);
    }
  };

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    let temple = searchParams.get("temple");

    if (!temple) {
      temple = localStorage.getItem("subadmin_temple_name");
    }

    if (temple) {
      setCurrentTemple(temple);
      if (localStorage.getItem("subadmin_temple_name") !== temple) {
        localStorage.setItem("subadmin_temple_name", temple);
      }
      fetchClasses(temple);
      fetchNotifications(temple);
    } else {
      router.push("/subadmin/auth");
    }
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    showModal("loading", "Broadcasting", "Sending notice to students...");

    try {
      const res = await fetch("/api/subadmin/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: formData.title,
          message: formData.message,
          templeName: currentTemple,
          targetClass: formData.targetClass,
        }),
      });

      const result = await res.json();

      if (result.success) {
        showModal("success", "Sent!", "Broadcast successfully delivered! 🚀");
        setFormData({ title: "", message: "", targetClass: "all" });
        fetchNotifications(currentTemple);
      } else {
        showModal("error", "Failed", result.message || "Error sending notice");
      }
    } catch (error) {
      showModal("error", "Network Error", "Please check your connection");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Remove this notification forever?")) return;

    showModal("loading", "Deleting", "Removing message from student feeds...");
    try {
      const res = await fetch(`/api/subadmin/notifications?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        showModal("success", "Deleted", "Notification removed successfully");
        fetchNotifications(currentTemple);
      } else {
        showModal("error", "Failed", "Could not delete notice");
      }
    } catch (error) {
      showModal("error", "Error", "System system malfunction during deletion");
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    showModal("loading", "Updating", "Saving changes to notice...");
    try {
      const res = await fetch("/api/subadmin/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editingNotification._id,
          ...editingNotification
        }),
      });
      if (res.ok) {
        showModal("success", "Updated", "Notice successfully modified! ✅");
        setIsEditModalOpen(false);
        fetchNotifications(currentTemple);
      } else {
        showModal("error", "Failed", "Error saving changes");
      }
    } catch (error) {
      showModal("error", "Error", "Connection to server failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FFFBF7] font-sans pb-24">
      {/* Navbar Style Header */}
      <nav className="bg-white border-b border-stone-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 md:px-12 h-20 flex items-center justify-between">
          <button
            onClick={() => router.back()}
            className="group flex items-center gap-3 text-stone-700 hover:text-stone-900 transition-all font-bold text-xs uppercase tracking-widest"
          >
            <div className="p-2.5 bg-stone-100 group-hover:bg-amber-100 rounded-2xl transition-colors">
              <ArrowLeft size={18} />
            </div>
            Back to Dashboard
          </button>
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-rose-500 rounded-xl flex items-center justify-center text-white shrink-0 shadow-lg shadow-rose-100">
              <Megaphone size={20} />
            </div>
            <p className="text-[10px] font-black text-stone-500 uppercase tracking-widest hidden sm:block">
              Subadmin Broadcast Portal
            </p>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto pt-10 px-4 md:px-12 grid grid-cols-1 lg:grid-cols-12 gap-10">

        {/* Left Column: Create Form */}
        <div className="lg:col-span-5">
          <div className="bg-white rounded-[2.5rem] shadow-2xl p-8 md:p-12 border border-stone-100 sticky top-28">
            <div className="flex items-center gap-4 mb-10">
              <div className="w-14 h-14 bg-rose-50 rounded-2xl flex items-center justify-center text-rose-600 shadow-inner">
                <Megaphone size={28} />
              </div>
              <div>
                <h2 className="text-2xl font-black text-stone-900 tracking-tighter uppercase italic">
                  SEND <span className="text-rose-500 not-italic">NOTICE</span>
                </h2>
                <span className="text-[10px] font-bold text-stone-400 uppercase tracking-[0.2em]">
                  {currentTemple}
                </span>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest ml-1 italic">
                  Target Audience
                </label>
                <select
                  className="w-full p-5 bg-stone-50 border border-stone-100 rounded-2xl outline-none focus:border-rose-500 font-bold text-stone-800 appearance-none cursor-pointer"
                  value={formData.targetClass}
                  onChange={(e) => setFormData({ ...formData, targetClass: e.target.value })}
                >
                  <option value="all">All Classes (Broadcast)</option>
                  {availableClasses.map((cls) => (
                    <option key={cls._id} value={cls.grade}>
                      🎓 {cls.grade} Students Only
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest ml-1 italic">
                  Notice Heading
                </label>
                <input
                  required
                  className="w-full p-5 bg-stone-50 border border-stone-100 rounded-2xl outline-none focus:border-rose-500 font-bold text-stone-800"
                  placeholder="e.g. Exam Schedule"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest ml-1 italic">
                  Message Content
                </label>
                <textarea
                  required
                  className="w-full p-5 bg-stone-50 border border-stone-100 rounded-2xl outline-none focus:border-rose-500 font-bold text-stone-800 min-h-[160px]"
                  placeholder="Details for students..."
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-5 bg-stone-900 text-white rounded-2xl font-black text-xs uppercase tracking-[0.4em] hover:bg-rose-600 transition-all flex items-center justify-center gap-3 shadow-xl hover:-translate-y-1 active:translate-y-0"
              >
                {loading ? "Sending..." : <>Broadcast Now <Send size={18} /></>}
              </button>
            </form>
          </div>
        </div>

        {/* Right Column: Manage List */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-rose-600 text-white p-8 rounded-[2.5rem] shadow-xl overflow-hidden relative">
            <div className="absolute bottom-0 right-0 w-40 h-40 bg-white/10 rounded-full -mr-16 -mb-16 blur-2xl"></div>
            <div className="relative z-10 flex items-center justify-between">
              <div>
                <p className="text-[10px] font-black opacity-60 uppercase tracking-widest mb-1">
                  Announcement Feed
                </p>
                <h3 className="text-2xl font-black italic uppercase leading-none">
                  MANAGE <span className="not-italic opacity-50 ml-1">NOTICES</span>
                </h3>
              </div>
              <div className="bg-white/20 p-3 rounded-2xl">
                <Calendar size={22} className="text-white" />
              </div>
            </div>
          </div>

          {notifications.length > 0 ? (
            <div className="space-y-4">
              {notifications.map((notif) => (
                <div
                  key={notif._id}
                  className="bg-white p-6 rounded-[2rem] border border-stone-100 shadow-sm hover:border-rose-200 transition-all group"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex gap-4">
                      <div className="w-12 h-12 bg-rose-50 text-rose-500 rounded-2xl flex items-center justify-center shadow-inner">
                        <Megaphone size={20} />
                      </div>
                      <div>
                        <h4 className="text-lg font-black text-stone-900 leading-none mb-1">
                          {notif.title}
                        </h4>
                        <div className="flex items-center gap-2">
                          <span className="text-[9px] font-black text-stone-400 uppercase tracking-widest">
                            {new Date(notif.createdAt || Date.now()).toLocaleDateString()}
                          </span>
                          <span className="w-1 h-1 bg-stone-200 rounded-full"></span>
                          <span className="text-[9px] font-bold text-rose-500 uppercase">
                            To: {notif.targetClass === 'all' ? 'All Classes' : `Class ${notif.targetClass}`}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setEditingNotification(notif);
                          setIsEditModalOpen(true);
                        }}
                        className="p-2.5 text-stone-400 hover:text-blue-500 hover:bg-blue-50 rounded-xl transition-all"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(notif._id)}
                        className="p-2.5 text-stone-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                  <p className="text-sm font-medium text-stone-600 leading-relaxed bg-stone-50/50 p-4 rounded-2xl border border-stone-50">
                    {notif.message}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-24 flex flex-col items-center justify-center bg-white rounded-[3rem] border-2 border-dashed border-stone-100 text-stone-300">
              <Megaphone size={48} className="mb-4 opacity-10" />
              <p className="font-black uppercase tracking-[0.2em] text-[10px]">Your broadcast history is empty</p>
            </div>
          )}
        </div>
      </div>

      {/* Edit Modal */}
      {isEditModalOpen && editingNotification && (
        <div className="fixed inset-0 z-[100] bg-stone-900/60 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-xl bg-white rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="p-8 md:p-12">
              <div className="flex justify-between items-center mb-10">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-blue-500 text-white rounded-2xl flex items-center justify-center shadow-lg">
                    <Edit2 size={28} />
                  </div>
                  <h2 className="text-2xl font-black text-stone-900 uppercase tracking-tight italic">
                    REVISE <span className="text-blue-500 not-italic ml-1">NOTICE</span>
                  </h2>
                </div>
                <button
                  onClick={() => setIsEditModalOpen(false)}
                  className="p-3 hover:bg-red-50 text-stone-400 hover:text-red-500 rounded-2xl transition-all"
                >
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handleUpdate} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest ml-1 italic">
                    Audience
                  </label>
                  <select
                    className="w-full p-5 bg-stone-50 border border-stone-100 rounded-2xl font-bold text-stone-800"
                    value={editingNotification.targetClass}
                    onChange={(e) => setEditingNotification({ ...editingNotification, targetClass: e.target.value })}
                  >
                    <option value="all">All Classes</option>
                    {availableClasses.map((cls) => (
                      <option key={cls._id} value={cls.grade}>{cls.grade}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest ml-1 italic">
                    Headline
                  </label>
                  <input
                    required
                    className="w-full p-5 bg-stone-50 border border-stone-100 rounded-2xl outline-none focus:border-blue-500 font-bold text-stone-900"
                    value={editingNotification.title}
                    onChange={(e) => setEditingNotification({ ...editingNotification, title: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest ml-1 italic">
                    Body Content
                  </label>
                  <textarea
                    required
                    className="w-full p-5 bg-stone-50 border border-stone-100 rounded-2xl outline-none focus:border-blue-500 font-bold text-stone-900 min-h-[160px]"
                    value={editingNotification.message}
                    onChange={(e) => setEditingNotification({ ...editingNotification, message: e.target.value })}
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-5 bg-stone-900 text-white rounded-2xl font-black text-xs uppercase tracking-[0.4em] hover:bg-blue-600 transition-all flex items-center justify-center gap-3 shadow-xl"
                >
                  {loading ? "Saving Changes..." : "Update Announcement"}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

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
