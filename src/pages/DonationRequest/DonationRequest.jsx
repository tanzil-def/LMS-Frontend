// src/pages/DonationRequest/DonationRequest.jsx
import { useEffect, useMemo, useState } from "react";
import {
  HandHeart,
  CheckCircle2,
  XCircle,
  Clock,
  Search,
  Filter,
  AlertTriangle,
} from "lucide-react";
import Sidebar from "../../components/DashboardSidebar/DashboardSidebar";
import Pagination from "../../components/Pagination/Pagination";
import api from "../../api";

const PAGE_SIZE = 8;

// Helper: paginate
const paginate = (rows, page, pageSize) => {
  const start = (page - 1) * pageSize;
  return rows.slice(start, start + pageSize);
};

// Status Filter Bar Component
const StatusFilterBar = ({ query, setQuery, bsQuery, setBsQuery, statusFilter, setStatusFilter, bsInvalid }) => (
  <section className="bg-white rounded-lg shadow border border-gray-300">
    <div className="px-4 py-3 flex items-center gap-3 flex-wrap">
      {/* Search by donor/book/author */}
      <div className="relative">
        <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by donor, author, or book"
          className="w-64 md:w-80 rounded border border-gray-300 pl-8 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-400"
        />
      </div>

      {/* Search by BSID */}
      <div className="relative">
        <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
        <input
          value={bsQuery}
          onChange={(e) => setBsQuery(e.target.value)}
          placeholder="Search by BSID (e.g., BS0001)"
          className={`w-56 md:w-64 rounded border pl-8 pr-3 py-2 text-sm focus:outline-none focus:ring-2 ${
            bsInvalid ? "border-rose-300 focus:ring-rose-300" : "border-gray-300 focus:ring-sky-400"
          }`}
        />
      </div>

      {bsInvalid && (
        <span className="inline-flex items-center gap-1 text-xs font-medium text-rose-600">
          <AlertTriangle size={14} /> Unknown user ID format
        </span>
      )}

      {/* Status Filter */}
      <div className="flex items-center gap-2">
        <Filter size={16} className="text-gray-500" />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-400"
        >
          <option value="all">All statuses</option>
          <option value="pending">Pending</option>
          <option value="accepted">Collected</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>
    </div>
  </section>
);

export default function DonationRequest() {
  useEffect(() => { document.title = "Donation Request"; }, []);

  const [items, setItems] = useState([]);
  const [history, setHistory] = useState([]);
  const [query, setQuery] = useState("");
  const [bsQuery, setBsQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Table pagination
  const [pendingPage, setPendingPage] = useState(1);
  const [collectedPage, setCollectedPage] = useState(1);
  const [rejectedPage, setRejectedPage] = useState(1);
  const [historyTablePage, setHistoryTablePage] = useState(1);

  // Top-level page: 1 = Requests, 2 = History
  const [page, setPage] = useState(1);

  const [toast, setToast] = useState({ open: false, type: "accepted", msg: "" });
  const [loading, setLoading] = useState(true);

  // Fetch donations
  useEffect(() => {
    const fetchRequests = async () => {
      try {
        setLoading(true);
        const res = await api.get("/donations/list");
        if (res.data && Array.isArray(res.data)) {
          const mapped = res.data.map(item => ({
            id: item.id,
            userId: item.user?.username || "",
            donorName: item.user?.name || "Unknown",
            bookTitle: item.book_title,
            author: item.author,
            note: item.notes,
            status: item.status.toLowerCase(),
          }));
          setItems(mapped);

          const hist = mapped
            .filter(i => i.status !== "pending")
            .map(i => ({
              id: `${i.id}-${Date.now()}`,
              requestId: i.id,
              action: i.status,
              at: new Date().toISOString(),
              donorName: i.donorName,
              bookTitle: i.bookTitle,
            }));
          setHistory(hist);
        }
      } catch (err) {
        console.error("Failed to fetch donation requests:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchRequests();
  }, []);

  // Stats
  const totalPending = items.filter(i => i.status === "pending").length;
  const totalCollected = items.filter(i => i.status === "accepted").length;
  const totalRejected = items.filter(i => i.status === "rejected").length;

  // Toast helper
  const showToast = (type, msg) => {
    setToast({ open: true, type, msg });
    setTimeout(() => setToast({ open: false, type: "accepted", msg: "" }), 1800);
  };

  // Filter logic
  const bsTrim = bsQuery.trim();
  const bsInvalid = bsTrim && !/^BS\d{4}$/i.test(bsTrim);

  const filtered = useMemo(() => {
    if (bsTrim) {
      const sub = items.filter(i => i.userId?.toUpperCase() === bsTrim.toUpperCase());
      return statusFilter === "all" ? sub : sub.filter(i => i.status === statusFilter);
    }
    const q = query.trim().toLowerCase();
    return items.filter(i => {
      const matchesSearch =
        !q ||
        i.donorName.toLowerCase().includes(q) ||
        (i.author || "").toLowerCase().includes(q) ||
        i.bookTitle.toLowerCase().includes(q) ||
        (i.note || "").toLowerCase().includes(q);
      const matchesStatus = statusFilter === "all" || i.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [items, query, statusFilter, bsTrim]);

  // Rows by status
  const pendingRows = filtered.filter(i => i.status === "pending");
  const collectedRows = filtered.filter(i => i.status === "accepted");
  const rejectedRows = filtered.filter(i => i.status === "rejected");

  // Accept / Reject action
  const actOn = async (id, action) => {
    try {
      const donation = items.find(i => i.id === id);
      if (!donation) return;

      await api.put(`/donations/status/${id}`, { status: action });

      setItems(prev => prev.map(i => (i.id === id ? { ...i, status: action } : i)));
      setHistory(prev => [
        {
          id: `${id}-${Date.now()}`,
          requestId: id,
          action,
          at: new Date().toISOString(),
          donorName: donation.donorName,
          bookTitle: donation.bookTitle,
        },
        ...prev,
      ]);

      showToast(action, `${action === "accepted" ? "Collected" : "Rejected"}: ${donation.donorName}`);
    } catch (err) {
      console.error("Failed to update request:", err);
      alert("Failed to update request. Check console.");
    }
  };

  // Pagination slices
  const pendingSlice = paginate(pendingRows, pendingPage, PAGE_SIZE);
  const collectedSlice = paginate(collectedRows, collectedPage, PAGE_SIZE);
  const rejectedSlice = paginate(rejectedRows, rejectedPage, PAGE_SIZE);
  const historySlice = paginate(history, historyTablePage, PAGE_SIZE);

  // Top-level page switch: Previous / Next / Number input
  const handlePageChange = (val) => {
    if (val === "prev") setPage(p => Math.max(1, p - 1));
    else if (val === "next") setPage(p => Math.min(2, p + 1));
    else if (val === 1 || val === 2) setPage(val);
  };

  // Table Component
  const Table = ({ rows, showActions, pageForCalc }) => (
    <div className="overflow-x-hidden overflow-y-hidden no-scrollbar rounded-lg border border-gray-300">
      <table className="w-full text-sm">
        <thead className="bg-gray-50 text-gray-700 border-b border-gray-300">
          <tr className="text-left">
            <th className="px-4 py-2 whitespace-nowrap">Serial No #</th>
            <th className="px-4 py-2">Donor</th>
            <th className="px-4 py-2">Book / Purpose</th>
            <th className="px-4 py-2">Status</th>
            {showActions && <th className="px-4 py-2 text-right">Action</th>}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td colSpan={showActions ? 5 : 4} className="px-4 py-6 text-center text-gray-500">
                No records found.
              </td>
            </tr>
          ) : (
            rows.map((row, idx) => (
              <tr key={row.id} className="border-t border-gray-300">
                <td className="px-4 py-2 font-medium">{idx + 1 + (pageForCalc - 1) * PAGE_SIZE}</td>
                <td className="px-4 py-2">
                  <div className="font-medium">{row.donorName}</div>
                  {row.userId && <div className="text-[11px] text-gray-500 mt-0.5">BSID: {row.userId}</div>}
                </td>
                <td className="px-4 py-2">
                  <div className="font-medium">{row.bookTitle}</div>
                  <div className="text-xs text-gray-500">Author: {row.author || "Unknown Author"}</div>
                  {row.note && <div className="text-xs text-gray-500">{row.note}</div>}
                </td>
                <td className="px-4 py-2">
                  <span
                    className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold border ${
                      row.status === "accepted"
                        ? "bg-green-50 text-green-700 border-green-200"
                        : row.status === "rejected"
                        ? "bg-rose-50 text-rose-700 border-rose-200"
                        : "bg-amber-50 text-amber-700 border-amber-200"
                    }`}
                  >
                    {row.status === "accepted" ? <CheckCircle2 size={14} /> : row.status === "rejected" ? <XCircle size={14} /> : <Clock size={14} />}
                    {row.status === "accepted" ? "Collected" : row.status === "rejected" ? "Rejected" : "Pending"}
                  </span>
                </td>
                {showActions && (
                  <td className="px-4 py-2">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => actOn(row.id, "accepted")}
                        className="inline-flex items-center gap-1 rounded-md bg-green-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-green-500"
                      >
                        <CheckCircle2 size={14} /> Accept
                      </button>
                      <button
                        onClick={() => actOn(row.id, "rejected")}
                        className="inline-flex items-center gap-1 rounded-md bg-rose-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-rose-500"
                      >
                        <XCircle size={14} /> Reject
                      </button>
                    </div>
                  </td>
                )}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );

  // History Table
  const HistoryTable = ({ rows, pageForCalc }) => (
    <div className="overflow-x-hidden overflow-y-hidden no-scrollbar rounded-lg border border-gray-300">
      <table className="w-full text-sm">
        <thead className="bg-gray-50 text-gray-700 border-b border-gray-300">
          <tr className="text-left">
            <th className="px-4 py-2">Serial No #</th>
            <th className="px-4 py-2">Donor</th>
            <th className="px-4 py-2">Book / Purpose</th>
            <th className="px-4 py-2">Action</th>
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td colSpan={4} className="px-4 py-6 text-center text-gray-500">
                No history yet.
              </td>
            </tr>
          ) : (
            rows.map((h, idx) => (
              <tr key={h.id} className="border-t border-gray-300">
                <td className="px-4 py-2 font-medium">{idx + 1 + (pageForCalc - 1) * PAGE_SIZE}</td>
                <td className="px-4 py-2">{h.donorName}</td>
                <td className="px-4 py-2">{h.bookTitle}</td>
                <td className="px-4 py-2">
                  <span
                    className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold border ${
                      h.action === "accepted"
                        ? "bg-green-50 text-green-700 border-green-200"
                        : "bg-rose-50 text-rose-700 border-rose-200"
                    }`}
                  >
                    {h.action === "accepted" ? <CheckCircle2 size={14} /> : <XCircle size={14} />}
                    {h.action === "accepted" ? "Collected" : "Rejected"}
                  </span>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );

  return (
    <div className="min-h-screen flex bg-gray-100 overflow-hidden">
      <Sidebar />
      <main className="flex-1 p-6 space-y-6 overflow-y-auto no-scrollbar">
        {/* Page Header */}
        <div className="flex items-start justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-gray-800 flex items-center gap-2">
              <HandHeart className="text-sky-600" /> Donation Request
            </h1>
            <p className="text-sm text-gray-600">Accept / Reject commissions and view full history.</p>
          </div>

          {/* Top Page Controls */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => handlePageChange("prev")}
              disabled={page === 1}
              className="px-3 py-1 rounded-md border bg-white text-gray-700 disabled:opacity-50"
            >
              Previous
            </button>
            <input
              type="number"
              min={1}
              max={2}
              value={page}
              onChange={(e) => handlePageChange(Number(e.target.value))}
              className="w-10 text-center border rounded-md"
            />
            <button
              onClick={() => handlePageChange("next")}
              disabled={page === 2}
              className="px-3 py-1 rounded-md border bg-white text-gray-700 disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>

        {/* Filter Bar */}
        <StatusFilterBar
          query={query}
          setQuery={setQuery}
          bsQuery={bsQuery}
          setBsQuery={setBsQuery}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          bsInvalid={bsInvalid}
        />

        {/* Page Content */}
        {page === 1 ? (
          <>
            {/* Stats */}
            <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="flex items-center gap-3 rounded-lg border border-gray-300 bg-white px-4 py-3 shadow-sm">
                <div className="rounded-full p-2 bg-amber-50 text-amber-600"><Clock size={18} /></div>
                <div>
                  <div className="text-xs text-gray-500">Pending</div>
                  <div className="text-lg font-semibold text-gray-900">{totalPending}</div>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-lg border border-gray-300 bg-white px-4 py-3 shadow-sm">
                <div className="rounded-full p-2 bg-green-50 text-green-600"><CheckCircle2 size={18} /></div>
                <div>
                  <div className="text-xs text-gray-500">Collected</div>
                  <div className="text-lg font-semibold text-gray-900">{totalCollected}</div>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-lg border border-gray-300 bg-white px-4 py-3 shadow-sm">
                <div className="rounded-full p-2 bg-rose-50 text-rose-600"><XCircle size={18} /></div>
                <div>
                  <div className="text-xs text-gray-500">Rejected</div>
                  <div className="text-lg font-semibold text-gray-900">{totalRejected}</div>
                </div>
              </div>
            </section>

            {/* Pending Requests */}
            <section className="bg-white rounded-lg shadow border border-gray-300 overflow-hidden">
              <div className="p-4 border-b border-gray-200">
                <h2 className="font-semibold text-gray-800">Pending Requests</h2>
              </div>
              <Table rows={pendingSlice} showActions pageForCalc={pendingPage} />
              <Pagination page={pendingPage} setPage={setPendingPage} total={pendingRows.length} pageSize={PAGE_SIZE} />
            </section>

            {/* Collected Requests */}
            <section className="bg-white rounded-lg shadow border border-gray-300 overflow-hidden">
              <div className="p-4 border-b border-gray-200">
                <h2 className="font-semibold text-gray-800">Collected Requests</h2>
              </div>
              <Table rows={collectedSlice} showActions={false} pageForCalc={collectedPage} />
              <Pagination page={collectedPage} setPage={setCollectedPage} total={collectedRows.length} pageSize={PAGE_SIZE} />
            </section>

            {/* Rejected Requests */}
            <section className="bg-white rounded-lg shadow border border-gray-300 overflow-hidden">
              <div className="p-4 border-b border-gray-200">
                <h2 className="font-semibold text-gray-800">Rejected Requests</h2>
              </div>
              <Table rows={rejectedSlice} showActions={false} pageForCalc={rejectedPage} />
              <Pagination page={rejectedPage} setPage={setRejectedPage} total={rejectedRows.length} pageSize={PAGE_SIZE} />
            </section>
          </>
        ) : (
          // Donation History
          <section className="bg-white rounded-lg shadow border border-gray-300 overflow-hidden">
            <div className="p-4 border-b border-gray-200">
              <h2 className="font-semibold text-gray-800">Donation History</h2>
            </div>
            <HistoryTable rows={historySlice} pageForCalc={historyTablePage} />
            <Pagination page={historyTablePage} setPage={setHistoryTablePage} total={history.length} pageSize={PAGE_SIZE} />
          </section>
        )}
      </main>

      {/* Toast */}
      {toast.open && (
        <div className="fixed bottom-6 right-6 z-50">
          <div className={`rounded-lg px-4 py-3 shadow-lg text-white font-medium flex items-center gap-2 ${toast.type === "accepted" ? "bg-green-600" : "bg-rose-600"}`}>
            {toast.type === "accepted" ? <CheckCircle2 size={18} /> : <XCircle size={18} />}
            {toast.msg}
          </div>
        </div>
      )}
    </div>
  );
}
