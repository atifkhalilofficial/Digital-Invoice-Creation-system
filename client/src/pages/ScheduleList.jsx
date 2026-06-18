import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/axios";
import Navbar from "../components/Navbar";

export default function ScheduleList() {
  const navigate = useNavigate();
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    const fetchSchedules = async () => {
      try {
        const res = await API.get("/schedules");
        setSchedules(res.data);
      } catch (err) {
        console.error("Failed to fetch schedules", err);
      } finally {
        setLoading(false);
      }
    };
    fetchSchedules();
  }, []);

  const handleStatusChange = async (id, status) => {
    try {
      await API.put(`/schedules/${id}/status`, { status });
      setSchedules(schedules.map((s) => (s._id === id ? { ...s, status } : s)));
    } catch (err) {
      console.error("Failed to update schedule", err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this schedule?")) return;
    try {
      await API.delete(`/schedules/${id}`);
      setSchedules(schedules.filter((s) => s._id !== id));
    } catch (err) {
      console.error("Failed to delete schedule", err);
    }
  };

  const handleRunNow = async () => {
    setRunning(true);
    try {
      const res = await API.post("/schedules/run");
      alert(`${res.data.message}`);
    } catch (err) {
      console.error("Failed to run schedules", err);
    } finally {
      setRunning(false);
    }
  };

  const statusBadge = (status) => {
    switch (status) {
      case "active":
        return "bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800";
      case "paused":
        return "bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800";
      case "cancelled":
        return "bg-red-50 dark:bg-red-950 text-red-500 dark:text-red-400 border-red-200 dark:border-red-800";
      default:
        return "bg-slate-100 dark:bg-slate-800 text-slate-500 border-slate-200 dark:border-slate-700";
    }
  };

  const frequencyLabel = (f) => {
    if (f === "weekly") return "Every week";
    if (f === "monthly") return "Every month";
    if (f === "quarterly") return "Every 3 months";
    return f;
  };

  return (
    <div className="min-h-screen page-bg">
      <Navbar />

      <div className="max-w-5xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-slate-800 dark:text-white">
              Scheduled Invoices
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Invoices that repeat automatically on a set schedule
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleRunNow}
              disabled={running}
              className="btn-secondary text-sm"
            >
              {running ? "Running..." : "▶ Run Due Now"}
            </button>
            <button
              onClick={() => navigate("/schedules/new")}
              className="btn-primary"
            >
              + New Schedule
            </button>
          </div>
        </div>

        {/* Schedules list */}
        <div className="space-y-4">
          {loading ? (
            <p className="text-slate-500 text-sm">Loading schedules...</p>
          ) : schedules.length === 0 ? (
            <div className="card p-12 text-center">
              <p className="text-slate-500 text-sm mb-4">
                No scheduled invoices yet.
              </p>
              <button
                onClick={() => navigate("/schedules/new")}
                className="btn-primary"
              >
                Create your first schedule
              </button>
            </div>
          ) : (
            schedules.map((schedule) => (
              <div key={schedule._id} className="card p-5">
                <div className="flex items-start justify-between">
                  {/* Left — client and schedule info */}
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-sm font-bold text-slate-800 dark:text-white">
                        {schedule.clientName}
                      </h3>
                      <span
                        className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${statusBadge(schedule.status)}`}
                      >
                        {schedule.status}
                      </span>
                      {schedule.autoSend && (
                        <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
                          Auto-email
                        </span>
                      )}
                    </div>

                    <div className="grid grid-cols-4 gap-4 text-xs text-slate-500 dark:text-slate-400">
                      <div>
                        <p className="font-semibold text-slate-400 uppercase tracking-wide mb-1">
                          Frequency
                        </p>
                        <p className="text-slate-700 dark:text-slate-300 font-medium">
                          {frequencyLabel(schedule.frequency)}
                        </p>
                      </div>
                      <div>
                        <p className="font-semibold text-slate-400 uppercase tracking-wide mb-1">
                          Amount
                        </p>
                        <p className="text-slate-700 dark:text-slate-300 font-medium">
                          $
                          {schedule.items
                            .reduce((sum, item) => sum + item.total, 0)
                            .toFixed(2)}
                        </p>
                      </div>
                      <div>
                        <p className="font-semibold text-slate-400 uppercase tracking-wide mb-1">
                          Next Invoice
                        </p>
                        <p className="text-slate-700 dark:text-slate-300 font-medium">
                          {new Date(schedule.nextRun).toLocaleDateString(
                            "en-US",
                            {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            },
                          )}
                        </p>
                      </div>
                      <div>
                        <p className="font-semibold text-slate-400 uppercase tracking-wide mb-1">
                          Due After
                        </p>
                        <p className="text-slate-700 dark:text-slate-300 font-medium">
                          {schedule.dueDays} days
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Right — action buttons */}
                  <div className="flex gap-2 ml-4 flex-shrink-0">
                    {/* Edit button */}
                    <button
                      onClick={() =>
                        navigate(`/schedules/${schedule._id}/edit`)
                      }
                      className="text-xs px-3 py-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800 hover:bg-indigo-100 transition-colors cursor-pointer"
                    >
                      Edit
                    </button>

                    {schedule.status === "active" && (
                      <button
                        onClick={() =>
                          handleStatusChange(schedule._id, "paused")
                        }
                        className="text-xs px-3 py-1.5 rounded-lg bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800 hover:bg-amber-100 transition-colors cursor-pointer"
                      >
                        Pause
                      </button>
                    )}
                    {schedule.status === "paused" && (
                      <button
                        onClick={() =>
                          handleStatusChange(schedule._id, "active")
                        }
                        className="text-xs px-3 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100 transition-colors cursor-pointer"
                      >
                        Resume
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(schedule._id)}
                      className="text-xs px-3 py-1.5 rounded-lg bg-red-50 dark:bg-red-950 text-red-500 dark:text-red-400 border border-red-200 dark:border-red-900 hover:bg-red-100 transition-colors cursor-pointer"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
