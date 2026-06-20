// src/pages/FranchiseFranchiseCertificateCreate.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/axiosInstance";
import Sidebar from "./FranchiseDashboard";

// Franchise Certificate Generator Global Reference
let franchiseCertificateGenerator = null;

// Initialize Franchise Certificate Generator function
const initFranchiseCertificateGenerator = async () => {
  if (franchiseCertificateGenerator) return franchiseCertificateGenerator;

  // Ensure canvas is available before loading template
  const canvasElement = document.getElementById('franchiseCertCanvas');
  if (!canvasElement) {
    console.warn('Canvas element not found in DOM yet. Waiting...');
    // Wait for canvas to be available
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  // Check if already available on window
  if (window.FranchiseCertificateGenerator) {
    franchiseCertificateGenerator = window.FranchiseCertificateGenerator;
    try {
      await franchiseCertificateGenerator.loadTemplate('/franchise-certificate-template.jpeg');
      franchiseCertificateGenerator.fetchConfigFromAPI();
      console.log('Franchise certificate template loaded successfully');
      return franchiseCertificateGenerator;
    } catch (err) {
      console.error('CRITICAL ERROR: Franchise certificate template not found:', err.message);
      console.error('Please upload franchise-certificate-template.jpeg to the public folder');
      throw new Error(`Template required: ${err.message}`);
    }
  }

  // Script not loaded yet, dynamically load it
  return new Promise((resolve, reject) => {
    // Load jspdf if not present
    if (!window.jspdf) {
      const jspdfScript = document.createElement('script');
      jspdfScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
      jspdfScript.onload = () => {
        // Load franchise-certificate-generator
        const certScript = document.createElement('script');
        certScript.src = '/franchise-certificate-generator.js';
        certScript.onload = async () => {
          if (window.FranchiseCertificateGenerator) {
            franchiseCertificateGenerator = window.FranchiseCertificateGenerator;
            try {
              await franchiseCertificateGenerator.loadTemplate('/franchise-certificate-template.jpeg');
              franchiseCertificateGenerator.fetchConfigFromAPI();
              console.log('Franchise certificate template loaded successfully');
              resolve(franchiseCertificateGenerator);
            } catch (err) {
              console.error('CRITICAL ERROR: Franchise certificate template not found:', err.message);
              reject(new Error(`Template required: ${err.message}`));
            }
          } else {
            reject(new Error('Franchise certificate generator script failed to load'));
          }
        };
        certScript.onerror = () => reject(new Error('Failed to load franchise certificate generator script'));
        document.body.appendChild(certScript);
      };
      jspdfScript.onerror = () => reject(new Error('Failed to load jspdf script'));
      document.body.appendChild(jspdfScript);
    } else if (!window.FranchiseCertificateGenerator) {
      // jspdf loaded but franchise-certificate-generator not loaded
      const certScript = document.createElement('script');
      certScript.src = '/franchise-certificate-generator.js';
      certScript.onload = async () => {
        if (window.FranchiseCertificateGenerator) {
          franchiseCertificateGenerator = window.FranchiseCertificateGenerator;
          try {
            await franchiseCertificateGenerator.loadTemplate('/franchise-certificate-template.jpeg');
            franchiseCertificateGenerator.fetchConfigFromAPI();
            console.log('Franchise certificate template loaded successfully');
            resolve(franchiseCertificateGenerator);
          } catch (err) {
            console.error('CRITICAL ERROR: Franchise certificate template not found:', err.message);
            reject(new Error(`Template required: ${err.message}`));
          }
        } else {
          reject(new Error('Franchise certificate generator script failed to load'));
        }
      };
      certScript.onerror = () => reject(new Error('Failed to load franchise certificate generator script'));
      document.body.appendChild(certScript);
    }
  });
};

export default function FranchiseFranchiseCertificateCreate() {
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [franchise, setFranchise] = useState(null);

  const [formData, setFormData] = useState({
    franchiseName: "",
    address: "",
    applicantName: "",
    atcCode: "",
    dateOfIssue: "",
    dateOfRenewal: "",
  });

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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validateForm = () => {
    if (!formData.franchiseName.trim()) {
      setError("Franchise Name is required");
      return false;
    }
    if (!formData.address.trim()) {
      setError("Address is required");
      return false;
    }
    if (!formData.applicantName.trim()) {
      setError("Applicant Name is required");
      return false;
    }
    if (!formData.atcCode.trim()) {
      setError("ATC Code is required");
      return false;
    }
    if (!formData.dateOfIssue) {
      setError("Date of Issue is required");
      return false;
    }
    if (!formData.dateOfRenewal) {
      setError("Date of Renewal is required");
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
      // Generate certificate image data URL for storing
      let certificateImage = null;
      try {
        await initFranchiseCertificateGenerator();
      } catch (genErr) {
        setError(`Certificate generation failed: ${genErr.message}`);
        return;
      }

      if (franchiseCertificateGenerator) {
        try {
          const certificateData = {
            franchiseName: formData.franchiseName.trim(),
            address: formData.address.trim(),
            applicantName: formData.applicantName.trim(),
            atcCode: formData.atcCode.trim(),
            dateOfIssue: formData.dateOfIssue,
            dateOfRenewal: formData.dateOfRenewal,
          };
          certificateImage = await franchiseCertificateGenerator.getDataURL(certificateData);
        } catch (imgErr) {
          console.error('Could not generate franchise certificate image:', imgErr);
          setError('Failed to generate certificate image. Please ensure the JPG template is properly configured.');
          return;
        }
      } else {
        setError('Certificate generator not available. Please refresh the page.');
        return;
      }

      const payload = {
        franchiseName: formData.franchiseName.trim(),
        address: formData.address.trim(),
        applicantName: formData.applicantName.trim(),
        atcCode: formData.atcCode.trim(),
        dateOfIssue: formData.dateOfIssue,
        dateOfRenewal: formData.dateOfRenewal,
        certificateImage,
      };

      await API.post("/franchise/franchise-certificates", payload);

      navigate("/franchise/franchise-certificates", {
        state: { message: "Franchise certificate created successfully!" },
      });
    } catch (err) {
      console.error("Create franchise certificate error:", err);
      setError(err.response?.data?.message || "Failed to create certificate");
    } finally {
      setSaving(false);
    }
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
              <h2 className="mb-1">Create Franchise Certificate</h2>
              <p className="text-muted mb-0">Generate authorization certificate for franchise centers</p>
            </div>
            <button
              className="btn btn-outline-secondary"
              onClick={() => navigate("/franchise/franchise-certificates")}
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
                    <div className="alert alert-danger alert-dismissible fade show" role="alert">
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
                          Franchise Name <span className="text-danger">*</span>
                        </label>
                        <input
                          type="text"
                          className="form-control"
                          name="franchiseName"
                          value={formData.franchiseName}
                          onChange={handleInputChange}
                          placeholder="Enter franchise center name"
                          required
                        />
                      </div>

                      <div className="col-md-6">
                        <label className="form-label">
                          Applicant Name <span className="text-danger">*</span>
                        </label>
                        <input
                          type="text"
                          className="form-control"
                          name="applicantName"
                          value={formData.applicantName}
                          onChange={handleInputChange}
                          placeholder="Enter applicant/owner name"
                          required
                        />
                      </div>

                      <div className="col-12">
                        <label className="form-label">
                          Address <span className="text-danger">*</span>
                        </label>
                        <textarea
                          className="form-control"
                          name="address"
                          value={formData.address}
                          onChange={handleInputChange}
                          rows="3"
                          placeholder="Enter complete address of the franchise center"
                          required
                        />
                      </div>

                      <div className="col-md-6">
                        <label className="form-label">
                          ATC Code <span className="text-danger">*</span>
                        </label>
                        <input
                          type="text"
                          className="form-control"
                          name="atcCode"
                          value={formData.atcCode}
                          onChange={handleInputChange}
                          placeholder="Enter ATC authorization code"
                          required
                        />
                      </div>

                      <div className="col-md-3">
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

                      <div className="col-md-3">
                        <label className="form-label">
                          Date of Renewal <span className="text-danger">*</span>
                        </label>
                        <input
                          type="date"
                          className="form-control"
                          name="dateOfRenewal"
                          value={formData.dateOfRenewal}
                          onChange={handleInputChange}
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
                              <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                              Creating Certificate...
                            </>
                          ) : (
                            <>
                              <i className="bi bi-plus-circle me-2"></i>
                              Create Franchise Certificate
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
                <strong>Note:</strong> Make sure all JPG template files are uploaded to the server before creating certificates.
                The system requires <code>franchise-certificate-template.jpeg</code> to generate certificates.
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Hidden canvas for franchise certificate rendering */}
      <canvas id="franchiseCertCanvas" style={{ display: 'none' }}></canvas>
    </div>
  );
}