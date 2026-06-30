'use client';

const LOGO_SRC = '/lucidbots-white.png';

// Navy footer band, bookends the navy header and gives the page a proper close
// with breathing room below the content. Shown on both Refresh and CapEx views.
export default function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="site-footer-inner">
        <div className="sf-left">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <a href="https://www.lucidbots.com" aria-label="Lucid Bots home" className="sf-logo">
            <img alt="Lucid Bots" src={LOGO_SRC} />
          </a>
          <p className="sf-tag">Soft-washing power in the sky. Built in Charlotte, NC.</p>
        </div>
        <div className="sf-contact">
          <a className="sf-link" href="tel:+17049993356">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z" /></svg>
            <span>704-999-3356</span>
          </a>
          <a className="sf-link" href="mailto:sales@lucidbots.com">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z" /><path d="M22 6l-10 7L2 6" /></svg>
            <span>sales@lucidbots.com</span>
          </a>
        </div>
      </div>
      <div className="sf-base">© {new Date().getFullYear()} Lucid Bots. Pricing shown is for planning purposes and is not a quote or binding contract.</div>
    </footer>
  );
}
