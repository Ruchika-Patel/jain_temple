"use client";
import React, { useState } from "react";
import {
    PlusCircle,
    User,
    Menu,
    X,
    LayoutDashboard,
    Users
} from "lucide-react";
import { useRouter } from "next/navigation";

interface NavbarProps {
    view: string;
    setView: (view: any) => void;
    selectedTempleId: string | number | null;
    setSelectedTempleId: (id: string | number | null) => void;
}

const Navbar: React.FC<NavbarProps> = ({
    view,
    setView,
    selectedTempleId,
    setSelectedTempleId
}) => {
    const router = useRouter();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const navLinks = [
        {
            label: "Directory",
            icon: <Users size={18} />,
            active: view === "home" && !selectedTempleId,
            onClick: () => {
                setView("home");
                setSelectedTempleId(null);
            }
        },
        {
            label: "Register Temple",
            icon: <PlusCircle size={18} />,
            active: view === "register",
            onClick: () => setView("register"),
            primary: true
        },
        {
            label: "Admin Panel",
            icon: <LayoutDashboard size={18} />,
            active: view === "admin",
            onClick: () => setView("admin")
        },
        {
            label: "Select Role",
            icon: <User size={18} />,
            active: false,
            onClick: () => router.push("/auth-choice")
        }
    ];

    return (
        <nav className="bg-white/80 backdrop-blur-md border-b sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16 items-center">
                    {/* Logo */}
                    <div
                        className="flex items-center cursor-pointer group"
                        onClick={() => {
                            setView("home");
                            setSelectedTempleId(null);
                            setIsMenuOpen(false);
                        }}
                    >
                        <img
                            src="https://amangupta.f24tech.com/jainconnect.png"
                            alt="Logo"
                            className="w-10 h-10 object-contain mr-3 group-hover:scale-110 transition-transform"
                        />
                        <span className="text-xl font-bold text-stone-800 tracking-tight">
                            Jain<span className="text-amber-600">Pathshala</span>
                        </span>
                    </div>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex space-x-4 items-center">
                        {navLinks.map((link) => (
                            <button
                                key={link.label}
                                onClick={() => {
                                    link.onClick();
                                    setIsMenuOpen(false);
                                }}
                                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${link.primary
                                    ? "bg-amber-600 text-white hover:bg-amber-700 hover:shadow-lg"
                                    : link.active
                                        ? "bg-amber-100 text-amber-700"
                                        : "text-stone-500 hover:text-stone-800 hover:bg-stone-50"
                                    }`}
                            >
                                {link.icon}
                                {link.label}
                            </button>
                        ))}
                    </div>

                    {/* Mobile Menu Toggle */}
                    <div className="md:hidden flex items-center">
                        <button
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className="p-2 text-stone-600 hover:bg-stone-100 rounded-lg transition-colors"
                        >
                            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu Overlay */}
            {isMenuOpen && (
                <div className="md:hidden bg-white border-b absolute w-full left-0 shadow-2xl animate-in slide-in-from-top duration-300">
                    <div className="px-4 py-6 space-y-3">
                        {navLinks.map((link) => (
                            <button
                                key={link.label}
                                onClick={() => {
                                    link.onClick();
                                    setIsMenuOpen(false);
                                }}
                                className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl text-sm font-bold transition-all ${link.primary
                                    ? "bg-amber-600 text-white shadow-lg"
                                    : link.active
                                        ? "bg-amber-50 text-amber-700 border border-amber-100"
                                        : "text-stone-600 hover:bg-stone-50"
                                    }`}
                            >
                                <div className={`${link.primary ? "text-white" : link.active ? "text-amber-600" : "text-stone-400"}`}>
                                    {link.icon}
                                </div>
                                {link.label}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </nav>
    );
};

export default Navbar;
