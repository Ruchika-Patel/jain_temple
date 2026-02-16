"use client";
import React, { useState, useEffect } from "react";
import NotificationPanel from "@/components/NotificationPanel";
import { useRouter } from "next/navigation";
import {
  LayoutDashboard,
  MapPin,
  GraduationCap,
  Receipt,
  BookOpen,
  LogOut,
  Download,
  ShieldCheck,
  Menu,
  X,
} from "lucide-react";

export default function UserDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [syllabusData, setSyllabusData] = useState<any>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    const savedUser = localStorage.getItem("current_user");
    if (!savedUser) {
      router.push("/auth");
      return;
    }
    const userData = JSON.parse(savedUser);
    setUser(userData);

    const fetchSyllabus = async () => {
      try {
        const response = await fetch("/api/classes");
        const result = await response.json();
        if (result.success) {
          const match = result.data.find(
            (c: any) => c.grade === userData.studentClass
          );
          setSyllabusData(match);
        }
      } catch (error) {
        console.error("Error fetching syllabus:", error);
      }
    };

    fetchSyllabus();
  }, [router]);

  const handleDownload = () => {
    if (!syllabusData?.syllabus) return;
    const link = document.createElement("a");
    link.href = syllabusData.syllabus;
    link.download = syllabusData.fileName || `${user.studentClass}_Syllabus`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleLogout = () => {
    localStorage.removeItem("current_user");
    router.push("/auth");
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-stone-50 flex flex-col md:flex-row font-sans text-stone-900">
      {/* --- MOBILE NAVBAR --- */}
      <nav className="md:hidden bg-white border-b border-stone-200 p-4 sticky top-0 z-50 flex justify-between items-center shadow-sm">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-amber-600 rounded-lg flex items-center justify-center text-white">
            <LayoutDashboard size={18} />
          </div>
          <span className="font-black tracking-tighter uppercase text-sm">Portal</span>
        </div>
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 text-stone-600 hover:bg-stone-100 rounded-lg transition-colors"
        >
          <Menu size={20} />
        </button>
      </nav>

      {/* --- MOBILE MENU OVERLAY --- */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-[60] bg-stone-900/40 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="w-72 bg-white h-full p-6 flex flex-col animate-in slide-in-from-left duration-500">
            <div className="flex justify-between items-center mb-10">
              <span className="font-black tracking-tighter uppercase text-xl">Menu</span>
              <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 text-stone-400"><X size={24} /></button>
            </div>
            <nav className="flex-1 space-y-2">
              <div className="p-4 bg-stone-900 text-white rounded-2xl flex items-center gap-3">
                <LayoutDashboard size={18} />
                <span className="text-xs font-bold uppercase tracking-widest">Dashboard</span>
              </div>
            </nav>
            <button
              onClick={handleLogout}
              className="p-4 flex items-center gap-3 text-stone-400 hover:text-red-600 transition-colors font-bold text-xs uppercase tracking-widest border-t border-stone-100 pt-6"
            >
              <LogOut size={18} /> Logout
            </button>
          </div>
        </div>
      )}

      {/* --- SIDEBAR (DESKTOP) --- */}
      <aside className="w-full md:w-72 bg-white border-r border-stone-200 p-8 flex flex-col hidden md:flex">
        <div className="flex items-center gap-3 mb-12">
          <div className="w-10 h-10 bg-amber-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-amber-200">
            <LayoutDashboard size={20} />
          </div>
          <span className="text-xl font-black tracking-tighter uppercase">
            Portal
          </span>
        </div>

        <nav className="flex-1 space-y-2">
          <div className="p-4 bg-stone-900 text-white rounded-2xl flex items-center gap-3 shadow-xl">
            <LayoutDashboard size={18} />
            <span className="text-xs font-bold uppercase tracking-widest">
              Dashboard
            </span>
          </div>
        </nav>

        <button
          onClick={handleLogout}
          className="mt-auto p-4 flex items-center gap-3 text-stone-400 hover:text-red-600 transition-colors font-bold text-xs uppercase tracking-widest"
        >
          <LogOut size={18} /> Logout
        </button>
      </aside>

      {/* --- MAIN CONTENT --- */}
      <main className="flex-1 p-6 md:p-12 overflow-y-auto">
        {/* Header Section */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 mb-12">
          <div>
            <h1 className="text-3xl md:text-4xl font-black uppercase tracking-tighter leading-none">
              Welcome Back, <br />
              <span className="text-amber-600">{user.name}</span>
            </h1>
            <p className="text-stone-400 font-bold text-[10px] uppercase tracking-[0.2em] mt-3">
              ID: {user.paymentId?.slice(-8).toUpperCase() || "NEW_USER"}
            </p>
          </div>

          {/* Right Side Actions: Notification + Status */}
          <div className="flex items-center gap-4">
            {/* Notification Bell */}
            <NotificationPanel
              userRole="user"
              templeName={user?.templeName} // Student ka temple name
            />

            {/* Status Box */}
            <div className="bg-white p-4 rounded-[2rem] border border-stone-100 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 bg-green-50 text-green-600 rounded-full flex items-center justify-center">
                <ShieldCheck size={24} />
              </div>
              <div>
                <p className="text-[10px] font-black text-stone-400 uppercase tracking-widest">
                  Status
                </p>
                <p className="text-sm font-black uppercase">Verified & Paid</p>
              </div>
            </div>
          </div>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white p-8 rounded-[2.5rem] border border-stone-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center mb-6">
              <MapPin size={24} />
            </div>
            <p className="text-[10px] font-black text-stone-400 uppercase tracking-widest mb-1">
              Center
            </p>
            <h3 className="text-xl font-black uppercase italic leading-tight">
              {user.templeName}
            </h3>
          </div>

          <div className="bg-stone-900 p-8 rounded-[2.5rem] text-white shadow-2xl md:scale-110">
            <div className="w-12 h-12 bg-white/10 text-amber-500 rounded-2xl flex items-center justify-center mb-6">
              <GraduationCap size={24} />
            </div>
            <p className="text-[10px] font-black opacity-50 uppercase tracking-widest mb-1">
              Your Class
            </p>
            <h3 className="text-3xl font-black italic uppercase leading-tight">
              {user.studentClass}
            </h3>
          </div>

          <div className="bg-white p-8 rounded-[2.5rem] border border-stone-100 shadow-sm">
            <div className="w-12 h-12 bg-green-50 text-green-600 rounded-2xl flex items-center justify-center mb-6">
              <Receipt size={24} />
            </div>
            <p className="text-[10px] font-black text-stone-400 uppercase tracking-widest mb-1">
              Fees Paid
            </p>
            <h3 className="text-2xl font-black">₹500.00</h3>
          </div>
        </div>

        {/* Syllabus Section */}
        <div className="bg-white rounded-[3rem] border border-stone-100 shadow-sm overflow-hidden">
          <div className="p-8 border-b border-stone-50 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center">
                <BookOpen size={20} />
              </div>
              <h2 className="text-lg font-black uppercase tracking-tight">
                Your Syllabus
              </h2>
            </div>
          </div>

          <div className="p-8">
            {syllabusData?.syllabus ? (
              <div className="flex flex-col md:flex-row items-center justify-between p-8 bg-stone-50 rounded-[2rem] border border-dashed border-stone-200 gap-6">
                <div className="flex items-center gap-6">
                  <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-sm border border-stone-100">
                    <BookOpen className="text-stone-300" size={32} />
                  </div>
                  <div>
                    <h4 className="text-md font-black uppercase">
                      {syllabusData.grade} Official Syllabus
                    </h4>
                    <p className="text-xs font-medium text-stone-400">
                      {syllabusData.fileName || "Syllabus_Document.pdf"}
                    </p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => window.open(syllabusData.syllabus, "_blank")}
                    className="px-6 py-4 bg-white border border-stone-200 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-stone-100 transition-all"
                  >
                    View
                  </button>
                  <button
                    onClick={handleDownload}
                    className="px-8 py-4 bg-stone-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-2 hover:bg-black transition-all shadow-xl"
                  >
                    <Download size={16} /> Download
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center py-16 bg-stone-50 rounded-[2rem] border border-dashed border-stone-200">
                <BookOpen size={48} className="mx-auto text-stone-200 mb-4" />
                <p className="text-stone-400 font-bold italic text-sm">
                  No syllabus uploaded for {user.studentClass} yet.
                </p>
                <p className="text-[10px] text-stone-300 uppercase mt-2 font-black">
                  Please check back later
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
