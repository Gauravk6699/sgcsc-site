import { useEffect, useState } from "react";
import API from "../api/axiosInstance";

const gradeColor = (grade) => {
  if (!grade) return "secondary";
  const g = grade.toUpperCase();
  if (g.startsWith("A")) return "success";
  if (g.startsWith("B")) return "primary";
  if (g.startsWith("C")) return "warning";
  return "danger";
};

export default function StudentResults() {
  const [results, setResults] = useState([]);
  const [marksheets, setMarksheets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [downloading, setDownloading] = useState(null);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [resultRes, msRes] = await Promise.allSettled([
          API.get("/student-profile/result"),
          API.get("/student-profile/marksheet"),
        ]);
        if (resultRes.status === "fulfilled") {
          const data = resultRes.value.data?.data;
          setResults(Array.isArray(data) ? data : data ? [data] : []);
        } else {
          setError("Failed to load results. Please try again.");
        }
        if (msRes.status === "fulfilled" && msRes.value.data?.success) {
          const ms = msRes.value.data.data;
          setMarksheets(Array.isArray(ms) ? ms : ms ? [ms] : []);
        }
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  // Uses the official MarksheetGenerator (same as admin) with actual Marksheet data
  const downloadMarksheetPDF = async (marksheet, index) => {
    setDownloading(index);
    try {
      if (!window.MarksheetGenerator) {
        alert("Marksheet generator not loaded. Please refresh the page.");
        return;
      }
      await window.MarksheetGenerator.loadTemplate("/marksheet-template.jpeg");
      await window.MarksheetGenerator.download(marksheet);
    } catch (err) {
      console.error("Marksheet download error:", err);
      alert("Failed to generate marksheet. Please try again.");
    } finally {
      setDownloading(null);
    }
  };

  if (loading) {
    return (
      <div className="container my-5 text-center">
        <div className="spinner-border text-primary" role="status" />
        <p className="mt-2">Loading results...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container my-5">
        <div className="alert alert-danger">{error}</div>
      </div>
    );
  }

  if (results.length === 0) {
    return (
      <div className="container my-5">
        <h3 className="mb-4">My Results</h3>
        <div className="alert alert-info">
          <i className="bi bi-info-circle me-2"></i>
          No results found. Results will appear here once they are published by your institute.
        </div>
      </div>
    );
  }

  return (
    <div className="container my-5">
      <h3 className="mb-4">My Results</h3>

      {results.map((result, index) => {
        const subjects = result.subjects || [];
        // Match a marksheet to this result by roll number (same student, same index order)
        const matchedMarksheet = marksheets[index] || marksheets[0] || null;
        return (
          <div key={index} className="card shadow-sm mb-4">
            <div className="card-header d-flex justify-content-between align-items-center" style={{ background: "var(--theme-primary)", color: "#fff" }}>
              <h5 className="mb-0">
                <i className="bi bi-mortarboard me-2"></i>
                {result.courseName || result.course?.name || `Result ${index + 1}`}
              </h5>
              {matchedMarksheet ? (
                <button
                  className="btn btn-light btn-sm"
                  onClick={() => downloadMarksheetPDF(matchedMarksheet, index)}
                  disabled={downloading === index}
                >
                  {downloading === index ? (
                    <><span className="spinner-border spinner-border-sm me-1" />Generating...</>
                  ) : (
                    <><i className="bi bi-download me-1"></i>Download Marksheet</>
                  )}
                </button>
              ) : (
                <span className="badge bg-secondary">Marksheet not yet issued</span>
              )}
            </div>

            <div className="card-body">
              {/* Summary row */}
              <div className="row g-3 mb-4">
                <div className="col-6 col-md-3">
                  <div className="border rounded p-2 text-center h-100">
                    <div className="text-muted small">Roll Number</div>
                    <div className="fw-bold">{result.rollNumber || "-"}</div>
                  </div>
                </div>
                <div className="col-6 col-md-3">
                  <div className="border rounded p-2 text-center h-100">
                    <div className="text-muted small">Total Marks</div>
                    <div className="fw-bold">{result.totalObtained ?? "-"} / {result.totalMarks ?? "-"}</div>
                  </div>
                </div>
                <div className="col-6 col-md-3">
                  <div className="border rounded p-2 text-center h-100">
                    <div className="text-muted small">Percentage</div>
                    <div className="fw-bold">{result.percentage != null ? `${result.percentage.toFixed(2)}%` : "-"}</div>
                  </div>
                </div>
                <div className="col-6 col-md-3">
                  <div className="border rounded p-2 text-center h-100">
                    <div className="text-muted small">Overall Grade</div>
                    <div>
                      <span className={`badge bg-${gradeColor(result.overallGrade)} fs-6`}>
                        {result.overallGrade || "-"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Result status */}
              {result.resultStatus && (
                <div className={`alert alert-${result.resultStatus?.toLowerCase() === "pass" ? "success" : "danger"} py-2 mb-3`}>
                  <i className={`bi bi-${result.resultStatus?.toLowerCase() === "pass" ? "check-circle" : "x-circle"} me-2`}></i>
                  <strong>Result:</strong> {result.resultStatus}
                </div>
              )}

              {/* Subjects table */}
              {subjects.length > 0 && (
                <div className="table-responsive">
                  <table className="table table-bordered table-hover mb-0">
                    <thead className="table-light">
                      <tr>
                        <th>#</th>
                        <th>Subject</th>
                        <th className="text-center">Theory</th>
                        <th className="text-center">Practical</th>
                        <th className="text-center">Total</th>
                        <th className="text-center">Max</th>
                        <th className="text-center">Grade</th>
                      </tr>
                    </thead>
                    <tbody>
                      {subjects.map((sub, si) => (
                        <tr key={si}>
                          <td>{si + 1}</td>
                          <td>{sub.subject?.name || sub.subjectName || "-"}</td>
                          <td className="text-center">{sub.theory ?? sub.theoryMarks ?? "-"}</td>
                          <td className="text-center">{sub.practical ?? sub.practicalMarks ?? "-"}</td>
                          <td className="text-center fw-bold">{sub.total ?? sub.combinedMarks ?? "-"}</td>
                          <td className="text-center">{sub.maxMarks ?? sub.maxCombinedMarks ?? "-"}</td>
                          <td className="text-center">
                            <span className={`badge bg-${gradeColor(sub.grade)}`}>{sub.grade || "-"}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="table-light fw-bold">
                      <tr>
                        <td colSpan={4}>Total</td>
                        <td className="text-center">{result.totalObtained ?? "-"}</td>
                        <td className="text-center">{result.totalMarks ?? "-"}</td>
                        <td className="text-center">
                          <span className={`badge bg-${gradeColor(result.overallGrade)}`}>{result.overallGrade || "-"}</span>
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
