"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import CssIcon, { CssIconName } from "@/components/ui/CssIcon";

interface NavItem {
  label: string;
  href: string;
  icon: CssIconName;
  roles: string[];
  badge?: number;
}

const NAV_GROUPS: { title: string; items: NavItem[] }[] = [
  {
    title: "Workspace",
    items: [
      { label: "Home", href: "/dashboard", icon: "dashboard", roles: ["OWNER"] },
      { label: "Store POS", href: "/shop", icon: "bag", roles: ["OWNER", "STAFF"] },
    ],
  },
  {
    title: "Sales & Pipeline",
    items: [
      { label: "Leads", href: "/leads", icon: "user", roles: ["OWNER", "STAFF"] },
      { label: "Deals Pipeline", href: "/pipeline", icon: "kanban", roles: ["OWNER", "STAFF"] },
      { label: "Follow-ups", href: "/followups", icon: "calendar", roles: ["OWNER", "STAFF"] },
    ],
  },
  {
    title: "Orders & Support",
    items: [
      { label: "Orders", href: "/orders", icon: "package", roles: ["OWNER", "STAFF"] },
      { label: "100-Night Returns", href: "/returns", icon: "refresh", roles: ["OWNER", "STAFF"] },
      { label: "Support Inbox", href: "/inbox", icon: "chat", roles: ["OWNER", "STAFF"] },
      { label: "AI Concierge", href: "/chatbot", icon: "bot", roles: ["OWNER", "STAFF"] },
    ],
  },
  {
    title: "Reports & Admin",
    items: [
      { label: "Revenue Analytics", href: "/analytics", icon: "chart", roles: ["OWNER"] },
      { label: "Lead Reports", href: "/lead-reports", icon: "trend", roles: ["OWNER"] },
      { label: "Team & Settings", href: "/settings", icon: "settings", roles: ["OWNER"] },
    ],
  },
];

function getInitials(name?: string | null): string {
  if (!name) return "U";
  const parts = name.trim().split(" ");
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

export default function Navbar() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const router = useRouter();
  const role = (session?.user as any)?.role || "STAFF";

  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [leadResults, setLeadResults] = useState<any[]>([]);
  const [custResults, setCustResults] = useState<any[]>([]);
  const [profileOpen, setProfileOpen] = useState(false);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setSearchOpen((prev) => !prev);
      }
      if (e.key === "Escape") {
        setSearchOpen(false);
        setMobileOpen(false);
        setProfileOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    if (!searchOpen || query.trim().length < 2) {
      setLeadResults([]);
      setCustResults([]);
      return;
    }
    const t = setTimeout(async () => {
      try {
        const [lRes, cRes] = await Promise.all([
          fetch(`/api/leads?search=${encodeURIComponent(query)}`),
          fetch(`/api/customers?search=${encodeURIComponent(query)}`),
        ]);
        if (lRes.ok) {
          const lData = await lRes.json();
          setLeadResults(Array.isArray(lData) ? lData.slice(0, 5) : []);
        }
        if (cRes.ok) {
          const cData = await cRes.json();
          setCustResults(Array.isArray(cData) ? cData.slice(0, 5) : []);
        }
      } catch {}
    }, 200);
    return () => clearTimeout(t);
  }, [query, searchOpen]);

  const SidebarContent = () => (
    <div className="flex flex-col h-full py-4 px-2 overflow-y-auto no-scrollbar">
      <div className="space-y-5 flex-1">
        {NAV_GROUPS.map((group) => {
          const visible = group.items.filter((item) => item.roles.includes(role));
          if (visible.length === 0) return null;
          return (
            <div key={group.title}>
              <p className="px-3 mb-2 text-[10px] font-body font-semibold uppercase tracking-widest text-text/35">
                {group.title}
              </p>
              <div className="space-y-0.5">
                {visible.map((item) => {
                  const isActive =
                    pathname === item.href ||
                    (item.href !== "/dashboard" && pathname.startsWith(item.href));
                  return (
                    <Link key={item.href} href={item.href}>
                      <div
                        className={cn(
                          "relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-body font-medium transition-all duration-200",
                          isActive
                            ? "bg-primary/10 text-primary"
                            : "text-text/65 hover:bg-softPink hover:text-primary"
                        )}
                      >
                        {/* Active left border indicator */}
                        {isActive && (
                          <span className="absolute left-0 top-1 bottom-1 w-[3px] rounded-r-full bg-primary" />
                        )}
                        <span className={cn("flex-shrink-0", isActive ? "text-primary" : "text-text/50")}>
                          <CssIcon name={item.icon} size={14} />
                        </span>
                        <span className="truncate flex-1">{item.label}</span>
                        {isActive && (
                          <span className="w-1.5 h-1.5 rounded-full bg-primary ml-auto flex-shrink-0" />
                        )}
                        {item.badge && item.badge > 0 && !isActive && (
                          <span className="ml-auto flex-shrink-0 min-w-[18px] h-[18px] rounded-full bg-danger text-white text-[10px] flex items-center justify-center px-1">
                            {item.badge}
                          </span>
                        )}
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Bottom Brand Pill */}
      <div className="mt-6 mx-1 p-3.5 rounded-2xl bg-gradient-to-br from-primary/8 to-primary/4 border border-primary/12">
        <div className="flex items-center gap-2 mb-1">
          <span className="w-5 h-5 rounded-md bg-primary flex items-center justify-center flex-shrink-0">
            <CssIcon name="diamond" size={10} className="text-goldShine" />
          </span>
          <p className="text-[11px] font-heading text-primary font-semibold">Flo India Sleep Studio</p>
        </div>
        <p className="text-[10px] font-body text-text/50 pl-7">
          100-Night Trial • 10-Year Warranty
        </p>
      </div>
    </div>
  );

  return (
    <>
      {/* Fixed Top Utility Bar */}
      <header className="fixed top-0 left-0 right-0 z-50 h-14 bg-white/96 backdrop-blur-xl border-b border-[#E6E2D8] px-3 sm:px-5 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          {/* Mobile Menu Toggle */}
          <button
            type="button"
            onClick={() => setMobileOpen((p) => !p)}
            aria-label="Toggle Menu"
            className="lg:hidden p-2 rounded-xl hover:bg-softPink text-primary transition-colors"
          >
            <CssIcon name={mobileOpen ? "close" : "kanban"} size={16} />
          </button>

          {/* Brand */}
          <Link href="/" className="flex items-center gap-2 group">
            <span className="w-8 h-8 rounded-xl bg-primary text-white flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow">
              <CssIcon name="diamond" size={13} className="text-goldShine" />
            </span>
            <div className="leading-tight">
              <span className="font-heading text-primary text-sm sm:text-[15px] font-bold block">
                Flo India CRM
              </span>
              <span className="text-[9px] font-body text-text/40 hidden sm:block tracking-wide">
                Sleep Solutions Platform
              </span>
            </div>
          </Link>
        </div>

        {/* Center Search Bar */}
        <button
          type="button"
          onClick={() => setSearchOpen(true)}
          className="flex-1 max-w-sm hidden sm:flex items-center justify-between gap-2 px-4 py-2 rounded-full bg-[#F7F6F2] border border-[#E6E2D8] hover:border-gold/40 hover:bg-white text-xs font-body text-text/45 transition-all duration-200"
        >
          <span className="flex items-center gap-2">
            <CssIcon name="search" size={13} className="text-gold" />
            <span>Search leads, customers, orders...</span>
          </span>
          <span className="hidden md:flex gap-0.5">
            <kbd className="px-1.5 py-0.5 rounded bg-white border border-[#E6E2D8] text-[10px] text-text/40 font-mono">Ctrl</kbd>
            <kbd className="px-1.5 py-0.5 rounded bg-white border border-[#E6E2D8] text-[10px] text-text/40 font-mono">K</kbd>
          </span>
        </button>

        {/* Right Quick Actions */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setSearchOpen(true)}
            className="sm:hidden p-2 rounded-full bg-softPink text-primary"
            aria-label="Search"
          >
            <CssIcon name="search" size={14} />
          </button>

          <Link
            href="/shop"
            className="hidden lg:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-softPink text-primary border border-[#E6E2D8] text-xs font-body font-medium hover:bg-primary hover:text-white hover:border-primary transition-all duration-200"
          >
            <CssIcon name="bag" size={11} />
            <span>Store POS</span>
          </Link>

          <Link
            href="/leads"
            className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary text-white text-xs font-body font-medium hover:bg-primary/90 shadow-sm hover:shadow-md transition-all duration-200"
          >
            <CssIcon name="plus" size={11} />
            <span>New Lead</span>
          </Link>

          {session?.user && (
            <div className="relative pl-2 border-l border-[#E6E2D8]">
              <button
                type="button"
                onClick={() => setProfileOpen((p) => !p)}
                className="flex items-center gap-2 hover:bg-softPink rounded-xl px-2 py-1 transition-colors"
              >
                <div className="hidden md:block text-right leading-tight">
                  <p className="text-xs font-body font-semibold text-primary">
                    {session.user.name}
                  </p>
                  <p className="text-[10px] font-body text-text/40">{role}</p>
                </div>
                {/* Avatar Circle */}
                <span className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-primary/70 text-white text-xs font-heading flex items-center justify-center shadow-sm flex-shrink-0">
                  {getInitials(session.user.name)}
                </span>
              </button>

              {/* Profile Dropdown */}
              <AnimatePresence>
                {profileOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 top-full mt-2 w-52 bg-white rounded-2xl border border-[#E6E2D8] shadow-xl z-50 overflow-hidden"
                  >
                    <div className="p-4 bg-softPink/50 border-b border-[#E6E2D8]">
                      <p className="text-sm font-heading text-primary">{session.user.name}</p>
                      <p className="text-xs font-body text-text/50">{session.user.email}</p>
                      <span className="inline-block mt-1 px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-body font-medium">{role}</span>
                    </div>
                    <div className="p-2">
                      <Link href="/settings" onClick={() => setProfileOpen(false)}
                        className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-body text-text/70 hover:bg-softPink hover:text-primary transition-colors">
                        <CssIcon name="settings" size={14} />
                        <span>Settings</span>
                      </Link>
                      <button
                        onClick={() => { setProfileOpen(false); signOut(); }}
                        className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-body text-danger hover:bg-danger/5 transition-colors"
                      >
                        <CssIcon name="logout" size={14} />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>
      </header>

      {/* Click-outside for profile dropdown */}
      {profileOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setProfileOpen(false)}
        />
      )}

      {/* Desktop Left Sidebar */}
      <aside className="hidden lg:flex flex-col fixed top-14 left-0 bottom-0 w-60 z-40 bg-white border-r border-[#E6E2D8]">
        <SidebarContent />
      </aside>

      {/* Mobile Slide-Out Sidebar Drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden"
            />
            <motion.aside
              initial={{ x: -260 }}
              animate={{ x: 0 }}
              exit={{ x: -260 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="fixed top-14 left-0 bottom-0 w-64 z-50 bg-white border-r border-[#E6E2D8] shadow-2xl lg:hidden"
            >
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Global Quick Search Modal */}
      <AnimatePresence>
        {searchOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSearchOpen(false)}
            className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm flex items-start justify-center pt-20 px-4"
          >
            <motion.div
              initial={{ scale: 0.95, y: -15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: -15 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-lg bg-white rounded-[24px] border border-[#E6E2D8] shadow-2xl overflow-hidden"
            >
              <div className="flex items-center gap-3 px-5 py-4 border-b border-[#E6E2D8]">
                <CssIcon name="search" size={16} className="text-primary flex-shrink-0" />
                <input
                  autoFocus
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search leads or customers (Name / Phone)..."
                  className="flex-1 text-sm font-body outline-none bg-transparent"
                />
                <button
                  onClick={() => setSearchOpen(false)}
                  className="p-1.5 rounded-full hover:bg-softPink transition-colors flex-shrink-0"
                >
                  <CssIcon name="close" size={14} />
                </button>
              </div>

              <div className="max-h-80 overflow-y-auto p-3 space-y-3">
                {query.trim().length < 2 && (
                  <div className="text-center py-8">
                    <div className="w-10 h-10 rounded-full bg-softPink flex items-center justify-center mx-auto mb-3">
                      <CssIcon name="search" size={18} className="text-primary/50" />
                    </div>
                    <p className="text-xs font-body text-text/50">Type at least 2 characters to search</p>
                    <p className="text-[11px] font-body text-text/35 mt-1">Leads, Customers, Orders</p>
                  </div>
                )}
                {leadResults.length > 0 && (
                  <div>
                    <p className="text-[10px] font-body font-semibold text-text/40 uppercase tracking-widest px-2 mb-2">
                      Leads
                    </p>
                    {leadResults.map((l) => (
                      <button
                        key={`l-${l.id}`}
                        onClick={() => {
                          setSearchOpen(false);
                          setQuery("");
                          router.push(`/leads/${l.id}`);
                        }}
                        className="w-full text-left px-3 py-2.5 rounded-2xl hover:bg-softPink flex items-center justify-between gap-3 transition-colors"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <span className="w-8 h-8 rounded-full bg-primary/10 text-primary text-xs font-heading flex items-center justify-center flex-shrink-0">
                            {getInitials(l.naam)}
                          </span>
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-primary truncate">{l.naam}</p>
                            <p className="text-xs text-text/50 truncate">{l.phone} • {l.source}</p>
                          </div>
                        </div>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary flex-shrink-0">
                          {l.stage}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
                {custResults.length > 0 && (
                  <div>
                    <p className="text-[10px] font-body font-semibold text-text/40 uppercase tracking-widest px-2 mb-2">
                      Customers
                    </p>
                    {custResults.map((c) => (
                      <button
                        key={`c-${c.id}`}
                        onClick={() => {
                          setSearchOpen(false);
                          setQuery("");
                          router.push(role === "OWNER" ? "/dashboard" : "/shop");
                        }}
                        className="w-full text-left px-3 py-2.5 rounded-2xl hover:bg-softPink flex items-center justify-between gap-3 transition-colors"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <span className="w-8 h-8 rounded-full bg-gold/15 text-primary text-xs font-heading flex items-center justify-center flex-shrink-0">
                            {getInitials(c.name)}
                          </span>
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-primary truncate">{c.name}</p>
                            <p className="text-xs text-text/50 truncate">{c.phone} • {c.city || "India"}</p>
                          </div>
                        </div>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-gold/15 text-primary flex-shrink-0">
                          {c.isVip ? "VIP" : "Customer"}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
                {query.trim().length >= 2 &&
                  leadResults.length === 0 &&
                  custResults.length === 0 && (
                    <div className="text-center py-8">
                      <p className="text-xs font-body text-text/50">No matching records found</p>
                      <p className="text-[11px] font-body text-text/35 mt-1">Try a different name or phone number</p>
                    </div>
                  )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
