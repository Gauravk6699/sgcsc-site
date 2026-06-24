// src/pages/FranchiseTypingCertificateCreate.jsx
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import API from "../api/axiosInstance";
import { FranchiseLayout } from "./FranchiseStudents";

// Typing Certificate Generator Global Reference
let typingCertificateGenerator = null;

const initTypingCertificateGenerator = async () => {
  if (typingCertificateGenerator) return typingCertificateGenerator;

  const canvasElement = document.getElementById("typingCertCanvas");
  if (!canvasElement) {
    console.warn("Canvas element not found in DOM yet. Waiting...");
    await new Promise((resolve) => setTimeout(resolve, 500));
  }

  if (window.TypingCertificateGenerator) {
    typingCertificateGenerator = window.TypingCertificateGenerator;
    try {
      await typingCertificateGenerator.loadTemplate(
        "/typing-certificate-template.jpeg"
      );
      typingCertificateGenerator.fetchConfigFromAPI();
      return typingCertificateGenerator;
    } catch (err) {
      throw new Error(`Template required: ${err.message}`);
    }
  }

  return new Promise((resolve, reject) => {
    if (!window.jspdf) {
      const jspdfScript = document.createElement("script");
      jspdfScript.src =
        "https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js";
      jspdfScript.onload = () => {
        const certScript = document.createElement("script");
        certScript.src = "/typing-certificate-generator.js";
        certScript.onload = async () => {
          if (window.TypingCertificateGenerator) {
            typingCertificateGenerator = window.TypingCertificateGenerator;
            try {
              await typingCertificateGenerator.loadTemplate(
                "/typing-certificate-template.jpeg"
              );
              typingCertificateGenerator.fetchConfigFromAPI();
              resolve(typingCertificateGenerator);
            } catch (err) {
              reject(new Error(`Template required: ${err.message}`));
            }
          } else {
            reject(
              new Error("Typing certificate generator script failed to load")
            );
          }
        };
        certScript.onerror = () =>
          reject(
            new Error("Failed to load typing certificate generator script")
          );
        document.body.appendChild(certScript);
      };
      jspdfScript.onerror = () =>
        reject(new Error("Failed to load jspdf script"));
      document.body.appendChild(jspdfScript);
    } else if (!window.TypingCertificateGenerator) {
      const certScript = document.createElement("script");
      certScript.src = "/typing-certificate-generator.js";
      certScript.onload = async () => {
        if (window.TypingCertificateGenerator) {
          typingCertificateGenerator = window.TypingCertificateGenerator;
          try {
            await typingCertificateGenerator.loadTemplate(
              "/typing-certificate-template.jpeg"
            );
            typingCertificateGenerator.fetchConfigFromAPI();
            resolve(typingCertificateGenerator);
          } catch (err) {
            reject(new Error(`Template required: ${err.message}`));
          }
        } else {
          reject(
            new Error("Typing certificate generator script failed to load")
          );
        }
      };
      certScript.onerror = () =>
        reject(
          new Error("Failed to load typing certificate generator script")
        );
      document.body.appendChild(certScript);
    }
  });
};

export default function FranchiseTypingCertificateCreate() {
  const navigate = useNavigate();
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const certificateId = params.get("id");
  const isEditMode = Boolean(certificateId);

  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    studentName: "",
    fatherHusbandName: "",
    motherName: "",
    enrollmentNumber: "",
    computerTyping: "",
    certificateNo: "",
    dateOfIssue: "",
    sessionFrom: "",
    sessionTo: "",
    grade: "",
    studyCentre: "",
    wordsPerMinute: "",
  });

  // Load existing certificate for edit
  useEffect(() => {
    if (!isEditMode || !certificateId) return;

    const fetchCertificate = async () => {
      setLoading(true);
      try {
        const res = await API.get(`/franchise/typing-certificates/${certificateId}`);
        const cert = res.data;
        if (cert) {
          setFormData({
            studentName: cert.studentName || "",
            fatherHusbandName: cert.fatherHusbandName || "",
            motherName: cert.motherName || "",
            enrollmentNumber: cert.enrollmentNumber || "",
            computerTyping: cert.computerTyping || "",
            certificateNo: cert.certificateNo || "",
            dateOfIssue: cert.dateOfIssue
              ? new Date(cert.dateOfIssue).toISOString().slice(0, 10)
              : "",
            sessionFrom: cert.sessionFrom || "",
            sessionTo: cert.sessionTo || "",
            grade: cert.grade || "",
            studyCentre: cert.studyCentre || "",
            wordsPerMinute: cert.wordsPerMinute || "",
          });
        }
      } catch (err) {
        console.error("Failed to load typing certificate:", err);
        setError("Failed to load typing certificate");
      } finally {
        setLoading(false);
      }
    };
    fetchCertificate();
  }, [isEditMode, certificateId]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    if (!formData.studentName.trim()) {
      setError("Student Name is required");
      return false;
    }
    if (!formData.fatherHusbandName.trim()) {
      setError("Father/Husband Name is required");
      return false;
    }
    if (!formData.motherName.trim()) {
      setError("Mother Name is required");
      return false;
    }
    if (!formData.enrollmentNumber.trim()) {
      setError("Enrollment Number is required");
      return false;
    }
    if (!formData.computerTyping.trim()) {
      setError("Computer Typing is required");
      return false;
    }
    if (!formData.certificateNo.trim()) {
      setError("Certificate Number is required");
      return false;
    }
    if (!formData.dateOfIssue) {
      setError("Date of Issue is required");
      return false;
    }
    if (!formData.sessionFrom.trim()) {
      setError("Session From is required");
      return false;
    }
    if (!formData.sessionTo.trim()) {
      setError("Session To is required");
      return false;
    }
    if (!formData.grade.trim()) {
      setError("Grade is required");
      return false;
    }
    if (!formData.studyCentre.trim()) {
      setError("Study Centre is required");
      return false;
    }
    if (!formData.wordsPerMinute.trim()) {
      setError("Words Per Minute is required");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!validateForm()) return;

    setSaving(true);

    try {
      let certificateImage = null;
      try {
        await initTypingCertificateGenerator();
      } catch (genErr) {
        setError(`Certificate generation failed: ${genErr.message}`);
        setSaving(false);
        return;
      }

      const certificateData = {
        studentName: formData.studentName.trim(),
        fatherHusbandName: formData.fatherHusbandName.trim(),
        motherName: formData.motherName.trim(),
        enrollmentNumber: formData.enrollmentNumber.trim(),
        computerTyping: formData.computerTyping.trim(),
        certificateNo: formData.certificateNo.trim(),
        dateOfIssue: formData.dateOfIssue,
        sessionFrom: formData.sessionFrom.trim(),
        sessionTo: formData.sessionTo.trim(),
        grade: formData.grade.trim(),
        studyCentre: formData.studyCentre.trim(),
        wordsPerMinute: formData.wordsPerMinute.trim(),
      };

      if (typingCertificateGenerator) {
        try {
          certificateData.certificateImage = certificateImage =
            await typingCertificateGenerator.getDataURL(certificateData);
        } catch (imgErr) {
          console.error("Could not generate typing certificate image:", imgErr);
          setError(
            "Failed to generate certificate image. Please ensure the JPG template is properly configured."
          );
          setSaving(false);
          return;
        }
      } else {
        setError(
          "Certificate generator not available. Please refresh the page."
        );
        setSaving(false);
        return;
      }

      const payload = { ...certificateData, certificateImage };

      if (isEditMode && certificateId) {
        await API.put(`/franchise/typing-certificates/${certificateId}`, payload);
      } else {
        await API.post("/franchise/typing-certificates", payload);
      }

      navigate("/franchise/typing-certificates", {
        state: {
          message: isEditMode
            ? "Typing certificate updated successfully!"
            : "Typing certificate created successfully!",
        },
      });
    } catch (err) {
      console.error("Save typing certificate error:", err);
      setError(err.response?.data?.message || "Failed to save certificate");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <FranchiseLayout>
        <div className="d-flex justify-content-center align-items-center py-5">
          <div className="spinner-border text-primary me-2" />
          Loading…
        </div>
      </FranchiseLayout>
    );
  }

  return (
    <FranchiseLayout>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="mb-1">
            {isEditMode ? "Edit Typing Certificate" : "Create Typing Certificate"}
          </h2>
          <p className="text-muted mb-0">
            Generate certificate for computer typing training completion
          </p>
        </div>
        <button
          className="btn btn-outline-secondary"
          onClick={() => navigate("/franchise/typing-certificates")}
        >
          <i className="bi bi-arrow-left me-1"></i>
          Back to List
        </button>
      </div>

      <div className="row justify-content-center">
        <div className="col-lg-8">
          <div className="card shadow-sm">
            <div className="card-body p-4">
              {error && (
                <div
                  className="alert alert-danger alert-dismissible fade show"
                  role="alert"
                >
                  <i className="bi bi-exclamation-triangle-fill me-2"></i>
                  {error}
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => setError("")}
                    aria-label="Close"
                  ></button>
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label">
                      Student Name <span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      name="studentName"
                      value={formData.studentName}
                      onChange={handleInputChange}
                      placeholder="Enter student full name"
                      required
                    />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label">
                      Father/Husband Name <span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      name="fatherHusbandName"
                      value={formData.fatherHusbandName}
                      onChange={handleInputChange}
                      placeholder="Enter father or husband name"
                      required
                    />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label">
                      Mother Name <span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      name="motherName"
                      value={formData.motherName}
                      onChange={handleInputChange}
                      placeholder="Enter mother name"
                      required
                    />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label">
                      Enrollment Number <span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      name="enrollmentNumber"
                      value={formData.enrollmentNumber}
                      onChange={handleInputChange}
                      placeholder="Enter enrollment number"
                      required
                    />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label">
                      Computer Typing <span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      name="computerTyping"
                      value={formData.computerTyping}
                      onChange={handleInputChange}
                      placeholder="e.g., English/Hindi Typing"
                      required
                    />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label">
                      Certificate Number <span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      name="certificateNo"
                      value={formData.certificateNo}
                      onChange={handleInputChange}
                      placeholder="Enter certificate number"
                      required
                    />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label">
                      Date of Issue <span className="text-danger">*</span>
                    </label>
                    <input
                      type="date"
                      className="form-control"
                      name="dateOfIssue"
                      value={formData.dateOfIssue}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label">
                      Session From <span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      name="sessionFrom"
                      value={formData.sessionFrom}
                      onChange={handleInputChange}
                      placeholder="e.g., 2020"
                      required
                    />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label">
                      Session To <span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      name="sessionTo"
                      value={formData.sessionTo}
                      onChange={handleInputChange}
                      placeholder="e.g., 2021"
                      required
                    />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label">
                      Grade <span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      name="grade"
                      value={formData.grade}
                      onChange={handleInputChange}
                      placeholder="e.g., A+"
                      required
                    />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label">
                      Study Centre <span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      name="studyCentre"
                      value={formData.studyCentre}
                      onChange={handleInputChange}
                      placeholder="e.g., xyz"
                      required
                    />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label">
                      Words Per Minute <span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      name="wordsPerMinute"
                      value={formData.wordsPerMinute}
                      onChange={handleInputChange}
                      placeholder="e.g., 50"
                      required
                    />
                  </div>

                  <div className="col-12 mt-4">
                    <button
                      type="submit"
                      className="btn btn-primary w-100"
                      disabled={saving}
                    >
                      {saving ? (
                        <>
                          <span
                            className="spinner-border spinner-border-sm me-2"
                            role="status"
                          ></span>
                          {isEditMode ? "Updating Certificate..." : "Creating Certificate..."}
                        </>
                      ) : (
                        <>
                          <i className="bi bi-plus-circle me-2"></i>
                          {isEditMode ? "Update Typing Certificate" : "Create Typing Certificate"}
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>

          <div className="alert alert-info mt-4" role="alert">
            <i className="bi bi-info-circle-fill me-2"></i>
            <strong>Note:</strong> Make sure all JPG template files are uploaded
            to the server before creating certificates. The system requires{" "}
            <code>typing-certificate-template.jpeg</code> to generate
            certificates.
          </div>
        </div>
      </div>

      {/* Hidden canvas for typing certificate rendering */}
      <canvas id="typingCertCanvas" style={{ display: "none" }}></canvas>
    </FranchiseLayout>
  );
}
