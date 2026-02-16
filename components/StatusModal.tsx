"use client";
import React, { useEffect } from "react";
import { CheckCircle, XCircle, Loader2, Sparkles } from "lucide-react";

interface StatusModalProps {
    isOpen: boolean;
    status: "success" | "error" | "loading";
    title: string;
    message: string;
    onClose?: () => void;
}

export default function StatusModal({
    isOpen,
    status,
    title,
    message,
    onClose,
}: StatusModalProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-stone-900/40 backdrop-blur-sm animate-in fade-in duration-300" />
            <div className="relative w-full max-w-sm bg-white rounded-[2.5rem] shadow-2xl p-8 text-center animate-in zoom-in-95 duration-300 border border-stone-100">
                <div className="flex justify-center mb-6">
                    {status === "success" && (
                        <div className="w-20 h-20 bg-green-50 text-green-500 rounded-3xl flex items-center justify-center shadow-inner relative overflow-hidden">
                            <CheckCircle size={40} className="relative z-10 animate-in zoom-in duration-500 delay-100" />
                            <Sparkles className="absolute top-2 right-2 text-green-200 animate-pulse" size={16} />
                        </div>
                    )}
                    {status === "error" && (
                        <div className="w-20 h-20 bg-red-50 text-red-500 rounded-3xl flex items-center justify-center shadow-inner">
                            <XCircle size={40} className="animate-in zoom-in duration-500" />
                        </div>
                    )}
                    {status === "loading" && (
                        <div className="w-20 h-20 bg-amber-50 text-amber-600 rounded-3xl flex items-center justify-center shadow-inner">
                            <Loader2 size={40} className="animate-spin" />
                        </div>
                    )}
                </div>

                <h3 className="text-2xl font-black text-stone-900 uppercase tracking-tight mb-2 italic">
                    {title}
                </h3>
                <p className="text-sm font-bold text-stone-500 leading-relaxed italic">
                    {message}
                </p>

                {status !== "loading" && onClose && (
                    <button
                        onClick={onClose}
                        className="mt-8 w-full py-4 bg-stone-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] hover:bg-stone-800 transition-all shadow-lg active:scale-95"
                    >
                        Got it
                    </button>
                )}
            </div>
        </div>
    );
}
