import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axiosInstance";
import homeHeroImg from "../assets/images/home-page-img.png";
import "./Home.css";

/* =====================
   DEFAULT AVATAR
   ===================== */
const DEFAULT_AVATAR_SVG =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="96" height="96" viewBox="0 0 80 80">
      <circle cx="40" cy="40" r="40" fill="#a0a0a0"/>
      <circle cx="40" cy="30" r="14" fill="#e0e0e0"/>
      <path d="M20 68 Q40 45 60 68" fill="#e0e0e0"/>
    </svg>`
  );

const SafeImg = ({ src, alt = "", fallback = DEFAULT_AVATAR_SVG, ...props }) => {
  return (
    <img
      src={src || fallback}
      alt={alt}
      onError={(e) => {
        e.currentTarget.src = fallback;
      }}
      {...props}
    />
  );
};

const extractArray = (data) => {
  if (!data) return [];
  if (Array.isArray(data)) return data;
  if (Array.isArray(data.data)) return data.data;
  return [];
};

/* =====================
   STATIC MARKETING CONTENT
   (edit copy/numbers here)
   ===================== */
const CREDENTIALS = [
  "Government Recognised",
  "ISO 9001:2015 Certified",
  "NITI Aayog & MSME Approved",
];

const STATS = [
  { value: "1000+", label: "Students Trained" },
  { value: "10+", label: "Franchise Centers" },
  { value: "15+", label: "Years of Excellence" },
  { value: "100%", label: "Govt. Recognised" },
];

const WHY_CHOOSE = [
  {
    icon: "bi-tools",
    glow: "var(--glow-violet)",
    title: "Practical Training",
    text: "Industry-oriented courses designed to build real-world, job-ready skills.",
  },
  {
    icon: "bi-mortarboard-fill",
    glow: "var(--glow-emerald)",
    title: "Certified Programs",
    text: "Certificates that are verified, trusted, and recognised across institutions.",
  },
  {
    icon: "bi-star-fill",
    glow: "var(--glow-amber)",
    title: "Student Success",
    text: "Thousands of students trained with proven academic and career results.",
  },
];

const COURSE_CATEGORIES = [
  {
    icon: "bi-journal-bookmark-fill",
    glow: "var(--glow-periwinkle)",
    title: "Long Term Courses",
    text: "In-depth, certification-backed programs built for a complete career foundation.",
    to: "/long-term-courses",
  },
  {
    icon: "bi-lightning-charge-fill",
    glow: "var(--glow-cyan)",
    title: "Short Term Courses",
    text: "Focused, skill-specific courses to get job-ready in a shorter timeframe.",
    to: "/short-term-courses",
  },
  {
    icon: "bi-patch-check-fill",
    glow: "var(--glow-pink)",
    title: "Basic Courses",
    text: "Foundational computer courses for absolute beginners.",
    to: "/certificate-courses",
  },
];

export default function Home() {
  const [recentStudents, setRecentStudents] = useState([]);
  const [affiliations, setAffiliations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  /* =====================
     FETCH HOME DATA
     ===================== */
  useEffect(() => {
    let active = true;

    const load = async () => {
      setLoading(true);
      setError(null);

      try {
        const [recentRes, affRes] = await Promise.all([
          api.get("/students/recent-home"),
          api.get("/gallery", { params: { category: "affiliation" } }),
        ]);

        if (!active) return;

        setRecentStudents(extractArray(recentRes.data));
        setAffiliations(extractArray(affRes.data));
      } catch (err) {
        if (active) {
          setError(
            err?.response?.data?.message ||
              err.message ||
              "Failed to load home data"
          );
        }
      } finally {
        if (active) setLoading(false);
      }
    };

    load();
    return () => {
      active = false;
    };
  }, []);

  const recentItems = recentStudents.slice(0, 5).map((s) => ({
    name: s.name,
    subtitle: "Joined course",
    img: s.photo,
  }));

  const affiliationItems = affiliations.slice(0, 5).map((a) => ({
    id: a._id,
    img: a.image,
  }));

  /* =====================
     SHARED CTA BUTTONS
     ===================== */
  const CtaButtons = ({ className = "" }) => (
    <div className={`d-flex flex-wrap gap-3 ${className}`}>
      <Link to="/long-term-courses" className="btn btn-primary px-4 py-2 fw-semibold">
        Explore Courses
      </Link>
      <Link to="/franchise-registration" className="btn btn-outline-primary px-4 py-2 fw-semibold">
        Apply for Franchise
      </Link>
    </div>
  );

  /* =====================
     AVATAR / LOGO GRID
     ===================== */
  const renderGrid = (title, subtitle, items, rounded = true) => {
    if (!items.length) return null;

    return (
      <section className="py-5">
        <div className="container">
          <div className="text-center mb-5">
            <h2 className="fw-bold">{title}</h2>
            {subtitle && <p className="mb-0" style={{ color: "var(--theme-body-text)" }}>{subtitle}</p>}
          </div>

          <div className="row g-4 justify-content-center">
            {items.map((item, i) => (
              <div key={i} className="col-6 col-sm-4 col-md-3 col-lg-2">
                <div className="card h-100 text-center p-3">
                  <div
                    className="mx-auto mb-3"
                    style={{
                      width: rounded ? 96 : "100%",
                      height: rounded ? 96 : 110,
                      borderRadius: rounded ? "50%" : 8,
                      overflow: "hidden",
                      backgroundColor: "rgba(255,255,255,0.08)",
                    }}
                  >
                    <SafeImg
                      src={item.img}
                      alt={item.name}
                      style={{ width: "100%", height: "100%", objectFit: rounded ? "cover" : "contain" }}
                    />
                  </div>

                  {item.name && <h6 className="fw-semibold mb-1">{item.name}</h6>}
                  {item.subtitle && <small style={{ color: "var(--theme-body-text)" }}>{item.subtitle}</small>}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  };

  /* =====================
     RENDER
     ===================== */
  return (
    <div>
      {/* ===== HERO ===== */}
      <section className="py-5">
        <div className="container py-4">
          <div className="row align-items-center g-5">
            <div className="col-lg-6">
              <h1 className="display-4 fw-bold mb-3">
                Shree Ganpati Computer &amp; Study Centre
              </h1>
              <p className="lead mb-4" style={{ color: "var(--theme-body-text)" }}>
                An Autonomous Institute Registered under the Public Trust Act 1882 —
                building practical, career-focused computer education since years.
              </p>

              <div className="d-flex flex-wrap gap-2 mb-4">
                {CREDENTIALS.map((c, i) => (
                  <span key={i} className="badge rounded-pill px-3 py-2 fw-semibold" style={{ background: "rgba(255,255,255,0.12)", color: "var(--theme-body-text)", border: "1px solid rgba(255,255,255,0.25)" }}>
                    {c}
                  </span>
                ))}
              </div>

              <CtaButtons />
            </div>

            <div className="col-lg-6">
              <div className="card p-2">
                <img
                  src={homeHeroImg}
                  alt="Students learning at SGCSC"
                  className="w-100 rounded"
                  style={{ display: "block", objectFit: "cover", maxHeight: 420 }}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== STATS STRIP ===== */}
      <section className="py-4">
        <div className="container">
          <div className="row g-4">
            {STATS.map((s, i) => (
              <div key={i} className="col-6 col-md-3">
                <div className="card h-100 text-center py-4 px-2">
                  <div className="display-5 fw-bold mb-1">{s.value}</div>
                  <div style={{ color: "var(--theme-body-text)" }}>{s.label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== WHY CHOOSE SGCSC ===== */}
      <section className="py-5">
        <div className="container">
          <div className="text-center mb-5">
            <h2 className="fw-bold">Why Choose SGCSC?</h2>
            <p style={{ color: "var(--theme-body-text)" }}>
              Focused on skills, certification, and real student outcomes
            </p>
          </div>

          <div className="row g-4">
            {WHY_CHOOSE.map((item, i) => (
              <div key={i} className="col-md-4">
                <div className="card h-100 p-4 text-center">
                  <div
                    className="mx-auto mb-3 d-flex align-items-center justify-content-center rounded-circle"
                    style={{ width: 70, height: 70, background: item.glow, color: "#1a1433", fontSize: 28 }}
                  >
                    <i className={`bi ${item.icon}`} />
                  </div>
                  <h5 className="fw-bold">{item.title}</h5>
                  <p className="mb-0" style={{ color: "var(--theme-body-text)" }}>{item.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== EXPLORE OUR COURSES ===== */}
      <section className="py-5">
        <div className="container">
          <div className="text-center mb-5">
            <h2 className="fw-bold">Explore Our Courses</h2>
            <p style={{ color: "var(--theme-body-text)" }}>
              Programs designed for every stage of your learning journey
            </p>
          </div>

          <div className="row g-4">
            {COURSE_CATEGORIES.map((c, i) => (
              <div key={i} className="col-md-4">
                <Link to={c.to} className="text-decoration-none">
                  <div className="card h-100 p-4 text-center">
                    <div
                      className="mx-auto mb-3 d-flex align-items-center justify-content-center rounded-circle"
                      style={{ width: 70, height: 70, background: c.glow, color: "#1a1433", fontSize: 28 }}
                    >
                      <i className={`bi ${c.icon}`} />
                    </div>
                    <h5 className="fw-bold">{c.title}</h5>
                    <p className="mb-0" style={{ color: "var(--theme-body-text)" }}>{c.text}</p>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {loading && (
        <div className="text-center mt-4" style={{ color: "var(--theme-body-text)" }}>
          Loading content…
        </div>
      )}

      {error && (
        <div className="text-center text-danger mt-4">
          {error}
        </div>
      )}

      {renderGrid("Recently Joined Students", null, recentItems)}
      {renderGrid("Our Affiliations", "Recognised & associated institutions", affiliationItems, false)}

      {/* ===== FINAL CTA BANNER ===== */}
      <section className="py-5">
        <div className="container">
          <div className="card p-5 text-center">
            <h2 className="fw-bold mb-2">Ready to start your career journey?</h2>
            <p className="mb-4" style={{ color: "var(--theme-body-text)" }}>
              Join thousands of students who built real, job-ready skills with SGCSC.
            </p>
            <CtaButtons className="justify-content-center" />
          </div>
        </div>
      </section>
    </div>
  );
}
