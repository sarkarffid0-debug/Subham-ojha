import React, { useState, useEffect } from "react";
import { 
  BookOpen, 
  Search, 
  Star, 
  Lock, 
  Settings, 
  Plus, 
  Trash, 
  Edit, 
  ExternalLink, 
  LogOut, 
  GraduationCap, 
  Check, 
  AlertCircle, 
  X, 
  Key,
  ChevronRight,
  Sparkles,
  Info
} from "lucide-react";

interface StudyLink {
  id: string;
  title: string;
  subject: string;
  url: string;
  description: string;
}

const SUBJECT_LIST = ["ENGLISH", "MATH", "HINDI", "ODIA", "HISTORY", "SCIENCE"];

const NexusLogo = ({ size = "md" }: { size?: "sm" | "md" | "lg" }) => {
  const isSm = size === "sm";
  const isLg = size === "lg";

  return (
    <div className={`relative flex items-center justify-center bg-black rounded-lg border border-cyan-500/25 select-none overflow-hidden ${
      isSm ? "h-10 px-3" : isLg ? "h-24 px-8 max-w-sm mx-auto shadow-[0_0_25px_rgba(34,211,238,0.25)]" : "h-14 px-5 shadow-[0_0_15px_rgba(34,211,238,0.15)]"
    }`}>
      {/* Background glow lines */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-cyan-950/40 via-transparent to-transparent pointer-events-none"></div>

      {/* Outer wrapper to handle scaling and layout */}
      <div className="relative flex items-center justify-center">
        
        {/* Left 'E' Outline */}
        <span 
          className={`font-extrabold select-none shrink-0 transition-all duration-300 ${
            isSm ? "text-2xl" : isLg ? "text-5xl" : "text-3xl"
          }`}
          style={{ 
            fontFamily: "Impact, 'Arial Black', sans-serif",
            color: "transparent",
            WebkitTextStroke: isSm ? "1.5px #14b8a6" : isLg ? "2.5px #22d3ee" : "2px #22d3ee",
            textShadow: isSm 
              ? "0 0 8px rgba(34,211,238,0.5)" 
              : "0 0 15px rgba(34,211,238,0.8), 0 0 5px rgba(34,211,238,0.4)",
            transform: "scaleY(1.05)"
          }}
        >
          E
        </span>

        {/* Center 'NEXUS' - Brush font */}
        <span 
          className={`font-brush font-normal text-white uppercase shrink-0 transition-all duration-300 relative z-10 ${
            isSm ? "text-base mx-1.5" : isLg ? "text-4xl mx-3" : "text-2xl mx-2"
          }`}
          style={{ 
            textShadow: "0 0 10px rgba(255,255,255,0.9), 0 0 2px rgba(0,0,0,1)",
            letterSpacing: isSm ? "0.05em" : "0.08em",
            transform: "skewX(-8deg)"
          }}
        >
          NEXUS
        </span>

        {/* Right 'E' Outline */}
        <span 
          className={`font-extrabold select-none shrink-0 transition-all duration-300 ${
            isSm ? "text-2xl" : isLg ? "text-5xl" : "text-3xl"
          }`}
          style={{ 
            fontFamily: "Impact, 'Arial Black', sans-serif",
            color: "transparent",
            WebkitTextStroke: isSm ? "1.5px #14b8a6" : isLg ? "2.5px #22d3ee" : "2px #22d3ee",
            textShadow: isSm 
              ? "0 0 8px rgba(34,211,238,0.5)" 
              : "0 0 15px rgba(34,211,238,0.8), 0 0 5px rgba(34,211,238,0.4)",
            transform: "scaleY(1.05)"
          }}
        >
          E
        </span>

      </div>
    </div>
  );
};

export default function App() {
  // Core states
  const [links, setLinks] = useState<StudyLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Navigation & Filter states
  const [selectedSubject, setSelectedSubject] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [favorites, setFavorites] = useState<string[]>([]);
  
  // Admin access states
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [adminPassword, setAdminPassword] = useState("");
  const [loginPasswordInput, setLoginPasswordInput] = useState("");
  const [loginError, setLoginError] = useState<string | null>(null);
  const [adminStatusMsg, setAdminStatusMsg] = useState<{ text: string; isError: boolean } | null>(null);
  
  // Admin form states (Add/Edit)
  const [formId, setFormId] = useState<string | null>(null); // Null for Create, ID for Edit
  const [formTitle, setFormTitle] = useState("");
  const [formSubject, setFormSubject] = useState("ENGLISH");
  const [formUrl, setFormUrl] = useState("");
  const [formDescription, setFormDescription] = useState("");
  
  // Admin settings states
  const [newPasswordInput, setNewPasswordInput] = useState("");

  // Fetch all links
  const fetchLinks = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch("/api/links");
      if (!res.ok) throw new Error("Failed to fetch study notes.");
      const data = await res.json();
      setLinks(data);
    } catch (err: any) {
      console.error(err);
      setError("Unable to connect to the study notes server. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // On mount: Fetch links and restore favorites/admin token
  useEffect(() => {
    fetchLinks();
    
    // Load favorites
    const savedFavs = localStorage.getItem("study_favs");
    if (savedFavs) {
      try {
        setFavorites(JSON.parse(savedFavs));
      } catch (e) {
        setFavorites([]);
      }
    }

    // Load admin token
    const savedToken = sessionStorage.getItem("admin_token");
    if (savedToken) {
      setAdminPassword(savedToken);
      setIsAdminLoggedIn(true);
    }
  }, []);

  // Update favorites local storage when changed
  const toggleFavorite = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    let updated: string[];
    if (favorites.includes(id)) {
      updated = favorites.filter(favId => favId !== id);
    } else {
      updated = [...favorites, id];
    }
    setFavorites(updated);
    localStorage.setItem("study_favs", JSON.stringify(updated));
  };

  // Admin login submission
  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: loginPasswordInput })
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Login failed");
      }
      
      // Store token
      setAdminPassword(loginPasswordInput);
      setIsAdminLoggedIn(true);
      sessionStorage.setItem("admin_token", loginPasswordInput);
      setLoginPasswordInput("");
    } catch (err: any) {
      setLoginError(err.message || "Invalid password.");
    }
  };

  // Admin logout
  const handleAdminLogout = () => {
    setIsAdminLoggedIn(false);
    setAdminPassword("");
    sessionStorage.removeItem("admin_token");
    setAdminStatusMsg({ text: "Logged out successfully", isError: false });
    resetForm();
  };

  // Admin Change Password
  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdminStatusMsg(null);
    if (!newPasswordInput.trim()) {
      setAdminStatusMsg({ text: "Password cannot be empty", isError: true });
      return;
    }
    try {
      const res = await fetch("/api/admin/change-password", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": adminPassword
        },
        body: JSON.stringify({ newPassword: newPasswordInput })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update password");
      
      // Update our token with new password
      setAdminPassword(newPasswordInput);
      sessionStorage.setItem("admin_token", newPasswordInput);
      setNewPasswordInput("");
      setAdminStatusMsg({ text: "Admin password successfully changed!", isError: false });
    } catch (err: any) {
      setAdminStatusMsg({ text: err.message || "Password change failed.", isError: true });
    }
  };

  // Handle Add or Edit Link submission
  const handleSaveLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdminStatusMsg(null);
    if (!formTitle.trim() || !formUrl.trim()) {
      setAdminStatusMsg({ text: "Title and URL are required", isError: true });
      return;
    }

    const payload = {
      title: formTitle,
      subject: formSubject,
      url: formUrl,
      description: formDescription
    };

    try {
      let res;
      if (formId) {
        // Edit existing
        res = await fetch(`/api/links/${formId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            "Authorization": adminPassword
          },
          body: JSON.stringify(payload)
        });
      } else {
        // Create new
        res = await fetch("/api/links", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": adminPassword
          },
          body: JSON.stringify(payload)
        });
      }

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Save failed");

      setAdminStatusMsg({ 
        text: formId ? "Note link successfully updated!" : "New study note link added!", 
        isError: false 
      });
      
      // Refresh database
      fetchLinks();
      resetForm();
    } catch (err: any) {
      setAdminStatusMsg({ text: err.message || "Action failed", isError: true });
    }
  };

  // Delete Link
  const handleDeleteLink = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this study note link?")) return;
    setAdminStatusMsg(null);
    try {
      const res = await fetch(`/api/links/${id}`, {
        method: "DELETE",
        headers: { "Authorization": adminPassword }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Delete failed");

      setAdminStatusMsg({ text: "Note link deleted successfully.", isError: false });
      fetchLinks();
      if (formId === id) resetForm();
    } catch (err: any) {
      setAdminStatusMsg({ text: err.message || "Failed to delete link.", isError: true });
    }
  };

  // Populate form for editing
  const startEdit = (link: StudyLink) => {
    setFormId(link.id);
    setFormTitle(link.title);
    setFormSubject(link.subject);
    setFormUrl(link.url);
    setFormDescription(link.description);
    setAdminStatusMsg({ text: `Editing: "${link.title}"`, isError: false });
  };

  const resetForm = () => {
    setFormId(null);
    setFormTitle("");
    setFormUrl("");
    setFormDescription("");
  };

  // Filter and Search logic
  const filteredLinks = links.filter((link) => {
    // Subject filter
    if (selectedSubject === "FAVORITES") {
      if (!favorites.includes(link.id)) return false;
    } else if (selectedSubject !== "ALL") {
      if (link.subject.toUpperCase() !== selectedSubject.toUpperCase()) return false;
    }

    // Search query filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      const matchTitle = link.title.toLowerCase().includes(query);
      const matchDesc = link.description.toLowerCase().includes(query);
      const matchSubj = link.subject.toLowerCase().includes(query);
      return matchTitle || matchDesc || matchSubj;
    }

    return true;
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#050C1C] via-[#091530] to-[#040812] text-slate-100 flex flex-col font-sans selection:bg-amber-500/30 selection:text-amber-200">
      
      {/* LUXURIOUS NAVBAR */}
      <header className="border-b border-amber-500/10 bg-[#061026]/90 backdrop-blur-md sticky top-0 z-40 transition-all shadow-[0_4px_30px_rgba(0,0,0,0.5)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          
          {/* Logo with Luxurious Crest Aesthetic */}
          <div className="flex items-center space-x-3.5">
            <NexusLogo size="sm" />
            <div>
              <h1 className="text-xl sm:text-2xl font-serif font-bold tracking-wider bg-gradient-to-r from-amber-200 via-amber-400 to-yellow-500 bg-clip-text text-transparent">
                LEARNEXUS
              </h1>
              <p className="text-[9px] sm:text-[10px] font-mono tracking-widest text-amber-500/80 uppercase">
                Premium Academic Library
              </p>
            </div>
          </div>

          {/* Nav Actions */}
          <div className="flex items-center space-x-3">
            {/* UTC Live Indicator */}
            <div className="hidden md:flex items-center space-x-2 px-3 h-9 bg-amber-500/5 rounded-full border border-amber-500/10 text-[11px] font-mono text-amber-400/80">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>SECURED HUB</span>
            </div>

            {/* Admin Console Trigger */}
            <button
              id="admin-console-btn"
              onClick={() => setIsAdminOpen(true)}
              className="flex items-center space-x-2 px-4 h-10 rounded-lg border border-amber-500/20 bg-gradient-to-r from-amber-500/10 to-transparent text-amber-400 text-sm font-medium hover:border-amber-400 hover:text-amber-300 hover:shadow-[0_0_15px_rgba(245,158,11,0.15)] transition duration-300 cursor-pointer"
            >
              <Lock className="w-4 h-4 text-amber-500" />
              <span>Admin Portal</span>
            </button>
          </div>
        </div>
      </header>

      {/* CORE HERO ACCENT */}
      <section className="relative overflow-hidden py-12 border-b border-amber-500/5 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#10224d] via-transparent to-transparent">
        <div className="max-w-4xl mx-auto text-center px-4 space-y-6">
          <div className="inline-flex items-center space-x-2 px-3 py-1 bg-amber-500/10 rounded-full border border-amber-500/20 text-xs font-medium text-amber-300">
            <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
            <span>EXCLUSIVELY CURATED ACADEMIC PORTAL</span>
          </div>

          {/* LARGE LOGO SHOWCASE REPLICATING THE PROVIDED IMAGE */}
          <div className="py-2">
            <NexusLogo size="lg" />
          </div>

          <h2 className="text-3xl sm:text-5xl font-serif font-bold tracking-tight text-white">
            Unlock Very Important Study Material
          </h2>
          <p className="text-sm sm:text-base text-slate-300 max-w-2xl mx-auto leading-relaxed font-sans font-light">
            Welcome to your luxurious study archive. Browse subject materials, filter by favorites, and search across chapters instantly. Tap any file to open the designated document tab securely.
          </p>
        </div>
      </section>

      {/* MAIN CONTAINER */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-grow w-full">
        
        {/* UPPER CONTROLS: SEARCH & FAVORITES COMBINED */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 mb-8">
          
          {/* SEARCH BAR (Bento Span 8) */}
          <div className="lg:col-span-8 relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-amber-500/60" />
            </div>
            <input
              id="search-input"
              type="text"
              placeholder="Search by chapter, concept, keywords, or subject..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-10 py-3.5 rounded-xl border border-amber-500/10 bg-[#081229]/80 focus:border-amber-400 focus:ring-1 focus:ring-amber-400/50 outline-none placeholder-slate-500 text-slate-200 text-sm font-sans transition-all shadow-[inset_0_2px_4px_rgba(0,0,0,0.6)]"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery("")}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-amber-400"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* QUICK FAVORITES TAB TOGGLE (Bento Span 4) */}
          <div className="lg:col-span-4 flex">
            <button
              id="favorites-toggle-btn"
              onClick={() => setSelectedSubject(selectedSubject === "FAVORITES" ? "ALL" : "FAVORITES")}
              className={`w-full py-3.5 px-4 rounded-xl border flex items-center justify-center space-x-2.5 font-medium transition duration-300 ${
                selectedSubject === "FAVORITES" 
                  ? "bg-gradient-to-r from-amber-600 to-yellow-500 border-amber-300 text-slate-950 shadow-[0_0_15px_rgba(245,158,11,0.25)]" 
                  : "bg-[#081229]/60 border-amber-500/15 text-amber-400 hover:bg-amber-500/5 hover:border-amber-500/40"
              }`}
            >
              <Star className={`w-4 h-4 ${selectedSubject === "FAVORITES" ? "fill-slate-950 text-slate-950" : "fill-transparent"}`} />
              <span>Favorites Shelf</span>
              <span className={`px-2 py-0.5 rounded-full text-xs ${
                selectedSubject === "FAVORITES" ? "bg-slate-950/20 text-slate-950 font-bold" : "bg-amber-500/10 text-amber-400"
              }`}>
                {favorites.length}
              </span>
            </button>
          </div>

        </div>

        {/* INFO UNDER FAVORITES/SEARCH ROW */}
        <div className="text-right -mt-6 mb-6 px-1">
          <p className="text-[10px] font-mono text-amber-500/60 tracking-wider">
            MADE BY NEXUS ( SUBHAM ) • FOLLOW <a href="https://instagram.com/ee_nexus_007" target="_blank" rel="noopener noreferrer" className="hover:text-amber-400 underline transition">@ee_nexus_007</a>
          </p>
        </div>

        {/* 6 CLICKABLE SUBJECT BUTTONS (Gold Tablets) */}
        <div className="mb-10">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-mono tracking-widest text-amber-500 uppercase font-bold">
              Subject Categories
            </h3>
            {selectedSubject !== "ALL" && (
              <button 
                onClick={() => setSelectedSubject("ALL")}
                className="text-xs text-amber-400/80 hover:text-amber-300 underline font-medium"
              >
                Reset Filter
              </button>
            )}
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {SUBJECT_LIST.map((subj) => {
              const count = links.filter(l => l.subject === subj).length;
              const isActive = selectedSubject === subj;
              return (
                <button
                  key={subj}
                  id={`subject-btn-${subj.toLowerCase()}`}
                  onClick={() => setSelectedSubject(subj)}
                  className={`relative overflow-hidden group py-4 px-3 rounded-xl border transition-all duration-300 cursor-pointer ${
                    isActive
                      ? "bg-gradient-to-b from-[#1c326d] to-[#0e1d44] border-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.2)] scale-102"
                      : "bg-[#09132d]/90 border-amber-500/10 hover:border-amber-500/40 hover:bg-[#0c1d45]"
                  }`}
                >
                  {/* Subtle active state gold dot accent */}
                  {isActive && (
                    <div className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-amber-400"></div>
                  )}

                  <span className="block text-xs font-mono tracking-widest text-amber-500/60 font-bold group-hover:text-amber-400/80 transition duration-300">
                    SUBJECT
                  </span>
                  <span className={`block font-serif text-lg font-bold tracking-wider mt-1 ${
                    isActive ? "text-amber-300" : "text-white group-hover:text-amber-300 transition"
                  }`}>
                    {subj}
                  </span>
                  
                  <span className="block mt-2.5 text-[10px] font-mono text-slate-400 bg-black/25 rounded-md px-1.5 py-0.5 inline-block">
                    {count} {count === 1 ? "document" : "documents"}
                  </span>
                </button>
              );
            })}
          </div>

          {/* INFO UNDER SUBJECT CATEGORIES TABS */}
          <div className="mt-3 text-center md:text-right">
            <p className="text-[11px] font-mono text-amber-500/70 tracking-widest uppercase">
              MADE BY NEXUS ( SUBHAM ) • FOLLOW <a href="https://instagram.com/ee_nexus_007" target="_blank" rel="noopener noreferrer" className="hover:text-amber-400 underline transition">@ee_nexus_007</a>
            </p>
          </div>
        </div>

        {/* ACTIVE FILTER HEADER */}
        <div className="flex items-center space-x-2 border-b border-amber-500/10 pb-3 mb-6">
          <BookOpen className="w-4 h-4 text-amber-500" />
          <h3 className="font-serif text-xl font-bold tracking-wide">
            {selectedSubject === "ALL" ? "All Class Modules" : selectedSubject === "FAVORITES" ? "Starred Academic Materials" : `${selectedSubject} Notes & Links`}
          </h3>
          <span className="text-xs font-mono bg-amber-500/10 text-amber-400 px-2.5 py-0.5 rounded-full font-bold">
            {filteredLinks.length} results
          </span>
        </div>

        {/* NEXUS SPECIAL CREDIT BANNER FOR ACTIVE TAB */}
        <div className="mb-6 p-4 rounded-xl border border-amber-500/10 bg-gradient-to-r from-[#0a183d] via-[#06122d] to-transparent flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 shadow-[0_4px_20px_rgba(0,0,0,0.3)]">
          <div className="flex items-center space-x-2.5">
            <Sparkles className="w-4 h-4 text-amber-400 animate-pulse shrink-0" />
            <div className="text-xs">
              <span className="font-serif font-bold tracking-wider text-amber-200 block sm:inline">
                MADE BY NEXUS ( SUBHAM )
              </span>
              <span className="text-[10px] font-mono text-slate-400 sm:ml-2">
                Premium Academic Architecture
              </span>
            </div>
          </div>
          <a 
            href="https://instagram.com/ee_nexus_007" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-xs font-mono text-amber-400 hover:text-amber-300 transition flex items-center space-x-1.5 underline decoration-amber-500/20 hover:decoration-amber-400"
          >
            <span>FOLLOW @ee_nexus_007</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>

        {/* LOADING STATE */}
        {loading && (
          <div className="py-20 text-center">
            <div className="inline-block w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-4 font-mono text-xs text-amber-500/80 tracking-widest">LOADING STUDY VAULT...</p>
          </div>
        )}

        {/* ERROR STATE */}
        {error && (
          <div className="p-6 bg-red-950/20 border border-red-500/30 rounded-2xl max-w-2xl mx-auto text-center my-10">
            <AlertCircle className="w-10 h-10 text-red-500 mx-auto mb-3" />
            <p className="text-sm font-semibold text-slate-100">{error}</p>
            <button 
              onClick={fetchLinks} 
              className="mt-4 px-4 py-2 bg-red-950/40 border border-red-500/40 rounded-lg text-xs hover:bg-red-950/80 transition"
            >
              Retry Connection
            </button>
          </div>
        )}

        {/* EMPTY ARCHIVE STATE */}
        {!loading && !error && filteredLinks.length === 0 && (
          <div className="py-16 text-center border border-dashed border-amber-500/10 rounded-2xl bg-[#091126]/30">
            <Info className="w-10 h-10 text-amber-500/40 mx-auto mb-3" />
            <p className="font-serif text-lg text-slate-300">No study notes found matching your selection.</p>
            <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
              {selectedSubject === "FAVORITES" 
                ? "You haven't bookmarked any notes yet. Tap the star icon on any card to add it here!"
                : "Try resetting your filters or adjusting your search query to look for key terms."}
            </p>
            {selectedSubject !== "ALL" && (
              <button
                onClick={() => { setSelectedSubject("ALL"); setSearchQuery(""); }}
                className="mt-5 px-4 py-2 border border-amber-500/20 bg-amber-500/5 text-amber-400 rounded-lg text-xs hover:bg-amber-500/10 hover:border-amber-400 transition"
              >
                View All Materials
              </button>
            )}
          </div>
        )}

        {/* GRID OF LUXURIOUS STUDY CARD OBJECTS */}
        {!loading && !error && filteredLinks.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredLinks.map((link) => {
              const isFav = favorites.includes(link.id);
              const isScienceOdia = link.id === "science-metals" || link.title.includes("ଧାତୁ");
              return (
                <div
                  key={link.id}
                  id={`note-card-${link.id}`}
                  className="group relative rounded-2xl border border-amber-500/10 bg-[#091229]/95 p-6 flex flex-col justify-between transition-all duration-300 hover:border-amber-500/40 hover:shadow-[0_4px_25px_rgba(245,158,11,0.08)] hover:-translate-y-1"
                >
                  
                  {/* Subject and Star Header */}
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <span className="px-2.5 py-1 text-[10px] font-mono tracking-wider font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-md uppercase">
                        {link.subject}
                      </span>
                      <button
                        id={`fav-btn-${link.id}`}
                        onClick={(e) => toggleFavorite(link.id, e)}
                        className="p-1.5 rounded-lg border border-amber-500/10 bg-amber-500/5 text-slate-400 hover:text-amber-400 hover:border-amber-500/30 transition cursor-pointer"
                        title={isFav ? "Remove from Favorites" : "Add to Favorites"}
                      >
                        <Star className={`w-4 h-4 ${isFav ? "fill-amber-400 text-amber-400" : "fill-transparent"}`} />
                      </button>
                    </div>

                    {/* Luxurious Title */}
                    <h4 className="font-serif text-xl font-bold text-white tracking-wide group-hover:text-amber-300 transition-colors duration-300 mb-2">
                      {link.title}
                    </h4>

                    {/* Description */}
                    <p className="text-slate-400 text-xs leading-relaxed font-sans font-light mb-6 line-clamp-3">
                      {link.description || "No description provided. Click below to explore this high-priority study resource."}
                    </p>
                  </div>

                  {/* Actions (Open Link) */}
                  <div className="mt-auto pt-4 border-t border-amber-500/5 flex items-center justify-between">
                    
                    {/* Special design cue for the main Odia Science document requested */}
                    {isScienceOdia ? (
                      <span className="flex items-center space-x-1 text-[10px] font-mono text-emerald-400">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                        <span>OFFICIAL ODIA NOTES</span>
                      </span>
                    ) : (
                      <span className="text-[10px] font-mono text-slate-500">
                        STUDY VAULT FILE
                      </span>
                    )}

                    <a
                      id={`open-link-${link.id}`}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg border border-amber-500/30 bg-gradient-to-r from-amber-500/10 to-transparent text-amber-400 text-xs font-semibold hover:from-amber-500 hover:to-amber-400 hover:text-slate-950 hover:border-amber-400 transition-all duration-300 shadow-[0_2px_10px_rgba(0,0,0,0.3)]"
                    >
                      <span>Open Note</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>

                </div>
              );
            })}
          </div>
        )}

      </main>

      {/* FOOTER */}
      <footer className="mt-auto border-t border-amber-500/10 bg-[#030917] py-6 text-center text-xs text-slate-500 font-mono tracking-widest uppercase">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between space-y-3 sm:space-y-0">
          <p>© 2026 Study Notes Hub • All Rights Reserved</p>
          <p className="text-[10px] text-amber-500/50">SECURE DISPATCH • DEVELOPED UNDER EXPLICIT USER MANDATES</p>
        </div>
      </footer>

      {/* --- SECURE ADMIN PORTAL MODAL DIALOG --- */}
      {isAdminOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#071024] border border-amber-500/20 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-[0_10px_50px_rgba(0,0,0,0.8)] relative flex flex-col">
            
            {/* Modal Header */}
            <div className="p-5 border-b border-amber-500/10 flex items-center justify-between sticky top-0 bg-[#071024] z-10">
              <div className="flex items-center space-x-2">
                <Lock className="w-5 h-5 text-amber-500" />
                <span className="font-serif text-lg font-bold text-white tracking-wider">
                  Secure Administrative Control
                </span>
              </div>
              <button
                id="close-admin-modal-btn"
                onClick={() => { setIsAdminOpen(false); setAdminStatusMsg(null); }}
                className="p-1.5 rounded-lg hover:bg-amber-500/10 text-slate-400 hover:text-amber-400 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 flex-grow">
              
              {/* IF NOT LOGGED IN - LOGIN SCREEN */}
              {!isAdminLoggedIn ? (
                <div className="max-w-md mx-auto py-10 text-center">
                  <div className="w-14 h-14 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mx-auto mb-4 shadow-[0_0_15px_rgba(245,158,11,0.1)]">
                    <Key className="w-6 h-6 text-amber-400" />
                  </div>
                  <h4 className="font-serif text-2xl font-semibold text-white mb-2">
                    Enter Portal Password
                  </h4>
                  <p className="text-xs text-slate-400 mb-6 font-sans">
                    Modifying study links requires cryptographic confirmation. Please input the authorized admin key. (Default is <code className="text-amber-400 font-mono bg-amber-500/5 px-1 py-0.5 rounded border border-amber-500/10">admin</code>)
                  </p>
                  
                  <form onSubmit={handleAdminLogin} className="space-y-4">
                    <div>
                      <input
                        id="admin-password-input"
                        type="password"
                        placeholder="••••••••••••"
                        value={loginPasswordInput}
                        onChange={(e) => setLoginPasswordInput(e.target.value)}
                        className="w-full text-center px-4 py-3 rounded-lg border border-amber-500/15 bg-black/40 focus:border-amber-400 focus:ring-1 focus:ring-amber-400/50 outline-none text-white tracking-widest font-mono"
                        required
                        autoFocus
                      />
                    </div>
                    
                    {loginError && (
                      <div className="flex items-center justify-center space-x-1.5 p-2 bg-red-950/20 border border-red-500/30 rounded-lg text-xs text-red-400">
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        <span>{loginError}</span>
                      </div>
                    )}

                    <button
                      id="submit-admin-login-btn"
                      type="submit"
                      className="w-full py-3 bg-gradient-to-r from-amber-600 via-amber-500 to-yellow-600 hover:from-amber-500 hover:to-yellow-500 text-slate-950 font-bold text-sm rounded-lg shadow-lg hover:shadow-amber-500/10 transition cursor-pointer"
                    >
                      Authenticate Access
                    </button>
                  </form>
                </div>
              ) : (
                
                // IF LOGGED IN - ADMINISTRATIVE DASHBOARD
                <div className="space-y-8">
                  
                  {/* STATUS REPORT AREA */}
                  {adminStatusMsg && (
                    <div className={`p-4 rounded-xl border flex items-start space-x-3 text-xs ${
                      adminStatusMsg.isError 
                        ? "bg-red-950/25 border-red-500/30 text-red-400" 
                        : "bg-emerald-950/25 border-emerald-500/30 text-emerald-400"
                    }`}>
                      {adminStatusMsg.isError ? <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" /> : <Check className="w-4 h-4 shrink-0 mt-0.5" />}
                      <p className="font-semibold">{adminStatusMsg.text}</p>
                    </div>
                  )}

                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    
                    {/* LEFT PANEL: FORM TO CREATE / EDIT (Span 5) */}
                    <div className="lg:col-span-5 bg-black/25 border border-amber-500/10 p-5 rounded-2xl">
                      <div className="flex items-center justify-between mb-4 pb-2 border-b border-amber-500/5">
                        <h4 className="font-serif text-lg font-bold text-amber-400">
                          {formId ? "Modify Note Link" : "Publish Note Link"}
                        </h4>
                        {formId && (
                          <button
                            onClick={resetForm}
                            className="text-xs text-slate-400 hover:text-amber-400 underline"
                          >
                            Cancel Edit
                          </button>
                        )}
                      </div>

                      <form onSubmit={handleSaveLink} className="space-y-4">
                        
                        {/* Title Input */}
                        <div>
                          <label className="block text-[10px] font-mono tracking-wider text-amber-500/80 uppercase font-bold mb-1">
                            Document Title *
                          </label>
                          <input
                            id="form-title-input"
                            type="text"
                            placeholder="e.g. ଧାତୁ ଓ ଅଧାତୁ (Class 10)"
                            value={formTitle}
                            onChange={(e) => setFormTitle(e.target.value)}
                            className="w-full px-3 py-2 rounded border border-amber-500/15 bg-black/40 focus:border-amber-400 outline-none text-sm text-slate-100"
                            required
                          />
                        </div>

                        {/* Subject Select */}
                        <div>
                          <label className="block text-[10px] font-mono tracking-wider text-amber-500/80 uppercase font-bold mb-1">
                            Subject Category *
                          </label>
                          <select
                            id="form-subject-input"
                            value={formSubject}
                            onChange={(e) => setFormSubject(e.target.value)}
                            className="w-full px-3 py-2 rounded border border-amber-500/15 bg-black/40 focus:border-amber-400 outline-none text-sm text-slate-100"
                          >
                            {SUBJECT_LIST.map(s => (
                              <option key={s} value={s} className="bg-[#071024]">{s}</option>
                            ))}
                          </select>
                        </div>

                        {/* URL Input */}
                        <div>
                          <label className="block text-[10px] font-mono tracking-wider text-amber-500/80 uppercase font-bold mb-1">
                            File / Document URL *
                          </label>
                          <input
                            id="form-url-input"
                            type="url"
                            placeholder="https://docs.google.com/..."
                            value={formUrl}
                            onChange={(e) => setFormUrl(e.target.value)}
                            className="w-full px-3 py-2 rounded border border-amber-500/15 bg-black/40 focus:border-amber-400 outline-none text-sm text-slate-100 text-xs font-mono"
                            required
                          />
                        </div>

                        {/* Description Input */}
                        <div>
                          <label className="block text-[10px] font-mono tracking-wider text-amber-500/80 uppercase font-bold mb-1">
                            Description
                          </label>
                          <textarea
                            id="form-desc-input"
                            rows={3}
                            placeholder="A brief summary of what's inside..."
                            value={formDescription}
                            onChange={(e) => setFormDescription(e.target.value)}
                            className="w-full px-3 py-2 rounded border border-amber-500/15 bg-black/40 focus:border-amber-400 outline-none text-sm text-slate-100"
                          />
                        </div>

                        <button
                          id="submit-link-btn"
                          type="submit"
                          className="w-full py-2.5 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-slate-950 font-bold text-xs rounded uppercase tracking-wider transition cursor-pointer"
                        >
                          {formId ? "Update Document Link" : "Publish Document Link"}
                        </button>
                        
                      </form>
                    </div>

                    {/* RIGHT PANEL: LINK MANAGEMENT TABLE (Span 7) */}
                    <div className="lg:col-span-7 flex flex-col">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="font-serif text-lg font-bold text-white">
                          Current Directory ({links.length})
                        </h4>
                      </div>

                      {/* Notes List Container */}
                      <div className="border border-amber-500/10 rounded-xl bg-black/15 divide-y divide-amber-500/5 max-h-[350px] overflow-y-auto">
                        {links.length === 0 ? (
                          <div className="p-8 text-center text-xs text-slate-500 font-mono">
                            NO REGISTERED DOCUMENT LINKS
                          </div>
                        ) : (
                          links.map((item) => (
                            <div key={item.id} className="p-3.5 flex items-start justify-between space-x-3 hover:bg-[#0c1d45]/20 transition">
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center space-x-2">
                                  <span className="text-[9px] font-mono font-bold bg-amber-500/10 text-amber-400 border border-amber-500/10 px-1 rounded uppercase">
                                    {item.subject}
                                  </span>
                                  <span className="text-[10px] font-mono text-slate-500 truncate">
                                    ID: {item.id}
                                  </span>
                                </div>
                                <h5 className="font-sans text-sm font-semibold text-white truncate mt-1">
                                  {item.title}
                                </h5>
                                <p className="text-[11px] text-slate-400 truncate font-mono">
                                  {item.url}
                                </p>
                              </div>
                              
                              <div className="flex items-center space-x-1 shrink-0">
                                <button
                                  onClick={() => startEdit(item)}
                                  className="p-1.5 rounded hover:bg-amber-500/10 text-slate-300 hover:text-amber-400 transition"
                                  title="Edit link parameters"
                                >
                                  <Edit className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => handleDeleteLink(item.id)}
                                  className="p-1.5 rounded hover:bg-red-500/10 text-slate-300 hover:text-red-400 transition"
                                  title="Delete link"
                                >
                                  <Trash className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          ))
                        )}
                      </div>

                      {/* PASSWORD CONFIG SETTINGS */}
                      <div className="mt-6 p-4 border border-amber-500/10 bg-amber-500/5 rounded-xl">
                        <h4 className="font-serif text-sm font-bold text-amber-400 mb-2 flex items-center space-x-1.5">
                          <Settings className="w-4 h-4" />
                          <span>Change Access Key</span>
                        </h4>
                        
                        <form onSubmit={handlePasswordChange} className="flex space-x-2">
                          <input
                            id="change-password-input"
                            type="text"
                            placeholder="New Admin Password"
                            value={newPasswordInput}
                            onChange={(e) => setNewPasswordInput(e.target.value)}
                            className="flex-grow px-3 py-1.5 rounded border border-amber-500/15 bg-black/40 focus:border-amber-400 outline-none text-xs text-slate-100 font-mono"
                          />
                          <button
                            id="submit-password-change-btn"
                            type="submit"
                            className="px-4 bg-amber-500/15 border border-amber-500/30 hover:bg-amber-500 hover:text-slate-950 hover:border-amber-400 text-amber-400 text-xs font-bold rounded transition cursor-pointer"
                          >
                            Update Key
                          </button>
                        </form>
                      </div>

                    </div>

                  </div>

                  {/* BOTTOM ACTION: LOGOUT */}
                  <div className="pt-4 border-t border-amber-500/10 flex justify-between items-center text-xs">
                    <p className="text-slate-500 font-mono">
                      Connected session with authorized header checks
                    </p>
                    <button
                      id="admin-logout-btn"
                      onClick={handleAdminLogout}
                      className="flex items-center space-x-1 px-3 py-1.5 rounded bg-red-950/20 border border-red-500/30 text-red-400 hover:bg-red-950/60 transition cursor-pointer font-bold"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Lock & Log Out</span>
                    </button>
                  </div>

                </div>
              )}

            </div>

          </div>
        </div>
      )}

    </div>
  );
}
