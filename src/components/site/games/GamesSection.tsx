"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import { Gamepad2 } from "lucide-react";

// Kode game baru diunduh saat pengunjung mendekati bagian ini → website tetap ringan
const GameZone = dynamic(() => import("./GameZone"), { ssr: false, loading: () => <Placeholder /> });

function Placeholder() {
  return (
    <div className="card grid h-[420px] place-items-center text-zinc-600">
      <Gamepad2 className="animate-pulse" size={32} />
    </div>
  );
}

export function GamesSection() {
  const ref = useRef<HTMLDivElement>(null);
  const [show, setShow] = useState(false);
  useEffect(() => {
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setShow(true); io.disconnect(); } }, { rootMargin: "400px" });
    if (ref.current) io.observe(ref.current);
    return () => io.disconnect();
  }, []);
  return <div ref={ref}>{show ? <GameZone /> : <Placeholder />}</div>;
}
