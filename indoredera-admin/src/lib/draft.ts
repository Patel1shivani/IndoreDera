import { useCallback, useMemo, useState } from "react";
import { ApiError } from "./api";
import { useUnsavedMark } from "./unsaved";

/*
 * Content pages ka editing model.
 *
 * Baaki panel me ek click = ek server call hai (listing approve, banner hide).
 * Text likhna waisa nahi hai: aadha likha hua paragraph server par bhejne ka
 * koi matlab nahi. Isliye yahan admin ka likha hua pehle local draft me rehta
 * hai aur Save dabane par hi jaata hai.
 *
 * Server par sirf badli hui fields jaati hain, poora section nahi — do admin
 * ek hi page ke alag hisse edit karein to ek doosre ka kaam na mite.
 */

export function useDraft<T extends object>(server: T) {
  const [draft, setDraft] = useState<T>(server);
  const [dirtyKeys, setDirtyKeys] = useState<string[]>([]);

  const update = useCallback((patch: Partial<T>) => {
    setDraft((current) => ({ ...current, ...patch }));
    setDirtyKeys((keys) => {
      const added = Object.keys(patch).filter((key) => !keys.includes(key));
      return added.length ? [...keys, ...added] : keys;
    });
  }, []);

  const reset = useCallback((next: T) => {
    setDraft(next);
    setDirtyKeys([]);
  }, []);

  const markSaved = useCallback(() => setDirtyKeys([]), []);

  /** Sirf wahi fields jo admin ne chhui hain. */
  const patch = useMemo(
    () =>
      Object.fromEntries(dirtyKeys.map((key) => [key, draft[key as keyof T]])) as Partial<T>,
    [dirtyKeys, draft],
  );

  return { draft, dirty: dirtyKeys.length, patch, update, reset, markSaved };
}

/** SaveBar ko jo chahiye, bas wahi. */
export type SaveState = {
  dirty: number;
  saving: boolean;
  error: string | null;
  saved: boolean;
  onSave: () => void;
  onDiscard: () => void;
};

/**
 * Draft + Save/Discard + "unsaved" pehra — paanch content pages par ek jaisa
 * hi chahiye tha, isliye ek hi hook me.
 */
export function useSectionEditor<T extends object>(
  server: T,
  save: (patch: Partial<T>) => Promise<unknown>,
) {
  const { draft, dirty, patch, update, reset, markSaved } = useDraft(server);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  useUnsavedMark(dirty > 0);

  const onSave = useCallback(() => {
    setSaving(true);
    setError(null);
    save(patch)
      .then(() => {
        markSaved();
        setSaved(true);
      })
      .catch((err: unknown) => {
        // draft waisa hi rehta hai — admin dobara Save daba sakta hai
        setError(err instanceof ApiError ? err.message : "Save nahi ho paaya.");
      })
      .finally(() => setSaving(false));
  }, [patch, save, markSaved]);

  const onDiscard = useCallback(() => reset(server), [reset, server]);

  const state: SaveState = { dirty, saving, error, saved, onSave, onDiscard };

  return { draft, update, state };
}
