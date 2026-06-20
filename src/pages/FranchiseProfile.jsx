import { useEffect, useState } from "react";
import API from "../api/axiosInstance";

/* ---------- helpers ---------- */
const NA = "—";

const boolBadge = (v) => (
  <span className={`badge bg-${v ? "success" : "secondary"}`}>
    {v ? "Yes" : "No"}
  </span>
);

const statusBadge = (status) => {
  const map = {
    approved: "success",
    pending: "warning",
    rejected: "danger",
  };
  return (
    <span className={`badge bg-${map[status] || "secondary"}`}>
      {status || "unknown"}
    </span>
  );
};

const docLink = (label, url) =>
  url ? (
    <a
      href={url.startsWith("http") ? url : `/uploads/${url}`}
      target="_blank"
      rel="noreferrer"
      className="d-block mb-1"
    >
      {label}
    </a>
  ) : (
    <span className="text-muted d-block mb-1">{label}: {NA}</span>
  );

/* ---------- component ---------- */
export default function FranchiseProfile() {
  const [franchise, setFranchise] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get("/franchise-profile/me")
      .then((res) => {
        setFranchise(res.data?.data || res.data);
      })
      .catch(() => console.error("Unable to load franchise profile"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="container my-5 text-center">Loading profile…</div>;
  }

  if (!franchise) {
    return (
      <div className="container my-5">
        <div className="alert alert-warning text-center">
          No franchise profile found.
        </div>
      </div>
    );
  }

  return (
    <div className="container my-5">
      <h3 className="mb-4 text-center">Franchise Profile</h3>

      {/* BASIC INFO */}
      <Section title="Basic Information">
        <Row label="Institute ID" value={franchise.instituteId} />
        <Row label="Institute Name" value={franchise.instituteName} />
        <Row label="Owner Name" value={franchise.ownerName} />
        <Row label="Username" value={franchise.username || NA} />
        <Row label="Date of Birth" value={franchise.dob?.slice(0, 10) || NA} />
        <Row label="Status" value={statusBadge(franchise.status)} />
        <Row label="Approved At" value={franchise.approvedAt?.slice(0, 10) || NA} />
      </Section>

      {/* CONTACT */}
      <Section title="Contact Details">
        <Row label="Email" value={franchise.email || NA} />
        <Row label="Contact Number" value={franchise.contact || NA} />
        <Row label="WhatsApp" value={franchise.whatsapp || NA} />
        <Row label="Address" value={franchise.address || NA} />
        <Row label="District" value={franchise.district || NA} />
        <Row label="State" value={franchise.state || NA} />
      </Section>

      {/* INFRASTRUCTURE */}
      <Section title="Infrastructure">
        <Row label="Operators" value={franchise.operatorsCount ?? NA} />
        <Row label="Class Rooms" value={franchise.classRooms ?? NA} />
        <Row label="Total Computers" value={franchise.totalComputers ?? NA} />
        <Row label="Center Space" value={franchise.centerSpace || NA} />
      </Section>

      {/* FACILITIES */}
      <Section title="Facilities">
        <Row label="Reception" value={boolBadge(franchise.hasReception)} />
        <Row label="Staff Room" value={boolBadge(franchise.hasStaffRoom)} />
        <Row label="Water Supply" value={boolBadge(franchise.hasWaterSupply)} />
        <Row label="Toilet" value={boolBadge(franchise.hasToilet)} />
      </Section>

      {/* FINANCIAL */}
      <Section title="Financial">
        <Row
          label="Balance"
          value={`₹${Number(franchise.balance || 0).toLocaleString()}`}
        />
      </Section>

      {/* DOCUMENTS */}
      <Section title="Uploaded Documents">
        <tr>
          <td colSpan={2}>
            {docLink("Aadhar Front", franchise.aadharFront)}
            {docLink("Aadhar Back", franchise.aadharBack)}
            {docLink("PAN Image", franchise.panImage)}
            {docLink("Institute Photo", franchise.institutePhoto)}
            {docLink("Owner Signature", franchise.ownerSign)}
            {docLink("Owner Image", franchise.ownerImage)}
            {docLink("Certificate", franchise.certificateFile)}
          </td>
        </tr>
      </Section>

      {/* META */}
      <Section title="System Info">
        <Row label="Created At" value={franchise.createdAt?.slice(0, 10) || NA} />
        <Row label="Last Updated" value={franchise.updatedAt?.slice(0, 10) || NA} />
      </Section>
    </div>
  );
}

/* ---------- small layout helpers ---------- */

function Section({ title, children }) {
  return (
    <div className="card shadow-sm mb-4">
      <div className="card-header fw-semibold">{title}</div>
      <div className="card-body">
        <div className="table-responsive">
          <table className="table table-bordered mb-0">
            <tbody>{children}</tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value }) {
  return (
    <tr>
      <th style={{ width: "35%" }}>{label}</th>
      <td>{value}</td>
    </tr>
  );
}
