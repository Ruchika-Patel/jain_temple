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
  const [syllabi, setSyllabi] = useState<any[]>([]);
  const [grade, setGrade] = useState("");
  const [examVenue, setExamVenue] = useState("");
  const [examDate, setExamDate] = useState("");
  const [examTime, setExamTime] = useState("");
  const [instructions, setInstructions] = useState("");
  const [isCompleted, setIsCompleted] = useState(false);
  const [subjects, setSubjects] = useState("");
  const [sections, setSections] = useState<string[]>(["A", "B", "C"]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [adminClasses, setAdminClasses] = useState<any[]>([]);
  const [temples, setTemples] = useState<any[]>([]);
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
            setSubjects(classToEdit.subjects ? classToEdit.subjects.join(", ") : "");
            setSections(classToEdit.sections || ["A", "B", "C"]);
            setSyllabi(classToEdit.syllabi || []);
          }
        }
      }
    } catch (error) {
      console.error("Error fetching classes:", error);
    }
  };

  const fetchTemples = async () => {
    try {
      const res = await fetch("/api/temples");
      const data = await res.json();
      if (data.success) {
        const verified = data.data.filter((t: any) => t.status === "verified");
        setTemples(verified);
      }
    } catch (err) {
      console.error("Error fetching temples:", err);
    }
  };

  useEffect(() => {
    fetchClasses();
    fetchTemples();
  }, []);

  const classesList = Array.from({ length: 12 }, (_, i) => {
    const n = i + 1;
    const s = ["th", "st", "nd", "rd"],
      v = n % 100;
    const suffix = s[(v - 20) % 10] || s[v] || s[0];
    return `${n}${suffix} Class`;
  });

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const filesArray = Array.from(e.target.files);
      const newSyllabi = [...syllabi];

      for (const file of filesArray) {
        if (file.size > 2 * 1024 * 1024) {
          showModal("error", "File Too Large", `File "${file.name}" is larger than 2MB limit.`);
          continue;
        }
        try {
          const fileData = await convertFileToBase64(file);
          newSyllabi.push({
            fileName: file.name,
            fileData: fileData,
            uploadedAt: new Date().toISOString(),
          });
        } catch (err) {
          console.error("Error converting file:", err);
        }
      }
      setSyllabi(newSyllabi);
      e.target.value = "";
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

    showModal("loading", "Deploying...", "Synchronizing with community portal");

    const newClassData = {
      id: editingId,
      grade,
      subjects: subjects.split(",").map(s => s.trim()).filter(s => s !== ""),
      sections,
      examVenue: examVenue || "Not Assigned",
      examDate: examDate || "TBA",
      examTime: examTime || "TBA",
      instructions: instructions || "No specific instructions",
      status: "Active",
      students: existingClass?.students || 0,
      syllabus: syllabi[0]?.fileData || null,
      fileName: syllabi[0]?.fileName || null,
      syllabi: syllabi,
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
          setSubjects("");
          setSections(["A", "B", "C"]);
          setEditingId(null);
          setSyllabi([]);
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
                      setSubjects(existing.subjects ? existing.subjects.join(", ") : "");
                      setSections(existing.sections || ["A", "B", "C"]);
                      setSyllabi(existing.syllabi || []);
                    } else {
                      setEditingId(null);
                      setExamVenue("");
                      setExamDate("");
                      setExamTime("");
                      setInstructions("");
                      setIsCompleted(false);
                      setSubjects("");
                      setSections(["A", "B", "C"]);
                      setSyllabi([]);
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

              <div className="flex flex-col gap-3 md:col-span-2">
                <label className="text-xs font-black text-stone-900 uppercase tracking-widest ml-2">
                  Class Subjects (comma-separated)
                </label>
                <input
                  type="text"
                  value={subjects}
                  onChange={(e) => setSubjects(e.target.value)}
                  className="w-full bg-stone-50 px-6 py-4 md:px-8 md:py-5 rounded-2xl border-2 border-stone-300 outline-none text-base font-bold text-stone-900 placeholder:text-stone-400"
                  placeholder="e.g. Mathematics, Science, English, Social Studies"
                />
              </div>

              <div className="flex flex-col gap-3 md:col-span-2">
                <label className="text-xs font-black text-stone-900 uppercase tracking-widest ml-2">
                  Exam Venue (School / Temple Name)
                </label>
                <select
                  value={examVenue}
                  onChange={(e) => setExamVenue(e.target.value)}
                  className="w-full bg-stone-50 px-6 py-4 md:px-8 md:py-5 rounded-2xl border-2 border-stone-300 outline-none text-base font-bold text-stone-900"
                >
                  <option value="Not Assigned">Not Assigned</option>
                  <option value="Online Portal">Online Portal</option>
                  {temples.map((t) => (
                    <option key={t._id || t.id} value={t.name}>
                      {t.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-3 md:col-span-2">
                <label className="text-xs font-black text-stone-900 uppercase tracking-widest ml-2">
                  Available Sections
                </label>
                <div className="flex flex-wrap gap-3">
                  {["A", "B", "C", "D"].map((sec) => (
                    <label key={sec} className="flex items-center gap-2 cursor-pointer font-bold text-sm text-stone-700 bg-stone-50 px-4 py-2 rounded-xl border border-stone-300 select-none">
                      <input
                        type="checkbox"
                        checked={sections.includes(sec)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSections([...sections, sec]);
                          } else {
                            setSections(sections.filter((s) => s !== sec));
                          }
                        }}
                        className="w-4 h-4 accent-orange-600"
                      />
                      Section {sec}
                    </label>
                  ))}
                </div>
              </div>

              <div className="md:col-span-2 flex flex-col gap-3">
                <label className="text-xs font-black text-stone-900 uppercase tracking-widest ml-2">
                  Syllabus Materials
                </label>
                <input
                  type="file"
                  id="syllabus"
                  className="hidden"
                  onChange={handleFileChange}
                  accept="application/pdf,image/*"
                  multiple
                />
                <label
                  htmlFor="syllabus"
                  className="flex flex-col items-center justify-center w-full py-10 bg-stone-100 border-2 border-dashed border-stone-400 rounded-[2.5rem] cursor-pointer hover:bg-orange-50 transition-all animate-in fade-in duration-300"
                >
                  <div className="flex flex-col items-center gap-2">
                    <UploadCloud size={30} className="text-stone-700 animate-bounce" />
                    <p className="text-[10px] font-black uppercase tracking-widest">
                      Upload PDF/Image Files
                    </p>
                    <p className="text-[8px] text-stone-400 font-bold uppercase tracking-wider">
                      (You can select multiple files, max 2MB each)
                    </p>
                  </div>
                </label>

                {/* Uploaded Files List */}
                {syllabi.length > 0 && (
                  <div className="mt-4 space-y-2">
                    <p className="text-[10px] font-black text-stone-400 uppercase tracking-widest ml-2">
                      Uploaded Files ({syllabi.length})
                    </p>
                    <div className="space-y-2 max-h-[220px] overflow-y-auto bg-stone-50 p-4 rounded-3xl border border-stone-200">
                      {syllabi.map((file, idx) => (
                        <div key={idx} className="flex items-center justify-between bg-white p-3 rounded-xl border border-stone-200 shadow-sm animate-in slide-in-from-bottom-2">
                          <div className="flex items-center gap-3 overflow-hidden">
                            <FileText className="text-orange-600 shrink-0" size={18} />
                            <span className="text-xs font-bold text-stone-800 truncate max-w-[200px] sm:max-w-md">
                              {file.fileName}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <button
                              type="button"
                              onClick={() => {
                                const newWindow = window.open();
                                newWindow?.document.write(
                                  `<iframe src="${file.fileData}" frameborder="0" style="border:0; top:0px; left:0px; bottom:0px; right:0px; width:100%; height:100%;" allowfullscreen></iframe>`
                                );
                              }}
                              className="text-[10px] bg-stone-100 hover:bg-orange-100 hover:text-orange-700 text-stone-600 px-3 py-1.5 rounded-lg font-black uppercase tracking-wider transition-colors"
                            >
                              View
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                if (window.confirm(`Delete "${file.fileName}"?`)) {
                                  setSyllabi(syllabi.filter((_, i) => i !== idx));
                                }
                              }}
                              className="text-[10px] bg-red-50 hover:bg-red-500 hover:text-white text-red-500 px-3 py-1.5 rounded-lg font-black uppercase tracking-wider transition-colors"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
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
                    setSubjects("");
                    setSections(["A", "B", "C"]);
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
                      Subjects
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
                          className={`text-[10px] font-black px-3 py-1 rounded-full uppercase ${cls.syllabi && cls.syllabi.length > 0 ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"}`}
                        >
                          {cls.syllabi && cls.syllabi.length > 0 ? `${cls.syllabi.length} Files` : "Pending"}
                        </span>
                      </td>
                      <td className="px-8 py-5 text-xs text-stone-600 font-semibold truncate max-w-[240px]">
                        {cls.subjects && cls.subjects.length > 0 ? cls.subjects.join(", ") : "No Subjects"}
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
                            setSubjects(cls.subjects ? cls.subjects.join(", ") : "");
                            setSections(cls.sections || ["A", "B", "C"]);
                            setSyllabi(cls.syllabi || []);
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
