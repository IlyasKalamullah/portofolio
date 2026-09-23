"use client";

import { useState } from "react";
import clsx from "clsx";
import { Bug, Footprints } from "lucide-react";
import { BugSmasher } from "./BugSmasher";
import { DevRunner } from "./DevRunner";

const tabs = [
  { key: "smash", label: "Bug Smasher", icon: Bug },
  { key: "run", label: "Dev Runner", icon: Footprints },
] as const;

export default function GameZone() {
  const [tab, setTab] = useState<(typeof tabs)[number]["key"]>("smash");
  return (
    <div className="card spotlight p-4 sm:p-8">
      <div className="mx-auto mb-6 flex w-fit gap-1 rounded-full border border-white/10 bg-ink-900/70 p-1" role="tablist">
        {tabs.map(({ key, label, icon: Icon }) => (
          <button key={key} role="tab" aria-selected={tab === key} onClick={() => setTab(key)}
            className={clsx("inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition",
              tab === key ? "bg-accent text-black shadow-[0_0_20px_-4px_rgba(198,244,50,.6)]" : "text-zinc-400 hover:text-white")}>
            <Icon size={15} /> {label}
          </button>
        ))}
      </div>
      <div key={tab} className="animate-pop">{tab === "smash" ? <BugSmasher /> : <DevRunner />}</div>
    </div>
  );
}
