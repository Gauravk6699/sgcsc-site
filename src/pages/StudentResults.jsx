import { useEffect, useState } from "react";
import API from "../api/axiosInstance";

const loadScript = (src) =>
  new Promise((resolve) => {
    if (document.querySelector(`script[src="${src}"]`)) { resolve(); return; }
    const s = document.createElement("script");
    s.src = src;
    s.onload = resolve;
    document.body.appendChild(s);
  });

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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [downloading, setDownloading] = useState(null);

  useEffect(() => {
    API.get("/student-profile/result")
      .then((res) => {
        const data = res.data?.data;
        setResults(Array.isArray(data) ? data : data ? [data] : []);
      })
      .catch(() => setError("Failed to load results. Please try again."))
      .finally(() => setLoading(false));
  }, []);

  const downloadMarksheetPDF = async (result, index) => {
    setDownloading(index);
    try {
      await loadScript("https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js");
      const { jsPDF } = window.jspdf;
      const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

      const W = 210;
      const margin = 15;
      const colW = W - margin * 2;

      // Header background
      doc.setFillColor(0, 86, 163);
      doc.rect(0, 0, W, 28, "F");
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text("SHREE GANPATI COMPUTER AND STUDY CENTRE", W / 2, 11, { align: "center" });
      doc.setFontSize(11);
      doc.setFont("helvetica", "normal");
      doc.text("Raipur Chiraiyakot, Mau — Certificate Programme", W / 2, 19, { align: "center" });
      doc.setFontSize(13);
      doc.setFont("helvetica", "bold");
      doc.text("MARKSHEET / RESULT CARD", W / 2, 26, { align: "center" });

      // Student info box
      let y = 35;
      doc.setTextColor(0, 0, 0);
      doc.setDrawColor(0, 86, 163);
      doc.setLineWidth(0.5);
      doc.rect(margin, y, colW, 36);

      doc.setFontSize(9);
      doc.setFont("helvetica", "bold");
      const leftX = margin + 3;
      const valX = margin + 45;
      const rightLabelX = W / 2 + 3;
      const rightValX = W / 2 + 45;

      const info = [
        ["Student Name", result.studentName || "-", "Roll Number", result.rollNumber || "-"],
        ["Course", result.courseName || result.course?.name || "-", "Total Marks", `${result.totalObtained ?? "-"} / ${result.totalMarks ?? "-"}`],
        ["Percentage", result.percentage != null ? `${result.percentage.toFixed(2)}%` : "-", "Overall Grade", result.overallGrade || "-"],
        ["Result Status", result.resultStatus || "-", "", ""],
      ];

      info.forEach(([l1, v1, l2, v2], i) => {
        const rowY = y + 5 + i * 8;
        doc.setFont("helvetica", "bold");
        doc.text(l1 + ":", leftX, rowY);
        doc.setFont("helvetica", "normal");
        doc.text(String(v1), valX, rowY);
        if (l2) {
          doc.setFont("helvetica", "bold");
          doc.text(l2 + ":", rightLabelX, rowY);
          doc.setFont("helvetica", "normal");
          doc.text(String(v2), rightValX, rowY);
        }
      });

      y += 42;

      // Subjects table header
      const cols = [
        { label: "S.No.", w: 12 },
        { label: "Subject", w: 60 },
        { label: "Theory", w: 22 },
        { label: "Practical", w: 22 },
        { label: "Total", w: 22 },
        { label: "Max", w: 22 },
        { label: "Grade", w: 20 },
      ];
      const totalW = cols.reduce((s, c) => s + c.w, 0);
      const scale = colW / totalW;
      const scaledCols = cols.map((c) => ({ ...c, w: c.w * scale }));

      doc.setFillColor(0, 86, 163);
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(8.5);
      doc.setFont("helvetica", "bold");
      let x = margin;
      scaledCols.forEach((col) => {
        doc.rect(x, y, col.w, 7, "F");
        doc.text(col.label, x + col.w / 2, y + 5, { align: "center" });
        x += col.w;
      });
      y += 7;

      // Rows
      doc.setTextColor(0, 0, 0);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      const subjects = result.subjects || [];
      subjects.forEach((sub, idx) => {
        const bg = idx % 2 === 0 ? [245, 248, 255] : [255, 255, 255];
        doc.setFillColor(...bg);
        doc.rect(margin, y, colW, 7, "F");
        doc.setDrawColor(200, 200, 200);
        doc.rect(margin, y, colW, 7);

        const cells = [
          String(idx + 1),
          sub.subject?.name || sub.subjectName || "-",
          String(sub.theory ?? sub.theoryMarks ?? "-"),
          String(sub.practical ?? sub.practicalMarks ?? "-"),
          String(sub.total ?? sub.combinedMarks ?? "-"),
          String(sub.maxMarks ?? sub.maxCombinedMarks ?? "-"),
          sub.grade || "-",
        ];
        x = margin;
        scaledCols.forEach((col, ci) => {
          const align = ci === 1 ? "left" : "center";
          doc.text(cells[ci], ci === 1 ? x + 2 : x + col.w / 2, y + 5, { align });
          x += col.w;
        });
        y += 7;
      });

      // Totals row
      doc.setFillColor(220, 235, 255);
      doc.rect(margin, y, colW, 7, "F");
      doc.setDrawColor(0, 86, 163);
      doc.rect(margin, y, colW, 7);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8.5);
      x = margin;
      const totals = ["", "TOTAL", "", "", String(result.totalObtained ?? "-"), String(result.totalMarks ?? "-"), ""];
      scaledCols.forEach((col, ci) => {
        doc.text(totals[ci], ci === 1 ? x + 2 : x + col.w / 2, y + 5, { align: ci === 1 ? "left" : "center" });
        x += col.w;
      });
      y += 12;

      // Summary
      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      doc.setDrawColor(0, 86, 163);
      doc.setLineWidth(0.3);
      doc.line(margin, y, W - margin, y);
      y += 6;
      doc.text(`Percentage: ${result.percentage != null ? result.percentage.toFixed(2) + "%" : "-"}`, margin, y);
      doc.text(`Overall Grade: ${result.overallGrade || "-"}`, W / 2, y, { align: "center" });
      doc.text(`Result: ${result.resultStatus || "-"}`, W - margin, y, { align: "right" });

      // Footer
      y = 275;
      doc.setFontSize(7.5);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(100, 100, 100);
      doc.text("This is a computer-generated marksheet.", W / 2, y, { align: "center" });
      doc.text(`Downloaded on: ${new Date().toLocaleDateString("en-IN")}`, W / 2, y + 5, { align: "center" });

      doc.save(`marksheet_${result.rollNumber || "student"}_${index + 1}.pdf`);
    } catch (err) {
      console.error("PDF generation error:", err);
      alert("Failed to generate PDF. Please try again.");
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
        return (
          <div key={index} className="card shadow-sm mb-4">
            <div className="card-header d-flex justify-content-between align-items-center" style={{ background: "#0056a3", color: "#fff" }}>
              <h5 className="mb-0">
                <i className="bi bi-mortarboard me-2"></i>
                {result.courseName || result.course?.name || `Result ${index + 1}`}
              </h5>
              <button
                className="btn btn-light btn-sm"
                onClick={() => downloadMarksheetPDF(result, index)}
                disabled={downloading === index}
              >
                {downloading === index ? (
                  <><span className="spinner-border spinner-border-sm me-1" />Generating...</>
                ) : (
                  <><i className="bi bi-download me-1"></i>Download Marksheet</>
                )}
              </button>
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
