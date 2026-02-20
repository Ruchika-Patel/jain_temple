"use client";
import React, { useState, useEffect } from "react";
import { Bell, X, Info, Calendar, Megaphone, MapPin } from "lucide-react";

interface NotificationPanelProps {
  templeName?: string;
  userRole: "admin" | "subadmin" | "user";
  studentClass?: string;
}

export default function NotificationPanel({
  templeName,
  userRole,
  studentClass,
}: NotificationPanelProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchNotifications = async () => {
    try {
      let allNotices: any[] = [];

      // 1. Fetching Admin Notifications
      // Ensure the URL is correct and handles role-based mapping
      const adminRes = await fetch(
        `/api/notifications/fetch?type=${userRole}&temple=${encodeURIComponent(templeName || "All")}`,
      );

      // Check if response is JSON, not HTML
      if (adminRes.ok) {
        const adminData = await adminRes.json();
        if (adminData.success && adminData.notifications) {
          allNotices = adminData.notifications.map((n: any) => ({
            ...n,
            senderType: "ADMIN",
          }));
        }
      }

      // 2. Fetching Subadmin Notifications (Only for students/users)
      if (userRole === "user" && templeName) {
        let url = `/api/subadmin/notifications?temple=${encodeURIComponent(templeName)}`;
        if (studentClass) {
          url += `&studentClass=${encodeURIComponent(studentClass)}`;
        }

        const subRes = await fetch(url);

        if (subRes.ok) {
          const subData = await subRes.json();
          if (subData.success && subData.data) {
            const templeNotices = subData.data.map((n: any) => ({
              ...n,
              senderType: "SUBADMIN",
            }));
            allNotices = [...allNotices, ...templeNotices];
          }
        } else {
          console.warn("Subadmin notifications fetch failed:", subRes.status);
        }
      }

      // 3. Sorting by date
      allNotices.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );

      setNotifications(allNotices);
      setUnreadCount(allNotices.length);
    } catch (err) {
      console.error("Fetch error detail:", err);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, [templeName, userRole]);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-3 bg-stone-100 rounded-2xl hover:bg-amber-100 transition-colors group"
      >
        <Bell size={20} className="text-stone-600 group-hover:text-amber-600" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white animate-bounce">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <>
          {/* Backdrop for Desktop only (optional, but keep it clean) */}
          <div
            className="hidden md:block fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />

          <div className="fixed inset-0 md:absolute md:top-full md:right-0 md:mt-4 w-full h-full md:h-auto md:w-96 bg-white md:rounded-[2rem] shadow-2xl border-stone-100 overflow-hidden z-[100] md:z-50 flex flex-col animate-in fade-in slide-in-from-bottom-full md:slide-in-from-top-2 duration-500">
            <div className="p-6 md:p-8 border-b border-stone-50 flex justify-between items-center bg-stone-50/50 sticky top-0 z-10">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-amber-600 rounded-lg flex items-center justify-center text-white md:hidden">
                  <Bell size={18} />
                </div>
                <h3 className="font-black text-xs md:text-[10px] uppercase tracking-[0.2em] text-stone-500">
                  Notice Board
                </h3>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 bg-stone-100 md:bg-transparent text-stone-400 hover:text-stone-900 transition-colors rounded-full"
              >
                <X size={20} className="md:w-4 md:h-4" />
              </button>
            </div>

            <div className="flex-1 md:max-h-[450px] overflow-y-auto custom-scrollbar bg-white">
              {notifications.length > 0 ? (
                notifications.map((note: any) => (
                  <div
                    key={note._id}
                    className="p-6 md:p-5 border-b border-stone-50 hover:bg-stone-50 transition-colors relative"
                  >
                    <div className="flex gap-4">
                      <div
                        className={`p-2.5 rounded-xl h-fit ${note.senderType === "ADMIN" ? "bg-amber-100 text-amber-600" : "bg-blue-100 text-blue-600"}`}
                      >
                        {note.senderType === "ADMIN" ? (
                          <Megaphone size={16} />
                        ) : (
                          <MapPin size={16} />
                        )}
                      </div>
                      <div className="flex flex-col flex-1">
                        <span
                          className={`text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md border w-fit mb-1 ${note.senderType === "ADMIN" ? "bg-amber-50 text-amber-700 border-amber-100" : "bg-blue-50 text-blue-700 border-blue-100"}`}
                        >
                          {note.senderType === "ADMIN"
                            ? "Global Official"
                            : note.templeName || "Center Notice"}
                        </span>
                        <span className="text-sm font-black text-stone-800 leading-tight">
                          {note.title}
                        </span>
                        <p className="text-xs text-stone-500 mt-1.5 leading-relaxed font-medium">
                          {note.message}
                        </p>
                        <div className="mt-4 flex items-center gap-1 text-[9px] text-stone-400 font-bold">
                          <Calendar size={10} />
                          {new Date(note.createdAt).toLocaleDateString("en-GB", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center py-32 md:py-16 text-center text-xs font-bold text-stone-300 uppercase italic px-10">
                  <Bell size={40} className="mb-4 opacity-20" />
                  No alerts for now
                </div>
              )}
            </div>

            {/* Mobile Footer Area */}
            <div className="p-6 bg-stone-50/50 border-t border-stone-100 md:hidden">
              <button
                onClick={() => setIsOpen(false)}
                className="w-full py-4 bg-stone-900 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl"
              >
                Close Notifications
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
