import { Search, X } from "lucide-react";

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
}

export default function SearchBar({ value, onChange }: SearchBarProps) {
  return (
    <label className="search-bar">
      <Search size={18} aria-hidden="true" />
      <input
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Search champions by name or trait..."
        aria-label="Search champions"
      />
      {value && (
        <button type="button" onClick={() => onChange("")} aria-label="Clear search">
          <X size={16} />
        </button>
      )}
      <kbd>⌘ K</kbd>
    </label>
  );
}
