'use client';

import { CAPEX_SECTIONS, capexItemById, capexTotal, fmt, taxRateFor, STATE_NAMES, itemById } from '../lib/data';
import RigsInfo from './RigsInfo';

// CapEx (outright purchase) view. Mirrors the Sherpa Package one-pager and the
// Refresh page's styling. The drone is the always-included foundation; everything
// else is an optional add-on. Rigs are a separate informational section (RigsInfo).
export default function CapexBody({ selected, toggle, taxState, setTaxState, onInfo, onLockIn }) {
  const total = capexTotal([...selected]);
  const rate = taxRateFor(taxState);
  const withTax = Math.round(total * (1 + rate));
  const taxed = !!(taxState && rate > 0);
  const bigNumber = taxed ? withTax : total;
  const count = [...selected].filter((id) => capexItemById[id] && !capexItemById[id].core).length + 1;

  return (
    <div className="wrap">
      <div className="hero">
        <h1>Own your Sherpa outright. <em>Build your package.</em></h1>
        <p>Prefer to purchase instead of subscribe? Start with the aircraft, then build the package that fits your business. Your total updates as you go.</p>
      </div>

      <div className="grid">
        <div>
          {CAPEX_SECTIONS.map((section) => {
            // Foundation (core drone): shown as the included box.
            if (section.key === 'foundation') {
              const core = section.items[0];
              const coreDesc = itemById[core.id]?.desc || core.desc;
              return (
                <div className="inc-box" key={section.key}>
                  <div className="inc-eyebrow">{section.label} · {section.sub}</div>
                  <div className="inc-grid">
                    <div className="inc-item">
                      <div className="inc-item-top">
                        <span className="inc-item-name">{core.name}
                          <button className="info-btn" aria-label={`Learn more about ${core.name}`} onClick={() => onInfo(capexItemById[core.id])}>?</button>
                        </span>
                        <span className="inc-item-price">${fmt(core.price)}</span>
                      </div>
                      <div className="inc-item-desc">{coreDesc}</div>
                    </div>
                  </div>
                </div>
              );
            }

            // Priced add-on sections.
            return (
              <div key={section.key}>
                <div className="addable-label">{section.label}</div>
                <div className="addable-grid">
                  {section.items.map((it) => {
                    const on = selected.has(it.id);
                    const priceLabel = it.suite ? `$${fmt(it.priceUp)}` : `$${fmt(it.price)}`;
                    const cardDesc = itemById[it.id]?.desc || it.desc;
                    return (
                      <div className={'card' + (on ? ' added' : '')} key={it.id}>
                        <div className="top">
                          <div className="ttl">{it.name}
                            <button className="info-btn" aria-label={`Learn more about ${it.name}`} onClick={() => onInfo(capexItemById[it.id])}>?</button>
                          </div>
                          <div className="mo">{priceLabel}{it.suite ? <small> or ${fmt(it.priceMo)}/mo</small> : null}</div>
                        </div>
                        <div className="benefit">{cardDesc}</div>
                        <button className="btn-add" onClick={() => toggle(it.id)}>
                          {on ? (
                            <><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M20 6L9 17l-5-5" /></svg>Added · remove</>
                          ) : (
                            <><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 5v14M5 12h14" /></svg>Add</>
                          )}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Sticky purchase panel */}
        <div className="panel-col">
          <div className="panel">
            <span className="eyebrow">Your configuration</span>
            <div className="config-name">Sherpa Purchase</div>
            <div className="price-label">{taxed ? `Est. total with ${taxState} tax` : 'One-time purchase'}</div>
            <div className="priceblock">
              <span className="dollar">$</span>
              <span className="amt">{fmt(bigNumber)}</span>
            </div>
            <div className="terms"><b>Own it outright</b> · {count} item{count === 1 ? '' : 's'}</div>

            <div className="tax-row">
              <select value={taxState} aria-label="Select state for estimated tax" onChange={(e) => setTaxState(e.target.value)}>
                <option value="">Add state for estimated tax</option>
                {Object.keys(STATE_NAMES).sort((a, b) => STATE_NAMES[a].localeCompare(STATE_NAMES[b])).map((code) => (
                  <option key={code} value={code}>{STATE_NAMES[code]}</option>
                ))}
              </select>
            </div>

            <div className="tax-line show">
              {taxState && rate > 0 && (
                <span className="tl-total">${fmt(total)} before tax · estimate uses the {taxState} state rate only, local taxes not included.</span>
              )}
              {taxState && rate === 0 && (
                <span className="tl-total">{STATE_NAMES[taxState]} has no state sales tax.</span>
              )}
              <span className="tl-pt">Purchase pricing is shown before applicable taxes. A one-time shipping fee is added at finalization. This summary is for planning only and is not a quote or binding contract.</span>
            </div>

            <button className="btn btn-send" onClick={onLockIn}>Request this build</button>
          </div>
        </div>
      </div>

      {/* Informational rigs section (not part of the build) */}
      <RigsInfo />
    </div>
  );
}
