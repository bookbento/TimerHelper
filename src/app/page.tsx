import React, { useEffect, useMemo, useRef, useState } from "react";

// Minimal, Apple-like UI using Tailwind only
// Drop this file into a Next.js (App Router or Pages Router) project
// as a client component and ensure Tailwind is set up.
// If using App Router, place it in app/page.tsx and add "use client" at top.

export default function BookbxkTimerApp() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-50 to-zinc-100 text-zinc-900">
      <MainApp />
    </div>
  );
}

function MainApp() {
  const [now, setNow] = useState<Date>(new Date());
  const [displayName, setDisplayName] = useState<string>("");
  const [selectedPageId, setSelectedPageId] = useState<string>("page-1");
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Pages & items
  type Item = { id: string; name: string; createdAt: number };
  type Page = { id: string; label: string; items: Item[] };
  const [pages, setPages] = useState<Page[]>([
    { id: "page-1", label: "Page 1", items: [] },
    { id: "page-2", label: "Page 2", items: [] },
    { id: "page-3", label: "Page 3", items: [] },
    { id: "page-4", label: "Page 4", items: [] },
  ]);

  // Result-time list
  type RT = { id: string; target: Date | null; createdAt: number; expired: boolean };
  const [resultTimes, setResultTimes] = useState<RT[]>([]);
  const add25 = () => {
    const target = new Date(Date.now() + 25 * 60 * 1000);
    setResultTimes((s) => [
      { id: crypto.randomUUID(), target, createdAt: Date.now(), expired: false },
      ...s,
    ]);
  };

  // Tick clock
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  // Expire result times once reached (and freeze as --:--)
  useEffect(() => {
    setResultTimes((list) =>
      list.map((rt) => {
        if (!rt.expired && rt.target && now >= rt.target) {
          return { ...rt, expired: true, target: null };
        }
        return rt;
      })
    );
  }, [now]);

  const currentPage = useMemo(() => pages.find((p) => p.id === selectedPageId)!, [pages, selectedPageId]);

  return (
    <div className="max-w-[1200px] mx-auto px-4 pb-32">
      {/* Top layout */}
      <div className="pt-8 grid grid-cols-12 gap-6">
        {/* Sidebar: Pages */}
        <aside className="col-span-12 sm:col-span-3">
          <div className="sticky top-4 space-y-3">
            <h2 className="text-sm font-medium text-zinc-500 tracking-wide">PAGES</h2>
            <div className="space-y-2">
              {pages.map((p) => (
                <button
                  key={p.id}
                  onClick={() => setSelectedPageId(p.id)}
                  className={`w-full text-left px-4 py-3 rounded-2xl border transition hover:shadow-sm focus:outline-none focus:ring-2 focus:ring-black/10 ${
                    selectedPageId === p.id
                      ? "bg-white border-zinc-200 shadow"
                      : "bg-zinc-50 border-zinc-200"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{p.label}</span>
                    <span className="text-xs text-zinc-500">{p.items.length}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* Main column */}
        <main className="col-span-12 sm:col-span-9">
          {/* Header: Name + Realtime + Add button */}
          <div className="bg-white rounded-3xl border border-zinc-200 shadow-sm p-5 sm:p-6 mb-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-4">
                <label className="text-sm text-zinc-500">Name</label>
                <input
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Your name"
                  className="px-3 py-2 rounded-xl border border-zinc-300 bg-zinc-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-black/10 min-w-[12rem]"
                />
              </div>

              <div className="flex items-center gap-4">
                <ClockBadge time={now} />
                <button
                  onClick={add25}
                  className="px-4 py-2 rounded-2xl bg-black text-white font-medium hover:bg-zinc-800 active:scale-[.99] transition"
                >
                  + 25 min
                </button>
              </div>
            </div>

            {/* Result times list */}
            <div className="mt-5">
              <h3 className="text-sm font-medium text-zinc-500 mb-2">Result time</h3>
              {resultTimes.length === 0 ? (
                <p className="text-zinc-500 text-sm">ยังไม่มีเวลา — กด +25 min เพื่อเพิ่ม</p>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {resultTimes.map((rt) => (
                    <div
                      key={rt.id}
                      className="flex items-center justify-between px-4 py-3 rounded-2xl border border-zinc-200 bg-zinc-50"
                    >
                      <div className="text-lg tabular-nums font-semibold tracking-tight">
                        {rt.target ? formatHM(rt.target) : "--:--"}
                      </div>
                      <span
                        className={`text-xs px-2 py-1 rounded-full border ${
                          rt.expired ? "border-zinc-300 text-zinc-500" : "border-emerald-300 text-emerald-600"
                        }`}
                      >
                        {rt.expired ? "Expired" : "Active"}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Items grid (selected page) */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {currentPage.items.length === 0 ? (
              <div className="col-span-full text-center py-16 text-zinc-500">
                ยังไม่มีข้อมูลใน {currentPage.label} — กดปุ่ม + มุมขวาล่างเพื่อเพิ่ม
              </div>
            ) : (
              currentPage.items.map((it) => (
                <article key={it.id} className="bg-white rounded-3xl border border-zinc-200 shadow-sm p-5">
                  <h4 className="font-semibold text-lg mb-2 truncate">{it.name}</h4>
                  <p className="text-sm text-zinc-500">Added {timeSince(it.createdAt)} ago</p>
                </article>
              ))
            )}
          </div>
        </main>
      </div>

      {/* Floating + button */}
      <button
        onClick={() => setIsModalOpen(true)}
        className="fixed bottom-24 right-6 sm:bottom-10 sm:right-10 h-14 w-14 rounded-full bg-black text-white text-3xl leading-none grid place-items-center shadow-lg hover:bg-zinc-800 active:scale-[.98]"
        aria-label="Add"
      >
        +
      </button>

      {/* Modal */}
      {isModalOpen && (
        <AddItemModal
          pages={pages}
          onClose={() => setIsModalOpen(false)}
          onSave={(pageId, name) => {
            setPages((prev) =>
              prev.map((p) =>
                p.id === pageId
                  ? { ...p, items: [{ id: crypto.randomUUID(), name, createdAt: Date.now() }, ...p.items] }
                  : p
              )
            );
            setSelectedPageId(pageId);
            setIsModalOpen(false);
          }}
        />
      )}

      {/* Footer */}
      <FooterLoop text="cement from bookbxk" />
    </div>
  );
}

function ClockBadge({ time }: { time: Date }) {
  return (
    <div className="px-4 py-2 rounded-2xl border border-zinc-200 bg-zinc-50 font-mono tabular-nums text-xl tracking-tight">
      {formatHMS(time)}
    </div>
  );
}

function AddItemModal({
  pages,
  onClose,
  onSave,
}: {
  pages: { id: string; label: string }[];
  onClose: () => void;
  onSave: (pageId: string, name: string) => void;
}) {
  const [tab, setTab] = useState<string>(pages[0]?.id ?? "page-1");
  const [name, setName] = useState<string>("");
  const sheetRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />
      <div
        ref={sheetRef}
        className="absolute left-0 right-0 bottom-0 mx-auto max-w-2xl bg-white rounded-t-3xl shadow-2xl border border-zinc-200 p-6 animate-[slideup_.28s_ease-out]"
      >
        <style jsx>{`
          @keyframes slideup { from { transform: translateY(30px); opacity: .6 } to { transform: translateY(0); opacity: 1 } }
        `}</style>
        {/* Tabs */}
        <div className="flex items-center gap-2 mb-6 overflow-x-auto">
          {pages.map((p) => (
            <button
              key={p.id}
              onClick={() => setTab(p.id)}
              className={`px-4 py-2 rounded-2xl border text-sm whitespace-nowrap transition ${
                tab === p.id
                  ? "bg-black text-white border-black"
                  : "bg-zinc-50 text-zinc-700 border-zinc-200 hover:bg-white"
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>

        {/* Form */}
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <label className="text-sm text-zinc-500 w-20">NAME</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter a name"
              className="flex-1 px-4 py-3 rounded-2xl border border-zinc-300 bg-zinc-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-black/10"
            />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-2xl border border-zinc-300 text-zinc-700 hover:bg-zinc-50"
            >
              Cancel
            </button>
            <button
              onClick={() => name.trim() && onSave(tab, name.trim())}
              className="px-5 py-2 rounded-2xl bg-black text-white font-medium hover:bg-zinc-800 disabled:opacity-40"
              disabled={!name.trim()}
            >
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function FooterLoop({ text }: { text: string }) {
  return (
    <footer className="fixed bottom-0 left-0 right-0 border-t border-zinc-200 bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="relative overflow-hidden py-3">
        <div className="whitespace-nowrap animate-[marquee_16s_linear_infinite]">
          {[...Array(12)].map((_, i) => (
            <span key={i} className="mx-6 text-sm tracking-wide text-zinc-600">
              {text}
            </span>
          ))}
        </div>
      </div>
      <style jsx>{`
        @keyframes marquee { from { transform: translateX(0); } to { transform: translateX(-50%); } }
      `}</style>
    </footer>
  );
}

// ---------- Helpers ----------
function pad(n: number) { return n.toString().padStart(2, "0"); }
function formatHMS(d: Date) { return `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`; }
function formatHM(d: Date) { return `${pad(d.getHours())}:${pad(d.getMinutes())}`; }
function timeSince(ts: number) {
  const s = Math.max(1, Math.floor((Date.now() - ts) / 1000));
  if (s < 60) return `${s}s`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  return `${h}h`;
}
