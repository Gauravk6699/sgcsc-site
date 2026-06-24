import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/axiosInstance";
import { FranchiseLayout } from "./FranchiseStudents";

function fmtDate(d) {
  if (!d) return "-";
  const dt = new Date(d);
  return Number.isNaN(dt.getTime()) ? "-" : dt.toLocaleDateString("en-IN");
}

function IDCardViewModal({ show, onClose, card }) {
  if (!show || !card) return null;

  return (
    <div className="modal show d-block" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
      <div className="modal-dialog modal-lg">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">ID Card Details - {card.studentName}</h5>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>
          <div className="modal-body">
            <div className="row">
              <div className="col-md-6">
                <div className="card">
                  <div className="card-header bg-primary text-white">
                    <h6 className="mb-0">Student Information</h6>
                  </div>
                  <div className="card-body">
                    <p><strong>Student Name:</strong> {card.studentName}</p>
                    <p><strong>Father Name:</strong> {card.fatherName}</p>
                    <p><strong>Mother Name:</strong> {card.motherName || "-"}</p>
                    <p><strong>Enrollment No:</strong> {card.enrollmentNo}</p>
                    <p><strong>Date of Birth:</strong> {fmtDate(card.dateOfBirth)}</p>
                    <p><strong>Mobile No:</strong> {card.mobileNo}</p>
                    <p><strong>Contact No:</strong> {card.contactNo || "-"}</p>
                  </div>
                </div>
              </div>
              <div className="col-md-6">
                <div className="card">
                  <div className="card-header bg-success text-white">
                    <h6 className="mb-0">Course & Center Information</h6>
                  </div>
                  <div className="card-body">
                    <p><strong>Course Name:</strong> {card.courseName}</p>
                    <p><strong>Center Name:</strong> {card.centerName}</p>
                    <p><strong>Session From:</strong> {card.sessionFrom || "-"}</p>
                    <p><strong>Session To:</strong> {card.sessionTo || "-"}</p>
                    <p><strong>Center Mobile:</strong> {card.centerMobileNo || "-"}</p>
                    <p><strong>Address:</strong> {card.address}</p>
                  </div>
                </div>
              </div>
            </div>
            {card.photo && (
              <div className="row mt-3">
                <div className="col-12 text-center">
                  <div className="card">
                    <div className="card-header">
                      <h6 className="mb-0">Student Photo</h6>
                    </div>
                    <div className="card-body text-center">
                      <img
                        src={card.photo}
                        alt="Student"
                        className="img-fluid rounded"
                        style={{ maxHeight: "200px" }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function FranchiseIdCardList() {
  const navigate = useNavigate();
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState("");
  const [msgType, setMsgType] = useState("info");
  const [search, setSearch] = useState("");
  const [downloading, setDownloading] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [viewingCard, setViewingCard] = useState(null);

  const fetchCards = async () => {
    setLoading(true);
    setMsg("");
    try {
      const res = await API.get("/franchise/id-cards");
      const data = res.data?.data || res.data;
      setCards(Array.isArray(data) ? data : []);
    } catch (err) {
      setMsgType("danger");
      setMsg(err.response?.data?.message || "Failed to fetch ID cards");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCards(); }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this ID card?")) return;
    try {
      await API.delete(`/franchise/id-cards/${id}`);
      setCards((prev) => prev.filter((c) => c._id !== id));
      setMsgType("success");
      setMsg("ID card deleted.");
    } catch (err) {
      setMsgType("danger");
      setMsg(err.response?.data?.message || "Failed to delete");
    }
  };

  const handleDownload = async (card) => {
    if (!window.IDCardGenerator) {
      setMsgType("danger");
      setMsg("ID card generator not loaded. Refresh the page and try again.");
      return;
    }
    setDownloading(card._id);
    setMsg("");
    try {
      await window.IDCardGenerator.loadTemplate("/id-card-template.jpeg");
      await window.IDCardGenerator.download({
        studentName: card.studentName || "",
        fatherName: card.fatherName || "",
        motherName: card.motherName || "",
        enrollmentNo: card.enrollmentNo || "",
        dateOfBirth: card.dateOfBirth || "",
        contactNo: card.contactNo || "",
        address: card.address || "",
        mobileNo: card.mobileNo || "",
        centerMobileNo: card.centerMobileNo || "",
        courseName: card.courseName || "",
        centerName: card.centerName || "",
        sessionFrom: card.sessionFrom || "",
        sessionTo: card.sessionTo || "",
        photo: card.photo || "",
      });
    } catch (err) {
      console.error("ID card download error:", err);
      setMsgType("danger");
      setMsg("Failed to generate ID card PDF.");
    } finally {
      setDownloading(null);
    }
  };

  const handleView = (card) => {
    setViewingCard(card);
    setShowViewModal(true);
  };

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return cards;
    return cards.filter(
      (c) =>
        (c.studentName || "").toLowerCase().includes(q) ||
        (c.enrollmentNo || "").toLowerCase().includes(q) ||
        (c.courseName || "").toLowerCase().includes(q)
    );
  }, [cards, search]);

  return (
    <FranchiseLayout>
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
        <div>
          <h2 className="fw-bold mb-1">ID Cards</h2>
          <small className="text-muted">Generate and manage student ID cards</small>
        </div>
        <div className="d-flex flex-wrap gap-2 align-items-center">
          <input
            type="text"
            className="form-control form-control-sm"
            placeholder="Search by name / enrollment / course"
            style={{ minWidth: 220 }}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button className="btn btn-outline-secondary btn-sm" onClick={fetchCards} disabled={loading}>
            {loading ? "Refreshing…" : "Refresh"}
          </button>
          <button className="btn btn-primary btn-sm" onClick={() => navigate("/franchise/id-cards/create")}>
            Create ID Card
          </button>
        </div>
      </div>

      {msg && <div className={`alert alert-${msgType}`}>{msg}</div>}

      <div className="card shadow-sm">
        <div className="card-body p-0">
          {loading ? (
            <div className="p-3 text-center">Loading ID cards…</div>
          ) : filtered.length === 0 ? (
            <div className="p-3 text-center text-muted">No ID cards found.</div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="table-light">
                  <tr>
                    <th>Student Name</th>
                    <th>Enrollment No</th>
                    <th>Course</th>
                    <th>Date of Birth</th>
                    <th>Session</th>
                    <th style={{ width: 180 }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((c) => (
                    <tr key={c._id}>
                      <td>
                        <strong>{c.studentName}</strong>
                        <div className="small text-muted">{c.fatherName && `S/o ${c.fatherName}`}</div>
                      </td>
                      <td>{c.enrollmentNo}</td>
                      <td>{c.courseName || "-"}</td>
                      <td>{fmtDate(c.dateOfBirth)}</td>
                      <td>{c.sessionFrom || "-"}{c.sessionTo ? ` – ${c.sessionTo}` : ""}</td>
                      <td>
                        <button
                          className="btn btn-sm btn-outline-primary me-1"
                          onClick={() => handleView(c)}
                          title="View ID Card"
                        >
                          View
                        </button>
                        <button
                          className="btn btn-sm btn-outline-success me-1"
                          onClick={() => handleDownload(c)}
                          disabled={downloading === c._id}
                          title="Download PDF"
                        >
                          {downloading === c._id ? (
                            <><span className="spinner-border spinner-border-sm me-1" />Generating…</>
                          ) : "Download PDF"}
                        </button>
                        <button
                          className="btn btn-sm btn-outline-primary me-1"
                          onClick={() => navigate(`/franchise/id-cards/create?id=${c._id}`)}
                        >
                          Edit
                        </button>
                        <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(c._id)}>
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

      <IDCardViewModal
        show={showViewModal}
        onClose={() => { setShowViewModal(false); setViewingCard(null); }}
        card={viewingCard}
      />
    </FranchiseLayout>
  );
}
