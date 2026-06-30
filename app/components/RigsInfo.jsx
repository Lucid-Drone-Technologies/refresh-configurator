'use client';

import { RIGS } from '../lib/data';

// Informational rigs section, shown on both the Refresh and CapEx pages.
// These are NOT part of the configurable package, they're reference material.
// Each links to a spec PDF (in /public/rigs/). Styled distinctly from the
// add-on cards so it clearly reads as "info," not "add to your build."
export default function RigsInfo() {
  return (
    <div className="rigs-info">
      <div className="rigs-info-head">
        <div className="rigs-info-title">Need a rig?</div>
        <div className="rigs-info-sub">
          Purpose-built platforms engineered for the Sherpa. These are sold separately, browse the
          spec sheets to find the setup that fits how you work, then talk to your rep.
        </div>
      </div>
      <div className="rigs-info-grid">
        {RIGS.map((rig) => (
          <a key={rig.id} className="rig-card" href={rig.pdf} target="_blank" rel="noopener noreferrer">
            <div className="rig-card-name">{rig.name}</div>
            <div className="rig-card-desc">{rig.desc}</div>
            <div className="rig-card-link">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><path d="M14 2v6h6" /></svg>
              View spec sheet
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}
