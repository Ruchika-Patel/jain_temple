"use client";
import React, { useState, useEffect, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Clock, ArrowLeft, ArrowRight, CheckCircle, Loader2 } from "lucide-react";
import StatusModal from "@/components/StatusModal";

interface Question {
  _id: string;
  questionText: string;
  questionType: "objective" | "subjective";
  options: string[];
  marks: number;
}

function StudentExamContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const examId = searchParams.get("examId");

  const [exam, setExam] = useState<any>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Answers State: { [questionId]: { selectedOptionIndex, writtenAnswerText } }
  const [answers, setAnswers] = useState<{
    [questionId: string]: { selectedOptionIndex: number; writtenAnswerText: string };
  }>({});

  // Timer State
  const [timeLeft, setTimeLeft] = useState<number>(0); // in seconds
  const timerRef = useRef<NodeJS.Timeout | null>(null);

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

  useEffect(() => {
    const savedUser = localStorage.getItem("current_user");
    if (!savedUser) {
      router.push("/user/login");
      return;
    }
    setUser(JSON.parse(savedUser));
  }, []);

  useEffect(() => {
    if (!examId || !user) return;

    const fetchExamDetails = async () => {
      try {
        const res = await fetch("/api/admin/exams");
        const data = await res.json();
        if (data.success) {
          const foundExam = data.data.find((e: any) => e._id === examId);
          if (foundExam) {
            setExam(foundExam);
            setQuestions(
              (foundExam.questions || []).map((q: any) => ({
                ...q,
                marks: q.marks || 1,
              }))
            );

            // Set Timer
            setTimeLeft(foundExam.duration * 60);

            // Initialize empty answers mapping
            const initAnswers: any = {};
            foundExam.questions.forEach((q: any) => {
              initAnswers[q._id] = { selectedOptionIndex: -1, writtenAnswerText: "" };
            });
            setAnswers(initAnswers);
          }
        }
      } catch (error) {
        console.error("Error loading exam:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchExamDetails();
  }, [examId, user]);

  // Handle countdown
  useEffect(() => {
    if (timeLeft <= 0 && !loading && exam) {
      handleAutoSubmit();
      return;
    }

    if (loading || !exam) return;

    timerRef.current = setTimeout(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [timeLeft, loading, exam]);

  const handleSelectOption = (qId: string, optIndex: number) => {
    setAnswers({
      ...answers,
      [qId]: { ...answers[qId], selectedOptionIndex: optIndex },
    });
  };

  const handleWriteSubjective = (qId: string, text: string) => {
    setAnswers({
      ...answers,
      [qId]: { ...answers[qId], writtenAnswerText: text },
    });
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  const prepareSubmitPayload = () => {
    const formattedAnswers = Object.keys(answers).map((qId) => ({
      questionId: qId,
      selectedOptionIndex: answers[qId].selectedOptionIndex,
      writtenAnswerText: answers[qId].writtenAnswerText,
    }));
    return {
      studentId: user._id,
      examId,
      answers: formattedAnswers,
    };
  };

  const handleAutoSubmit = async () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    showModal("loading", "Time's Up!", "Auto-submitting your test paper...");
    await executeSubmit();
  };

  const handleManualSubmit = async () => {
    if (!confirm("Are you sure you want to finish and submit your exam?")) return;
    if (timerRef.current) clearTimeout(timerRef.current);
    showModal("loading", "Submitting...", "Grading your responses...");
    await executeSubmit();
  };

  const executeSubmit = async () => {
    const payload = prepareSubmitPayload();
    try {
      const res = await fetch("/api/student/exams", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.success) {
        showModal("success", "Submitted!", "Exam submitted successfully! Redirecting in 2s...");
        setTimeout(() => {
          router.push("/user/dashboard");
        }, 2000);
      } else {
        showModal("error", "Submission Failed", data.message || "Failed to save responses");
      }
    } catch (error) {
      showModal("error", "Network Error", "Failed to contact grading server.");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-stone-50 flex flex-col items-center justify-center">
        <Loader2 className="animate-spin text-orange-600 mb-4" size={48} />
        <p className="text-stone-400 font-bold uppercase text-[10px] tracking-widest">
          Securing exam connection...
        </p>
      </div>
    );
  }

  if (!exam) {
    return (
      <div className="min-h-screen bg-stone-50 flex flex-col items-center justify-center p-6 text-center">
        <h3 className="text-xl font-bold text-stone-700">Exam not found or expired.</h3>
        <button
          onClick={() => router.push("/user/dashboard")}
          className="mt-4 px-6 py-3 bg-stone-900 text-white rounded-xl font-bold text-xs uppercase"
        >
          Back to Dashboard
        </button>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];

  return (
    <div className="min-h-screen bg-[#F8F7F5] font-sans pb-24">
      {/* Fixed Sticky Header for Exam Stats */}
      <nav className="bg-white border-b border-stone-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 md:px-8 h-20 flex items-center justify-between">
          <div>
            <h1 className="text-lg font-black text-stone-900 uppercase leading-none">
              {exam.subject}
            </h1>
            <p className="text-[9px] font-black text-stone-400 uppercase tracking-widest mt-1">
              {exam.grade} • Active Test Session
            </p>
          </div>

          <div className="flex items-center gap-3 bg-amber-50 px-4 py-2 rounded-2xl border border-amber-200 shadow-sm shrink-0">
            <Clock className="text-orange-600 animate-pulse" size={18} />
            <span className="text-base font-black text-orange-950 tabular-nums">
              {formatTime(timeLeft)}
            </span>
          </div>
        </div>
      </nav>

      {/* Main Test Canvas */}
      <main className="max-w-3xl mx-auto px-4 md:px-6 mt-8 md:mt-12 space-y-6">
        {/* Progress Tracker */}
        <div className="bg-white p-5 rounded-[2rem] border border-stone-200 shadow-sm flex items-center justify-between">
          <span className="text-xs font-black text-stone-400 uppercase tracking-widest">
            Question {currentQuestionIndex + 1} of {questions.length}
          </span>
          <div className="h-2 w-32 md:w-48 bg-stone-100 rounded-full overflow-hidden">
            <div
              className="bg-orange-600 h-full transition-all duration-300"
              style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Question Card */}
        {currentQuestion && (
          <div className="bg-white p-8 md:p-12 rounded-[2.5rem] border border-stone-200 shadow-sm space-y-8 min-h-[300px]">
            <div className="space-y-3">
              <span className="bg-indigo-50 text-indigo-700 text-[9px] font-black uppercase px-2.5 py-1 rounded-full border border-indigo-100">
                Marks: {currentQuestion.marks || 1}
              </span>
              <h3 className="text-xl md:text-2xl font-black text-stone-950 leading-snug">
                {currentQuestion.questionText}
              </h3>
            </div>

            {/* Answer Box rendering */}
            {currentQuestion.questionType === "objective" ? (
              <div className="grid grid-cols-1 gap-3 pt-4">
                {currentQuestion.options.map((opt, oIndex) => {
                  const isSelected = answers[currentQuestion._id]?.selectedOptionIndex === oIndex;
                  return (
                    <button
                      key={oIndex}
                      type="button"
                      onClick={() => handleSelectOption(currentQuestion._id, oIndex)}
                      className={`w-full text-left px-6 py-4 rounded-2xl border-2 transition-all font-semibold text-sm flex items-center justify-between ${
                        isSelected
                          ? "bg-orange-50 border-orange-500 text-orange-950 shadow-sm"
                          : "bg-stone-50 border-stone-200 text-stone-700 hover:bg-stone-100/60"
                      }`}
                    >
                      <span>{opt}</span>
                      <div
                        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                          isSelected ? "border-orange-500 bg-orange-500 text-white" : "border-stone-400"
                        }`}
                      >
                        {isSelected && <span className="w-2 h-2 rounded-full bg-white"></span>}
                      </div>
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="pt-4 space-y-1">
                <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest ml-1">
                  Write your answer below
                </label>
                <textarea
                  rows={6}
                  className="w-full px-6 py-4 bg-stone-50 border border-stone-200 rounded-2xl outline-none focus:ring-2 focus:ring-amber-500 text-stone-900 font-semibold text-sm transition shadow-sm resize-none"
                  placeholder="Type your explanation here..."
                  value={answers[currentQuestion._id]?.writtenAnswerText || ""}
                  onChange={(e) => handleWriteSubjective(currentQuestion._id, e.target.value)}
                />
              </div>
            )}
          </div>
        )}

        {/* Navigation Triggers */}
        <div className="flex gap-4 items-center">
          <button
            type="button"
            disabled={currentQuestionIndex === 0}
            onClick={() => setCurrentQuestionIndex((prev) => prev - 1)}
            className="flex-1 py-4 bg-white border border-stone-200 text-stone-700 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-stone-100 transition flex items-center justify-center gap-1.5 disabled:opacity-50 disabled:hover:bg-white"
          >
            <ArrowLeft size={16} /> Prev Question
          </button>

          {currentQuestionIndex < questions.length - 1 ? (
            <button
              type="button"
              onClick={() => setCurrentQuestionIndex((prev) => prev + 1)}
              className="flex-1 py-4 bg-stone-900 text-white rounded-xl font-black text-xs uppercase tracking-widest hover:bg-black transition flex items-center justify-center gap-1.5 shadow"
            >
              Next Question <ArrowRight size={16} />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleManualSubmit}
              className="flex-1 py-4 bg-orange-600 text-white rounded-xl font-black text-xs uppercase tracking-widest hover:bg-orange-700 transition flex items-center justify-center gap-1.5 shadow-lg shadow-orange-200 animate-bounce active:scale-95"
            >
              <CheckCircle size={16} /> Submit Exam
            </button>
          )}
        </div>
      </main>

      {/* Alert Modal */}
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

export default function StudentExam() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-stone-50 flex items-center justify-center">
          <Loader2 className="animate-spin text-orange-600" size={48} />
        </div>
      }
    >
      <StudentExamContent />
    </Suspense>
  );
}
