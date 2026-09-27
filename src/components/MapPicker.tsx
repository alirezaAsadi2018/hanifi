import { useState, type ReactNode } from "react";
import Icon from "./Icon";
import { Button } from "./ui";

/** Mock map background (grid + streets). A real build would swap this for Neshan or Map.ir tiles. */
export function MapBg({ children, className = "", onClick }: { children?: ReactNode; className?: string; onClick?: (x: number, y: number) => void }) {
  return (
    <div
      className={`relative overflow-hidden rounded-2xl bg-neutral-100 ${onClick ? "cursor-crosshair" : ""} ${className}`}
      onClick={(event) => {
        if (!onClick) return;
        const rect = event.currentTarget.getBoundingClientRect();
        onClick(((event.clientX - rect.left) / rect.width) * 100, ((event.clientY - rect.top) / rect.height) * 100);
      }}
    >
      <div className="map-grid absolute inset-0" />
      <div className="absolute inset-0 opacity-60">
        <div className="absolute left-0 right-0 top-1/3 h-3 bg-white" />
        <div className="absolute bottom-0 top-0 right-1/3 w-3 bg-white" />
        <div className="absolute left-1/4 right-0 top-2/3 h-2 bg-white" />
        <div className="absolute bottom-0 top-0 left-1/5 w-2 bg-white" />
        <div className="absolute bottom-6 left-8 h-10 w-16 rounded-lg bg-neutral-200" />
        <div className="absolute right-10 top-6 h-8 w-12 rounded-lg bg-neutral-200" />
      </div>
      {children}
    </div>
  );
}

/** Tap on the map to move the pin; "my location" recentres it. */
export function MapPicker({ className = "", onChange }: { className?: string; onChange?: (label: string) => void }) {
  const [pin, setPin] = useState({ x: 50, y: 50 });
  const [locating, setLocating] = useState(false);

  const useMyLocation = () => {
    setLocating(true);
    const done = () => { setPin({ x: 50, y: 50 }); setLocating(false); onChange?.("موقعیت فعلی من"); };
    if (!navigator.geolocation) return done();
    navigator.geolocation.getCurrentPosition(done, done, { timeout: 4000 });
  };

  return (
    <MapBg className={className} onClick={(x, y) => { setPin({ x, y }); onChange?.("موقعیت انتخاب‌شده روی نقشه"); }}>
      <div className="pointer-events-none absolute -translate-x-1/2 -translate-y-full transition-all duration-300" style={{ left: `${pin.x}%`, top: `${pin.y}%` }}>
        <div className="flex size-10 items-center justify-center rounded-full border-2 border-white bg-brand text-white shadow-lg"><Icon name="pin" size="sm" /></div>
        <div className="mx-auto mt-0.5 h-2 w-0.5 bg-brand" />
      </div>
      <div className="absolute right-3 top-3" onClick={(event) => event.stopPropagation()}>
        <Button className="flex items-center gap-2 rounded-xl bg-white px-3 py-2 text-xs font-bold shadow hover:text-brand" onClick={useMyLocation}>
          <Icon name="pin" size="sm" />{locating ? "در حال یافتن..." : "موقعیت فعلی من"}
        </Button>
      </div>
      <div className="pointer-events-none absolute bottom-3 left-3 rounded-lg bg-white/90 px-2.5 py-1.5 text-xs font-bold text-muted shadow">برای جابه‌جایی پین، روی نقشه بزنید</div>
    </MapBg>
  );
}
