import { X } from "lucide-react";

interface Props {
  open: boolean;
  onClose: () => void;
  genres: string[];
  years: number[];
  activeGenre: string | null;
  activeYear: number | null;
  onGenre: (g: string | null) => void;
  onYear: (y: number | null) => void;
  onClear: () => void;
  resultCount: number;
}

/** Bottom-sheet filter (genre + year) used on home and every category page. */
export const FilterSheet = ({
  open,
  onClose,
  genres,
  years,
  activeGenre,
  activeYear,
  onGenre,
  onYear,
  onClear,
  resultCount,
}: Props) => {
  const chipCls = (active: boolean) =>
    `px-3.5 py-2 rounded-xl text-[12px] tracking-wide transition-all duration-300 active:scale-95 ${
      active
        ? "bg-neon/15 text-neon border border-neon/60 shadow-[0_0_16px_-4px_hsl(var(--neon)/0.8)]"
        : "glass text-foreground/75 border border-white/5 hover:text-neon hover:border-neon/40 hover:shadow-[0_0_14px_-6px_hsl(var(--neon)/0.9)]"
    }`;

  return (
    <div
      className={`fixed inset-0 z-[70] transition-opacity duration-300 ${
        open ? "opacity-100" : "opacity-0 pointer-events-none"
      }`}
      onClick={onClose}
      aria-hidden={!open}
    >
      <div className="absolute inset-0 bg-background/75 backdrop-blur-sm" />

      <div
        onClick={(e) => e.stopPropagation()}
        className={`absolute left-0 right-0 bottom-0 max-h-[82vh] flex flex-col rounded-t-3xl glass-strong border-t border-neon/30 shadow-[0_-10px_50px_-20px_hsl(var(--neon)/0.8)] transition-transform duration-300 ${
          open ? "translate-y-0" : "translate-y-full"
        }`}
      >
        <div className="pt-3 pb-1 flex justify-center shrink-0">
          <div className="h-1.5 w-12 rounded-full bg-foreground/25" />
        </div>

        <div className="flex items-center justify-between px-5 pt-2 pb-3 shrink-0">
          <span className="font-display text-lg tracking-widest neon-text">FILTRLASH</span>
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

        <div className="flex-1 overflow-y-auto px-5 pb-4 space-y-6">
          {genres.length > 0 && (
            <section>
              <div className="text-[11px] tracking-[0.2em] font-display text-foreground/50 mb-3">JANR</div>
              <div className="flex flex-wrap gap-2">
                {genres.map((g) => (
                  <button
                    key={g}
                    onClick={() => onGenre(activeGenre === g ? null : g)}
                    className={chipCls(activeGenre === g)}
                  >
                    {g}
                  </button>
                ))}
              </div>
            </section>
          )}

          {years.length > 0 && (
            <section>
              <div className="text-[11px] tracking-[0.2em] font-display text-foreground/50 mb-3">YIL</div>
              <div className="flex flex-wrap gap-2">
                {years.map((y) => (
                  <button
                    key={y}
                    onClick={() => onYear(activeYear === y ? null : y)}
                    className={chipCls(activeYear === y)}
                  >
                    {y}
                  </button>
                ))}
              </div>
            </section>
          )}

          {genres.length === 0 && years.length === 0 && (
            <div className="py-10 text-center text-sm text-muted-foreground">Filtr uchun ma'lumot yo'q</div>
          )}
        </div>

        <div className="p-4 pb-[max(1rem,env(safe-area-inset-bottom))] shrink-0 border-t border-white/5">
          <button
            onClick={onClose}
            className="w-full h-12 rounded-2xl font-display text-[12px] tracking-[0.2em] text-background bg-neon transition-all duration-300 hover:brightness-110 hover:shadow-[0_0_28px_-4px_hsl(var(--neon))] active:scale-[0.98]"
          >
            FILTRLASH ({resultCount})
          </button>
        </div>
      </div>
    </div>
  );
};
