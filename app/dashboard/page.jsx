"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import Sidebar from "@/components/sidebar";

const plusIcon = (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

const pinIcon = (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor">
    <path d="M16 3a1 1 0 0 0-1 1v4.586l-6.293 6.293A1 1 0 0 0 9 16h2v4a1 1 0 0 0 2 0v-4h2a1 1 0 0 0 .707-1.707L9.414 8H14a1 1 0 0 0 1-1V4a1 1 0 0 0-1-1z" />
  </svg>
);

const TAG_COLORS = {
  work:     "bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300",
  career:   "bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300",
  reading:  "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300",
  ideas:    "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300",
  personal: "bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300",
  health:   "bg-teal-50 text-teal-700 dark:bg-teal-950/40 dark:text-teal-300",
};

// Replace with real DB fetch later
const NOTES = [
  { id: 1, title: "Product roadmap Q2", preview: "Outlining key milestones for the next quarter. Focus on shipping the editor, onboarding flow, and AI features...", date: "Today", readTime: "3 min", pinned: true, tag: "work" },
  { id: 2, title: "Interview prep notes", preview: "System design: scalability, load balancing, caching. Behavioral: STAR method. Practice leetcode mediums daily...", date: "Yesterday", readTime: "8 min", pinned: true, tag: "career" },
  { id: 3, title: "Meeting with design team", preview: "Discussed new component library. Agreed on neutral palette, bold typography, no gradients. Next sync Friday...", date: "Mar 12", readTime: "1 min", pinned: false, tag: "work" },
  { id: 4, title: "Book notes — SICP", preview: "Chapter 2: Building Abstractions with Data. Key insight — data is just a collection of procedures. Mind = blown...", date: "Mar 11", readTime: "12 min", pinned: false, tag: "reading" },
  { id: 5, title: "Inkly feature ideas", preview: "AI summarization, handwriting support, voice memos, collaborative editing, tags & folders, dark mode...", date: "Mar 10", readTime: "5 min", pinned: false, tag: "ideas" },
  { id: 6, title: "Weekly reflection", preview: "Good week overall. Shipped the auth flow, fixed the font bug. Need to focus more on deep work blocks...", date: "Mar 9", readTime: "2 min", pinned: false, tag: "personal" },
  { id: 7, title: "Startup ideas dump", preview: "1. AI-powered journaling. 2. Micro-SaaS for freelancers. 3. Note-sharing platform. 4. Focus timer with analytics...", date: "Mar 8", readTime: "4 min", pinned: false, tag: "ideas" },
  { id: 8, title: "Gym routine", preview: "Mon: Push. Tue: Pull. Wed: Legs. Thu: Push. Fri: Pull. Sat: Legs. Sun: Rest. Track progressive overload weekly...", date: "Mar 7", readTime: "2 min", pinned: false, tag: "health" },
];

export default function Dashboard() {
  const router = useRouter();
  const [activeNoteId, setActiveNoteId] = useState(null);

  const session = authClient.useSession();
  const user = session?.data?.user;

  const handleNoteSelect = (id) => {
    setActiveNoteId(id);
    router.push(`/dashboard/note/${id}`);
  };

  return (
    <div className="flex h-screen bg-neutral-100 dark:bg-neutral-950 overflow-hidden">
      <Sidebar
        notes={NOTES}
        activeNoteId={activeNoteId}
        onNoteSelect={handleNoteSelect}
      />

      {/* Main area */}
      <main className="flex-1 flex flex-col overflow-hidden relative">
        {/* Top bar */}
        <div className="flex items-center justify-between px-8 py-5 shrink-0">
          <div>
            <h1 className="text-xl font-medium text-neutral-900 dark:text-white tracking-tight">
              Good morning{user?.name ? `, ${user.name.split(" ")[0]}` : ""} 👋
            </h1>
            <p className="text-sm text-neutral-400 mt-0.5">{NOTES.length} notes</p>
          </div>
        </div>

        {/* Notes grid */}
        <div className="flex-1 overflow-y-auto px-8 pb-32">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {NOTES.map((note) => (
              <button
                key={note.id}
                onClick={() => handleNoteSelect(note.id)}
                className="group relative text-left bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-4 hover:border-neutral-300 dark:hover:border-neutral-700 hover:shadow-sm transition-all duration-150"
              >
                {note.pinned && (
                  <span className="absolute top-3 right-3 text-neutral-300 dark:text-neutral-600">
                    {pinIcon}
                  </span>
                )}
                <p className="text-[13px] font-medium text-neutral-900 dark:text-white mb-2 pr-4 leading-snug">
                  {note.title}
                </p>
                <p className="text-[12px] text-neutral-400 leading-relaxed line-clamp-3 mb-3">
                  {note.preview}
                </p>
                <div className="flex items-center justify-between">
                  <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${TAG_COLORS[note.tag] ?? "bg-neutral-100 text-neutral-500"}`}>
                    {note.tag}
                  </span>
                  <span className="text-[11px] text-neutral-300 dark:text-neutral-600">{note.date}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* New note — bottom center */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2">
          <button
            onClick={() => router.push("/dashboard/note/new")}
            className="flex items-center gap-2 px-5 py-2.5 bg-neutral-950 hover:bg-neutral-800 dark:bg-white dark:hover:bg-neutral-100 text-white dark:text-neutral-950 text-sm font-medium rounded-full shadow-lg transition-all duration-150 hover:scale-105"
          >
            {plusIcon}
            New note
          </button>
        </div>
      </main>
    </div>
  );
}