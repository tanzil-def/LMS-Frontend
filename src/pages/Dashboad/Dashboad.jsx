// src/pages/Dashboard/Dashboard.jsx
import { useEffect, useMemo, useRef, useState } from "react";
import {
  CalendarDays,
  Upload,
  Users,
  BookOpen,
  HelpCircle,
  LogOut,
  Library,
  Layers,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Mail,
} from "lucide-react";
import Sidebar from "../../components/DashboardSidebar/DashboardSidebar";
import api from "../../api";
import { useAuth } from "../../Providers/AuthProvider";

export default function Dashboard() {
  const { user } = useAuth();

  useEffect(() => {
    document.title = user ? `${user.full_name}'s Dashboard` : "Library Dashboard";
  }, [user]);

  const [stats, setStats] = useState({
    borrowed_copies: 0,
    returned_copies: 0,
    pending_copies: 0,
    total_copies: 0,
    available_copies: 0,
  });

  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [overdueBooks, setOverdueBooks] = useState([]);

  // Fetch dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);

        // Fetch stats
        const statsResponse = await api.get("/borrow/stats");
        setStats({
          borrowed_copies: statsResponse.data.activeBorrows,
          returned_copies: statsResponse.data.returnedBorrows,
          pending_copies: statsResponse.data.totalBorrows - statsResponse.data.returnedBorrows,
          total_copies: statsResponse.data.totalBorrows,
          available_copies: statsResponse.data.totalBorrows - statsResponse.data.activeBorrows,
        });

        // Fetch pending requests
        const pendingResponse = await api.get("/borrow/list");
        const pendingRequests = pendingResponse.data.filter(
          request => request.status === "REQUESTED"
        );
        setRequests(pendingRequests);

        // Fetch overdue books
        const overdueResponse = await api.get("/borrow/overdue");
        setOverdueBooks(overdueResponse.data);

      } catch (err) {
        console.error("Error fetching dashboard data:", err);
        setError("Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const dashboardItems = [
    { label: "Borrowed Books", value: stats.borrowed_copies || 0 },
    { label: "Returned Books", value: stats.returned_copies || 0 },
    { label: "Borrows Pending", value: stats.pending_copies || 0 },
    { label: "Total Books", value: stats.total_copies || 0 },
    { label: "Available Books", value: stats.available_copies || 0 },
  ];

  // Confirmation modal state - UPDATED
  const [confirm, setConfirm] = useState({
    open: false,
    type: null,
    index: -1,
    id: null,
    user_id: null,
    book_id: null
  });

  const openConfirm = (type, index, borrow) => {
    setConfirm({
      open: true,
      type,
      index,
      id: borrow.id,
      user_id: borrow.user.id,
      book_id: borrow.book.id,
    });
  };

  const closeConfirm = () => setConfirm({
    open: false,
    type: null,
    index: -1,
    id: null,
    user_id: null,
    book_id: null
  });

  // Toast (2s)
  const [toast, setToast] = useState({ show: false, type: "accept", message: "" });
  const showToast = (type, message) => {
    setToast({ show: true, type, message });
    setTimeout(() => setToast({ show: false, type, message: "" }), 2000);
  };

  // Handle accept/reject borrow request - UPDATED
  const doConfirm = async () => {
    const { type, index, id, user_id, book_id } = confirm;

    if (index < 0 || !id || !user_id || !book_id) {
      console.log("Invalid confirm state:", confirm);
      return;
    }

    try {
      const endpoint = type === "accept" ? "/borrow/accept" : "/borrow/reject";

      // Send user_id and book_id as query parameters
      await api.put(`${endpoint}?user_id=${user_id}&book_id=${book_id}`);

      // Remove from local state
      setRequests(prev => prev.filter((_, i) => i !== index));

      showToast(type, type === "accept" ? "Request accepted successfully" : "Request rejected successfully");

      // Refresh stats
      const statsResponse = await api.get("/borrow/stats");
      setStats({
        borrowed_copies: statsResponse.data.activeBorrows,
        returned_copies: statsResponse.data.returnedBorrows,
        pending_copies: statsResponse.data.pendingBorrows ||
          (statsResponse.data.totalBorrows - statsResponse.data.activeBorrows - statsResponse.data.returnedBorrows),
        total_copies: statsResponse.data.totalBorrows,
        available_copies: statsResponse.data.totalBorrows -
          (statsResponse.data.activeBorrows + statsResponse.data.pendingBorrows || 0),
      });

    } catch (err) {
      console.error("Failed to update borrow status:", err.response?.data || err);
      showToast("error", "Failed to update borrow status");
    }

    closeConfirm();
  };

  // -------------------- WEEKLY LINE CHART --------------------
  const WEEK_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  // Mock data for chart (you can replace with real API data later)
  const series = useMemo(
    () => [
      { name: "Borrowed", color: "stroke-sky-500", dot: "fill-sky-500", values: [20, 55, 62, 28, 24, 68, 64] },
      { name: "Returned", color: "stroke-amber-500", dot: "fill-amber-400", values: [48, 40, 30, 18, 22, 42, 58] },
      { name: "Overdue", color: "stroke-rose-500", dot: "fill-rose-500", values: [10, 30, 55, 58, 26, 40, 88] },
    ],
    []
  );

  // Chart configuration
  const chartBox = { w: 720, h: 200, padX: 36, padY: 20 };
  const allVals = series.flatMap((s) => s.values);
  const yMax = Math.max(1, Math.ceil(Math.max(...allVals) / 10) * 10);
  const yMin = 0;

  const sx = (i) =>
    chartBox.padX + (i * (chartBox.w - chartBox.padX * 2)) / (WEEK_LABELS.length - 1);
  const sy = (v) =>
    chartBox.h - chartBox.padY - ((v - yMin) / (yMax - yMin)) * (chartBox.h - chartBox.padY * 2);

  const makeSmoothPath = (vals) => {
    const pts = vals.map((v, i) => ({ x: sx(i), y: sy(v) }));
    if (!pts.length) return "";
    if (pts.length === 1) return `M ${pts[0].x} ${pts[0].y}`;
    let d = `M ${pts[0].x} ${pts[0].y}`;
    for (let i = 1; i < pts.length; i++) {
      const xc = (pts[i - 1].x + pts[i].x) / 2;
      const yc = (pts[i - 1].y + pts[i].y) / 2;
      d += ` Q ${pts[i - 1].x} ${pts[i - 1].y}, ${xc} ${yc}`;
    }
    d += ` T ${pts[pts.length - 1].x} ${pts[pts.length - 1].y}`;
    return d;
  };

  const paths = series.map((s) => ({ ...s, d: makeSmoothPath(s.values) }));

  // Stroke-draw animation
  const pathRefs = useRef([]);
  useEffect(() => {
    pathRefs.current.forEach((el, i) => {
      if (!el) return;
      const len = el.getTotalLength();
      el.style.strokeDasharray = `${len}`;
      el.style.strokeDashoffset = `${len}`;
      el.getBoundingClientRect();
      el.style.transition = `stroke-dashoffset 900ms ease ${i * 140}ms`;
      el.style.strokeDashoffset = "0";
    });
  }, [paths.map((p) => p.d).join("|")]);

  // "Updated" timestamp
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  const hh = String(now.getHours()).padStart(2, "0");
  const mm = String(now.getMinutes()).padStart(2, "0");
  const ss = String(now.getSeconds()).padStart(2, "0");

  if (loading) {
    return (
      <div className="min-h-screen flex bg-gray-100">
        <Sidebar />
        <main className="flex-1 p-6 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading dashboard...</p>
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex bg-gray-100">
        <Sidebar />
        <main className="flex-1 p-6 flex items-center justify-center">
          <div className="text-center text-red-600">
            <AlertTriangle className="w-16 h-16 mx-auto mb-4" />
            <p className="text-lg">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 px-4 py-2 bg-sky-600 text-white rounded hover:bg-sky-700"
            >
              Retry
            </button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-gray-100">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <main className="flex-1 p-6 space-y-6">
        {/* Top Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {dashboardItems.map((item, i) => (
            <div key={i} className="bg-white rounded-lg shadow p-4 text-center">
              <p className="text-sm text-gray-500">{item.label}</p>
              <p className="text-xl font-bold text-gray-800">{item.value}</p>
            </div>
          ))}
        </div>

        {/* Graph + Overdue */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Check-Out Statistics Chart */}
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold mb-2">Check-Out Statistics</h3>
              <span className="text-xs text-gray-500">Updated {hh}:{mm}:{ss}</span>
            </div>

            <div className="w-full flex justify-center">
              <svg
                viewBox={`0 0 ${chartBox.w} ${chartBox.h}`}
                width="100%"
                height="220"
                className="max-w-full"
                aria-label="Weekly Dynamics Line Chart"
              >
                {/* Grid lines */}
                {[0, 0.25, 0.5, 0.75, 1].map((t, i) => {
                  const y = chartBox.padY + t * (chartBox.h - chartBox.padY * 2);
                  return (
                    <line
                      key={i}
                      x1={chartBox.padX}
                      x2={chartBox.w - chartBox.padX}
                      y1={y}
                      y2={y}
                      className="stroke-gray-200"
                      strokeWidth="1"
                    />
                  );
                })}

                {/* Baseline */}
                <line
                  x1={chartBox.padX}
                  x2={chartBox.w - chartBox.padX}
                  y1={chartBox.h - chartBox.padY}
                  y2={chartBox.h - chartBox.padY}
                  className="stroke-gray-300"
                  strokeWidth="1"
                />

                {/* X labels */}
                {WEEK_LABELS.map((w, i) => (
                  <text
                    key={w}
                    x={sx(i)}
                    y={chartBox.h - 6}
                    textAnchor="middle"
                    className="fill-gray-400"
                    style={{ fontSize: 10 }}
                  >
                    {w}
                  </text>
                ))}

                {/* Animated lines + dots */}
                {paths.map((p, idx) => (
                  <g key={idx}>
                    <path
                      ref={(el) => (pathRefs.current[idx] = el)}
                      d={p.d}
                      className={`${p.color}`}
                      fill="none"
                      strokeWidth="3"
                      strokeLinecap="round"
                    />
                    {p.values.map((v, i) => (
                      <circle
                        key={i}
                        cx={sx(i)}
                        cy={sy(v)}
                        r="3.4"
                        className={`${p.dot} stroke-white`}
                        strokeWidth="1.2"
                      />
                    ))}
                  </g>
                ))}
              </svg>
            </div>

            {/* Weekly legend */}
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-6">
              {series.map((s) => (
                <div key={s.name} className="flex items-start gap-3">
                  <span
                    className={`mt-2 inline-block w-8 h-1.5 rounded-full ${s.color.replace(
                      "stroke",
                      "bg"
                    )}`}
                  />
                  <div>
                    <p className="font-semibold text-gray-800">{s.name}</p>
                    <p className="text-[11px] leading-4 text-gray-400">Mon – Sun</p>
                    <p className="text-[11px] leading-4 text-gray-400">7 pts</p>
                    <p className="text-[11px] leading-4 text-gray-400">Updated weekly</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Overdue's History */}
          <div className="bg-white rounded-lg shadow p-4">
            <h3 className="font-semibold mb-2">Overdue's History</h3>
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left border-b border-gray-200">
                  <th>#</th>
                  <th>Book name</th>
                  <th>User name</th>
                  <th className="text-center">Email</th>
                  <th>Due Date</th>
                </tr>
              </thead>
              <tbody>
                {overdueBooks.slice(0, 5).map((book, index) => (
                  <tr key={book.id} className="border-b border-gray-200">
                    <td>{index + 1}</td>
                    <td className="font-semibold">{book.book?.title || "Unknown Book"}</td>
                    <td>{book.user?.name || "Unknown User"}</td>
                    <td className="text-center">
                      <span className="inline-flex items-center justify-center gap-1 text-gray-700">
                        <Mail size={16} className="text-gray-500" />
                        <span>{book.user?.email || "No email"}</span>
                      </span>
                    </td>
                    <td>{book.due_date ? new Date(book.due_date).toLocaleDateString() : "N/A"}</td>
                  </tr>
                ))}
                {overdueBooks.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-4 text-center text-gray-500">
                      No overdue books
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Borrow Request */}
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-semibold">Borrow Request</h3>
            <Link to="/borrow-requests" className="text-xs text-green-600 hover:underline">
              View All
            </Link>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left border-b border-gray-200">
                <th className="w-10">#</th>
                <th>Book name</th>
                <th>User name</th>
                <th>Borrowed Date</th>
                <th>Return Date</th>
                <th className="text-center">Action</th>
              </tr>
            </thead>
            <tbody>
              {requests.map((request, index) => (
                <tr key={request.id} className="border-b border-gray-200">
                  <td>{index + 1}</td>
                  <td className="font-medium">{request.book?.title || "Unknown Book"}</td>
                  <td>{request.user?.name || request.user?.username || "Unknown User"}</td>
                  <td>{request.borrow_date ? new Date(request.borrow_date).toLocaleDateString() : "N/A"}</td>
                  <td>{request.due_date ? new Date(request.due_date).toLocaleDateString() : "N/A"}</td>
                  <td className="text-center">
                    <div className="flex items-center justify-center gap-2">
                      {/* UPDATED BUTTONS - passing entire request object */}
                      <button
                        type="button"
                        onClick={() => openConfirm("accept", index, request)}
                        className="rounded-md bg-green-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-green-500 focus:outline-none focus:ring-2 focus:ring-green-400"
                      >
                        Accept
                      </button>
                      <button
                        type="button"
                        onClick={() => openConfirm("reject", index, request)}
                        className="rounded-md bg-red-500 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-400 focus:outline-none focus:ring-2 focus:ring-red-300"
                      >
                        Reject
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {requests.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-6 text-center text-gray-500">
                    No pending borrow requests.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </main>

      {/* Confirm Modal */}
      {confirm.open && (
        <div
          className="fixed inset-0 z-50"
          aria-modal="true"
          role="dialog"
          onClick={(e) => {
            if (e.target === e.currentTarget) closeConfirm();
          }}
        >
          <div className="absolute inset-0 bg-black/50 opacity-0 animate-[fadeIn_.2s_ease-out_forwards]" />
          <div className="absolute inset-0 flex items-center justify-center px-4">
            <div className="w-full max-w-md rounded-lg bg-white shadow-lg border border-gray-200 opacity-0 translate-y-2 animate-[popIn_.22s_ease-out_forwards]">
              <div className="px-6 py-5">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5">
                    {confirm.type === "accept" ? (
                      <CheckCircle2 className="text-green-600" size={24} />
                    ) : (
                      <AlertTriangle className="text-amber-500" size={24} />
                    )}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">
                      {confirm.type === "accept"
                        ? "Accept this borrow request?"
                        : "Reject this borrow request?"}
                    </h3>
                    {confirm.index > -1 && requests[confirm.index] && (
                      <p className="mt-1 text-sm text-gray-600">
                        <span className="font-medium">
                          {requests[confirm.index].book?.title}
                        </span>{" "}
                        — {requests[confirm.index].user?.name}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div className="px-6 py-4 bg-white border-t border-gray-200 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={closeConfirm}
                  className="rounded-md px-4 py-2 text-sm font-medium bg-gray-100 text-gray-700 hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={doConfirm}
                  className={`rounded-md px-4 py-2 text-sm font-semibold text-white ${confirm.type === "accept"
                      ? "bg-green-600 hover:bg-green-500 focus:ring-2 focus:ring-green-400"
                      : "bg-red-600 hover:bg-red-500 focus:ring-2 focus:ring-red-400"
                    }`}
                >
                  {confirm.type === "accept" ? "Confirm" : "Reject"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast.show && (
        <div className="fixed bottom-6 right-6 z-[60] pointer-events-none animate-[toastIn_.25s_ease-out]">
          <div className="pointer-events-auto flex items-start gap-3 rounded-xl bg-white shadow-lg ring-1 ring-black/5 px-4 py-3">
            <div className="mt-0.5">
              {toast.type === "accept" ? (
                <CheckCircle2 className="text-green-600" size={22} />
              ) : (
                <XCircle className="text-red-600" size={22} />
              )}
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900">
                {toast.type === "accept" ? "Accepted" : "Rejected"}
              </p>
              <p className="text-xs text-gray-600">{toast.message}</p>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeIn { to { opacity: 1 } }
        @keyframes popIn { to { opacity: 1; transform: translateY(0) } }
        @keyframes toastIn { from { opacity: 0; transform: translateY(8px) scale(.98) } to { opacity: 1; transform: translateY(0) scale(1) } }
      `}</style>
    </div>
  );
}