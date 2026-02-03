// src/pages/Home/Home.jsx
import { useEffect, useMemo, useRef, useState, forwardRef } from "react";
import Sidebar from "../../components/Sidebar/Sidebar";
import Navbar from "../../components/Navbar/Navbar";
import FeaturedBanner from "../../components/FeaturedBanner/FeaturedBanner";
import BookCard from "../../components/BookCard/BookCard";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, ChevronRight, Filter, X } from "lucide-react";
import api from "../../api";

// Normalize backend book data and ensure unique id for React keys
const normalizeBookData = (book, idx) => ({
  id: book.id ?? `book-${idx}`, // fallback if id is missing or duplicated
  title: book.title,
  author: book.author,
  coverImage: book.cover || book.cover_image || book.image,
  category: book.category?.name || "Uncategorized",
  category_id: book.category?.id || null,
  rating: book.average_rating || 0,
  copies_available: book.copies_available || 0,
  status: book.copies_available > 0 ? "Available" : "Stock Out",
});

export default function Home() {
  const [filter, setFilter] = useState(null);
  const [openFilters, setOpenFilters] = useState(false);
  const [recommended, setRecommended] = useState([]);
  const [popular, setPopular] = useState([]);
  const [newCollection, setNewCollection] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState(null);

  const navigate = useNavigate();
  const recRowRef = useRef(null);
  const popRowRef = useRef(null);
  const newColRef = useRef(null);

  // ------------------- Fetch books -------------------
  useEffect(() => {
    const fetchBooks = async () => {
      setLoading(true);
      setErrorMsg(null);
      try {
        const [recRes, popRes, newRes] = await Promise.all([
          api.get("/book/recommended-books"),
          api.get("/book/popular-books"),
          api.get("/book/new-collection"),
        ]);

        setRecommended((recRes.data || []).map((b, idx) => normalizeBookData(b, idx)));
        setPopular((popRes.data || []).map((b, idx) => normalizeBookData(b, idx)));
        setNewCollection((newRes.data || []).map((b, idx) => normalizeBookData(b, idx)));
      } catch (err) {
        console.error(err);
        setErrorMsg("Failed to load book data.");
      } finally {
        setLoading(false);
      }
    };
    fetchBooks();
  }, []);

  // ------------------- Merge all books -------------------
  const allBooks = useMemo(() => {
    const merged = [...recommended, ...popular, ...newCollection];
    // Remove duplicates by id
    return Array.from(new Map(merged.map((b) => [b.id, b])).values());
  }, [recommended, popular, newCollection]);

  // ------------------- Filtered books -------------------
  const filtered = useMemo(() => {
    if (!filter || filter.type === "all") return allBooks;
    if (filter.type === "category") {
      if (filter.id) {
        return allBooks.filter((b) => b.category_id === filter.id);
      } else if (filter.value) {
        const filterName = String(filter.value).toLowerCase();
        return allBooks.filter((b) =>
          (b.category ? String(b.category).toLowerCase() : "") === filterName
        );
      }
    }
    return allBooks;
  }, [filter, allBooks]);

  const getStatus = (b) => (b.copies_available > 0 ? "Available" : "Stock Out");
  const goTo = (id) => navigate(`/book/${id}`);

  if (loading)
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p>Loading books...</p>
      </div>
    );

  if (errorMsg)
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center text-red-500">
        <p>{errorMsg}</p>
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="mx-auto max-w-7xl w-full flex flex-col md:flex-row px-4 sm:px-6 lg:px-8 py-4 gap-4">
        {/* Sidebar */}
        <aside className="hidden md:block w-full md:w-64 lg:w-72 flex-none md:sticky md:top-20">
          <Sidebar onSelect={setFilter} />
        </aside>

        {/* Main content */}
        <main className="flex-1 min-w-0">
          {/* Mobile filter button */}
          <div className="md:hidden mb-3">
            <button
              type="button"
              onClick={() => setOpenFilters(true)}
              className="inline-flex items-center gap-2 border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 rounded-md"
            >
              <Filter className="w-4 h-4" />
              Filters
            </button>
          </div>

          <div className="bg-white p-4 sm:p-6 rounded-lg border border-gray-200 shadow-sm">
            {!filter ? (
              <>
                {recommended.length > 0 && (
                  <CollectionBox
                    title="Recommended"
                    books={recommended}
                    ref={recRowRef}
                    goTo={goTo}
                    getStatus={getStatus}
                  />
                )}
                {popular.length > 0 && (
                  <CollectionBox
                    title="Popular"
                    books={popular}
                    ref={popRowRef}
                    goTo={goTo}
                    getStatus={getStatus}
                  />
                )}
                {newCollection.length > 0 && (
                  <CollectionBox
                    title="New Collection"
                    books={newCollection}
                    ref={newColRef}
                    goTo={goTo}
                    getStatus={getStatus}
                  />
                )}
              </>
            ) : (
              <>
                {/* Filtered books */}
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg sm:text-xl font-semibold text-gray-800">
                    Showing results for:{" "}
                    <span className="text-sky-600">{filter.value || "All"}</span>
                  </h2>
                  <button
                    onClick={() => setFilter(null)}
                    className="text-sm text-gray-600 hover:text-sky-600"
                  >
                    Clear
                  </button>
                </div>

                {filtered.length === 0 ? (
                  <div className="text-gray-500 text-sm">No books found.</div>
                ) : (
                  <div className="flex flex-wrap gap-5">
                    {filtered.map((b, idx) => (
                      <BookCard
                        key={`${b.id}-${idx}`}
                        book={b}
                        status={getStatus(b)}
                        className="w-[calc((100%/3)-16px)]"
                      />
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </main>
      </div>

      {/* Featured Banner */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <FeaturedBanner />
      </div>

      {/* Mobile sidebar */}
      {openFilters && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-[1px]"
            onClick={() => setOpenFilters(false)}
          />
          <div className="absolute left-0 top-0 h-full w-80 max-w-[85%] bg-white shadow-2xl p-4 overflow-y-auto">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-base font-semibold text-gray-800">Filters</h3>
              <button
                aria-label="Close filters"
                onClick={() => setOpenFilters(false)}
                className="p-2 hover:bg-gray-100 rounded"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>
            <Sidebar
              onSelect={(v) => {
                setFilter(v);
                setOpenFilters(false);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

// ----- CollectionBox with horizontal scroll -----
const CollectionBox = forwardRef(({ title, books, goTo, getStatus }, ref) => {
  const scrollRef = ref || useRef(null);

  const scrollByAmount = (dir = 1) => {
    if (!scrollRef.current) return;
    const step = 220 * 3; // scroll approx 3 cards
    scrollRef.current.scrollBy({ left: step * dir, behavior: "smooth" });
  };

  return (
    <div className="mb-8 rounded-lg border border-gray-300 overflow-hidden relative">
      <div className="px-4 py-3 bg-white flex items-center justify-between">
        <h2 className="text-lg sm:text-xl font-semibold text-gray-800">{title}</h2>
        <div className="hidden sm:flex gap-2">
          <button
            onClick={() => scrollByAmount(-1)}
            className="p-2 rounded-md border border-gray-300 bg-white hover:bg-gray-50"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => scrollByAmount(1)}
            className="p-2 rounded-md border border-gray-300 bg-white hover:bg-gray-50"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div
        ref={scrollRef}
        className="overflow-x-auto flex gap-5 p-3 sm:p-4 snap-x snap-mandatory scroll-smooth"
      >
        {books.map((b, idx) => (
          <BookCard
            key={`${b.id}-${idx}`}
            book={b}
            status={getStatus(b)}
            className="flex-shrink-0 w-[calc((100%/3)-16px)]"
          />
        ))}
      </div>

      {/* Mobile buttons */}
      <div className="sm:hidden absolute inset-y-0 left-1 flex items-center">
        <button
          onClick={() => scrollByAmount(-1)}
          className="p-2 rounded-md border border-gray-300 bg-white/90 hover:bg-white shadow"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
      </div>
      <div className="sm:hidden absolute inset-y-0 right-1 flex items-center">
        <button
          onClick={() => scrollByAmount(1)}
          className="p-2 rounded-md border border-gray-300 bg-white/90 hover:bg-white shadow"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
});
