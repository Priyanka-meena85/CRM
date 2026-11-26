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
    <div className="flex flex-col h-full py-4 px-3 overflow-y-auto no-scrollbar">
      <div className="space-y-5 flex-1">
        {NAV_GROUPS.map((group) => {
          const visible = group.items.filter((item) => item.roles.includes(role));
          if (visible.length === 0) return null;
          return (
            <div key={group.title}>
              <p className="px-3 mb-1.5 text-[10px] font-body font-semibold uppercase tracking-wider text-text/40">
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
                          "flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-body font-medium transition-all",
                          isActive
                            ? "bg-primary text-white shadow-sm"
                            : "text-text/75 hover:bg-softPink hover:text-primary"
                        )}
                      >
                        <CssIcon name={item.icon} size={14} />
                        <span className="truncate">{item.label}</span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Bottom Trial & Warranty Pill */}
      <div className="mt-6 p-3 rounded-2xl bg-softPink border border-[#E6E2D8]">
        <p className="text-[11px] font-heading text-primary">Flo India Sleep Studio</p>
        <p className="text-[10px] font-body text-text/60 mt-0.5">
          100-Night Trial • 10-Year Warranty
        </p>
      </div>
    </div>
  );

  return (
    <>
      {/* Zoho-style Fixed Top Utility Bar */}
      <header className="fixed top-0 left-0 right-0 z-50 h-14 bg-white/95 backdrop-blur-xl border-b border-[#E6E2D8] px-3 sm:px-5 flex items-center justify-between gap-3">
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
          <Link href="/" className="flex items-center gap-2">
            <span className="w-7 h-7 rounded-lg bg-primary text-white flex items-center justify-center">
              <CssIcon name="diamond" size={12} className="text-goldShine" />
            </span>
            <div className="leading-tight">
              <span className="font-heading text-primary text-sm sm:text-base font-bold block">
                Flo India CRM
              </span>
            </div>
          </Link>
        </div>

        {/* Center Search Bar */}
        <button
          type="button"
          onClick={() => setSearchOpen(true)}
          className="flex-1 max-w-md hidden sm:flex items-center justify-between gap-2 px-3.5 py-1.5 rounded-full bg-background border border-[#E6E2D8] hover:border-gold/50 text-xs font-body text-text/50 transition-colors"
        >
          <span className="flex items-center gap-2">
            <CssIcon name="search" size={13} className="text-gold" />
            <span>Search leads, customers, orders...</span>
          </span>
          <span className="px-1.5 py-0.5 rounded bg-white border border-[#E6E2D8] text-[10px] text-text/50">
            Ctrl+K
          </span>
        </button>

        {/* Right Quick Actions & Profile */}
        <div className="flex items-center gap-2">
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
            className="hidden lg:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-softPink text-primary border border-[#E6E2D8] text-xs font-body font-medium hover:border-gold/50 transition-colors"
          >
            <CssIcon name="bag" size={11} />
            <span>Store POS</span>
          </Link>

          <Link
            href="/leads"
            className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary text-white text-xs font-body font-medium hover:bg-maroonLight transition-colors"
          >
            <CssIcon name="plus" size={11} />
            <span>New Lead</span>
          </Link>

          {session?.user && (
            <div className="flex items-center gap-2 pl-2 border-l border-[#E6E2D8]">
              <div className="hidden md:block text-right leading-tight">
                <p className="text-xs font-body font-semibold text-primary">
                  {session.user.name}
                </p>
                <p className="text-[10px] font-body text-text/45">{role}</p>
              </div>
              <motion.button
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.92 }}
                onClick={() => signOut()}
                title="Sign Out"
                className="p-2 rounded-full text-danger hover:bg-danger/10 transition-colors"
              >
                <CssIcon name="logout" size={14} />
              </motion.button>
            </div>
          )}
        </div>
      </header>

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
            className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-sm flex items-start justify-center pt-20 px-4"
          >
            <motion.div
              initial={{ scale: 0.95, y: -15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: -15 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-lg bg-white rounded-[24px] border border-[#E6E2D8] shadow-2xl overflow-hidden"
            >
              <div className="flex items-center gap-3 px-5 py-4 border-b border-[#E6E2D8]">
                <CssIcon name="search" size={16} className="text-primary" />
                <input
                  autoFocus
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search leads or customers (Name / Phone)..."
                  className="flex-1 text-sm font-body outline-none bg-transparent"
                />
                <button
                  onClick={() => setSearchOpen(false)}
                  className="p-1 rounded-full hover:bg-softPink"
                >
                  <CssIcon name="close" size={15} />
                </button>
              </div>
              <div className="max-h-80 overflow-y-auto p-3 space-y-3">
                {query.trim().length < 2 && (
                  <p className="text-xs font-body text-text/50 text-center py-6">
                    Type at least 2 characters to search leads and customers
                  </p>
                )}
                {leadResults.length > 0 && (
                  <div>
                    <p className="text-[11px] font-body font-semibold text-text/40 px-2 mb-1">
                      LEADS
                    </p>
                    {leadResults.map((l) => (
                      <button
                        key={`l-${l.id}`}
                        onClick={() => {
                          setSearchOpen(false);
                          setQuery("");
                          router.push(`/leads/${l.id}`);
                        }}
                        className="w-full text-left px-3 py-2 rounded-2xl hover:bg-softPink flex items-center justify-between transition-colors"
                      >
                        <div>
                          <p className="text-sm font-semibold text-primary">{l.naam}</p>
                          <p className="text-xs text-text/50">
                            {l.phone} • {l.source}
                          </p>
                        </div>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-softPink text-primary">
                          {l.stage}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
                {custResults.length > 0 && (
                  <div>
                    <p className="text-[11px] font-body font-semibold text-text/40 px-2 mb-1">
                      CUSTOMERS
                    </p>
                    {custResults.map((c) => (
                      <button
                        key={`c-${c.id}`}
                        onClick={() => {
                          setSearchOpen(false);
                          setQuery("");
                          router.push(role === "OWNER" ? "/dashboard" : "/shop");
                        }}
                        className="w-full text-left px-3 py-2 rounded-2xl hover:bg-softPink flex items-center justify-between transition-colors"
                      >
                        <div>
                          <p className="text-sm font-semibold text-primary">{c.name}</p>
                          <p className="text-xs text-text/50">
                            {c.phone} • {c.city || "India"}
                          </p>
                        </div>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                          {c.isVip ? "VIP" : "Customer"}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
                {query.trim().length >= 2 &&
                  leadResults.length === 0 &&
                  custResults.length === 0 && (
                    <p className="text-xs font-body text-text/50 text-center py-6">
                      No matching records found
                    </p>
                  )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
