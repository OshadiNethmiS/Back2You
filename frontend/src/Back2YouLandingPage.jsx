import { useState, useEffect } from "react";
import heroBg from './images/building.jpg';
import './LandingPage.css';
import log from './images/Logo.png';
import '@fortawesome/fontawesome-free/css/all.min.css';



function useScrollReveal() {
  useEffect(() => {
    const els = document.querySelectorAll(".reveal");
    const obs = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && e.target.classList.add("visible")),
      { threshold: 0.12 }
    );
    els.forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, []);
}

function NavBar() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", h);
    return () => window.removeEventListener("scroll", h);
  }, []);

  return (
    <nav style={{
      position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
      transition: "all 0.3s ease",
      background: scrolled ? "rgba(17,25,45,1)" : "rgba(15,23,42,0.75)",
      backdropFilter: "blur(16px)",
      borderBottom: scrolled ? "1px solid rgba(255,255,255,0.1)" : "none",
      padding: scrolled ? "12px 0" : "20px 0",
    }}>
      <div style={{
        padding: "0 clamp(20px,6vw,80px)",
        display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 40, height: 40, borderRadius: 10,
            background: "linear-gradient(135deg, var(--secondary), var(--primary))",
            display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18,
          }}>
            <img src={log} alt="Back2You Logo" style={{ width: '30px', height: 'auto' }} />
          </div>
         <span style={{ fontFamily: 'Times New Roman' , fontSize: '27px', fontWeight: '700', color: 'white', letterSpacing: '-0.02em' }}>
                 Back<span style={{ color: 'gold' }}>2</span>You
               </span> 
        </div>

        <div style={{ display: "flex", gap: 32, alignItems: "center" }}>
          {[
            { label: "What is B2Y?",    href: "#about" },
            { label: "Why Choose B2Y?", href: "#why" },
            { label: "How it Works",    href: "#how" },
            { label: "Contact Us",      href: "#contact" },
          ].map((l) => (
            <a key={l.label} href={l.href} className="nav-link" style={{ color: "rgba(255,255,255,0.85)" }}>
              {l.label}
            </a>
          ))}
        </div>
      </div>
    </nav>
  );
}

function Hero() {
  return (
    <section
      className="hero-bg noise"
      style={{ backgroundImage: `linear-gradient(150deg, rgba(15,23,42,0.40) 0%, rgba(21,32,56,0.44) 55%, rgba(10,22,40,0.90) 100%), url(${heroBg})`, }}
    >
      <div className="hero-orb" style={{ width: 150, height: 800, background: "var(--secondary)", top: "-100px", right: "-100px" }} />
      <div className="hero-orb" style={{ width: 640, height: 120, background: "var(--accent)", bottom: "10%", left: "5%", opacity: 0.15 }} />
      <div className="hero-overlay" />
      <div className="hero-content">
        <div style={{ marginBottom: 24 }}>
          <span className="tag-pill" style={{ background: "rgba(37,99,235,0.25)", borderColor: "rgba(37,99,235,0.4)", color: "rgba(255,255,255,0.9)" }}>
            <span className="dot" />
            Campus Lost &amp; Found Platform
          </span>
        </div>
        <h1 className="hero-title" style={{ marginBottom: 20, maxWidth: 760 }}>
          Lost Something?<br />
          We'll Bring It <em>Back2You.</em>
        </h1>
        <p className="hero-sub" style={{ marginBottom: 36 }}>
          Every semester, hundreds of belongings go missing across campus. Back2You bridges the gap — connecting finders and owners through a platform that's intuitive, reliable, and community-first.
        </p>
        <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
          <a href="/home" className="btn btn-secondary" onClick={(e) => { e.preventDefault(); window.location.href = "/home"; }}>
            <i className="fa-solid fa-table-list"></i> View Lost Items
          </a>
          <a href="/home" className="btn btn-primary" onClick={(e) => { e.preventDefault(); window.location.href = "/found"; }}>
            <i className="fa-solid fa-magnifying-glass"></i> View Found Items
          </a>
        </div>
      </div>
    </section>
  );
}

function AboutSection() {
  return (
    <section id="about" style={{ background: "var(--primary)", padding: "80px clamp(20px,6vw,80px)" }}>
      <div style={{ maxWidth: 1000, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <span className="tag-pill" style={{
            background: "rgba(37,99,235,0.25)", borderColor: "rgba(37,99,235,0.4)",
            color: "rgba(255,255,255,0.9)", marginBottom: 16, display: "inline-flex"
          }}>
            About the Platform
          </span>
          <h2 className="section-title" style={{ marginBottom: 12, color: "white", textAlign: "center" }}>
            What is <span style={{ color: "var(--secondary)" }}>Back2You?</span>
          </h2>
          <p style={{ color: "rgba(255,255,255,0.55)", fontSize: 15, maxWidth: 560, margin: "0 auto" }}>
            A free, university-affiliated Lost &amp; Found platform for students, faculty, and staff.
          </p>
        </div>
        <div className="reveal">
          <div style={{
            borderRadius: 20, overflow: "hidden",
            boxShadow: "0 24px 80px rgba(0,0,0,0.5)",
            border: "1px solid rgba(255,255,255,0.07)",
            aspectRatio: "16/9",
          }}>
            <video width="100%" height="100%" autoPlay muted loop playsInline style={{ display: "block", objectFit: "cover" }}>
              <source src="/video/B2Y.mp4" type="video/mp4" />
            </video>
          </div>
        </div>
      </div>
    </section>
  );
}

const tagItems = [
  { icon: "fa-brands fa-leanpub", label: "Books" },
  { icon: "fa-solid fa-key", label: "Keys" },
  { icon: "fa-regular fa-file", label: "Documents" },
  { icon: "fa-solid fa-shirt", label: "Clothing" },
  { icon: "fa-solid fa-laptop", label: "Electronics" },
];

function WhatIsSection() {
  return (
    <section style={{ background: "var(--bg)", padding: "80px clamp(20px,6vw,80px)" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <div className="reveal" style={{ marginBottom: 16 }}>
          <span className="tag-pill">The Platform</span>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 64, alignItems: "center" }}>
          <div>
            <h2 className="section-title reveal reveal-delay-1" style={{ marginBottom: 16 }}>It Is...</h2>
            <p className="section-sub reveal reveal-delay-2" style={{ marginBottom: 32 }}>
              A campus-wide platform connecting lost item owners with finders — quick, free, and built for your university community.
            </p>
            <div className="reveal reveal-delay-3">
              <a href="#how" className="btn btn-primary">Learn How It Works →</a>
            </div>
          </div>
          <div className="reveal reveal-delay-2" style={{ position: "relative" }}>
            <div style={{
              background: "linear-gradient(135deg, var(--primary) 0%, var(--primary-mid) 100%)",
              borderRadius: 28, padding: 40, color: "white",
              boxShadow: "var(--shadow-lg)", border: "1px solid rgba(37,99,235,0.2)",
            }}>
              <div style={{ fontSize: 48, marginBottom: 20 }}>
                <i className="fa-solid fa-arrows-to-dot" style={{ color: "rgb(255, 59, 99)" }}></i>
              </div>
              <div style={{ fontFamily: "var(--font-head)", fontSize: 24, fontWeight: 700, marginBottom: 16 }}>Lost items across campus</div>
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                {tagItems.map((t) => (
                  <span key={t.label} style={{
                    background: "rgba(37,99,235,0.20)", borderRadius: 999,
                    border: "1px solid rgba(37,99,235,0.35)",
                    padding: "6px 14px", fontSize: 12, fontWeight: 500,
                    display: "flex", alignItems: "center", gap: 6,
                  }}>
                    <i className={t.icon} style={{ color: "rgb(255, 212, 59)" }}></i>
                    {t.label}
                  </span>
                ))}
              </div>
            </div>
            <div style={{
              position: "absolute", bottom: -24, right: -24,
              width: 120, height: 120, borderRadius: "50%",
              background: "var(--accent)", opacity: 0.15, zIndex: -1,
            }} />
          </div>
        </div>
      </div>
    </section>
  );
}

function WhyChooseSection() {
  const features = [
    {
      icon: <i className="fa-solid fa-hand-holding-dollar"></i>,
      color: "#DBEAFE",
      label: "Zero Cost",
      sub: "Always Free",
      desc: "Completely free for all students, faculty, and staff. No fees, no subscriptions — ever.",
    },
    {
      icon: <i className="fa-brands fa-gripfire"></i>,
      color: "#FEF3C7",
      label: "Simple to Use",
      sub: "3-Step Process",
      desc: "Report in under a minute. A simple form is all it takes to get started.",
    },
    {
      icon: <i className="fa-brands fa-hornbill"></i>,
      color: "#DCFCE7",
      label: "Smart & Fast",
      sub: "Notification System",
      desc: "Enables students to send email notifications to the item owner and Admin when a matching lost item is found.",
    },
  ];

  return (
    <section id="why" style={{ background: "var(--bg-alt)", padding: "100px clamp(20px,6vw,80px)" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <div className="reveal" style={{ textAlign: "center", marginBottom: 16 }}>
          <span className="tag-pill">Why Us?</span>
        </div>
        <h2 className="section-title reveal reveal-delay-1" style={{ textAlign: "center", marginBottom: 12 }}>
          Why Choose <span style={{ color: "var(--secondary)" }}>Back2You?</span>
        </h2>
        <p className="section-sub reveal reveal-delay-2" style={{ textAlign: "center", margin: "0 auto 52px" }}>
          Faster, smarter, and more personal than any traditional lost and found.
        </p>
        <div className="grid-3">
          {features.map((f, i) => (
            <div key={f.label} className={`feature-card reveal reveal-delay-${i + 1}`}>
              <div className="feature-icon" style={{ background: f.color, fontSize: 28 }}>{f.icon}</div>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--accent)", marginBottom: 6 }}>{f.sub}</div>
              <h3 style={{ fontFamily: "var(--font-head)", fontSize: 22, fontWeight: 700, marginBottom: 10, color: "var(--text)" }}>{f.label}</h3>
              <p style={{ fontSize: 14, lineHeight: 1.7, color: "var(--muted)" }}>{f.desc}</p>
            </div>
          ))}
        </div>
        <div className="reveal" style={{ marginTop: 48 }}>
          <div className="testimonial">
            <div style={{ position: "relative", zIndex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--accent-light)", marginBottom: 12 }}>Our Mission</div>
              <h3 style={{ fontFamily: "var(--font-head)", fontSize: "clamp(24px,3vw,38px)", fontWeight: 700, marginBottom: 18, lineHeight: 1.2 }}>
                Every Lost Item Has a Story
              </h3>
              <p style={{ fontSize: 16, lineHeight: 1.8, opacity: 0.82, maxWidth: 680 }}>
                ABC item should stay lost for long. Back2You connects the campus community through technology and trust — making lost and found fast, transparent, and genuinely helpful. <i className="fa-solid fa-heart" style={{ color: "#912828", fontSize: '24px' }}></i>
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function HowItWorksSection() {
  const steps = [
    { n: "01", emoji: <i className="fa-solid fa-heart-crack"  style={{ color: '#3e28ce', fontSize: '30px' }}></i>, title: "Report Lost Item", desc: "Submit a report in under 2 minutes. Describe your item, when and where you last had it, and add a photo if you have one." },
    { n: "02", emoji: <i className="fa-regular fa-paper-plane"  style={{ color: '#3e28ce', fontSize: '30px' }}></i> , title: "Quick Communication", desc: "Our system scans newly found reports and matches them based on description, location, keywords, and timestamps." },
    { n: "03", emoji: <i className="fa-solid fa-handshake" style={{ color: '#3e28ce', fontSize: '30px' }}></i>, title: "Get Unified & Reunite", desc: "You receive an instant notification the moment a match is found. Connect with the finder confidently and safely get your item back." },
  ];

  return (
    <section id="how" style={{ background: "var(--bg)", padding: "100px clamp(20px,6vw,80px)" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <div className="reveal" style={{ marginBottom: 16 }}>
          <span className="tag-pill">The Process</span>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 64, alignItems: "start" }}>
          <div>
            <h2 className="section-title reveal reveal-delay-1" style={{ marginBottom: 12 }}>
              So, how does<br />
              <span style={{ fontStyle: "italic", color: "var(--secondary)" }}>this work?</span>
            </h2>
            <p className="section-sub reveal reveal-delay-2" style={{ marginBottom: 48 }}>
              Three simple steps — report, match, reunite.
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
              {steps.map((s, i) => (
                <div key={s.n} className={`how-step reveal reveal-delay-${i + 1}`}>
                  <div className="how-num">{s.n}</div>
                  <div>
                    <div style={{ fontSize: 22, marginBottom: 6 }}>{s.emoji}</div>
                    <h4 style={{ fontFamily: "var(--font-head)", fontSize: 18, fontWeight: 700, marginBottom: 8, color: "var(--text)" }}>{s.title}</h4>
                    <p style={{ fontSize: 14, lineHeight: 1.75, color: "var(--muted)" }}>{s.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="reveal reveal-delay-2">
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              {[
                { emoji: <i className="fa-brands fa-searchengin"></i>, bg: "var(--secondary)",   label: "Smart Search",    sub: "AI-powered matching" },
                { emoji: <i className="fa-solid fa-bahai"></i>, bg: "var(--accent)",      label: "Real-time Status", sub: "Campus-wide coverage" },
                { emoji: <i className="fa-solid fa-bell" style={{ color: "rgb(255, 212, 59)", fontSize: '35px'}}></i>, bg: "var(--primary-mid)", label: "Instant Alert",   sub: "Real-time notifications" },
                { emoji: <i className="fa-regular fa-circle-check" style={{ color: "rgb(255, 212, 59)", fontSize: '40px'}}></i>,  bg: "var(--primary)",label: "Safe Return",sub: "Verified handover" },
              ].map((c) => (
                <div key={c.label}
                  style={{ background: c.bg, borderRadius: 18, padding: "28px 24px", color: "white", transition: "transform 0.25s", cursor: "pointer" }}
                  onMouseEnter={e => e.currentTarget.style.transform = "scale(1.04)"}
                  onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}
                >
                  <div style={{ fontSize: 32, marginBottom: 12 }}>{c.emoji}</div>
                  <div style={{ fontFamily: "var(--font-head)", fontSize: 16, fontWeight: 700, marginBottom: 4 }}>{c.label}</div>
                  <div style={{ fontSize: 12, opacity: 0.72 }}>{c.sub}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function BrowseSection() {
  return (
    <section style={{ background: "var(--bg-alt)", padding: "80px clamp(20px,6vw,80px)" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <div className="reveal" style={{ marginBottom: 60 }}>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--accent)", marginBottom: 8 }}>Browse</div>
            <h3 style={{ fontFamily: "var(--font-head)", fontSize: 28, fontWeight: 700, marginBottom: 25 }}>Browse Lost Items</h3>
            <a href="/home" className="btn btn-secondary" onClick={(e) => { e.preventDefault(); window.location.href = "/home"; }}>
              <i className="fa-solid fa-table-list"></i> View All Lost Items
            </a>
          </div>
        </div>
        <div className="reveal">
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--secondary)", marginBottom: 8 }}>Browse</div>
            <h3 style={{ fontFamily: "var(--font-head)", fontSize: 28, fontWeight: 700, marginBottom: 25 }}>Browse Found Items</h3>
            <a href="/home" className="btn btn-primary" onClick={(e) => { e.preventDefault(); window.location.href = "/found"; }}>
               <i className="fa-solid fa-magnifying-glass"></i> View All Found Items
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer id="contact" className="footer-bg" style={{ padding: "56px clamp(20px,6vw,80px) 32px", textAlign: "center" }}>
      <div style={{ maxWidth: 640, margin: "0 auto" }}>
        {/* Logo + name */}
        
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, marginBottom: 16 }}>
          <div style={{ width: 65, height: 65, borderRadius: 12, background: "linear-gradient(135deg,var(--secondary),var(--primary))", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 10 }}>
            <img src={log} alt="Back2You Logo" style={{ width: 50, height: "auto" }} />
          </div>
          <span style={{ fontFamily: 'Times New Roman' , fontSize: '27px', fontWeight: '700', color: 'white', letterSpacing: '-0.02em' }}>
                 Back<span style={{ color: 'gold' }}>2</span>You
               </span> 
          <span style={{ fontSize: 12, letterSpacing: "0.15em", color: "rgba(255,255,255,0.55)", textTransform: "uppercase" }}>Campus Lost &amp; Found</span>
        </div>

        {/* Tagline */}
        <p style={{ fontSize: 13, letterSpacing: "0.05em", color: "rgba(255,255,255,0.65)", marginBottom: 24 }}>
          FAST <span style={{ opacity: 0.4 }}>|</span> FREE <span style={{ opacity: 0.4 }}>|</span> COMMUNITY-POWERED
        </p>

        <div className="footer-divider" style={{ margin: "0 auto 28px", width: 64, height: 1 }} />

        {/* Contact info */}
        <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 20, marginBottom: 24, fontSize: 13 }}>
          <a href="mailto:back2you@gmail.com" className="footer-link" style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <i className="fa-solid fa-envelope"></i> back2you@gmail.com
          </a>
          <a href="tel:0701232323" className="footer-link" style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <i className="fa-solid fa-phone"></i> 070 123 2323
          </a>
        </div>

        <div className="footer-divider" style={{ margin: "0 auto 28px", width: 64, height: 1 }} />

        {/* Social */}
        <p style={{ fontSize: 13, color: "rgba(255,255,255,0.65)", marginBottom: 14 }}>Connect with Back2You:</p>
        <div style={{ display: "flex", justifyContent: "center", gap: 10, marginBottom: 32 }}>
          {[
            { icon: "fa-brands fa-facebook-f", href: "#" },
            { icon: "fa-brands fa-instagram", href: "#" },
            { icon: "fa-brands fa-linkedin-in", href: "#" },
            { icon: "fa-solid fa-share-nodes", href: "#" },
          ].map((s, i) => (
            <a key={i} href={s.href} className="footer-social-icon" aria-label="social link">
              <i className={s.icon}></i>
            </a>
          ))}
        </div>

        {/* Staff portal */}
        <a href="/admin" className="footer-link" style={{ fontWeight: 600, display: "inline-block", marginBottom: 24 }}>
          Back2You Staff Portal
        </a>

        {/* Bottom links */}
        <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", alignItems: "center", gap: 8, fontSize: 13 }}>
          {["Accessibility", "Contact Us", "Browse Lost", "Browse Found", "Privacy Policy", "Terms of Use"].map((l, i, arr) => (
            <span key={l} style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <a href={l === "Contact Us" ? "#contact" : `#${l.toLowerCase().replace(/\s+/g, "-")}`} className="footer-link">{l}</a>
              {i < arr.length - 1 && <span style={{ opacity: 0.3 }}>/</span>}
            </span>
          ))}
        </div>
      </div>
    </footer>
  );
}
  


export default function Back2YouLandingPage() {
  useScrollReveal();
  return (
    <>
      <NavBar />
      <main>
        <Hero />
        <AboutSection />
        <WhatIsSection />
        <WhyChooseSection />
        <HowItWorksSection />
        <BrowseSection />
      </main>
      <Footer />
    </>
  );
}
