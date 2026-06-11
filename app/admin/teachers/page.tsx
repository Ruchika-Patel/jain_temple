"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Search,
  PlusCircle,
  Edit2,
  Trash2,
  Users,
  BookOpen,
  Loader2,
  CheckCircle,
  Copy,
  Printer,
} from "lucide-react";
import StatusModal from "@/components/StatusModal";

export default function AdminTeachersPage() {
  const [teachers, setTeachers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // Modal States
  const [isAddEditModalOpen, setIsAddEditModalOpen] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState<any | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  const [createdCredentials, setCreatedCredentials] = useState<any | null>(null);

  // Form Fields
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [assignedClasses, setAssignedClasses] = useState<string[]>([]);
  const [assignedSubjects, setAssignedSubjects] = useState("");
  const [centers, setCenters] = useState<any[]>([]);
  const [templeName, setTempleName] = useState("");

  // Status Modal
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

  const fetchTeachers = async () => {
    try {
      const res = await fetch("/api/admin/teachers");
      const data = await res.json();
      if (data.success) {
        setTeachers(data.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchCenters = async () => {
    try {
      const res = await fetch("/api/temples");
      const data = await res.json();
      if (data.success) {
        setCenters(data.data);
        if (data.data.length > 0 && !templeName) {
          setTempleName(data.data[0].name);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await fetchTeachers();
      await fetchCenters();
      setLoading(false);
    };
    init();
  }, []);

  const handleOpenAddModal = () => {
    setEditingTeacher(null);
    setName("");
    setEmail("");
    setPhone("");
    setPassword(Math.random().toString(36).slice(-6)); // temporary pass
    setTempleName(centers.length > 0 ? centers[0].name : "General");
    setAssignedClasses([]);
    setAssignedSubjects("");
    setIsAddEditModalOpen(true);
  };

  const handleOpenEditModal = (t: any) => {
    setEditingTeacher(t);
    setName(t.name || "");
    setEmail(t.email || "");
    setPhone(t.phone || "");
    setPassword("");
    setTempleName(t.templeName || (centers.length > 0 ? centers[0].name : "General"));
    setAssignedClasses(t.assignedClasses || []);
    setAssignedSubjects(t.assignedSubjects ? t.assignedSubjects.join(", ") : "");
    setIsAddEditModalOpen(true);
  };

  const handleSaveTeacher = async (e: React.FormEvent) => {
    e.preventDefault();
    if (phone.length !== 10) {
      showModal("error", "Invalid Phone", "Phone number must be exactly 10 digits!");
      return;
    }

    setFormLoading(true);
    showModal("loading", editingTeacher ? "Updating..." : "Creating...", "Saving staff details");

    const payload = {
      id: editingTeacher?._id,
      name,
      email,
      phone,
      password,
      templeName,
      assignedClasses,
      assignedSubjects: assignedSubjects.split(",").map(s => s.trim()).filter(s => s !== ""),
    };

    try {
      const url = "/api/admin/teachers";
      const method = editingTeacher ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.success) {
        if (!editingTeacher) {
          setCreatedCredentials({
            name: name,
            username: email,
            password: password,
            type: "teacher",
            extra: `Phone: ${phone} | Centre: ${templeName} | Assigned Classes: ${assignedClasses.join(", ") || "None"}`
          });
          setModal((prev) => ({ ...prev, isOpen: false }));
        } else {
          showModal(
            "success",
            "Success!",
            "Teacher updated successfully!"
          );
        }
        setIsAddEditModalOpen(false);
        fetchTeachers();
      } else {
        showModal("error", "Failed", data.message || "Save failed");
      }
    } catch (err: any) {
      showModal("error", "Error", err.message || "Connection error");
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteTeacher = async (id: string) => {
    if (!confirm("Are you sure you want to permanently delete this teacher?")) return;

    showModal("loading", "Deleting...", "Removing staff record");
    try {
      const res = await fetch(`/api/admin/teachers?id=${id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        showModal("success", "Deleted", "Teacher removed successfully!");
        fetchTeachers();
      } else {
        showModal("error", "Failed", data.message || "Delete failed");
      }
    } catch (err) {
      showModal("error", "Error", "Connection failed");
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    alert(`${label} copied to clipboard!`);
  };

  const copyTeacherCredentials = (emailAddress: string, pass: string) => {
    const text = `Login Username/Email: ${emailAddress}\nPassword: ${pass}`;
    navigator.clipboard.writeText(text);
    alert(`Teacher credentials copied to clipboard!`);
  };

  const printTeacherCredentials = (t: any) => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    const displayPassword = t.plainPassword || (t.password && !t.password.startsWith("$2b$") ? t.password : "******** (Hidden)");

    printWindow.document.write(`
      <html>
        <head>
          <title>Staff Credentials - ${t.name}</title>
          <style>
            body { font-family: sans-serif; padding: 40px; text-align: center; }
            .card { border: 2px dashed #000; padding: 30px; display: inline-block; border-radius: 10px; text-align: left; min-width: 320px; }
            h2 { color: #ea580c; text-align: center; margin-top: 0; }
            p { margin: 10px 0; font-size: 16px; }
            .bold { font-weight: bold; }
          </style>
        </head>
        <body>
          <div class="card">
            <h2>Staff Portal Credentials</h2>
            <p><span class="bold">Name:</span> ${t.name}</p>
            <p><span class="bold">Centre:</span> ${t.templeName || "General"}</p>
            <p><span class="bold">Assigned Classes:</span> ${t.assignedClasses?.join(", ") || "None"}</p>
            <p><span class="bold">Assigned Subjects:</span> ${t.assignedSubjects?.join(", ") || "None"}</p>
            <hr style="border: 1px dashed #ccc; margin: 15px 0;" />
            <p><span class="bold">Login Username/Email:</span> ${t.email}</p>
            <p><span class="bold">Login Password:</span> ${displayPassword}</p>
            <p style="font-size: 11px; color: #666; text-align: center; margin-top: 25px;">Use registered Email Address to log in to the Staff portal.</p>
          </div>
          <script>window.print();</script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const toggleClass = (cls: string) => {
    if (assignedClasses.includes(cls)) {
      setAssignedClasses(assignedClasses.filter((c) => c !== cls));
    } else {
      setAssignedClasses([...assignedClasses, cls]);
    }
  };

  const filteredTeachers = teachers.filter((t) => {
    return (
      t.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.phone?.includes(searchTerm) ||
      t.assignedSubjects?.some((s: string) => s.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  });

  const classesList = Array.from({ length: 12 }, (_, i) => {
    const n = i + 1;
    const s = ["th", "st", "nd", "rd"],
      v = n % 100;
    const suffix = s[(v - 20) % 10] || s[v] || s[0];
    return `${n}${suffix} Class`;
  });

  return (
    <div className="min-h-screen bg-[#F8F7F5] font-sans pb-24">
      {/* Navbar */}
      <nav className="bg-white border-b border-stone-300 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 md:px-8 h-20 flex items-center justify-between">
          <Link
            href="/?view=admin"
            className="group flex items-center gap-3 text-stone-700 hover:text-orange-700 transition-all font-bold text-xs uppercase tracking-widest"
          >
            <div className="p-2.5 bg-stone-100 group-hover:bg-orange-100 rounded-2xl transition-colors border border-stone-200">
              <ArrowLeft size={18} className="text-stone-900" />
            </div>
            <span>Admin Console</span>
          </Link>
          <h1 className="text-sm font-black text-stone-600 uppercase tracking-widest">
            Teacher Management
          </h1>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 md:px-8 pt-8 md:pt-12">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10">
          <div>
            <h2 className="text-4xl md:text-5xl font-black text-stone-900 tracking-tight italic">
              Teacher <span className="text-orange-600 not-italic">Staff</span>
            </h2>
            <p className="mt-2 text-stone-500 text-xs uppercase tracking-widest font-black">
              Register teachers and assign them classes & subject settings.
            </p>
          </div>
          <button
            onClick={handleOpenAddModal}
            className="bg-orange-600 text-white px-6 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-orange-700 transition shadow-lg active:scale-95 flex items-center gap-2"
          >
            <PlusCircle size={16} /> Add Teacher
          </button>
        </div>

        {/* Search */}
        <div className="bg-white p-6 rounded-[2rem] border border-stone-200 shadow-sm mb-8">
          <div className="relative">
            <Search className="absolute left-4 top-4 text-stone-400" size={18} />
            <input
              type="text"
              placeholder="Search by Name, Phone, or Subject..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-stone-50 pl-12 pr-4 py-3 rounded-xl border border-stone-200 outline-none focus:ring-2 focus:ring-amber-500 text-sm font-semibold text-stone-900"
            />
          </div>
        </div>

        {/* Table & Mobile view */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="animate-spin text-orange-600 mb-4" size={48} />
            <p className="text-stone-400 font-bold uppercase text-[10px] tracking-widest">
              Loading staff directory...
            </p>
          </div>
        ) : filteredTeachers.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-[2rem] border border-stone-200">
            <Users size={48} className="mx-auto text-stone-200 mb-4" />
            <p className="text-stone-400 font-bold italic text-sm">
              No teachers found matching filters.
            </p>
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden lg:block bg-white rounded-[2rem] border border-stone-200 shadow-sm overflow-hidden">
              <table className="w-full text-left">
                <thead className="bg-stone-50 border-b border-stone-100">
                  <tr>
                    <th className="px-8 py-5 text-[10px] font-black text-stone-400 uppercase tracking-widest">
                      Teacher Details
                    </th>
                    <th className="px-8 py-5 text-[10px] font-black text-stone-400 uppercase tracking-widest">
                      Assigned Subjects
                    </th>
                    <th className="px-8 py-5 text-[10px] font-black text-stone-400 uppercase tracking-widest">
                      Assigned Classes
                    </th>
                    <th className="px-8 py-5 text-[10px] font-black text-stone-400 uppercase tracking-widest">
                      Contact
                    </th>
                    <th className="px-8 py-5 text-[10px] font-black text-stone-400 uppercase tracking-widest text-right">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {filteredTeachers.map((t) => (
                    <tr key={t._id} className="hover:bg-stone-50/50 transition-colors">
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-teal-50 text-teal-600 rounded-full flex items-center justify-center font-bold">
                            {t.name?.slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-bold text-stone-800 text-sm leading-tight">
                              {t.name}
                            </p>
                            <p className="text-[9px] font-black text-stone-400 uppercase tracking-wide mt-1">
                              {t.email || "No email"}
                            </p>
                            <p className="text-[9px] font-black text-amber-600 uppercase tracking-wide mt-1 bg-amber-50 border border-amber-100 px-2 py-0.5 rounded-full w-fit">
                              Centre: {t.templeName || "General"}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-5">
                        <div className="flex flex-wrap gap-1">
                          {t.assignedSubjects?.length > 0 ? (
                            t.assignedSubjects.map((sub: string) => (
                              <span
                                key={sub}
                                className="bg-teal-50 text-teal-700 text-[9px] font-black uppercase px-2 py-0.5 rounded-full border border-teal-100"
                              >
                                {sub}
                              </span>
                            ))
                          ) : (
                            <span className="text-stone-400 text-xs italic">None</span>
                          )}
                        </div>
                      </td>
                      <td className="px-8 py-5">
                        <p className="text-xs text-stone-600 font-semibold line-clamp-2 max-w-xs">
                          {t.assignedClasses?.join(", ") || "None"}
                        </p>
                      </td>
                      <td className="px-8 py-5 text-xs text-stone-500 font-semibold">
                        {t.phone}
                      </td>
                      <td className="px-8 py-5 text-right">
                        <div className="flex justify-end gap-3">
                          <button
                            onClick={() => copyTeacherCredentials(t.email, t.plainPassword || "********")}
                            title="Copy Credentials"
                            className="p-2 text-stone-400 hover:text-indigo-600 bg-stone-50 hover:bg-stone-100 rounded-lg transition"
                          >
                            <Copy size={16} />
                          </button>
                          <button
                            onClick={() => printTeacherCredentials(t)}
                            title="Print Slip"
                            className="p-2 text-stone-400 hover:text-stone-700 bg-stone-50 hover:bg-stone-100 rounded-lg transition"
                          >
                            <Printer size={16} />
                          </button>
                          <button
                            onClick={() => handleOpenEditModal(t)}
                            className="p-2 text-orange-600 hover:text-orange-800 bg-orange-50 hover:bg-orange-100 rounded-lg transition"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            onClick={() => handleDeleteTeacher(t._id)}
                            className="p-2 text-red-600 hover:text-red-800 bg-red-50 hover:bg-red-100 rounded-lg transition"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:hidden">
              {filteredTeachers.map((t) => (
                <div key={t._id} className="bg-white p-6 rounded-3xl border border-stone-200 shadow-sm space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-teal-50 text-teal-600 rounded-full flex items-center justify-center font-bold">
                      {t.name?.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <h4 className="font-bold text-stone-900">{t.name}</h4>
                      <p className="text-[10px] text-stone-400">{t.email || t.phone} {t.templeName ? `| ${t.templeName}` : ""}</p>
                    </div>
                  </div>

                  <div className="space-y-2 border-t border-b border-stone-100 py-3 text-xs text-stone-600 font-semibold">
                    <div>
                      <p className="text-[9px] text-stone-400 uppercase font-black">Subjects</p>
                      <p className="text-teal-600 truncate">
                        {t.assignedSubjects?.join(", ") || "None"}
                      </p>
                    </div>
                    <div>
                      <p className="text-[9px] text-stone-400 uppercase font-black">Classes</p>
                      <p className="line-clamp-2">{t.assignedClasses?.join(", ") || "None"}</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap justify-end gap-2 pt-1">
                    <button
                      onClick={() => copyTeacherCredentials(t.email, t.plainPassword || "********")}
                      className="px-3 py-2 bg-stone-50 text-stone-600 rounded-xl font-bold text-[10px] uppercase tracking-widest flex-1 flex items-center justify-center gap-1"
                    >
                      <Copy size={12} /> Copy
                    </button>
                    <button
                      onClick={() => printTeacherCredentials(t)}
                      className="px-3 py-2 bg-stone-50 text-stone-600 rounded-xl font-bold text-[10px] uppercase tracking-widest flex-1 flex items-center justify-center gap-1"
                    >
                      <Printer size={12} /> Slip
                    </button>
                    <button
                      onClick={() => handleOpenEditModal(t)}
                      className="px-3 py-2 bg-orange-50 text-orange-600 rounded-xl font-bold text-[10px] uppercase tracking-widest flex-1 flex items-center justify-center gap-1"
                    >
                      <Edit2 size={12} /> Edit
                    </button>
                    <button
                      onClick={() => handleDeleteTeacher(t._id)}
                      className="px-3 py-2 bg-red-50 text-red-600 rounded-xl font-bold text-[10px] uppercase tracking-widest flex-1 flex items-center justify-center gap-1"
                    >
                      <Trash2 size={12} /> Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </main>

      {/* Add / Edit Teacher Modal */}
      {isAddEditModalOpen && (
        <div className="fixed inset-0 bg-stone-900/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-[2.5rem] shadow-2xl border border-stone-100 w-full max-w-2xl max-h-[90vh] overflow-y-auto p-8 sm:p-12 animate-in fade-in duration-300">
            <h3 className="text-2xl font-black text-stone-900 uppercase tracking-tight mb-8">
              {editingTeacher ? "Edit Teacher details" : "Register Teacher"}
            </h3>

            <form onSubmit={handleSaveTeacher} className="space-y-6">
              {/* Row 1: Name, Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-stone-500 uppercase ml-1">
                    Full Name *
                  </label>
                  <input
                    required
                    type="text"
                    className="w-full px-5 py-3.5 bg-stone-50 border border-stone-200 rounded-xl outline-none focus:ring-2 focus:ring-amber-500 text-stone-900 font-semibold text-sm transition shadow-sm"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black text-stone-500 uppercase ml-1">
                    Email Address *
                  </label>
                  <input
                    required
                    type="email"
                    className="w-full px-5 py-3.5 bg-stone-50 border border-stone-200 rounded-xl outline-none focus:ring-2 focus:ring-amber-500 text-stone-900 font-semibold text-sm transition shadow-sm"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              {/* Row 2: Phone, Password */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-stone-500 uppercase ml-1">
                    Mobile Number *
                  </label>
                  <input
                    required
                    maxLength={10}
                    type="tel"
                    className="w-full px-5 py-3.5 bg-stone-50 border border-stone-200 rounded-xl outline-none focus:ring-2 focus:ring-amber-500 text-stone-900 font-semibold text-sm transition shadow-sm"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black text-stone-500 uppercase ml-1">
                    {editingTeacher ? "Reset Password (Optional)" : "Login Password *"}
                  </label>
                  <input
                    required={!editingTeacher}
                    type="text"
                    className="w-full px-5 py-3.5 bg-stone-50 border border-stone-200 rounded-xl outline-none focus:ring-2 focus:ring-amber-500 text-stone-900 font-semibold text-sm transition shadow-sm"
                    placeholder={editingTeacher ? "Leave blank to keep same" : "Staff password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              </div>

              {/* Temple Selection */}
              <div className="space-y-1">
                <label className="text-[10px] font-black text-stone-500 uppercase ml-1">
                  Select Temple / Center *
                </label>
                <select
                  required
                  className="w-full px-5 py-3.5 bg-stone-50 border border-stone-200 rounded-xl outline-none focus:ring-2 focus:ring-amber-500 text-stone-900 font-semibold text-sm transition shadow-sm appearance-none"
                  value={templeName}
                  onChange={(e) => setTempleName(e.target.value)}
                >
                  {centers.length > 0 ? (
                    centers.map((c) => (
                      <option key={c._id} value={c.name}>
                        {c.name}
                      </option>
                    ))
                  ) : (
                    <option value="General">General</option>
                  )}
                </select>
              </div>

              {/* Subjects */}
              <div className="space-y-1">
                <label className="text-[10px] font-black text-stone-500 uppercase ml-1">
                  Assigned Subjects (comma-separated)
                </label>
                <input
                  type="text"
                  className="w-full px-5 py-3.5 bg-stone-50 border border-stone-200 rounded-xl outline-none focus:ring-2 focus:ring-amber-500 text-stone-900 font-semibold text-sm transition shadow-sm"
                  placeholder="e.g. Mathematics, Science"
                  value={assignedSubjects}
                  onChange={(e) => setAssignedSubjects(e.target.value)}
                />
              </div>

              {/* Classes Checkboxes */}
              <div className="space-y-2">
                <label className="text-[10px] font-black text-stone-500 uppercase ml-1">
                  Assigned Class Levels
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 bg-stone-50 p-4 rounded-2xl border border-stone-200 max-h-[150px] overflow-y-auto">
                  {classesList.map((c) => (
                    <label key={c} className="flex items-center gap-2 cursor-pointer text-xs font-bold text-stone-700 select-none">
                      <input
                        type="checkbox"
                        checked={assignedClasses.includes(c)}
                        onChange={() => toggleClass(c)}
                        className="accent-orange-600 w-4 h-4"
                      />
                      {c.replace(" Class", "")}
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => setIsAddEditModalOpen(false)}
                  className="flex-1 py-4 bg-stone-100 text-stone-600 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-stone-200 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formLoading}
                  className="flex-1 py-4 bg-orange-600 text-white rounded-xl font-black text-xs uppercase tracking-widest hover:bg-orange-700 transition shadow-md disabled:bg-stone-300"
                >
                  {editingTeacher ? "Save Changes" : "Register Teacher"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Status Alert Modal */}
      <StatusModal
        isOpen={modal.isOpen}
        status={modal.status}
        title={modal.title}
        message={modal.message}
        onClose={() => setModal((prev) => ({ ...prev, isOpen: false }))}
      />

      {/* Credentials Popup Modal */}
      {createdCredentials && (
        <div className="fixed inset-0 bg-stone-900/40 backdrop-blur-sm z-[110] flex items-center justify-center p-4">
          <div className="bg-white rounded-[2.5rem] shadow-2xl border border-stone-100 w-full max-w-md p-8 animate-in fade-in duration-300 text-center space-y-6">
            <div className="w-16 h-16 bg-green-50 text-green-600 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle size={36} />
            </div>
            
            <div>
              <h3 className="text-2xl font-black text-stone-900 uppercase tracking-tight">
                Staff Registered!
              </h3>
              <p className="text-xs text-stone-400 font-bold uppercase tracking-wider mt-1">
                Save or send these credentials
              </p>
            </div>

            <div className="bg-stone-50 p-6 rounded-3xl border border-stone-200 text-left space-y-4">
              <div>
                <p className="text-[10px] font-black text-stone-400 uppercase tracking-widest">Name</p>
                <p className="text-sm font-black text-stone-900 uppercase">{createdCredentials.name}</p>
              </div>

              {createdCredentials.extra && (
                <div>
                  <p className="text-[10px] font-black text-stone-400 uppercase tracking-widest">Details</p>
                  <p className="text-xs font-semibold text-stone-600">{createdCredentials.extra}</p>
                </div>
              )}

              <hr className="border-stone-200" />

              <div className="space-y-3">
                <div>
                  <p className="text-[10px] font-black text-stone-400 uppercase tracking-widest mb-1">Login Username / Phone</p>
                  <div className="flex items-center justify-between bg-white px-4 py-3 border border-stone-200 rounded-xl">
                    <span className="font-mono text-sm font-bold text-stone-900 select-all">{createdCredentials.username}</span>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(createdCredentials.username, "Username/Phone")}
                      className="p-1.5 text-stone-400 hover:text-indigo-600 hover:bg-stone-100 rounded-lg transition"
                    >
                      <Copy size={16} />
                    </button>
                  </div>
                </div>

                <div>
                  <p className="text-[10px] font-black text-stone-400 uppercase tracking-widest mb-1">Password</p>
                  <div className="flex items-center justify-between bg-white px-4 py-3 border border-stone-200 rounded-xl">
                    <span className="font-mono text-sm font-bold text-stone-900 select-all">{createdCredentials.password}</span>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(createdCredentials.password, "Password")}
                      className="p-1.5 text-stone-400 hover:text-indigo-600 hover:bg-stone-100 rounded-lg transition"
                    >
                      <Copy size={16} />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => {
                  const printWindow = window.open("", "_blank");
                  if (printWindow) {
                    printWindow.document.write(`
                      <html>
                        <head>
                          <title>Staff Credentials - ${createdCredentials.name}</title>
                          <style>
                            body { font-family: sans-serif; padding: 40px; text-align: center; }
                            .card { border: 2px dashed #000; padding: 30px; display: inline-block; border-radius: 10px; text-align: left; }
                            h2 { color: #0d9488; text-align: center; margin-top: 0; }
                            p { margin: 10px 0; font-size: 16px; }
                            .bold { font-weight: bold; }
                          </style>
                        </head>
                        <body>
                          <div class="card">
                            <h2>Staff Portal Credentials</h2>
                            <p><span class="bold">Name:</span> ${createdCredentials.name}</p>
                            <p><span class="bold">Details:</span> ${createdCredentials.extra}</p>
                            <hr />
                            <p><span class="bold">Login Username/Phone:</span> ${createdCredentials.username}</p>
                            <p><span class="bold">Login Password:</span> ${createdCredentials.password}</p>
                            <p style="font-size: 12px; color: #666; text-align: center; margin-top: 20px;">Use these credentials to log in to the Staff portal.</p>
                          </div>
                          <script>window.print();</script>
                        </body>
                      </html>
                    `);
                    printWindow.document.close();
                  }
                }}
                className="flex-1 py-3.5 bg-stone-100 text-stone-700 hover:bg-stone-200 rounded-2xl font-black text-xs uppercase tracking-widest transition flex items-center justify-center gap-1.5"
              >
                <Printer size={16} /> Print Slip
              </button>
              <button
                type="button"
                onClick={() => {
                  copyToClipboard(`Login Username/Phone: ${createdCredentials.username}\nPassword: ${createdCredentials.password}`, "All credentials");
                }}
                className="flex-1 py-3.5 bg-orange-600 hover:bg-orange-700 text-white rounded-2xl font-black text-xs uppercase tracking-widest transition flex items-center justify-center gap-1.5 shadow"
              >
                <Copy size={16} /> Copy All
              </button>
            </div>
            
            <button
              type="button"
              onClick={() => setCreatedCredentials(null)}
              className="w-full py-3 text-stone-400 hover:text-stone-600 font-bold text-xs uppercase tracking-widest transition"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
