import { useState, useRef, useEffect } from "react";
import { MapPin } from "lucide-react";
import { useSolrSearch, SolrResult } from "./useSolrSearch";

interface Props {
  value?: string;
  onSelect: (result: SolrResult) => void;
  isHigh?: boolean;
}

export function SolrSearchInput({ value, onSelect, isHigh }: Props) {
  const [query, setQuery] = useState(value ?? "");
  const [open, setOpen] = useState(false);
  const { results, loading, error } = useSolrSearch(query);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const close = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  const handleSelect = (item: SolrResult) => {
    setQuery(item.label);
    setOpen(false);
    onSelect(item);
  };

  return (
    <div ref={containerRef} className="relative">
      <div className="relative">
        <MapPin
          size={14}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
        />
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => query.length > 1 && setOpen(true)}
          placeholder="e.g. 12 Main Road, Mitchells Plain, Cape Town"
          className={`block w-full pl-8 pr-3 py-2 border rounded-xl text-sm font-medium transition-all focus:outline-hidden focus:ring-2 ${
            isHigh
              ? "bg-black text-white border-coct-yellow focus:ring-coct-yellow"
              : "border-slate-200 text-slate-900 focus:ring-indigo-400"
          }`}
        />
      </div>

      {open && (loading || results.length > 0 || error) && (
        <ul className="absolute z-50 w-full mt-1 bg-white border border-slate-200 rounded-xl shadow-lg max-h-52 overflow-y-auto">
          {loading && (
            <li className="px-4 py-3 text-xs text-slate-400 font-medium">
              Searching…
            </li>
          )}
          {error && (
            <li className="px-4 py-3 text-xs text-red-500 font-medium">
              {error}
            </li>
          )}
          {results.map((item) => (
            <li
              key={item.isisKey}
              onMouseDown={() => handleSelect(item)}
              className="flex items-center gap-2 px-4 py-2.5 text-sm text-slate-700 hover:bg-indigo-50 hover:text-indigo-800 cursor-pointer transition-colors"
            >
              <MapPin size={12} className="text-slate-400 shrink-0" />
              {item.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
