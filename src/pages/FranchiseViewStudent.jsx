// src/pages/FranchiseViewStudent.jsx
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../api/axiosInstance";
import { FranchiseLayout } from "./FranchiseStudents";

export default function FranchiseViewStudent() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [student, setStudent] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStudent = async () => {
      try {
        const res = await API.get(`/franchise/students/${id}`);
        setStudent(res.data);
      } catch (err) {
        console.error("fetchStudent:", err);
        setError(err.userMessage || "Failed to fetch student details");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchStudent();
    }
  }, [id]);

  if (loading) {
    return (
      <FranchiseLayout>
        <div className="text-center py-5">
          <div className="spinner-border" role="status" />
          <p className="mt-2">Loading student details...</p>
        </div>
      </FranchiseLayout>
    );
  }

  if (error || !student) {
    return (
      <FranchiseLayout>
        <div className="alert alert-danger alert-dismissible fade show" role="alert">
          {error || "Student not found"}
          <button type="button" className="btn-close" onClick={() => navigate("/franchise/students")} aria-label="Close"></button>
        </div>
        <div className="text-center py-5">
          <button className="btn btn-primary" onClick={() => navigate("/franchise/students")}>
            Back to Students List
          </button>
        </div>
      </FranchiseLayout>
    );
  }

  return (
    <FranchiseLayout>
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
        <div>
          <h2 className="fw-bold mb-0">Student Details</h2>
          <small className="text-muted">View student information</small>
        </div>
        <div className="d-flex gap-2">
          <button
            className="btn btn-primary"
            onClick={() => navigate(`/franchise/students/edit/${id}`)}
          >
            Edit Student
          </button>
          <button
            className="btn btn-secondary"
            onClick={() => navigate("/franchise/students")}
          >
            Back to Students
          </button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="alert alert-danger alert-dismissible fade show" role="alert">
          {error}
          <button type="button" className="btn-close" onClick={() => setError("")} aria-label="Close"></button>
        </div>
      )}

      {/* Student Details Card */}
      <div className="card">
        <div className="card-body">
          <div className="row">

            {/* Personal Information */}
            <div className="col-md-6 mb-3">
              <h6 className="border-bottom pb-2 mb-3">Personal Information</h6>
              <p className="mb-1"><strong>Name:</strong> {student.name || "-"}</p>
              <p className="mb-1"><strong>Father's Name:</strong> {student.fatherName || "-"}</p>
              <p className="mb-1"><strong>Mother's Name:</strong> {student.motherName || "-"}</p>
              <p className="mb-1"><strong>Gender:</strong> {student.gender || "-"}</p>
              <p className="mb-1">
                <strong>Date of Birth:</strong>{" "}
                {student.dob ? new Date(student.dob).toLocaleDateString("en-IN") : "-"}
              </p>
            </div>

            {/* Contact Information */}
            <div className="col-md-6 mb-3">
              <h6 className="border-bottom pb-2 mb-3">Contact Information</h6>
              <p className="mb-1"><strong>Email:</strong> {student.email || "-"}</p>
              <p className="mb-1"><strong>Mobile:</strong> {student.mobile || "-"}</p>
              <p className="mb-1"><strong>State:</strong> {student.state || "-"}</p>
              <p className="mb-1"><strong>District:</strong> {student.district || "-"}</p>
              <p className="mb-1"><strong>Address:</strong> {student.address || "-"}</p>
            </div>

            {/* Academic Information */}
            <div className="col-md-6 mb-3">
              <h6 className="border-bottom pb-2 mb-3">Academic Information</h6>
              <p className="mb-1"><strong>Roll Number:</strong> {student.rollNumber || "-"}</p>
              <p className="mb-1"><strong>Enrollment No:</strong> {student.enrollmentNo || student.enrollment || "-"}</p>
              <p className="mb-1">
                <strong>Course:</strong>{" "}
                {student.courseName || (student.courses && student.courses[0]?.courseName) || "-"}
              </p>
              <p className="mb-1"><strong>Exam Passed:</strong> {student.examPassed || "-"}</p>
              <p className="mb-1"><strong>Board:</strong> {student.board || "-"}</p>
              <p className="mb-1"><strong>Marks/Grade:</strong> {student.marksOrGrade || "-"}</p>
            </div>

            {/* Fee Details */}
            <div className="col-md-6 mb-3">
              <h6 className="border-bottom pb-2 mb-3">Fee Details</h6>
              {(() => {
                const fd =
                  student.courses && Array.isArray(student.courses) && student.courses.length > 0
                    ? {
                        fee: student.courses.reduce((sum, c) => sum + (Number(c.feeAmount) || 0), 0),
                        paid: student.courses.reduce((sum, c) => sum + (Number(c.amountPaid) || 0), 0),
                      }
                    : {
                        fee: Number(student.feeAmount) || 0,
                        paid: Number(student.amountPaid) || 0,
                      };
                const pending = fd.fee - fd.paid;
                return (
                  <>
                    <p className="mb-1"><strong>Total Fee:</strong> ₹{fd.fee}</p>
                    <p className="mb-1"><strong>Amount Paid:</strong> ₹{fd.paid}</p>
                    <p className="mb-1">
                      <strong>Pending:</strong>{" "}
                      <span className={pending > 0 ? "text-danger" : "text-success"}>
                        ₹{pending}
                      </span>
                    </p>
                    <p className="mb-1">
                      <strong>Fees Paid:</strong>{" "}
                      {(Array.isArray(student.courses) && student.courses.length > 0)
                        ? (student.courses.every((c) => c.feesPaid) ? "Yes" : "Partial / No")
                        : (student.feesPaid ? "Yes" : "No")}
                    </p>
                  </>
                );
              })()}
            </div>

            {/* Additional Info */}
            <div className="col-12 mb-3">
              <h6 className="border-bottom pb-2 mb-3">Additional Information</h6>
              <p className="mb-1">
                <strong>Session:</strong>{" "}
                {(() => {
                  const start = student.sessionStart || student.courses?.[0]?.sessionStart;
                  const end = student.sessionEnd || student.courses?.[0]?.sessionEnd;
                  if (!start && !end) return "-";
                  return `${start ? new Date(start).toLocaleDateString("en-IN") : "-"} - ${end ? new Date(end).toLocaleDateString("en-IN") : "-"}`;
                })()}
              </p>
              <p className="mb-1">
                <strong>Join Date:</strong>{" "}
                {student.joinDate || student.createdAt
                  ? new Date(student.joinDate || student.createdAt).toLocaleDateString("en-IN")
                  : "-"}
              </p>
            </div>

          </div>
        </div>
      </div>
    </FranchiseLayout>
  );
}