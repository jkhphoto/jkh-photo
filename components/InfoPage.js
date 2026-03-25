'use client'

export default function InfoPage() {
  return (
    <div className="info-page">

      {/* LEFT — portrait + name */}
      <div className="info-left">
        <div>
          <img
            className="info-portrait"
            src="/images/portrait.jpg"
            alt="Joe Hale"
          />
        </div>
        <div className="info-left-name">Joe Hale</div>
      </div>

      {/* RIGHT — content */}
      <div className="info-right">

        {/* intro block */}
        <div className="info-intro">
          <div className="info-title-label">JKH Photo</div>
          <div className="info-contact-row">
            <a href="mailto:hello@josephkhale.com">hello@josephkhale.com</a>
            <a href="https://www.instagram.com/jkh_photo" target="_blank" rel="noopener">Instagram</a>
            <a href="https://www.linkedin.com/in/josephkhale/" target="_blank" rel="noopener">LinkedIn</a>
          </div>
          <p className="info-bio-text">
            Commercial and editorial photographer based in Brooklyn, New York.
            Partner &amp; Head of Photo Operations at Footstep Creative.
            Specializing in sport, culture, and lifestyle imagery for brands
            and publications worldwide. Available for assignments globally.
          </p>
        </div>

        {/* Clients */}
        <div className="info-section">
          <div className="info-section-label">Select Clients</div>
          <div className="info-section-body">
            NIKE · adidas · Under Armour · On Running · lululemon · PUMA · Celsius · REI · WHOOP · Veja · Diadora · 776 Fund · New Balance · The North Face · Tracksmith · Red Bull · VaynerMedia · Tinman Elite · 35V · Bandit Running · NOBULL · NOAH · Tata Consultancy Services
          </div>
        </div>

        {/* Publications + Agencies side by side */}
        <div className="info-section">
          <div className="info-cols">
            <div>
              <div className="info-col-label">Select Publications</div>
              <div className="info-col-body">
                HYPEBEAST<br />
                SLAM<br />
                Sports Illustrated<br />
                ESPN<br />
                Boardroom<br />
                Runner's World<br />
                One37PM<br />
                Outside Magazine<br />
                The Washington Post<br />
                OFF Magazine<br />
                Glorious Sport Magazine<br />
                Athleta Magazine<br />
                TEMPO Journal
              </div>
            </div>
            <div>
              <div className="info-col-label">Select Agencies</div>
              <div className="info-col-body">
                Wieden + Kennedy<br />
                Anomaly<br />
                VaynerMedia<br />
                Shadow Lion<br />
                Mojo Supermarket<br />
                Cinco Design<br />
                M+C Saatchi
              </div>
            </div>
          </div>
        </div>

        {/* Press */}
        <div className="info-section">
          <div className="info-section-label">Press</div>
          <a href="https://athletamag.com/en/behind-the-lights-joe-hale-running-photography/" target="_blank" rel="noopener" className="press-item">
            <div className="press-title">Behind The Lights</div>
            <div className="press-detail">Athleta Magazine, 2024</div>
          </a>
          <a href="https://glorioussport.com/articles/joe-hale-sports-photographer-interview/" target="_blank" rel="noopener" className="press-item">
            <div className="press-title">Fast Lane in Focus</div>
            <div className="press-detail">Glorious Sport Magazine, 2024</div>
          </a>
        </div>

        {/* Contact */}
        <div className="info-section">
          <div className="info-section-label">Contact</div>
          <div className="info-section-body">
            <a href="mailto:hello@josephkhale.com" style={{ color: 'var(--fg)', transition: 'opacity 0.2s' }}>hello@josephkhale.com</a><br />
            <a href="tel:5187950309" style={{ color: 'var(--fg)', transition: 'opacity 0.2s' }}>518-795-0309</a><br />
            Brooklyn, New York
          </div>
        </div>

      </div>

      {/* BOTTOM NAV */}
      <div className="info-bottom-nav">
        <a href="/">← Work</a>
        <a href="/">All Projects →</a>
      </div>

    </div>
  )
}
