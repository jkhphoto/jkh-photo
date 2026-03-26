'use client'
import { useState } from 'react'

const portraits = ['/images/portrait.jpg', '/images/portrait-2.jpg', '/images/portrait-3.jpg']

export default function InfoPage() {
  const [pIdx, setPIdx] = useState(0)
export default function InfoPage() {
  return (
    <div className="info-page">

      {/* LEFT — portrait + contact */}
      <div className="info-left">
        <div>
          <img
            className="info-portrait"
 src={portraits[pIdx]}
            onMouseEnter={() => setPIdx((pIdx + 1) % portraits.length)}
            alt="Joe Hale"
          />
        </div>
        <div className="info-left-contact">
          <a href="mailto:hello@josephkhale.com">hello@josephkhale.com</a>
          <a href="tel:5187950309">518-795-0309</a>
          <a href="https://www.instagram.com/jkh_photo" target="_blank" rel="noopener">Instagram</a>
          <a href="https://www.linkedin.com/in/josephkhale/" target="_blank" rel="noopener">LinkedIn</a>
        </div>
      </div>

      {/* RIGHT — content */}
      <div className="info-right">

        <div className="info-intro">
          <p className="info-bio-text">
            Hey— I'm Joe.<br /><br />
            I am a commercial and editorial photographer based in Brooklyn, New York.
 I serve as a Partner &amp; Head of Photo at <a href="https://www.footstepcreative.com" target="_blank" rel="noopener">Footstep Creative</a>.
            I am interested in capturing people who are great at whatever they
            do — athletes, artists, or entrepreneurs. Available for assignments globally.
          </p>
 <div className="info-contact-row">
            <a href="mailto:hello@josephkhale.com">hello@josephkhale.com</a>
            <a href="tel:5187950309">518-795-0309</a>
            <a href="https://www.instagram.com/jkh_photo" target="_blank" rel="noopener">Instagram</a>
            <a href="https://www.linkedin.com/in/josephkhale/" target="_blank" rel="noopener">LinkedIn</a>
          </div>
        </div>
        <div className="info-section">
          <div className="info-three-cols">
            <div>
              <div className="info-col-label">Select Clients</div>
              <div className="info-col-body">
                NIKE<br />
                adidas<br />
                Under Armour<br />
                On Running<br />
                lululemon<br />
                PUMA<br />
                Celsius<br />
                REI<br />
                WHOOP<br />
                Veja<br />
                Diadora<br />
                776 Fund<br />
                New Balance<br />
                The North Face<br />
                Tracksmith<br />
                Red Bull<br />
                NOBULL<br />
                NOAH<br />
                TCS
              </div>
            </div>
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

        <div className="info-section">
          <div className="info-cols">
            <div>
              <div className="info-col-label">Press</div>
              <a href="https://athletamag.com/en/behind-the-lights-joe-hale-running-photography/" target="_blank" rel="noopener" className="press-item">
                <div className="press-title">Behind The Lights</div>
                <div className="press-detail">Athleta Magazine, 2024</div>
              </a>
              <a href="https://glorioussport.com/articles/joe-hale-sports-photographer-interview/" target="_blank" rel="noopener" className="press-item">
                <div className="press-title">Fast Lane in Focus</div>
                <div className="press-detail">Glorious Sport Magazine, 2024</div>
              </a>
            </div>
            <div>
              <div className="info-col-label">Resources</div>
              <a href="https://woozy-coaster-566.notion.site/TEMPLATES-165a18636ec680aca574eb449edba695" target="_blank" rel="noopener" className="press-item">
                <div className="press-title">Freelance Business Templates</div>
                <div className="press-detail">Free Notion Database</div>
              </a>
              <a href="https://forimmediaterelease.beehiiv.com/subscribe" target="_blank" rel="noopener" className="press-item">
                <div className="press-title">Newsletter</div>
                <div className="press-detail">For Immediate Release — Subscribe</div>
              </a>
            </div>
          </div>
        </div>

      </div>

    </div>
  )
}
