"use client";
import React, { useState, useEffect } from "react";
import NotificationPanel from "@/components/NotificationPanel";
import {
  Users,
  BookOpen,
  LogOut,
  Plus,
  X,
  ShieldCheck,
  GraduationCap,
  ArrowRight,
  MapPin,
  Calendar,
  Clock,
  Trash2,
  Info,
  Megaphone,
} from "lucide-react";
import StatusModal from "@/components/StatusModal";

export default function SubAdminDashboard() {
  const [activeTab, setActiveTab] = useState("committee");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [assignedClasses, setAssignedClasses] = useState<any[]>([]);
  const [committee, setCommittee] = useState([
    { name: "", designation: "", phone: "", email: "" },
  ]);

  const [adminData, setAdminData] = useState<any>(null);
  const [students, setStudents] = useState<any[]>([]);
  const [studentsLoading, setStudentsLoading] = useState(false);

  const [selectedPortal, setSelectedPortal] = useState<any>(null);
  const [selectedStudent, setSelectedStudent] = useState<any>(null); // State for biodata modal
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
  const [currentTemple, setCurrentTemple] = useState("Temple");

  // English Comment: Calculate temple context only on client to avoid hydration mismatch
  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const temple =
      searchParams.get("temple") ||
      localStorage.getItem("subadmin_temple_name") ||
      "Temple";
    setCurrentTemple(temple);
  }, []);

  // Fetch class data from API
  useEffect(() => {
    const fetchData = async () => {
      try {
        const searchParams = new URLSearchParams(window.location.search);
        let currT = searchParams.get("temple");
        if (!currT) currT = localStorage.getItem("subadmin_temple_name");

        const url = currT ? `/api/classes?templeName=${encodeURIComponent(currT)}` : "/api/classes";
        const response = await fetch(url);
        const result = await response.json();
        if (result.success) {
          setAssignedClasses(result.data);
        }
      } catch (error) {
        console.error("Error fetching classes:", error);
      }
    };

    fetchData();
    // English Comment: Keeping a interval to check for updates every 30 seconds as a simple sync
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  //  Set adminData using the existing temple name logic
  useEffect(() => {
    if (currentTemple) {
      setAdminData({
        templeName: currentTemple,
        role: "subadmin",
      });
      // PROACTIVELY SYNC TO LOCAL STORAGE
      if (typeof window !== "undefined") {
        const storedTemple = localStorage.getItem("subadmin_temple_name");
        if (storedTemple !== currentTemple) {
          localStorage.setItem("subadmin_temple_name", currentTemple);
        }
      }
    }
  }, [currentTemple]);

  // English Comment: Fetch committee data from DB
  useEffect(() => {
    const fetchCommittee = async () => {
      if (currentTemple && currentTemple !== "Temple") {
        try {
          const response = await fetch(
            `/api/temples/committee?templeName=${currentTemple}`,
          );
          const result = await response.json();
          if (result.success && result.data && result.data.length > 0) {
            setCommittee(result.data);
          }
        } catch (error) {
          console.error("Error fetching committee:", error);
        }
      }
    };

    fetchCommittee();
  }, [currentTemple]);

  const refreshStudents = async () => {
    if (!selectedPortal || !currentTemple) return;
    setStudentsLoading(true);
    try {
      const res = await fetch(
        `/api/subadmin/students?templeName=${encodeURIComponent(currentTemple)}&studentClass=${encodeURIComponent(selectedPortal.grade)}`,
      );
      const data = await res.json();
      if (data.success) {
        setStudents(data.data);
      }
    } catch (err) {
      console.error("Error fetching students:", err);
    } finally {
      setStudentsLoading(false);
    }
  };

  // English Comment: Fetch students when a portal is opened
  useEffect(() => {
    if (selectedPortal && currentTemple) {
      refreshStudents();
    } else {
      setStudents([]);
    }
  }, [selectedPortal, currentTemple]);

  // English Comment: Tracking which member is being edited
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  const downloadStudentData = () => {
    if (!students || students.length === 0) return;

    const headers = ["Name", "Email", "Phone", "City", "State", "Pincode", "Address", "Payment ID", "Paid", "Date"];
    const csvRows = students.map(student => [
      `"${student.name}"`,
      `"${student.email}"`,
      `"${student.phone || ''}"`,
      `"${student.city || ''}"`,
      `"${student.state || ''}"`,
      `"${student.pincode || ''}"`,
      `"${(student.address || '').replace(/"/g, '""')}"`,
      `"${student.paymentId || ''}"`,
      `"${student.paid ? 'Yes' : 'No'}"`,
      `"${new Date(student.createdAt).toLocaleDateString()}"`
    ].join(","));

    const csvContent = [headers.join(","), ...csvRows].join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Students_${selectedPortal?.grade || 'List'}_${currentTemple}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const addMember = () => {
    const newMember = { name: "", designation: "", phone: "", email: "" };
    setCommittee([...committee, newMember]);
    setEditingIndex(committee.length); // Start editing the new member immediately
  };

  const updateMember = (index: number, field: string, value: string) => {
    let finalValue = value;
    if (field === "phone") {
      finalValue = value.replace(/\D/g, "").slice(0, 10);
    }
    const updated = [...committee];
    updated[index] = { ...updated[index], [field]: finalValue };
    setCommittee(updated);
  };

  const removeMember = (index: number) => {
    const confirmDelete = window.confirm(
      "⚠️ WARNING: Are you sure you want to delete this committee leader? This action cannot be undone until you click 'Confirm & Save' below.",
    );
    if (confirmDelete) {
      const updated = committee.filter((_, i) => i !== index);
      setCommittee(updated);
      if (editingIndex === index) setEditingIndex(null);
      else if (editingIndex !== null && editingIndex > index)
        setEditingIndex(editingIndex - 1);
    }
  };

  const saveCommitteeToDB = async () => {
    // English Comment: Attempting to get temple name from URL first, then localStorage as fallback
    const searchParams = new URLSearchParams(window.location.search);
    let currentTemple = searchParams.get("temple");

    // English Comment: Fallback - if not in URL, check if you stored it during login
    if (!currentTemple) {
      currentTemple = localStorage.getItem("subadmin_temple_name");
    }

    if (!currentTemple) {
      showModal(
        "error",
        "Context Missing",
        "Temple context not found. Please log in again.",
      );
      return;
    }

    // Validation for 10-digit phone numbers
    const invalidMember = committee.find(m => m.phone.length !== 10);
    if (invalidMember) {
      showModal("error", "Invalid Phone", `Phone number for ${invalidMember.name || 'member'} must be exactly 10 digits.`);
      return;
    }

    showModal("loading", "Updating...", "Saving committee details to database");
    try {
      const response = await fetch("/api/temples/committee", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          templeName: currentTemple,
          committee: committee,
        }),
      });

      const result = await response.json();

      if (result.success) {
        showModal("success", "Updated", "Committee records synchronized! ✅");
        setEditingIndex(null); // Exit edit mode after saving
      } else {
        showModal("error", "Failed", result.message || "Update failed");
      }
    } catch (error) {
      console.error("API Error:", error);
      showModal(
        "error",
        "Network Error",
        "Connection failed. Please check your internet.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("subadmin_temple_name");
    window.location.href = "/subadmin/auth";
  };

  return (
    <div className="min-h-screen bg-[#FFFBF7] flex flex-col lg:flex-row font-sans text-stone-900">
      {/* --- MOBILE NAVBAR --- */}
      <nav className="lg:hidden bg-white border-b border-amber-100 p-4 sticky top-0 z-50 flex justify-between items-center shadow-sm">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-amber-600 rounded-lg flex items-center justify-center text-white">
            <ShieldCheck size={18} />
          </div>
          <span className="font-black text-amber-600 tracking-tighter text-sm uppercase">
            SubAdmin
          </span>
        </div>
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 text-stone-600 hover:bg-amber-50 rounded-lg transition-colors"
        >
          <Megaphone
            size={20}
            className={isMobileMenuOpen ? "rotate-12" : ""}
          />
        </button>
      </nav>

      {/* --- MOBILE MENU OVERLAY --- */}
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-[60] bg-stone-900/40 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="w-72 bg-white h-full p-6 flex flex-col animate-in slide-in-from-left duration-500">
            <div className="flex justify-between items-center mb-8">
              <span className="font-black text-amber-600 tracking-tighter text-xl uppercase">
                Menu
              </span>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-2 text-stone-400"
              >
                <X size={24} />
              </button>
            </div>
            <nav className="space-y-2 flex-1">
              <button
                onClick={() => {
                  setActiveTab("committee");
                  setIsMobileMenuOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-5 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all ${activeTab === "committee" ? "bg-amber-600 text-white shadow-lg shadow-amber-100" : "text-stone-400"}`}
              >
                <Users size={18} /> Committee
              </button>
              <button
                onClick={() => {
                  setActiveTab("classes");
                  setIsMobileMenuOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-5 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all ${activeTab === "classes" ? "bg-amber-600 text-white shadow-lg shadow-amber-100" : "text-stone-400"}`}
              >
                <BookOpen size={18} /> Classes
              </button>
            </nav>
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 px-5 py-4 text-stone-400 font-black text-xs uppercase tracking-widest hover:text-red-600 transition-colors mt-auto border-t border-stone-100 pt-6"
            >
              <LogOut size={18} /> Logout
            </button>
          </div>
        </div>
      )}

      {/* --- SIDEBAR (DESKTOP) --- */}
      <aside className="w-64 bg-white border-r border-amber-100 flex flex-col p-6 hidden lg:flex shadow-xl">
        <div className="flex items-center gap-3 mb-10 px-2">
          <div className="w-10 h-10 bg-amber-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-amber-200">
            <ShieldCheck size={22} />
          </div>
          <span className="font-black text-amber-600 tracking-tighter text-xl uppercase">
            SubAdmin
          </span>
        </div>

        <nav className="space-y-2 flex-1">
          <button
            onClick={() => setActiveTab("committee")}
            className={`w-full flex items-center gap-3 px-5 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all ${activeTab === "committee"
              ? "bg-amber-600 text-white shadow-lg shadow-amber-100"
              : "text-stone-400 hover:bg-amber-50 hover:text-amber-600"
              }`}
          >
            <Users size={18} /> Committee
          </button>
          <button
            onClick={() => setActiveTab("classes")}
            className={`w-full flex items-center gap-3 px-5 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all ${activeTab === "classes"
              ? "bg-amber-600 text-white shadow-lg shadow-amber-100"
              : "text-stone-400 hover:bg-amber-50 hover:text-amber-600"
              }`}
          >
            <BookOpen size={18} /> Classes
          </button>
        </nav>

        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-5 py-4 text-stone-400 font-black text-xs uppercase tracking-widest hover:text-red-600 transition-colors mt-auto border-t border-stone-100 pt-6"
        >
          <LogOut size={18} /> Logout
        </button>
      </aside>

      {/* --- MAIN CONTENT --- */}
      <main className="flex-1 p-6 md:p-8 lg:p-12 overflow-y-auto">
        <header className="mb-8 md:mb-12 flex flex-col md:flex-row justify-between items-start gap-6">
          <div>
            <h1 className="text-3xl md:text-4xl font-black text-stone-900 tracking-tight uppercase italic">
              {activeTab === "committee" ? "Committee" : "Assigned"}
              <span className="text-amber-600 not-italic ml-2">Portal</span>
            </h1>
            <div className="h-1 w-20 bg-amber-600 mt-2 rounded-full"></div>
            {/* Showing which temple is currently being managed */}
            <p className="text-[10px] font-black text-stone-400 uppercase tracking-[0.2em] mt-3 flex items-center gap-2">
              <MapPin size={12} className="text-amber-600" /> {currentTemple}
            </p>
          </div>

          <div className="flex items-center">
            {/* English Comment: Grouping Broadcast button and Notification bell with minimal spacing */}
            <div className="flex items-center bg-amber-50/50 rounded-2xl p-1 border border-amber-100/50 shadow-sm">
              {/* Send Notification Box */}
              <div
                onClick={() =>
                  (window.location.href = `/subadmin/notifications?temple=${encodeURIComponent(currentTemple)}`)
                }
                className="px-5 py-2 hover:bg-amber-100/80 rounded-xl transition-all active:scale-95 cursor-pointer group flex flex-col items-center justify-center border-r border-amber-200/50"
              >
                <span className="text-[9px] text-amber-600 font-black uppercase tracking-tighter leading-none">
                  Broadcast
                </span>
                <div className="flex items-center gap-1.5 mt-1">
                  <Megaphone
                    size={12}
                    className="text-amber-600 group-hover:rotate-12 transition-transform"
                  />
                  <span className="text-[11px] font-bold text-amber-900 leading-none">
                    Send Notice
                  </span>
                </div>
              </div>

              {/* Notification Bell - Space removed by placing it directly next to the divider */}
              <div className="pl-1">
                <NotificationPanel
                  userRole="subadmin"
                  templeName={currentTemple}
                />
              </div>
            </div>
          </div>
        </header>

        {/* --- COMMITTEE SECTION --- */}
        {activeTab === "committee" && (
          <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col sm:flex-row justify-between items-center bg-white p-6 md:p-8 rounded-[2rem] border border-amber-100 shadow-sm gap-4">
              <h3 className="text-sm font-black text-stone-900 uppercase tracking-widest">
                Team Management
              </h3>
              <button
                onClick={addMember}
                className="w-full sm:w-auto bg-amber-600 text-white px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-amber-700 transition-all shadow-md"
              >
                <Plus size={14} /> Add New Member
              </button>
            </div>

            <div className="grid gap-4">
              {committee.map((member, index) => (
                <div
                  key={index}
                  className="bg-white p-6 rounded-[2rem] border-2 border-stone-50 relative group transition-all hover:border-amber-200 hover:shadow-md"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex gap-3">
                      <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-600 font-black text-xl shadow-inner border border-amber-100">
                        {index + 1}
                      </div>
                      <div>
                        {editingIndex === index ? (
                          <span className="text-[10px] font-black text-amber-600 uppercase tracking-widest bg-amber-50 px-2 py-1 rounded-md">
                            Editing Member
                          </span>
                        ) : (
                          <span className="text-[10px] font-black text-stone-400 uppercase tracking-widest">
                            Committee Member
                          </span>
                        )}
                        <h4 className="text-lg font-black text-stone-900 leading-none mt-1">
                          {member.name || "Unnamed Leader"}
                        </h4>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-2">
                      <button
                        onClick={() =>
                          setEditingIndex(editingIndex === index ? null : index)
                        }
                        className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${editingIndex === index
                          ? "bg-green-600 text-white shadow-lg shadow-green-100"
                          : "bg-stone-100 text-stone-600 hover:bg-stone-200"
                          }`}
                      >
                        {editingIndex === index ? "Done" : "Edit Details"}
                      </button>
                      <button
                        onClick={() => removeMember(index)}
                        className="p-2 w-fit bg-red-50 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all shadow-sm group/del self-end sm:self-auto"
                        title="Delete Member"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>

                  {editingIndex === index ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 animate-in fade-in duration-300">
                      <div className="space-y-1">
                        <label className="text-[10px] font-black text-stone-900 uppercase ml-1">
                          Name
                        </label>
                        <input
                          value={member.name}
                          onChange={(e) =>
                            updateMember(index, "name", e.target.value)
                          }
                          className="w-full bg-stone-50 p-4 rounded-xl border border-stone-100 text-sm font-bold text-stone-900 outline-none focus:border-amber-400 transition-all shadow-inner"
                          placeholder="Rajesh Jain"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-black text-stone-900 uppercase ml-1">
                          Role
                        </label>
                        <select
                          value={member.designation}
                          onChange={(e) =>
                            updateMember(index, "designation", e.target.value)
                          }
                          className="w-full bg-stone-50 p-4 rounded-xl border border-stone-100 text-sm font-bold text-stone-900 outline-none focus:border-amber-400 transition-all shadow-inner appearance-none"
                        >
                          <option value="">Select Role</option>
                          <option value="Adyaksh">Adyaksh</option>
                          <option value="Upadyaksh">Upadyaksh</option>
                          <option value="Secretary">Secretary</option>
                          <option value="Koshadhyaksh">Koshadhyaksh</option>
                          <option value="Member">Member</option>
                        </select>
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-black text-stone-900 uppercase ml-1">
                          Phone
                        </label>
                        <input
                          type="tel"
                          maxLength={10}
                          value={member.phone}
                          onChange={(e) =>
                            updateMember(index, "phone", e.target.value)
                          }
                          className="w-full bg-stone-50 p-4 rounded-xl border border-stone-100 text-sm font-bold text-stone-900 outline-none focus:border-amber-400 transition-all shadow-inner"
                          placeholder="10 Digit Number"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-black text-stone-900 uppercase ml-1">
                          Email
                        </label>
                        <input
                          value={member.email}
                          onChange={(e) =>
                            updateMember(index, "email", e.target.value)
                          }
                          className="w-full bg-stone-50 p-4 rounded-xl border border-stone-100 text-sm font-bold text-stone-900 outline-none focus:border-amber-400 transition-all shadow-inner"
                          placeholder="email@example.com"
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 py-2 px-1 animate-in fade-in duration-300">
                      <div>
                        <p className="text-[8px] font-black text-stone-400 uppercase tracking-widest mb-1">
                          Designation
                        </p>
                        <p className="text-xs font-bold text-amber-600 uppercase bg-amber-50 px-2 py-1 rounded-md inline-block">
                          {member.designation || "Not Assigned"}
                        </p>
                      </div>
                      <div>
                        <p className="text-[8px] font-black text-stone-400 uppercase tracking-widest mb-1">
                          Phone Number
                        </p>
                        <p className="text-sm font-bold text-stone-600">
                          {member.phone || "--"}
                        </p>
                      </div>
                      <div className="col-span-1 md:col-span-2">
                        <p className="text-[8px] font-black text-stone-400 uppercase tracking-widest mb-1">
                          Email Address
                        </p>
                        <p className="text-sm font-bold text-stone-600">
                          {member.email || "No email listed"}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* English Comment: Main Save Button at the bottom of the list */}
            <button
              onClick={saveCommitteeToDB}
              disabled={loading}
              className={`w-full ${loading ? "bg-stone-400" : "bg-amber-600 hover:bg-amber-700"} text-white py-5 rounded-[1.5rem] font-black text-xs uppercase tracking-[0.3em] transition-all flex items-center justify-center gap-3 shadow-xl shadow-amber-100 active:scale-[0.98]`}
            >
              {loading ? (
                "Saving to Database..."
              ) : (
                <>
                  Confirm & Save Data <ArrowRight size={18} />
                </>
              )}
            </button>
          </div>
        )}
        {/* --- DYNAMIC CLASSES SECTION --- */}
        {activeTab === "classes" && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-700">
            {/* Summary Card for Total Registrations */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-8 rounded-[2.5rem] border border-stone-100 shadow-sm flex items-center gap-6 group hover:border-amber-400 transition-all duration-500">
                <div className="w-16 h-16 bg-amber-50 text-amber-600 rounded-3xl flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform">
                  <Users size={32} />
                </div>
                <div>
                  <p className="text-[10px] font-black text-stone-400 uppercase tracking-widest mb-1">
                    Total Registrations
                  </p>
                  <h3 className="text-3xl font-black text-stone-900 leading-none mr-2 inline-block">
                    {assignedClasses.reduce((acc, curr) => acc + (curr.studentCount || 0), 0)}
                  </h3>
                  <span className="text-[10px] font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-full uppercase tracking-tighter shadow-sm border border-green-100">
                    Live
                  </span>
                </div>
              </div>

              <div className="bg-stone-900 p-8 rounded-[2.5rem] text-white shadow-xl flex items-center gap-6 col-span-1 md:col-span-2 overflow-hidden relative">
                <div className="absolute top-0 right-0 w-32 h-32 bg-amber-600/10 rounded-full -mr-16 -mt-16 blur-3xl"></div>
                <div className="absolute bottom-0 right-0 w-24 h-24 bg-rose-600/10 rounded-full -mr-12 -mb-12 blur-2xl"></div>
                <div className="w-16 h-16 bg-white/10 text-amber-500 rounded-3xl flex items-center justify-center relative z-10 shrink-0">
                  <BookOpen size={32} />
                </div>
                <div className="relative z-10">
                  <p className="text-[10px] font-black opacity-50 uppercase tracking-widest mb-1">
                    Managed Classes
                  </p>
                  <h3 className="text-3xl font-black italic uppercase leading-none">
                    {assignedClasses.length} <span className="text-amber-500 not-italic ml-2">Active Portals</span>
                  </h3>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
              {assignedClasses.length > 0 ? (
                assignedClasses.map((cls, idx) => (
                  <div
                    key={idx}
                    className="group bg-white rounded-[3rem] border border-stone-100 shadow-sm hover:shadow-2xl hover:border-amber-400 transition-all duration-500 flex flex-col relative overflow-hidden bg-gradient-to-b from-white to-stone-50/50"
                  >
                    <div className="p-8">
                      <div className="flex items-center gap-4 mb-6">
                        <div className="w-16 h-16 bg-stone-900 text-white rounded-2xl flex items-center justify-center shadow-lg group-hover:bg-amber-600 transition-colors">
                          <GraduationCap size={32} />
                        </div>
                        <div>
                          <h3 className="text-2xl font-black text-stone-900 uppercase italic leading-none">
                            {cls.grade}
                          </h3>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3 mb-6">
                        <div className="bg-white border border-stone-100 p-4 rounded-2xl relative">
                          <p className="text-[8px] font-black text-stone-400 uppercase mb-1">
                            Users Registered
                          </p>
                          <div className="flex items-center gap-2">
                            <Users size={12} className="text-amber-600" />
                            <p className="text-sm font-black text-stone-900 leading-none">
                              {cls.studentCount || 0}
                            </p>
                          </div>
                          {(cls.studentCount || 0) > 0 && (
                            <div className="absolute top-2 right-2 w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
                          )}
                        </div>
                        <div className="bg-white border border-stone-100 p-4 rounded-2xl">
                          <p className="text-[8px] font-black text-stone-400 uppercase mb-1">
                            Exam Center
                          </p>
                          <p className="text-[10px] font-bold text-stone-800 uppercase truncate">
                            {cls.examVenue}
                          </p>
                        </div>
                        <div className="bg-white border border-stone-100 p-4 rounded-2xl">
                          <p className="text-[8px] font-black text-stone-400 uppercase mb-1">
                            Schedule
                          </p>
                          <p className="text-[10px] font-bold text-stone-800 uppercase">
                            {cls.examDate}
                          </p>
                        </div>
                      </div>

                      <button
                        onClick={() => setSelectedPortal(cls)}
                        className="w-full py-5 bg-stone-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] hover:bg-amber-600 transition-all flex items-center justify-center gap-3 shadow-xl shadow-stone-200"
                      >
                        Open Full Portal <Plus size={16} />
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-full py-40 flex flex-col items-center justify-center border-2 border-dashed border-stone-200 rounded-[4rem] bg-white text-stone-400">
                  <BookOpen size={40} className="mb-4" />
                  <p className="font-black uppercase tracking-widest text-sm">
                    No Active Classes
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* --- FULL PORTAL MODAL --- */}
      {selectedPortal && (
        <div className="fixed inset-0 z-[100] bg-stone-900/60 backdrop-blur-md flex justify-end animate-in fade-in duration-300">
          <div className="w-full max-w-2xl bg-[#FFFBF7] h-full shadow-2xl overflow-y-auto animate-in slide-in-from-right duration-500 flex flex-col">
            <div className="p-8 md:p-10 flex-1">
              {/* Modal Close Section */}
              <div className="flex justify-between items-start mb-12">
                <div className="w-16 h-16 bg-amber-600 text-white rounded-2xl flex items-center justify-center">
                  <ShieldCheck size={32} />
                </div>
                <button
                  onClick={() => setSelectedPortal(null)}
                  className="p-3 hover:bg-red-50 text-stone-400 hover:text-red-500 rounded-xl transition-all"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="mb-10">
                <h2 className="text-5xl font-black text-stone-900 uppercase italic tracking-tighter leading-none">
                  {selectedPortal.grade} <br />
                  <span className="text-amber-600 not-italic">Portal</span>
                </h2>
                <div className="h-1.5 w-24 bg-stone-900 mt-4 rounded-full"></div>
              </div>

              <div className="space-y-8">
                {/* Class & Exam Grid */}
                <div className="grid grid-cols-1 gap-4">
                  <div className="p-6 bg-stone-50 rounded-3xl border border-stone-100">
                    <p className="text-[10px] font-black text-stone-400 uppercase tracking-widest mb-1">
                      Class Category
                    </p>
                    <p className="text-lg font-black text-stone-900 uppercase">
                      {selectedPortal.grade}
                    </p>
                  </div>
                </div>

                {/* --- ADDED SECTION: Exam Venue, Date & Time --- */}
                <div className="grid grid-cols-1 gap-4">
                  {/* Venue */}
                  <div className="p-6 bg-stone-900 rounded-[2.5rem] text-white flex items-center gap-4">
                    <MapPin className="text-amber-600" size={24} />
                    <div>
                      <p className="text-[10px] font-bold uppercase opacity-60 italic">
                        Exam Center Venue
                      </p>
                      <p className="font-black uppercase tracking-tight">
                        {selectedPortal.examVenue}
                      </p>
                    </div>
                  </div>

                  {/* Date & Time Row */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-6 bg-stone-50 rounded-3xl border border-stone-100 flex items-center gap-3">
                      <Calendar className="text-amber-600" size={20} />
                      <div>
                        <p className="text-[8px] font-black text-stone-400 uppercase">
                          Date
                        </p>
                        <p className="text-sm font-bold text-stone-900">
                          {selectedPortal.examDate}
                        </p>
                      </div>
                    </div>
                    <div className="p-6 bg-stone-50 rounded-3xl border border-stone-100 flex items-center gap-3">
                      <Clock className="text-amber-600" size={20} />
                      <div>
                        <p className="text-[8px] font-black text-stone-400 uppercase">
                          Time
                        </p>
                        <p className="text-sm font-bold text-stone-900">
                          {selectedPortal.examTime || "As per Hall Ticket"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Syllabus Section (Clickable) */}
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
                    <BookOpen size={20} />
                  </div>
                  <div className="flex-1">
                    <p className="text-[10px] font-black text-stone-400 uppercase tracking-widest">
                      Syllabus Details (Click to View)
                    </p>
                    <div
                      onClick={() => {
                        if (selectedPortal.syllabus) {
                          const newWindow = window.open();
                          newWindow?.document.write(
                            `<iframe src="${selectedPortal.syllabus}" frameborder="0" style="border:0; top:0px; left:0px; bottom:0px; right:0px; width:100%; height:100%;" allowfullscreen></iframe>`,
                          );
                        } else {
                          showModal(
                            "error",
                            "Not Available",
                            "No syllabus file has been uploaded for this class yet.",
                          );
                        }
                      }}
                      className="mt-2 p-6 bg-stone-50 rounded-2xl text-blue-600 text-sm font-bold italic leading-relaxed border border-stone-100 cursor-pointer hover:bg-blue-50 hover:border-blue-200 transition-all"
                    >
                      {selectedPortal.fileName
                        ? `📄 ${selectedPortal.fileName}`
                        : "Click to view syllabus document"}
                    </div>
                  </div>
                </div>

                {/* Instructions */}
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center text-red-600 shrink-0">
                    <Info size={20} />
                  </div>
                  <div className="flex-1">
                    <p className="text-[10px] font-black text-stone-400 uppercase tracking-widest text-red-500">
                      Important Instructions
                    </p>
                    <div className="mt-2 p-6 bg-red-50/30 rounded-2xl text-red-900/70 text-xs font-bold italic leading-relaxed">
                      {selectedPortal.instructions || "• Carry hall ticket"}
                    </div>
                  </div>
                </div>

                {/* --- REGISTERED STUDENTS SECTION --- */}
                <div className="mt-12 space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-stone-900 rounded-xl flex items-center justify-center text-white">
                        <Users size={18} />
                      </div>
                      <div>
                        <div className="flex items-center gap-3">
                          <h3 className="text-xl font-black text-stone-900 uppercase tracking-tight">
                            Registered Students
                          </h3>
                          <button
                            onClick={refreshStudents}
                            className="text-[10px] bg-amber-50 text-amber-600 px-3 py-1 rounded-full font-black uppercase hover:bg-amber-100 transition-all border border-amber-200"
                          >
                            Refresh List
                          </button>
                          {students.length > 0 && (
                            <button
                              onClick={downloadStudentData}
                              className="text-[10px] bg-green-50 text-green-600 px-3 py-1 rounded-full font-black uppercase hover:bg-green-100 transition-all border border-green-200"
                            >
                              Download List (CSV)
                            </button>
                          )}
                        </div>
                        <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">
                          Total: {students.length} enrollment(s)
                        </p>
                      </div>
                    </div>
                  </div>

                  {studentsLoading ? (
                    <div className="py-20 flex flex-col items-center justify-center bg-white rounded-[2rem] border border-stone-100 border-dashed">
                      <div className="w-8 h-8 border-4 border-amber-600 border-t-transparent rounded-full animate-spin mb-4"></div>
                      <p className="text-xs font-black text-stone-400 uppercase tracking-widest animate-pulse">
                        Retrieving Database records...
                      </p>
                    </div>
                  ) : students.length > 0 ? (
                    <div className="bg-white rounded-[2rem] border border-stone-100 shadow-sm overflow-hidden">
                      <div className="overflow-x-auto">
                        <table className="w-full text-left">
                          <thead className="bg-stone-50 border-b border-stone-100">
                            <tr>
                              <th className="px-6 py-4 text-[9px] font-black text-stone-400 uppercase tracking-widest w-12 text-center">#</th>
                              <th className="px-6 py-4 text-[9px] font-black text-stone-400 uppercase tracking-widest">Student Info</th>
                              <th className="px-6 py-4 text-[9px] font-black text-stone-400 uppercase tracking-widest">Mobile / City</th>
                              <th className="px-6 py-4 text-[9px] font-black text-stone-400 uppercase tracking-widest text-center">Status</th>
                              <th className="px-6 py-4 text-[9px] font-black text-stone-400 uppercase tracking-widest text-right">Registered</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-stone-50">
                            {students.map((student, sIdx) => (
                              <tr key={student._id || sIdx} className="hover:bg-amber-50/30 transition-colors">
                                <td className="px-6 py-4 text-center">
                                  <span className="text-[10px] font-black text-stone-400">
                                    {(sIdx + 1).toString().padStart(2, '0')}
                                  </span>
                                </td>
                                <td className="px-6 py-4">
                                  <p className="text-sm font-black text-stone-900">{student.name}</p>
                                  <p className="text-[10px] font-bold text-stone-400 italic">{student.email}</p>
                                </td>
                                <td className="px-6 py-4">
                                  <p className="text-[11px] font-black text-stone-700">{student.phone || "--"}</p>
                                  <p className="text-[10px] font-bold text-amber-600 uppercase tracking-tighter">{student.city || student.studentClass}</p>
                                </td>
                                <td className="px-6 py-4 text-center">
                                  <span className={`text-[8px] font-black px-2 py-0.5 rounded-full uppercase ${student.paid ? 'bg-green-100 text-green-700' : 'bg-red-50 text-red-500'}`}>
                                    {student.paid ? 'Paid' : 'Unpaid'}
                                  </span>
                                </td>
                                <td className="px-6 py-4 text-right">
                                  <p className="text-[10px] font-bold text-stone-500 whitespace-nowrap mb-1">
                                    {new Date(student.createdAt).toLocaleDateString()}
                                  </p>
                                  <button
                                    onClick={() => setSelectedStudent(student)}
                                    className="text-[9px] font-black uppercase text-amber-600 hover:text-amber-700 hover:underline"
                                  >
                                    View Biodata
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  ) : (
                    <div className="py-16 flex flex-col items-center justify-center bg-white rounded-[2rem] border border-stone-100 border-dashed text-stone-300">
                      <Users size={32} className="mb-4 opacity-20" />
                      <p className="text-[10px] font-black uppercase tracking-widest">
                        No registrations found for this class
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )
      }
      <StatusModal
        isOpen={modal.isOpen}
        status={modal.status}
        title={modal.title}
        message={modal.message}
        onClose={() => setModal((prev) => ({ ...prev, isOpen: false }))}
      />

      {/* --- STUDENT BIODATA MODAL --- */}
      {
        selectedStudent && (
          <div className="fixed inset-0 z-[110] bg-stone-900/60 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-300">
            <div className="bg-white rounded-[2.5rem] p-8 max-w-lg w-full shadow-2xl border border-stone-100 animate-in zoom-in-95 duration-300 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-r from-amber-500 to-amber-600"></div>

              <div className="relative">
                <button
                  onClick={() => setSelectedStudent(null)}
                  className="absolute top-0 right-0 p-2 bg-white/20 text-white hover:bg-white/40 rounded-full transition-colors"
                >
                  <X size={20} />
                </button>

                <div className="flex flex-col items-center -mt-4 mb-6">
                  <div className="w-24 h-24 bg-white p-1 rounded-full shadow-lg">
                    <div className="w-full h-full bg-stone-100 rounded-full flex items-center justify-center text-stone-400">
                      <Users size={40} />
                    </div>
                  </div>
                  <h2 className="text-2xl font-black text-stone-900 uppercase tracking-tight mt-4">
                    {selectedStudent.name}
                  </h2>
                  <span className="text-xs font-bold text-amber-600 bg-amber-50 px-3 py-1 rounded-full uppercase tracking-widest mt-1">
                    Student Biodata
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-stone-50 rounded-2xl border border-stone-100">
                    <p className="text-[9px] font-black text-stone-400 uppercase tracking-widest mb-1">Email Address</p>
                    <p className="text-sm font-bold text-stone-900 break-words">{selectedStudent.email}</p>
                  </div>
                  <div className="p-4 bg-stone-50 rounded-2xl border border-stone-100">
                    <p className="text-[9px] font-black text-stone-400 uppercase tracking-widest mb-1">Phone Number</p>
                    <p className="text-sm font-bold text-stone-900">{selectedStudent.phone || "Not Provided"}</p>
                  </div>
                  <div className="p-4 bg-stone-50 rounded-2xl border border-stone-100">
                    <p className="text-[9px] font-black text-stone-400 uppercase tracking-widest mb-1">City / Location</p>
                    <p className="text-sm font-bold text-stone-900">
                      {selectedStudent.city ? `${selectedStudent.city}, ${selectedStudent.state || ''}` : "Not Provided"}
                    </p>
                  </div>
                  <div className="p-4 bg-stone-50 rounded-2xl border border-stone-100">
                    <p className="text-[9px] font-black text-stone-400 uppercase tracking-widest mb-1">Registered Class</p>
                    <p className="text-sm font-bold text-stone-900">{selectedStudent.studentClass}</p>
                  </div>
                  <div className="col-span-2 p-4 bg-stone-50 rounded-2xl border border-stone-100">
                    <p className="text-[9px] font-black text-stone-400 uppercase tracking-widest mb-1">Full Address</p>
                    <p className="text-sm font-bold text-stone-900">{selectedStudent.address ? `${selectedStudent.address}, ${selectedStudent.pincode || ''}` : "Not Provided"}</p>
                  </div>
                  <div className="col-span-2 p-4 bg-stone-50 rounded-2xl border border-stone-100 flex justify-between items-center">
                    <div>
                      <p className="text-[9px] font-black text-stone-400 uppercase tracking-widest mb-1">Payment ID</p>
                      <p className="text-xs font-mono font-bold text-stone-600">{selectedStudent.paymentId || "NOT PROVIDED"}</p>
                    </div>
                    <div>
                      <p className="text-[9px] font-black text-stone-400 uppercase tracking-widest mb-1 text-right">Joined On</p>
                      <p className="text-xs font-bold text-stone-900 text-right">{new Date(selectedStudent.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )
      }
    </div >
  );
}
