import {
  Coffee,
  Grid3X3,
  Image,
  Inbox,
  LogOut,
  Menu as MenuIcon,
  Pencil,
  UtensilsCrossed,
  X,
} from "lucide-react";
import type React from "react";
import { useState } from "react";
import InlineEditorManagement from "../components/admin/InlineEditorManagement";
import MenuManagement from "../components/admin/MenuManagement";
import SiteImagesManagement from "../components/admin/SiteImagesManagement";
import SocialGridManagement from "../components/admin/SocialGridManagement";
import SubmissionsManagement from "../components/admin/SubmissionsManagement";

interface AdminDashboardProps {
  onLogout: () => void;
}

type Section =
  | "menu"
  | "site-images"
  | "social-grid"
  | "submissions"
  | "inline-editor";

const navItems: { id: Section; label: string; icon: React.ElementType }[] = [
  { id: "menu", label: "Menu Management", icon: UtensilsCrossed },
  { id: "site-images", label: "Site Images", icon: Image },
  { id: "social-grid", label: "Find Us Online", icon: Grid3X3 },
  { id: "submissions", label: "Form Submissions", icon: Inbox },
  { id: "inline-editor", label: "Inline Editor", icon: Pencil },
];

export default function AdminDashboard({ onLogout }: AdminDashboardProps) {
  const [activeSection, setActiveSection] = useState<Section>("menu");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-admin-bg flex flex-col">
      {/* Top Header */}
      <header className="bg-admin-card border-b border-admin-border px-4 py-3 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <button
            type="button"
            className="md:hidden p-1.5 rounded-md text-admin-muted hover:text-admin-text hover:bg-admin-input transition-colors"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            {sidebarOpen ? (
              <X className="w-5 h-5" />
            ) : (
              <MenuIcon className="w-5 h-5" />
            )}
          </button>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-admin-accent/20 border border-admin-accent/50 flex items-center justify-center">
              <Coffee className="w-3.5 h-3.5 text-admin-accent" />
            </div>
            <span className="font-display font-semibold text-admin-text text-sm">
              Overflow of Jo — Admin
            </span>
          </div>
        </div>
        <button
          type="button"
          onClick={onLogout}
          className="flex items-center gap-2 px-3 py-1.5 text-sm text-admin-muted hover:text-red-400 hover:bg-red-500/10 rounded-md transition-all duration-200"
        >
          <LogOut className="w-4 h-4" />
          <span className="hidden sm:inline">Logout</span>
        </button>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside
          className={`
            fixed md:static inset-y-0 left-0 z-30 w-60 bg-admin-card border-r border-admin-border
            transform transition-transform duration-200 ease-in-out
            ${sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
            pt-16 md:pt-0
          `}
        >
          <nav className="p-4 space-y-1">
            <p className="text-xs font-semibold text-admin-muted uppercase tracking-wider px-3 mb-3">
              Content
            </p>
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeSection === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    setActiveSection(item.id);
                    setSidebarOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-all duration-150 ${
                    isActive
                      ? "bg-admin-accent/15 text-admin-accent border border-admin-accent/30"
                      : "text-admin-muted hover:text-admin-text hover:bg-admin-input"
                  }`}
                >
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  {item.label}
                </button>
              );
            })}
          </nav>
        </aside>

        {/* Overlay for mobile sidebar */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-20 bg-black/50 md:hidden"
            role="button"
            tabIndex={0}
            onClick={() => setSidebarOpen(false)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") setSidebarOpen(false);
            }}
          />
        )}

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          <div className="max-w-5xl mx-auto">
            {activeSection === "menu" && <MenuManagement />}
            {activeSection === "site-images" && <SiteImagesManagement />}
            {activeSection === "social-grid" && <SocialGridManagement />}
            {activeSection === "submissions" && <SubmissionsManagement />}
            {activeSection === "inline-editor" && <InlineEditorManagement />}
          </div>
        </main>
      </div>
    </div>
  );
}
