import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  type ReactNode,
} from "react";

/*
 * "Save nahi kiye hue changes" ka pehra.
 *
 * Content pages par Save button hai, matlab admin kuch likh kar bina save kiye
 * doosre page par ja sakta hai — aur uska likha hua chup-chaap gayab ho jaata.
 * Isliye jo page edit ho raha hai wo apna dirty state yahan register karta hai,
 * aur sidebar navigation se pehle ek confirm poochh liya jaata hai.
 *
 * Dirty flag ref me rakha hai, state me nahi: har keystroke par poore panel ko
 * dobara render karne ki koi zaroorat nahi — ise sirf navigate ke waqt padha
 * jaata hai.
 */

type UnsavedValue = {
  /** Page apna dirty state batata hai. */
  mark: (dirty: boolean) => void;
  /** true = jaane do. Dirty hone par admin se poochhta hai. */
  confirmLeave: () => boolean;
};

const UnsavedContext = createContext<UnsavedValue | null>(null);

export function UnsavedProvider({ children }: { children: ReactNode }) {
  const dirtyRef = useRef(false);

  const mark = useCallback((dirty: boolean) => {
    dirtyRef.current = dirty;
  }, []);

  const confirmLeave = useCallback(() => {
    if (!dirtyRef.current) return true;
    const ok = window.confirm("Kuch changes abhi save nahi hue hain. Chhod kar jaana hai?");
    if (ok) dirtyRef.current = false;
    return ok;
  }, []);

  /* Tab band karne ya refresh par browser ka apna warning — sidebar wala
     confirm yahan kaam nahi aata. */
  useEffect(() => {
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      if (dirtyRef.current) e.preventDefault();
    };
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, []);

  const value = useMemo(() => ({ mark, confirmLeave }), [mark, confirmLeave]);

  return <UnsavedContext.Provider value={value}>{children}</UnsavedContext.Provider>;
}

export function useUnsaved() {
  const ctx = useContext(UnsavedContext);
  if (!ctx) throw new Error("useUnsaved ko <UnsavedProvider> ke andar hi use karein");
  return ctx;
}

/** Page apne dirty state ko register karta hai; unmount par apne aap saaf. */
export function useUnsavedMark(dirty: boolean) {
  const { mark } = useUnsaved();
  useEffect(() => {
    mark(dirty);
    return () => mark(false);
  }, [dirty, mark]);
}
