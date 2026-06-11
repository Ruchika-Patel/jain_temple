"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Search,
  PlusCircle,
  Edit2,
  Trash2,
  Lock,
  User,
  GraduationCap,
  MapPin,
  Loader2,
  CheckCircle,
  Copy,
  Printer,
} from "lucide-react";
import StatusModal from "@/components/StatusModal";

export default function AdminStudentsPage() {
  const [students, setStudents] = useState<any[]>([]);
  const [centers, setCenters] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [classFilter, setClassFilter] = useState("");
  const [sectionFilter, setSectionFilter] = useState("");
  const [centerFilter, setCenterFilter] = useState("");

    // Modal States
  const [isAddEditModalOpen, setIsAddEditModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<any | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  const [createdCredentials, setCreatedCredentials] = useState<any | null>(null);

  // Form Fields
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [studentClass, setStudentClass] = useState("1st Class");
  const [section, setSection] = useState("A");
  const [templeName, setTempleName] = useState("");
  const [password, setPassword] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [pincode, setPincode] = useState("");

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

  const fetchStudents = async () => {
    try {
      const res = await fetch("/api/admin/students");
      const data = await res.json();
      if (data.success) {
        setStudents(data.data);
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
      await Promise.all([fetchStudents(), fetchCenters()]);
      setLoading(false);
    };
    init();
  }, []);

  const handleOpenAddModal = () => {
    setEditingStudent(null);
    setName("");
    setEmail("");
    setPhone("");
    setStudentClass("1st Class");
    setSection("A");
    if (centers.length > 0) setTempleName(centers[0].name);
    setPassword(Math.random().toString(36).slice(-6)); // random password
    setAddress("");
    setCity("");
    setState("");
    setPincode("");
    setIsAddEditModalOpen(true);
  };

  const handleOpenEditModal = (stu: any) => {
    setEditingStudent(stu);
    setName(stu.name || "");
    setEmail(stu.email || "");
    setPhone(stu.phone || "");
    setStudentClass(stu.studentClass || "1st Class");
    setSection(stu.section || "A");
    setTempleName(stu.templeName || "");
    setPassword(""); // leave blank unless changing
    setAddress(stu.address || "");
    setCity(stu.city || "");
    setState(stu.state || "");
    setPincode(stu.pincode || "");
    setIsAddEditModalOpen(true);
  };

  const handleSaveStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (phone.length !== 10) {
      showModal("error", "Invalid Phone", "Phone number must be exactly 10 digits!");
      return;
    }

    setFormLoading(true);
    showModal("loading", editingStudent ? "Updating..." : "Creating...", "Saving student details");

    const payload = {
      id: editingStudent?._id,
      name,
      email: email || undefined,
      phone,
      studentClass,
      section,
      templeName,
      password,
      address,
      city,
      state,
      pincode,
    };

    try {
      const url = "/api/admin/students";
      const method = editingStudent ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

            const data = await res.json();
      if (data.success) {
        if (!editingStudent) {
          setCreatedCredentials({
            name: name,
            username: data.data.studentId || data.data.phone || phone || "TBA",
            password: password,
            type: "student",
            extra: `Class: ${studentClass} (${section}) | Centre: ${templeName}`
          });
          setModal((prev) => ({ ...prev, isOpen: false }));
        } else {
          showModal(
            "success",
            "Success!",
            "Student updated successfully!"
          );
        }
        setIsAddEditModalOpen(false);
        fetchStudents();
      } else {
        showModal("error", "Failed", data.error || data.message || "Save failed");
      }
    } catch (err: any) {
      showModal("error", "Error", err.message || "Connection error");
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteStudent = async (id: string) => {
    if (!confirm("Are you sure you want to permanently delete this student?")) return;

    showModal("loading", "Deleting...", "Removing student record");
    try {
      const res = await fetch(`/api/admin/students?id=${id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        showModal("success", "Deleted", "Student removed successfully!");
        fetchStudents();
      } else {
        showModal("error", "Failed", data.message || "Delete failed");
      }
    } catch (err) {
      showModal("error", "Error", "Connection failed");
    }
  };

  const copyCredentials = (studentId: string, pass: string) => {
    navigator.clipboard.writeText(`ID: ${studentId}\nPassword: ${pass}`);
    alert("Credentials copied to clipboard!");
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    alert(`${label} copied to clipboard!`);
  };

  const printCredentials = (stu: any) => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;
    
    const studentIdDisplay = stu.studentId || stu.phone || "TBA";
    const sectionDisplay = stu.section || "A";
    const displayPassword = stu.plainPassword || (stu.password && !stu.password.startsWith("$2b$") ? stu.password : "******** (Hidden)");

    printWindow.document.write(`
      <html>
        <head>
          <title>Student Credentials</title>
          <style>
            body { font-family: sans-serif; padding: 40px; text-align: center; }
            .card { border: 2px dashed #000; padding: 30px; display: inline-block; border-radius: 10px; text-align: left; min-width: 320px; }
            h2 { color: #d97706; text-align: center; margin-top: 0; }
            p { margin: 10px 0; font-size: 16px; }
            .bold { font-weight: bold; }
          </style>
        </head>
        <body>
          <div class="card">
            <h2>Exam Management Portal</h2>
            <p><span class="bold">Student Name:</span> ${stu.name}</p>
            <p><span class="bold">Class:</span> ${stu.studentClass} (${sectionDisplay})</p>
            <p><span class="bold">Centre:</span> ${stu.templeName || "General"}</p>
            <hr style="border: 1px dashed #ccc; margin: 15px 0;" />
            <p><span class="bold">Login ID / Student ID:</span> ${studentIdDisplay}</p>
            <p><span class="bold">Temporary Password:</span> ${displayPassword}</p>
            <p style="font-size: 11px; color: #666; text-align: center; margin-top: 25px;">Use Student ID or Mobile Number to login.</p>
          </div>
          <script>window.print();</script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const filteredStudents = students.filter((stu) => {
    const matchesSearch =
      stu.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      stu.studentId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      stu.phone?.includes(searchTerm);
    const matchesClass = !classFilter || stu.studentClass === classFilter;
    const matchesSection = !sectionFilter || stu.section === sectionFilter;
    const matchesCenter = !centerFilter || stu.templeName === centerFilter;
    return matchesSearch && matchesClass && matchesSection && matchesCenter;
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
        <div className="max-w-[96vw] mx-auto px-4 md:px-8 h-20 flex items-center justify-between">
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
            Student Management
          </h1>
        </div>
      </nav>

      <main className="max-w-[96vw] mx-auto px-4 md:px-8 pt-8 md:pt-12">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10">
          <div>
            <h2 className="text-4xl md:text-5xl font-black text-stone-900 tracking-tight italic">
              Students <span className="text-orange-600 not-italic">Directory</span>
            </h2>
            <p className="mt-2 text-stone-500 text-xs uppercase tracking-widest font-black">
              Manage credentials, sections, and assign exam centers for students.
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white p-6 rounded-[2rem] border border-stone-200 shadow-sm mb-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-4 top-4 text-stone-400" size={18} />
            <input
              type="text"
              placeholder="Search Name, ID, or Phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-stone-50 pl-12 pr-4 py-3 rounded-xl border border-stone-200 outline-none focus:ring-2 focus:ring-amber-500 text-sm font-semibold text-stone-900"
            />
          </div>

          <select
            value={classFilter}
            onChange={(e) => setClassFilter(e.target.value)}
            className="w-full bg-stone-50 px-4 py-3 rounded-xl border border-stone-200 outline-none text-sm font-semibold text-stone-900"
          >
            <option value="">Filter by Class...</option>
            {classesList.map((cls) => (
              <option key={cls} value={cls}>
                {cls}
              </option>
            ))}
          </select>

          <select
            value={sectionFilter}
            onChange={(e) => setSectionFilter(e.target.value)}
            className="w-full bg-stone-50 px-4 py-3 rounded-xl border border-stone-200 outline-none text-sm font-semibold text-stone-900"
          >
            <option value="">Filter by Section...</option>
            {["A", "B", "C", "D"].map((sec) => (
              <option key={sec} value={sec}>
                Section {sec}
              </option>
            ))}
          </select>

          <select
            value={centerFilter}
            onChange={(e) => setCenterFilter(e.target.value)}
            className="w-full bg-stone-50 px-4 py-3 rounded-xl border border-stone-200 outline-none text-sm font-semibold text-stone-900"
          >
            <option value="">Filter by School Name (Temple Name)...</option>
            {centers.map((c) => (
              <option key={c._id} value={c.name}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        {/* Table & Mobile view */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="animate-spin text-orange-600 mb-4" size={48} />
            <p className="text-stone-400 font-bold uppercase text-[10px] tracking-widest">
              Loading student directory...
            </p>
          </div>
        ) : filteredStudents.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-[2rem] border border-stone-200">
            <User size={48} className="mx-auto text-stone-200 mb-4" />
            <p className="text-stone-400 font-bold italic text-sm">
              No students found matching filters.
            </p>
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden lg:block bg-white rounded-[2rem] border border-stone-200 shadow-sm overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-stone-50 border-b border-stone-100">
                  <tr>
                    <th className="px-5 py-5 text-[10px] font-black text-stone-400 uppercase tracking-widest">
                      Student details
                    </th>
                    <th className="px-5 py-5 text-[10px] font-black text-stone-400 uppercase tracking-widest">
                      Email
                    </th>
                    <th className="px-5 py-5 text-[10px] font-black text-stone-400 uppercase tracking-widest">
                      Class & Section
                    </th>
                    <th className="px-5 py-5 text-[10px] font-black text-stone-400 uppercase tracking-widest">
                      School Name (Temple Name)
                    </th>
                    <th className="px-5 py-5 text-[10px] font-black text-stone-400 uppercase tracking-widest">
                      Mobile & Payment
                    </th>
                    <th className="px-5 py-5 text-[10px] font-black text-stone-400 uppercase tracking-widest">
                      Address & Location
                    </th>
                    <th className="px-5 py-5 text-[10px] font-black text-stone-400 uppercase tracking-widest text-right">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {filteredStudents.map((stu) => (
                    <tr key={stu._id} className="hover:bg-stone-50/50 transition-colors">
                      <td className="px-5 py-5">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center font-bold shrink-0">
                            {stu.name?.slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-bold text-stone-800 text-sm leading-tight whitespace-nowrap">
                              {stu.name}
                            </p>
                            <div className="flex flex-col gap-0.5 text-[9px] font-black uppercase mt-1 leading-normal">
                              <p className="text-indigo-600 font-mono whitespace-nowrap">ID: {stu.studentId || "TBA"}</p>
                              <p className="text-orange-600 font-mono whitespace-nowrap">Roll: {stu.rollNumber || "TBA"}</p>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-5 text-xs text-stone-600 font-semibold lowercase select-all">
                        {stu.email || "no-email@configured.com"}
                      </td>
                      <td className="px-5 py-5 text-sm font-semibold text-stone-700">
                        <span className="whitespace-nowrap">{stu.studentClass} • Sec {stu.section || "A"}</span>
                      </td>
                      <td className="px-5 py-5 text-sm font-semibold text-stone-600">
                        {stu.templeName}
                      </td>
                      <td className="px-5 py-5">
                        <div className="space-y-1">
                          <p className="text-stone-850 font-bold text-xs">{stu.phone}</p>
                          <div className="flex flex-col gap-0.5">
                            {stu.paymentId && (
                              <span className="text-[9px] text-stone-400 font-black uppercase leading-none">
                                Pay ID: <span className="font-mono text-stone-600 select-all normal-case">{stu.paymentId}</span>
                              </span>
                            )}
                            <span className={`text-[9px] font-bold w-fit px-1.5 py-0.5 rounded leading-none ${stu.paid ? "bg-green-50 text-green-700 border border-green-100" : "bg-red-50 text-red-655 border border-red-100"}`}>
                              {stu.paid ? `Paid ₹${stu.amount || 500}` : "Unpaid"}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-5">
                        <div className="max-w-[200px] space-y-1">
                          <p className="text-stone-700 text-xs font-semibold truncate" title={stu.address}>
                            {stu.address || "No Address"}
                          </p>
                          <p className="text-[10px] text-stone-400 font-bold uppercase tracking-wider leading-none">
                            {stu.city && `${stu.city}, `}{stu.state}{stu.pincode && ` - ${stu.pincode}`}
                          </p>
                        </div>
                      </td>
                      <td className="px-5 py-5 text-right">
                        <div className="flex justify-end gap-3">
                          <button
                            onClick={() => handleOpenEditModal(stu)}
                            title="Edit Student"
                            className="p-2.5 text-orange-600 hover:text-orange-850 bg-orange-50 hover:bg-orange-100/60 rounded-xl transition flex items-center justify-center border border-orange-100"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            onClick={() => handleDeleteStudent(stu._id)}
                            title="Delete Student"
                            className="p-2.5 text-red-600 hover:text-red-850 bg-red-50 hover:bg-red-100/60 rounded-xl transition flex items-center justify-center border border-red-100"
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

            {/* Mobile Cards View */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:hidden">
              {filteredStudents.map((stu) => (
                <div key={stu._id} className="bg-white p-6 rounded-3xl border border-stone-200 shadow-sm space-y-4">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center font-bold">
                        {stu.name?.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <h4 className="font-bold text-stone-900">{stu.name}</h4>
                        <p className="text-[10px] font-black uppercase text-stone-400">
                          ID: {stu.studentId || "TBA"}
                        </p>
                        <p className="text-[9px] text-stone-500 font-semibold lowercase">
                          {stu.email || "No Email"}
                        </p>
                      </div>
                    </div>
                    <span className="bg-indigo-50 text-indigo-700 text-[9px] font-black uppercase px-2.5 py-1 rounded-full">
                      Roll: {stu.rollNumber || "TBA"}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs border-t border-b border-stone-100 py-3 font-semibold text-stone-600">
                    <div>
                      <p className="text-[9px] text-stone-400 uppercase font-black">Class</p>
                      <p>{stu.studentClass} ({stu.section})</p>
                    </div>
                    <div>
                      <p className="text-[9px] text-stone-400 uppercase font-black">School Name (Temple Name)</p>
                      <p className="truncate">{stu.templeName}</p>
                    </div>
                    <div>
                      <p className="text-[9px] text-stone-400 uppercase font-black">Mobile</p>
                      <p>{stu.phone}</p>
                    </div>
                    <div>
                      <p className="text-[9px] text-stone-400 uppercase font-black">Payment</p>
                      <p className={stu.paid ? "text-green-600 font-bold" : "text-red-500 font-bold"}>
                        {stu.paid ? `Paid (₹${stu.amount || 500})` : "Unpaid"}
                      </p>
                    </div>
                    {stu.paymentId && (
                      <div className="col-span-2">
                        <p className="text-[9px] text-stone-400 uppercase font-black">Payment ID</p>
                        <p className="font-mono text-[11px] select-all">{stu.paymentId}</p>
                      </div>
                    )}
                    <div className="col-span-2">
                      <p className="text-[9px] text-stone-400 uppercase font-black">Address & Location</p>
                      <p className="text-stone-700 font-medium leading-relaxed">{stu.address || "No Address"}</p>
                      <p className="text-[10px] text-stone-400 uppercase tracking-wider mt-0.5">
                        {stu.city && `${stu.city}, `}{stu.state}{stu.pincode && ` - ${stu.pincode}`}
                      </p>
                    </div>
                  </div>

                  <div className="flex justify-end gap-3 pt-2">
                    <button
                      onClick={() => handleOpenEditModal(stu)}
                      className="px-5 py-2.5 bg-orange-50 hover:bg-orange-100/60 text-orange-600 rounded-2xl font-black text-xs uppercase tracking-widest transition flex items-center gap-1.5 border border-orange-100"
                    >
                      <Edit2 size={14} /> Edit
                    </button>
                    <button
                      onClick={() => handleDeleteStudent(stu._id)}
                      className="px-5 py-2.5 bg-red-50 hover:bg-red-100/60 text-red-600 rounded-2xl font-black text-xs uppercase tracking-widest transition flex items-center gap-1.5 border border-red-100"
                    >
                      <Trash2 size={14} /> Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </main>

      {/* Add / Edit Student Modal */}
      {isAddEditModalOpen && (
        <div className="fixed inset-0 bg-stone-900/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-[2.5rem] shadow-2xl border border-stone-100 w-full max-w-2xl max-h-[90vh] overflow-y-auto p-8 sm:p-12 animate-in fade-in duration-300">
            <h3 className="text-2xl font-black text-stone-900 uppercase tracking-tight mb-8">
              Edit Student Details
            </h3>

            <form onSubmit={handleSaveStudent} className="space-y-6">
              {/* Row 1: Name, Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-stone-500 uppercase ml-1">
                    Student Full Name *
                  </label>
                  <input
                    required
                    type="text"
                    className="w-full px-5 py-3.5 bg-stone-50 border border-stone-200 rounded-xl outline-none focus:ring-2 focus:ring-amber-500 text-stone-900 font-semibold text-sm transition shadow-sm"
                    placeholder="Enter full name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black text-stone-500 uppercase ml-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    className="w-full px-5 py-3.5 bg-stone-50 border border-stone-200 rounded-xl outline-none focus:ring-2 focus:ring-amber-500 text-stone-900 font-semibold text-sm transition shadow-sm"
                    placeholder="email@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              {/* Row 2: Phone, Password */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-stone-500 uppercase ml-1">
                    Mobile Number (10 Digits) *
                  </label>
                  <input
                    required
                    maxLength={10}
                    type="tel"
                    className="w-full px-5 py-3.5 bg-stone-50 border border-stone-200 rounded-xl outline-none focus:ring-2 focus:ring-amber-500 text-stone-900 font-semibold text-sm transition shadow-sm"
                    placeholder="10 digit mobile"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black text-stone-500 uppercase ml-1">
                    {editingStudent ? "Reset Password (Optional)" : "Login Password *"}
                  </label>
                  <input
                    required={!editingStudent}
                    type="text"
                    className="w-full px-5 py-3.5 bg-stone-50 border border-stone-200 rounded-xl outline-none focus:ring-2 focus:ring-amber-500 text-stone-900 font-semibold text-sm transition shadow-sm"
                    placeholder={editingStudent ? "Leave blank to keep same" : "Temporary password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              </div>

              {/* Row 3: Class, Section, Center */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-stone-500 uppercase ml-1">
                    Class *
                  </label>
                  <select
                    value={studentClass}
                    onChange={(e) => setStudentClass(e.target.value)}
                    className="w-full px-5 py-3.5 bg-stone-50 border border-stone-200 rounded-xl outline-none focus:ring-2 focus:ring-amber-500 text-stone-900 font-semibold text-sm shadow-sm"
                  >
                    {classesList.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black text-stone-500 uppercase ml-1">
                    Section *
                  </label>
                  <select
                    value={section}
                    onChange={(e) => setSection(e.target.value)}
                    className="w-full px-5 py-3.5 bg-stone-50 border border-stone-200 rounded-xl outline-none focus:ring-2 focus:ring-amber-500 text-stone-900 font-semibold text-sm shadow-sm"
                  >
                    {["A", "B", "C", "D"].map((s) => (
                      <option key={s} value={s}>
                        Section {s}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black text-stone-500 uppercase ml-1">
                    School Name (Temple Name) *
                  </label>
                  <select
                    value={templeName}
                    onChange={(e) => setTempleName(e.target.value)}
                    className="w-full px-5 py-3.5 bg-stone-50 border border-stone-200 rounded-xl outline-none focus:ring-2 focus:ring-amber-500 text-stone-900 font-semibold text-sm shadow-sm"
                  >
                    {centers.map((c) => (
                      <option key={c._id} value={c.name}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Row 4: Address */}
              <div className="space-y-1">
                <label className="text-[10px] font-black text-stone-500 uppercase ml-1">
                  Full Address
                </label>
                <textarea
                  rows={2}
                  className="w-full px-5 py-3 bg-stone-50 border border-stone-200 rounded-xl outline-none focus:ring-2 focus:ring-amber-500 text-stone-900 font-semibold text-sm transition shadow-sm resize-none"
                  placeholder="Street address, house no."
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                />
              </div>

              {/* Row 5: City, State, Pincode */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-stone-500 uppercase ml-1">
                    City
                  </label>
                  <input
                    type="text"
                    className="w-full px-5 py-3.5 bg-stone-50 border border-stone-200 rounded-xl outline-none focus:ring-2 focus:ring-amber-500 text-stone-900 font-semibold text-sm transition shadow-sm"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black text-stone-500 uppercase ml-1">
                    State
                  </label>
                  <input
                    type="text"
                    className="w-full px-5 py-3.5 bg-stone-50 border border-stone-200 rounded-xl outline-none focus:ring-2 focus:ring-amber-500 text-stone-900 font-semibold text-sm transition shadow-sm"
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black text-stone-500 uppercase ml-1">
                    Pincode
                  </label>
                  <input
                    maxLength={6}
                    type="text"
                    className="w-full px-5 py-3.5 bg-stone-50 border border-stone-200 rounded-xl outline-none focus:ring-2 focus:ring-amber-500 text-stone-900 font-semibold text-sm transition shadow-sm"
                    value={pincode}
                    onChange={(e) => setPincode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  />
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
                  Save Changes
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
                Registration Successful!
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
                  <p className="text-[10px] font-black text-stone-400 uppercase tracking-widest mb-1">Login ID / Username</p>
                  <div className="flex items-center justify-between bg-white px-4 py-3 border border-stone-200 rounded-xl">
                    <span className="font-mono text-sm font-bold text-stone-900 select-all">{createdCredentials.username}</span>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(createdCredentials.username, "Username")}
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
                  printCredentials({
                    name: createdCredentials.name,
                    studentId: createdCredentials.username,
                    password: createdCredentials.password,
                    studentClass: studentClass,
                    section: section,
                    templeName: templeName,
                  });
                }}
                className="flex-1 py-3.5 bg-stone-100 text-stone-700 hover:bg-stone-200 rounded-2xl font-black text-xs uppercase tracking-widest transition flex items-center justify-center gap-1.5"
              >
                <Printer size={16} /> Print Slip
              </button>
              <button
                type="button"
                onClick={() => {
                  copyToClipboard(`Login ID: ${createdCredentials.username}\nPassword: ${createdCredentials.password}`, "All credentials");
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
