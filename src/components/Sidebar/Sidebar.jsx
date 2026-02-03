import { useState, useEffect } from "react";
import { ChevronDown } from "lucide-react";
import { useNavigate } from "react-router-dom";
import api from "../../api";

const CAT_MAX_H = "max-h-72";

export default function Sidebar({ onSelect }) {
  const navigate = useNavigate();
  const [expandedKey, setExpandedKey] = useState(null);
  const [activeCategory, setActiveCategory] = useState(null);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  useEffect(() => {
    let isMounted = true;
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const res = await api.get("/categories/list");
        if (!isMounted) return;
        setCategories(res.data || []);
      } catch (err) {
        console.error(err);
        if (isMounted) setErrorMsg("Failed to load categories");
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetchCategories();
    return () => { isMounted = false; };
  }, []);

  const handleFilter = (payload) => {
    if (onSelect) onSelect(payload);
    else if (payload) navigate("/all-genres", { state: { filter: payload } });
  };

  const toggleCategory = (cat) => {
    if (activeCategory === cat.id) {
      setActiveCategory(null);
      setExpandedKey(null);
      handleFilter(null);
    } else {
      setActiveCategory(cat.id);
      setExpandedKey(cat.id);
      handleFilter({ type: "category", value: cat.id, name: cat.name });
    }
  };

  const toggleExpand = (catId) => setExpandedKey(expandedKey === catId ? null : catId);

  return (
    <aside className="hidden md:block w-64 bg-white p-4 border-r border-gray-200 sticky top-20 h-[calc(100vh-5rem)] overflow-y-auto space-y-6">
      {loading && <div className="text-sm text-gray-500">Loading categories...</div>}
      {errorMsg && <div className="text-sm text-red-500">{errorMsg}</div>}

      <h3 className="text-base font-semibold mb-2">Categories</h3>
      <div className={`overflow-y-auto ${CAT_MAX_H} pr-1`}>
        <ul className="space-y-1 mb-2">
          <li>
            <button
              onClick={() => handleFilter({ type: "all" })}
              className={`w-full text-left px-2 py-2 rounded text-sm font-medium hover:bg-sky-100 ${
                activeCategory === null ? "text-sky-700" : "text-gray-700"
              }`}
            >
              All Genres
            </button>
          </li>
        </ul>

        <ul className="space-y-1">
          {categories.map(cat => {
            const open = expandedKey === cat.id;
            const checked = activeCategory === cat.id;
            return (
              <li key={cat.id}>
                <div className="flex items-center justify-between px-2 py-2 rounded hover:bg-sky-50">
                  <label className="flex items-center gap-2 flex-1 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleCategory(cat)}
                      className="h-4 w-4 rounded border-gray-300 text-sky-600 focus:ring-sky-500"
                    />
                    <span className={`text-sm ${checked ? "text-sky-700 font-medium" : "text-gray-700"}`}>
                      {cat.name}
                    </span>
                  </label>
                  <span className="text-xs text-gray-400 mr-2">({cat.book_count})</span>
                  <button
                    type="button"
                    onClick={e => { e.stopPropagation(); toggleExpand(cat.id); }}
                    aria-label={open ? "Collapse" : "Expand"}
                    className="p-1 rounded hover:bg-white/60"
                  >
                    <ChevronDown
                      size={16}
                      className={`transition-transform duration-200 ${open ? "rotate-180" : ""} text-gray-500`}
                    />
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </aside>
  );
}
