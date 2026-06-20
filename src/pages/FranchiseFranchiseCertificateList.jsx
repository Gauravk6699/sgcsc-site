// src/pages/FranchiseFranchiseCertificateList.jsx
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/axiosInstance";
import Sidebar from "./FranchiseDashboard";

function fmtDate(d) {
  if (!d) return "-";
  const dt = new Date(d);
  if (Number.isNaN(dt.getTime())) return "-";
  return dt.toLocaleDateString("en-IN");
}

export default function FranchiseFranchiseCertificateList() {
  const navigate = useNavigate();
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState("");
  const [msgType, setMsgType] = useState("info");
  const [franchise, setFranchise] = useState(null);

  const [search, setSearch] = useState("");

  // Get franchise info
  useEffect(() => {
    const fetchFranchise = async () => {
      try {
        const res = await API.get("/franchise-profile/me");
        setFranchise(res.data?.data || null);
      } catch (err) {
        console.error("fetchFranchise error:", err);
      }
    };
    fetchFranchise();
  }, []);

  const fetchCertificates = async () => {
    setLoading(true);
    setMsg("");
    try {
      const res = await API.get("/franchise/franchise-certificates");
      const arr = Array.isArray(res.data) ? res.data : [];
      setCertificates(arr);
    } catch (err) {
      console.error("fetch franchise certificates", err);
      setMsgType("danger");
      setMsg(err.response?.data?.message || err.userMessage || "Failed to fetch certificates");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCertificates();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this franchise certificate?")) return;
    setMsg("");
    try {
      await API.delete(`/franchise/franchise-certificates/${id}`);
      setCertificates((prev) => prev.filter((c) => c._id !== id));
      setMsgType("success");
      setMsg("Franchise certificate deleted.");
    } catch (err) {
      console.error("delete franchise certificate", err);
      setMsgType("danger");
      setMsg(err.response?.data?.message || "Failed to delete certificate");
    }
  };

  const filteredCertificates = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return certificates;

    return certificates.filter((c) => {
      const franchiseName = (c.franchiseName || "").toLowerCase();
      const applicantName = (c.applicantName || "").toLowerCase();
      const atcCode = (c.atcCode || "").toLowerCase();
      return franchiseName.includes(q) || applicantName.includes(q) || atcCode.includes(q);
    });
  }, [certificates, search]);

  // Print certificate
  const handlePrint = (certificate) => {
    const printWindow = window.open("", "_blank");
    printWindow.document.write(`
      <html>
        <head>
          <title>Franchise Certificate - ${certificate.atcCode}</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { font-family: 'Times New Roman', serif; padding: 20px; }
            .certificate {
              border: 5px double #1a365d;
              padding: 40px;
              max-width: 800px;
              margin: 0 auto;
              text-align: center;
              background: #fff;
            }
            .certificate h1 {
              font-size: 32px;
              color: #1a365d;
              margin-bottom: 10px;
              text-transform: uppercase;
            }
            .certificate h2 {
              font-size: 24px;
              color: #2d3748;
              margin: 20px 0;
              font-weight: normal;
            }
            .certificate .content {
              font-size: 16px;
              line-height: 2;
              color: #2d3748;
            }
            .certificate .name {
              font-size: 28px;
              font-weight: bold;
              color: #1a365d;
              margin: 20px 0;
              text-decoration: underline;
            }
            .certificate .details {
              margin: 30px 0;
            }
            .certificate .details table {
              width: 100%;
              border-collapse: collapse;
            }
            .certificate .details td {
              padding: 8px;
              text-align: left;
            }
            .certificate .details td:first-child {
              font-weight: bold;
              width: 40%;
            }
            @media print {
              body { padding: 0; }
              .certificate { border: none; }
            }
          </style>
        </head>
        <body>
          <div class="certificate">
            <h1>Franchise Certificate</h1>
            <div class="content">This is to certify that</div>

            <div class="name">${certificate.franchiseName}</div>

            <div class="content">
              has been authorized as a franchise center with the following details:
            </div>

            <div class="details">
              <table>
                <tbody>
                  <tr>
                    <td>Applicant Name:</td>
                    <td>${certificate.applicantName}</td>
                  </tr>
                  <tr>
                    <td>Address:</td>
                    <td>${certificate.address}</td>
                  </tr>
                  <tr>
                    <td>ATC Code:</td>
                    <td>${certificate.atcCode}</td>
                  </tr>
                  <tr>
                    <td>Date of Issue:</td>
                    <td>${fmtDate(certificate.dateOfIssue)}</td>
                  </tr>
                  <tr>
                    <td>Date of Renewal:</td>
                    <td>${fmtDate(certificate.dateOfRenewal)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          <script>
            window.onload = function() {
              window.print();
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div className="d-flex">
      <Sidebar franchise={franchise} />

      <div
        className="flex-grow-1 bg-light min-vh-100"
        style={{ minWidth: 0 }}
      >
        <div className="container-fluid p-4">
          <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
            <div>
              <h2 className="mb-1">Franchise Certificates</h2>
              <p className="text-muted mb-0">Manage franchise authorization certificates</p>
            </div>
            <div className="d-flex flex-wrap gap-2">
              <input
                type="text"
                className="form-control"
                placeholder="Search certificates..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{ minWidth: "180px", width: "250px" }}
              />
              <button
                className="btn btn-outline-secondary"
                onClick={fetchCertificates}
                disabled={loading}
              >
                {loading ? "Loading..." : "Refresh"}
              </button>
              <button
                className="btn btn-primary"
                onClick={() => navigate("/franchise/franchise-certificates/create")}
              >
                Create Certificate
              </button>
            </div>
          </div>

          {msg && (
            <div className={`alert alert-${msgType} alert-dismissible fade show`} role="alert">
              {msg}
              <button
                type="button"
                className="btn-close"
                onClick={() => setMsg("")}
                aria-label="Close"
              ></button>
            </div>
          )}

          <div className="card shadow-sm">
            <div className="card-body p-0">
              {loading ? (
                <div className="p-4 text-center text-muted">
                  <div className="spinner-border" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                  <div className="mt-2">Loading certificates...</div>
                </div>
              ) : filteredCertificates.length === 0 ? (
                <div className="p-4 text-center text-muted">
                  <i className="bi bi-inbox fs-2 mb-2 d-block"></i>
                  No franchise certificates found.
                  <div className="mt-2">
                    <button
                      className="btn btn-primary btn-sm"
                      onClick={() => navigate("/franchise/franchise-certificates/create")}
                    >
                      Create Your First Certificate
                    </button>
                  </div>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover align-middle mb-0">
                    <thead className="table-primary">
                      <tr>
                        <th>Franchise Name</th>
                        <th>Applicant Name</th>
                        <th>ATC Code</th>
                        <th>Address</th>
                        <th>Date of Issue</th>
                        <th>Date of Renewal</th>
                        <th className="text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredCertificates.map((c) => (
                        <tr key={c._id || c.id}>
                          <td>{c.franchiseName}</td>
                          <td>{c.applicantName}</td>
                          <td>{c.atcCode}</td>
                          <td>{c.address}</td>
                          <td>{fmtDate(c.dateOfIssue)}</td>
                          <td>{fmtDate(c.dateOfRenewal)}</td>
                          <td className="text-center">
                            <button
                              className="btn btn-sm btn-outline-info me-2"
                              onClick={() => handlePrint(c)}
                              title="Print Certificate"
                            >
                              View
                            </button>
                            <button
                              className="btn btn-sm btn-outline-warning me-2"
                              onClick={() =>
                                navigate(`/franchise/franchise-certificates/edit/${c._id || c.id}`)
                              }
                              title="Edit Certificate"
                            >
                              Edit
                            </button>
                            <button
                              className="btn btn-sm btn-outline-danger"
                              onClick={() => handleDelete(c._id || c.id)}
                              title="Delete Certificate"
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
        </div>
      </div>
    </div>
  );
}