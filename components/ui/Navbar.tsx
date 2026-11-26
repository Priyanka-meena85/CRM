"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import CssIcon, { CssIconName } from "@/components/ui/CssIcon";

const navItems: { label: string; href: string; icon: CssIconName; roles: string[] }[] = [
  { label: "Shop", href: "/shop", icon: "bag", roles: ["OWNER", "STAFF"] },
  { label: "Orders", href: "/orders", icon: "package", roles: ["OWNER", "STAFF"] },
  { label: "Inbox", href: "/inbox", icon: "chat", roles: ["OWNER", "STAFF"] },
  { label: "Returns", href: "/returns", icon: "refresh", roles: ["OWNER", "STAFF"] },
  { label: "Leads", href: "/leads", icon: "user", roles: ["OWNER", "STAFF"] },
  { label: "Pipeline", href: "/pipeline", icon: "kanban", roles: ["OWNER", "STAFF"] },
  { label: "Follow-ups", href: "/followups", icon: "calendar", roles: ["OWNER", "STAFF"] },
  { label: "AI Bot", href: "/chatbot", icon: "bot", roles: ["OWNER", "STAFF"] },
  { label: "Dashboard", href: "/dashboard", icon: "dashboard", roles: ["OWNER"] },
  { label: "Analytics", href: "/analytics", icon: "chart", roles: ["OWNER"] },
  { label: "Lead Reports", href: "/lead-reports", icon: "trend", roles: ["OWNER"] },
  { label: "Team", href: "/settings", icon: "settings", roles: ["OWNER"] },
];

export default function Navbar() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const router = useRouter();
  const role = (session?.user as any)?.role || "STAFF";
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [leadResults, setLeadResults] = useState<any[]>([]);
  const [custResults, setCustResults] = useState<any[]>([]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setSearchOpen((prev) => !prev);
      }
      if (e.key === "Escape") setSearchOpen(false);
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
        if (lRes.ok) setLeadResults((await lRes.json()).slice(0, 5));
        if (cRes.ok) setCustResults((await cRes.json()).slice(0, 5));
      } catch {}
    }, 200);
    return () => clearTimeout(t);
  }, [query, searchOpen]);

  const visibleItems = navItems.filter((item) => item.roles.includes(role));

  return (
    <>
    <motion.nav
      initial={{ y: -40, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: "spring", stiffness: 200, damping: 25 }}
      className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-auto max-w-[95vw]"
    >
      <div className="flex items-center gap-1 bg-white/75 backdrop-blur-xl border border-gold/20 rounded-full px-2 py-1.5 shadow-lg shadow-gold/10 overflow-x-auto max-w-[95vw]">
        {/* Logo */}
        <Link href="/" className="px-3 py-1.5 font-heading text-primary text-sm font-bold whitespace-nowrap flex items-center gap-1.5">
          <CssIcon name="diamond" size={12} className="text-gold" />
          <span>Priya</span>
        </Link>

        <div className="w-px h-5 bg-gold/20" />

        {/* Nav items */}
        {visibleItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link key={item.href} href={item.href}>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-body font-medium transition-all duration-300 relative",
                  isActive
                    ? "bg-gradient-to-r from-maroon to-maroonLight text-white shadow-md shadow-maroon/20"
                    : "text-text hover:bg-softPink"
                )}
              >
                <CssIcon name={item.icon} size={14} />
                <span className="hidden sm:inline">{item.label}</span>
              </motion.div>
            </Link>
          );
        })}

        <div className="w-px h-5 bg-gold/20" />

        {/* Global Quick Search */}
        <motion.button
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.92 }}
          onClick={() => setSearchOpen(true)}
          title="Quick Search (Ctrl+K)"
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-full bg-softPink/80 hover:bg-gold/20 text-primary text-xs font-body transition-colors"
        >
          <CssIcon name="search" size={13} />
          <span className="hidden lg:inline text-[10px] opacity-60">Ctrl+K</span>
        </motion.button>

        {/* User + logout */}
        {session?.user && (
          <div className="flex items-center gap-1.5 px-2">
            <span className="text-xs font-body text-text/60 hidden md:inline">
              {session.user.name?.split(" ")[0]}
            </span>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => signOut()}
              className="p-1.5 rounded-full text-danger hover:bg-danger/10 transition-colors"
            >
              <CssIcon name="logout" size={13} />
            </motion.button>
          </div>
        )}
      </div>
    </motion.nav>

    <AnimatePresence>
      {searchOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setSearchOpen(false)}
          className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-sm flex items-start justify-center pt-24 px-4"
        >
          <motion.div
            initial={{ scale: 0.95, y: -15 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.95, y: -15 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-lg bg-white rounded-[28px] border border-gold/30 shadow-2xl overflow-hidden"
          >
            <div className="flex items-center gap-3 px-5 py-4 border-b border-gold/15">
              <CssIcon name="search" size={16} className="text-maroon" />
              <input
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search Leads ya Customers (Naam / Phone)..."
                className="flex-1 text-sm font-body outline-none bg-transparent"
              />
              <button onClick={() => setSearchOpen(false)} className="p-1 rounded-full hover:bg-softPink">
                <CssIcon name="close" size={15} />
              </button>
            </div>
            <div className="max-h-80 overflow-y-auto p-3 space-y-3">
              {query.trim().length < 2 && (
                <p className="text-xs font-body text-text/50 text-center py-6">
                  Kam se kam 2 letters type karein — Leads aur Customers turant milenge
                </p>
              )}
              {leadResults.length > 0 && (
                <div>
                  <p className="text-[11px] font-body font-semibold text-text/40 px-2 mb-1">LEADS</p>
                  {leadResults.map((l) => (
                    <button
                      key={`l-${l.id}`}
                      onClick={() => { setSearchOpen(false); setQuery(""); router.push(`/leads/${l.id}`); }}
                      className="w-full text-left px-3 py-2 rounded-2xl hover:bg-softPink flex items-center justify-between transition-colors"
                    >
                      <div>
                        <p className="text-sm font-semibold text-primary">{l.naam}</p>
                        <p className="text-xs text-text/50">{l.phone} • {l.source}</p>
                      </div>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-gold/15 text-primary">{l.stage}</span>
                    </button>
                  ))}
                </div>
              )}
              {custResults.length > 0 && (
                <div>
                  <p className="text-[11px] font-body font-semibold text-text/40 px-2 mb-1">CUSTOMERS</p>
                  {custResults.map((c) => (
                    <button
                      key={`c-${c.id}`}
                      onClick={() => { setSearchOpen(false); setQuery(""); router.push(role === "OWNER" ? "/dashboard" : "/shop"); }}
                      className="w-full text-left px-3 py-2 rounded-2xl hover:bg-softPink flex items-center justify-between transition-colors"
                    >
                      <div>
                        <p className="text-sm font-semibold text-primary">{c.name}</p>
                        <p className="text-xs text-text/50">{c.phone} • {c.city || "Nathdwara"}</p>
                      </div>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-maroon/10 text-maroon">{c.isVip ? "VIP" : "Customer"}</span>
                    </button>
                  ))}
                </div>
              )}
              {query.trim().length >= 2 && leadResults.length === 0 && custResults.length === 0 && (
                <p className="text-xs font-body text-text/50 text-center py-6">Koi match nahi mila</p>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
    </>
  );
}
