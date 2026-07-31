import { Field, ListEditor } from "./ui";
import { contentIcons, type Blurb } from "../lib/types";

/*
 * Text-content pages ke chhote editors.
 *
 * About aur Home dono me "icon + heading + ek line" wali list hai (steps,
 * values, why-points), isliye wo editor ek hi jagah rehta hai.
 */

/** Icon ka naam chunne wala dropdown — vocabulary backend ke CONTENT_ICONS se hai. */
export function IconSelect({
  value,
  onChange,
  id,
}: {
  value: string;
  onChange: (v: string) => void;
  id?: string;
}) {
  return (
    <select id={id} className="input" value={value} onChange={(e) => onChange(e.target.value)}>
      <option value="">— koi nahi —</option>
      {contentIcons.map((name) => (
        <option key={name} value={name}>
          {name}
        </option>
      ))}
    </select>
  );
}

/** Icon + title + description wali list. */
export function BlurbListEditor({
  items,
  onChange,
  addLabel,
  withIcon = true,
  idPrefix,
}: {
  items: Blurb[];
  onChange: (next: Blurb[]) => void;
  addLabel?: string;
  /** Steps me icon nahi dikhta, sirf number — wahan ise off kar dete hain. */
  withIcon?: boolean;
  idPrefix: string;
}) {
  return (
    <ListEditor
      items={items}
      onChange={onChange}
      addLabel={addLabel}
      create={() => ({ icon: "", t: "", d: "" })}
    >
      {(item, set, index) => (
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Heading" htmlFor={`${idPrefix}-${index}-t`}>
            <input
              id={`${idPrefix}-${index}-t`}
              className="input"
              value={item.t}
              onChange={(e) => set({ ...item, t: e.target.value })}
            />
          </Field>
          {withIcon && (
            <Field label="Icon" htmlFor={`${idPrefix}-${index}-icon`}>
              <IconSelect
                id={`${idPrefix}-${index}-icon`}
                value={item.icon}
                onChange={(icon) => set({ ...item, icon })}
              />
            </Field>
          )}
          <Field label="Description" htmlFor={`${idPrefix}-${index}-d`} span>
            <textarea
              id={`${idPrefix}-${index}-d`}
              rows={2}
              className="input"
              value={item.d}
              onChange={(e) => set({ ...item, d: e.target.value })}
            />
          </Field>
        </div>
      )}
    </ListEditor>
  );
}
