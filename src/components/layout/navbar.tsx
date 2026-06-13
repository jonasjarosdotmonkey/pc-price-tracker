"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { useState } from "react";
import {
  Search,
  Bell,
  Heart,
  User,
  ChevronDown,
  Cpu,
  Menu,
  X,
  LayoutDashboard,
  LogOut,
  Settings,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";

const categories = [
  { href: "/products?category=CPU", label: "CPUs" },
  { href: "/products?category=GPU", label: "GPUs" },
  { href: "/products?category=MOTHERBOARD", label: "Motherboards" },
  { href: "/products?category=RAM", label: "Memory" },
  { href: "/products?category=SSD", label: "SSDs" },
  { href: "/products?category=PSU", label: "Power Supplies" },
  { href: "/products?category=CASE", label: "Cases" },
  { href: "/products?category=COOLER", label: "Coolers" },
];

export function Navbar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [search, setSearch] = useState("");

  const role = (session?.user as { role?: string })?.role;
  const isAdmin = role === "ADMIN";

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (search.trim()) {
      window.location.href = `/products?search=${encodeURIComponent(search.trim())}`;
    }
  }

  return (
    <header className="sticky top-0 z-40 bg-surface-900/95 backdrop-blur border-b border-surface-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center h-16 gap-4">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <div className="bg-brand-600 p-1.5 rounded-lg">
              <Cpu className="h-5 w-5 text-white" />
            </div>
            <span className="font-bold text-gray-100 hidden sm:block">
              PC<span className="text-brand-400">Price</span>Tracker
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden lg:flex items-center gap-1 ml-2">
            <Link
              href="/products"
              className={cn(
                "px-3 py-1.5 rounded-lg text-sm font-medium transition-colors",
                pathname === "/products"
                  ? "bg-surface-700 text-gray-100"
                  : "text-gray-400 hover:text-gray-200 hover:bg-surface-800"
              )}
            >
              All Products
            </Link>
            <div className="relative group">
              <button className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium text-gray-400 hover:text-gray-200 hover:bg-surface-800 transition-colors">
                Categories <ChevronDown className="h-3 w-3" />
              </button>
              <div className="absolute top-full left-0 mt-1 w-48 bg-surface-800 border border-surface-600 rounded-xl shadow-xl py-1 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-150">
                {categories.map((cat) => (
                  <Link
                    key={cat.href}
                    href={cat.href}
                    className="block px-3 py-2 text-sm text-gray-400 hover:text-gray-200 hover:bg-surface-700 transition-colors"
                  >
                    {cat.label}
                  </Link>
                ))}
              </div>
            </div>
            <Link
              href="/builds"
              className={cn(
                "px-3 py-1.5 rounded-lg text-sm font-medium transition-colors",
                pathname === "/builds"
                  ? "bg-surface-700 text-gray-100"
                  : "text-gray-400 hover:text-gray-200 hover:bg-surface-800"
              )}
            >
              Build Planner
            </Link>
          </nav>

          {/* Search */}
          <form onSubmit={handleSearch} className="flex-1 max-w-sm mx-4 hidden md:block">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search components..."
                className="w-full bg-surface-700 border border-surface-600 text-gray-200 placeholder-gray-500 rounded-lg pl-9 pr-4 py-2 text-sm focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-colors"
              />
            </div>
          </form>

          <div className="flex items-center gap-1 ml-auto">
            {session ? (
              <>
                <Link href="/favorites" className="p-2 text-gray-500 hover:text-gray-300 hover:bg-surface-800 rounded-lg transition-colors">
                  <Heart className="h-5 w-5" />
                </Link>
                <Link href="/alerts" className="p-2 text-gray-500 hover:text-gray-300 hover:bg-surface-800 rounded-lg transition-colors">
                  <Bell className="h-5 w-5" />
                </Link>
                <div className="relative">
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center gap-2 px-2 py-1.5 rounded-lg text-sm text-gray-400 hover:text-gray-200 hover:bg-surface-800 transition-colors"
                  >
                    <div className="w-7 h-7 bg-brand-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                      {session.user?.name?.[0]?.toUpperCase() || "U"}
                    </div>
                    <ChevronDown className="h-3 w-3 hidden sm:block" />
                  </button>
                  {userMenuOpen && (
                    <div className="absolute top-full right-0 mt-1 w-48 bg-surface-800 border border-surface-600 rounded-xl shadow-xl py-1 z-50">
                      <div className="px-3 py-2 border-b border-surface-600">
                        <p className="text-sm font-medium text-gray-200 truncate">{session.user?.name}</p>
                        <p className="text-xs text-gray-500 truncate">{session.user?.email}</p>
                      </div>
                      {isAdmin && (
                        <Link href="/admin" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-2 px-3 py-2 text-sm text-purple-400 hover:bg-surface-700 transition-colors">
                          <LayoutDashboard className="h-4 w-4" />
                          Admin Dashboard
                        </Link>
                      )}
                      <Link href="/settings" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-2 px-3 py-2 text-sm text-gray-400 hover:text-gray-200 hover:bg-surface-700 transition-colors">
                        <Settings className="h-4 w-4" />
                        Settings
                      </Link>
                      <button
                        onClick={() => { setUserMenuOpen(false); signOut(); }}
                        className="flex items-center gap-2 px-3 py-2 text-sm text-red-400 hover:bg-surface-700 transition-colors w-full text-left"
                      >
                        <LogOut className="h-4 w-4" />
                        Sign Out
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <Link href="/login" className="btn-secondary text-sm px-3 py-1.5 hidden sm:inline-flex">
                  Sign In
                </Link>
                <Link href="/register" className="btn-primary text-sm px-3 py-1.5 hidden sm:inline-flex">
                  <Zap className="h-4 w-4" />
                  Get Started
                </Link>
              </>
            )}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="lg:hidden p-2 text-gray-500 hover:text-gray-300 hover:bg-surface-800 rounded-lg transition-colors"
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="lg:hidden border-t border-surface-700 bg-surface-900 px-4 py-4 space-y-2">
          <form onSubmit={handleSearch} className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search components..."
              className="w-full bg-surface-700 border border-surface-600 text-gray-200 placeholder-gray-500 rounded-lg pl-9 pr-4 py-2 text-sm"
            />
          </form>
          <Link href="/products" className="block px-3 py-2 rounded-lg text-sm text-gray-400 hover:bg-surface-800" onClick={() => setMobileOpen(false)}>All Products</Link>
          {categories.map((cat) => (
            <Link key={cat.href} href={cat.href} className="block px-3 py-2 rounded-lg text-sm text-gray-400 hover:bg-surface-800" onClick={() => setMobileOpen(false)}>
              {cat.label}
            </Link>
          ))}
          <Link href="/builds" className="block px-3 py-2 rounded-lg text-sm text-gray-400 hover:bg-surface-800" onClick={() => setMobileOpen(false)}>Build Planner</Link>
          {!session && (
            <div className="pt-2 flex gap-2">
              <Link href="/login" className="btn-secondary flex-1 text-center text-sm" onClick={() => setMobileOpen(false)}>Sign In</Link>
              <Link href="/register" className="btn-primary flex-1 text-center text-sm" onClick={() => setMobileOpen(false)}>Register</Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
