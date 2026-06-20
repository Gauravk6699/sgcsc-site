import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/axiosInstance";
import { FranchiseLayout } from "./FranchiseStudents";

function fmtDate(d) {
  if (!d) return "-";
  const dt = new Date(d);
  return Number.isNaN(dt.getTime()) ? "-" : dt.toLocaleDateString("en-IN");
}

export default function FranchiseAdmitCardList() {
  const navigate = useNavigate();
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState("");
  const [msgType, setMsgType] = useState("info");
  const [search, setSearch] = useState("");
  const [downloading, setDownloading] = useState(null);

  const fetchCards = async () => {
    setLoading(true);
    setMsg("");
    try {
      const res = await API.get("/franchise/admit-cards");
      const data = res.data?.data || res.data;
      setCards(Array.isArray(data) ? data : []);
    } catch (err) {
      setMsgType("danger");
      setMsg(err.response?.data?.message || "Failed to fetch admit cards");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCards(); }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this admit card?")) return;
    try {
      await API.delete(`/franchise/admit-cards/${id}`);
      setCards((prev) => prev.filter((c) => (c._id || c.id) !== id));
      setMsgType("success");
      setMsg("Admit card deleted.");
    } catch (err) {
      setMsgType("danger");
      setMsg(err.response?.data?.message || "Failed to delete");
    }
  };

  const handleDownload = async (card) => {
    if (!window.AdmitCardGenerator) {
      setMsgType("danger");
      setMsg("Admit card generator not loaded. Refresh the page and try again.");
      return;
    }
    setDownloading(card._id || card.id);
    setMsg("");
    try {
      await window.AdmitCardGenerator.loadTemplate("/admit-card-template.jpeg");
      await window.AdmitCardGenerator.download({
        rollNumber: card.rollNumber || "",
        studentName: card.studentName || "",
        fatherName: card.fatherName || "",
        motherName: card.motherName || "",
        courseName: card.courseName || "",
        instituteName: card.instituteName || "",
        examCenterAddress: card.examCenterAddress || "",
        examDate: card.examDate ? new Date(card.examDate).toLocaleDateString("en-IN") : "",
        examTime: card.examTime || "",
        reportingTime: card.reportingTime || "",
        examDuration: card.examDuration || "",
        photo: card.photo || "",
      });
    } catch (err) {
      console.error("Admit card download error:", err);
      setMsgType("danger");
      setMsg("Failed to generate admit card PDF.");
    } finally {
      setDownloading(null);
    }
  };

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return cards;
    return cards.filter(
      (c) =>
        (c.studentName || "").toLowerCase().includes(q) ||
        (c.rollNumber || "").toLowerCase().includes(q) ||
        (c.courseName || "").toLowerCase().includes(q)
    );
  }, [cards, search]);

  return (
    <FranchiseLayout>
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
        <div>
          <h2 className="fw-bold mb-1">Admit Cards</h2>
          <small className="text-muted">Generate and manage student admit cards</small>
        </div>
        <div className="d-flex flex-wrap gap-2 align-items-center">
          <input
            type="text"
            className="form-control form-control-sm"
            placeholder="Search by name / roll no / course"
            style={{ minWidth: 220 }}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button className="btn btn-outline-secondary btn-sm" onClick={fetchCards} disabled={loading}>
            {loading ? "Refreshing…" : "Refresh"}
          </button>
          <button className="btn btn-primary btn-sm" onClick={() => navigate("/franchise/admit-cards/create")}>
            Create Admit Card
          </button>
        </div>
      </div>

      {msg && <div className={`alert alert-${msgType}`}>{msg}</div>}

      <div className="card shadow-sm">
        <div className="card-body p-0">
          {loading ? (
            <div className="p-3 text-center">Loading admit cards…</div>
          ) : filtered.length === 0 ? (
            <div className="p-3 text-center text-muted">No admit cards found.</div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="table-light">
                  <tr>
                    <th>Student Name</th>
                    <th>Roll No</th>
                    <th>Course</th>
                    <th>Exam Date</th>
                    <th>Exam Time</th>
                    <th style={{ width: 180 }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((c) => {
                    const id = c._id || c.id;
                    return (
                      <tr key={id}>
                        <td>
                          <strong>{c.studentName}</strong>
                          <div className="small text-muted">{c.fatherName && `S/o ${c.fatherName}`}</div>
                        </td>
                        <td>{c.rollNumber}</td>
                        <td>{c.courseName}</td>
                        <td>{fmtDate(c.examDate)}</td>
                        <td>{c.examTime || "-"}</td>
                        <td>
                          <button
                            className="btn btn-sm btn-outline-success me-1"
                            onClick={() => handleDownload(c)}
                            disabled={downloading === id}
                            title="Download PDF"
                          >
                            {downloading === id ? (
                              <><span className="spinner-border spinner-border-sm me-1" />Generating…</>
                            ) : "Download PDF"}
                          </button>
                          <button
                            className="btn btn-sm btn-outline-primary me-1"
                            onClick={() => navigate(`/franchise/admit-cards/create?id=${id}`)}
                          >
                            Edit
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
