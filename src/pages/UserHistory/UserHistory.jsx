// src/pages/UserHistory/UserHistory.jsx
import { useEffect, useMemo, useState } from "react";
import { Search, Filter, Eye, X, ChevronLeft, ChevronRight } from "lucide-react";
import UserSidebar from "../../components/UserSidebar/UserSidebar";
import api from "../../api";

const badge = (type) => {
  const base = "inline-flex items-center rounded px-2 py-0.5 text-xs font-medium";
  switch (type) {
    case "Borrowed": return `${base} bg-sky-100 text-sky-700`;
    case "Returned": return `${base} bg-green-100 text-green-700`;
    case "Booked": return `${base} bg-amber-100 text-amber-700`;
    case "Donation": return `${base} bg-violet-100 text-violet-700`;
    default: return `${base} bg-gray-100 text-gray-700`;
  }
};

export default function UserHistory() {
  useEffect(() => { document.title = "History"; }, []);

  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [q, setQ] = useState("");
  const [typeFilter, setTypeFilter] = useState("All");

  const [detail, setDetail] = useState(null);

  // Pagination
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 10;

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        setLoading(true);

        const borrowRes = await api.get("/borrow/list");
        const donationRes = await api.get("/donations/list");

        const combined = [
          ...borrowRes.data.map(b => ({
            id: `BOR-${b.id}`,
            book: b.book?.title || "Unknown Book",
            user: b.user?.name || b.user?.username || "Unknown User",
            type: b.returned_date ? "Returned" : (b.borrow_date ? "Borrowed" : "Booked"),
            borrowedOn: b.borrow_date || "",
            dueOn: b.due_date || "",
            returnedOn: b.returned_date || "",
            bookedOn: b.booked_date || "",
            donatedOn: null,
            note: b.note || "",
          })),
          ...donationRes.data.map(d => ({
            id: `DON-${d.id}`,
            book: d.book?.title || "Unknown Book",
            user: d.user?.name || d.user?.username || "Unknown User",
            type: "Donation",
            borrowedOn: "",
            dueOn: "",
            returnedOn: "",
            bookedOn: "",
            donatedOn: d.requested_date || "",
            note: d.note || "",
          })),
        ];

        // Sort by most recent
        combined.sort((a, b) => new Date(b.borrowedOn || b.donatedOn || b.bookedOn) - new Date(a.borrowedOn || a.donatedOn || a.bookedOn));

        setRows(combined);
      } catch (err) {
        console.error(err);
        setError("Failed to fetch history");
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, []);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    return rows.filter(r => {
      const matchesType = typeFilter === "All" || r.type === typeFilter;
      const matchesSearch = !term || [r.id, r.book, r.user, r.type].some(v => String(v).toLowerCase().includes(term));
      return matchesType && matchesSearch;
    });
  }, [rows, q, typeFilter]);

  // Pagination
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const openDetail = (row) => setDetail(row);
  const closeDetail = () => setDetail(null);

  if (loading) return <div className="min-h-screen flex justify-center items-center">Loading...</div>;
  if (error) return <div className="min-h-screen flex justify-center items-center text-red-600">{error}</div>;

  return (
    <div className="min-h-screen flex bg-gray-100">
      <UserSidebar active="history" />

      <main className="flex-1 p-4 md:p-6 space-y-4 md:space-y-6">
        <h1 className="text-lg md:text-2xl font-bold text-gray-800">History</h1>

        <section className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
          <div className="p-3 md:p-4 border-b border-gray-200 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div className="flex items-center gap-2 overflow-x-auto scrollbar-none">
              <Filter size={16} className="text-gray-500" />
              <span className="text-sm text-gray-600 flex-shrink-0">Type:</span>
              {["All", "Borrowed", "Returned", "Booked", "Donation"].map(t => (
                <button
                  key={t}
                  onClick={() => { setTypeFilter(t); setPage(1); }}
                  className={`whitespace-nowrap rounded-full px-3 py-1 text-xs font-medium ring-1 transition ${
                    typeFilter === t ? "bg-sky-50 text-sky-700 ring-sky-200" : "bg-white text-gray-700 ring-gray-200 hover:bg-gray-50"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>

            <div className="relative w-full md:w-80">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"><Search size={18} /></span>
              <input
                value={q}
                onChange={(e) => { setQ(e.target.value); setPage(1); }}
                placeholder="Search by book, user, id…"
                className="w-full rounded-lg border border-gray-300 pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-400"
              />
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-white">
                <tr className="text-left">
                  <th className="py-3 px-4">#</th>
                  <th className="py-3 px-4 min-w-[220px]">Book</th>
                  <th className="py-3 px-4 min-w-[160px]">User</th>
                  <th className="py-3 px-4 min-w-[130px]">Borrowed On</th>
                  <th className="py-3 px-4 min-w-[120px]">Due Date</th>
                  <th className="py-3 px-4 min-w-[130px]">Returned On</th>
                  <th className="py-3 px-4 min-w-[120px]">Type</th>
                  <th className="py-3 px-4 min-w-[140px] text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {paginated.map((r, i) => (
                  <tr key={r.id} className="even:bg-gray-50">
                    <td className="py-3 px-4">{(page-1)*PAGE_SIZE + i + 1}</td>
                    <td className="py-3 px-4 font-medium text-gray-800">{r.book}</td>
                    <td className="py-3 px-4 text-gray-700">{r.user}</td>
                    <td className="py-3 px-4 text-gray-700">{r.borrowedOn || "—"}</td>
                    <td className="py-3 px-4 text-gray-700">{r.dueOn || "—"}</td>
                    <td className="py-3 px-4 text-gray-700">{r.returnedOn || "—"}</td>
                    <td className="py-3 px-4"><span className={badge(r.type)}>{r.type}</span></td>
                    <td className="py-3 px-4 text-center">
                      <button onClick={() => openDetail(r)} className="inline-flex items-center gap-1 rounded-md bg-sky-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-400">
                        <Eye size={14} /> View
                      </button>
                    </td>
                  </tr>
                ))}
                {paginated.length === 0 && (
                  <tr>
                    <td colSpan={8} className="py-6 text-center text-gray-500">No matching history found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex justify-between items-center p-3 border-t border-gray-200">
            <button
              disabled={page === 1}
              onClick={() => setPage(page-1)}
              className="flex items-center gap-1 px-3 py-1.5 rounded-md bg-gray-100 hover:bg-gray-200 disabled:opacity-50"
            >
              <ChevronLeft size={16} /> Previous
            </button>
            <span className="text-sm text-gray-600">{page} / {totalPages || 1}</span>
            <button
              disabled={page === totalPages || totalPages === 0}
              onClick={() => setPage(page+1)}
              className="flex items-center gap-1 px-3 py-1.5 rounded-md bg-gray-100 hover:bg-gray-200 disabled:opacity-50"
            >
              Next <ChevronRight size={16} />
            </button>
          </div>
        </section>
      </main>

      {/* Details Modal */}
      {detail && (
        <div className="fixed inset-0 z-50" aria-modal="true" role="dialog" onClick={(e) => e.target === e.currentTarget && closeDetail()}>
          <div className="absolute inset-0 bg-black/50 opacity-0 animate-[fadeIn_.2s_ease-out_forwards]" />
          <div className="absolute inset-0 flex items-center justify-center px-4">
            <div className="w-full max-w-lg mx-4 rounded-lg bg-white shadow-lg border border-gray-200 opacity-0 translate-y-2 animate-[popIn_.22s_ease-out_forwards]">
              <div className="px-4 md:px-6 py-3 md:py-4 border-b border-gray-200 flex items-center justify-between">
                <h3 className="text-base md:text-lg font-semibold text-gray-800">History Details</h3>
                <button onClick={closeDetail} className="p-1 rounded hover:bg-gray-100" aria-label="Close">
                  <X size={18} />
                </button>
              </div>
              <div className="px-4 md:px-6 py-4 md:py-5 space-y-3 text-sm">
                <div className="flex justify-between gap-4"><span className="text-gray-500">Record ID</span><span className="font-medium text-gray-800">{detail.id}</span></div>
                <div className="flex justify-between gap-4"><span className="text-gray-500">Book</span><span className="font-medium text-gray-800">{detail.book}</span></div>
                <div className="flex justify-between gap-4"><span className="text-gray-500">User</span><span className="font-medium text-gray-800">{detail.user}</span></div>
                <div className="flex justify-between gap-4"><span className="text-gray-500">Type</span><span className={badge(detail.type)}>{detail.type}</span></div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
                  <div className="rounded border border-gray-200 p-3"><p className="text-xs text-gray-500 mb-1">Borrowed On</p><p className="font-medium text-gray-800">{detail.borrowedOn || "—"}</p></div>
                  <div className="rounded border border-gray-200 p-3"><p className="text-xs text-gray-500 mb-1">Due Date</p><p className="font-medium text-gray-800">{detail.dueOn || "—"}</p></div>
                  <div className="rounded border border-gray-200 p-3"><p className="text-xs text-gray-500 mb-1">Returned On</p><p className="font-medium text-gray-800">{detail.returnedOn || "—"}</p></div>
                </div>

                {(detail.bookedOn || detail.donatedOn) && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {detail.bookedOn && <div className="rounded border border-gray-200 p-3"><p className="text-xs text-gray-500 mb-1">Booked On</p><p className="font-medium text-gray-800">{detail.bookedOn}</p></div>}
                    {detail.donatedOn && <div className="rounded border border-gray-200 p-3"><p className="text-xs text-gray-500 mb-1">Donation Requested On</p><p className="font-medium text-gray-800">{detail.donatedOn}</p></div>}
                  </div>
                )}

                {detail.note && (
                  <div className="rounded border border-gray-200 p-3">
                    <p className="text-xs text-gray-500 mb-1">Note</p>
                    <p className="text-gray-800">{detail.note}</p>
                  </div>
                )}
              </div>

              <div className="px-4 md:px-6 py-3 md:py-4 border-t border-gray-200 bg-white flex justify-end">
                <button onClick={closeDetail} className="rounded-md px-4 py-2 text-sm font-medium bg-gray-100 text-gray-700 hover:bg-gray-200">Close</button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeIn { to { opacity: 1 } }
        @keyframes popIn { to { opacity: 1; transform: translateY(0) } }
        .scrollbar-none::-webkit-scrollbar{ display:none }
        .scrollbar-none{ -ms-overflow-style:none; scrollbar-width:none }
      `}</style>
    </div>
  );
}
