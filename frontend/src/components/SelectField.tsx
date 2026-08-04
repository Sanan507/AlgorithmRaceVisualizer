export function SelectField({
  label,
  value,
  options = [],
  onChange,
  disabled
}: {
  label: string;
  value: string;
  options?: string[];
  onChange: (value: string) => void;
  disabled?: boolean;
}) {
  const safeOptions = options ?? [];
  return (
    <label className="field">
      <span>{label}</span>
      <select value={value} onChange={(event) => onChange(event.target.value)} disabled={disabled} aria-label={label}>
        {safeOptions.map((option) => (
          <option value={option} key={option}>{option}</option>
        ))}
      </select>
    </label>
  );
}

