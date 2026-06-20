// src/pages/FranchiseResultsList.jsx
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/axiosInstance";
import { FranchiseLayout } from "./FranchiseStudents";

export default function FranchiseResultsList() {
  const navigate = useNavigate();
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState("");
  const [msgType, setMsgType] = useState("info");
  const [search, setSearch] = useState("");

  const fetchResults = async () => {
    setLoading(true);
    setMsg("");
    try {
      const res = await API.get("/franchise/results");
      const arr = Array.isArray(res.data) ? res.data : [];
      setResults(arr);
    } catch (err) {
      console.error("fetch results", err);
      setMsgType("danger");
      setMsg(
        err.response?.data?.message ||
          err.userMessage ||
          "Failed to fetch results"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResults();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this result?")) return;
    setMsg("");
    try {
      await API.delete(`/franchise/results/${id}`);
      setResults((prev) => prev.filter((r) => r._id !== id));
      setMsgType("success");
      setMsg("Result deleted.");
    } catch (err) {
      console.error("delete result", err);
      setMsgType("danger");
      setMsg(err.response?.data?.message || "Failed to delete result");
    }
  };

  const filteredResults = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return results;

    return results.filter((r) => {
      const roll = (r.rollNumber || "").toLowerCase();
      const studentName = (r.student?.name || "").toLowerCase();
      const courseName = (
        r.course?.title ||
        r.course?.name ||
        ""
      ).toLowerCase();
      return (
        roll.includes(q) || studentName.includes(q) || courseName.includes(q)
      );
    });
  }, [results, search]);

  const getGradeColor = (grade) => {
    if (!grade) return "secondary";
    if (grade === "A+" || grade === "A") return "success";
    if (grade === "B+" || grade === "B") return "primary";
    if (grade === "C") return "warning";
    if (grade === "D") return "secondary";
    return "danger";
  };

  return (
    <FranchiseLayout>
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
        <div>
          <h2 className="fw-bold mb-1">Results</h2>
          <small className="text-muted">Manage results for your students</small>
        </div>
        <div className="d-flex flex-wrap gap-2 align-items-center">
          <input
            type="text"
            className="form-control form-control-sm"
            placeholder="Search by roll no / student / course"
            style={{ minWidth: 220 }}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button
            className="btn btn-outline-secondary btn-sm"
            onClick={fetchResults}
            disabled={loading}
          >
            {loading ? "Refreshing…" : "Refresh"}
          </button>
          <button
            className="btn btn-primary btn-sm"
            onClick={() => navigate("/franchise/results/create")}
          >
            Add Result
          </button>
        </div>
      </div>

      {msg && <div className={`alert alert-${msgType}`}>{msg}</div>}

      <div className="card shadow-sm">
        <div className="card-body p-0">
          {loading ? (
            <div className="p-3 text-center">Loading results…</div>
          ) : filteredResults.length === 0 ? (
            <div className="p-3 text-center text-muted">No results found.</div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="table-light">
                  <tr>
                    <th>Student</th>
                    <th>Roll No</th>
                    <th>Course</th>
                    <th className="text-center">Subjects</th>
                    <th className="text-center">Total</th>
                    <th className="text-center">Percentage</th>
                    <th className="text-center">Grade</th>
                    <th className="text-center">Status</th>
                    <th style={{ width: 140 }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredResults.map((r) => (
                    <tr key={r._id}>
                      <td>
                        <div>
                          <strong>{r.student?.name || "N/A"}</strong>
                        </div>
                        {r.student?.courseName && (
                          <small className="text-muted">
                            {r.student.courseName}
                          </small>
                        )}
                      </td>
                      <td>{r.rollNumber}</td>
                      <td>{r.course?.title || r.course?.name || "N/A"}</td>
                      <td className="text-center">
                        <span className="badge bg-secondary">
                          {r.subjects?.length || 0}
                        </span>
                      </td>
                      <td className="text-center">
                        {r.totalObtained}/{r.totalMarks}
                      </td>
                      <td className="text-center">
                        <span
                          className={
                            r.percentage >= 40
                              ? "text-success fw-bold"
                              : "text-danger fw-bold"
                          }
                        >
                          {r.percentage}%
                        </span>
                      </td>
                      <td className="text-center">
                        <span
                          className={`badge bg-${getGradeColor(r.overallGrade)}`}
                        >
                          {r.overallGrade || "N/A"}
                        </span>
                      </td>
                      <td className="text-center">
                        <span
                          className={`badge bg-${
                            r.resultStatus === "pass"
                              ? "success"
                              : r.resultStatus === "fail"
                              ? "danger"
                              : "warning"
                          }`}
                        >
                          {r.resultStatus?.toUpperCase() || "PENDING"}
                        </span>
                      </td>
                      <td>
                        <button
                          className="btn btn-sm btn-outline-primary me-1"
                          onClick={() =>
                            navigate(`/franchise/results/view/${r._id}`)
                          }
                        >
                          View
                        </button>
                        <button
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => handleDelete(r._id)}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
      {/* FIX: removed stray </div> that had no matching opener */}
    </FranchiseLayout>
  );
}