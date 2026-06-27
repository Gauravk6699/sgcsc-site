import React, { useEffect, useState } from "react";
// import Hero from "../components/HeroSection";
import api from "../api/axiosInstance";
import "./Home.css";

/* =====================
   BASE URL (NO /api)
   ===================== */
// const BACKEND_BASE_URL =
//   process.env.REACT_APP_API_BASE_URL
//     ? process.env.REACT_APP_API_BASE_URL.replace(/\/api\/?$/, "")
//     : "http://localhost:5000";

/* =====================
   IMAGE RESOLVER
   ===================== */
// const resolveImage = (img) => {
//   if (!img) return "/images/no-image.png";

//   if (img.startsWith("http")) return img;

//   if (img.startsWith("/uploads")) {
//     return `${BACKEND_BASE_URL}${img}`;
//   }

//   return `${BACKEND_BASE_URL}/uploads/${img}`;
// };


/* =====================
   SAFE IMAGE COMPONENT
   ===================== */
// Default avatar SVG for students without a photo
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



/* =====================
   SAFE ARRAY EXTRACTOR
   ===================== */
const extractArray = (data) => {
  if (!data) return [];
  if (Array.isArray(data)) return data;
  if (Array.isArray(data.data)) return data.data;
  return [];
};

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
        const [
          recentRes,
          affRes,
        ] = await Promise.all([
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

  /* =====================
     NORMALIZED ITEMS
     ===================== */
const recentItems = recentStudents.slice(0, 5).map((s) => ({
  name: s.name,
  subtitle: "Joined course",
  // subtitle: s.course,
  img: s.photo, // Cloudinary URL
}));

  const affiliationItems = affiliations.slice(0, 5).map((a) => ({
    id: a._id,
    // name: a.title || "Affiliation",
    img: a.image,
  }));

  /* =====================
     GRID RENDERER
     ===================== */
const renderGrid = (title, items, rounded = true) => {
  if (!items.length) return null;

  return (
    <section className="py-5">
      <div className="container">
        <div className="text-center mb-5">
          <h2 className="fw-bold">{title}</h2>
          <div
            className="mx-auto mt-2"
            style={{
              width: 60,
              height: 3,
              backgroundColor: "var(--theme-primary)",
              borderRadius: 2,
            }}
          />
        </div>

        <div className="row g-4 justify-content-center">
          {items.map((item, i) => (
            <div key={i} className="col-6 col-sm-4 col-md-3 col-lg-2">
              <div
                className="h-100 text-center bg-white rounded shadow-sm p-3"
                style={{ transition: "0.3s ease" }}
              >
                <div
                  className="mx-auto mb-3"
                  style={{
                    width: rounded ? 96 : "100%",
                    height: rounded ? 96 : 140,
                    borderRadius: rounded ? "50%" : 8,
                    overflow: "hidden",
                    backgroundColor: "rgba(255,255,255,0.08)",
                  }}
                >
                  <SafeImg
                    src={item.img}
                    alt={item.name}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                  />
                </div>

                <h6 className="fw-semibold mb-1">{item.name}</h6>
                {item.subtitle && (
                  <small className="text-muted">{item.subtitle}</small>
                )}
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
      {/* <Hero /> */}

      {/* About */}

{/* =====================
   TEXT-BASED HERO SECTION
===================== */}
<section
  className="py-5"
  style={{
    background: "linear-gradient(135deg, var(--theme-primary), var(--theme-info))",
    color: "#fff",
  }}
>
  <div className="container">
    <div className="row justify-content-center text-center">
      <div className="col-lg-9">
        <h1 className="fw-bold mb-3">
          SHREE GANPATI COMPUTER & STUDY CENTRE
        </h1>

        <p className="lead mb-4">
          An Autonomous Institute Registered under the Public Trust Act 1882 <br />
          ISO 9001:2015 Certified • NITI Aayog & MSME Approved
        </p>

        <div className="d-flex flex-wrap justify-content-center gap-3">
          <div className="px-4 py-2 bg-light text-dark rounded shadow-sm fw-semibold">
            Government Recognised
          </div>
          <div className="px-4 py-2 bg-light text-dark rounded shadow-sm fw-semibold">
            Career-Focused Courses
          </div>
          <div className="px-4 py-2 bg-light text-dark rounded shadow-sm fw-semibold">
            Trusted Since Years
          </div>
        </div>
      </div>
    </div>
  </div>
</section>


<section className="py-5" style={{ backgroundColor: "rgba(255,255,255,0.06)" }}>
  <div className="container">
    <div className="row text-center mb-5">
      <div className="col">
        <h2 className="fw-bold">Why Choose SGCSC?</h2>
        <p className="text-muted mt-2">
          Focused on skills, certification, and real student outcomes
        </p>
      </div>
    </div>

    <div className="row g-4">
      {/* Practical Training */}
      <div className="col-md-4">
        <div className="h-100 p-4 bg-white rounded shadow-sm text-center">
          <div
            className="mx-auto mb-3 d-flex align-items-center justify-content-center rounded-circle"
            style={{
              width: 70,
              height: 70,
              backgroundColor: "var(--theme-primary)",
              color: "#fff",
              fontSize: 28,
            }}
          >
            🛠️
          </div>
          <h5 className="fw-bold">Practical Training</h5>
          <p className="text-muted mb-0">
            Industry-oriented courses designed to build real-world,
            job-ready skills.
          </p>
        </div>
      </div>

      {/* Certified Programs */}
      <div className="col-md-4">
        <div className="h-100 p-4 bg-white rounded shadow-sm text-center">
          <div
            className="mx-auto mb-3 d-flex align-items-center justify-content-center rounded-circle"
            style={{
              width: 70,
              height: 70,
              backgroundColor: "var(--theme-success)",
              color: "#fff",
              fontSize: 28,
            }}
          >
            🎓
          </div>
          <h5 className="fw-bold">Certified Programs</h5>
          <p className="text-muted mb-0">
            Certificates that are verified, trusted, and recognised
            across institutions.
          </p>
        </div>
      </div>

      {/* Student Success */}
      <div className="col-md-4">
        <div className="h-100 p-4 bg-white rounded shadow-sm text-center">
          <div
            className="mx-auto mb-3 d-flex align-items-center justify-content-center rounded-circle"
            style={{
              width: 70,
              height: 70,
              backgroundColor: "var(--theme-info)",
              color: "#fff",
              fontSize: 28,
            }}
          >
            ⭐
          </div>
          <h5 className="fw-bold">Student Success</h5>
          <p className="text-muted mb-0">
            Thousands of students trained with proven academic and
            career results.
          </p>
        </div>
      </div>
    </div>
  </div>
</section>





      {loading && (
        <div className="text-center text-muted mt-4">
          Loading content…
        </div>
      )}

      {error && (
        <div className="text-center text-danger mt-4">
          {error}
        </div>
      )}

      {renderGrid("Recent Join Students", recentItems)}
      {/* {renderGrid("Certified Students", certifiedItems)} */}
      {/* {renderGrid("Our Institute Members", memberItems)} */}
      <section className="py-5 bg-light">
  <div className="container">
    <div className="text-center mb-5">
      <h2 className="fw-bold">Our Affiliations</h2>
      <p className="text-muted">
        Recognised & associated institutions
      </p>
    </div>

    <div className="row g-4 justify-content-center align-items-center">
      {affiliationItems.map((item, i) => (
        <div
          key={i}
          className="col-6 col-sm-4 col-md-3 col-lg-2 d-flex justify-content-center"
        >
          <div
            className="bg-white rounded shadow-sm p-3 d-flex align-items-center justify-content-center"
            style={{
              width: "100%",
              height: 120,
              transition: "0.3s ease",
            }}
          >
<a
  href={item.img}
  target="_blank"
  rel="noopener noreferrer"
  className="w-100 h-100 d-flex align-items-center justify-content-center"
>
  <SafeImg
    src={item.img}
    alt="Affiliation"
    style={{
      maxWidth: "100%",
      maxHeight: "100%",
      objectFit: "contain",
      cursor: "pointer",
    }}
  />
</a>


          </div>
        </div>
      ))}
    </div>
  </div>
</section>

    </div>
  );
}
