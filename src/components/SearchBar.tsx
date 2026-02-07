import type { ChangeEvent } from "react";

interface SearchBarOption<T extends string> {
  value: T;
  label: string;
}

interface SearchBarProps<T extends string> {
  className?: string;
  inputClassName?: string;
  selectClassName?: string;
  query: string;
  onQueryChange: (value: string) => void;
  field: T;
  onFieldChange: (value: T) => void;
  options: Array<SearchBarOption<T>>;
}

function SearchBar<T extends string>({
  className,
  inputClassName,
  selectClassName,
  query,
  onQueryChange,
  field,
  onFieldChange,
  options,
}: SearchBarProps<T>) {
  function handleQueryChange(event: ChangeEvent<HTMLInputElement>) {
    onQueryChange(event.target.value);
  }

  function handleFieldChange(event: ChangeEvent<HTMLSelectElement>) {
    onFieldChange(event.target.value as T);
  }

  const fieldLabel =
    options.find((option) => option.value === field)?.label ?? field;

  return (
    <section className={className}>
      <input
        className={inputClassName}
        type="text"
        placeholder={`Search by ${fieldLabel}`}
        value={query}
        onChange={handleQueryChange}
      />
      <select
        className={selectClassName}
        value={field}
        onChange={handleFieldChange}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </section>
  );
}

export default SearchBar;
