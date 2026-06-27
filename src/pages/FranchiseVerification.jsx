import { useState } from "react";
import API from "../api/axiosInstance";

export default function FranchiseVerification() {
  const [instituteId, setInstituteId] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [inputError, setInputError] = useState("");
  const [apiError, setApiError] = useState(false);

  const verify = async () => {
    if (!instituteId.trim()) {
      setInputError("Please enter an Institute ID.");
      return;
    }
    setInputError("");

    try {
      setLoading(true);
      setResult(null);
      setApiError(false);

      const res = await API.get(
        `/public/franchise/verify?instituteId=${encodeURIComponent(instituteId)}`
      );

      setResult(res.data);
    } catch (err) {
      if (err.response?.status === 404) {
        setResult({ verified: false });
      } else {
        setApiError(true);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") verify();
  };

  const handleDownload = () => {
    const cert = result?.certificate;
    if (!cert?.certificateImage) return;
    const link = document.createElement("a");
    link.href = cert.certificateImage;
    link.download = `franchise_certificate_${cert.atcCode || instituteId}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="container my-5">
      <h3 className="text-center mb-4">Franchise Verification</h3>

      <input
        className={`form-control mb-1 ${inputError ? "is-invalid" : ""}`}
        placeholder="Enter Institute ID"
        value={instituteId}
        onChange={(e) => {
          setInstituteId(e.target.value);
          setInputError("");
        }}
        onKeyDown={handleKeyDown}
      />
      {inputError && (
        <div className="invalid-feedback d-block mb-2">{inputError}</div>
      )}

      <button
        className="btn btn-primary w-100 mt-2"
        onClick={verify}
        disabled={loading}
      >
        {loading ? "Verifying..." : "Verify"}
      </button>

      {apiError && (
        <div className="alert alert-warning mt-4">
          Could not connect to the server. Please try again later.
        </div>
      )}

      {result && (
        <div className="mt-4">
          {result.verified ? (
            <>
              <div className="alert alert-success">
                <strong>Verified Franchise</strong>
                <div>{result.data.instituteName}</div>
                <div>{result.data.ownerName}</div>
                <div>
                  {result.data.district}, {result.data.state}
                </div>
              </div>

              {result.certificate?.certificateImage ? (
                <div className="text-center">
                  <img
                    src={result.certificate.certificateImage}
                    alt="Franchise Certificate"
                    className="img-fluid border mb-3"
                    style={{ maxWidth: "100%" }}
                  />
                  <div>
                    <button className="btn btn-success" onClick={handleDownload}>
                      Download Certificate
                    </button>
                  </div>
                </div>
              ) : (
                <div className="alert alert-warning">
                  No certificate is on file for this franchise yet.
                </div>
              )}
            </>
          ) : (
            <div className="alert alert-danger">Franchise not verified</div>
          )}
        </div>
      )}
    </div>
  );
}
