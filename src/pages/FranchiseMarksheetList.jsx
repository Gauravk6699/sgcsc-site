import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/axiosInstance";
import { FranchiseLayout } from "./FranchiseStudents";

function fmtDate(d) {
  if (!d) return "-";
  const dt = new Date(d);
  return Number.isNaN(dt.getTime()) ? "-" : dt.toLocaleDateString("en-IN");
}

let marksheetGenInitialized = false;

export default function FranchiseMarksheetList() {
  const navigate = useNavigate();
  const [marksheets, setMarksheets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState("");
  const [msgType, setMsgType] = useState("info");
  const [search, setSearch] = useState("");
  const [downloading, setDownloading] = useState(null);

  const initGenerator = async () => {
    if (!window.MarksheetGenerator) return null;
    if (!marksheetGenInitialized) {
      try {
        await window.MarksheetGenerator.loadTemplate("/marksheet-template.jpeg");
        marksheetGenInitialized = true;
      } catch (err) {
        console.warn("Marksheet template load warning:", err);
        marksheetGenInitialized = true;
      }
    }
    return window.MarksheetGenerator;
  };

  const fetchMarksheets = async () => {
    setLoading(true);
    setMsg("");
    try {
      const res = await API.get("/franchise/marksheets");
      const data = res.data?.data || res.data;
      setMarksheets(Array.isArray(data) ? data : []);
    } catch (err) {
      setMsgType("danger");
      setMsg(err.response?.data?.message || "Failed to fetch marksheets");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMarksheets();
    initGenerator();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this marksheet?")) return;
    try {
      await API.delete(`/franchise/marksheets/${id}`);
      setMarksheets((prev) => prev.filter((m) => m._id !== id && m.id !== id));
      setMsgType("success");
      setMsg("Marksheet deleted.");
    } catch (err) {
      setMsgType("danger");
      setMsg(err.response?.data?.message || "Failed to delete");
    }
  };

  const handleDownload = async (ms) => {
    const generator = await initGenerator();
    if (!generator) {
      setMsgType("danger");
      setMsg("Marksheet generator not loaded. Refresh the page and try again.");
      return;
    }
    setDownloading(ms._id || ms.id);
    setMsg("");
    try {
      await generator.download({
        enrollmentNo: ms.enrollmentNo,
        studentName: ms.studentName,
        fatherName: ms.fatherName,
        motherName: ms.motherName,
        courseName: ms.courseName,
        instituteName: ms.instituteName,
        rollNumber: ms.rollNumber,
        dob: ms.dob,
        coursePeriodFrom: ms.coursePeriodFrom,
        coursePeriodTo: ms.coursePeriodTo,
        courseDuration: ms.courseDuration,
        dateOfIssue: ms.dateOfIssue,
        subjects: ms.subjects,
        totalTheoryMarks: ms.totalTheoryMarks,
        totalPracticalMarks: ms.totalPracticalMarks,
        totalCombinedMarks: ms.totalCombinedMarks,
        maxTotalMarks: ms.maxTotalMarks,
        percentage: ms.percentage,
        overallGrade: ms.overallGrade,
      });
    } catch (err) {
      console.error("Marksheet download error:", err);
      setMsgType("danger");
      setMsg("Failed to generate marksheet PDF.");
    } finally {
      setDownloading(null);
    }
  };

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return marksheets;
    return marksheets.filter(
      (m) =>
        (m.studentName || "").toLowerCase().includes(q) ||
        (m.enrollmentNo || "").toLowerCase().includes(q) ||
        (m.rollNumber || "").toLowerCase().includes(q) ||
        (m.courseName || "").toLowerCase().includes(q)
    );
  }, [marksheets, search]);

  return (
    <FranchiseLayout>
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
        <div>
          <h2 className="fw-bold mb-1">Marksheets</h2>
          <small className="text-muted">Generate and download marksheets for your students</small>
        </div>
        <div className="d-flex flex-wrap gap-2 align-items-center">
          <input
            type="text"
            className="form-control form-control-sm"
            placeholder="Search by name / enrollment / roll no"
            style={{ minWidth: 220 }}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button className="btn btn-outline-secondary btn-sm" onClick={fetchMarksheets} disabled={loading}>
            {loading ? "Refreshing…" : "Refresh"}
          </button>
          <button className="btn btn-primary btn-sm" onClick={() => navigate("/franchise/marksheets/create")}>
            Create Marksheet
          </button>
        </div>
      </div>

      {msg && <div className={`alert alert-${msgType}`}>{msg}</div>}

      <div className="card shadow-sm">
        <div className="card-body p-0">
          {loading ? (
            <div className="p-3 text-center">Loading marksheets…</div>
          ) : filtered.length === 0 ? (
            <div className="p-3 text-center text-muted">No marksheets found.</div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="table-light">
                  <tr>
                    <th>Student Name</th>
                    <th>Enrollment No</th>
                    <th>Roll No</th>
                    <th>Course</th>
                    <th>Grade</th>
                    <th>%</th>
                    <th>Issue Date</th>
                    <th style={{ width: 180 }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((m) => {
                    const id = m._id || m.id;
                    return (
                      <tr key={id}>
                        <td>
                          <strong>{m.studentName}</strong>
                          <div className="small text-muted">{m.fatherName && `S/o ${m.fatherName}`}</div>
                        </td>
                        <td>{m.enrollmentNo}</td>
                        <td>{m.rollNumber}</td>
                        <td>{m.courseName}</td>
                        <td><span className="badge bg-success">{m.overallGrade}</span></td>
                        <td>{m.percentage != null ? `${Number(m.percentage).toFixed(1)}%` : "-"}</td>
                        <td>{fmtDate(m.dateOfIssue)}</td>
                        <td>
                          <button
                            className="btn btn-sm btn-outline-success me-1"
                            onClick={() => handleDownload(m)}
                            disabled={downloading === id}
                            title="Download PDF"
                          >
                            {downloading === id ? (
                              <><span className="spinner-border spinner-border-sm me-1" />Generating…</>
                            ) : "Download PDF"}
                          </button>
                          <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(id)}>
                            Delete
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </FranchiseLayout>
  );
}
