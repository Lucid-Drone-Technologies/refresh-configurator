'use client';

import { RIGS, fmt } from '../lib/data';

// Rigs section. Two modes:
//  - Info-only (default, used on the Refresh page): reference cards linking to
//    spec PDFs. Rigs are sold separately there, not part of the subscription.
//  - Selectable (CapEx page): pick-one priced add-ons that fold into the package
//    total, each still linking to its spec PDF.
export default function RigsInfo({ selectable = false, selected, toggle, onInfo }) {
  if (!selectable) {
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

  // Selectable (CapEx): pick-one priced add-ons.
  const isSel = (id) => selected && selected.has(id);
  return (
    <div className="rigs-info">
      <div className="rigs-info-head">
        <div className="rigs-info-title">Add a rig</div>
        <div className="rigs-info-sub">
          Purpose-built platforms engineered for the Sherpa. Pick the one that fits how you work and
          add it to your package. Open a spec sheet for the full build on each.
        </div>
        <div className="rigs-info-fine">
          Skid systems (Van, Truck Bed) mount into a vehicle you provide, the vehicle is not included.
          Trailer rigs include the trailer, the tow vehicle is not included.
        </div>
      </div>
      <div className="rigs-info-grid">
        {RIGS.map((rig) => {
          const on = isSel(rig.id);
          return (
            <div key={rig.id} className={`rig-card rig-card-sel ${on ? 'rig-on' : ''}`}>
              <div className="rig-card-top">
                <div className="rig-card-name">{rig.name}</div>
                <div className="rig-card-price">${fmt(rig.price)}</div>
              </div>
              <div className="rig-card-desc">{rig.desc}</div>
              <button
                className={`btn-add rig-add ${on ? 'added' : ''}`}
                onClick={() => toggle(rig.id)}
                aria-pressed={on}
              >
                {on ? (
                  <><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M20 6L9 17l-5-5" /></svg>Added · remove</>
                ) : (
                  <><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 5v14M5 12h14" /></svg>Add</>
                )}
              </button>
              <a className="rig-card-link" href={rig.pdf} target="_blank" rel="noopener noreferrer">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><path d="M14 2v6h6" /></svg>
                View spec sheet
              </a>
            </div>
          );
        })}
      </div>
    </div>
  );
}
