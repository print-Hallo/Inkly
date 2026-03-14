"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";

const icons = {
  notes: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
    </svg>
  ),
  search: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  ),
  starred: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  ),
  trash: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6l-1 14H6L5 6" />
      <path d="M10 11v6" /><path d="M14 11v6" />
    </svg>
  ),
  settings: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.07 4.93a10 10 0 0 1 0 14.14M4.93 4.93a10 10 0 0 0 0 14.14" />
    </svg>
  ),
  search_sm: (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  ),
};

const NAV = [
  { id: "notes", label: "Notes" },
  { id: "search", label: "Search" },
  { id: "starred", label: "Starred" },
  { id: "trash", label: "Trash" },
];

export default function Sidebar({ notes = [], activeNoteId, onNoteSelect }) {
  const router = useRouter();
  const [activeNav, setActiveNav] = useState("notes");
  const [hovered, setHovered] = useState(false);

  const session = authClient.useSession();
  const user = session?.data?.user;
  const initials = user?.name
    ? user.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()
    : "?";

  const handleSignOut = async () => {
    await authClient.signOut();
    router.push("/login");
  };

  const pinned = notes.filter((n) => n.pinned);
  const recent = notes.filter((n) => !n.pinned);

  const NoteRow = ({ note }) => (
    <button
      onClick={() => onNoteSelect?.(note.id)}
      className={`w-full text-left px-3.5 py-2 transition-colors border-l-2
        ${activeNoteId === note.id
          ? "bg-white dark:bg-neutral-800 border-neutral-950 dark:border-white pl-[12px]"
          : "border-transparent hover:bg-white/60 dark:hover:bg-neutral-800/60"
        }`}
    >
      <p className="text-[13px] font-medium text-neutral-700 dark:text-neutral-300 truncate">{note.title}</p>
      <p className="text-[11px] text-neutral-400 mt-0.5">{note.date} · {note.readTime} read</p>
    </button>
  );

  return (
    <div
      className="relative flex h-full z-30 shrink-0"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Icon rail */}
      <div className="w-[52px] bg-neutral-950 flex flex-col items-center py-3.5 gap-1 border-r border-white/5 z-30 relative">
        {NAV.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveNav(item.id)}
            title={item.label}
            className={`w-[34px] h-[34px] rounded-lg flex items-center justify-center transition-colors
              ${activeNav === item.id
                ? "bg-white/12 text-white"
                : "text-white/35 hover:text-white/70 hover:bg-white/8"
              }`}
          >
            {icons[item.id]}
          </button>
        ))}

        <div className="flex-1" />

        <button
          onClick={() => router.push("/dashboard/settings")}
          title="Settings"
          className="w-[34px] h-[34px] rounded-lg flex items-center justify-center text-white/35 hover:text-white/70 hover:bg-white/8 transition-colors mb-2"
        >
          {icons.settings}
        </button>

        <button
          onClick={handleSignOut}
          title={`Sign out (${user?.email ?? ""})`}
          className="w-7 h-7 rounded-full bg-neutral-700 hover:bg-neutral-600 flex items-center justify-center text-[11px] font-medium text-white transition-colors"
        >
          {initials}
        </button>
      </div>

      {/* Slide-out notes panel */}
      <div
        className={`absolute left-[52px] top-0 h-full w-[220px] bg-neutral-50 dark:bg-neutral-900 border-r border-neutral-200 dark:border-neutral-800 flex flex-col transition-all duration-200 ease-in-out z-20
          ${hovered
            ? "opacity-100 translate-x-0 pointer-events-auto shadow-xl"
            : "opacity-0 -translate-x-2 pointer-events-none"
          }`}
      >
        <div className="flex items-center px-3.5 pt-3.5 pb-2.5">
          <span className="text-[13px] font-medium text-neutral-900 dark:text-white">Notes</span>
        </div>

        <div className="mx-2.5 mb-2.5">
          <div className="flex items-center gap-2 px-2.5 py-1.5 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg cursor-text">
            <span className="text-neutral-400 shrink-0">{icons.search_sm}</span>
            <span className="text-[12px] text-neutral-400">Search notes...</span>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {pinned.length > 0 && (
            <>
              <p className="px-3.5 pt-1 pb-1 text-[10px] font-medium text-neutral-400 uppercase tracking-[0.5px]">Pinned</p>
              {pinned.map((note) => <NoteRow key={note.id} note={note} />)}
            </>
          )}
          {recent.length > 0 && (
            <>
              <p className="px-3.5 pt-3 pb-1 text-[10px] font-medium text-neutral-400 uppercase tracking-[0.5px]">Recent</p>
              {recent.map((note) => <NoteRow key={note.id} note={note} />)}
            </>
          )}
        </div>
      </div>
    </div>
  );
}