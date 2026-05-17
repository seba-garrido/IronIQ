import { Search, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";

export interface SearchPickerItem {
  id: string;
  title: string;
  subtitle: string;
  meta: string;
  searchText: string;
}

interface SearchPickerProps<T extends SearchPickerItem> {
  emptyText: string;
  label: string;
  items: T[];
  onSelect: (item: T) => void;
  placeholder: string;
  renderBadge?: (item: T) => ReactNode;
  title: string;
  value: string;
}

function matchesQuery(item: SearchPickerItem, query: string) {
  const tokens = query
    .toLowerCase()
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (tokens.length === 0) return true;
  const haystack = item.searchText.toLowerCase();
  return tokens.every((token) => haystack.includes(token));
}

export function SearchPicker<T extends SearchPickerItem>({
  emptyText,
  label,
  items,
  onSelect,
  placeholder,
  renderBadge,
  title,
  value,
}: SearchPickerProps<T>) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const filteredItems = useMemo(
    () => items.filter((item) => matchesQuery(item, query)).slice(0, 12),
    [items, query],
  );

  useEffect(() => {
    if (!isOpen) return;
    const timeout = window.setTimeout(() => inputRef.current?.focus(), 0);
    return () => window.clearTimeout(timeout);
  }, [isOpen]);

  const selectItem = (item: T) => {
    onSelect(item);
    setQuery("");
    setIsOpen(false);
  };

  return (
    <div className="search-picker">
      <label>
        {label}
        <button className="selector-trigger" type="button" onClick={() => setIsOpen(true)}>
          <span>{value}</span>
          <Search size={17} />
        </button>
      </label>

      {isOpen && (
        <div className="picker-backdrop" role="presentation" onMouseDown={() => setIsOpen(false)}>
          <section
            className="picker-popover"
            role="dialog"
            aria-modal="true"
            aria-label={title}
            onMouseDown={(event) => event.stopPropagation()}
          >
            <div className="picker-header">
              <div>
                <span>Base local IronIQ</span>
                <strong>{title}</strong>
              </div>
              <button className="icon-button" type="button" onClick={() => setIsOpen(false)} aria-label="Cerrar buscador">
                <X size={18} />
              </button>
            </div>

            <div className="picker-search">
              <Search size={18} />
              <input
                ref={inputRef}
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder={placeholder}
              />
            </div>

            <div className="picker-results">
              {filteredItems.map((item) => (
                <button className="picker-result" key={item.id} type="button" onClick={() => selectItem(item)}>
                  <div>
                    <strong>{item.title}</strong>
                    <span>{item.subtitle}</span>
                  </div>
                  <div className="picker-result__meta">
                    {renderBadge?.(item)}
                    <small>{item.meta}</small>
                  </div>
                </button>
              ))}
              {filteredItems.length === 0 && <p className="empty-state">{emptyText}</p>}
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
