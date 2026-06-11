"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Calendar,
  Award,
  Download,
  Printer,
  Loader2,
  CheckCircle,
  FileText,
  Save,
} from "lucide-react";
import StatusModal from "@/components/StatusModal";

export default function AdminResultsPage() {
  const [exams, setExams] = useState<any[]>([]);
  const [selectedExamId, setSelectedExamId] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [examLoading, setExamLoading] = useState(true);

  // Search/Filter states
  const [selectedClass, setSelectedClass] = useState("All");
  const [selectedSubject, setSelectedSubject] = useState("All");

  const uniqueClasses = Array.from(new Set(exams.map((e) => e.grade))).sort();
  const uniqueSubjects = Array.from(new Set(exams.map((e) => e.subject))).sort();

  const filteredExams = exams.filter((e) => {
    const classMatch = selectedClass === "All" || e.grade === selectedClass;
    const subjectMatch = selectedSubject === "All" || e.subject === selectedSubject;
    return classMatch && subjectMatch;
  });

  // Sync selected exam ID when filters or exams list updates
  useEffect(() => {
    if (filteredExams.length > 0) {
      const exists = filteredExams.some((e) => e._id === selectedExamId);
      if (!exists) {
        setSelectedExamId(filteredExams[0]._id);
      }
    } else {
      setSelectedExamId("");
    }
  }, [selectedClass, selectedSubject, exams]);

  // Offline Marks form states (stored temporarily per student)
  const [manualMarks, setManualMarks] = useState<{ [studentId: string]: string }>({});
  const [manualTotal, setManualTotal] = useState("100");
  const [uploadingStudentId, setUploadingStudentId] = useState<string | null>(null);

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
        if (data.data.length > 0) {
          setSelectedExamId(data.data[0]._id);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setExamLoading(false);
    }
  };

  const fetchResults = async () => {
    if (!selectedExamId) return;
    setLoading(true);
    try {
      // 1. Fetch results submitted in DB
      const res = await fetch(`/api/admin/results?examId=${selectedExamId}`);
      const data = await res.json();

      const selectedExam = exams.find((e) => e._id === selectedExamId);

      if (data.success) {
        setResults(data.data);

        // 2. Fetch all students in that class to allow offline marks input
        if (selectedExam) {
          const resStudents = await fetch("/api/admin/students");
          const dataStudents = await resStudents.json();
          if (dataStudents.success) {
            const classStudents = dataStudents.data.filter(
              (s: any) => s.studentClass === selectedExam.grade
            );
            setStudents(classStudents);

            // Populate manual marks state for edit/entry
            const marksMap: { [stuId: string]: string } = {};
            classStudents.forEach((s: any) => {
              const matchedResult = data.data.find((r: any) => r.studentId?._id === s._id);
              if (matchedResult) {
                marksMap[s._id] = String(matchedResult.marksObtained);
                setManualTotal(String(matchedResult.totalMarks));
              } else {
                marksMap[s._id] = "";
              }
            });
            setManualMarks(marksMap);
          }
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExams();
  }, []);

  useEffect(() => {
    fetchResults();
  }, [selectedExamId, exams]);

  const selectedExam = exams.find((e) => e._id === selectedExamId);

  // Upload/Save manual offline marks for a single student
  const handleSaveMarks = async (studentId: string) => {
    const marks = manualMarks[studentId];
    if (marks === undefined || marks.trim() === "") {
      alert("Please enter marks first!");
      return;
    }

    if (Number(marks) > Number(manualTotal)) {
      alert("Marks obtained cannot exceed total marks!");
      return;
    }

    setUploadingStudentId(studentId);
    try {
      const res = await fetch("/api/admin/results", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentId,
          examId: selectedExamId,
          marksObtained: Number(marks),
          totalMarks: Number(manualTotal),
        }),
      });

      const data = await res.json();
      if (data.success) {
        showModal("success", "Saved", "Student marks updated successfully!");
        fetchResults();
      } else {
        showModal("error", "Failed", data.message || "Save failed");
      }
    } catch (err) {
      showModal("error", "Error", "Connection error");
    } finally {
      setUploadingStudentId(null);
    }
  };

  // Export Results as Excel CSV
  const handleExportCSV = () => {
    if (results.length === 0) {
      alert("No results to export!");
      return;
    }

    const csvHeaders = ["Rank", "Student ID", "Roll Number", "Student Name", "Class", "Section", "Exam Center", "Marks Obtained", "Total Marks", "Percentage", "Grade", "Status"];
    const csvRows = results.map((r, i) => [
      i + 1,
      r.studentId?.studentId || "N/A",
      r.studentId?.rollNumber || "N/A",
      r.studentId?.name || "N/A",
      r.studentId?.studentClass || "N/A",
      r.studentId?.section || "A",
      r.studentId?.templeName || "N/A",
      r.marksObtained,
      r.totalMarks,
      `${r.percentage}%`,
      r.grade,
      r.status,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [csvHeaders.join(","), ...csvRows.map((e) => e.map(val => `"${val}"`).join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${selectedExam?.subject || "Exam"}_Class_${selectedExam?.grade || "Results"}_MeritList.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Print PDF Merit List
  const handlePrintPDF = () => {
    const printWindow = window.open("", "_blank");
    if (!printWindow || !selectedExam) return;

    const printRows = results
      .map(
        (r, i) => `
      <tr>
        <td>${i + 1}</td>
        <td>${r.studentId?.studentId || "N/A"}</td>
        <td>${r.studentId?.rollNumber || "N/A"}</td>
        <td>${r.studentId?.name}</td>
        <td>${r.studentId?.section || "A"}</td>
        <td>${r.studentId?.templeName || "N/A"}</td>
        <td>${r.marksObtained} / ${r.totalMarks}</td>
        <td>${r.percentage}%</td>
        <td>${r.grade}</td>
        <td>${r.status}</td>
      </tr>
    `
      )
      .join("");

    printWindow.document.write(`
      <html>
        <head>
          <title>Merit List - ${selectedExam.subject}</title>
          <style>
            body { font-family: sans-serif; padding: 30px; color: #1c1917; }
            h2 { color: #ea580c; margin-bottom: 5px; }
            h4 { color: #44403c; margin-top: 0; margin-bottom: 20px; text-transform: uppercase; font-size: 12px; letter-spacing: 1.5px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 13px; }
            th, td { border: 1px solid #d6d3d1; padding: 12px 10px; text-align: left; }
            th { bg-color: #f5f5f4; font-weight: bold; }
            tr:nth-child(even) { background-color: #fafaf9; }
          </style>
        </head>
        <body>
          <h2>Exam Merit Rankings</h2>
          <h4>Subject: ${selectedExam.subject} • Class: ${selectedExam.grade} • Date: ${selectedExam.date}</h4>
          <table>
            <thead>
              <tr>
                <th>Rank</th>
                <th>Student ID</th>
                <th>Roll No</th>
                <th>Name</th>
                <th>Sec</th>
                <th>Exam Centre</th>
                <th>Score</th>
                <th>Percentage</th>
                <th>Grade</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              ${printRows}
            </tbody>
          </table>
          <script>window.print();</script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

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
            Results & Merit lists
          </h1>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 md:px-8 pt-8 md:pt-12">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10">
          <div>
            <h2 className="text-4xl md:text-5xl font-black text-stone-900 tracking-tight italic">
              Results <span className="text-orange-600 not-italic">Dashboard</span>
            </h2>
            <p className="mt-2 text-stone-500 text-xs uppercase tracking-widest font-black">
              Enter offline exam marks and download rank charts.
            </p>
          </div>
        </div>

        {/* Selection panel */}
        {examLoading ? (
          <div className="flex justify-center py-10">
            <Loader2 className="animate-spin text-orange-600" size={32} />
          </div>
        ) : exams.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-[2rem] border border-stone-200 shadow-sm">
            <Award size={48} className="mx-auto text-stone-200 mb-4" />
            <p className="text-stone-400 font-bold italic text-sm">
              Please schedule exams and register students first to view results.
            </p>
          </div>
        ) : (
          <div className="bg-white p-6 md:p-8 rounded-[2rem] border border-stone-200 shadow-sm mb-8 space-y-6 animate-in fade-in duration-200">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Filter by Class */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest ml-1">
                  Filter by Class
                </label>
                <select
                  value={selectedClass}
                  onChange={(e) => setSelectedClass(e.target.value)}
                  className="w-full bg-stone-50 px-4 py-3.5 rounded-xl border-2 border-stone-200 outline-none text-sm font-bold text-stone-900 shadow-sm transition-all focus:border-orange-500 focus:bg-white"
                >
                  <option value="All">All Classes</option>
                  {uniqueClasses.map((cls) => (
                    <option key={cls} value={cls}>
                      {cls}
                    </option>
                  ))}
                </select>
              </div>

              {/* Filter by Subject */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest ml-1">
                  Filter by Subject
                </label>
                <select
                  value={selectedSubject}
                  onChange={(e) => setSelectedSubject(e.target.value)}
                  className="w-full bg-stone-50 px-4 py-3.5 rounded-xl border-2 border-stone-200 outline-none text-sm font-bold text-stone-900 shadow-sm transition-all focus:border-orange-500 focus:bg-white"
                >
                  <option value="All">All Subjects</option>
                  {uniqueSubjects.map((sub) => (
                    <option key={sub} value={sub}>
                      {sub}
                    </option>
                  ))}
                </select>
              </div>

              {/* Select Exam Schedule */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest ml-1">
                  Select Exam Schedule
                </label>
                <select
                  value={selectedExamId}
                  onChange={(e) => setSelectedExamId(e.target.value)}
                  className="w-full bg-stone-50 px-4 py-3.5 rounded-xl border-2 border-stone-200 outline-none text-sm font-bold text-stone-900 shadow-sm transition-all focus:border-orange-500 focus:bg-white"
                  disabled={filteredExams.length === 0}
                >
                  {filteredExams.length === 0 ? (
                    <option value="">No exam schedules found</option>
                  ) : (
                    filteredExams.map((e) => (
                      <option key={e._id} value={e._id}>
                        [{e.examId}] {e.subject} - {e.grade} ({e.examType.toUpperCase()})
                      </option>
                    ))
                  )}
                </select>
              </div>
            </div>

            {selectedExam && (
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-t border-stone-100 pt-6">
                <div className="text-left space-y-0.5">
                  <p className="text-[9px] font-black text-stone-400 uppercase tracking-widest">Active Selection</p>
                  <p className="text-xs font-black text-stone-800 uppercase tracking-tight">
                    [{selectedExam.examId}] {selectedExam.subject} — {selectedExam.grade} ({selectedExam.examType})
                  </p>
                </div>
                {results.length > 0 && (
                  <div className="flex gap-3 w-full sm:w-auto">
                    <button
                      onClick={handleExportCSV}
                      className="flex-1 sm:flex-initial bg-stone-900 hover:bg-black text-white px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all"
                    >
                      <Download size={14} /> Excel CSV
                    </button>
                    <button
                      onClick={handlePrintPDF}
                      className="flex-1 sm:flex-initial bg-orange-600 hover:bg-orange-700 text-white px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all"
                    >
                      <Printer size={14} /> PDF Print
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Results Core View */}
        {selectedExam ? (
          <div className="space-y-8">
            {/* 1. Offline Exam Marks Input Form */}
            {selectedExam.examType === "offline" && (
              <div className="bg-white rounded-[2rem] border border-stone-200 shadow-sm p-6 md:p-8">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 border-b border-stone-100 pb-4">
                  <div>
                    <h3 className="text-xl font-black text-stone-900 uppercase">
                      Upload Offline Marks
                    </h3>
                    <p className="text-stone-400 text-xs mt-1">
                      Enter obtained scores for students registered in {selectedExam.grade}.
                    </p>
                  </div>
                  <div className="flex items-center gap-2 bg-stone-50 px-4 py-2 rounded-xl border border-stone-200">
                    <span className="text-[10px] font-black uppercase text-stone-400">Total Marks</span>
                    <input
                      type="number"
                      className="w-16 px-2 py-1 rounded bg-white border border-stone-300 text-center font-bold text-sm"
                      value={manualTotal}
                      onChange={(e) => setManualTotal(e.target.value)}
                    />
                  </div>
                </div>

                {loading ? (
                  <div className="flex justify-center py-10">
                    <Loader2 className="animate-spin text-orange-600" size={32} />
                  </div>
                ) : students.length === 0 ? (
                  <p className="text-center py-8 text-stone-400 text-sm font-semibold italic">
                    No students registered in {selectedExam.grade}.
                  </p>
                ) : (
                  <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2">
                    {students.map((stu) => (
                      <div key={stu._id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 bg-stone-50 rounded-2xl border border-stone-200 gap-4">
                        <div className="min-w-0">
                          <p className="font-bold text-stone-800 text-sm">{stu.name}</p>
                          <p className="text-[9px] font-black text-stone-400 uppercase tracking-widest mt-1">
                            ID: {stu.studentId} • Roll: {stu.rollNumber} • Centre: {stu.templeName}
                          </p>
                        </div>

                        <div className="flex items-center gap-2 self-end sm:self-auto">
                          <input
                            type="number"
                            placeholder="Obtained"
                            className="w-24 px-3 py-2 bg-white border border-stone-300 rounded-xl text-center text-sm font-semibold outline-none focus:ring-2 focus:ring-amber-500"
                            value={manualMarks[stu._id] || ""}
                            onChange={(e) =>
                              setManualMarks({
                                ...manualMarks,
                                [stu._id]: e.target.value,
                              })
                            }
                          />
                          <span className="text-stone-400 text-sm">/ {manualTotal}</span>
                          <button
                            onClick={() => handleSaveMarks(stu._id)}
                            disabled={uploadingStudentId === stu._id}
                            className="bg-stone-900 hover:bg-black text-white p-2.5 rounded-xl transition disabled:bg-stone-300 flex items-center justify-center"
                          >
                            {uploadingStudentId === stu._id ? (
                              <Loader2 className="animate-spin" size={16} />
                            ) : (
                              <Save size={16} />
                            )}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* 2. Merit List Table */}
            <div className="bg-white rounded-[2rem] border border-stone-200 shadow-sm p-6 md:p-8">
              <h3 className="text-2xl font-black text-stone-900 uppercase tracking-tight mb-6 flex items-center gap-2">
                <Award className="text-orange-600" size={24} /> Merit Rankings / Rank Chart
              </h3>

              {loading ? (
                <div className="flex justify-center py-10">
                  <Loader2 className="animate-spin text-orange-600" size={32} />
                </div>
              ) : results.length === 0 ? (
                <div className="text-center py-12 bg-stone-50 rounded-2xl border border-dashed border-stone-200">
                  <FileText className="mx-auto text-stone-300 mb-2" size={32} />
                  <p className="text-xs text-stone-400 font-bold italic">
                    No results submissions recorded yet for this exam.
                  </p>
                </div>
              ) : (
                <>
                  {/* Desktop Table */}
                  <div className="hidden lg:block overflow-x-auto">
                    <table className="w-full text-left">
                      <thead className="bg-stone-50 border-b border-stone-100">
                        <tr>
                          <th className="px-6 py-4 text-[10px] font-black text-stone-400 uppercase tracking-widest">
                            Rank
                          </th>
                          <th className="px-6 py-4 text-[10px] font-black text-stone-400 uppercase tracking-widest">
                            Student Name & ID
                          </th>
                          <th className="px-6 py-4 text-[10px] font-black text-stone-400 uppercase tracking-widest">
                            Sec
                          </th>
                          <th className="px-6 py-4 text-[10px] font-black text-stone-400 uppercase tracking-widest">
                            Exam Centre
                          </th>
                          <th className="px-6 py-4 text-[10px] font-black text-stone-400 uppercase tracking-widest">
                            Score
                          </th>
                          <th className="px-6 py-4 text-[10px] font-black text-stone-400 uppercase tracking-widest">
                            Percentage
                          </th>
                          <th className="px-6 py-4 text-[10px] font-black text-stone-400 uppercase tracking-widest">
                            Grade
                          </th>
                          <th className="px-6 py-4 text-[10px] font-black text-stone-400 uppercase tracking-widest">
                            Result
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-stone-100 font-semibold text-stone-700">
                        {results.map((r, i) => (
                          <tr key={r._id} className="hover:bg-stone-50/50 transition-colors">
                            <td className="px-6 py-4 text-sm font-black text-orange-600">
                              #{i + 1}
                            </td>
                            <td className="px-6 py-4">
                              <p className="text-sm font-bold text-stone-800 whitespace-nowrap">{r.studentId?.name}</p>
                              <div className="flex flex-col gap-0.5 text-[9px] font-black uppercase mt-0.5 leading-normal">
                                <p className="text-indigo-600 font-mono whitespace-nowrap">ID: {r.studentId?.studentId || "TBA"}</p>
                                <p className="text-orange-600 font-mono whitespace-nowrap">Roll: {r.studentId?.rollNumber || "TBA"}</p>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-sm">
                              {r.studentId?.section || "A"}
                            </td>
                            <td className="px-6 py-4 text-xs text-stone-600">
                              {r.studentId?.templeName}
                            </td>
                            <td className="px-6 py-4 text-sm font-black">
                              {r.marksObtained} / {r.totalMarks}
                            </td>
                            <td className="px-6 py-4 text-sm text-orange-600">
                              {r.percentage}%
                            </td>
                            <td className="px-6 py-4 text-sm">
                              {r.grade}
                            </td>
                            <td className="px-6 py-4">
                              <span className={`text-[9px] font-black uppercase px-2.5 py-1 rounded-full ${r.status === "Passed" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                                {r.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Mobile Cards view */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:hidden">
                    {results.map((r, i) => (
                      <div key={r._id} className="bg-stone-50 p-6 rounded-3xl border border-stone-200 shadow-sm space-y-4">
                        <div className="flex justify-between items-center">
                          <span className="text-lg font-black text-orange-600">Rank #{i + 1}</span>
                          <span className={`text-[9px] font-black uppercase px-2.5 py-1 rounded-full ${r.status === "Passed" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                            {r.status}
                          </span>
                        </div>

                        <div>
                          <h4 className="font-bold text-stone-900">{r.studentId?.name}</h4>
                          <p className="text-[10px] font-black uppercase text-stone-400">
                            ID: {r.studentId?.studentId} • Roll: {r.studentId?.rollNumber}
                          </p>
                        </div>

                        <div className="grid grid-cols-2 gap-3 text-xs border-t border-stone-200 pt-3 font-semibold text-stone-600">
                          <div>
                            <p className="text-[9px] text-stone-400 uppercase font-black">Centre</p>
                            <p className="truncate">{r.studentId?.templeName}</p>
                          </div>
                          <div>
                            <p className="text-[9px] text-stone-400 uppercase font-black">Score</p>
                            <p>{r.marksObtained} / {r.totalMarks}</p>
                          </div>
                          <div>
                            <p className="text-[9px] text-stone-400 uppercase font-black">Percentage</p>
                            <p className="text-orange-600">{r.percentage}%</p>
                          </div>
                          <div>
                            <p className="text-[9px] text-stone-400 uppercase font-black">Grade</p>
                            <p>Grade {r.grade}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        ) : exams.length > 0 && (
          <div className="text-center py-16 bg-white rounded-[2rem] border border-stone-200 shadow-sm mt-8 animate-in fade-in duration-200">
            <Award size={48} className="mx-auto text-stone-300 mb-4" />
            <p className="text-stone-400 font-bold italic text-sm">
              No exam schedules match the selected Class or Subject filters.
            </p>
            <p className="text-[10px] text-stone-300 uppercase mt-2 font-black tracking-widest">
              Try adjusting your Class or Subject filters above
            </p>
          </div>
        )}
      </main>

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
