"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Calendar,
  MapPin,
  Save,
  GraduationCap,
  UploadCloud,
  FileText,
  X,
  Sparkles,
  CheckCircle,
} from "lucide-react";
import StatusModal from "@/components/StatusModal";

export default function AddClassPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [grade, setGrade] = useState("");
  const [examVenue, setExamVenue] = useState("");
  const [examDate, setExamDate] = useState("");
  const [examTime, setExamTime] = useState("");
  const [instructions, setInstructions] = useState("");
  const [isCompleted, setIsCompleted] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [adminClasses, setAdminClasses] = useState<any[]>([]);
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

  const existingClass = editingId
    ? adminClasses.find((c: any) => String(c._id || c.id) === String(editingId))
    : (grade ? adminClasses.find((c: any) => c.grade === grade) : null);

  const fetchClasses = async () => {
    try {
      const response = await fetch("/api/classes");
      const result = await response.json();
      if (result.success) {
        setAdminClasses(result.data);

        // Get the 'edit' ID from URL parameters
        const params = new URLSearchParams(window.location.search);
        const editId = params.get("edit");

        if (editId) {
          const classToEdit = result.data.find(
            (c: any) => String(c._id) === String(editId) || String(c.id) === String(editId)
          );

          if (classToEdit) {
            setEditingId(classToEdit._id || classToEdit.id);
            setGrade(classToEdit.grade || "");
            setExamVenue(classToEdit.examVenue || "");
            setExamDate(classToEdit.examDate || "");
            setExamTime(classToEdit.examTime || "");
            setInstructions(classToEdit.instructions || "");
            setIsCompleted(classToEdit.isCompleted || false);
          }
        }
      }
    } catch (error) {
      console.error("Error fetching classes:", error);
    }
  };

  useEffect(() => {
    fetchClasses();
  }, []);

  const classesList = Array.from({ length: 12 }, (_, i) => {
    const n = i + 1;
    const s = ["th", "st", "nd", "rd"],
      v = n % 100;
    const suffix = s[(v - 20) % 10] || s[v] || s[0];
    return `${n}${suffix} Class`;
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const convertFileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  };

  const handleSaveClassInfo = () => {
    if (!grade) {
      showModal("error", "Grade Missing", "Please enter Grade first!");
      return;
    }
    handleDeployData();
  };

  const handleDeployData = async () => {
    if (!grade) {
      showModal("error", "Selection Required", "Please select a Grade Level");
      return;
    }

    // Check if the class name already exists (excluding the one being edited)
    const isDuplicate = adminClasses.some(
      (c: any) => c.grade === grade && String(c._id || c.id) !== String(editingId)
    );

    if (isDuplicate) {
      showModal("error", "Duplicate Entry", `The ${grade} is already in the system.`);
      return;
    }

    let syllabusData = null;
    if (selectedFile) {
      if (selectedFile.size > 2 * 1024 * 1024) {
        showModal("error", "File Too Large", "Please upload a file smaller than 2MB.");
        return;
      }
      syllabusData = await convertFileToBase64(selectedFile);
    }

    showModal("loading", "Deploying...", "Synchronizing with community portal");

    const newClassData = {
      id: editingId,
      grade,
      examVenue: examVenue || "Not Assigned",
      examDate: examDate || "TBA",
      examTime: examTime || "TBA",
      instructions: instructions || "No specific instructions",
      status: "Active",
      students: existingClass?.students || 0,
      syllabus: syllabusData || existingClass?.syllabus || null,
      fileName: selectedFile
        ? selectedFile.name
        : existingClass?.fileName || null,
      isCompleted: isCompleted,
    };

    try {
      const response = await fetch("/api/classes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newClassData),
      });

      const result = await response.json();

      if (result.success) {
        showModal(
          "success",
          "Success!",
          editingId
            ? "Class Updated Successfully!"
            : "New Class Deployed Successfully!"
        );

        // Reset form to stay on the same page
        setTimeout(() => {
          setGrade("");
          setExamVenue("");
          setExamDate("");
          setExamTime("");
          setInstructions("");
          setEditingId(null);
          setSelectedFile(null);
          setIsCompleted(false);

          // Refresh classes list
          fetchClasses();

          // Clean URL without reload
          window.history.pushState({}, "", window.location.pathname);
        }, 2000);
      } else {
        showModal("error", "Save Failed", result.error);
      }
    } catch (error) {
      console.error("Error saving class:", error);
      showModal("error", "Connection Error", "Failed to connect to the server.");
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F7F5] font-sans pb-24">
      <nav className="bg-white border-b border-stone-300 sticky top-0 z-50 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 md:px-8 h-20 flex items-center justify-between">
          <Link
            href="/?view=admin&tab=classes"
            className="group flex items-center gap-3 text-stone-700 hover:text-orange-700 transition-all font-bold text-xs uppercase tracking-widest"
          >
            <div className="p-2.5 bg-stone-100 group-hover:bg-orange-100 rounded-2xl transition-colors border border-stone-200">
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
                {editingId ? "EDIT" : <Sparkles size={14} />}
              </span>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-4 md:px-6 pt-8 md:pt-12">
        <div className="mb-10 md:mb-12">
          <h1 className="text-4xl md:text-6xl font-black text-stone-900 tracking-tighter italic">
            {editingId ? "Update" : "Management"}{" "}
            <span className="text-orange-600 not-italic">Portal</span>
          </h1>
          <p className="mt-4 text-stone-800 font-bold text-xs uppercase tracking-widest">
            {editingId
              ? `Editing details for ${grade}`
              : "Control Center: Update Class & Exam Data (1st to 12th)"}
          </p>
        </div>

        <div className="space-y-12">
          {/* --- SECTION 1: CLASS DETAILS --- */}
          <section className="bg-white rounded-[2rem] md:rounded-[3rem] p-6 md:p-12 shadow-md border border-stone-200">
            <div className="flex items-center gap-4 md:gap-6 mb-8 md:mb-10">
              <div className="w-12 h-12 md:w-14 md:h-14 bg-orange-600 text-white rounded-2xl flex items-center justify-center shadow-lg">
                <GraduationCap size={28} />
              </div>
              <h2 className="text-2xl md:text-3xl font-black text-stone-900 uppercase tracking-tight">
                Class Information
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="flex flex-col gap-3 md:col-span-2">
                <label className="text-xs font-black text-stone-900 uppercase tracking-widest ml-2">
                  Grade Level
                </label>
                <select
                  value={grade}
                  onChange={(e) => {
                    const selectedGrade = e.target.value;
                    setGrade(selectedGrade);
                    // English Comment: Automatically load data if class exists
                    const existing = adminClasses.find(c => c.grade === selectedGrade);
                    if (existing && (existing._id || existing.id)) {
                      setEditingId(existing._id || existing.id);
                      setExamVenue(existing.examVenue || "");
                      setExamDate(existing.examDate || "");
                      setExamTime(existing.examTime || "");
                      setInstructions(existing.instructions || "");
                      setIsCompleted(existing.isCompleted || false);
                    } else {
                      setEditingId(null);
                      setExamVenue("");
                      setExamDate("");
                      setExamTime("");
                      setInstructions("");
                      setIsCompleted(false);
                    }
                  }}
                  className="w-full bg-stone-50 px-6 py-4 md:px-8 md:py-5 rounded-2xl border-2 border-stone-300 outline-none text-base font-bold text-stone-900"
                >
                  <option value="">Choose Class...</option>
                  {classesList.map((c) => (
                    <option key={c} value={c}>
                      {c.toUpperCase()}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-3 p-4 bg-stone-50 rounded-2xl border-2 border-stone-300">
                <input
                  type="checkbox"
                  id="isCompleted"
                  checked={isCompleted}
                  onChange={(e) => setIsCompleted(e.target.checked)}
                  className="w-5 h-5 accent-orange-600"
                />
                <label htmlFor="isCompleted" className="text-sm font-black text-stone-700 uppercase tracking-widest cursor-pointer">
                  Mark as Completed
                </label>
              </div>

              <div className="md:col-span-2 flex flex-col gap-3">
                <label className="text-xs font-black text-stone-900 uppercase tracking-widest ml-2">
                  Syllabus Material
                </label>
                <input
                  type="file"
                  id="syllabus"
                  className="hidden"
                  onChange={handleFileChange}
                  accept="application/pdf,image/*"
                />
                <label
                  htmlFor="syllabus"
                  className="flex flex-col items-center justify-center w-full py-10 bg-stone-100 border-2 border-dashed border-stone-400 rounded-[2.5rem] cursor-pointer hover:bg-orange-50 transition-all"
                >
                  {!selectedFile ? (
                    <div className="flex flex-col items-center gap-2">
                      {existingClass?.syllabus && (
                        <div className="flex items-center gap-2 text-green-600 bg-green-50 px-3 py-1 rounded-full mb-2 border border-green-100 italic">
                          <CheckCircle size={14} />
                          <span className="text-[9px] font-black uppercase tracking-tighter">Syllabus Already Uploaded</span>
                        </div>
                      )}
                      <UploadCloud size={30} className="text-stone-700" />
                      <p className="text-[10px] font-black uppercase tracking-widest">
                        {editingId
                          ? "Upload New File (Optional)"
                          : "Upload PDF/Image"}
                      </p>
                    </div>
                  ) : (
                    <div className="flex items-center gap-4 bg-white p-4 rounded-xl shadow-sm border border-stone-200">
                      <FileText className="text-orange-600" size={24} />
                      <span className="text-sm font-bold text-stone-900">
                        {selectedFile.name}
                      </span>
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          setSelectedFile(null);
                        }}
                        className="text-red-500 p-1"
                      >
                        <X size={18} />
                      </button>
                    </div>
                  )}
                </label>
              </div>
            </div>

            <button
              onClick={handleSaveClassInfo}
              className="mt-8 flex items-center gap-2 text-orange-600 font-black text-xs uppercase tracking-widest hover:bg-orange-50 px-6 py-3 rounded-xl border-2 border-orange-100 transition-all"
            >
              <CheckCircle size={16} /> Save Class Draft
            </button>
          </section>

          {/* --- SECTION 2: EXAM DETAILS --- */}
          <section className="bg-white rounded-[2rem] md:rounded-[3rem] p-6 md:p-12 shadow-md border border-stone-200">
            <div className="flex items-center gap-4 md:gap-6 mb-8 md:mb-10">
              <div className="w-12 h-12 md:w-14 md:h-14 bg-stone-900 text-white rounded-2xl flex items-center justify-center shadow-lg">
                <Calendar size={28} />
              </div>
              <h2 className="text-2xl md:text-3xl font-black text-stone-900 uppercase tracking-tight">
                Exam Schedule
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="md:col-span-2 flex flex-col gap-3">
                <label className="text-xs font-black text-stone-900 uppercase tracking-widest ml-2">
                  Exam Center Venue
                </label>
                <div className="relative">
                  <MapPin
                    className="absolute left-6 top-5 text-orange-600"
                    size={20}
                  />
                  <input
                    value={examVenue}
                    onChange={(e) => setExamVenue(e.target.value)}
                    className="w-full bg-stone-50 pl-16 pr-6 py-4 md:pr-8 md:py-5 rounded-2xl border-2 border-stone-300 outline-none text-base font-bold text-stone-900 placeholder:text-stone-400"
                    placeholder="LOCATION ADDRESS"
                  />
                </div>
              </div>
              <div className="flex flex-col gap-3">
                <label className="text-xs font-black text-stone-900 uppercase tracking-widest ml-2">
                  Exam Date
                </label>
                <input
                  type="date"
                  value={examDate}
                  onChange={(e) => setExamDate(e.target.value)}
                  className="w-full bg-stone-50 px-6 py-4 md:px-8 md:py-5 rounded-2xl border-2 border-stone-300 outline-none text-base font-bold text-stone-900"
                />
              </div>
              <div className="flex flex-col gap-3">
                <label className="text-xs font-black text-stone-900 uppercase tracking-widest ml-2">
                  Exam Time
                </label>
                <input
                  type="time"
                  value={examTime}
                  onChange={(e) => setExamTime(e.target.value)}
                  className="w-full bg-stone-50 px-6 py-4 md:px-8 md:py-5 rounded-2xl border-2 border-stone-300 outline-none text-base font-bold text-stone-900"
                />
              </div>
              <div className="md:col-span-2 flex flex-col gap-3">
                <label className="text-xs font-black text-stone-900 uppercase tracking-widest ml-2">
                  Instructions
                </label>
                <textarea
                  rows={3}
                  value={instructions}
                  onChange={(e) => setInstructions(e.target.value)}
                  className="w-full bg-stone-50 px-8 py-6 rounded-2xl border-2 border-stone-300 outline-none text-base font-bold text-stone-900 resize-none"
                  placeholder="ADDITIONAL NOTES..."
                ></textarea>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 mt-10">
              <button
                onClick={handleDeployData}
                className="flex-1 bg-orange-600 text-white py-5 md:py-6 rounded-2xl font-black text-sm uppercase tracking-[0.2em] flex items-center justify-center gap-3 hover:bg-orange-700 transition-all shadow-lg active:scale-95"
              >
                <Save size={20} />{" "}
                {editingId
                  ? "Update Class Data"
                  : "Deploy to Dashboard"}
              </button>

              {editingId && (
                <button
                  onClick={() => {
                    setEditingId(null);
                    setGrade("");
                    setExamVenue("");
                    setExamDate("");
                    setExamTime("");
                    setInstructions("");
                    setIsCompleted(false);
                    window.history.pushState({}, "", window.location.pathname);
                  }}
                  className="px-8 py-5 md:py-6 bg-stone-100 text-stone-600 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-stone-200 transition-all flex items-center justify-center gap-2"
                >
                  <X size={18} /> Cancel Edit
                </button>
              )}
            </div>
          </section>
        </div>
        {/* ========================================================== */}
        {/*         CLASS MANAGEMENT SECTION (NEW TABLE) */}
        {/* ========================================================== */}

        <div className="mt-12 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-2xl font-black text-stone-900 uppercase tracking-tight">
                Class & Exam Directory
              </h3>
              <p className="text-sm text-stone-500">
                Manage syllabus, exam dates, and class settings for 1st to 12th standard.
              </p>
            </div>
          </div>

          <div className="bg-white rounded-[1.5rem] md:rounded-[2rem] shadow-sm border border-stone-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left min-w-[600px]">
                <thead className="bg-stone-50 border-b border-stone-100">
                  <tr>
                    <th className="px-8 py-5 text-[10px] font-black text-stone-400 uppercase tracking-widest">
                      Class / Grade
                    </th>
                    <th className="px-8 py-5 text-[10px] font-black text-stone-400 uppercase tracking-widest">
                      Syllabus Status
                    </th>
                    <th className="px-8 py-5 text-[10px] font-black text-stone-400 uppercase tracking-widest">
                      Exam Schedule
                    </th>
                    <th className="px-8 py-5 text-[10px] font-black text-stone-400 uppercase tracking-widest text-right">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {adminClasses.map((cls: any) => (
                    <tr
                      key={cls._id || cls.id || cls.grade}
                      className="hover:bg-stone-50 transition-colors"
                    >
                      <td className="px-8 py-5 text-sm font-bold text-stone-800">
                        <div className="flex flex-col">
                          <span>{cls.grade}</span>
                          {cls.isCompleted && (
                            <span className="text-[8px] text-red-500 font-black uppercase tracking-tighter">
                              Duration Complete
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-8 py-5">
                        <span
                          className={`text-[10px] font-black px-3 py-1 rounded-full uppercase ${cls.syllabus ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"}`}
                        >
                          {cls.syllabus ? "Uploaded" : "Pending"}
                        </span>
                      </td>
                      <td className="px-8 py-5 text-xs text-stone-600 font-medium">
                        {cls.examDate} at {cls.examTime}
                      </td>
                      <td className="px-8 py-5 text-right">
                        <button
                          onClick={() => {
                            setEditingId(cls._id || cls.id);
                            setGrade(cls.grade || "");
                            setExamVenue(cls.examVenue || "");
                            setExamDate(cls.examDate || "");
                            setExamTime(cls.examTime || "");
                            setInstructions(cls.instructions || "");
                            setIsCompleted(cls.isCompleted || false);
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                          }}
                          className="text-stone-400 hover:text-orange-600 transition-colors"
                        >
                          Edit
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* ========================================================== */}
      </main>
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
