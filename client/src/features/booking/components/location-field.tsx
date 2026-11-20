"use client";
import { useEffect, useId, useRef, useState } from "react";
import { Icon } from "@/components/ui/icon";
import { Button, Input } from "@heroui/react";
import { useLazyRidesControllerLocationsQuery } from "@/store/api/generated/api";
import type { LocationSuggestionDto } from "@/store/api/generated/api";

// One scheduler per journey form; both fields share the same request budget.
export type SearchClock = { current: number };
export function LocationField({
  label,
  selected,
  onSelect,
  clock,
  onEdit,
}: {
  label: string;
  selected: LocationSuggestionDto | null;
  onSelect: (location: LocationSuggestionDto | null) => void;
  clock: SearchClock;
  onEdit: () => void;
}) {
  const id = useId();
  const [text, setText] = useState(selected?.label ?? "");
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const [retry, setRetry] = useState(0);
  const [items, setItems] = useState<LocationSuggestionDto[]>([]);
  const [pending, setPending] = useState(false);
  const [failed, setFailed] = useState(false);
  const [search] = useLazyRidesControllerLocationsQuery();
  const sequence = useRef(0);
  useEffect(() => {
    const version = ++sequence.current;
    if (selected || text.trim().length < 3) return;
    let request: ReturnType<typeof search> | undefined;
    let stopped = false;
    const run = () => {
      const remaining = Math.max(0, clock.current + 1000 - Date.now());
      if (remaining) {
        timer = setTimeout(run, remaining);
        return;
      }
      clock.current = Date.now();
      setPending(true);
      setFailed(false);
      request = search({ text: text.trim() }, true);
      void request
        .unwrap()
        .then((result) => {
          if (!stopped && version === sequence.current) {
            setItems(result.data);
            setActive(-1);
          }
        })
        .catch((error) => {
          if (
            !stopped &&
            error?.name !== "AbortError" &&
            version === sequence.current
          ) {
            setFailed(true);
            setItems([]);
          }
        })
        .finally(() => {
          if (!stopped && version === sequence.current) setPending(false);
        });
    };
    let timer = setTimeout(run, 350);
    return () => {
      stopped = true;
      clearTimeout(timer);
      request?.abort();
    };
  }, [text, selected, retry, search, clock]);
  const choose = (item: LocationSuggestionDto) => {
    setText(item.label);
    onSelect(item);
    setOpen(false);
    setItems([]);
    setPending(false);
    setFailed(false);
  };
  return (
    <div className="location-field">
      <label htmlFor={id} className="ui-field-label"><Icon name="pin" width={16} height={16} />{label}</label>
      <Input
        id={id}
        aria-label={label}
        role="combobox"
        aria-autocomplete="list"
        aria-expanded={open && !selected && text.trim().length >= 3}
        aria-controls={`${id}-suggestions`}
        aria-activedescendant={
          active >= 0 ? `${id}-option-${active}` : undefined
        }
        value={text}
        autoComplete="off"
        aria-describedby={`${id}-help`}
        placeholder={
          label === "Pickup location"
            ? "Where shall we pick you up?"
            : "Where would you like to go?"
        }
        onChange={(event) => {
          setText(event.target.value);
          onSelect(null);
          onEdit();
          setItems([]);
          setActive(-1);
          setPending(false);
          setFailed(false);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        onKeyDown={(event) => {
          if (event.key === "ArrowDown" || event.key === "ArrowUp") {
            event.preventDefault();
            setOpen(true);
            setActive((index) =>
              items.length
                ? (index +
                  (event.key === "ArrowDown" ? 1 : items.length - 1) +
                  items.length) %
                items.length
                : -1,
            );
          } else if (
            event.key === "Enter" &&
            open &&
            active >= 0 &&
            items[active]
          ) {
            event.preventDefault();
            choose(items[active]);
          } else if (event.key === "Escape") {
            setOpen(false);
            setActive(-1);
          }
        }}
      />
      {open && !selected && text.trim().length >= 3 && (
        <div className="location-popover">
          <ul
            id={`${id}-suggestions`}
            role="listbox"
            aria-label={`${label} suggestions`}
          >
            {items.map((item, index) => (
              <li
                role="option"
                aria-selected={index === active}
                id={`${id}-option-${index}`}
                key={item.id}
                onPointerDown={(event) => event.preventDefault()}
                onClick={() => choose(item)}
                className={active === index ? "is-active" : ""}
              >
                {item.label}
              </li>
            ))}
          </ul>
          <div role="status">
            {pending ? (
              "Finding places…"
            ) : failed ? (
              <>
                <span>Locations couldn’t load.</span>
                <Button
                  size="sm"
                  variant="ghost"
                  onPointerDown={(event) => event.preventDefault()}
                  onPress={() => setRetry((value) => value + 1)}
                >
                  Retry
                </Button>
              </>
            ) : items.length ? (
              "Use arrow keys to explore, Enter to select."
            ) : (
              "No locations yet. Try a more specific place."
            )}
          </div>
          <small>OpenStreetMap contributors · OpenRouteService</small>
        </div>
      )}
      <small className="ui-field-help" id={`${id}-help`}>Type at least 3 characters and select a place in India.</small>
      {selected && (
        <span className="location-confirmed">Location selected ✓</span>
      )}
    </div>
  );
}
