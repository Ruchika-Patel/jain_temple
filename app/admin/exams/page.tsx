"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  PlusCircle,
  Edit2,
  Trash2,
  Calendar,
  Clock,
  BookOpen,
  HelpCircle,
  Loader2,
  CheckCircle,
  Plus,
  Trash,
  MapPin,
} from "lucide-react";
import StatusModal from "@/components/StatusModal";

interface Question {
  _id?: string;
  questionText: string;
  questionType: "objective" | "subjective";
  options: string[];
  correctOptionIndex: number;
  correctAnswerText?: string;
  marks: number;
}

export default function AdminExamsPage() {
  const [exams, setExams] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal States
  const [isAddEditModalOpen, setIsAddEditModalOpen] = useState(false);
  const [editingExam, setEditingExam] = useState<any | null>(null);
  const [formLoading, setFormLoading] = useState(false);

  // Form Fields
  const [grade, setGrade] = useState("1st Class");
  const [subject, setSubject] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [duration, setDuration] = useState(60);
  const [examType, setExamType] = useState<"online" | "offline">("online");
  const [negativeMarking, setNegativeMarking] = useState(false);
  const [negativeMarks, setNegativeMarks] = useState(0.25);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [venue, setVenue] = useState("Not Assigned");
  const [temples, setTemples] = useState<any[]>([]);

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

  const fetchExams = async () => {
    try {
      const res = await fetch("/api/admin/exams");
      const data = await res.json();
      if (data.success) {
        setExams(data.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchClasses = async () => {
    try {
      const res = await fetch("/api/classes");
      const data = await res.json();
      if (data.success) {
        setClasses(data.data);
      }
    } catch (err) {
      console.error(err);
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
      console.error(err);
    }
  };

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await Promise.all([fetchExams(), fetchClasses(), fetchTemples()]);
      setLoading(false);
    };
    init();
  }, []);

  // Get subjects list for currently selected grade
  const selectedClassSubjects = classes.find((c) => c.grade === grade)?.subjects || [];

  useEffect(() => {
    if (selectedClassSubjects.length > 0 && !editingExam) {
      setSubject(selectedClassSubjects[0]);
    } else if (!editingExam) {
      setSubject("");
    }
  }, [grade, classes]);

  const handleOpenAddModal = () => {
    setEditingExam(null);
    setGrade("1st Class");
    const firstClassSubjects = classes.find((c) => c.grade === "1st Class")?.subjects || [];
    setSubject(firstClassSubjects[0] || "");
    setDate("");
    setTime("");
    setDuration(60);
    setExamType("online");
    setNegativeMarking(false);
    setNegativeMarks(0.25);
    setQuestions([]);
    setVenue("Not Assigned");
    setIsAddEditModalOpen(true);
  };

  const handleOpenEditModal = (exam: any) => {
    setEditingExam(exam);
    setGrade(exam.grade || "1st Class");
    setSubject(exam.subject || "");
    setDate(exam.date || "");
    setTime(exam.time || "");
    setDuration(exam.duration || 60);
    setExamType(exam.examType || "online");
    setNegativeMarking(exam.negativeMarking || false);
    setNegativeMarks(exam.negativeMarks || 0.25);
    setVenue(exam.venue || "Not Assigned");
    setQuestions(
      (exam.questions || []).map((q: any) => ({
        ...q,
        marks: q.marks || 1,
      }))
    );
    setIsAddEditModalOpen(true);
  };

  const handleAddQuestion = () => {
    const newQ: Question = {
      questionText: "",
      questionType: "objective",
      options: ["", "", "", ""],
      correctOptionIndex: 0,
      marks: 1,
    };
    setQuestions([...questions, newQ]);
  };

  const handleRemoveQuestion = (index: number) => {
    setQuestions(questions.filter((_, i) => i !== index));
  };

  const handleQuestionTextChange = (index: number, val: string) => {
    const updated = [...questions];
    updated[index].questionText = val;
    setQuestions(updated);
  };

  const handleQuestionTypeChange = (index: number, val: "objective" | "subjective") => {
    const updated = [...questions];
    updated[index].questionType = val;
    setQuestions(updated);
  };

  const handleOptionChange = (qIndex: number, optIndex: number, val: string) => {
    const updated = [...questions];
    updated[qIndex].options[optIndex] = val;
    setQuestions(updated);
  };

  const handleCorrectOptionChange = (qIndex: number, val: number) => {
    const updated = [...questions];
    updated[qIndex].correctOptionIndex = val;
    setQuestions(updated);
  };

  const handleMarksChange = (qIndex: number, val: number) => {
    const updated = [...questions];
    updated[qIndex].marks = val || 1;
    setQuestions(updated);
  };

  const handleSaveExam = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    showModal("loading", editingExam ? "Updating..." : "Creating...", "Saving exam settings");

    const payload = {
      id: editingExam?._id,
      grade,
      subject,
      date,
      time,
      duration,
      examType,
      negativeMarking,
      negativeMarks,
      questions,
      venue,
    };

    try {
      const url = "/api/admin/exams";
      const method = editingExam ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.success) {
        showModal(
          "success",
          "Success!",
          editingExam ? "Exam updated successfully!" : "Exam created successfully!"
        );
        setIsAddEditModalOpen(false);
        fetchExams();
      } else {
        showModal("error", "Failed", data.message || "Save failed");
      }
    } catch (err: any) {
      showModal("error", "Error", err.message || "Connection error");
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteExam = async (id: string) => {
    if (!confirm("Are you sure you want to permanently delete this exam?")) return;

    showModal("loading", "Deleting...", "Removing exam schedule");
    try {
      const res = await fetch(`/api/admin/exams?id=${id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        showModal("success", "Deleted", "Exam deleted successfully!");
        fetchExams();
      } else {
        showModal("error", "Failed", data.message || "Delete failed");
      }
    } catch (err) {
      showModal("error", "Error", "Connection failed");
    }
  };

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
            Exam Management
          </h1>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 md:px-8 pt-8 md:pt-12">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10">
          <div>
            <h2 className="text-4xl md:text-5xl font-black text-stone-900 tracking-tight italic">
              Exam <span className="text-orange-600 not-italic">Schedules</span>
            </h2>
            <p className="mt-2 text-stone-500 text-xs uppercase tracking-widest font-black">
              Schedule tests and compile question papers for online/offline exams.
            </p>
          </div>
          <button
            onClick={handleOpenAddModal}
            className="bg-orange-600 text-white px-6 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-orange-700 transition shadow-lg active:scale-95 flex items-center gap-2"
          >
            <PlusCircle size={16} /> Schedule Exam
          </button>
        </div>

        {/* Exams Directory */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="animate-spin text-orange-600 mb-4" size={48} />
            <p className="text-stone-400 font-bold uppercase text-[10px] tracking-widest">
              Loading schedules...
            </p>
          </div>
        ) : exams.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-[2rem] border border-stone-200">
            <Calendar size={48} className="mx-auto text-stone-200 mb-4" />
            <p className="text-stone-400 font-bold italic text-sm">
              No exams scheduled yet.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {exams.map((exam) => (
              <div key={exam._id} className="bg-white p-6 rounded-[2rem] border border-stone-200 shadow-sm hover:shadow-md transition flex flex-col justify-between">
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="bg-purple-50 text-purple-700 text-[10px] font-black uppercase px-3 py-1 rounded-full">
                      ID: {exam.examId}
                    </span>
                    <span className={`text-[10px] font-black uppercase px-3 py-1 rounded-full ${exam.examType === "online" ? "bg-green-50 text-green-700" : "bg-stone-100 text-stone-700"}`}>
                      {exam.examType}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-xl font-black text-stone-900 leading-tight uppercase truncate">
                      {exam.subject}
                    </h3>
                    <p className="text-xs font-black text-stone-400 uppercase tracking-widest mt-1">
                      {exam.grade}
                    </p>
                  </div>

                  <div className="space-y-2 text-xs font-semibold text-stone-600 bg-stone-50 p-4 rounded-2xl">
                    <div className="flex items-center gap-2">
                      <Calendar size={14} className="text-orange-600" />
                      <span>{exam.date}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock size={14} className="text-orange-600" />
                      <span>{exam.time} • {exam.duration} Min</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <HelpCircle size={14} className="text-orange-600" />
                      <span>
                        {exam.questions?.length || 0} Questions • {exam.questions?.reduce((acc: number, q: any) => acc + (q.marks || 1), 0) || 0} Total Marks
                      </span>
                    </div>
                    {exam.examType === "offline" && (
                      <div className="flex items-center gap-2">
                        <MapPin size={14} className="text-orange-600" />
                        <span>Venue: {exam.venue || "Not Assigned"}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex gap-2 mt-6 pt-4 border-t border-stone-100">
                  <button
                    onClick={() => handleOpenEditModal(exam)}
                    className="px-4 py-2.5 bg-orange-50 hover:bg-orange-100 text-orange-600 rounded-xl font-bold text-xs uppercase tracking-widest flex-1 transition"
                  >
                    Edit / Questions
                  </button>
                  <button
                    onClick={() => handleDeleteExam(exam._id)}
                    className="p-2.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl transition"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Add / Edit Exam Modal */}
      {isAddEditModalOpen && (
        <div className="fixed inset-0 bg-stone-900/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-[2.5rem] shadow-2xl border border-stone-100 w-full max-w-4xl max-h-[90vh] overflow-y-auto p-8 sm:p-12 animate-in fade-in duration-300">
            <h3 className="text-2xl font-black text-stone-900 uppercase tracking-tight mb-8">
              {editingExam ? "Edit Exam & Paper" : "Schedule New Exam"}
            </h3>

            <form onSubmit={handleSaveExam} className="space-y-8">
              {/* Row 1: Grade, Subject */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-stone-500 uppercase ml-1">
                    Class / Grade *
                  </label>
                  <select
                    value={grade}
                    onChange={(e) => setGrade(e.target.value)}
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
                    Subject *
                  </label>
                  {selectedClassSubjects.length > 0 ? (
                    <select
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      className="w-full px-5 py-3.5 bg-stone-50 border border-stone-200 rounded-xl outline-none focus:ring-2 focus:ring-amber-500 text-stone-900 font-semibold text-sm shadow-sm"
                    >
                      {selectedClassSubjects.map((s: string) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      required
                      type="text"
                      className="w-full px-5 py-3.5 bg-stone-50 border border-stone-200 rounded-xl outline-none focus:ring-2 focus:ring-amber-500 text-stone-900 font-semibold text-sm shadow-sm"
                      placeholder="Type custom subject"
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                    />
                  )}
                </div>
              </div>

              {/* Row 2: Date, Time, Duration */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-stone-500 uppercase ml-1">
                    Exam Date *
                  </label>
                  <input
                    required
                    type="date"
                    className="w-full px-5 py-3.5 bg-stone-50 border border-stone-200 rounded-xl outline-none focus:ring-2 focus:ring-amber-500 text-stone-900 font-semibold text-sm transition shadow-sm"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black text-stone-500 uppercase ml-1">
                    Start Time *
                  </label>
                  <input
                    required
                    type="time"
                    className="w-full px-5 py-3.5 bg-stone-50 border border-stone-200 rounded-xl outline-none focus:ring-2 focus:ring-amber-500 text-stone-900 font-semibold text-sm transition shadow-sm"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black text-stone-500 uppercase ml-1">
                    Duration (Minutes) *
                  </label>
                  <input
                    required
                    type="number"
                    min={1}
                    className="w-full px-5 py-3.5 bg-stone-50 border border-stone-200 rounded-xl outline-none focus:ring-2 focus:ring-amber-500 text-stone-900 font-semibold text-sm transition shadow-sm"
                    value={duration}
                    onChange={(e) => setDuration(Number(e.target.value))}
                  />
                </div>
              </div>

              {/* Row 3: Exam Type, Negative Marking */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 items-center bg-stone-50 p-6 rounded-2xl border border-stone-200">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-stone-500 uppercase ml-1">
                    Exam Mode
                  </label>
                  <div className="flex gap-3 mt-1">
                    <button
                      type="button"
                      onClick={() => setExamType("online")}
                      className={`px-4 py-2.5 rounded-xl font-bold text-xs uppercase tracking-widest border transition-all ${examType === "online" ? "bg-orange-600 text-white border-orange-600" : "bg-white text-stone-600 border-stone-300"}`}
                    >
                      Online Test
                    </button>
                    <button
                      type="button"
                      onClick={() => setExamType("offline")}
                      className={`px-4 py-2.5 rounded-xl font-bold text-xs uppercase tracking-widest border transition-all ${examType === "offline" ? "bg-orange-600 text-white border-orange-600" : "bg-white text-stone-600 border-stone-300"}`}
                    >
                      Offline Test
                    </button>
                  </div>
                </div>

                {examType === "offline" && (
                  <div className="space-y-1 sm:col-span-2">
                    <label className="text-[10px] font-black text-stone-500 uppercase ml-1">
                      Exam Venue (Temple Name)
                    </label>
                    <select
                      value={venue}
                      onChange={(e) => setVenue(e.target.value)}
                      className="w-full px-5 py-2.5 bg-white border border-stone-300 rounded-xl outline-none focus:ring-2 focus:ring-amber-500 text-stone-900 font-semibold text-sm"
                    >
                      <option value="Not Assigned">Not Assigned</option>
                      {temples.map((t) => (
                        <option key={t._id || t.id} value={t.name}>
                          {t.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {examType === "online" && (
                  <>
                    <div className="flex items-center gap-2 mt-4 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        id="negativeMarking"
                        checked={negativeMarking}
                        onChange={(e) => setNegativeMarking(e.target.checked)}
                        className="w-5 h-5 accent-orange-600"
                      />
                      <label htmlFor="negativeMarking" className="text-xs font-black text-stone-700 uppercase tracking-widest">
                        Apply Negative Marking
                      </label>
                    </div>

                    {negativeMarking && (
                      <div className="space-y-1">
                        <label className="text-[10px] font-black text-stone-500 uppercase ml-1">
                          Negative Marks per error
                        </label>
                        <input
                          type="number"
                          step="0.05"
                          min="0"
                          className="w-full px-5 py-2.5 bg-white border border-stone-300 rounded-xl outline-none focus:ring-2 focus:ring-amber-500 text-stone-900 font-semibold text-sm"
                          value={negativeMarks}
                          onChange={(e) => setNegativeMarks(Number(e.target.value))}
                        />
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* Online Question Bank Builder */}
              {examType === "online" && (
                <div className="space-y-6">
                  <div className="flex justify-between items-center border-b border-stone-200 pb-3">
                    <h4 className="text-lg font-black text-stone-900 uppercase">
                      Question Paper Compiler
                    </h4>
                    <button
                      type="button"
                      onClick={handleAddQuestion}
                      className="px-4 py-2 bg-stone-900 text-white hover:bg-black rounded-xl font-bold text-xs uppercase tracking-widest flex items-center gap-1 transition"
                    >
                      <Plus size={14} /> Add Question
                    </button>
                  </div>

                  {questions.length === 0 ? (
                    <div className="text-center py-12 bg-stone-50 rounded-2xl border-2 border-dashed border-stone-300">
                      <HelpCircle size={32} className="mx-auto text-stone-300 mb-2" />
                      <p className="text-xs text-stone-400 font-bold italic">
                        No questions compiled. Click "Add Question" to start writing questions.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-6 max-h-[40vh] overflow-y-auto pr-2">
                      {questions.map((q, qIndex) => (
                        <div key={qIndex} className="p-6 bg-stone-50 rounded-3xl border border-stone-300 space-y-4 relative group/q">
                          <button
                            type="button"
                            onClick={() => handleRemoveQuestion(qIndex)}
                            className="absolute top-4 right-4 p-2 bg-white hover:bg-red-50 text-stone-400 hover:text-red-600 rounded-lg border border-stone-200 transition opacity-0 group-hover/q:opacity-100"
                          >
                            <Trash size={14} />
                          </button>

                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div className="space-y-1 sm:col-span-2">
                              <label className="text-[9px] font-black text-stone-400 uppercase">
                                Question {qIndex + 1} text
                              </label>
                              <input
                                required
                                type="text"
                                className="w-full px-4 py-2.5 bg-white border border-stone-300 rounded-xl outline-none focus:ring-2 focus:ring-amber-500 text-sm font-semibold text-stone-900"
                                placeholder="What is the capital of India?"
                                value={q.questionText}
                                onChange={(e) => handleQuestionTextChange(qIndex, e.target.value)}
                              />
                            </div>

                            <div className="space-y-1">
                              <label className="text-[9px] font-black text-stone-400 uppercase">
                                Type / Marks
                              </label>
                              <div className="flex gap-2">
                                <select
                                  value={q.questionType}
                                  onChange={(e) => handleQuestionTypeChange(qIndex, e.target.value as any)}
                                  className="bg-white px-3 py-2 border border-stone-300 rounded-xl outline-none text-xs font-semibold flex-1 text-stone-900"
                                >
                                  <option value="objective">MCQ</option>
                                  <option value="subjective">Subjective</option>
                                </select>
                                <input
                                  type="number"
                                  min={1}
                                  className="w-16 px-2 py-2 border border-stone-300 rounded-xl text-center text-xs font-bold text-stone-900"
                                  value={q.marks || 1}
                                  onChange={(e) => handleMarksChange(qIndex, Number(e.target.value))}
                                />
                              </div>
                            </div>
                          </div>

                          {q.questionType === "objective" && (
                            <div className="space-y-3 pt-2">
                              <label className="text-[9px] font-black text-stone-400 uppercase">
                                Options & Correct Answer selection
                              </label>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {q.options.map((opt, optIndex) => (
                                  <div key={optIndex} className="flex items-center gap-2">
                                    <input
                                      type="radio"
                                      name={`correct-ans-${qIndex}`}
                                      checked={q.correctOptionIndex === optIndex}
                                      onChange={() => handleCorrectOptionChange(qIndex, optIndex)}
                                      className="w-4 h-4 accent-orange-600"
                                    />
                                    <input
                                      required
                                      type="text"
                                      className="w-full px-3 py-2 bg-white border border-stone-200 rounded-lg outline-none text-xs font-semibold text-stone-900"
                                      placeholder={`Option ${optIndex + 1}`}
                                      value={opt}
                                      onChange={(e) => handleOptionChange(qIndex, optIndex, e.target.value)}
                                    />
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              <div className="flex gap-4 pt-4 border-t border-stone-200">
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
                  {editingExam ? "Save Changes" : "Create Exam"}
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
    </div>
  );
}
