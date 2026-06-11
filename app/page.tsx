"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useEffect, useState, useMemo } from "react";
import {
  Search,
  LogIn,
  MapPin,
  Phone,
  Mail,
  PlusCircle,
  CheckCircle2,
  ShieldCheck,
  Image as ImageIcon,
  Menu,
  X,
  User,
  ArrowRight,
  ArrowLeft,
  Globe,
  Trash2,
  Edit2,
  ChevronLeft,
  Star,
  Calendar,
  History,
  Lock,
  Upload,
  ChevronRight,
  Megaphone,
  Users,
  BookOpen,
  Download,
} from "lucide-react";
import StatusModal from "@/components/StatusModal";
import Navbar from "@/components/Navbar";

// --- Interfaces ---

interface Review {
  _id?: string;
  id?: string | number;
  user: string;
  rating: number;
  comment: string;
  date: string;
}

interface Event {
  _id?: string;
  id?: number;
  title: string;
  date: string;
  description: string;
  image?: string; // Added image field
}

interface Leader {
  name: string;
  designation: string;
  phone: string;
  email: string;
}
interface committee {
  name: string;
  designation: string;
  phone: string;
  email: string;
}

interface Temple {
  _id?: string;
  id?: string | number;
  name: string;
  country: string;
  state: string;
  city: string;
  locality: string;
  pincode: string;
  images: string[]; // Changed from single image to array
  status: "verified" | "pending";
  displayId?: string; // New field for sequential ID
  description?: string;
  history?: string; // New field
  events: Event[]; // New field
  leaders: Leader[];
  committee?: committee[]; // New field
  reviews: Review[]; // New field
  rating: number; // Average rating
}

interface Banner {
  _id: string;
  imageUrl: string;
  title?: string;
  link?: string;
  isActive: boolean;
  createdAt: string;
}

type ViewState = "home" | "register" | "admin" | "detail" | "classes";

// --- Mock Data ---

const TEMPLE_IMAGES: string[] = [
  "https://tse1.mm.bing.net/th/id/OIP.Fq5eUphz076Nj16lkyUwPQHaE9?w=1023&h=685&rs=1&pid=ImgDetMain&o=7&rm=3",
  "https://mysticalbee.com/wp-content/uploads/2017/09/Jainism-temple.jpg",
  "https://images.unsplash.com/photo-1561488134-0397858971f4?auto=format&fit=crop&q=80&w=800",
  "https://images.unsplash.com/photo-1548013146-72479768bbaa?auto=format&fit=crop&q=80&w=800",
  "https://images.unsplash.com/photo-1605649487215-476786a5b92d?auto=format&fit=crop&q=80&w=800",
];

const INITIAL_TEMPLES: Temple[] = [
  {
    id: 1,
    name: "Shri Digamber Jain Atishaya Kshetra",
    country: "India",
    state: "Rajasthan",
    city: "Tijara",
    locality: "Alwar Road",
    pincode: "301411",
    images: [TEMPLE_IMAGES[0], TEMPLE_IMAGES[4]],
    status: "verified",
    description:
      "A historic and spiritually significant temple known for its peaceful environment and ancient idols.",
    history:
      "Established centuries ago, this Kshetra is dedicated to Lord Chandraprabhu. It is believed that the main idol was recovered from underground in 1956.",
    events: [
      {
        id: 1,
        title: "Annual Rath Yatra",
        date: "2024-04-15",
        description: "Grand procession of the Lord through the city streets.",
      },
      {
        id: 2,
        title: "Mahavir Jayanti",
        date: "2024-04-21",
        description: "Special prayers and community feast.",
      },
    ],
    rating: 4.8,
    reviews: [
      {
        id: 101,
        user: "Rohan Jain",
        rating: 5,
        comment: "Extremely peaceful place. The dharamshala is very clean.",
        date: "2023-11-12",
      },
      {
        id: 102,
        user: "Priya S.",
        rating: 4,
        comment: "Beautiful architecture.",
        date: "2023-12-05",
      },
    ],
    leaders: [
      {
        name: "Shri Rajesh Jain",
        designation: "Adyaksh",
        phone: "+91 98765 43210",
        email: "rajesh@example.com",
      },
      {
        name: "Shri Amit Kumar",
        designation: "Upadyaksh",
        phone: "+91 98765 43211",
        email: "amit@example.com",
      },
      {
        name: "Shri V.K. Jain",
        designation: "Mahamantri",
        phone: "+91 98765 43212",
        email: "vkjain@example.com",
      },
    ],
  },
  {
    id: 2,
    name: "Shri Shwetambar Nakoda Parshvanath",
    country: "India",
    state: "Rajasthan",
    city: "Barmer",
    locality: "Mewnagar",
    pincode: "344021",
    images: [TEMPLE_IMAGES[1], TEMPLE_IMAGES[3]],
    status: "verified",
    description:
      "One of the most visited pilgrimage sites in Rajasthan, famous for its miraculous Nakoda Bhairav idol.",
    history:
      "The temple is an ancient pilgrimage center. The idol of Nakoda Bhairav was installed here by Acharya Kirtiratna Suri.",
    events: [
      {
        id: 1,
        title: "Posh Dashami Mela",
        date: "2024-01-05",
        description: "A massive gathering of devotees for the annual fair.",
      },
    ],
    rating: 4.9,
    reviews: [
      {
        id: 201,
        user: "Ankit Shah",
        rating: 5,
        comment: "Jai Jinendra! The energy here is divine.",
        date: "2024-01-10",
      },
    ],
    leaders: [
      {
        name: "Shri Vimal Chand",
        designation: "Adyaksh",
        phone: "+91 94141 12345",
        email: "vimal@example.com",
      },
      {
        name: "Shri Suresh Shah",
        designation: "Koshadhyaksh",
        phone: "+91 94141 67890",
        email: "suresh@example.com",
      },
    ],
  },
];

export default function App() {
  const router = useRouter();
  const [view, setView] = useState<ViewState>("home");
  const [temples, setTemples] = useState<Temple[]>([]);
  const [selectedTempleId, setSelectedTempleId] = useState<
    string | number | null
  >(null);

  // Auth State
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [adminUsername, setAdminUsername] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [adminError, setAdminError] = useState("");
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [eventTempleId, setEventTempleId] = useState<string | null>(null);
  const [examData, setExamData] = useState({
    name: "",
    center: "",
    date: "",
    time: "",
    instructions: "",
  });
  const [isClassModalOpen, setIsClassModalOpen] = useState(false);
  const [isExamModalOpen, setIsExamModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("temples"); // temples | classes | exams
  const [eventData, setEventData] = useState({
    title: "",
    date: "",
    description: "",
    image: "",
  });

  const [activeAdminSubView, setActiveAdminSubView] = useState<
    "temples" | "events" | "banners"
  >("temples");
  const [banners, setBanners] = useState<Banner[]>([]);
  const [bannerData, setBannerData] = useState({
    title: "",
    link: "",
    isActive: true,
    imageUrl: "",
  });
  const [currentSlide, setCurrentSlide] = useState(0);
  const [editingEvent, setEditingEvent] = useState<{
    templeId: string;
    eventId: string;
    eventData: any;
  } | null>(null);
  const [isEditEventModalOpen, setIsEditEventModalOpen] = useState(false);
  const [selectedEventImage, setSelectedEventImage] = useState<string | null>(
    null,
  );

  const [editingTempleId, setEditingTempleId] = useState<string | null>(null);
  const [classesList, setClassesList] = useState<any[]>([]);
  const [isExamVenueModalOpen, setIsExamVenueModalOpen] = useState(false);

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
    message: string,
  ) => {
    setModal({ isOpen: true, status, title, message });
    if (status !== "loading") {
      setTimeout(() => setModal((prev) => ({ ...prev, isOpen: false })), 3000);
    }
  };

  // Filters
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [filterState, setFilterState] = useState<string>("");
  const [filterCity, setFilterCity] = useState<string>("");

  const [registrationSuccess, setRegistrationSuccess] =
    useState<boolean>(false);


  // Subadmin Registration State
  const [subadminData, setSubadminData] = useState({
    name: "",
    email: "",
    password: "",
    templeName: "",
  });
  const [isSubadminModalOpen, setIsSubadminModalOpen] = useState(false);
  const [subadminLoading, setSubadminLoading] = useState(false);

  const fetchTemples = async () => {
    try {
      // Added cache-busting timestamp to bypass all possible caches
      const res = await fetch(`/api/temples?t=${Date.now()}`, {
        cache: "no-store",
        headers: { Pragma: "no-cache", "Cache-Control": "no-cache" },
      });
      const data = await res.json();
      if (data.success) {
        console.log(
          `[Fetch] Temples loaded: ${data.data.length}. Total events with images: ${data.data.flatMap((t: any) => t.events || []).filter((e: any) => e.image).length}`,
        );
        setTemples(data.data);
      }
    } catch (err) {
      console.error("[Fetch] Error:", err);
    }
  };

  const fetchBanners = async () => {
    try {
      const res = await fetch(`/api/banners?t=${Date.now()}`);
      const data = await res.json();
      if (data.success) {
        setBanners(data.data);
      }
    } catch (err) {
      console.error("[Fetch Banners] Error:", err);
    }
  };

  const fetchClasses = async () => {
    try {
      const res = await fetch(`/api/classes?t=${Date.now()}`);
      const data = await res.json();
      if (data.success) {
        setClassesList(data.data);
      }
    } catch (err) {
      console.error("[Fetch Classes] Error:", err);
    }
  };

  const downloadSyllabus = (cls: any) => {
    let fileData = "";
    let fileName = `${cls.grade.replace(/\s+/g, "_")}_Syllabus.pdf`;

    if (cls.syllabi && cls.syllabi.length > 0) {
      fileData = cls.syllabi[0].fileData;
      fileName = cls.syllabi[0].fileName || fileName;
    } else if (cls.syllabus) {
      fileData = cls.syllabus;
      fileName = cls.fileName || fileName;
    }

    if (!fileData) {
      alert(`इस कक्षा (${cls.grade}) के लिए वर्तमान में सिलेबस उपलब्ध नहीं है। \n(No syllabus file is uploaded for ${cls.grade} yet.)`);
      return;
    }

    try {
      let cleanBase64 = fileData;
      let mimeType = "application/pdf";

      if (fileData.startsWith("data:")) {
        const match = fileData.match(/^data:([^;]+);base64,(.+)$/);
        if (match) {
          mimeType = match[1];
          cleanBase64 = match[2];
        }
      }

      const byteCharacters = atob(cleanBase64);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: mimeType });

      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(link.href);
    } catch (error) {
      console.error("Download error:", error);
      alert("सिलेबस डाउनलोड करने में त्रुटि हुई। \n(Error processing the syllabus download.)");
    }
  };

  useEffect(() => {
    fetchTemples();
    fetchBanners();
    fetchClasses();

    // Check for deep links (e.g., from Add Class/Broadcast back buttons)
    const params = new URLSearchParams(window.location.search);
    if (params.get("view") === "admin") {
      setView("admin");
      // If we see this param, we assume they were in admin mode
      setIsAdminLoggedIn(true);

      // Select appropriate tab if provided
      const tab = params.get("tab");
      if (tab === "classes") {
        setActiveTab("classes");
      } else if (tab === "events") {
        setActiveAdminSubView("events");
      }
    }
  }, []);

  useEffect(() => {
    if (view !== "home") return;
    const activeBanners = banners.filter((b) => b.isActive);
    if (activeBanners.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % activeBanners.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [banners, view]);

  // Registration Form State
  const [formData, setFormData] = useState({
    name: "",
    centreCode: "",
    capacity: 0,
    incharge: "",
    country: "India",
    state: "",
    city: "",
    locality: "",
    pincode: "",
    images: [] as string[],
    leaders: [{ name: "", designation: "", phone: "", email: "" }],
  });

  // New Review State
  const [newReview, setNewReview] = useState({
    user: "",
    rating: 5,
    comment: "",
  });

  // --- Derived Data ---

  // Get unique states and cities for dropdowns
  const availableStates = useMemo(() => {
    return Array.from(
      new Set(
        temples.filter((t) => t.status === "verified").map((t) => t.state),
      ),
    ).sort();
  }, [temples]);

  const availableCities = useMemo(() => {
    const relevantTemples = temples.filter(
      (t) =>
        t.status === "verified" && (!filterState || t.state === filterState),
    );
    return Array.from(new Set(relevantTemples.map((t) => t.city))).sort();
  }, [temples, filterState]);

  const verifiedTemples = useMemo(
    () =>
      temples.filter((t) => {
        const isVerified = t.status === "verified";
        const matchesSearch =
          t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          t.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
          t.state.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesState = filterState === "" || t.state === filterState;
        const matchesCity = filterCity === "" || t.city === filterCity;

        return isVerified && matchesSearch && matchesState && matchesCity;
      }),
    [temples, searchTerm, filterState, filterCity],
  );

  const pendingTemples = useMemo(
    () => temples.filter((t) => t.status === "pending"),
    [temples],
  );

  const selectedTemple = useMemo(
    () =>
      temples.find((t) => String(t._id || t.id) === String(selectedTempleId)),
    [temples, selectedTempleId],
  );

  // Update leader
  const saveLeaderToDB = async (
    templeId: string,
    leaderIndex: number,
    updatedLeader: Leader,
  ) => {
    try {
      const response = await fetch("/api/admin/update-leader", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          templeId,
          leaderIndex,
          leaderData: updatedLeader,
        }),
      });

      const data = await response.json();
      if (data.success) {
        showModal(
          "success",
          "Leader Updated",
          "Leader details updated in Database!",
        );
      }
    } catch (err) {
      console.error("Update failed", err);
    }
  };
  // --- Handlers ---
  // --- Admin Approval Handler ---
  const handleApprove = async (templeId: string | number | undefined) => {
    if (!templeId) {
      showModal("error", "Error", "Temple ID missing!");
      return;
    }

    try {
      const response = await fetch("/api/temples/verify", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ templeId: String(templeId) }), // String mein convert kiya safety ke liye
      });

      if (response.ok) {
        // 2. Local state update
        setTemples((ts) =>
          ts.map((t) => {
            const currentId = t._id || t.id;
            return String(currentId) === String(templeId)
              ? { ...t, status: "verified" }
              : t;
          }),
        );
        showModal(
          "success",
          "Verified",
          "Temple has been successfully verified! ✅",
        );
      } else {
        const errorData = await response.json();
        showModal(
          "error",
          "Verification Failed",
          errorData.message || "Failed to verify",
        );
      }
    } catch (error) {
      console.error("Verification failed:", error);
      showModal(
        "error",
        "System Error",
        "Failed to connect to verification server.",
      );
    }
  };
  const handleDeleteTemple = async (templeId: string | number) => {
    if (
      !confirm(
        "Are you sure you want to permanently delete this temple? This cannot be undone.",
      )
    )
      return;

    showModal("loading", "Deleting...", "Removing temple from database");
    try {
      // Explicitly convert to string and remove any whitespace
      const idStr = String(templeId).trim();
      const response = await fetch(`/api/temples/${idStr}`, {
        method: "DELETE",
      });

      const data = await response.json();
      if (data.success) {
        showModal("success", "Deleted", "Temple removed successfully! 🗑️");
        fetchTemples();
      } else {
        showModal("error", "Failed", data.message || "Delete failed");
      }
    } catch (err) {
      console.error("Delete Temple Error:", err);
      showModal("error", "Error", "Connection failed.");
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation for 10-digit phone numbers
    const invalidLeader = formData.leaders.find((l) => l.phone.length !== 10);
    if (invalidLeader) {
      showModal(
        "error",
        "Invalid Phone",
        `Phone number for ${invalidLeader.name || "member"} must be exactly 10 digits.`,
      );
      return;
    }

    const isEditing = !!editingTempleId;
    showModal(
      "loading",
      isEditing ? "Updating..." : "Registering...",
      isEditing ? "Saving temple changes" : "Sending registration request",
    );

    try {
      const url = isEditing
        ? `/api/temples/${editingTempleId}`
        : "/api/temples/register";
      const method = isEditing ? "PUT" : "POST";

      const response = await fetch(url, {
        method: method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        if (!isEditing) {
          setRegistrationSuccess(true);
        } else {
          showModal(
            "success",
            "Updated",
            "Temple details updated successfully! ✅",
          );
        }

        setTimeout(
          () => {
            if (!isEditing) setRegistrationSuccess(false);
            setView("home");
            setEditingTempleId(null);
            setFormData({
              name: "",
              centreCode: "",
              capacity: 0,
              incharge: "",
              country: "India",
              state: "",
              city: "",
              locality: "",
              pincode: "",
              images: [],
              leaders: [{ name: "", designation: "", phone: "", email: "" }],
            });
            fetchTemples();
          },
          isEditing ? 1500 : 3000,
        );
      } else {
        showModal(
          "error",
          isEditing ? "Update Failed" : "Registration Failed",
          data.message || "Please check your inputs.",
        );
      }
    } catch (err) {
      console.error("Server error:", err);
      showModal("error", "Error", "Connection failed.");
    }
  };

  const handleAddEvent = async (templeId: string, eventData: any) => {
    try {
      const response = await fetch("/api/temples/events", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          templeId: templeId,
          event: eventData,
        }),
      });
      const data = await response.json();

      if (response.ok && data.success) {
        // Log image success for debugging
        console.log(
          `Event added successfully with image: ${data.debugInfo?.savedImageLength} bytes`,
        );

        showModal(
          "success",
          "Event Added",
          `Event successfully added! (Image: ${data.debugInfo?.savedImageLength || 0} bytes saved) 📅`,
        );

        const updatedRes = await fetch("/api/temples");
        const updatedData = await updatedRes.json();
        setTemples(updatedData.data);
        setEventData({ title: "", date: "", description: "", image: "" });
      } else {
        console.error("Failed to add event:", data.message);
        showModal(
          "error",
          "Failed to Add",
          data.message ||
          "Something went wrong. Image might be too large (max 4.5MB).",
        );
      }
    } catch (err) {
      console.error("Event not added :", err);
      showModal(
        "error",
        "Error",
        "Connection failed. Field size might be too large.",
      );
    }
  };

  const handleUpdateEvent = async (
    templeId: string,
    eventId: string,
    eventData: any,
  ) => {
    try {
      const response = await fetch("/api/temples/events", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          templeId,
          eventId,
          eventData,
        }),
      });

      const data = await response.json();
      if (response.ok && data.success) {
        const savedSize = data.debugInfo?.savedImageLength || 0;
        console.log(`[Update] Event saved. Image size: ${savedSize} bytes`);

        showModal(
          "success",
          "Updated",
          `Event details and image saved! (${Math.round(savedSize / 1024)}KB) ✅`,
        );

        // Immediate fetch with a small delay to ensure DB propagation
        setTimeout(async () => {
          await fetchTemples();
        }, 500);
      } else {
        console.error("[Update] Failed:", data.message);
        showModal(
          "error",
          "Update Failed",
          data.message || "Failed to save changes. Image might be too large.",
        );
      }
    } catch (err) {
      console.error("Update failed:", err);
      showModal("error", "Error", "Failed to reach server. Check data size.");
    }
  };

  const handleDeleteEvent = async (templeId: string, eventId: string) => {
    if (!confirm("Are you sure you want to delete this event?")) return;

    try {
      const response = await fetch("/api/temples/events", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          templeId,
          eventId,
        }),
      });

      const data = await response.json();
      if (data.success) {
        showModal("success", "Deleted", "Event removed successfully! 🗑️");
        const updatedRes = await fetch("/api/temples");
        const updatedData = await updatedRes.json();
        setTemples(updatedData.data);
      }
    } catch (err) {
      console.error("Delete failed:", err);
    }
  };

  const handleAddBanner = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bannerData.imageUrl) {
      showModal("error", "Error", "Please select a banner image.");
      return;
    }

    showModal("loading", "Adding...", "Uploading banner to database");
    try {
      const response = await fetch("/api/banners", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bannerData),
      });

      const data = await response.json();
      if (data.success) {
        showModal("success", "Banner Added", "Banner added successfully! 📸");
        setBannerData({ title: "", link: "", isActive: true, imageUrl: "" });
        fetchBanners();
      } else {
        showModal("error", "Failed", data.error || "Failed to add banner.");
      }
    } catch (err) {
      console.error("Add Banner Error:", err);
      showModal("error", "Error", "Connection failed.");
    }
  };

  const handleToggleBanner = async (id: string, currentActive: boolean) => {
    try {
      const response = await fetch("/api/banners", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, isActive: !currentActive }),
      });

      const data = await response.json();
      if (data.success) {
        showModal("success", "Updated", "Banner status updated! ✅");
        fetchBanners();
      } else {
        showModal("error", "Failed", data.error || "Failed to update banner.");
      }
    } catch (err) {
      console.error("Toggle Banner Error:", err);
      showModal("error", "Error", "Connection failed.");
    }
  };

  const handleDeleteBanner = async (id: string) => {
    if (!confirm("Are you sure you want to delete this banner?")) return;

    showModal("loading", "Deleting...", "Deleting banner");
    try {
      const response = await fetch(`/api/banners?id=${id}`, {
        method: "DELETE",
      });

      const data = await response.json();
      if (data.success) {
        showModal("success", "Deleted", "Banner removed successfully! 🗑️");
        fetchBanners();
      } else {
        showModal("error", "Failed", data.error || "Delete failed");
      }
    } catch (err) {
      console.error("Delete Banner Error:", err);
      showModal("error", "Error", "Connection failed.");
    }
  };

  const handleImageUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    type: "event" | "edit-event" | "temple-register" | "banner",
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      // Image Compression Logic
      const reader = new FileReader();
      reader.onload = (event: any) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement("canvas");
          const isBanner = type === "banner";
          const MAX_WIDTH = isBanner ? 1920 : 600;
          const MAX_HEIGHT = isBanner ? 1080 : 600;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          ctx?.drawImage(img, 0, 0, width, height);

          // Increased compression (0.5 q for normal, 0.85 q for banners to keep it clear)
          const dataUrl = canvas.toDataURL("image/jpeg", isBanner ? 0.85 : 0.5);
          const sizeKB = Math.round((dataUrl.length * 0.75) / 1024);
          console.log(`Compressed image size: ${sizeKB} KB`);

          if (type === "event") {
            setEventData((prev) => ({ ...prev, image: dataUrl }));
          } else if (type === "edit-event") {
            setEditingEvent((prev: any) => ({
              ...prev,
              eventData: { ...prev.eventData, image: dataUrl },
            }));
          } else if (type === "temple-register") {
            setFormData((prev) => ({
              ...prev,
              images: [...prev.images, dataUrl],
            }));
          } else if (type === "banner") {
            setBannerData((prev) => ({ ...prev, imageUrl: dataUrl }));
          }
        };
        img.onerror = () => {
          console.error("Compression failed: Image could not be loaded");
          showModal(
            "error",
            "Image Error",
            "Failed to process the chosen image.",
          );
        };
        img.src = event.target.result;
      };
      reader.onerror = () => {
        console.error("File reading failed");
        showModal("error", "File Error", "Failed to read the file.");
      };
      reader.readAsDataURL(file);
      // Clear value to allow re-selecting same file
      e.target.value = "";
    }
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTempleId) return;

    try {
      const response = await fetch("/api/temples/review", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          templeId: selectedTempleId,
          review: {
            user: newReview.user || "Anonymous",
            rating: Number(newReview.rating),
            comment: newReview.comment,
            date: new Date().toLocaleDateString("en-GB"),
          },
        }),
      });

      const data = await response.json();

      if (data.success) {
        const updatedRes = await fetch("/api/temples");
        const updatedData = await updatedRes.json();
        setTemples(updatedData.data);

        setNewReview({ user: "", rating: 5, comment: "" });
        showModal(
          "success",
          "Review Published",
          "Your feedback has been posted. Thank you! ⭐",
        );
      }
    } catch (err) {
      console.error("Review failed:", err);
    }
  };

  const addLeaderField = () => {
    setFormData((prev) => ({
      ...prev,
      leaders: [
        ...prev.leaders,
        { name: "", designation: "", phone: "", email: "" },
      ],
    }));
  };

  const updateLeader = (index: number, field: keyof Leader, value: string) => {
    let finalValue = value;
    if (field === "phone") {
      finalValue = value.replace(/\D/g, "").slice(0, 10);
    }
    setFormData((prev) => {
      const updatedLeaders = [...prev.leaders];
      updatedLeaders[index] = {
        ...updatedLeaders[index],
        [field]: finalValue,
      };

      return {
        ...prev,
        leaders: updatedLeaders,
      };
    });
  };

  // andle setup
  const handleSetup = async () => {
    // Input validation
    if (!adminUsername || !adminPassword) {
      setAdminError("Please enter both username and password.");
      return;
    }

    setAdminError(""); // Purane errors clear karne ke liye

    try {
      const response = await fetch("/api/admin/setup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: adminUsername,
          password: adminPassword,
        }),
      });

      const data = await response.json();

      if (data.success) {
        showModal(
          "success",
          "Account Created",
          "Admin account created successfully! You can login now.",
        );

        // setAdminUsername("");
        // setAdminPassword("");
      } else {
        // Agar admin pehle se exist karta hai ya koi error hai
        setAdminError(data.message || "Setup failed. Please try again.");
      }
    } catch (err) {
      console.error("Setup Error:", err);
      setAdminError(
        "Server connection error. Check if your backend is running.",
      );
    }
  };

  // andle Login
  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdminError("");

    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: adminUsername,
          password: adminPassword,
        }),
      });

      const data = await response.json();

      if (data.success) {
        showModal(
          "success",
          "Login Successful",
          "Welcome to Admin Dashboard! Authenticating...",
        );
        setTimeout(() => {
          setIsAdminLoggedIn(true);
        }, 1500);
      } else {
        setAdminError(data.message || "Invalid Credentials");
      }
    } catch (err) {
      setAdminError("Server not connect.");
    }
  };

  const handleSubadminRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubadminLoading(true);

    try {
      const response = await fetch("/api/subadmin/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(subadminData),
      });

      const data = await response.json();

      if (data.success) {
        showModal(
          "success",
          "Registered",
          "Sub-Admin registered successfully! Redirection in progress...",
        );
        setIsSubadminModalOpen(false);
        setSubadminData({
          name: "",
          email: "",
          password: "",
          templeName: "",
        });
      } else {
        showModal(
          "error",
          "Failed",
          data.message || "Registration encountered an error.",
        );
      }
    } catch (err) {
      console.error("Subadmin Register Error:", err);
      showModal("error", "Connection Error", "Could not reach the server.");
    } finally {
      setSubadminLoading(false);
    }
  };

  const addImageToForm = () => {
    document.getElementById("temple-register-photo-input")?.click();
  };

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900 font-sans selection:bg-amber-100 selection:text-amber-900">
      <Navbar
        view={view}
        setView={setView}
        selectedTempleId={selectedTempleId}
        setSelectedTempleId={setSelectedTempleId}
      />

      {/* Premium Banner Carousel (Full width, no left/right/top space) */}
      {view === "home" && !selectedTempleId && banners.filter((b) => b.isActive).length > 0 && (
        <div className="w-full relative overflow-hidden aspect-[3/1] group">
          <div
            className="absolute inset-0 flex transition-transform duration-700 ease-in-out"
            style={{ transform: `translateX(-${currentSlide * 100}%)` }}
          >
            {banners
              .filter((b) => b.isActive)
              .map((banner) => (
                <div key={banner._id} className="w-full h-full shrink-0 relative">
                  <img
                    src={banner.imageUrl}
                    alt={banner.title || "Banner"}
                    className="w-full h-full object-fill"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent flex flex-col justify-end p-6 md:p-16">
                    {banner.title && (
                      <h2 className="text-xl md:text-3xl lg:text-5xl font-black text-white tracking-tight drop-shadow-md max-w-4xl leading-tight">
                        {banner.title}
                      </h2>
                    )}
                    {banner.link && (
                      <a
                        href={banner.link}
                        target={banner.link.startsWith("http") ? "_blank" : "_self"}
                        rel="noopener noreferrer"
                        className="mt-4 inline-flex items-center gap-1 bg-white text-stone-900 font-bold px-5 py-2.5 rounded-xl text-xs md:text-sm w-fit hover:bg-stone-100 transition shadow-sm active:scale-95"
                      >
                        Learn More <ArrowRight size={14} />
                      </a>
                    )}
                  </div>
                </div>
              ))}
          </div>

          {banners.filter((b) => b.isActive).length > 1 && (
            <>
              <button
                onClick={() =>
                  setCurrentSlide(
                    (prev) =>
                      (prev - 1 + banners.filter((b) => b.isActive).length) %
                      banners.filter((b) => b.isActive).length
                  )
                }
                className="absolute left-6 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/80 backdrop-blur text-stone-800 flex items-center justify-center hover:bg-white transition opacity-0 group-hover:opacity-100 shadow-md active:scale-90"
              >
                <ChevronLeft size={24} />
              </button>
              <button
                onClick={() =>
                  setCurrentSlide(
                    (prev) => (prev + 1) % banners.filter((b) => b.isActive).length
                  )
                }
                className="absolute right-6 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/80 backdrop-blur text-stone-800 flex items-center justify-center hover:bg-white transition opacity-0 group-hover:opacity-100 shadow-md active:scale-90"
              >
                <ChevronRight size={24} />
              </button>
            </>
          )}

          {banners.filter((b) => b.isActive).length > 1 && (
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2.5">
              {banners
                .filter((b) => b.isActive)
                .map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentSlide(idx)}
                    className={`w-2.5 h-2.5 rounded-full transition-all ${
                      idx === currentSlide
                        ? "bg-white w-7"
                        : "bg-white/50 hover:bg-white/80"
                    }`}
                  />
                ))}
            </div>
          )}
        </div>
      )}

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        {/* VIEW: DIRECTORY */}
        {view === "home" && (
          <div className="space-y-12 animate-in fade-in duration-700">
            {/* Ambient Background Glows */}
            <div className="absolute inset-x-0 top-0 -z-10 h-[1000px] overflow-hidden pointer-events-none">
              <div className="absolute left-[10%] top-[20%] h-[350px] w-[350px] rounded-full bg-amber-400/5 blur-[120px] animate-pulse duration-[8000ms]" />
              <div className="absolute right-[20%] top-[30%] h-[300px] w-[300px] rounded-full bg-rose-400/5 blur-[100px] animate-pulse duration-[6000ms]" />
            </div>

            <div className="text-center max-w-4xl mx-auto space-y-6">
              {/* Premium Badge */}
              <span className="inline-flex items-center gap-1.5 px-4.5 py-1.5 rounded-full text-[10px] md:text-xs font-black text-amber-700 bg-amber-50/60 backdrop-blur-sm border border-amber-100/60 uppercase tracking-widest animate-fade-in shadow-sm">
                <Star size={12} className="fill-amber-500 text-amber-500" /> Connecting Devotees Globally
              </span>
              
              <h1 className="text-4xl md:text-6xl font-extrabold text-stone-900 tracking-tight leading-[1.1]">
                Sacred Spaces, <br />
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-amber-600 to-amber-800">
                  Unified Community.
                </span>
              </h1>
              <p className="text-stone-500 text-base md:text-xl font-medium max-w-2xl mx-auto leading-relaxed">
                Find verified Jain Temples, view upcoming events, and connect with management committees.
              </p>

              {/* Redesigned Search & Filter Console */}
              <div className="bg-white/80 backdrop-blur-md p-3 md:p-4 rounded-[2.5rem] shadow-xl shadow-stone-200/40 border border-stone-100/80 flex flex-col md:flex-row items-center gap-3 md:gap-4 max-w-3xl mx-auto transition-all duration-300 hover:shadow-2xl hover:border-amber-200/50">
                {/* Search Bar Input */}
                <div className="relative w-full md:flex-[1.5]">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-stone-400">
                    <Search size={18} className="text-stone-400" />
                  </div>
                  <input
                    type="text"
                    placeholder="Search by name, city, state..."
                    className="block w-full pl-11 pr-4 py-3 bg-stone-50/80 border border-stone-100 rounded-2xl focus:ring-2 focus:ring-amber-500 focus:bg-white outline-none transition-all placeholder:text-stone-400 text-sm font-semibold text-stone-700"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>

                {/* Divider for desktop */}
                <div className="hidden md:block w-[1px] h-8 bg-stone-200" />

                {/* Filters Group */}
                <div className="flex flex-row gap-3 w-full md:w-auto md:min-w-[320px]">
                  {/* State Filter */}
                  <div className="flex-1 relative">
                    <select
                      className="w-full pl-3 pr-8 py-3 bg-stone-50/80 border border-stone-100 rounded-2xl appearance-none focus:ring-2 focus:ring-amber-500 focus:bg-white outline-none text-stone-700 font-bold cursor-pointer text-xs md:text-sm transition-all"
                      value={filterState}
                      onChange={(e) => {
                        setFilterState(e.target.value);
                        setFilterCity("");
                      }}
                    >
                      <option value="">Select State</option>
                      {availableStates.map((state) => (
                        <option key={state} value={state}>
                          {state}
                        </option>
                      ))}
                    </select>
                    <ChevronLeft
                      className="absolute right-3 top-1/2 -translate-y-1/2 -rotate-90 text-stone-400 pointer-events-none"
                      size={14}
                    />
                  </div>

                  {/* City Filter */}
                  <div className="flex-1 relative">
                    <select
                      disabled={!filterState}
                      className="w-full pl-3 pr-8 py-3 bg-stone-50/80 border border-stone-100 rounded-2xl appearance-none focus:ring-2 focus:ring-amber-500 focus:bg-white outline-none text-stone-700 font-bold disabled:opacity-50 cursor-pointer text-xs md:text-sm transition-all"
                      value={filterCity}
                      onChange={(e) => setFilterCity(e.target.value)}
                    >
                      <option value="">Select City</option>
                      {availableCities.map((city) => (
                        <option key={city} value={city}>
                          {city}
                        </option>
                      ))}
                    </select>
                    <ChevronLeft
                      className="absolute right-3 top-1/2 -translate-y-1/2 -rotate-90 text-stone-400 pointer-events-none"
                      size={14}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Vision & Mission and Quick Links Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Vision & Mission */}
              <div className="lg:col-span-1 bg-white/60 backdrop-blur-md p-8 rounded-[2.5rem] shadow-sm hover:shadow-xl transition-all duration-300 border border-stone-100/80 flex flex-col justify-between space-y-6">
                <div className="space-y-4">
                  <div className="w-12 h-12 bg-amber-50 text-amber-700 rounded-2xl flex items-center justify-center">
                    <Star size={24} className="fill-amber-500 text-amber-500" />
                  </div>
                  <h2 className="text-2xl font-extrabold text-stone-900 tracking-tight">
                    हमारा संकल्प <br />
                    <span className="text-amber-700 text-lg font-bold">Our Vision & Mission</span>
                  </h2>
                  <p className="text-stone-600 text-sm leading-relaxed font-semibold">
                    जैन संस्कारों और शिक्षा को अगली पीढ़ी तक पहुंचाना ही हमारा परम लक्ष्य है।
                  </p>
                  <p className="text-stone-500 text-xs leading-relaxed">
                    To preserve and pass down Jain values, rituals, and philosophical education to the next generation through structured curriculum and community connects.
                  </p>
                </div>
              </div>

              {/* Quick Links */}
              <div className="lg:col-span-2 bg-white/60 backdrop-blur-md p-8 rounded-[2.5rem] shadow-sm border border-stone-100/80 space-y-6">
                <h2 className="text-2xl font-extrabold text-stone-900 tracking-tight">
                  त्वरित लिंक <br />
                  <span className="text-stone-400 text-xs font-bold uppercase tracking-wider">Quick Actions</span>
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                  {/* Card 1: New Registration */}
                  <div
                    onClick={() => router.push("/user/login?mode=register")}
                    className="bg-stone-50/80 border border-stone-100 hover:border-amber-500 rounded-3xl p-6 cursor-pointer hover:-translate-y-1 transition duration-300 flex flex-col justify-between group h-full min-h-[160px]"
                  >
                    <div className="w-10 h-10 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center">
                      <PlusCircle size={20} />
                    </div>
                    <div>
                      <h3 className="font-extrabold text-stone-800 text-base leading-snug group-hover:text-amber-600 transition">
                        नया रजिस्ट्रेशन
                      </h3>
                      <p className="text-[10px] text-stone-400 font-bold uppercase tracking-wide mt-1">
                        New Registration
                      </p>
                    </div>
                  </div>

                  {/* Card 2: Exam Center List */}
                  <div
                    onClick={() => setIsExamVenueModalOpen(true)}
                    className="bg-stone-50/80 border border-stone-100 hover:border-amber-500 rounded-3xl p-6 cursor-pointer hover:-translate-y-1 transition duration-300 flex flex-col justify-between group h-full min-h-[160px]"
                  >
                    <div className="w-10 h-10 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center">
                      <MapPin size={20} />
                    </div>
                    <div>
                      <h3 className="font-extrabold text-stone-800 text-base leading-snug group-hover:text-amber-600 transition">
                        एग्जाम सेंटर सूची
                      </h3>
                      <p className="text-[10px] text-stone-400 font-bold uppercase tracking-wide mt-1">
                        Exam Venues
                      </p>
                    </div>
                  </div>

                  {/* Card 3: Student Login */}
                  <div
                    onClick={() => router.push("/user/login")}
                    className="bg-stone-50/80 border border-stone-100 hover:border-amber-500 rounded-3xl p-6 cursor-pointer hover:-translate-y-1 transition duration-300 flex flex-col justify-between group h-full min-h-[160px]"
                  >
                    <div className="w-10 h-10 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center">
                      <User size={20} />
                    </div>
                    <div>
                      <h3 className="font-extrabold text-stone-800 text-base leading-snug group-hover:text-amber-600 transition">
                        स्टूडेंट लॉगिन
                      </h3>
                      <p className="text-[10px] text-stone-400 font-bold uppercase tracking-wide mt-1">
                        Student Login
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <h2 className="text-2xl font-black text-stone-900 uppercase tracking-tight pl-2">
                Verified Temples Directory
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {verifiedTemples.map((temple, index) => (
                <div
                  key={temple._id || temple.id}
                  onClick={() => {
                    const targetId = temple._id || temple.id || null;
                    setSelectedTempleId(targetId);
                    setView("detail");
                    window.scrollTo(0, 0);
                  }}
                  className="bg-white rounded-[2.5rem] overflow-hidden shadow-sm hover:shadow-2xl hover:-translate-y-1.5 transition-all duration-550 border border-stone-100 flex flex-col cursor-pointer group h-full justify-between"
                >
                  <div className="h-64 relative overflow-hidden shrink-0">
                    <img
                      src={temple.images[0]}
                      alt={temple.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                    />
                    <div className="absolute top-4 left-4 flex gap-2">
                      <span className="bg-stone-900/80 backdrop-blur px-3 py-1.5 rounded-full text-[9px] font-black text-white uppercase tracking-widest flex items-center gap-1.5 shadow-md border border-white/10">
                        <Globe size={11} className="text-amber-400" /> {temple.country}
                      </span>
                    </div>
                  </div>
                  <div className="p-7 flex flex-col justify-between flex-1 space-y-5">
                    <div className="space-y-3">
                      <div className="flex justify-between items-start gap-2">
                        <h3 className="text-xl font-extrabold text-stone-800 leading-snug group-hover:text-amber-600 transition-colors duration-300">
                          {temple.name}
                        </h3>
                        <div className="bg-green-50 p-1 rounded-full shrink-0 group-hover:scale-110 transition-transform duration-300">
                          <CheckCircle2
                            className="text-green-500"
                            size={18}
                          />
                        </div>
                      </div>
                      <div className="flex items-center text-stone-500 text-sm font-semibold">
                        <MapPin size={16} className="mr-1.5 text-amber-500 group-hover:animate-bounce" />
                        {temple.locality}, {temple.city}
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      {/* Temple ID Display */}
                      <div className="flex items-center text-[10px] text-stone-400 font-mono tracking-wider bg-stone-50 w-fit px-2.5 py-1 rounded border border-stone-100">
                        <span className="font-bold text-stone-500 mr-1 uppercase">
                          ID:
                        </span>
                        {temple.displayId || String(index + 1).padStart(2, "0")}
                      </div>

                      {/* Display city / state pill */}
                      <span className="text-[10px] font-bold text-stone-500 bg-stone-100/50 border border-stone-200/40 px-2 py-0.5 rounded-md">
                        {temple.city}
                      </span>
                    </div>

                    <div className="pt-4 border-t border-stone-100 flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-amber-600 font-extrabold text-sm">
                        <Star size={16} className="fill-amber-500 text-amber-500" />
                        {temple.rating > 0 ? (
                          <span>{temple.rating.toFixed(1)} <span className="text-stone-400 font-medium text-xs">/ 5</span></span>
                        ) : (
                          <span className="text-amber-550 font-bold bg-amber-50 px-2 py-0.5 rounded-md text-xs">New Atishaya</span>
                        )}
                      </div>
                      <span className="text-xs text-stone-500 font-black uppercase tracking-widest flex items-center gap-1 group-hover:text-amber-600 transition-colors duration-300">
                        Explore <ArrowRight size={13} className="group-hover:translate-x-1 transition-transform duration-300" />
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {verifiedTemples.length === 0 && (
              <div className="text-center py-24 bg-white rounded-3xl border border-stone-200 border-dashed">
                <Search size={48} className="mx-auto text-stone-200 mb-4" />
                <h3 className="text-xl font-bold text-stone-800">
                  No temples found
                </h3>
                <p className="text-stone-400">
                  Try searching with a different city or state.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

        {/* VIEW: TEMPLE DETAIL */}
        {view === "detail" && selectedTemple && (
          <div className="animate-in fade-in slide-in-from-bottom-8 duration-500 space-y-8">
            <button
              onClick={() => setView("home")}
              className="flex items-center text-stone-500 hover:text-amber-600 font-bold transition-colors"
            >
              <ChevronLeft size={20} className="mr-1" /> Back to Directory
            </button>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left Column - Main Info */}
              <div className="lg:col-span-2 space-y-8">
                {/* Gallery */}
                <div className="space-y-4">
                  <div className="aspect-video rounded-[2rem] overflow-hidden shadow-xl">
                    <img
                      src={selectedTemple.images[0]}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  {selectedTemple.images.length > 1 && (
                    <div className="flex gap-4 overflow-x-auto pb-2">
                      {selectedTemple.images.map((img, i) => (
                        <div
                          key={i}
                          className="w-32 h-24 shrink-0 rounded-xl overflow-hidden cursor-pointer border-2 border-transparent hover:border-amber-500 transition-all"
                        >
                          <img
                            src={img}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* About & History */}
                <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-stone-100 space-y-6">
                  <div>
                    <h1 className="text-3xl md:text-4xl font-extrabold text-stone-900 mb-2">
                      {selectedTemple.name}
                    </h1>
                    <div className="flex items-center gap-4 text-sm font-medium text-stone-500">
                      <span className="flex items-center gap-1">
                        <MapPin size={16} /> {selectedTemple.city},{" "}
                        {selectedTemple.state}
                      </span>
                      <span className="flex items-center gap-1 text-amber-600">
                        <Star size={16} fill="currentColor" />{" "}
                        {selectedTemple.rating} ({selectedTemple.reviews.length}{" "}
                        reviews)
                      </span>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-bold text-stone-800 mb-2 flex items-center gap-2">
                      <ShieldCheck size={20} className="text-amber-600" /> About
                    </h3>
                    <p className="text-stone-600 leading-relaxed">
                      {selectedTemple.description}
                    </p>
                  </div>

                  {selectedTemple.history && (
                    <div className="bg-stone-50 p-6 rounded-2xl">
                      <h3 className="text-lg font-bold text-stone-800 mb-2 flex items-center gap-2">
                        <History size={20} className="text-amber-600" /> History
                      </h3>
                      <p className="text-stone-600 leading-relaxed text-sm">
                        {selectedTemple.history}
                      </p>
                    </div>
                  )}
                </div>

                {/* Reviews */}
                <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-stone-100 space-y-8">
                  <h3 className="text-2xl font-bold text-stone-900">
                    Devotee Reviews
                  </h3>

                  {selectedTemple.reviews.map((review) => (
                    <div
                      key={review._id || review.id}
                      className="border-b border-stone-100 pb-6 last:border-0 last:pb-0"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="font-bold text-stone-900">
                            {review.user}
                          </p>
                          <p className="text-xs text-stone-400">
                            {review.date}
                          </p>
                        </div>
                        <div className="flex gap-1">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              size={14}
                              className={
                                i < review.rating
                                  ? "fill-amber-400 text-amber-400"
                                  : "text-stone-200"
                              }
                            />
                          ))}
                        </div>
                      </div>
                      <p className="text-stone-600 text-sm">{review.comment}</p>
                    </div>
                  ))}

                  <div className="bg-stone-50 p-6 rounded-2xl space-y-4">
                    <h4 className="font-bold text-stone-800">Write a Review</h4>
                    <form onSubmit={handleReviewSubmit} className="space-y-4">
                      <div className="flex gap-4">
                        <input
                          required
                          placeholder="Your Name"
                          className="flex-1 px-4 py-2 rounded-xl border-none focus:ring-2 focus:ring-amber-500"
                          value={newReview.user}
                          onChange={(e) =>
                            setNewReview({ ...newReview, user: e.target.value })
                          }
                        />
                        <select
                          className="px-4 py-2 rounded-xl border-none focus:ring-2 focus:ring-amber-500"
                          value={newReview.rating}
                          onChange={(e) =>
                            setNewReview({
                              ...newReview,
                              rating: Number(e.target.value),
                            })
                          }
                        >
                          {[5, 4, 3, 2, 1].map((r) => (
                            <option key={r} value={r}>
                              {r} Stars
                            </option>
                          ))}
                        </select>
                      </div>
                      <textarea
                        required
                        placeholder="Share your experience..."
                        className="w-full px-4 py-2 rounded-xl border-none focus:ring-2 focus:ring-amber-500 h-24 resize-none"
                        value={newReview.comment}
                        onChange={(e) =>
                          setNewReview({
                            ...newReview,
                            comment: e.target.value,
                          })
                        }
                      />
                      <button
                        type="submit"
                        className="px-6 py-2 bg-stone-900 text-white rounded-xl font-bold text-sm hover:bg-black"
                      >
                        Submit Review
                      </button>
                    </form>
                  </div>
                </div>
              </div>

              {/* Right Column - Sidebar */}
              <div className="space-y-8 lg:sticky lg:top-8 h-fit">
                {/* Management */}
                <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-stone-100 space-y-6">
                  <h3 className="text-sm font-black text-stone-400 uppercase tracking-widest">
                    Management Committee
                  </h3>
                  <div className="space-y-4">
                    {selectedTemple.leaders.map((leader, i) => (
                      <div key={i} className="p-4 bg-stone-50 rounded-2xl">
                        <p className="font-bold text-stone-900">
                          {leader.name}
                        </p>
                        <p className="text-xs text-amber-600 font-bold uppercase tracking-wider mb-3">
                          {leader.designation}
                        </p>
                        <div className="flex gap-2">
                          <a
                            href={`tel:${leader.phone}`}
                            className="flex-1 bg-white py-2 rounded-lg text-center text-xs font-bold text-stone-600 border hover:border-amber-500 hover:text-amber-600 transition-colors"
                          >
                            Call
                          </a>
                          <a
                            href={`mailto:${leader.email}`}
                            className="flex-1 bg-white py-2 rounded-lg text-center text-xs font-bold text-stone-600 border hover:border-amber-500 hover:text-amber-600 transition-colors"
                          >
                            Email
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* --- UPDATED MANAGEMENT COMMITTEE Leaders FROM DATABASE --- */}
                <div className="bg-white p-6 rounded-[2rem] border border-stone-100 space-y-6">
                  <h3 className="text-sm font-black text-stone-400 uppercase tracking-widest">
                    Committee Leaders
                  </h3>
                  <div className="space-y-4">
                    {/* Use the committee field directly from the temple object fetched from DB */}
                    {selectedTemple.committee &&
                      selectedTemple.committee.length > 0 ? (
                      selectedTemple.committee.map((committee, i) => (
                        <div key={i} className="p-4 bg-stone-50 rounded-2xl">
                          <p className="font-bold text-stone-900">
                            {committee.name}
                          </p>
                          <p className="text-xs text-amber-600 font-bold uppercase tracking-wider mb-3">
                            {committee.designation}
                          </p>
                          <div className="flex gap-2">
                            {/* Call & Email buttons same as before */}
                            <a
                              href={`tel:${committee.phone}`}
                              className="flex-1 bg-white py-2 rounded-lg text-center text-xs font-bold border"
                            >
                              Call
                            </a>
                            <a
                              href={`mailto:${committee.email}`}
                              className="flex-1 bg-white py-2 rounded-lg text-center text-xs font-bold border"
                            >
                              Email
                            </a>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-stone-400 italic">
                        No committee Leaders listed.
                      </p>
                    )}
                  </div>
                </div>

                {/* Events */}
                <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-stone-100 space-y-6">
                  <h3 className="text-sm font-black text-stone-400 uppercase tracking-widest">
                    Upcoming Events
                  </h3>

                  {/* Check karein ki events hain ya nahi */}
                  {selectedTemple?.events &&
                    selectedTemple.events.length > 0 ? (
                    <div className="space-y-4">
                      {selectedTemple.events.map((event) => (
                        <div
                          key={event._id || event.id}
                          className="flex gap-4 items-start"
                        >
                          {/* Calendar Style Date Box */}
                          <div className="bg-amber-50 text-amber-700 rounded-xl p-2 text-center min-w-[3.5rem]">
                            {/* MONTH (Short form: JAN, FEB, etc.) */}
                            <span className="block text-[10px] font-bold uppercase leading-none mb-1">
                              {event.date
                                ? new Date(event.date).toLocaleString(
                                  "default",
                                  { month: "short" },
                                )
                                : "N/A"}
                            </span>
                            {/* DATE NUMBER (1, 15, 20, etc.) */}
                            <span className="block text-lg font-black leading-none">
                              {event.date
                                ? new Date(event.date).getDate()
                                : "--"}
                            </span>
                          </div>

                          {/* Event Content */}
                          <div className="flex-1">
                            <div className="flex gap-4">
                              <div className="flex-1">
                                <p className="font-bold text-stone-900 text-sm">
                                  {event.title}
                                </p>
                                <p className="text-xs text-stone-500 mt-1 leading-relaxed">
                                  {event.description}
                                </p>
                              </div>
                              {event.image ? (
                                <div
                                  className="w-20 h-20 rounded-xl overflow-hidden shadow-sm shrink-0 border border-stone-100 cursor-zoom-in group/img relative"
                                  onClick={() =>
                                    setSelectedEventImage(event.image || null)
                                  }
                                >
                                  <img
                                    src={event.image}
                                    className="w-full h-full object-cover"
                                    alt={event.title}
                                    title={`Image Data: ${event.image.substring(0, 30)}... (Length: ${event.image.length})`}
                                    onError={(e) => {
                                      const target = e.currentTarget;
                                      const parent = target.parentElement;
                                      if (
                                        parent &&
                                        !parent.querySelector(
                                          ".img-error-label",
                                        )
                                      ) {
                                        target.style.opacity = "0.3";
                                        const errIcon =
                                          document.createElement("div");
                                        errIcon.className =
                                          "img-error-label absolute inset-0 flex flex-col items-center justify-center bg-stone-100/80 text-stone-500";
                                        errIcon.innerHTML = `
                                          <span class="text-[10px] font-black uppercase">Load Error</span>
                                          <button class="text-[8px] underline px-2 py-1 mt-1 hover:text-amber-600 transition" onclick="const img = this.closest('.group\\/img').querySelector('img'); img.src = img.src.split('?retry=')[0] + '?retry=' + Date.now(); this.parentElement.remove();">Retry</button>
                                        `;
                                        parent.appendChild(errIcon);
                                      }
                                    }}
                                  />
                                  <div className="absolute inset-0 bg-black/0 group-hover/img:bg-black/10 transition-colors flex items-center justify-center pointer-events-none">
                                    <ImageIcon
                                      size={16}
                                      className="text-white opacity-0 group-hover/img:opacity-100 transition-opacity"
                                    />
                                  </div>
                                </div>
                              ) : (
                                <div className="w-20 h-20 rounded-xl bg-stone-50 border border-dashed border-stone-200 flex flex-col items-center justify-center shrink-0">
                                  <ImageIcon
                                    size={18}
                                    className="text-stone-300"
                                  />
                                  <span className="text-[8px] font-black uppercase text-stone-300 mt-1">
                                    No Image
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-stone-400 text-sm italic">
                      No upcoming events listed.
                    </p>
                  )}
                </div>

                {/* --- NEW SEPARATE STUDENT LOGIN CARD --- */}
                <div className="bg-stone-900 p-8 rounded-[2rem] shadow-2xl shadow-stone-200 relative overflow-hidden group">
                  {/* Decorative Background Element */}
                  <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-bl-[3rem] -mr-8 -mt-8 transition-transform group-hover:scale-110"></div>

                  <div className="relative z-10">
                    <h3 className="text-white text-xl font-black uppercase tracking-tighter leading-none mb-2">
                      Student{" "}
                      <span className="text-stone-400 font-medium">Portal</span>
                    </h3>
                    <p className="text-stone-400 text-[10px] font-bold uppercase tracking-[0.2em] mb-6">
                      Access community features
                    </p>

                    <button
                      onClick={() =>
                        router.push(
                          `/user/login?temple=${encodeURIComponent(selectedTemple.name)}`,
                        )
                      }
                      className="w-full py-4 bg-white text-stone-900 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-stone-100 transition-all duration-300 flex items-center justify-center gap-2"
                    >
                      Login Now <LogIn size={16} />
                    </button>
                  </div>
                </div>

                {/* --- NEW SUBADMIN LOGIN CARD --- */}
                <div className="bg-rose-900 p-8 rounded-[2rem] shadow-2xl shadow-rose-100 relative overflow-hidden group">
                  {/* Decorative Background Element */}
                  <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-bl-[3rem] -mr-8 -mt-8 transition-transform group-hover:scale-110"></div>

                  <div className="relative z-10">
                    <h3 className="text-white text-xl font-black uppercase tracking-tighter leading-none mb-2">
                      Subadmin{" "}
                      <span className="text-rose-300/50 font-medium">
                        Portal
                      </span>
                    </h3>
                    <p className="text-rose-200/60 text-[10px] font-bold uppercase tracking-[0.2em] mb-6">
                      Manage this temple
                    </p>

                    <button
                      onClick={() => router.push("/subadmin/auth")}
                      className="w-full py-4 bg-white text-rose-900 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-rose-50 transition-all duration-300 flex items-center justify-center gap-2"
                    >
                      Admin Login <ShieldCheck size={16} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* VIEW: REGISTRATION */}
        {view === "register" && (
          <div className="max-w-3xl mx-auto animate-in slide-in-from-bottom-6 duration-500">
            {registrationSuccess ? (
              <div className="bg-white p-12 rounded-[2rem] text-center shadow-xl border border-stone-100 space-y-6">
                <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
                  <CheckCircle2 size={40} />
                </div>
                <div className="space-y-2">
                  <h2 className="text-3xl font-extrabold text-stone-900">
                    Application Received
                  </h2>
                  <p className="text-stone-500 text-lg">
                    Thank you for contributing. Our administration team will
                    verify the details and photos. We will notify you via the
                    listed email address once approved.
                  </p>
                </div>
                <button
                  onClick={() => setView("home")}
                  className="mt-4 px-8 py-3 bg-stone-900 text-white rounded-full font-bold hover:bg-stone-800 transition"
                >
                  Back to Directory
                </button>
              </div>
            ) : (
              <div className="bg-white rounded-[2rem] shadow-xl border border-stone-100 p-8 md:p-12">
                <div className="mb-10 text-center">
                  <h2 className="text-3xl font-extrabold text-stone-900">
                    {editingTempleId
                      ? "Edit Temple Details"
                      : "Temple Registration"}
                  </h2>
                  <p className="text-stone-500 mt-2">
                    {editingTempleId
                      ? "Update your temple's information for the community."
                      : "Submit your temple's details for community verification."}
                  </p>
                </div>

                <form onSubmit={handleRegisterSubmit} className="space-y-10">
                  {/* Step 1: Basic Info */}
                  <div className="space-y-6">
                    <div className="flex items-center gap-3 text-amber-600 font-bold uppercase tracking-widest text-xs">
                      <span className="w-6 h-6 rounded-full bg-amber-100 flex items-center justify-center">
                        1
                      </span>
                      General Information
                    </div>

                    <div className="grid grid-cols-1 gap-6">
                      <div className="space-y-1.5">
                        <label className="text-sm font-bold text-stone-700 ml-1">
                          Exam Centre Full Name
                        </label>
                        <input
                          required
                          type="text"
                          className="w-full px-5 py-4 bg-stone-50 border border-stone-200 rounded-2xl focus:bg-white focus:ring-2 focus:ring-amber-500 outline-none transition shadow-sm"
                          placeholder="Shri Digamber Jain Temple..."
                          value={formData.name}
                          onChange={(e) =>
                            setFormData({ ...formData, name: e.target.value })
                          }
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="space-y-1.5">
                        <label className="text-sm font-bold text-stone-700 ml-1">
                          Centre Code
                        </label>
                        <input
                          required
                          type="text"
                          className="w-full px-5 py-4 bg-stone-50 border border-stone-200 rounded-2xl focus:bg-white focus:ring-2 focus:ring-amber-500 outline-none transition shadow-sm"
                          placeholder="e.g. C001"
                          value={formData.centreCode}
                          onChange={(e) =>
                            setFormData({ ...formData, centreCode: e.target.value })
                          }
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-sm font-bold text-stone-700 ml-1">
                          Centre Incharge
                        </label>
                        <input
                          required
                          type="text"
                          className="w-full px-5 py-4 bg-stone-50 border border-stone-200 rounded-2xl focus:bg-white focus:ring-2 focus:ring-amber-500 outline-none transition shadow-sm"
                          placeholder="e.g. Rahul Jain"
                          value={formData.incharge}
                          onChange={(e) =>
                            setFormData({ ...formData, incharge: e.target.value })
                          }
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-sm font-bold text-stone-700 ml-1">
                          Capacity (Seats)
                        </label>
                        <input
                          required
                          type="number"
                          className="w-full px-5 py-4 bg-stone-50 border border-stone-200 rounded-2xl focus:bg-white focus:ring-2 focus:ring-amber-500 outline-none transition shadow-sm"
                          placeholder="e.g. 100"
                          value={formData.capacity || ""}
                          onChange={(e) =>
                            setFormData({ ...formData, capacity: Number(e.target.value) })
                          }
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-1.5">
                        <label className="text-sm font-bold text-stone-700 ml-1">
                          Country
                        </label>
                        <input
                          required
                          type="text"
                          className="w-full px-5 py-4 bg-stone-50 border border-stone-200 rounded-2xl focus:bg-white focus:ring-2 focus:ring-amber-500 outline-none transition shadow-sm"
                          value={formData.country}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              country: e.target.value,
                            })
                          }
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-sm font-bold text-stone-700 ml-1">
                          State
                        </label>
                        <input
                          required
                          type="text"
                          className="w-full px-5 py-4 bg-stone-50 border border-stone-200 rounded-2xl focus:bg-white focus:ring-2 focus:ring-amber-500 outline-none transition shadow-sm"
                          placeholder="e.g. Maharashtra"
                          value={formData.state}
                          onChange={(e) =>
                            setFormData({ ...formData, state: e.target.value })
                          }
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="space-y-1.5">
                        <label className="text-sm font-bold text-stone-700 ml-1">
                          City
                        </label>
                        <input
                          required
                          type="text"
                          className="w-full px-5 py-4 bg-stone-50 border border-stone-200 rounded-2xl focus:bg-white focus:ring-2 focus:ring-amber-500 outline-none transition shadow-sm"
                          placeholder="e.g. Mumbai"
                          value={formData.city}
                          onChange={(e) =>
                            setFormData({ ...formData, city: e.target.value })
                          }
                        />
                      </div>
                      <div className="space-y-1.5 md:col-span-1">
                        <label className="text-sm font-bold text-stone-700 ml-1">
                          Locality
                        </label>
                        <input
                          required
                          type="text"
                          className="w-full px-5 py-4 bg-stone-50 border border-stone-200 rounded-2xl focus:bg-white focus:ring-2 focus:ring-amber-500 outline-none transition shadow-sm"
                          placeholder="Area Name"
                          value={formData.locality}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              locality: e.target.value,
                            })
                          }
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-sm font-bold text-stone-700 ml-1">
                          Pincode
                        </label>
                        <input
                          required
                          type="text"
                          maxLength={6}
                          className="w-full px-5 py-4 bg-stone-50 border border-stone-200 rounded-2xl focus:bg-white focus:ring-2 focus:ring-amber-500 outline-none transition shadow-sm"
                          placeholder="6 Digits"
                          value={formData.pincode}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              pincode: e.target.value,
                            })
                          }
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-bold text-stone-700 ml-1">
                        Photos ({formData.images.length})
                      </label>
                      <div className="flex gap-4 items-center">
                        <input
                          id="temple-register-photo-input"
                          type="file"
                          className="hidden"
                          accept="image/*"
                          onChange={(e) =>
                            handleImageUpload(e, "temple-register")
                          }
                        />
                        <button
                          type="button"
                          onClick={addImageToForm}
                          className="w-24 h-24 rounded-2xl bg-stone-100 border-2 border-dashed border-stone-300 flex flex-col items-center justify-center text-stone-400 hover:border-amber-500 hover:text-amber-600 transition-colors"
                        >
                          <Upload size={24} />
                          <span className="text-[10px] font-bold mt-1">
                            ADD
                          </span>
                        </button>
                        {formData.images.map((img, i) => (
                          <div
                            key={i}
                            className="w-24 h-24 rounded-2xl overflow-hidden relative group"
                          >
                            <img
                              src={img}
                              className="w-full h-full object-cover"
                            />
                            <button
                              type="button"
                              onClick={() =>
                                setFormData((p) => ({
                                  ...p,
                                  images: p.images.filter(
                                    (_, idx) => idx !== i,
                                  ),
                                }))
                              }
                              className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity"
                            >
                              <Trash2 size={20} />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Step 2: Leaders */}
                  <div className="space-y-6">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-3 text-amber-600 font-bold uppercase tracking-widest text-xs">
                        <span className="w-6 h-6 rounded-full bg-amber-100 flex items-center justify-center">
                          2
                        </span>
                        Leadership Committee
                      </div>

                      {/* <button
                        type="button"
                        onClick={addLeaderField}
                        className="text-stone-900 text-xs font-bold flex items-center gap-1.5 bg-stone-100 px-3 py-2 rounded-full hover:bg-stone-200 transition"
                      >
                        <PlusCircle size={14} /> Add Member
                      </button> */}
                    </div>

                    <div className="grid grid-cols-1 gap-4">
                      {formData.leaders.map((leader, index) => (
                        <div
                          key={index}
                          className="p-6 bg-stone-50 rounded-3xl space-y-4 border border-stone-100 relative group/card"
                        >
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <input
                              required
                              placeholder="Full Name"
                              className="w-full px-4 py-3 bg-white border border-stone-200 rounded-xl focus:ring-2 focus:ring-amber-500 outline-none text-sm shadow-sm"
                              value={leader.name}
                              onChange={(e) =>
                                updateLeader(index, "name", e.target.value)
                              }
                            />
                            <select
                              required
                              className="w-full px-4 py-3 bg-white border border-stone-200 rounded-xl focus:ring-2 focus:ring-amber-500 outline-none text-sm shadow-sm appearance-none"
                              value={leader.designation}
                              onChange={(e) =>
                                updateLeader(
                                  index,
                                  "designation",
                                  e.target.value,
                                )
                              }
                            >
                              <option value="">Select Designation</option>
                              <option value="Adyaksh">President</option>
                              {/* <option value="Upadyaksh">
                                Upadyaksh (V. President)
                              </option> */}
                              {/* <option value="Mahamantri">
                                Mahamantri (Gen. Sec.)
                              </option>
                              <option value="Koshadhyaksh">
                                Koshadhyaksh (Treasurer)
                              </option>
                              <option value="Member">Managing Member</option> */}
                            </select>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <input
                              required
                              type="tel"
                              maxLength={10}
                              placeholder="Phone Number (10 Digits)"
                              className="w-full px-4 py-3 bg-white border border-stone-200 rounded-xl focus:ring-2 focus:ring-amber-500 outline-none text-sm shadow-sm"
                              value={leader.phone}
                              onChange={(e) =>
                                updateLeader(index, "phone", e.target.value)
                              }
                            />
                            <input
                              required
                              type="email"
                              placeholder="Email Address"
                              className="w-full px-4 py-3 bg-white border border-stone-200 rounded-xl focus:ring-2 focus:ring-amber-500 outline-none text-sm shadow-sm"
                              value={leader.email}
                              onChange={(e) =>
                                updateLeader(index, "email", e.target.value)
                              }
                            />
                          </div>
                          {formData.leaders.length > 1 && (
                            <button
                              type="button"
                              onClick={() =>
                                setFormData((prev) => ({
                                  ...prev,
                                  leaders: prev.leaders.filter(
                                    (_, i) => i !== index,
                                  ),
                                }))
                              }
                              className="absolute -top-2 -right-2 bg-white text-stone-400 p-1.5 rounded-full border border-stone-200 shadow-sm opacity-0 group-hover/card:opacity-100 transition-opacity hover:text-red-500"
                            >
                              <X size={14} />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-4">
                    {editingTempleId && (
                      <button
                        type="button"
                        onClick={() => {
                          setView("home");
                          setEditingTempleId(null);
                          setFormData({
                            name: "",
                            centreCode: "",
                            capacity: 0,
                            incharge: "",
                            country: "India",
                            state: "",
                            city: "",
                            locality: "",
                            pincode: "",
                            images: [],
                            leaders: [
                              {
                                name: "",
                                designation: "",
                                phone: "",
                                email: "",
                              },
                            ],
                          });
                        }}
                        className="flex-1 px-8 py-4 border-2 border-stone-100 text-stone-600 rounded-2xl font-bold hover:bg-stone-50 transition active:scale-95"
                      >
                        Cancel Edit
                      </button>
                    )}
                    <button
                      type="submit"
                      className="flex-1 px-8 py-4 bg-amber-600 text-white rounded-2xl font-bold hover:bg-amber-700 shadow-xl shadow-stone-200 transition active:scale-95 flex items-center justify-center gap-2"
                    >
                      {editingTempleId ? "Save Changes" : "Submit Registration"}
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        )}

        {/* ============================VIEW: ADMIN PANEL====================== */}
        {view === "admin" && (
          <div className="space-y-8 animate-in fade-in duration-500">
            {!isAdminLoggedIn ? (
              <div className="max-w-md mx-auto bg-white p-10 rounded-[3rem] shadow-xl border border-stone-100 text-center space-y-6 mt-12">
                <div className="w-16 h-16 bg-stone-100 rounded-full flex items-center justify-center mx-auto text-stone-600">
                  <Lock size={28} />
                </div>

                <div className="space-y-2">
                  <h2 className="text-2xl font-bold text-stone-900">
                    Admin Console
                  </h2>
                  <p className="text-sm text-stone-500">
                    Enter credentials to manage temples
                  </p>
                </div>

                <form
                  onSubmit={handleAdminLogin}
                  className="space-y-4 text-left"
                >
                  <div>
                    <label className="text-xs font-bold text-stone-400 uppercase ml-1">
                      Username
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. admin"
                      className="w-full px-5 py-3 mt-1 bg-stone-50 rounded-xl border border-stone-200 outline-none focus:ring-2 focus:ring-amber-500 transition-all"
                      value={adminUsername}
                      onChange={(e) => setAdminUsername(e.target.value)}
                      required
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-stone-400 uppercase ml-1">
                      Password
                    </label>
                    <input
                      type="password"
                      placeholder="••••••••"
                      className="w-full px-5 py-3 mt-1 bg-stone-50 rounded-xl border border-stone-200 outline-none focus:ring-2 focus:ring-amber-500 transition-all"
                      value={adminPassword}
                      onChange={(e) => setAdminPassword(e.target.value)}
                      required
                    />
                  </div>

                  {adminError && (
                    <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm font-medium border border-red-100">
                      {adminError}
                    </div>
                  )}

                  <div className="flex flex-col gap-3 pt-2">
                    {/* LOGIN BUTTON */}
                    <button
                      type="submit"
                      className="w-full bg-stone-900 text-white py-3.5 rounded-xl font-bold hover:bg-black shadow-lg shadow-stone-200 transition-all active:scale-[0.98]"
                    >
                      Login to Console
                    </button>

                    {/* SETUP BUTTON (Sirf first time use ke liye) */}
                    <button
                      type="button"
                      onClick={handleSetup}
                      className="w-full bg-white text-stone-600 py-3 rounded-xl font-bold hover:bg-stone-50 transition-all border border-stone-200 border-dashed text-sm"
                    >
                      First time? Register Admin
                    </button>
                  </div>
                </form>

                <p className="text-[10px] text-stone-400 uppercase tracking-widest font-bold">
                  Secure Access • JainMandirConnect v1.0
                </p>
              </div>
            ) : (
              <>
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-8">
                  <div>
                    <h2 className="text-4xl font-black text-stone-900 tracking-tight">
                      Admin Console
                    </h2>
                    <p className="text-stone-500 mt-1 italic">
                      Reviewing submissions for the global directory.
                    </p>
                  </div>
                  <button
                    onClick={() => setIsAdminLoggedIn(false)}
                    className="px-6 py-2.5 bg-stone-100 text-stone-600 font-bold rounded-xl hover:bg-stone-200 transition-all active:scale-95 shadow-sm border border-stone-200"
                  >
                    Logout
                  </button>
                </div>

                {/* Stats & Controls Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-9 gap-4 mb-8">
                  {/* Stats: Pending */}
                  <div className="px-5 py-3 bg-amber-50 rounded-2xl border border-amber-100 text-center shadow-sm">
                    <span className="text-[10px] text-amber-600 font-bold uppercase block tracking-wider mb-1">
                      Pending
                    </span>
                    <span className="text-3xl font-black text-amber-900 leading-none">
                      {pendingTemples.length}
                    </span>
                  </div>

                  {/* Stats: Live */}
                  <div className="px-5 py-3 bg-green-50 rounded-2xl border border-green-100 text-center shadow-sm">
                    <span className="text-[10px] text-green-600 font-bold uppercase block tracking-wider mb-1">
                      Live
                    </span>
                    <span className="text-3xl font-black text-green-900 leading-none">
                      {temples.filter((t) => t.status === "verified").length}
                    </span>
                  </div>

                  {/* Action: Classes */}
                  <div
                    onClick={() => (window.location.href = "/admin/add-class")}
                    className="px-5 py-3 bg-orange-50 rounded-2xl border border-orange-100 text-center cursor-pointer hover:bg-orange-100 transition-all active:scale-95 shadow-sm group"
                  >
                    <span className="text-[10px] text-orange-600 font-bold uppercase block tracking-wider mb-1">
                      Classes
                    </span>
                    <div className="flex items-center justify-center gap-2">
                      <Users size={14} className="text-orange-600" />
                      <span className="text-sm font-bold text-orange-900">
                        Manage & Add
                      </span>
                    </div>
                  </div>

                  {/* Action: Students */}
                  <div
                    onClick={() => (window.location.href = "/admin/students")}
                    className="px-5 py-3 bg-indigo-50 rounded-2xl border border-indigo-100 text-center cursor-pointer hover:bg-indigo-100 transition-all active:scale-95 shadow-sm group"
                  >
                    <span className="text-[10px] text-indigo-600 font-bold uppercase block tracking-wider mb-1">
                      Students
                    </span>
                    <div className="flex items-center justify-center gap-2">
                      <Users size={14} className="text-indigo-600" />
                      <span className="text-sm font-bold text-indigo-900">
                        Directory
                      </span>
                    </div>
                  </div>

                  {/* Action: Teachers */}
                  <div
                    onClick={() => (window.location.href = "/admin/teachers")}
                    className="px-5 py-3 bg-teal-50 rounded-2xl border border-teal-100 text-center cursor-pointer hover:bg-teal-100 transition-all active:scale-95 shadow-sm group"
                  >
                    <span className="text-[10px] text-teal-600 font-bold uppercase block tracking-wider mb-1">
                      Teachers
                    </span>
                    <div className="flex items-center justify-center gap-2">
                      <Users size={14} className="text-teal-600" />
                      <span className="text-sm font-bold text-teal-900">
                        Staff
                      </span>
                    </div>
                  </div>

                  {/* Action: Exams */}
                  <div
                    onClick={() => (window.location.href = "/admin/exams")}
                    className="px-5 py-3 bg-purple-50 rounded-2xl border border-purple-100 text-center cursor-pointer hover:bg-purple-100 transition-all active:scale-95 shadow-sm group"
                  >
                    <span className="text-[10px] text-purple-600 font-bold uppercase block tracking-wider mb-1">
                      Exams
                    </span>
                    <div className="flex items-center justify-center gap-2">
                      <Calendar size={14} className="text-purple-600" />
                      <span className="text-sm font-bold text-purple-900">
                        Schedules
                      </span>
                    </div>
                  </div>

                  {/* Action: Results */}
                  <div
                    onClick={() => (window.location.href = "/admin/results")}
                    className="px-5 py-3 bg-emerald-50 rounded-2xl border border-emerald-100 text-center cursor-pointer hover:bg-emerald-100 transition-all active:scale-95 shadow-sm group"
                  >
                    <span className="text-[10px] text-emerald-600 font-bold uppercase block tracking-wider mb-1">
                      Results
                    </span>
                    <div className="flex items-center justify-center gap-2">
                      <Megaphone size={14} className="text-emerald-600" />
                      <span className="text-sm font-bold text-emerald-900">
                        Merit List
                      </span>
                    </div>
                  </div>

                  {/* Action: Broadcast/Notifications */}
                  <div
                    onClick={() =>
                      (window.location.href = "/admin/notifications")
                    }
                    className="px-5 py-3 bg-amber-50 rounded-2xl border border-amber-100 text-center cursor-pointer hover:bg-amber-100 transition-all active:scale-95 shadow-sm group"
                  >
                    <span className="text-[10px] text-amber-600 font-bold uppercase block tracking-wider mb-1">
                      Broadcast
                    </span>
                    <div className="flex items-center justify-center gap-2">
                      <Megaphone
                        size={14}
                        className="text-amber-600 group-hover:rotate-12 transition-transform"
                      />
                      <span className="text-sm font-bold text-amber-900">
                        Broadcasts
                      </span>
                    </div>
                  </div>

                  {/* Action: Banners */}
                  <div
                    onClick={() => setActiveAdminSubView("banners")}
                    className={`px-5 py-3 rounded-2xl border text-center cursor-pointer transition-all active:scale-95 shadow-sm group ${
                      activeAdminSubView === "banners"
                        ? "bg-rose-100 border-rose-200"
                        : "bg-rose-50 border-rose-100 hover:bg-rose-100"
                    }`}
                  >
                    <span className="text-[10px] text-rose-600 font-bold uppercase block tracking-wider mb-1">
                      Banners
                    </span>
                    <div className="flex items-center justify-center gap-2">
                      <ImageIcon size={14} className="text-rose-600" />
                      <span className="text-sm font-bold text-rose-900">
                        Carousel
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-[2rem] shadow-xl border border-stone-100 overflow-hidden">
                  <div className="overflow-x-auto">
                    {activeAdminSubView === "temples" ? (
                      <table className="w-full text-left">
                        <thead className="bg-stone-50/50 border-b border-stone-100">
                          <tr>
                            <th className="px-8 py-5 text-[10px] font-bold text-stone-400 uppercase tracking-widest">
                              Temple Details
                            </th>
                            <th className="px-8 py-5 text-[10px] font-bold text-stone-400 uppercase tracking-widest">
                              Location
                            </th>
                            <th className="px-8 py-5 text-[10px] font-bold text-stone-400 uppercase tracking-widest">
                              Status
                            </th>
                            <th className="px-8 py-5 text-[10px] font-bold text-stone-400 uppercase tracking-widest">
                              Actions
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-stone-100">
                          {temples.map((temple, index) => (
                            <tr
                              key={temple._id || temple.id}
                              className="hover:bg-stone-50/40 transition-colors group"
                            >
                              <td className="px-8 py-6 ">
                                <div className="flex items-center gap-4">
                                  <div className="w-14 h-14 rounded-2xl overflow-hidden shadow-sm shrink-0">
                                    <img
                                      src={temple.images[0]}
                                      className="w-full h-full object-cover"
                                    />
                                  </div>
                                  <div className="min-w-0">
                                    <p className="font-bold text-stone-800 text-base truncate">
                                      {temple.name}
                                    </p>
                                    <div className="flex flex-wrap gap-x-3 gap-y-1 mt-1 text-[10px] font-bold text-stone-400 uppercase tracking-wide">
                                      <span>ID: {temple.displayId || String(index + 1).padStart(2, "0")}</span>
                                      {(temple as any).centreCode && <span className="text-indigo-600 font-black">Code: {(temple as any).centreCode}</span>}
                                      {(temple as any).incharge && <span className="text-orange-600 font-black">Incharge: {(temple as any).incharge}</span>}
                                      {(temple as any).capacity !== undefined && <span className="text-teal-600 font-black">Capacity: {(temple as any).capacity}</span>}
                                    </div>
                                  </div>
                                </div>
                              </td>
                              <td className="px-8 py-6">
                                <p className="text-sm font-semibold text-stone-700">
                                  {temple.city}, {temple.state}
                                </p>
                                <p className="text-xs text-stone-400">
                                  {temple.country}
                                </p>
                              </td>
                              <td className="px-8 py-6">
                                {temple.status === "verified" ? (
                                  <span className="inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest bg-green-100 text-green-800">
                                    Verified
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest bg-amber-100 text-amber-800">
                                    Review Pending
                                  </span>
                                )}
                              </td>
                              <td className="px-8 py-6 text-right">
                                {temple.status === "pending" && (
                                  <button
                                    onClick={() => {
                                      const id = temple._id || temple.id;
                                      if (id) {
                                        handleApprove(String(id));
                                      }
                                    }}
                                    className="text-amber-600 font-bold text-xs hover:underline bg-amber-50 px-3 py-1.5 rounded-lg"
                                  >
                                    Approve
                                  </button>
                                )}

                                {temple.status === "verified" && (
                                  <button
                                    onClick={() => {
                                      const id = temple._id || temple.id;
                                      setEventTempleId(id ? String(id) : null);
                                      setIsEventModalOpen(true);
                                    }}
                                    className="bg-amber-50 text-amber-700 font-bold text-xs px-3 py-1.5 rounded-lg hover:bg-amber-100 transition flex items-center gap-1 ml-auto"
                                  >
                                    <span className="text-sm">+</span> Event
                                  </button>
                                )}

                                <div className="flex gap-2 ml-auto mt-2">
                                  <button
                                    onClick={() => {
                                      setEditingTempleId(
                                        String(temple._id || temple.id),
                                      );
                                      setFormData({
                                        name: temple.name,
                                        centreCode: (temple as any).centreCode || "",
                                        capacity: (temple as any).capacity || 0,
                                        incharge: (temple as any).incharge || "",
                                        country: temple.country || "India",
                                        state: temple.state,
                                        city: temple.city,
                                        locality: temple.locality || "",
                                        pincode: temple.pincode || "",
                                        images: temple.images || [],
                                        leaders: temple.leaders || [
                                          {
                                            name: "",
                                            designation: "",
                                            phone: "",
                                            email: "",
                                          },
                                        ],
                                      });
                                      setView("register");
                                    }}
                                    className="bg-blue-50 text-blue-700 font-bold text-[10px] px-2.5 py-1.5 rounded-lg hover:bg-blue-100 transition uppercase tracking-wider"
                                  >
                                    Edit
                                  </button>
                                  <button
                                    onClick={() => {
                                      const id = temple._id || temple.id;
                                      if (id) handleDeleteTemple(id);
                                    }}
                                    className="bg-red-50 text-red-700 font-bold text-[10px] px-2.5 py-1.5 rounded-lg hover:bg-red-100 transition uppercase tracking-wider"
                                  >
                                    Delete
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    ) : activeAdminSubView === "events" ? (
                      <div className="p-8">
                        <div className="flex justify-between items-center mb-6">
                          <h2 className="text-2xl font-black text-stone-900 uppercase tracking-tight">
                            Manage Events
                          </h2>
                          <button
                            onClick={() => setActiveAdminSubView("temples")}
                            className="text-stone-500 hover:text-stone-800 text-sm font-bold flex items-center gap-1"
                          >
                            <ArrowLeft size={16} /> Back
                          </button>
                          <button
                            onClick={() => {
                              showModal(
                                "loading",
                                "Synchronizing...",
                                "Fetching latest data from server",
                              );
                              fetchTemples().then(() => {
                                setTimeout(
                                  () =>
                                    showModal(
                                      "success",
                                      "Synced",
                                      "Data refreshed! ✅",
                                    ),
                                  500,
                                );
                              });
                            }}
                            className="text-amber-600 hover:text-amber-700 text-sm font-bold flex items-center gap-1 bg-amber-50 px-3 py-1 rounded-lg transition"
                          >
                            <History size={14} /> Force Refresh
                          </button>
                        </div>
                        <div className="overflow-hidden border border-stone-100 rounded-2xl">
                          <table className="w-full text-left">
                            <thead className="bg-stone-50/50 border-b border-stone-100">
                              <tr>
                                <th className="px-6 py-4 text-[10px] font-bold text-stone-400 uppercase tracking-widest">
                                  Event
                                </th>
                                <th className="px-6 py-4 text-[10px] font-bold text-stone-400 uppercase tracking-widest">
                                  Temple
                                </th>
                                <th className="px-6 py-4 text-[10px] font-bold text-stone-400 uppercase tracking-widest">
                                  Date
                                </th>
                                <th className="px-6 py-4 text-[10px] font-bold text-stone-400 uppercase tracking-widest">
                                  Actions
                                </th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-stone-100">
                              {temples
                                .filter((t) => t.events?.length > 0)
                                .flatMap((temple) =>
                                  temple.events.map((event: any) => ({
                                    ...event,
                                    templeName: temple.name,
                                    tId: temple._id,
                                  })),
                                )
                                .map((event: any) => (
                                  <tr
                                    key={event._id}
                                    className="hover:bg-stone-50/40 transition-colors"
                                  >
                                    <td className="px-6 py-4">
                                      <div className="flex items-center gap-3">
                                        {event.image ? (
                                          <div
                                            className="w-12 h-12 rounded-lg overflow-hidden border border-stone-100 shrink-0 cursor-zoom-in relative group/admin-img"
                                            onClick={() =>
                                              setSelectedEventImage(event.image)
                                            }
                                          >
                                            <img
                                              src={event.image}
                                              className="w-full h-full object-cover"
                                              alt={event.title}
                                              onError={(e) => {
                                                const target = e.currentTarget;
                                                const parent =
                                                  target.parentElement;
                                                if (
                                                  parent &&
                                                  !parent.querySelector(
                                                    ".img-error-label-admin",
                                                  )
                                                ) {
                                                  target.style.opacity = "0.3";
                                                  const errBox =
                                                    document.createElement(
                                                      "div",
                                                    );
                                                  errBox.className =
                                                    "img-error-label-admin absolute inset-0 flex flex-col items-center justify-center bg-red-50/80 text-red-400";
                                                  errBox.innerHTML = `
                                                      <span class="text-[10px] font-bold uppercase">Err</span>
                                                      <button class="text-[9px] underline px-2 py-0.5 mt-0.5" onclick="const img = this.closest('.group\\/admin-img').querySelector('img'); img.src = img.src.split('?retry=')[0] + '?retry=' + Date.now(); this.parentElement.remove();">Retry</button>
                                                    `;
                                                  parent.appendChild(errBox);
                                                }
                                              }}
                                            />
                                          </div>
                                        ) : (
                                          <div className="w-12 h-12 rounded-lg bg-stone-50 border border-dashed border-stone-200 flex items-center justify-center shrink-0">
                                            <ImageIcon
                                              size={16}
                                              className="text-stone-200"
                                            />
                                          </div>
                                        )}
                                        <div>
                                          <div className="flex items-center gap-2">
                                            <p className="font-bold text-stone-800 text-sm">
                                              {event.title}
                                            </p>
                                            {event.image && (
                                              <span className="text-[8px] bg-green-100 text-green-700 px-1 py-0.5 rounded-full font-black">
                                                {Math.round(
                                                  event.image.length / 1024,
                                                )}
                                                KB
                                              </span>
                                            )}
                                          </div>
                                          <p className="text-[10px] text-stone-500 line-clamp-1 max-w-[200px]">
                                            {event.description}
                                          </p>
                                        </div>
                                      </div>
                                    </td>
                                    <td className="px-6 py-4">
                                      <span className="text-xs font-bold text-stone-600 bg-stone-100 px-2 py-1 rounded-md">
                                        {event.templeName}
                                      </span>
                                    </td>
                                    <td className="px-6 py-4">
                                      <p className="text-xs font-bold text-stone-700">
                                        {event.date}
                                      </p>
                                    </td>
                                    <td className="px-6 py-4">
                                      <div className="flex gap-2">
                                        <button
                                          onClick={() => {
                                            setEditingEvent({
                                              templeId: String(event.tId),
                                              eventId: String(event._id),
                                              eventData: event,
                                            });
                                            setIsEditEventModalOpen(true);
                                          }}
                                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                                          title="Edit"
                                        >
                                          <Edit2 size={16} />
                                        </button>
                                        <button
                                          onClick={() =>
                                            handleDeleteEvent(
                                              String(event.tId),
                                              String(event._id),
                                            )
                                          }
                                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                                          title="Delete"
                                        >
                                          <Trash2 size={16} />
                                        </button>
                                      </div>
                                    </td>
                                  </tr>
                                ))}
                            </tbody>
                          </table>
                          {temples.filter((t) => t.events?.length > 0)
                            .length === 0 && (
                              <div className="text-center py-20 text-stone-400 bg-stone-50/30">
                                <Calendar
                                  size={48}
                                  className="mx-auto mb-4 opacity-10"
                                />
                                <p className="font-bold text-sm">
                                  No events found.
                                </p>
                              </div>
                            )}
                        </div>
                      </div>
                    ) : (
                      <div className="p-8 space-y-8 animate-in fade-in duration-500">
                        <div className="flex justify-between items-center pb-4 border-b border-stone-100">
                          <div>
                            <h2 className="text-2xl font-black text-stone-900 uppercase tracking-tight">
                              Manage Carousel Banners
                            </h2>
                            <p className="text-sm text-stone-500 mt-1">
                              Upload and toggle active banners shown on the landing page carousel.
                            </p>
                          </div>
                          <button
                            onClick={() => setActiveAdminSubView("temples")}
                            className="text-stone-500 hover:text-stone-800 text-sm font-bold flex items-center gap-1 transition"
                          >
                            <ArrowLeft size={16} /> Back
                          </button>
                        </div>

                        {/* Add Banner Form */}
                        <form onSubmit={handleAddBanner} className="bg-stone-50/50 border border-stone-100 p-6 rounded-3xl space-y-6">
                          <h3 className="text-lg font-bold text-stone-800 flex items-center gap-2">
                            <PlusCircle size={20} className="text-amber-600" />
                            Add New Banner
                          </h3>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Banner Image Upload */}
                            <div className="space-y-2">
                              <label className="text-xs font-bold text-stone-500 uppercase ml-1 block">
                                Banner Image (Compressed to JPG) <span className="text-red-500">*</span>
                              </label>
                              <div className="relative border-2 border-dashed border-stone-200 rounded-2xl p-6 hover:border-amber-500 transition-all flex flex-col items-center justify-center bg-white cursor-pointer group">
                                <input
                                  type="file"
                                  accept="image/*"
                                  onChange={(e) => handleImageUpload(e, "banner")}
                                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                />
                                {bannerData.imageUrl ? (
                                  <div className="w-full h-32 relative rounded-lg overflow-hidden border border-stone-100">
                                    <img
                                      src={bannerData.imageUrl}
                                      className="w-full h-full object-cover"
                                      alt="Preview"
                                    />
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.preventDefault();
                                        setBannerData((prev) => ({ ...prev, imageUrl: "" }));
                                      }}
                                      className="absolute top-2 right-2 bg-red-600 text-white p-1.5 rounded-full hover:bg-red-700 transition"
                                    >
                                      <X size={14} />
                                    </button>
                                  </div>
                                ) : (
                                  <div className="text-center space-y-2 pointer-events-none">
                                    <Upload size={24} className="mx-auto text-stone-400 group-hover:text-amber-600 transition" />
                                    <p className="text-sm font-semibold text-stone-600">Select Banner Image</p>
                                    <p className="text-xs text-stone-400">JPG, PNG up to 5MB (automatically compressed)</p>
                                  </div>
                                )}
                              </div>
                            </div>

                            <div className="space-y-4">
                              {/* Title (Optional) */}
                              <div>
                                <label className="text-xs font-bold text-stone-500 uppercase ml-1 block">
                                  Title / Heading Overlay (Optional)
                                </label>
                                <input
                                  type="text"
                                  placeholder="e.g. Welcome to Jain Pathshala"
                                  className="w-full px-4 py-3 bg-white border border-stone-200 rounded-xl outline-none focus:ring-2 focus:ring-amber-500 transition-all text-sm font-semibold text-stone-700 mt-1"
                                  value={bannerData.title}
                                  onChange={(e) => setBannerData((prev) => ({ ...prev, title: e.target.value }))}
                                />
                              </div>

                              {/* Redirect Link (Optional) */}
                              <div>
                                <label className="text-xs font-bold text-stone-500 uppercase ml-1 block">
                                  Redirect Link URL (Optional)
                                </label>
                                <input
                                  type="text"
                                  placeholder="e.g. https://example.com or /admin/add-class"
                                  className="w-full px-4 py-3 bg-white border border-stone-200 rounded-xl outline-none focus:ring-2 focus:ring-amber-500 transition-all text-sm font-semibold text-stone-700 mt-1"
                                  value={bannerData.link}
                                  onChange={(e) => setBannerData((prev) => ({ ...prev, link: e.target.value }))}
                                />
                              </div>

                              {/* Active Status */}
                              <div className="flex items-center gap-3 pt-2">
                                <input
                                  type="checkbox"
                                  id="isActive"
                                  className="w-4 h-4 text-amber-600 border-stone-300 rounded focus:ring-amber-500 cursor-pointer"
                                  checked={bannerData.isActive}
                                  onChange={(e) => setBannerData((prev) => ({ ...prev, isActive: e.target.checked }))}
                                />
                                <label htmlFor="isActive" className="text-sm font-bold text-stone-600 cursor-pointer">
                                  Active immediately in carousel
                                </label>
                              </div>
                            </div>
                          </div>

                          {/* Submit Button */}
                          <div className="flex justify-end">
                            <button
                              type="submit"
                              className="bg-amber-600 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-amber-700 transition active:scale-95 text-sm shadow-sm"
                            >
                              Add Banner
                            </button>
                          </div>
                        </form>

                        {/* Banners List */}
                        <div className="space-y-4">
                          <h3 className="text-lg font-bold text-stone-800">Uploaded Banners ({banners.length})</h3>

                          {banners.length === 0 ? (
                            <div className="text-center py-12 text-stone-400 bg-stone-50 rounded-2xl border border-dashed border-stone-200">
                              <ImageIcon size={40} className="mx-auto mb-3 opacity-20" />
                              <p className="font-bold text-sm">No banners uploaded yet.</p>
                            </div>
                          ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                              {banners.map((banner) => (
                                <div key={banner._id} className="border border-stone-100 bg-white rounded-3xl overflow-hidden shadow-sm flex flex-col group hover:shadow-md transition">
                                  <div className="h-40 relative bg-stone-50 border-b border-stone-100 overflow-hidden">
                                    <img
                                      src={banner.imageUrl}
                                      className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                                      alt={banner.title || "Banner"}
                                    />
                                    <div className="absolute top-3 right-3 flex gap-2">
                                      <span className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider shadow-sm backdrop-blur ${
                                        banner.isActive
                                          ? "bg-green-500/95 text-white"
                                          : "bg-stone-500/95 text-white"
                                      }`}>
                                        {banner.isActive ? "Active" : "Inactive"}
                                      </span>
                                    </div>
                                  </div>
                                  <div className="p-4 flex-1 flex flex-col justify-between space-y-4">
                                    <div>
                                      <p className="font-bold text-stone-800 text-sm truncate">
                                        {banner.title || <span className="text-stone-400 italic">No Title</span>}
                                      </p>
                                      <p className="text-xs text-stone-400 truncate mt-1">
                                        {banner.link ? (
                                          <a href={banner.link} target="_blank" rel="noopener noreferrer" className="text-amber-600 hover:underline">
                                            {banner.link}
                                          </a>
                                        ) : (
                                          <span className="italic">No redirect link</span>
                                        )}
                                      </p>
                                    </div>

                                    <div className="flex items-center justify-between pt-2 border-t border-stone-100">
                                      <button
                                        onClick={() => handleToggleBanner(banner._id, banner.isActive)}
                                        className={`text-xs font-bold px-3 py-1.5 rounded-lg transition ${
                                          banner.isActive
                                            ? "bg-stone-100 text-stone-600 hover:bg-stone-200"
                                            : "bg-green-50 text-green-700 hover:bg-green-100"
                                        }`}
                                      >
                                        {banner.isActive ? "Deactivate" : "Activate"}
                                      </button>
                                      <button
                                        onClick={() => handleDeleteBanner(banner._id)}
                                        className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition"
                                        title="Delete Banner"
                                      >
                                        <Trash2 size={16} />
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* --- ADD EVENT MODAL --- */}
        {isEventModalOpen && (
          <div className="fixed inset-0 bg-stone-900/40 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
            <div className="bg-white rounded-[2.5rem] p-8 max-w-md w-full shadow-2xl border border-stone-100">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-black text-stone-900 uppercase tracking-tight">
                  Add Event
                </h2>
                <button
                  onClick={() => setIsEventModalOpen(false)}
                  className="text-stone-400 hover:text-stone-600"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-[10px] font-bold text-stone-400 uppercase tracking-widest ml-2">
                    Event Title
                  </label>
                  <input
                    type="text"
                    value={eventData.title}
                    placeholder="e.g. Maha Shivratri Utsav"
                    className="w-full p-4 bg-stone-50 border border-stone-100 rounded-2xl focus:ring-2 focus:ring-orange-500 outline-none transition"
                    onChange={(e) =>
                      setEventData({ ...eventData, title: e.target.value })
                    }
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-stone-400 uppercase tracking-widest ml-2">
                    Event Date
                  </label>
                  <input
                    type="date"
                    value={eventData.date}
                    className="w-full p-4 bg-stone-50 border border-stone-100 rounded-2xl focus:ring-2 focus:ring-orange-500 outline-none transition"
                    onChange={(e) =>
                      setEventData({ ...eventData, date: e.target.value })
                    }
                  />
                </div>

                <div>
                  <textarea
                    placeholder="Tell us about the celebration..."
                    className="w-full p-4 bg-stone-50 border border-stone-100 rounded-2xl focus:ring-2 focus:ring-orange-500 outline-none h-28 transition"
                    value={eventData.description}
                    onChange={(e) =>
                      setEventData({
                        ...eventData,
                        description: e.target.value,
                      })
                    }
                  ></textarea>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-stone-400 uppercase tracking-widest ml-2">
                    Event Image
                  </label>
                  <div className="mt-2 flex items-center gap-4">
                    <label className="cursor-pointer bg-stone-50 border border-dashed border-stone-300 rounded-2xl p-4 flex-1 flex flex-col items-center justify-center hover:bg-stone-100 transition">
                      <Upload size={20} className="text-stone-400 mb-1" />
                      <span className="text-[10px] font-bold text-stone-500">
                        Upload Image
                      </span>
                      <input
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={(e) => handleImageUpload(e, "event")}
                      />
                    </label>
                    {eventData.image && (
                      <div className="w-20 h-20 rounded-2xl overflow-hidden border border-stone-200">
                        <img
                          src={eventData.image}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex gap-4 mt-8">
                <button
                  onClick={() => setIsEventModalOpen(false)}
                  className="flex-1 py-4 font-bold text-stone-500 hover:bg-stone-50 rounded-2xl transition"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    if (eventTempleId) {
                      handleAddEvent(eventTempleId, eventData);
                      setIsEventModalOpen(false);
                    }
                  }}
                  className="flex-1 py-4 bg-orange-500 text-white font-bold rounded-2xl shadow-lg shadow-orange-200 hover:bg-orange-600 transition"
                >
                  Save Event
                </button>
              </div>
            </div>
          </div>
        )}

        {/* --- EDIT EVENT MODAL --- */}
        {isEditEventModalOpen && editingEvent && (
          <div className="fixed inset-0 bg-stone-900/40 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
            <div className="bg-white rounded-[2.5rem] p-8 max-w-md w-full shadow-2xl border border-stone-100">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-black text-stone-900 uppercase tracking-tight">
                  Edit Event
                </h2>
                <button
                  onClick={() => setIsEditEventModalOpen(false)}
                  className="text-stone-400 hover:text-stone-600"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-[10px] font-bold text-stone-400 uppercase tracking-widest ml-2">
                    Event Title
                  </label>
                  <input
                    type="text"
                    className="w-full p-4 bg-stone-50 border border-stone-100 rounded-2xl focus:ring-2 focus:ring-amber-500 outline-none transition"
                    value={editingEvent.eventData.title}
                    onChange={(e) =>
                      setEditingEvent({
                        ...editingEvent,
                        eventData: {
                          ...editingEvent.eventData,
                          title: e.target.value,
                        },
                      })
                    }
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-stone-400 uppercase tracking-widest ml-2">
                    Event Date
                  </label>
                  <input
                    type="date"
                    className="w-full p-4 bg-stone-50 border border-stone-100 rounded-2xl focus:ring-2 focus:ring-amber-500 outline-none transition"
                    value={editingEvent.eventData.date}
                    onChange={(e) =>
                      setEditingEvent({
                        ...editingEvent,
                        eventData: {
                          ...editingEvent.eventData,
                          date: e.target.value,
                        },
                      })
                    }
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-stone-400 uppercase tracking-widest ml-2">
                    Description
                  </label>
                  <textarea
                    className="w-full p-4 bg-stone-50 border border-stone-100 rounded-2xl focus:ring-2 focus:ring-amber-500 outline-none h-28 transition"
                    value={editingEvent.eventData.description}
                    onChange={(e) =>
                      setEditingEvent({
                        ...editingEvent,
                        eventData: {
                          ...editingEvent.eventData,
                          description: e.target.value,
                        },
                      })
                    }
                  ></textarea>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-stone-400 uppercase tracking-widest ml-2">
                    Event Image
                  </label>
                  <div className="mt-2 flex items-center gap-4">
                    <label className="cursor-pointer bg-stone-50 border border-dashed border-stone-300 rounded-2xl p-4 flex-1 flex flex-col items-center justify-center hover:bg-stone-100 transition">
                      <Upload size={20} className="text-stone-400 mb-1" />
                      <span className="text-[10px] font-bold text-stone-500">
                        Change Image
                      </span>
                      <input
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={(e) => handleImageUpload(e, "edit-event")}
                      />
                    </label>
                    {editingEvent.eventData.image ? (
                      <div className="w-20 h-20 rounded-2xl overflow-hidden border border-stone-200 bg-stone-50 flex items-center justify-center">
                        <img
                          src={editingEvent.eventData.image}
                          className="w-full h-full object-cover"
                          key={editingEvent.eventData.image.substring(0, 50)} // Force re-render on image change
                          onError={(e) => {
                            e.currentTarget.style.display = "none";
                            const parent = e.currentTarget.parentElement;
                            if (parent) {
                              const err = document.createElement("div");
                              err.className =
                                "text-[x-small] font-bold text-red-400 text-center px-1";
                              err.innerText = "PREVIEW ERROR";
                              parent.appendChild(err);
                            }
                          }}
                        />
                      </div>
                    ) : (
                      <div className="w-20 h-20 rounded-2xl border border-dashed border-stone-200 flex flex-col items-center justify-center bg-stone-50/50">
                        <ImageIcon size={16} className="text-stone-300" />
                        <span className="text-[8px] font-bold text-stone-400 mt-1 uppercase">
                          No Image
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex gap-4 mt-8">
                <button
                  onClick={() => setIsEditEventModalOpen(false)}
                  className="flex-1 py-4 font-bold text-stone-500 hover:bg-stone-50 rounded-2xl transition"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    handleUpdateEvent(
                      editingEvent.templeId,
                      editingEvent.eventId,
                      editingEvent.eventData,
                    );
                    setIsEditEventModalOpen(false);
                  }}
                  className="flex-1 py-4 bg-amber-600 text-white font-bold rounded-2xl shadow-lg shadow-amber-200 hover:bg-amber-700 transition"
                >
                  Update Event
                </button>
              </div>
            </div>
          </div>
        )}

        {/* --- EXAM CENTERS LIST MODAL --- */}
        {isExamVenueModalOpen && (
          <div className="fixed inset-0 bg-stone-900/60 backdrop-blur-md flex items-center justify-center z-[120] p-4 animate-in fade-in duration-300">
            <div className="bg-white rounded-[2.5rem] p-8 max-w-2xl w-full shadow-2xl border border-stone-100 transform animate-in zoom-in-95 duration-300 max-h-[85vh] flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-center mb-6 pb-4 border-b border-stone-100">
                  <div>
                    <h2 className="text-2xl font-black text-stone-900 uppercase tracking-tighter">
                      एग्जाम सेंटर सूची
                    </h2>
                    <p className="text-stone-400 text-xs font-bold uppercase tracking-wider mt-0.5">
                      Exam Venues & Schedules
                    </p>
                  </div>
                  <button
                    onClick={() => setIsExamVenueModalOpen(false)}
                    className="p-2 text-stone-400 hover:text-stone-850 hover:bg-stone-50 rounded-full transition"
                  >
                    <X size={20} />
                  </button>
                </div>

                <div className="overflow-y-auto max-h-[55vh] pr-2">
                  {classesList.length === 0 ? (
                    <div className="text-center py-12 text-stone-400">
                      No exam schedules available at the moment.
                    </div>
                  ) : (
                    <div className="space-y-1">
                      {/* Header Row (Desktop only) */}
                      <div className="hidden sm:grid grid-cols-12 gap-4 pb-3 border-b border-stone-100 text-[10px] font-black text-stone-400 uppercase tracking-widest px-2">
                        <div className="col-span-4">Class / Grade</div>
                        <div className="col-span-4">Venue / Center</div>
                        <div className="col-span-4">Date & Time</div>
                      </div>

                      <div className="divide-y divide-stone-100">
                        {classesList.map((cls) => (
                          <div key={cls.grade} className="py-4 px-2 grid grid-cols-1 sm:grid-cols-12 gap-3 sm:gap-4 items-center">
                            {/* Grade & Status */}
                            <div className="col-span-1 sm:col-span-4">
                              <h3 className="font-extrabold text-stone-850 text-base leading-tight">
                                {cls.grade}
                              </h3>
                              {cls.examSubject && (
                                <p className="text-[10px] text-orange-600 font-black uppercase tracking-wider mt-1">
                                  Subject: {cls.examSubject}
                                </p>
                              )}
                              <p className="text-xs text-stone-400 font-semibold mt-1">
                                Status: <span className={cls.status === "Active" ? "text-green-600 font-bold" : "text-stone-550"}>{cls.status}</span>
                              </p>
                            </div>
                            
                            {/* Venue */}
                            <div className="col-span-1 sm:col-span-4">
                              <span className="text-[9px] font-black text-stone-400 uppercase tracking-widest sm:hidden block mb-0.5">Venue / Center</span>
                              <span className="font-semibold text-stone-700 text-sm">{cls.examVenue || "Not Assigned"}</span>
                            </div>

                            {/* Date & Time */}
                            <div className="col-span-1 sm:col-span-4">
                              <span className="text-[9px] font-black text-stone-400 uppercase tracking-widest sm:hidden block mb-0.5">Date & Time</span>
                              <span className="font-semibold text-stone-700 text-sm">
                                {cls.examDate !== "TBA" ? `${cls.examDate} @ ${cls.examTime}` : "TBA"}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-8 pt-4 border-t border-stone-100 flex justify-end">
                <button
                  onClick={() => setIsExamVenueModalOpen(false)}
                  className="bg-stone-900 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-black transition active:scale-95 text-sm"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* --- ADD CLASS MODAL --- */}
        {/* English Comment: Modal overlay for creating a new educational class */}
        {isClassModalOpen && (
          <div className="fixed inset-0 bg-stone-900/60 backdrop-blur-md flex items-center justify-center z-[110] p-4 animate-in fade-in duration-300">
            <div className="bg-white rounded-[2.5rem] p-10 max-w-md w-full shadow-2xl border border-stone-100 transform animate-in zoom-in-95 duration-300">
              <h2 className="text-2xl font-black text-stone-900 uppercase tracking-tighter mb-2">
                New Class
              </h2>
              <p className="text-stone-400 text-xs font-bold uppercase tracking-widest mb-8">
                Setup curriculum details
              </p>

              <div className="space-y-5">
                <div>
                  <label className="text-[10px] font-bold text-stone-400 uppercase tracking-widest ml-2">
                    Class Title
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Tattvartha Sutra Level 1"
                    className="w-full p-4 bg-stone-50 border border-stone-100 rounded-2xl focus:ring-2 focus:ring-stone-900 outline-none font-semibold text-stone-800"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-stone-400 uppercase tracking-widest ml-2">
                    Department
                  </label>
                  <select className="w-full p-4 bg-stone-50 border border-stone-100 rounded-2xl focus:ring-2 focus:ring-stone-900 outline-none font-semibold text-stone-800 appearance-none">
                    <option>Religious Studies</option>
                    <option>Prakrit Language</option>
                    <option>Jain History</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-4 mt-10">
                <button
                  onClick={() => setIsClassModalOpen(false)}
                  className="flex-1 py-4 font-bold text-stone-400 hover:text-stone-600 transition-colors"
                >
                  Cancel
                </button>
                <button className="flex-1 py-4 bg-stone-900 text-white font-bold rounded-2xl shadow-xl hover:bg-black transition-all">
                  Create
                </button>
              </div>
            </div>
          </div>
        )}

        {/* --- ADD EXAM MODAL --- */}
        {/* English Comment: Detailed modal for scheduling examinations with venue and timetable */}
        {isExamModalOpen && (
          <div className="fixed inset-0 bg-stone-900/60 backdrop-blur-md flex items-center justify-center z-[110] p-4 animate-in fade-in duration-300">
            <div className="bg-white rounded-[3rem] p-10 max-w-lg w-full shadow-2xl border border-stone-100 overflow-y-auto max-h-[90vh] transform animate-in zoom-in-95 duration-300">
              <h2 className="text-3xl font-black text-stone-900 uppercase tracking-tighter mb-1">
                Schedule Exam
              </h2>
              <p className="text-stone-400 text-xs font-bold uppercase tracking-widest mb-8">
                Publish official exam details
              </p>

              <div className="space-y-6">
                <div>
                  <label className="text-[10px] font-bold text-stone-400 uppercase tracking-widest ml-2">
                    Exam Name
                  </label>
                  <input
                    type="text"
                    placeholder="Annual Jain Scholarship 2026"
                    className="w-full p-4 bg-stone-50 border border-stone-100 rounded-2xl outline-none font-semibold"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-stone-400 uppercase tracking-widest ml-2">
                    Exam Center / Venue
                  </label>
                  <input
                    type="text"
                    placeholder="Main Hall, Ahmedabad Jain Pathshala"
                    className="w-full p-4 bg-stone-50 border border-stone-100 rounded-2xl outline-none font-semibold"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-bold text-stone-400 uppercase tracking-widest ml-2">
                      Date
                    </label>
                    <input
                      type="date"
                      className="w-full p-4 bg-stone-50 border border-stone-100 rounded-2xl outline-none font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-stone-400 uppercase tracking-widest ml-2">
                      Time
                    </label>
                    <input
                      type="time"
                      className="w-full p-4 bg-stone-50 border border-stone-100 rounded-2xl outline-none font-bold"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-stone-400 uppercase tracking-widest ml-2">
                    Timetable / Special Instructions
                  </label>
                  <textarea
                    placeholder="10:00 AM - Paper 1 (Theory)&#10;12:30 PM - Paper 2 (Oral)"
                    className="w-full p-4 bg-stone-50 border border-stone-100 rounded-2xl h-32 outline-none font-medium text-sm"
                  ></textarea>
                </div>
              </div>

              <div className="flex gap-4 mt-10">
                <button
                  onClick={() => setIsExamModalOpen(false)}
                  className="flex-1 py-4 font-bold text-stone-400 hover:text-stone-600 transition-colors"
                >
                  Discard
                </button>
                <button className="flex-1 py-4 bg-purple-600 text-white font-bold rounded-2xl shadow-xl shadow-purple-100 hover:bg-purple-700 transition-all">
                  Publish Exam
                </button>
              </div>
            </div>
          </div>
        )}

        {/* VIEW: CLASSES */}
        {view === "classes" && (
          <div className="space-y-12 animate-in fade-in duration-500">
            {/* Page Header */}
            <div className="text-center max-w-3xl mx-auto space-y-4">
              <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-black text-amber-700 bg-amber-50 border border-amber-100 uppercase tracking-widest">
                शैक्षणिक पाठ्यक्रम (Curriculum)
              </span>
              <h1 className="text-4xl md:text-5xl font-extrabold text-stone-900 tracking-tight">
                कक्षाएं <span className="bg-clip-text text-transparent bg-gradient-to-r from-amber-600 to-amber-800">1 से 12</span>
              </h1>
              <p className="text-stone-500 font-medium text-base md:text-lg">
                प्राथमिक, माध्यमिक और उच्च माध्यमिक स्तर के लिए जैन संस्कारों और सिद्धांतों का सुनियोजित पाठ्यक्रम।
              </p>
            </div>

            {/* Class Categories */}
            {(() => {
              // Group classes into Primary, Middle, and Senior
              const primaryClasses = classesList.filter((cls) => {
                const num = parseInt(cls.grade);
                return num >= 1 && num <= 5;
              }).sort((a, b) => parseInt(a.grade) - parseInt(b.grade));

              const middleClasses = classesList.filter((cls) => {
                const num = parseInt(cls.grade);
                return num >= 6 && num <= 8;
              }).sort((a, b) => parseInt(a.grade) - parseInt(b.grade));

              const seniorClasses = classesList.filter((cls) => {
                const num = parseInt(cls.grade);
                return num >= 9 && num <= 12;
              }).sort((a, b) => parseInt(a.grade) - parseInt(b.grade));

              const sections = [
                {
                  title: "प्राथमिक स्तर (Primary Stage)",
                  subtitle: "कक्षा 1 से 5 (Classes 1 to 5)",
                  description: "बुनियादी जैन संस्कार, नीति कथाएं और नैतिक मूल्य।",
                  topics: "Basic Jain Sanskar, Navkar Mantra, Moral Values, Stories",
                  classes: primaryClasses,
                  bgGrad: "from-amber-50 to-orange-50/30",
                  borderCol: "border-amber-100",
                  badgeCol: "bg-amber-100 text-amber-800",
                },
                {
                  title: "माध्यमिक स्तर (Middle Stage)",
                  subtitle: "कक्षा 6 से 8 (Classes 6 to 8)",
                  description: "जैन भूगोल, तत्वज्ञान की शुरुआत और महान आत्माओं की जीवनियां।",
                  topics: "Jain Geography, Intro to Tatva Gyan, Biographies of Great Souls",
                  classes: middleClasses,
                  bgGrad: "from-rose-50 to-orange-50/20",
                  borderCol: "border-rose-100",
                  badgeCol: "bg-rose-100 text-rose-850",
                },
                {
                  title: "उच्चतर स्तर (Senior Stage)",
                  subtitle: "कक्षा 9 से 12 (Classes 9 to 12)",
                  description: "छह द्रव्य, सात तत्व, कर्म सिद्धांत और गहन जैन दर्शन।",
                  topics: "Six Dravya, Seven Tatva, Karma Theory, Deep Philosophy",
                  classes: seniorClasses,
                  bgGrad: "from-purple-50 to-indigo-50/20",
                  borderCol: "border-purple-100",
                  badgeCol: "bg-purple-100 text-purple-800",
                },
              ];

              return (
                <div className="space-y-16">
                  {sections.map((sec) => (
                    <div key={sec.title} className="space-y-6">
                      {/* Section Header Card */}
                      <div className={`p-8 md:p-10 rounded-[2rem] bg-gradient-to-br ${sec.bgGrad} border ${sec.borderCol} space-y-4`}>
                        <div className="flex flex-wrap items-center justify-between gap-4">
                          <div>
                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${sec.badgeCol}`}>
                              {sec.subtitle}
                            </span>
                            <h2 className="text-2xl md:text-3xl font-black text-stone-900 mt-3">
                              {sec.title}
                            </h2>
                          </div>
                        </div>
                        <p className="text-stone-600 text-sm md:text-base font-semibold leading-relaxed">
                          {sec.description}
                        </p>
                        <div className="pt-4 border-t border-stone-200/50 flex flex-wrap gap-2 items-center">
                          <span className="text-[10px] font-black text-stone-400 uppercase tracking-widest">
                            Key Curriculum Topics:
                          </span>
                          <span className="text-stone-700 text-xs font-bold bg-white/80 px-3 py-1 rounded-lg border border-stone-100">
                            {sec.topics}
                          </span>
                        </div>
                      </div>

                      {/* Classes Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {sec.classes.length === 0 ? (
                          <div className="col-span-full text-center py-8 text-stone-400 text-sm font-semibold italic bg-stone-50 rounded-2xl border border-dashed">
                            No classes config found in the database.
                          </div>
                        ) : (
                          sec.classes.map((cls) => {
                            const hasSyllabus = (cls.syllabi && cls.syllabi.length > 0) || cls.syllabus;
                            return (
                              <div
                                key={cls.grade}
                                className="bg-white p-6 rounded-[2rem] border border-stone-150 hover:border-amber-500/50 hover:shadow-xl transition-all duration-300 flex flex-col justify-between space-y-6 group"
                              >
                                <div className="space-y-4">
                                  <div className="flex justify-between items-center">
                                    <h3 className="text-lg font-black text-stone-850 group-hover:text-amber-700 transition-colors">
                                      {cls.grade}
                                    </h3>
                                    <span className={`text-[10px] font-black px-2 py-0.5 rounded-md ${
                                      cls.status === "Active" ? "bg-green-50 text-green-700 border border-green-100" : "bg-stone-50 text-stone-500 border"
                                    }`}>
                                      {cls.status}
                                    </span>
                                  </div>

                                  {/* Subjects List */}
                                  <div className="space-y-2">
                                    <span className="text-[9px] font-bold text-stone-400 uppercase tracking-wider block">
                                      Subjects / Topics
                                    </span>
                                    {cls.subjects && cls.subjects.length > 0 ? (
                                      <div className="flex flex-wrap gap-1.5">
                                        {cls.subjects.map((sub: string) => (
                                          <span key={sub} className="text-[11px] font-medium text-stone-600 bg-stone-50 px-2 py-1 rounded-md">
                                            {sub}
                                          </span>
                                        ))}
                                      </div>
                                    ) : (
                                      <p className="text-xs text-stone-400 italic">No custom subjects configured.</p>
                                    )}
                                  </div>

                                  {/* Exam Info */}
                                  <div className="bg-stone-50/50 p-4 rounded-xl border border-stone-100 space-y-2 text-xs">
                                    <div className="flex justify-between">
                                      <span className="text-stone-400 font-bold uppercase text-[9px] tracking-wider">Exam Date</span>
                                      <span className="text-stone-750 font-semibold">{cls.examDate !== "TBA" ? cls.examDate : "TBA"}</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="text-stone-400 font-bold uppercase text-[9px] tracking-wider">Center</span>
                                      <span className="text-stone-750 font-semibold truncate max-w-[150px]">{cls.examVenue || "TBA"}</span>
                                    </div>
                                  </div>
                                </div>

                                <button
                                  onClick={() => downloadSyllabus(cls)}
                                  className={`w-full py-3.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${
                                    hasSyllabus
                                      ? "bg-amber-600 hover:bg-amber-700 text-white shadow-md shadow-amber-200/50 hover:shadow-lg active:scale-[0.98]"
                                      : "bg-stone-100 hover:bg-stone-150 text-stone-400 cursor-not-allowed"
                                  }`}
                                >
                                  <Download size={14} />
                                  {hasSyllabus ? "Download Syllabus (PDF)" : "Syllabus Unavailable"}
                                </button>
                              </div>
                            );
                          })
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              );
            })()}
          </div>
        )}
      </main>

      {/* --- SUBADMIN REGISTRATION MODAL --- */}
      {isSubadminModalOpen && (
        <div className="fixed inset-0 bg-stone-900/60 backdrop-blur-md flex items-center justify-center z-[110] p-4 animate-in fade-in duration-300">
          <div className="bg-white rounded-[3rem] p-10 max-w-md w-full shadow-2xl border border-stone-100 transform animate-in zoom-in-95 duration-300">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-3xl font-black text-stone-900 uppercase tracking-tighter">
                  Register <span className="text-rose-600">Subadmin</span>
                </h2>
                <p className="text-stone-400 text-[10px] font-bold uppercase tracking-widest mt-1">
                  Assign temple management access
                </p>
              </div>
              <button
                onClick={() => setIsSubadminModalOpen(false)}
                className="text-stone-400 hover:text-stone-600 p-2 hover:bg-stone-50 rounded-full transition-colors"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubadminRegister} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-stone-400 uppercase tracking-widest ml-2">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Rahul Jain"
                  className="w-full p-4 bg-stone-50 border border-stone-100 rounded-2xl focus:ring-2 focus:ring-rose-500 outline-none transition font-semibold"
                  value={subadminData.name}
                  onChange={(e) =>
                    setSubadminData({
                      ...subadminData,
                      name: e.target.value,
                    })
                  }
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-stone-400 uppercase tracking-widest ml-2">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  placeholder="rahul@example.com"
                  className="w-full p-4 bg-stone-50 border border-stone-100 rounded-2xl focus:ring-2 focus:ring-rose-500 outline-none transition font-semibold"
                  value={subadminData.email}
                  onChange={(e) =>
                    setSubadminData({
                      ...subadminData,
                      email: e.target.value,
                    })
                  }
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-stone-400 uppercase tracking-widest ml-2">
                  Login Password
                </label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  className="w-full p-4 bg-stone-50 border border-stone-100 rounded-2xl focus:ring-2 focus:ring-rose-500 outline-none transition font-semibold"
                  value={subadminData.password}
                  onChange={(e) =>
                    setSubadminData({
                      ...subadminData,
                      password: e.target.value,
                    })
                  }
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-stone-400 uppercase tracking-widest ml-2">
                  Assigned Temple Name
                </label>
                <div className="relative">
                  <select
                    required
                    className="w-full p-4 bg-stone-50 border border-stone-100 rounded-2xl focus:ring-2 focus:ring-rose-500 outline-none transition font-semibold appearance-none"
                    value={subadminData.templeName}
                    onChange={(e) =>
                      setSubadminData({
                        ...subadminData,
                        templeName: e.target.value,
                      })
                    }
                  >
                    <option value="">Select Temple</option>
                    {temples
                      .filter((t) => t.status === "verified")
                      .map((t) => (
                        <option key={t._id || t.id} value={t.name}>
                          {t.name}
                        </option>
                      ))}
                  </select>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-stone-400">
                    <ChevronRight className="rotate-90" size={16} />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={subadminLoading}
                className="w-full py-5 bg-rose-600 text-white font-bold rounded-2xl shadow-xl shadow-rose-100 hover:bg-rose-700 transition-all flex items-center justify-center gap-3 mt-4 disabled:bg-stone-300"
              >
                {subadminLoading ? (
                  <span className="flex items-center gap-2">Processing...</span>
                ) : (
                  "Complete Registration"
                )}
              </button>
            </form>
          </div>
        </div>
      )}

      <footer className="bg-stone-900 text-stone-400 py-16 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12 border-b border-stone-800 pb-12">
            <div className="col-span-1 md:col-span-2 space-y-6">
              <div className="flex items-center">
                <img
                  src="/assets/Jain_logo.svg"
                  alt="Logo"
                  className="w-10 h-10 object-contain mr-3 opacity-80"
                />
                <span className="text-2xl font-bold text-white tracking-tight">
                  Jain Pathshala
                </span>
              </div>
              <p className="text-stone-500 max-w-sm leading-relaxed">
                Dedicated to fostering unity within the Jain community by
                providing an authentic, verified digital infrastructure for our
                sacred temples worldwide.
              </p>
            </div>
            <div>
              <h4 className="text-white font-bold mb-6 uppercase text-xs tracking-[0.2em]">
                Platform
              </h4>
              <ul className="space-y-4 text-sm font-medium">
                <li>
                  <button
                    onClick={() => {
                      setView("home");
                      setSelectedTempleId(null);
                    }}
                    className="hover:text-amber-500 transition-colors"
                  >
                    Temple Directory
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setView("register")}
                    className="hover:text-amber-500 transition-colors"
                  >
                    Add Your Temple
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setView("admin")}
                    className="hover:text-amber-500 transition-colors"
                  >
                    Verification Dashboard
                  </button>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-bold mb-6 uppercase text-xs tracking-[0.2em]">
                Our Values
              </h4>
              <p className="text-sm italic leading-loose">
                "Parasparopagraho Jivanam" <br />— All life is bound together by
                mutual support and interdependence.
              </p>
            </div>
          </div>
          <div className="flex flex-col md:flex-row justify-between items-center text-[11px] font-bold uppercase tracking-widest text-stone-600">
            <p>&copy; 2026 Jain Mandir Connect Portal. All rights reserved.</p>
            <div className="flex gap-8 mt-6 md:mt-0">
              <a href="#" className="hover:text-white transition">
                Privacy Architecture
              </a>
              <a href="#" className="hover:text-white transition">
                Community Guidelines
              </a>
            </div>
          </div>
        </div>
      </footer>
      <StatusModal
        isOpen={modal.isOpen}
        status={modal.status}
        title={modal.title}
        message={modal.message}
        onClose={() => setModal((prev) => ({ ...prev, isOpen: false }))}
      />

      {/* --- EVENT IMAGE LIGHTBOX --- */}
      {selectedEventImage && (
        <div
          className="fixed inset-0 bg-stone-900/90 backdrop-blur-xl z-[200] flex items-center justify-center p-4 md:p-12 animate-in fade-in duration-300"
          onClick={() => setSelectedEventImage(null)}
        >
          <button
            className="absolute top-8 right-8 text-white/50 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-full"
            onClick={() => setSelectedEventImage(null)}
          >
            <X size={32} />
          </button>

          <div
            className="relative max-w-5xl w-full max-h-full flex items-center justify-center animate-in zoom-in-95 duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={selectedEventImage}
              className="max-w-full max-h-[85vh] object-contain rounded-3xl shadow-2xl border border-white/10"
              alt="Event Preview"
            />
          </div>
        </div>
      )}
    </div>
  );
}
