import { useEffect, useState } from "react";
import { addToWatchlist, fetchCatalog, type Title } from "../api";
import { TitleCard } from "./TitleCard";

export function Catalog() {
  const [titles, setTitles] = useState<Title[]>([]);
  const [adding, setAdding] = useState<number | null>(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchCatalog().then(setTitles);
  }, []);

  async function handleAdd(id: number) {
    setAdding(id);
    await addToWatchlist(id);
    setAdding(null);
  }

  const filtered = titles.filter((t) =>
    t.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <input
        className="search-input"
        type="search"
        placeholder="Search titles…"
        aria-label="Search catalog titles"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
      {filtered.length === 0 ? (
        <p className="empty">No results</p>
      ) : (
        <div className="grid">
          {filtered.map((t) => (
            <TitleCard
              key={t.id}
              item={t}
              action={
                <button
                  className="primary"
                  disabled={adding === t.id}
                  onClick={() => handleAdd(t.id)}
                >
                  {adding === t.id ? "Adding…" : "+ Watchlist"}
                </button>
              }
            />
          ))}
        </div>
      )}
    </div>
  );
}
