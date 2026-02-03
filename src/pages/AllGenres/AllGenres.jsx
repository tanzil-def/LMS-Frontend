import { useNavigate, useLocation } from "react-router-dom";
import { useMemo, useState, useEffect } from "react";
import Sidebar from "../../components/Sidebar/Sidebar";
import BookCard from "../../components/BookCard/BookCard";
import api from "../../api";

const getStockStatus = (title = "") => {
  const t = title.toLowerCase();
  if (t.includes("out")) return "Stock Out";
  if (t.includes("upcoming")) return "Upcoming";
  return "Available";
};

export default function AllGenres() {
  const navigate = useNavigate();
  const location = useLocation();

  const [allBooks, setAllBooks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState(location.state?.filter || null);

  const PAGE_SIZE = 9;
  const [page, setPage] = useState(1);

  // Fetch categories & books
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [catRes, bookRes] = await Promise.all([
          api.get("/categories/list"),
          api.get("/book/list"),
        ]);
        setCategories(catRes.data || []);
        setAllBooks(bookRes.data || []);
      } catch (err) {
        console.error("Failed to fetch data:", err);
        setCategories([]);
        setAllBooks([]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Update filter from location state
  useEffect(() => {
    if (location.state?.filter !== undefined) setFilter(location.state.filter);
  }, [location.state]);

  // Filtered books by category_id
  const filtered = useMemo(() => {
    if (!filter) return allBooks;
    if (filter.type === "all") return allBooks;
    if (filter.type === "category") {
      return allBooks.filter((b) => b.category_id === filter.value);
    }
    return allBooks;
  }, [filter, allBooks]);

  useEffect(() => setPage(1), [filter]);

  const totalPages = Math.max(1, Math.ceil((filtered?.length || 0) / PAGE_SIZE));
  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  const start = (page - 1) * PAGE_SIZE;
  const pageItems = filtered.slice(start, start + PAGE_SIZE);

  const goTo = (id) => navigate(`/book/${id}`);

  if (loading) {
    return <div className="p-4 text-center text-gray-600">Loading books...</div>;
  }

  return (
    <div className="flex min-h-screen bg-white">
      <aside className="hidden md:block w-64 lg:w-72 flex-none md:sticky md:top-20">
        <Sidebar categories={categories} onSelect={setFilter} />
      </aside>

      <main className="flex-1 p-6">
        <h1 className="text-2xl font-bold mb-6">All Genres</h1>

        <div className="rounded-lg border border-gray-300 overflow-hidden bg-white">
          <div className="px-4 py-3 bg-white">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-800">
              Browse Books
            </h2>
          </div>

          <div className="border-t border-gray-200">
            {pageItems.length ? (
              <div className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 justify-items-center">
                  {pageItems.map((b) => (
                    <BookCard
                      key={b.id}
                      book={{
                        ...b,
                        coverImage: b.coverImage || b.cover || "/fallback-book.jpg",
                        status: b.status || getStockStatus(b.title),
                      }}
                      variant="grid"
                      size="scroller"
                      status={b.status || getStockStatus(b.title)}
                      onClick={() => goTo(b.id)}
                      onReadThisBook={() => goTo(b.id)}
                    />
                  ))}
                </div>
              </div>
            ) : (
              <div className="p-4 text-sm text-gray-500">No books found.</div>
            )}

            {filtered.length > 0 && totalPages > 1 && (
              <div className="px-4 pb-4 flex items-center justify-between gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-3 py-1.5 text-sm rounded-md border border-gray-300 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>

                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
                    <button
                      key={n}
                      onClick={() => setPage(n)}
                      className={`w-8 h-8 text-sm rounded-md border ${
                        n === page
                          ? "bg-sky-600 text-white border-sky-600"
                          : "border-gray-300 bg-white hover:bg-gray-50"
                      }`}
                      aria-current={n === page ? "page" : undefined}
                    >
                      {n}
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="px-3 py-1.5 text-sm rounded-md border border-gray-300 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
