import { X, Check } from "lucide-react";
import { createPortal } from "react-dom";
import { useBodyScrollLock } from "@/hooks/useBodyScrollLock";

interface Props {
  open: boolean;
  onClose: () => void;
  genres: string[];
  years: number[];
  activeGenres: string[];
  activeYears: number[];
  onToggleGenre: (g: string) => void;
  onToggleYear: (y: number) => void;
  onClear: () => void;
  resultCount: number;
}

/** Bottom-sheet filter (multi-select genre + year) used on home and every category page. */
export const FilterSheet = ({
  open,
  onClose,
  genres,
  years,
  activeGenres,
  activeYears,
  onToggleGenre,
  onToggleYear,
  onClear,
  resultCount,
}: Props) => {
  useBodyScrollLock(open);

  const chipCls = (active: boolean) =>
    `px-3.5 py-2 rounded-full text-[12px] tracking-wide transition-all duration-200 active:scale-95 flex items-center gap-1.5 border ${
      active
        ? "bg-foreground/90 text-background border-transparent"
        : "bg-foreground/[0.06] text-foreground/80 border-foreground/10 hover:bg-foreground/10"
    }`;

  const selectedCount = activeGenres.length + activeYears.length;

  return createPortal(
    <div
      className={`fixed inset-0 z-[70] overscroll-none transition-opacity duration-300 ${
        open ? "opacity-100" : "opacity-0 pointer-events-none"
      }`}
      onClick={onClose}
      onTouchMove={(e) => { if (e.target === e.currentTarget) e.preventDefault(); }}
      aria-hidden={!open}
    >
      <div className="absolute inset-0 bg-background/50 backdrop-blur-md" />

      <div
        onClick={(e) => e.stopPropagation()}
        className={`absolute left-2 right-2 bottom-2 max-h-[78vh] flex flex-col rounded-[28px] ios-glass transition-transform duration-300 ease-out ${
          open ? "translate-y-0" : "translate-y-[110%]"
        }`}
      >
        <div className="pt-3 pb-1 flex justify-center shrink-0">
          <div className="h-1.5 w-10 rounded-full bg-foreground/25" />
        </div>

        <div className="flex items-center justify-between px-5 pt-2 pb-3 shrink-0">
          <span className="font-display text-base tracking-widest text-foreground">
            FILTRLASH{selectedCount > 0 ? ` (${selectedCount})` : ""}
          </span>
          <div className="flex items-center gap-3">
            <button
              onClick={onClear}
              className="text-[11px] tracking-widest font-display text-foreground/55 hover:text-neon transition-colors"
            >
              TOZALASH
            </button>
            <button
              onClick={onClose}
              className="h-8 w-8 rounded-full flex items-center justify-center text-foreground/60 hover:text-neon hover:bg-neon/10 transition-all"
              aria-label="Yopish"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto overscroll-contain px-5 pb-4 space-y-6">
          {genres.length > 0 && (
            <section>
              <div className="text-[11px] tracking-[0.15em] text-foreground/50 mb-3">
                Janr (bir nechtasini tanlash mumkin)
              </div>
              <div className="flex flex-wrap gap-2">
                {genres.map((g) => {
                  const active = activeGenres.includes(g);
                  return (
                    <button key={g} onClick={() => onToggleGenre(g)} className={chipCls(active)}>
                      {active && <Check className="h-3 w-3" />}
                      {g}
                    </button>
                  );
                })}
              </div>
            </section>
          )}

          {years.length > 0 && (
            <section>
              <div className="text-[11px] tracking-[0.15em] text-foreground/50 mb-3">Yil</div>
              <div className="flex flex-wrap gap-2">
                {years.map((y) => {
                  const active = activeYears.includes(y);
                  return (
                    <button key={y} onClick={() => onToggleYear(y)} className={chipCls(active)}>
                      {active && <Check className="h-3 w-3" />}
                      {y}
                    </button>
                  );
                })}
              </div>
            </section>
          )}

          {genres.length === 0 && years.length === 0 && (
            <div className="py-10 text-center text-sm text-muted-foreground">Filtr uchun ma'lumot yo'q</div>
          )}
        </div>

        <div className="p-4 pb-[max(1rem,env(safe-area-inset-bottom))] shrink-0 border-t border-foreground/10">
          <button
            onClick={onClose}
            className="w-full h-12 rounded-full font-display text-[12px] tracking-[0.2em] text-background bg-foreground/90 transition-all duration-200 active:scale-[0.98]"
          >
            FILTRLASH ({resultCount})
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};
