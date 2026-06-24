import { useEffect, useState } from "react";
import API from "../api/axiosInstance";

// eslint-disable-next-line no-undef
const AdmitCardGenerator = window.AdmitCardGenerator;

export default function StudentAdmitCard() {
  const [cards, setCards] = useState([]);
  const [templateLoaded, setTemplateLoaded] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAdmitCard = async () => {
      try {
        const res = await API.get("/student-profile/admit-card");
        const data = res.data.data;
        setCards(Array.isArray(data) ? data : data ? [data] : []);
      } catch (err) {
        localStorage.removeItem("student_token");
        window.location.href = "/student-login";
      } finally {
        setLoading(false);
      }
    };

    fetchAdmitCard();
  }, []);

  // Initialize Admit Card Generator on mount
  useEffect(() => {
    const initGenerator = async () => {
      if (typeof AdmitCardGenerator !== 'undefined') {
        try {
          await AdmitCardGenerator.loadTemplate('/admit-card-template.jpeg');
          setTemplateLoaded(true);
        } catch (err) {
          console.warn('Admit card template not found, using fallback');
        }
      }
    };
    initGenerator();
  }, []);

  const handleDownload = (card) => {
    if (typeof AdmitCardGenerator !== 'undefined' && templateLoaded && card) {
      AdmitCardGenerator.download({
        rollNumber: card.rollNumber,
        studentName: card.name,
        fatherName: card.fatherName || '',
        motherName: card.motherName || '',
        courseName: card.course,
        instituteName: card.institute || '',
        examCenterAddress: card.center || '',
        examDate: card.examDate,
        examTime: card.examTime || '',
        reportingTime: card.reportingTime || '',
        examDuration: card.examDuration || '',
        photo: card.photo || null
      });
    } else {
      // Fallback: open print window
      window.print();
    }
  };

  if (loading) {
    return <div className="text-center mt-5">Loading...</div>;
  }

  if (!cards.length) {
    return <p className="text-center mt-5">No admit card available</p>;
  }

  return (
    <div className="container my-5">
      <h3 className="mb-4">Admit Card{cards.length > 1 ? "s" : ""}</h3>

      {cards.map((card, idx) => (
        <div className="card shadow-sm mb-4" key={`${card.rollNumber}-${idx}`}>
          <div className="card-body">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5 className="mb-0">{card.course}</h5>
              <button
                className="btn btn-primary"
                onClick={() => handleDownload(card)}
              >
                <i className="bi bi-download me-2"></i>
                Download PDF
              </button>
            </div>

            <table className="table table-borderless mb-0">
              <tbody>
                <tr>
                  <th width="30%" className="text-muted">Roll Number</th>
                  <td>{card.rollNumber || '-'}</td>
                </tr>
                <tr>
                  <th className="text-muted">Name</th>
                  <td>{card.name}</td>
                </tr>
                {card.fatherName && (
                  <tr>
                    <th className="text-muted">Father's Name</th>
                    <td>{card.fatherName}</td>
                  </tr>
                )}
                {card.motherName && (
                  <tr>
                    <th className="text-muted">Mother's Name</th>
                    <td>{card.motherName}</td>
                  </tr>
                )}
                <tr>
                  <th className="text-muted">Course</th>
                  <td>{card.course}</td>
                </tr>
                {card.institute && (
                  <tr>
                    <th className="text-muted">Institute</th>
                    <td>{card.institute}</td>
                  </tr>
                )}
                {card.center && (
                  <tr>
                    <th className="text-muted">Exam Center</th>
                    <td>{card.center}</td>
                  </tr>
                )}
                <tr>
                  <th className="text-muted">Exam Date</th>
                  <td>{card.examDate}</td>
                </tr>
                {card.examTime && (
                  <tr>
                    <th className="text-muted">Exam Time</th>
                    <td>{card.examTime}</td>
                  </tr>
                )}
                {card.reportingTime && (
                  <tr>
                    <th className="text-muted">Reporting Time</th>
                    <td>{card.reportingTime}</td>
                  </tr>
                )}
                {card.examDuration && (
                  <tr>
                    <th className="text-muted">Duration</th>
                    <td>{card.examDuration}</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      ))}

      {/* Hidden canvas for template-based admit card generation */}
      <canvas id="admitCardCanvas" style={{ display: 'none' }}></canvas>
    </div>
  );
}
