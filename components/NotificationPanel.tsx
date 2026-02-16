"use client";
import React, { useState, useEffect } from "react";
import { Bell, X, Info, Calendar, Megaphone, MapPin } from "lucide-react";

interface NotificationPanelProps {
  templeName?: string;
  userRole: "admin" | "subadmin" | "user";
}

export default function NotificationPanel({
  templeName,
  userRole,
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

      // 2. Fetching Subadmin Notifications (Only for users)
      if (userRole === "user" && templeName) {
        const subRes = await fetch(
          `/api/subadmin/notifications?temple=${encodeURIComponent(templeName)}`,
        );

        if (subRes.ok) {
          const subData = await subRes.json();
          if (subData.success && subData.data) {
            const templeNotices = subData.data.map((n: any) => ({
              ...n,
              senderType: "SUBADMIN",
            }));
            allNotices = [...allNotices, ...templeNotices];
          }
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
        <div className="absolute right-0 mt-4 w-80 md:w-96 bg-white rounded-[2rem] shadow-2xl border border-stone-100 overflow-hidden z-50">
          <div className="p-6 border-b border-stone-50 flex justify-between items-center bg-stone-50/50">
            <h3 className="font-black text-[10px] uppercase tracking-[0.2em] text-stone-500">
              Notice Board
            </h3>
            <button
              onClick={() => setIsOpen(false)}
              className="text-stone-400 hover:text-stone-900 transition-colors"
            >
              <X size={16} />
            </button>
          </div>

          <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
            {notifications.length > 0 ? (
              notifications.map((note: any) => (
                <div
                  key={note._id}
                  className="p-5 border-b border-stone-50 hover:bg-stone-50 transition-colors relative"
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
              <div className="p-16 text-center text-xs font-bold text-stone-300 uppercase italic">
                No alerts for now
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
