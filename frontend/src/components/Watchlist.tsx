import { useEffect, useRef, useState } from "react";
import { fetchWatchlist, markWatched, searchWatchlist, type WatchlistItem } from "../api";
import { TitleCard } from "./TitleCard";

export function Watchlist() {
  const [page, setPage] = useState(1);
  const [items, setItems] = useState<WatchlistItem[]>([]);
  const [total, setTotal] = useState(0);
  const [filter, setFilter] = useState<"all" | "unwatched" | "watched">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<WatchlistItem[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const size = 5;

  async function load() {
    const data = await fetchWatchlist(page, size);
    setItems(data.items);
    setTotal(data.total);
  }

  useEffect(() => {
    load();
  }, [page]);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    const trimmed = searchQuery.trim();
    if (!trimmed) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }
    setIsSearching(true);
    debounceRef.current = setTimeout(async () => {
      const results = await searchWatchlist(trimmed);
      setSearchResults(results);
      setIsSearching(false);
    }, 250);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [searchQuery]);

  async function toggle(item: WatchlistItem) {
    await markWatched(item.watchlist_id, !item.is_watched);
    if (searchQuery.trim()) {
      const results = await searchWatchlist(searchQuery.trim());
      setSearchResults(results);
    } else {
      load();
    }
  }

  const isInSearchMode = searchQuery.trim().length > 0;

  const baseItems = isInSearchMode ? searchResults : items;
  const visible = baseItems.filter((i) => {
    if (filter === "watched") return i.is_watched === true;
    if (filter === "unwatched") return i.is_watched === false;
    return true;
  });

  const totalPages = Math.max(1, Math.ceil(total / size));

  return (
    <>
      <div className="search-bar">
        <input
          type="search"
          className="search-input"
          placeholder="Search watchlist by title…"
          aria-label="Search watchlist by title"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="tabs" style={{ marginBottom: 14 }}>
        <button className={filter === "all" ? "active" : ""} onClick={() => setFilter("all")}>
          All
        </button>
        <button className={filter === "unwatched" ? "active" : ""} onClick={() => setFilter("unwatched")}>
          Unwatched
        </button>
        <button className={filter === "watched" ? "active" : ""} onClick={() => setFilter("watched")}>
          Watched
        </button>
      </div>

      {isSearching ? (
        <div className="empty">Searching…</div>
      ) : visible.length === 0 ? (
        <div className="empty">
          {isInSearchMode ? `No results for "${searchQuery}".` : "Nothing here."}
        </div>
      ) : (
        <div className="grid">
          {visible.map((item) => (
            <TitleCard
              key={item.watchlist_id}
              item={item}
              watched={!!item.is_watched}
              action={
                <button className="secondary" onClick={() => toggle(item)}>
                  {item.is_watched ? "↺ Unwatch" : "✓ Mark watched"}
                </button>
              }
            />
          ))}
        </div>
      )}

      {!isInSearchMode && (
        <div className="pagination">
          <button
            className="secondary"
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
          >
            ← Prev
          </button>
          <span className="meta">
            Page {page} of {totalPages}
          </span>
          <button
            className="secondary"
            disabled={page >= totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            Next →
          </button>
        </div>
      )}
    </>
  );
}
