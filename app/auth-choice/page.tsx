"use client";
import React from "react";
import { useRouter } from "next/navigation";
import { ShieldCheck, User, ArrowRight } from "lucide-react";

export default function AuthChoice() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-stone-50 flex items-center justify-center p-6">
      <div className="max-w-4xl w-full">
        {/* Header Part */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-black text-stone-900 uppercase tracking-tighter mb-4">
            Identify{" "}
            <span className="text-orange-600 font-medium">Yourself</span>
          </h1>
          <p className="text-stone-500 font-medium">
            Please select your access level to continue
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Sub-Admin Option */}
          <div
            onClick={() => router.push("/subadmin/auth")}
            className="group cursor-pointer bg-white p-10 rounded-[3rem] shadow-xl shadow-stone-200 border border-stone-100 hover:border-orange-500 transition-all duration-500 hover:-translate-y-2"
          >
            <div className="w-16 h-16 bg-orange-100 text-orange-600 rounded-2xl flex items-center justify-center mb-8 group-hover:bg-orange-600 group-hover:text-white transition-colors duration-500">
              <ShieldCheck size={32} />
            </div>
            <h2 className="text-2xl font-bold text-stone-900 mb-2">
              I am Sub-Admin
            </h2>
            <p className="text-stone-400 text-sm leading-relaxed mb-6">
              Manage temple approvals, update events, and handle daily directory
              tasks.
            </p>
            <div className="flex items-center text-orange-600 font-bold text-sm">
              Login as Sub-Admin{" "}
              <ArrowRight
                size={16}
                className="ml-2 group-hover:ml-4 transition-all"
              />
            </div>
          </div>

          {/* User Option */}
          <div
            onClick={() => router.push("/user/login")}
            className="group cursor-pointer bg-white p-10 rounded-[3rem] shadow-xl shadow-stone-200 border border-stone-100 hover:border-orange-500 transition-all duration-500 hover:-translate-y-2"
          >
            <div className="w-16 h-16 bg-orange-100 text-orange-600 rounded-2xl flex items-center justify-center mb-8 group-hover:bg-orange-600 group-hover:text-white transition-colors duration-500">
              <User size={32} />
            </div>
            <h2 className="text-2xl font-bold text-stone-900 mb-2">
              I am Student
            </h2>
            <p className="text-stone-400 text-sm leading-relaxed mb-6">
              Browse temples, write reviews, and connect with the community.
            </p>
            <div className="flex items-center text-stone-900 font-bold text-sm">
              Login as Student{" "}
              <ArrowRight
                size={16}
                className="ml-2 group-hover:ml-4 transition-all"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
