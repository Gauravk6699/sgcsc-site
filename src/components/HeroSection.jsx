export default function HeroSection() {
  return (
    <section
      className="py-5"
      style={{
        background: "linear-gradient(135deg, var(--theme-primary) 0%, var(--theme-info) 100%)",
      }}
    >
      <div className="container text-center text-white">
        <h1 className="fw-bold mb-3" style={{ fontSize: "2.8rem" }}>
          SHREE GANPATI COMPUTER & STUDY CENTRE
        </h1>

        <p
          className="mx-auto mb-4"
          style={{
            maxWidth: "700px",
            fontSize: "1.1rem",
            opacity: 0.95,
          }}
        >
          Empowering students with practical computer education, professional
          skills, and career-oriented training for a successful future.
        </p>
{/* 
        <div className="d-flex justify-content-center gap-3 flex-wrap">
          <a href="/courses" className="btn btn-light btn-lg px-4">
            Explore Courses
          </a>
          <a href="/student-login" className="btn btn-outline-light btn-lg px-4">
            Student Login
          </a>
        </div> */}
      </div>
    </section>
  );
}
