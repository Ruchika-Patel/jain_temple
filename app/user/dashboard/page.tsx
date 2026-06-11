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
  Lock,
  Loader2,
  Printer,
} from "lucide-react";

export default function UserDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [syllabusData, setSyllabusData] = useState<any>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [nextClass, setNextClass] = useState<any>(null);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [unlockDate, setUnlockDate] = useState<Date | null>(null);

  // New States
  const [exams, setExams] = useState<any[]>([]);
  const [loadingExams, setLoadingExams] = useState(true);
  const [isAdmitCardModalOpen, setIsAdmitCardModalOpen] = useState(false);

  const offlineExam = exams.find((ex) => ex.examType === "offline");
  const examCentreVenue = offlineExam 
    ? (offlineExam.venue || "Not Assigned") 
    : (exams.length > 0 && exams.every((ex) => ex.examType === "online") ? "Online Portal" : (user?.templeName || "Not Assigned"));

  useEffect(() => {
    const savedUser = localStorage.getItem("current_user");
    if (!savedUser) {
      router.push("/user/login"); // Redirect to /user/login if missing
      return;
    }
    const initialUserData = JSON.parse(savedUser);
    setUser(initialUserData);

    const fetchStudentExams = async (userData: any) => {
      try {
        const response = await fetch(`/api/student/exams?grade=${userData.studentClass}&studentId=${userData._id || ""}`);
        const result = await response.json();
        if (result.success) {
          setExams(result.data);
        }
      } catch (error) {
        console.error("Error fetching student exams:", error);
      } finally {
        setLoadingExams(false);
      }
    };

    const fetchSyllabusAndNextClass = async (userData: any) => {
      try {
        const response = await fetch("/api/classes");
        const result = await response.json();
        if (result.success) {
          const classes = result.data.sort((a: any, b: any) => a.grade.localeCompare(b.grade));
          const currentClassIndex = classes.findIndex((c: any) => c.grade === userData.studentClass);

          // Syllabus for current class
          if (currentClassIndex !== -1) {
            setSyllabusData(classes[currentClassIndex]);
          }

          // Next Class Logic
          if (currentClassIndex !== -1 && currentClassIndex < classes.length - 1) {
            const next = classes[currentClassIndex + 1];
            setNextClass(next);

            const joinDate = new Date(userData.createdAt || Date.now()); // Fallback to now if missing
            const unlockThreshold = new Date(joinDate);
            unlockThreshold.setMonth(unlockThreshold.getMonth() + 5);
            setUnlockDate(unlockThreshold);

            if (new Date() >= unlockThreshold) {
              setIsUnlocked(true);
            } else {
              setIsUnlocked(false);
            }
          }
        }
      } catch (error) {
        console.error("Error fetching classes:", error);
      }
    };

    const syncUserProfile = async () => {
      try {
        const res = await fetch(`/api/user/profile?id=${initialUserData._id}`);
        const result = await res.json();
        if (result.success && result.data) {
          setUser(result.data);
          localStorage.setItem("current_user", JSON.stringify(result.data));
          fetchStudentExams(result.data);
          fetchSyllabusAndNextClass(result.data);
        } else {
          fetchStudentExams(initialUserData);
          fetchSyllabusAndNextClass(initialUserData);
        }
      } catch (error) {
        console.error("Error syncing student profile:", error);
        fetchStudentExams(initialUserData);
        fetchSyllabusAndNextClass(initialUserData);
      }
    };

    syncUserProfile();
  }, [router]);

  const handleDownload = (file: any) => {
    if (!file?.fileData) return;
    const link = document.createElement("a");
    link.href = file.fileData;
    link.download = file.fileName || `${user.studentClass}_Syllabus`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrintResult = (exam: any) => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    printWindow.document.write(`
      <html>
        <head>
          <title>Result Slip - ${exam.subject}</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800;900&display=swap');
            
            body {
              font-family: 'Outfit', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
              background-color: #fff;
              color: #1c1917;
              margin: 0;
              padding: 40px;
              display: flex;
              justify-content: center;
              align-items: flex-start;
            }
            
            .container {
              width: 100%;
              max-width: 800px;
              border: 3px double #78716c;
              padding: 40px;
              border-radius: 16px;
              box-sizing: border-box;
              position: relative;
              background: #fff;
            }
            
            .watermark {
              position: absolute;
              top: 50%;
              left: 50%;
              transform: translate(-50%, -50%) rotate(-25deg);
              font-size: 80px;
              font-weight: 950;
              color: ${exam.scoreDetails.status === 'Passed' ? 'rgba(22, 101, 52, 0.04)' : 'rgba(185, 28, 28, 0.04)'};
              text-transform: uppercase;
              white-space: nowrap;
              pointer-events: none;
              user-select: none;
              z-index: 0;
            }
            
            .header {
              text-align: center;
              margin-bottom: 30px;
              position: relative;
              z-index: 10;
            }
            
            .header h1 {
              font-size: 26px;
              font-weight: 900;
              color: #ea580c;
              margin: 0 0 4px 0;
              text-transform: uppercase;
              letter-spacing: 0.5px;
            }
            
            .header .sub-title {
              font-size: 11px;
              color: #78716c;
              text-transform: uppercase;
              font-weight: 800;
              letter-spacing: 2.5px;
              margin: 0 0 10px 0;
            }
            
            .header .doc-type {
              display: inline-block;
              background-color: #f5f5f4;
              border: 1px solid #e7e5e4;
              padding: 4px 16px;
              border-radius: 9999px;
              font-size: 11px;
              font-weight: 900;
              text-transform: uppercase;
              letter-spacing: 1px;
              color: #44403c;
            }
            
            .table-title {
              font-size: 11px;
              font-weight: 900;
              text-transform: uppercase;
              letter-spacing: 1.5px;
              color: #78716c;
              margin: 25px 0 10px 0;
              position: relative;
              z-index: 10;
            }
            
            /* Student Details Table */
            .details-table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 25px;
              position: relative;
              z-index: 10;
            }
            
            .details-table td {
              padding: 10px 14px;
              font-size: 13px;
              border: 1px solid #e7e5e4;
            }
            
            .details-table td.label {
              font-weight: 800;
              color: #78716c;
              background-color: #fafaf9;
              width: 20%;
              text-transform: uppercase;
              font-size: 11px;
              letter-spacing: 0.5px;
            }
            
            .details-table td.value {
              font-weight: 700;
              color: #1c1917;
              width: 30%;
            }
            
            /* Marks Table */
            .marks-table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 35px;
              position: relative;
              z-index: 10;
            }
            
            .marks-table th {
              background-color: #292524;
              color: #fff;
              font-weight: 800;
              font-size: 11px;
              text-transform: uppercase;
              letter-spacing: 1px;
              padding: 12px 14px;
              border: 1px solid #292524;
              text-align: left;
            }
            
            .marks-table th.center, .marks-table td.center {
              text-align: center;
            }
            
            .marks-table td {
              padding: 14px 14px;
              font-size: 13px;
              border: 1px solid #e7e5e4;
              font-weight: 600;
              color: #1c1917;
            }
            
            .marks-table tr:nth-child(even) {
              background-color: #fafaf9;
            }
            
            .badge {
              font-size: 10px;
              font-weight: 900;
              text-transform: uppercase;
              padding: 4px 12px;
              border-radius: 9999px;
              display: inline-block;
            }
            
            .badge.passed {
              background-color: #dcfce7;
              color: #15803d;
              border: 1px solid #bbf7d0;
            }
            
            .badge.failed {
              background-color: #fee2e2;
              color: #b91c1c;
              border: 1px solid #fecaca;
            }
            
            .badge.grade {
              background-color: #f5f5f4;
              color: #44403c;
              border: 1px solid #e7e5e4;
            }
            
            .summary-box {
              display: flex;
              justify-content: flex-end;
              margin-bottom: 40px;
              position: relative;
              z-index: 10;
            }
            
            .summary-table {
              width: 300px;
              border-collapse: collapse;
            }
            
            .summary-table td {
              padding: 10px 14px;
              font-size: 13px;
              border: 1px solid #e7e5e4;
            }
            
            .summary-table td.label {
              font-weight: 800;
              color: #78716c;
              background-color: #fafaf9;
              text-transform: uppercase;
              font-size: 11px;
            }
            
            .summary-table td.value {
              font-weight: 800;
              text-align: right;
            }
            
            .summary-table tr.total-row td {
              background-color: #fff7ed;
              border-top: 2px solid #ea580c;
            }
            
            .summary-table tr.total-row td.value {
              color: #c2410c;
              font-size: 16px;
            }
            
            .signatures {
              display: flex;
              justify-content: space-between;
              margin-top: 60px;
              padding-top: 20px;
              position: relative;
              z-index: 10;
            }
            
            .sig-block {
              text-align: center;
              width: 200px;
            }
            
            .sig-line {
              border-top: 1px solid #78716c;
              margin-bottom: 8px;
            }
            
            .sig-title {
              font-size: 11px;
              font-weight: 900;
              text-transform: uppercase;
              color: #78716c;
              letter-spacing: 1px;
            }
            
            .footer-info {
              text-align: center;
              font-size: 10px;
              color: #a8a29e;
              margin-top: 50px;
              border-top: 1px solid #e7e5e4;
              padding-top: 15px;
              position: relative;
              z-index: 10;
            }
            
            @media print {
              body {
                padding: 0;
                background: none;
              }
              .container {
                border-radius: 0;
                border: 3px double #1c1917;
                padding: 30px;
              }
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="watermark">
              ${exam.scoreDetails.status}
            </div>
            
            <div class="header">
              <h1>Jain Examination Board</h1>
              <div class="sub-title">${user.templeName}</div>
              <div class="doc-type">Official Academic Marksheet</div>
            </div>
            
            <div class="table-title">Student Details</div>
            <table class="details-table">
              <tr>
                <td class="label">Student Name</td>
                <td class="value">${user.name}</td>
                <td class="label">Student ID</td>
                <td class="value">${user.studentId}</td>
              </tr>
              <tr>
                <td class="label">Roll Number</td>
                <td class="value">${user.rollNumber}</td>
                <td class="label">Class & Section</td>
                <td class="value">${user.studentClass} (${user.section})</td>
              </tr>
              <tr>
                <td class="label">Exam Centre</td>
                <td class="value">${user.templeName}</td>
                <td class="label">Date of Exam</td>
                <td class="value">${exam.date}</td>
              </tr>
            </table>
            
            <div class="table-title">Performance Record</div>
            <table class="marks-table">
              <thead>
                <tr>
                  <th style="width: 10%;">S.No.</th>
                  <th style="width: 35%;">Subject</th>
                  <th style="width: 15%;" class="center">Exam Mode</th>
                  <th style="width: 15%;" class="center">Max Marks</th>
                  <th style="width: 15%;" class="center">Marks Obtained</th>
                  <th style="width: 10%;" class="center">Status</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>1</td>
                  <td>${exam.subject}</td>
                  <td class="center" style="text-transform: uppercase;">${exam.examType}</td>
                  <td class="center">${exam.scoreDetails.totalMarks}</td>
                  <td class="center">${exam.scoreDetails.marksObtained}</td>
                  <td class="center">
                    <span class="badge ${exam.scoreDetails.status === 'Passed' ? 'passed' : 'failed'}">
                      ${exam.scoreDetails.status}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
            
            <div class="summary-box">
              <table class="summary-table">
                <tr>
                  <td class="label">Marks Obtained</td>
                  <td class="value">${exam.scoreDetails.marksObtained}</td>
                </tr>
                <tr>
                  <td class="label">Total Marks</td>
                  <td class="value">${exam.scoreDetails.totalMarks}</td>
                </tr>
                <tr>
                  <td class="label">Percentage</td>
                  <td class="value">${exam.scoreDetails.percentage}%</td>
                </tr>
                <tr class="total-row">
                  <td class="label">Final Grade</td>
                  <td class="value" style="font-weight: 900;">${exam.scoreDetails.grade}</td>
                </tr>
              </table>
            </div>
            
            <div class="signatures">
              <div class="sig-block">
                <div class="sig-line"></div>
                <div class="sig-title">Class In-charge</div>
              </div>
              <div class="sig-block">
                <div class="sig-line"></div>
                <div class="sig-title">Exam Controller</div>
              </div>
            </div>
            
            <div class="footer-info">
              Generated from Jain Examination Board Portal on ${new Date().toLocaleDateString()}.
              <br>This is a computer-generated marksheet. Authenticity can be verified at the central examination portal.
            </div>
          </div>
          
          <script>
            window.onload = function() {
              window.print();
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const handleLogout = () => {
    localStorage.removeItem("current_user");
    router.push("/user/login");
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50 via-[#FAF9F5] to-stone-100 flex flex-col md:flex-row font-sans text-stone-900">
      {/* --- MOBILE NAVBAR --- */}
      <nav className="md:hidden bg-white/80 backdrop-blur-md border-b border-stone-200/80 p-4 sticky top-0 z-50 flex justify-between items-center shadow-sm">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-gradient-to-tr from-orange-500 to-amber-500 rounded-lg flex items-center justify-center text-white shadow-md shadow-orange-500/10">
            <LayoutDashboard size={16} />
          </div>
          <span className="font-black tracking-wider uppercase text-xs text-stone-850">Exam Portal</span>
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
          <div className="w-72 bg-white h-full p-6 flex flex-col animate-in slide-in-from-left duration-500 shadow-2xl">
            <div className="flex justify-between items-center mb-10">
              <span className="font-black tracking-wider uppercase text-sm text-stone-850">Navigation</span>
              <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 text-stone-400 hover:text-stone-900 transition-colors"><X size={20} /></button>
            </div>
            <nav className="flex-1 space-y-2">
              <div className="p-3 bg-amber-500/15 text-amber-700 rounded-xl flex items-center gap-3 font-black text-xs uppercase tracking-wider">
                <LayoutDashboard size={18} />
                <span>Dashboard</span>
              </div>
            </nav>
            <button
              onClick={handleLogout}
              className="p-3.5 flex items-center gap-3 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all font-bold text-xs uppercase tracking-wider border-t border-stone-100 pt-6"
            >
              <LogOut size={18} /> Logout
            </button>
          </div>
        </div>
      )}

      {/* --- SIDEBAR (DESKTOP) --- */}
      <aside className="w-full md:w-72 bg-white border-r border-stone-200 p-6 flex flex-col hidden md:flex">
        <div className="flex items-center gap-3 mb-10 px-2">
          <div className="w-10 h-10 bg-gradient-to-tr from-orange-500 to-amber-500 rounded-xl flex items-center justify-center text-white shadow-md shadow-orange-500/20">
            <LayoutDashboard size={20} />
          </div>
          <span className="text-base font-black tracking-wider uppercase text-stone-855">
            Exam Portal
          </span>
        </div>

        <nav className="flex-1 space-y-1.5">
          <div className="p-3.5 bg-amber-500/10 text-amber-700 border-l-4 border-amber-600 rounded-r-xl flex items-center gap-3 font-bold text-xs uppercase tracking-wider transition-all select-none">
            <LayoutDashboard size={18} />
            <span>Dashboard</span>
          </div>
        </nav>

        <button
          onClick={handleLogout}
          className="mt-auto p-3.5 flex items-center gap-3 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all font-bold text-xs uppercase tracking-wider"
        >
          <LogOut size={18} />
          <span>Logout</span>
        </button>
      </aside>

      {/* --- MAIN CONTENT --- */}
      <main className="flex-1 p-6 md:p-12 overflow-y-auto relative">
        {/* Floating background decorative blobs */}
        <div className="absolute top-10 left-10 w-72 h-72 bg-amber-500/5 rounded-full filter blur-3xl pointer-events-none"></div>
        <div className="absolute top-1/3 right-10 w-96 h-96 bg-indigo-500/5 rounded-full filter blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-10 left-20 w-80 h-80 bg-rose-500/5 rounded-full filter blur-3xl pointer-events-none"></div>

        <div className="relative z-10 space-y-10">
          {/* Header Section */}
          <div className="bg-white/80 backdrop-blur-md border border-white/60 rounded-[2.5rem] p-6 md:p-8 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 shadow-md relative overflow-hidden">
            <div className="flex items-center gap-5">
              <div className="w-16 h-16 bg-gradient-to-tr from-amber-500 to-orange-600 rounded-3xl flex items-center justify-center text-white text-2xl font-black shadow-lg shadow-amber-200/40 select-none">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-black uppercase tracking-tight text-stone-900 leading-none">
                  Welcome Back, <span className="bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">{user.name}</span>
                </h1>
                <div className="flex items-center gap-2 mt-2.5">
                  <span className="text-[9px] font-black text-stone-500 bg-stone-100 border border-stone-200/80 px-2.5 py-0.5 rounded-lg uppercase tracking-wider">
                    ID: {user.studentId || "PENDING"}
                  </span>
                  <span className="text-[9px] font-black text-stone-500 bg-stone-100 border border-stone-200/80 px-2.5 py-0.5 rounded-lg uppercase tracking-wider">
                    Roll: {user.rollNumber || "PENDING"}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4 self-stretch lg:self-auto justify-between lg:justify-end border-t border-stone-100 lg:border-t-0 pt-4 lg:pt-0">
              <NotificationPanel
                userRole="user"
                templeName={user?.templeName}
                studentClass={user?.studentClass}
              />

              <div className="bg-stone-50/50 border border-stone-200 px-4 py-3 rounded-2xl flex items-center gap-3 shadow-inner">
                <div className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse"></div>
                <div>
                  <p className="text-[8px] font-black text-stone-400 uppercase tracking-widest leading-none">Status</p>
                  <p className="text-xs font-black uppercase text-stone-850 mt-1">Verified & Paid</p>
                </div>
              </div>
            </div>
          </div>

          {/* Info Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
            {/* Card 1: Center */}
            <div className="bg-white/90 backdrop-blur-sm p-8 rounded-[2rem] border border-stone-200 shadow-sm flex flex-col justify-between hover:-translate-y-1.5 hover:shadow-md hover:border-amber-300 transition-all duration-300 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-full blur-2xl group-hover:bg-amber-500/10 transition-all"></div>
              <div>
                <div className="w-12 h-12 bg-amber-50 text-amber-600 border border-amber-100 rounded-2xl flex items-center justify-center mb-6 shadow-sm">
                  <MapPin size={22} />
                </div>
                <p className="text-[10px] font-black text-stone-400 uppercase tracking-widest mb-2">
                  Exam Centre / Venue
                </p>
                <h3 className="text-lg font-black uppercase text-stone-900 tracking-tight leading-tight">
                  {examCentreVenue}
                </h3>
              </div>
            </div>

            {/* Card 2: Your Class */}
            <div className="bg-gradient-to-br from-indigo-950 via-slate-900 to-stone-900 p-8 rounded-[2rem] text-white shadow-xl flex flex-col justify-between hover:-translate-y-1.5 hover:shadow-2xl transition-all duration-300 relative overflow-hidden group border border-indigo-900/40">
              <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full blur-2xl group-hover:bg-white/10 transition-all"></div>
              <div>
                <div className="w-12 h-12 bg-white/10 text-amber-400 rounded-2xl flex items-center justify-center mb-6 shadow-sm">
                  <GraduationCap size={22} />
                </div>
                <p className="text-[10px] font-black text-stone-400 opacity-60 uppercase tracking-widest mb-2">
                  Current Class
                </p>
                <h3 className="text-2xl font-black italic uppercase tracking-tight leading-tight text-amber-400">
                  {user.studentClass}
                </h3>
              </div>
            </div>

            {/* Card 3: Roll No & Section */}
            <div className="bg-white/90 backdrop-blur-sm p-8 rounded-[2rem] border border-stone-200 shadow-sm flex flex-col justify-between hover:-translate-y-1.5 hover:shadow-md hover:border-green-300 transition-all duration-300 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-24 h-24 bg-green-500/5 rounded-full blur-2xl group-hover:bg-green-500/10 transition-all"></div>
              <div>
                <div className="w-12 h-12 bg-green-50 text-green-600 border border-green-100 rounded-2xl flex items-center justify-center mb-6 shadow-sm">
                  <Receipt size={22} />
                </div>
                <p className="text-[10px] font-black text-stone-400 uppercase tracking-widest mb-2">
                  Roll No & Section
                </p>
                <h3 className="text-lg font-black uppercase text-stone-900 tracking-tight leading-none mb-4">
                  {user.rollNumber || "PENDING"} ({user.section || "A"})
                </h3>
              </div>
              <button
                onClick={() => setIsAdmitCardModalOpen(true)}
                className="w-full bg-gradient-to-r from-orange-500 to-rose-500 hover:from-orange-600 hover:to-rose-600 text-white text-[10px] font-black uppercase tracking-widest py-3.5 rounded-xl transition-all flex items-center justify-center gap-1.5 shadow-md hover:shadow-lg shadow-orange-500/20"
              >
                Admit Card <Download size={14} />
              </button>
            </div>
          </div>

          {/* --- NEXT CLASS PROGRESSION --- */}
          {nextClass && (
            <div className={`rounded-[2rem] p-8 border ${isUnlocked ? 'bg-gradient-to-br from-stone-900 to-stone-850 text-white border-stone-800' : 'bg-white border-stone-200'} relative overflow-hidden shadow-sm`}>
              <div className="absolute right-0 top-0 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl pointer-events-none"></div>
              <div className="flex flex-col md:flex-row items-center justify-between gap-8 relative z-10">
                <div className="flex items-center gap-6">
                  <div className={`w-16 h-16 rounded-2xl flex items-center justify-center shadow-inner ${isUnlocked ? 'bg-amber-500 text-white' : 'bg-stone-50 border border-stone-200 text-stone-400'}`}>
                    {isUnlocked ? <BookOpen size={28} /> : <Lock size={28} />}
                  </div>
                  <div>
                    <p className={`text-[10px] font-black uppercase tracking-widest mb-1.5 ${isUnlocked ? 'text-amber-400' : 'text-stone-400'}`}>
                      {isUnlocked ? 'Unlocked & Available' : 'Promotion Eligibility'}
                    </p>
                    <h3 className={`text-2xl font-black uppercase italic leading-none mb-2 ${isUnlocked ? 'text-white' : 'text-stone-800'}`}>
                      Next Level: {nextClass.grade}
                    </h3>
                    {!isUnlocked && unlockDate && (
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-[10px] font-bold text-stone-500 bg-stone-100 border border-stone-200 px-3 py-1 rounded-full inline-block">
                          Unlocks on {unlockDate.toLocaleDateString()}
                        </span>
                      </div>
                    )}
                    {isUnlocked && (
                      <p className="text-xs font-bold text-stone-300">
                        You are now eligible to progress to the next class level.
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  {isUnlocked ? (
                    <button className="px-8 py-4 bg-white text-stone-900 hover:bg-stone-100 rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-lg flex items-center gap-2 border border-stone-200">
                      Register Now <BookOpen size={16} />
                    </button>
                  ) : (
                    <div className="flex flex-col items-center bg-stone-50 border border-stone-200 p-4 rounded-2xl shadow-inner min-w-[120px]">
                      <div className="w-10 h-10 rounded-full border-4 border-stone-100 border-t-amber-500 animate-spin mb-2"></div>
                      <span className="text-[8px] font-black text-stone-400 uppercase tracking-widest">In Progress</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Exams & Results Section */}
          <div className="bg-white rounded-[2.5rem] border border-stone-200 shadow-sm overflow-hidden">
            <div className="p-8 border-b border-stone-100 bg-stone-50/50 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center border border-indigo-100">
                  <BookOpen size={20} />
                </div>
                <div>
                  <h2 className="text-lg font-black uppercase tracking-tight text-stone-900 leading-none">
                    Exams & Academic Results
                  </h2>
                  <p className="text-[10px] font-bold text-stone-400 uppercase mt-1 tracking-wider">Your exam papers and results summary</p>
                </div>
              </div>
            </div>

            <div className="p-8 space-y-6">
              {loadingExams ? (
                <div className="flex flex-col items-center justify-center py-16 gap-3">
                  <Loader2 className="animate-spin text-orange-600" size={32} />
                  <span className="text-[10px] font-black uppercase tracking-widest text-stone-400">Loading exam schedule...</span>
                </div>
              ) : exams.length === 0 ? (
                <div className="text-center py-16 bg-stone-50/50 rounded-[2rem] border-2 border-dashed border-stone-200">
                  <BookOpen size={48} className="mx-auto text-stone-200 mb-4" />
                  <p className="text-stone-400 font-bold italic text-sm">
                    No exams scheduled for your class yet.
                  </p>
                  <p className="text-[10px] text-stone-300 uppercase mt-2 font-black tracking-widest">Please check back later</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {exams.map((exam) => (
                    <div key={exam._id} className="p-6 bg-white rounded-[2rem] border border-stone-200 shadow-sm hover:shadow-md hover:border-indigo-200 transition-all duration-300 flex flex-col justify-between group relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 rounded-full blur-2xl group-hover:bg-indigo-500/10 transition-all"></div>
                      <div>
                        <div className="flex justify-between items-center mb-4">
                          <span className="text-[8px] font-black uppercase tracking-widest text-stone-400 bg-stone-100 border border-stone-200 px-2.5 py-1 rounded-lg">
                            ID: {exam.examId}
                          </span>
                          <span className={`text-[8px] font-black uppercase px-2.5 py-1 rounded-lg ${exam.examType === "online" ? "bg-green-50 text-green-700 border border-green-200" : "bg-stone-50 text-stone-700 border border-stone-200"}`}>
                            {exam.examType}
                          </span>
                        </div>
                        <h4 className="text-lg font-black uppercase text-stone-900 leading-tight">
                          {exam.subject}
                        </h4>
                        <p className="text-xs font-semibold text-stone-500 mt-2 flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
                          {exam.date} at {exam.time} ({exam.duration} Min) • {exam.questions?.reduce((acc: number, q: any) => acc + (q.marks || 1), 0) || 0} Marks
                        </p>
                        {exam.examType === "offline" && (
                          <p className="text-xs font-semibold text-stone-500 mt-2 flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-orange-500"></span>
                            Venue: {exam.venue || "Not Assigned"}
                          </p>
                        )}
                      </div>

                      <div className="mt-6 pt-4 border-t border-stone-100 flex justify-between items-center">
                        {exam.hasTaken ? (
                          <div className="w-full space-y-3 bg-stone-50 border border-stone-100 p-4 rounded-2xl shadow-inner">
                            <div className="flex justify-between text-xs font-bold items-center">
                              <span className="text-stone-400 tracking-wider">YOUR SCORE</span>
                              <span className={`font-black text-sm ${exam.scoreDetails.status === "Passed" ? "text-green-600" : "text-red-600"}`}>
                                {exam.scoreDetails.marksObtained} / {exam.scoreDetails.totalMarks} ({exam.scoreDetails.percentage}%)
                              </span>
                            </div>
                            
                            {/* Progress bar for score */}
                            <div className="w-full bg-stone-200 h-2 rounded-full overflow-hidden">
                              <div 
                                className={`h-full rounded-full transition-all duration-500 ${exam.scoreDetails.status === "Passed" ? "bg-gradient-to-r from-green-500 to-emerald-500" : "bg-gradient-to-r from-red-500 to-rose-500"}`} 
                                style={{ width: `${exam.scoreDetails.percentage}%` }}
                              ></div>
                            </div>

                            <div className="flex justify-between items-center pt-1">
                              <span className="text-[10px] font-black text-stone-400">GRADE: {exam.scoreDetails.grade}</span>
                              <span className={`text-[9px] font-black uppercase px-2.5 py-1 rounded-full ${exam.scoreDetails.status === "Passed" ? "bg-green-100 text-green-700 border border-green-200" : "bg-red-100 text-red-700 border border-red-200"}`}>
                                {exam.scoreDetails.status}
                              </span>
                            </div>
                            <button
                              onClick={() => handlePrintResult(exam)}
                              className="w-full mt-3 bg-white hover:bg-stone-50 text-stone-700 border border-stone-200 hover:border-stone-300 text-[9px] font-black uppercase tracking-widest py-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5 shadow-sm"
                            >
                              <Printer size={12} /> Print Result Slip
                            </button>
                          </div>
                        ) : exam.examType === "online" ? (
                          <button
                            onClick={() => router.push(`/user/exam?examId=${exam._id}`)}
                            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white text-[10px] font-black uppercase tracking-widest py-3 rounded-xl transition-all flex items-center justify-center gap-1 shadow-md hover:shadow-lg shadow-indigo-600/20"
                          >
                            Start Online Exam
                          </button>
                        ) : (
                          <div className="w-full text-center bg-stone-100 text-stone-400 border border-stone-200 py-3 rounded-xl flex items-center justify-center gap-2">
                            <span className="text-[9px] font-black uppercase tracking-widest">Offline Test (Give at center)</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Syllabus Section */}
          <div className="bg-white rounded-[2.5rem] border border-stone-200 shadow-sm overflow-hidden">
            <div className="p-8 border-b border-stone-100 bg-stone-50/50 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center border border-blue-100">
                  <BookOpen size={20} />
                </div>
                <div>
                  <h2 className="text-lg font-black uppercase tracking-tight text-stone-900 leading-none">
                    Your Syllabus
                  </h2>
                  <p className="text-[10px] font-bold text-stone-400 uppercase mt-1 tracking-wider">Download syllabus files for your class</p>
                </div>
              </div>
            </div>

            <div className="p-8">
              {syllabusData?.syllabi && syllabusData.syllabi.length > 0 ? (
                <div className="space-y-4">
                  {syllabusData.syllabi.map((file: any, fIdx: number) => (
                    <div key={fIdx} className="flex flex-col md:flex-row items-center justify-between p-6 bg-white rounded-[2rem] border border-stone-200 gap-6 hover:border-blue-200 hover:shadow-md transition-all duration-300 relative overflow-hidden group">
                      <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-full blur-2xl group-hover:bg-blue-500/10 transition-all"></div>
                      <div className="flex items-center gap-6 overflow-hidden relative z-10">
                        <div className="w-14 h-14 bg-blue-50 text-blue-600 border border-blue-100 rounded-2xl flex items-center justify-center shadow-sm shrink-0">
                          <BookOpen size={28} />
                        </div>
                        <div className="overflow-hidden">
                          <h4 className="text-sm font-black uppercase truncate max-w-xs sm:max-w-md text-stone-800">
                            {file.fileName}
                          </h4>
                          <p className="text-[9px] font-bold text-stone-400 uppercase mt-1">
                            Uploaded on {new Date(file.uploadedAt || Date.now()).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-3 shrink-0 w-full md:w-auto relative z-10">
                        <button
                          onClick={() => {
                            const newWindow = window.open();
                            newWindow?.document.write(
                              `<iframe src="${file.fileData}" frameborder="0" style="border:0; top:0px; left:0px; bottom:0px; right:0px; width:100%; height:100%;" allowfullscreen></iframe>`
                            );
                          }}
                          className="flex-1 md:flex-initial px-6 py-3.5 bg-stone-50 border border-stone-200 rounded-xl font-black text-[9px] uppercase tracking-widest hover:bg-stone-100 transition-all text-stone-700 shadow-sm"
                        >
                          View
                        </button>
                        <button
                          onClick={() => handleDownload(file)}
                          className="flex-1 md:flex-initial px-8 py-3.5 bg-stone-900 text-white rounded-xl font-black text-[9px] uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-black transition-all shadow-md"
                        >
                          <Download size={12} /> Download
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-16 bg-stone-50/50 rounded-[2rem] border-2 border-dashed border-stone-200">
                  <BookOpen size={48} className="mx-auto text-stone-200 mb-4" />
                  <p className="text-stone-400 font-bold italic text-sm">
                    No syllabus uploaded for {user.studentClass} yet.
                  </p>
                  <p className="text-[10px] text-stone-300 uppercase mt-2 font-black tracking-widest">
                    Please check back later
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Admit Card Modal */}
        {isAdmitCardModalOpen && (
          <div className="fixed inset-0 bg-stone-900/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
            <div className="bg-white rounded-[2.5rem] shadow-2xl border border-stone-100 w-full max-w-md p-8 sm:p-10 animate-in fade-in duration-300">
              <div id="admit-card-print" className="border-4 border-double border-stone-900 p-6 rounded-2xl text-center space-y-4">
                <h2 className="text-xl font-black text-orange-600 uppercase tracking-tight">
                  Exam Entry Permit
                </h2>
                <p className="text-[10px] font-black text-stone-400 uppercase tracking-widest -mt-2">
                  Admit Card
                </p>
                
                <div className="border-t border-b border-stone-200 py-4 text-left text-sm font-semibold text-stone-700 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-stone-400 text-xs">Student ID:</span>
                    <span>{user.studentId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-stone-400 text-xs">Roll No:</span>
                    <span>{user.rollNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-stone-400 text-xs">Name:</span>
                    <span>{user.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-stone-400 text-xs">Class:</span>
                    <span>{user.studentClass} ({user.section})</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-stone-400 text-xs">Exam Centre:</span>
                    <span className="truncate max-w-[180px]">{examCentreVenue}</span>
                  </div>
                </div>

                {/* Subject Wise Schedule List */}
                {exams && exams.length > 0 && (
                  <div className="border-b border-stone-200 pb-4 text-left">
                    <p className="text-[10px] font-black text-stone-400 uppercase tracking-widest mb-3">
                      Subject Wise Schedule
                    </p>
                    <div className="space-y-2.5 max-h-[160px] overflow-y-auto pr-1">
                      {exams.map((ex, exIdx) => (
                        <div key={exIdx} className="bg-stone-50 border border-stone-200 p-3 rounded-xl flex justify-between items-center text-xs">
                          <div>
                            <p className="font-black text-stone-900 uppercase truncate max-w-[155px]">{ex.subject}</p>
                            <p className="text-[10px] font-bold text-stone-400 mt-0.5">{ex.date} | {ex.time}</p>
                          </div>
                          <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-full ${ex.examType === 'online' ? 'bg-green-100 text-green-700 border border-green-200' : 'bg-stone-200 text-stone-700 border border-stone-300'}`}>
                            {ex.examType}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <p className="text-[10px] text-stone-400 italic">
                  Please present this slip at the exam venue center.
                </p>
              </div>

              <div className="flex gap-4 mt-8">
                <button
                  onClick={() => setIsAdmitCardModalOpen(false)}
                  className="flex-1 py-3 bg-stone-100 hover:bg-stone-200 text-stone-600 rounded-xl font-black text-xs uppercase tracking-widest transition"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    const printWindow = window.open("", "_blank");
                    if (!printWindow) return;

                    const examsHTML = exams && exams.length > 0
                      ? `
                        <div class="schedule-section">
                          <h3 class="schedule-title">Subject Wise Schedule</h3>
                          <div class="exam-list">
                            ${exams.map(ex => `
                              <div class="exam-item">
                                <div class="exam-details">
                                  <p class="exam-subject">${ex.subject}</p>
                                  <p class="exam-time">${ex.date} | ${ex.time}</p>
                                </div>
                                <span class="exam-mode ${ex.examType === 'online' ? 'online' : 'offline'}">${ex.examType}</span>
                              </div>
                            `).join("")}
                          </div>
                        </div>
                      `
                      : "";

                    printWindow.document.write(`
                      <html>
                        <head>
                          <title>Admit Card - ${user.name}</title>
                          <style>
                            @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;800;900&display=swap');
                            body {
                              font-family: 'Outfit', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
                              padding: 40px;
                              display: flex;
                              justify-content: center;
                              align-items: center;
                              background-color: #fff;
                              margin: 0;
                            }
                            .card {
                              border: 4px double #1c1917;
                              padding: 28px;
                              display: inline-block;
                              border-radius: 20px;
                              text-align: center;
                              width: 100%;
                              max-width: 420px;
                              box-sizing: border-box;
                            }
                            h2 {
                              color: #ea580c;
                              text-align: center;
                              margin-top: 0;
                              margin-bottom: 4px;
                              font-weight: 900;
                              font-size: 22px;
                              text-transform: uppercase;
                              letter-spacing: -0.5px;
                            }
                            .subtitle {
                              text-align: center;
                              font-size: 10px;
                              color: #a8a29e;
                              text-transform: uppercase;
                              font-weight: 900;
                              margin-bottom: 20px;
                              letter-spacing: 2px;
                            }
                            .info-table {
                              width: 100%;
                              border-top: 1px solid #e7e5e4;
                              border-bottom: 1px solid #e7e5e4;
                              padding: 12px 0;
                              margin-bottom: 20px;
                            }
                            .info-row {
                              display: flex;
                              justify-content: space-between;
                              padding: 6px 0;
                              font-size: 13px;
                              font-weight: 600;
                              color: #44403c;
                            }
                            .info-label {
                              color: #a8a29e;
                              font-size: 12px;
                            }
                            .info-value {
                              text-align: right;
                            }
                            .schedule-section {
                              text-align: left;
                              border-bottom: 1px solid #e7e5e4;
                              padding-bottom: 16px;
                              margin-bottom: 16px;
                            }
                            .schedule-title {
                              font-size: 10px;
                              font-weight: 900;
                              color: #a8a29e;
                              text-transform: uppercase;
                              letter-spacing: 1.5px;
                              margin-bottom: 12px;
                              margin-top: 0;
                            }
                            .exam-list {
                              display: flex;
                              flex-direction: column;
                              gap: 8px;
                            }
                            .exam-item {
                              background-color: #fafaf9;
                              border: 1px solid #e7e5e4;
                              border-radius: 12px;
                              padding: 10px 12px;
                              display: flex;
                              justify-content: space-between;
                              align-items: center;
                              font-size: 12px;
                            }
                            .exam-details {
                              text-align: left;
                            }
                            .exam-subject {
                              font-weight: 900;
                              color: #1c1917;
                              text-transform: uppercase;
                              margin: 0;
                            }
                            .exam-time {
                              font-size: 10px;
                              font-weight: 700;
                              color: #a8a29e;
                              margin: 2px 0 0 0;
                            }
                            .exam-mode {
                              font-size: 8px;
                              font-weight: 900;
                              text-transform: uppercase;
                              padding: 2px 8px;
                              border-radius: 9999px;
                            }
                            .exam-mode.online {
                              background-color: #dcfce7;
                              color: #15803d;
                              border: 1px solid #bbf7d0;
                            }
                            .exam-mode.offline {
                              background-color: #f5f5f4;
                              color: #57534e;
                              border: 1px solid #e7e5e4;
                            }
                            .footer {
                              font-size: 10px;
                              color: #a8a29e;
                              font-style: italic;
                              margin-top: 16px;
                              margin-bottom: 0;
                            }
                            @media print {
                              body {
                                padding: 0;
                                background: none;
                              }
                              .card {
                                border-radius: 16px;
                                box-shadow: none;
                              }
                            }
                          </style>
                        </head>
                        <body>
                          <div class="card">
                            <h2>EXAM ENTRY PERMIT</h2>
                            <div class="subtitle">Admit Card</div>
                            
                            <div class="info-table">
                              <div class="info-row">
                                <span class="info-label">Student ID:</span>
                                <span class="info-value">${user.studentId}</span>
                              </div>
                              <div class="info-row">
                                <span class="info-label">Roll No:</span>
                                <span class="info-value">${user.rollNumber}</span>
                              </div>
                              <div class="info-row">
                                <span class="info-label">Name:</span>
                                <span class="info-value">${user.name}</span>
                              </div>
                              <div class="info-row">
                                <span class="info-label">Class:</span>
                                <span class="info-value">${user.studentClass} (${user.section})</span>
                              </div>
                              <div class="info-row">
                                <span class="info-label">Exam Centre:</span>
                                <span class="info-value">${examCentreVenue}</span>
                              </div>
                            </div>
                            
                            ${examsHTML}
                            
                            <p class="footer">Please present this slip at the exam venue center.</p>
                          </div>
                          <script>
                            window.onload = function() {
                              window.print();
                            };
                          </script>
                        </body>
                      </html>
                    `);
                    printWindow.document.close();
                  }}
                  className="flex-1 py-3 bg-orange-600 hover:bg-orange-700 text-white rounded-xl font-black text-xs uppercase tracking-widest transition shadow-md flex items-center justify-center gap-1.5"
                >
                  <Printer size={14} /> Print Card
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
