import React from 'react';
import Hero from '../components/HeroSection';

const iconBox = (color, icon) => (
  <div style={{
    width: '4rem', height: '4rem', borderRadius: '1.2rem',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)',
    fontSize: '1.8rem', flexShrink: 0, color,
  }}>
    <i className={icon}></i>
  </div>
);

const SectionHeader = ({ color, icon, tag, title }) => (
  <div className="d-flex align-items-center gap-3 mb-4">
    {iconBox(color, icon)}
    <div>
      <span style={{
        display: 'inline-block', fontSize: '0.65rem', fontWeight: 700,
        letterSpacing: '0.08em', textTransform: 'uppercase', color: '#a5b4fc',
        background: 'rgba(255,255,255,0.04)', padding: '0.25rem 1rem',
        borderRadius: '9999px', border: '1px solid rgba(255,255,255,0.06)',
        marginBottom: '0.35rem',
      }}>{tag}</span>
      <h2 className="fw-bold mb-0" style={{ color: 'rgba(255,255,255,0.9)' }}>{title}</h2>
    </div>
  </div>
);

const bodyText = { color: 'rgba(200,210,255,0.80)', lineHeight: 1.8 };
const highlight = { color: 'rgba(255,255,255,0.9)', fontWeight: 600 };

export default function About() {
  return (
    <div>
      <Hero title="About Us" subtitle="Learn more about SGCSC" />

      <div className="container my-5" style={{ maxWidth: '960px' }}>

        {/* Accreditation Badges */}
        <div className="d-flex flex-wrap justify-content-center gap-3 mb-5">
          {[
            { icon: 'fas fa-gavel', text: 'Public Trust Act 1882' },
            { icon: 'fas fa-building-columns', text: 'NITI Aayog Regd.' },
            { icon: 'fas fa-industry', text: 'MSME · Govt. of India' },
            { icon: 'fas fa-certificate', text: 'ISO 9001:2015' },
          ].map(({ icon, text }) => (
            <span key={text} style={{
              background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.10)',
              borderRadius: '9999px', padding: '0.45rem 1.4rem', fontSize: '0.7rem',
              fontWeight: 600, letterSpacing: '0.03em', color: '#c4b5fd',
              backdropFilter: 'blur(4px)', textTransform: 'uppercase',
            }}>
              <i className={icon} style={{ marginRight: '0.5rem', color: '#f9a8d4' }}></i>
              {text}
            </span>
          ))}
        </div>

        {/* Accreditations */}
        <section className="card p-4 p-md-5 mb-5">
          <SectionHeader color="#fcd34d" icon="fas fa-scroll" tag="Recognition" title="Accreditations of SGCSC" />
          <div className="d-flex flex-column gap-3" style={bodyText}>
            <p className="mb-0"><span style={highlight}>SGCSC</span> is proudly registered under the <span style={highlight}>Public Trust Act 1882</span> (Govt. of India), reflecting our unwavering commitment to transparency and ethical governance. This registration ensures that every aspect of our operations — from admissions to course delivery — is conducted with the highest standards of accountability.</p>
            <p className="mb-0">As an institution <span style={highlight}>registered with NITI Aayog</span>, SGCSC actively contributes to India's national skill development agenda. This alignment allows us to offer courses that are not only industry-relevant but also in sync with government initiatives like Skill India and Digital India, giving our students a competitive edge.</p>
            <p className="mb-0">Our empanelment with the <span style={highlight}>Ministry of MSME</span> empowers SGCSC to deliver specialized entrepreneurship and employability programs. From digital marketing to financial management, our MSME-backed courses are designed to create job creators, not just job seekers.</p>
            <p className="mb-0">The <span style={highlight}>ISO 9001:2015 certification</span> is the hallmark of quality at SGCSC. It signifies that our processes, teaching methodologies, and student support systems meet global standards — our promise to every student that they are receiving world-class education.</p>
            <p className="mb-0">These accreditations are not just certificates — they are the pillars of trust on which SGCSC stands. They reflect our dedication to excellence and our resolve to provide education that is credible, transformative, and future-ready.</p>
          </div>
        </section>

        {/* Vision */}
        <section className="card p-4 p-md-5 mb-5">
          <SectionHeader color="#67e8f9" icon="fas fa-eye" tag="Guiding Star" title="Vision of SGCSC" />
          <div className="d-flex flex-column gap-3" style={bodyText}>
            <p className="mb-0"><span style={highlight}>SGCSC</span> envisions a future where every individual has access to quality computer education that empowers them to thrive in the digital age. We aspire to be the most trusted educational centre in the region — a place where innovation meets compassion, and where every student is nurtured to reach their fullest potential.</p>
            <p className="mb-0">Our vision is to create a <span style={highlight}>learning ecosystem</span> that is dynamic, inclusive, and forward-looking. We aim to bridge the urban-rural digital divide by making cutting-edge computer education accessible to students from all backgrounds, especially those in underserved communities.</p>
          </div>
        </section>

        {/* Mission */}
        <section className="card p-4 p-md-5 mb-5">
          <SectionHeader color="#f9a8d4" icon="fas fa-bullseye" tag="Our Purpose" title="Mission of SGCSC" />
          <div style={bodyText}>
            <p>The mission of <span style={highlight}>SGCSC</span> is to deliver <span style={highlight}>practical, career-focused education</span> that prepares students for the challenges of the modern workplace. We are committed to:</p>
            <ul className="mb-3" style={{ paddingLeft: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <li>Providing industry-aligned, hands-on training that bridges the gap between theory and practice.</li>
              <li>Creating a supportive, inclusive environment where every student feels valued and motivated.</li>
              <li>Continuously updating our curriculum to stay ahead of technological advancements.</li>
              <li>Building strong networks with employers to facilitate internships and job placements.</li>
              <li>Developing not just technical skills, but also critical thinking, communication, and leadership qualities.</li>
              <li>Contributing to community development through digital literacy initiatives and skill-building programs.</li>
            </ul>
            <p className="mb-0">At SGCSC, we believe that education is the most powerful instrument for change. Our mission is to wield that instrument with purpose, integrity, and an unwavering commitment to our students' success.</p>
          </div>
        </section>

        {/* Core Values */}
        <section className="card p-4 p-md-5 mb-5">
          <SectionHeader color="#6ee7b7" icon="fas fa-heart" tag="Our Foundation" title="Core Values of SGCSC" />
          <div className="row g-3">
            {[
              { color: '#6ee7b7', icon: 'fas fa-check-circle', title: 'Practical Mastery', text: 'At SGCSC, we emphasize learning by doing. Our courses are packed with real-world projects, simulations, and lab sessions that ensure students are industry-ready from day one.' },
              { color: '#67e8f9', icon: 'fas fa-users', title: 'Inclusive Community', text: 'SGCSC welcomes learners from every background. Our scholarships, flexible schedules, and supportive culture make quality education accessible to all.' },
              { color: '#c4b5fd', icon: 'fas fa-sync-alt', title: 'Relentless Innovation', text: 'SGCSC stays ahead of the curve. We review our curriculum quarterly, upgrade our labs regularly, and embrace emerging technologies to keep our students future-ready.' },
              { color: '#fde047', icon: 'fas fa-handshake', title: 'Integrity & Transparency', text: 'SGCSC operates with complete openness — from fee structures to certification processes. We earn the trust of our students and their families every single day.' },
            ].map(({ color, icon, title, text }) => (
              <div key={title} className="col-md-6">
                <div style={{
                  background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)',
                  borderRadius: '1.25rem', padding: '1.5rem', height: '100%',
                }}>
                  <div className="d-flex align-items-start gap-3">
                    <span style={{ fontSize: '1.6rem', color, flexShrink: 0, width: '2.5rem', textAlign: 'center' }}>
                      <i className={icon}></i>
                    </span>
                    <div>
                      <h5 className="fw-bold text-white mb-1">{title}</h5>
                      <p className="mb-0" style={{ ...bodyText, fontSize: '0.95rem' }}>{text}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            {/* Student-First spans full width */}
            <div className="col-12">
              <div style={{
                background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)',
                borderRadius: '1.25rem', padding: '1.5rem',
              }}>
                <div className="d-flex align-items-start gap-3">
                  <span style={{ fontSize: '1.6rem', color: '#fcd34d', flexShrink: 0, width: '2.5rem', textAlign: 'center' }}>
                    <i className="fas fa-star"></i>
                  </span>
                  <div>
                    <h5 className="fw-bold text-white mb-1">Student-First Philosophy</h5>
                    <p className="mb-0" style={{ ...bodyText, fontSize: '0.95rem' }}>Every decision at SGCSC is made with our students in mind. From personalized mentorship to career guidance, we place our learners at the heart of everything we do.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Legacy */}
        <section className="card p-4 p-md-5 mb-5">
          <SectionHeader color="#a5b4fc" icon="fas fa-timeline" tag="Our Journey" title="The SGCSC Legacy" />
          <div className="d-flex flex-column gap-3" style={bodyText}>
            <p className="mb-0"><span style={highlight}>SGCSC</span> began as a small initiative in Raipur (Chiraiyakot), Mau, with just a handful of students. But our vision was never small. We dreamed of creating a centre of excellence that would be recognized not just locally, but nationally. Today, with over 2,500+ students trained and a network of successful alumni, that dream is a reality.</p>
            <p className="mb-0">Our journey has been guided by the values we hold dear — integrity, innovation, and inclusion. Every accreditation we have earned, from the <span style={highlight}>Public Trust Act 1882</span> to <span style={highlight}>ISO 9001:2015</span>, is a milestone in this journey, a testament to our relentless pursuit of quality.</p>
            <p className="mb-0">Being registered with <span style={highlight}>NITI Aayog</span> has allowed SGCSC to contribute to national initiatives like Skill India, while our <span style={highlight}>MSME</span> affiliation has enabled us to foster entrepreneurship in our community. But beyond the accolades, what truly defines SGCSC is the trust of our students and their families.</p>
            <p className="mb-0">As we look to the future, SGCSC remains committed to its founding principle: <span style={highlight}>"Practical Knowledge, Professional Growth."</span> We will continue to evolve, innovate, and inspire — because at SGCSC, we believe that education is not just about earning a degree, but about building a future.</p>
          </div>
        </section>

        {/* Why SGCSC Stands Out */}
        <section className="card p-4 p-md-5 mb-5">
          <SectionHeader color="#fda4af" icon="fas fa-rocket" tag="Our Edge" title="Why SGCSC Stands Out" />

          {/* Stats row */}
          <div className="row row-cols-2 row-cols-md-4 g-3 mb-4">
            {[
              { number: '2,500+', label: 'Students Trained' },
              { number: '40+', label: 'Courses Offered' },
              { number: '96%', label: 'Placement Rate' },
              { number: '18+', label: 'Expert Faculty' },
            ].map(({ number, label }) => (
              <div key={label} className="col">
                <div style={{
                  background: 'rgba(255,255,255,0.04)', borderRadius: '1rem',
                  padding: '0.75rem 1rem', border: '1px solid rgba(255,255,255,0.06)',
                  textAlign: 'center',
                }}>
                  <div style={{
                    fontSize: '1.8rem', fontWeight: 800,
                    background: 'linear-gradient(90deg, #c084fc, #67e8f9, #6ee7b7)',
                    WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                  }}>{number}</div>
                  <p className="mb-0 mt-1" style={{ fontSize: '0.75rem', color: 'rgba(165,180,252,0.6)' }}>{label}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="d-flex flex-column gap-3" style={bodyText}>
            <p className="mb-0"><span style={highlight}>What makes SGCSC different?</span> It's not just our accreditations or our infrastructure — it's our unwavering focus on <span style={highlight}>holistic student development</span>. At SGCSC, we don't just teach computer skills; we nurture confident, capable professionals who are ready to take on the world. Our approach is built on three pillars: <span style={highlight}>practical learning, personalized mentorship, and industry connectivity</span>.</p>
            <p className="mb-0">Unlike traditional institutes that rely solely on theoretical instruction, SGCSC integrates <span style={highlight}>real-world projects, live simulations, and industry case studies</span> into every course. Our students don't just learn concepts — they apply them. From building websites to managing databases, our students graduate with a portfolio of work that speaks louder than any certificate.</p>
            <p className="mb-0">Our <span style={highlight}>personalized mentorship program</span> is another differentiator. Every student at SGCSC is assigned a dedicated mentor who tracks their progress, identifies areas for improvement, and provides one-on-one guidance — ensuring no student is left behind.</p>
          </div>
        </section>

      </div>
    </div>
  );
}
