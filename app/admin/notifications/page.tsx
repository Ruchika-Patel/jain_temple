"use client";
import React, { useState, useEffect } from "react";
import { Send, Megaphone, ArrowLeft, Sparkles, Trash2, Edit2, X, Info } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import StatusModal from "@/components/StatusModal";

export default function CreateNotification() {
  const router = useRouter();
  const [verifiedTemples, setVerifiedTemples] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    title: "",
    message: "",
    type: "all",
    templeName: "All",
  });
  const [loading, setLoading] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingNotification, setEditingNotification] = useState<any>(null);

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

  const fetchVerifiedOnes = async () => {
    try {
      const res = await fetch("/api/admin/temples?status=verified");
      const data = await res.json();
      const list = data.data || data;
      if (Array.isArray(list)) {
        setVerifiedTemples(list);
      }
    } catch (err) {
      console.error("Error fetching verified temples", err);
    }
  };

  const fetchNotifications = async () => {
    try {
      const res = await fetch("/api/admin/notifications");
      const data = await res.json();
      if (data.success) {
        setNotifications(data.data);
      }
    } catch (err) {
      console.error("Error fetching notifications", err);
    }
  };

  useEffect(() => {
    fetchVerifiedOnes();
    fetchNotifications();
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
        fetchNotifications();
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

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this notification?")) return;

    showModal("loading", "Deleting...", "Removing notification from history");
    try {
      const res = await fetch(`/api/admin/notifications?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        showModal("success", "Deleted", "Notification removed successfully");
        fetchNotifications();
      } else {
        showModal("error", "Failed", "Could not delete notification");
      }
    } catch (error) {
      showModal("error", "Error", "System error during deletion");
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    showModal("loading", "Updating...", "Saving changes to notification");
    try {
      const res = await fetch("/api/admin/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editingNotification._id,
          ...editingNotification
        }),
      });
      if (res.ok) {
        showModal("success", "Updated", "Notification updated successfully! ✅");
        setIsEditModalOpen(false);
        fetchNotifications();
      } else {
        showModal("error", "Failed", "Error updating notification");
      }
    } catch (error) {
      showModal("error", "Error", "Connection error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F7F5] font-sans pb-24">
      <nav className="bg-white border-b border-stone-300 sticky top-0 z-50 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 md:px-8 h-20 flex items-center justify-between">
          <Link
            href="/?view=admin"
            className="group flex items-center gap-3 text-stone-700 hover:text-amber-700 transition-all font-bold text-xs uppercase tracking-widest"
          >
            <div className="p-2.5 bg-stone-100 group-hover:bg-amber-100 rounded-2xl transition-colors border border-stone-200">
              <ArrowLeft size={18} className="text-stone-900" />
            </div>
            <span className="hidden md:inline">Back to Admin Console</span>
            <span className="md:hidden">Back</span>
          </Link>
          <div className="flex items-center gap-3">
            <span className="text-[10px] font-black text-stone-600 uppercase tracking-widest hidden md:inline">
              Admin Panel
            </span>
            <div className="w-8 h-8 bg-stone-900 rounded-xl flex items-center justify-center text-white shrink-0">
              <span className="font-black text-[10px]">
                <Sparkles size={14} />
              </span>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto pt-10 px-4 grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left column: Broadcast form */}
        <div className="lg:col-span-5">
          <div className="bg-white rounded-[2rem] md:rounded-[3rem] shadow-xl p-6 md:p-10 border border-stone-100 sticky top-28">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 bg-amber-600 rounded-2xl flex items-center justify-center text-white shadow-lg">
                <Megaphone size={24} />
              </div>
              <h2 className="text-2xl font-black text-stone-900 tracking-tight">
                NEW <span className="text-amber-600">BROADCAST</span>
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
        </div>

        {/* Right column: Notification History */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-stone-900 text-white p-8 rounded-[2.5rem] shadow-xl overflow-hidden relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-600/10 rounded-full -mr-16 -mt-16 blur-3xl"></div>
            <div className="relative z-10 flex items-center justify-between">
              <div>
                <p className="text-[10px] font-black opacity-50 uppercase tracking-widest mb-1">
                  History Log
                </p>
                <h3 className="text-2xl font-black italic uppercase leading-none">
                  SENT <span className="text-amber-500 not-italic">MESSAGES</span>
                </h3>
              </div>
              <div className="bg-white/10 p-3 rounded-2xl">
                <Info size={20} className="text-amber-500" />
              </div>
            </div>
          </div>

          {notifications.length > 0 ? (
            <div className="space-y-4">
              {notifications.map((notif) => (
                <div
                  key={notif._id}
                  className="bg-white p-6 rounded-[2rem] border border-stone-100 shadow-sm hover:border-amber-200 transition-all group"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex gap-4">
                      <div className="w-12 h-12 bg-stone-50 text-amber-600 rounded-2xl flex items-center justify-center shadow-inner">
                        <Megaphone size={20} />
                      </div>
                      <div>
                        <h4 className="text-lg font-black text-stone-900 leading-none mb-1">
                          {notif.title}
                        </h4>
                        <div className="flex items-center gap-2">
                          <span className="text-[9px] font-black text-stone-400 uppercase tracking-widest">
                            {new Date(notif.createdAt).toLocaleDateString()}
                          </span>
                          <span className="w-1 h-1 bg-stone-200 rounded-full"></span>
                          <span className="text-[9px] font-bold text-amber-600 uppercase">
                            To: {notif.templeName} ({notif.type})
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
                        className="p-2.5 text-stone-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(notif._id)}
                        className="p-2.5 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
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
            <div className="py-20 flex flex-col items-center justify-center bg-white rounded-[3rem] border-2 border-dashed border-stone-100 text-stone-300">
              <Megaphone size={40} className="mb-4 opacity-20" />
              <p className="font-black uppercase tracking-widest text-xs">No notifications sent yet</p>
            </div>
          )}
        </div>
      </div>

      {/* Edit Modal */}
      {isEditModalOpen && editingNotification && (
        <div className="fixed inset-0 z-[100] bg-stone-900/60 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-xl bg-white rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="p-8 md:p-10">
              <div className="flex justify-between items-center mb-8">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-amber-600 text-white rounded-2xl flex items-center justify-center shadow-lg">
                    <Edit2 size={24} />
                  </div>
                  <h2 className="text-2xl font-black text-stone-900 uppercase tracking-tight">
                    EDIT <span className="text-amber-600">NOTICE</span>
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
                  <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest ml-1">
                    Title
                  </label>
                  <input
                    required
                    className="w-full p-5 bg-stone-50 border border-stone-100 rounded-2xl outline-none focus:border-amber-500 font-bold text-stone-900"
                    value={editingNotification.title}
                    onChange={(e) => setEditingNotification({ ...editingNotification, title: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest ml-1">
                    Message
                  </label>
                  <textarea
                    required
                    className="w-full p-5 bg-stone-50 border border-stone-100 rounded-2xl outline-none focus:border-amber-500 font-bold text-stone-900 min-h-[150px]"
                    value={editingNotification.message}
                    onChange={(e) => setEditingNotification({ ...editingNotification, message: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest ml-1">
                      Role
                    </label>
                    <select
                      className="w-full p-5 bg-stone-50 border border-stone-100 rounded-2xl font-bold text-stone-900"
                      value={editingNotification.type}
                      onChange={(e) => setEditingNotification({ ...editingNotification, type: e.target.value })}
                    >
                      <option value="all">Everyone</option>
                      <option value="user">Students Only</option>
                      <option value="subadmin">Sub-Admins Only</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest ml-1">
                      Temple
                    </label>
                    <select
                      className="w-full p-5 bg-stone-50 border border-stone-100 rounded-2xl font-bold text-stone-900"
                      value={editingNotification.templeName}
                      onChange={(e) => setEditingNotification({ ...editingNotification, templeName: e.target.value })}
                    >
                      <option value="All">All Temples</option>
                      {verifiedTemples.map((t) => (
                        <option key={t._id} value={t.name}>{t.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-5 bg-stone-900 text-white rounded-2xl font-black text-xs uppercase tracking-[0.3em] hover:bg-amber-600 transition-all flex items-center justify-center gap-3 shadow-xl"
                >
                  {loading ? "Updating..." : "Save Changes"}
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
