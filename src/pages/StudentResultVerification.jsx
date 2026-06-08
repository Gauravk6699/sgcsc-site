import { useState, useEffect } from "react";
import API from "../api/axiosInstance";

export default function StudentResultVerification() {
  const [rollNumber, setRollNumber] = useState("");
  const [dob, setDob] = useState("");
  const [results, setResults] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [previewUrls, setPreviewUrls] = useState({});
  const [downloading, setDownloading] = useState({});

  const studentToken = localStorage.getItem("student_token");
  const isLoggedIn = !!studentToken;
  const [myResults, setMyResults] = useState([]);
  const [loadingMyResults, setLoadingMyResults] = useState(false);
  const [myPreviewUrls, setMyPreviewUrls] = useState({});
  const [myDownloading, setMyDownloading] = useState({});

  useEffect(() => {
    if (isLoggedIn) fetchMyResults();
  }, [isLoggedIn]);

  const fetchMyResults = async () => {
    setLoadingMyResults(true);
    try {
      const res = await API.get("/student-profile/marksheet");
      if (res.data.success) {
        const data = res.data.data;
        setMyResults(Array.isArray(data) ? data : [data]);
      }
    } catch (err) {
      console.error("Failed to fetch results:", err);
    } finally {
      setLoadingMyResults(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setResults(null);
    setPreviewUrls({});
    setLoading(true);
    try {
      const res = await API.post("/public/result", { rollNumber, dob });
      const data = res.data.data;
      setResults(Array.isArray(data) ? data : [data]);
    } catch {
      setError("No result found. Please check your roll number and date of birth.");
    } finally {
      setLoading(false);
    }
  };

  const buildGenData = (ms) => ({
    rollNumber:       ms.rollNumber       || "",
    studentName:      ms.studentName      || "",
    fatherName:       ms.fatherName       || "",
    motherName:       ms.motherName       || "",
    dob:              ms.dob              || "",
    courseName:       ms.courseName       || "",
    courseDuration:   ms.courseDuration   || "",
    coursePeriodFrom: ms.coursePeriodFrom || "",
    coursePeriodTo:   ms.coursePeriodTo   || "",
    instituteName:    ms.instituteName    || "",
    dateOfIssue:      ms.dateOfIssue      || "",
    totalCombinedMarks: ms.totalCombinedMarks || 0,
    maxTotalMarks:    ms.maxTotalMarks    || 0,
    percentage:       ms.percentage       || 0,
    overallGrade:     ms.overallGrade     || "",
    subjects:         ms.subjects         || [],
  });

  const generatePreview = async (ms, idx, setUrls) => {
    if (!window.MarksheetGenerator) return;
    try {
      await window.MarksheetGenerator.loadTemplate("/marksheet-template.jpeg");
      const dataUrl = await window.MarksheetGenerator.getDataURL(buildGenData(ms));
      setUrls((prev) => ({ ...prev, [idx]: dataUrl }));
    } catch (err) {
      console.error("Marksheet preview error:", err);
    }
  };

  const downloadPDF = async (ms, idx, setDl) => {
    if (!window.MarksheetGenerator) {
      alert("Marksheet generator not loaded. Please refresh the page.");
      return;
    }
    setDl((prev) => ({ ...prev, [idx]: true }));
    try {
      await window.MarksheetGenerator.loadTemplate("/marksheet-template.jpeg");
      await window.MarksheetGenerator.download(buildGenData(ms));
    } catch (err) {
      console.error("Marksheet download error:", err);
      alert("Failed to generate marksheet PDF.");
    } finally {
      setDl((prev) => ({ ...prev, [idx]: false }));
    }
  };

  if (isLoggedIn) {
    return (
      <div className="container py-5">
        <h2 className="text-center mb-4">My Results</h2>
        {loadingMyResults ? (
          <p className="text-center">Loading...</p>
        ) : myResults.length > 0 ? (
          myResults.map((ms, idx) => (
            <MarksheetCard
              key={idx}
              ms={ms}
              idx={idx}
              previewUrl={myPreviewUrls[idx]}
              downloading={myDownloading[idx]}
              onPreview={() => generatePreview(ms, idx, setMyPreviewUrls)}
              onDownload={() => downloadPDF(ms, idx, setMyDownloading)}
            />
          ))
        ) : (
          <div className="alert alert-warning">No results found. Please contact your center.</div>
        )}
      </div>
    );
  }

  return (
    <div className="container py-5">
      <h2 className="text-center mb-4">Result Verification</h2>
      <p className="text-center text-muted mb-4">Enter your roll number to verify and download your marksheet.</p>

      <form onSubmit={handleSubmit} className="card p-4 mx-auto" style={{ maxWidth: 500 }}>
        <div className="mb-3">
          <label className="form-label">Roll Number</label>
          <input
            className="form-control"
            placeholder="e.g. SG124368"
            value={rollNumber}
            onChange={(e) => setRollNumber(e.target.value)}
            required
          />
        </div>
        <div className="mb-3">
          <label className="form-label">Date of Birth</label>
          <input
            type="date"
            className="form-control"
            value={dob}
            onChange={(e) => setDob(e.target.value)}
            required
          />
        </div>
        <button className="btn btn-primary w-100" disabled={loading}>
          {loading ? "Verifying..." : "Verify"}
        </button>
      </form>

      {error && <div className="alert alert-danger mt-3 mx-auto" style={{ maxWidth: 500 }}>{error}</div>}

      {results && results.length > 0 && (
        <div className="mt-4">
          <div className="text-center mb-3">
            <i className="bi bi-check-circle-fill text-success" style={{ fontSize: "2rem" }}></i>
            <p className="mt-1 text-success fw-semibold">
              {results.length} result{results.length > 1 ? "s" : ""} found
            </p>
          </div>
          {results.map((ms, idx) => (
            <MarksheetCard
              key={idx}
              ms={ms}
              idx={idx}
              previewUrl={previewUrls[idx]}
              downloading={downloading[idx]}
              onPreview={() => generatePreview(ms, idx, setPreviewUrls)}
              onDownload={() => downloadPDF(ms, idx, setDownloading)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function MarksheetCard({ ms, idx, previewUrl, downloading, onPreview, onDownload }) {
  const [expanded, setExpanded] = useState(false);

  const handleExpand = () => {
    if (!expanded) onPreview();
    setExpanded((v) => !v);
  };

  const fmt = (d) => d ? new Date(d).toLocaleDateString("en-IN") : "-";

  return (
    <div className="card shadow-sm mb-4 mx-auto" style={{ maxWidth: 900 }}>
      <div className="card-header d-flex justify-content-between align-items-center">
        <div>
          <i className="bi bi-file-earmark-text-fill text-primary me-2"></i>
          <strong>{ms.courseName || `Result ${idx + 1}`}</strong>
          <span className="ms-2 text-muted small">Roll: {ms.rollNumber}</span>
        </div>
        <div className="d-flex gap-2">
          <button className="btn btn-sm btn-outline-secondary" onClick={handleExpand}>
            <i className={`bi bi-${expanded ? "eye-slash" : "eye"} me-1`}></i>
            {expanded ? "Hide" : "View Marksheet"}
          </button>
          <button className="btn btn-sm btn-primary" onClick={onDownload} disabled={downloading}>
            {downloading ? (
              <><span className="spinner-border spinner-border-sm me-1"></span>Generating...</>
            ) : (
              <><i className="bi bi-download me-1"></i>Download PDF</>
            )}
          </button>
        </div>
      </div>

      {/* Rendered marksheet image */}
      {expanded && (
        <div className="card-body p-2 text-center bg-light">
          {previewUrl ? (
            <img
              src={previewUrl}
              alt={`Marksheet ${ms.rollNumber}`}
              style={{ maxWidth: "100%", borderRadius: 4, boxShadow: "0 2px 12px rgba(0,0,0,0.15)" }}
            />
          ) : (
            <div className="py-5 text-muted">
              <div className="spinner-border spinner-border-sm me-2"></div>
              Generating marksheet preview...
            </div>
          )}
        </div>
      )}

      {/* Summary details */}
      <div className="card-body">
        <div className="row g-3">
          <div className="col-md-6">
            <h6 className="border-bottom pb-2 mb-2 text-primary">Student Details</h6>
            <p className="mb-1"><strong>Name:</strong> {ms.studentName || "-"}</p>
            <p className="mb-1"><strong>Father's Name:</strong> {ms.fatherName || "-"}</p>
            <p className="mb-1"><strong>Mother's Name:</strong> {ms.motherName || "-"}</p>
            <p className="mb-1"><strong>Date of Birth:</strong> {fmt(ms.dob)}</p>
            <p className="mb-1"><strong>Roll Number:</strong> {ms.rollNumber || "-"}</p>
            <p className="mb-1"><strong>Enrollment No:</strong> {ms.enrollmentNo || "-"}</p>
          </div>
          <div className="col-md-6">
            <h6 className="border-bottom pb-2 mb-2 text-primary">Course Details</h6>
            <p className="mb-1"><strong>Course:</strong> {ms.courseName || "-"}</p>
            <p className="mb-1"><strong>Duration:</strong> {ms.courseDuration || "-"}</p>
            <p className="mb-1">
              <strong>Period:</strong>{" "}
              {ms.coursePeriodFrom ? fmt(ms.coursePeriodFrom) : "-"} – {ms.coursePeriodTo ? fmt(ms.coursePeriodTo) : "-"}
            </p>
            <p className="mb-1"><strong>Institute:</strong> {ms.instituteName || "-"}</p>
            <p className="mb-1"><strong>Issue Date:</strong> {fmt(ms.dateOfIssue)}</p>
          </div>

          <div className="col-12">
            <h6 className="border-bottom pb-2 mb-2 text-primary">Subject Marks</h6>
            <div className="table-responsive">
              <table className="table table-bordered table-sm mb-0">
                <thead className="table-light">
                  <tr>
                    <th>Subject</th>
                    <th className="text-center">Theory</th>
                    <th className="text-center">Practical</th>
                    <th className="text-center">Total</th>
                    <th className="text-center">Grade</th>
                  </tr>
                </thead>
                <tbody>
                  {ms.subjects?.map((sub, i) => {
                    const combined = (sub.theoryMarks || 0) + (sub.practicalMarks || 0);
                    return (
                      <tr key={i}>
                        <td>{sub.subjectName || `Subject ${i + 1}`}</td>
                        <td className="text-center">{sub.theoryMarks ?? "-"}</td>
                        <td className="text-center">{sub.practicalMarks ?? "-"}</td>
                        <td className="text-center">{combined}</td>
                        <td className="text-center"><span className="badge bg-secondary">{sub.grade || "-"}</span></td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot className="table-light fw-semibold">
                  <tr>
                    <td>Total</td>
                    <td className="text-center">{ms.totalTheoryMarks ?? "-"}</td>
                    <td className="text-center">{ms.totalPracticalMarks ?? "-"}</td>
                    <td className="text-center">{ms.totalCombinedMarks ?? "-"} / {ms.maxTotalMarks ?? "-"}</td>
                    <td className="text-center">
                      <span className="badge bg-primary">{ms.overallGrade || "-"}</span>
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          <div className="col-12">
            <div className="row g-2 mt-1">
              <div className="col-sm-4 text-center">
                <div className="border rounded p-2">
                  <div className="text-muted small">Percentage</div>
                  <div className="fw-bold fs-5">{ms.percentage?.toFixed(1) ?? 0}%</div>
                </div>
              </div>
              <div className="col-sm-4 text-center">
                <div className="border rounded p-2">
                  <div className="text-muted small">Overall Grade</div>
                  <div className="fw-bold fs-5">{ms.overallGrade || "-"}</div>
                </div>
              </div>
              <div className="col-sm-4 text-center">
                <div className="border rounded p-2">
                  <div className="text-muted small">Total Marks</div>
                  <div className="fw-bold fs-5">{ms.totalCombinedMarks ?? 0} / {ms.maxTotalMarks ?? 0}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
