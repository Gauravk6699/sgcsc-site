import { useEffect, useState } from "react";
import API from "../api/axiosInstance";
import { Link } from "react-router-dom";
import { FranchiseLayout } from "./FranchiseStudents";

/* ---------- helpers ---------- */
const formatDate = (dateString) => {
  if (!dateString) return "—";
  const date = new Date(dateString);
  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const getBalanceIcon = (balance) => {
  if (balance <= 0) {
    return { icon: "bi-exclamation-triangle-fill", color: "text-danger", bg: "bg-danger" };
  } else if (balance < 100) {
    return { icon: "bi-coin", color: "text-warning", bg: "bg-warning" };
  } else {
    return { icon: "bi-wallet2", color: "text-success", bg: "bg-success" };
  }
};

const transactionTypeBadge = (type) => {
  const styles = {
    topup: { bg: "bg-success", icon: "bi-arrow-up-circle", label: "Top-up" },
    deduction: { bg: "bg-danger", icon: "bi-arrow-down-circle", label: "Deduction" },
  };
  const style = styles[type] || { bg: "bg-secondary", icon: "bi-circle", label: type };
  
  return (
    <span className={`badge ${style.bg} d-flex align-items-center gap-1`}>
      <i className={`bi ${style.icon}`}></i>
      {style.label}
    </span>
  );
};

/* ---------- component ---------- */
export default function FranchiseCredits() {
  const [credits, setCredits] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [topupInfo, setTopupInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch all data in parallel
        const [creditsRes, transactionsRes, topupRes] = await Promise.all([
          API.get("/credits/my-credits"),
          API.get("/credits/my-transactions?limit=10"),
          API.get("/credits/topup-info"),
        ]);

        setCredits(creditsRes.data?.data || null);
        setTransactions(transactionsRes.data?.data?.transactions || []);
        setTopupInfo(topupRes.data?.data || null);
      } catch (err) {
        console.error("Error fetching credits data:", err);
        setError("Unable to load credits information. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const balanceIndicator = getBalanceIcon(credits?.credits || 0);

  if (loading) {
    return (
      <FranchiseLayout>
        <div className="d-flex justify-content-center align-items-center py-5">
          <div className="spinner-border text-primary me-2" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          Loading credits information...
        </div>
      </FranchiseLayout>
    );
  }

  if (error) {
    return (
      <FranchiseLayout>
        <div className="alert alert-danger" role="alert">
          <i className="bi bi-exclamation-triangle-fill me-2"></i>
          {error}
        </div>
      </FranchiseLayout>
    );
  }

  return (
    <FranchiseLayout>
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="mb-1">
            <i className="bi bi-credit-card-2-front me-2 text-primary"></i>
            My Credits
          </h2>
          <p className="text-muted mb-0">
            Manage your credits and view transaction history
          </p>
        </div>
        <Link to="/franchise/profile" className="btn btn-outline-primary">
          <i className="bi bi-arrow-left me-1"></i>
          Back to Profile
        </Link>
      </div>

      {/* Balance Cards */}
      <div className="row g-4 mb-5">
        {/* Current Balance */}
        <div className="col-md-6">
          <div className="card h-100 border-0 shadow-sm">
            <div className="card-body p-4">
              <div className="d-flex align-items-center mb-3">
                <div className={`rounded-circle p-3 ${balanceIndicator.bg} bg-opacity-10 me-3`}>
                  <i className={`bi ${balanceIndicator.icon} fs-3 ${balanceIndicator.color}`}></i>
                </div>
                <div>
                  <h6 className="text-muted mb-1">Current Balance</h6>
                  <h3 className={`mb-0 ${balanceIndicator.color}`}>
                    {credits?.credits || 0}
                    <small className="fs-6 text-muted ms-1">credits</small>
                  </h3>
                </div>
              </div>
              
              {credits?.credits <= 0 && (
                <div className="alert alert-danger mb-0 py-2">
                  <small>
                    <i className="bi bi-exclamation-triangle-fill me-1"></i>
                    Your balance is low. Please top-up to continue using services.
                  </small>
                </div>
              )}
              {credits?.credits > 0 && credits?.credits < 100 && (
                <div className="alert alert-warning mb-0 py-2">
                  <small>
                    <i className="bi bi-info-circle-fill me-1"></i>
                    Your balance is running low. Consider topping up soon.
                  </small>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Total Credits Used */}
        <div className="col-md-6">
          <div className="card h-100 border-0 shadow-sm">
            <div className="card-body p-4">
              <div className="d-flex align-items-center mb-3">
                <div className="rounded-circle p-3 bg-info bg-opacity-10 me-3">
                  <i className="bi bi-graph-up-arrow fs-3 text-info"></i>
                </div>
                <div>
                  <h6 className="text-muted mb-1">Total Credits Used</h6>
                  <h3 className="mb-0 text-info">
                    {credits?.totalCreditsUsed || 0}
                    <small className="fs-6 text-muted ms-1">credits</small>
                  </h3>
                </div>
              </div>
              <p className="text-muted mb-0 small">
                Lifetime credits consumed for student enrollments, certificates, and other services.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Top-up Section */}
      <div className="card border-0 shadow-sm mb-5">
        <div className="card-header bg-white py-3">
          <h5 className="mb-0">
            <i className="bi bi-qr-code me-2 text-primary"></i>
            Top-up Your Credits
          </h5>
        </div>
        <div className="card-body p-4">
          <div className="row">
            {/* QR Code */}
            <div className="col-md-5 text-center mb-4 mb-md-0">
              {topupInfo?.creditTopupQR?.url ? (
                <div className="p-3 border rounded bg-light">
                  <img
                    src={topupInfo.creditTopupQR.url}
                    alt="Payment QR Code"
                    className="img-fluid"
                    style={{ maxWidth: "250px" }}
                  />
                  <p className="text-muted small mt-2 mb-0">Scan to pay</p>
                </div>
              ) : (
                <div className="p-4 border rounded bg-light">
                  <i className="bi bi-qr-code fs-1 text-muted"></i>
                  <p className="text-muted mt-2 mb-0">QR code not available</p>
                </div>
              )}
            </div>

            {/* Instructions */}
            <div className="col-md-7">
              <h6 className="fw-bold mb-3">Payment Instructions</h6>
              
              {topupInfo?.creditTopupInstructions ? (
                <div 
                  className="mb-4"
                  dangerouslySetInnerHTML={{ 
                    __html: topupInfo.creditTopupInstructions.replace(/\n/g, "<br/>") 
                  }}
                />
              ) : (
                <div className="alert alert-info mb-4">
                  <i className="bi bi-info-circle me-2"></i>
                  Please contact admin for payment instructions.
                </div>
              )}

              <div className="alert alert-warning">
                <h6 className="alert-heading">
                  <i className="bi bi-clock-history me-2"></i>
                  Processing Time
                </h6>
                <p className="mb-0">
                  After completing your payment, please allow up to 24 hours for admin verification. 
                  Your credits will be updated once the payment is confirmed.
                </p>
              </div>

              <div className="mt-4">
                <h6 className="fw-bold mb-2">
                  <i className="bi bi-headset me-2"></i>
                  Need Help?
                </h6>
                <p className="text-muted mb-2">
                  For any queries regarding credit top-up or payment issues, please contact:
                </p>
                <div className="d-flex gap-3">
                  <a href="/contact" className="btn btn-outline-primary btn-sm">
                    <i className="bi bi-envelope me-1"></i>
                    Contact Support
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Transaction History */}
      <div className="card border-0 shadow-sm">
        <div className="card-header bg-white py-3 d-flex justify-content-between align-items-center">
          <h5 className="mb-0">
            <i className="bi bi-clock-history me-2 text-primary"></i>
            Transaction History
          </h5>
          <span className="badge bg-secondary">
            Last {transactions.length} transactions
          </span>
        </div>
        <div className="card-body p-0">
          {transactions.length === 0 ? (
            <div className="text-center py-5">
              <i className="bi bi-inbox fs-1 text-muted"></i>
              <p className="text-muted mt-2 mb-0">No transactions found</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover mb-0">
                <thead className="table-light">
                  <tr>
                    <th>Date</th>
                    <th>Type</th>
                    <th>Amount</th>
                    <th>Balance After</th>
                    <th>Description</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((transaction) => (
                    <tr key={transaction._id}>
                      <td className="text-nowrap">
                        {formatDate(transaction.createdAt)}
                      </td>
                      <td>
                        {transactionTypeBadge(transaction.type)}
                      </td>
                      <td>
                        <span
                          className={`fw-bold ${
                            transaction.type === "topup"
                              ? "text-success"
                              : "text-danger"
                          }`}
                        >
                          {transaction.type === "topup" ? "+" : "-"}
                          {transaction.amount}
                        </span>
                      </td>
                      <td>
                        <span className="text-muted">
                          {transaction.balanceAfter || "—"}
                        </span>
                      </td>
                      <td>
                        <span className="text-muted small">
                          {transaction.description || "—"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
        {transactions.length > 0 && (
          <div className="card-footer bg-white text-center py-3">
            <small className="text-muted">
              Showing last {transactions.length} transactions
            </small>
          </div>
        )}
      </div>
    </FranchiseLayout>
  );
}
