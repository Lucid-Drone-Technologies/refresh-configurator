'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  TIERS, ITEMS, GROUPS, itemById, STATE_NAMES, STATE_TAX,
  fmt, computeTotal, cashTotal, financeTotal, configName, taxRateFor, TERM,
  CAPEX_ITEMS, capexItemById, capexTotal, refreshEquivalent,
} from '../lib/data';
import CapexBody from './CapexBody';
import RigsInfo from './RigsInfo';
import SiteFooter from './SiteFooter';

const LOGO_SRC = '/lucidbots-white.png';

// HubSpot Forms API (handles contact create/update + ad attribution via the hubspotutk cookie).
const HS_PORTAL_ID = '22607993';
const HS_FORM_GUID = '5859ec8c-a9a0-43c0-8f0e-1315a075d2e9';
const HS_ENDPOINT = `https://api.hsforms.com/submissions/v3/integration/submit/${HS_PORTAL_ID}/${HS_FORM_GUID}`;
const PLAN_TO_HS = { 'Base Camp': 'base_camp', Ascent: 'ascent', Summit: 'summit' };

// Posts the configuration to HubSpot via the Forms API, from the browser so the
// hubspotutk cookie (gclid/UTM attribution) is included. Best-effort: never blocks the lead.
// Lightweight CapEx version: creates/finds the contact (with ad attribution via
// the hubspotutk cookie) but writes no custom fields. Best-effort, never blocks.
async function submitCapexContact({ name, email, phone }) {
  try {
    const hutk = (typeof document !== 'undefined' ? document.cookie : '')
      .split('; ')
      .find((r) => r.startsWith('hubspotutk='))?.split('=')[1] || '';
    const parts = String(name).trim().split(/\s+/);
    const firstName = parts.shift() || '';
    const lastName = parts.join(' ');
    const payload = {
      fields: [
        { name: 'firstname', value: firstName },
        { name: 'lastname', value: lastName },
        { name: 'email', value: email },
        { name: 'phone', value: phone },
      ],
      context: {
        ...(hutk ? { hutk } : {}),
        pageUri: 'https://pricing.lucidbots.com/',
        pageName: 'Lucid Bots CapEx Pricing Configurator',
      },
    };
    const res = await fetch(HS_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      console.error('HubSpot capex contact submit failed:', res.status, await res.text());
    }
  } catch (err) {
    console.error('HubSpot capex contact submit error:', err);
  }
}

// Posts the full Refresh configuration to HubSpot via the Forms API, from the
// browser so the hubspotutk cookie (gclid/UTM attribution) is included.
async function submitToHubSpot({ name, email, phone, planName, addonNames, monthlyTotal }) {
  try {
    const hutk = (typeof document !== 'undefined' ? document.cookie : '')
      .split('; ')
      .find((r) => r.startsWith('hubspotutk='))?.split('=')[1] || '';

    const parts = String(name).trim().split(/\s+/);
    const firstName = parts.shift() || '';
    const lastName = parts.join(' ');

    const payload = {
      fields: [
        { name: 'firstname', value: firstName },
        { name: 'lastname', value: lastName },
        { name: 'email', value: email },
        { name: 'phone', value: phone },
        { name: 'refresh_configured_plan', value: PLAN_TO_HS[planName] || String(planName || '').toLowerCase().replace(/\s+/g, '_') },
        { name: 'refresh_addons', value: addonNames.join(', ') },
        { name: 'refresh_monthly_total', value: String(monthlyTotal) },
      ],
      context: {
        ...(hutk ? { hutk } : {}),
        pageUri: 'https://pricing.lucidbots.com/',
        pageName: 'Lucid Bots Refresh Pricing Configurator',
      },
    };

    const res = await fetch(HS_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      console.error('HubSpot form submit failed:', res.status, await res.text());
    }
  } catch (err) {
    console.error('HubSpot form submit error:', err);
  }
}

export default function Configurator() {
  const [mode, setMode] = useState('refresh'); // 'refresh' | 'capex'
  const [capexSelected, setCapexSelected] = useState(() => new Set());
  const [tier, setTier] = useState('base');
  const [selected, setSelected] = useState(() => new Set(TIERS.base.items));
  const [taxState, setTaxState] = useState('');
  const [flash, setFlash] = useState(false);

  const [infoItem, setInfoItem] = useState(null);
  const [showCompare, setShowCompare] = useState(false);
  const [showSend, setShowSend] = useState(false);
  const [showSent, setShowSent] = useState(false);
  const [toast, setToast] = useState('');

  const [form, setForm] = useState({ name: '', email: '', phone: '' });
  const [honeypot, setHoneypot] = useState('');
  const [sendOpenedAt, setSendOpenedAt] = useState(0);
  const [formErr, setFormErr] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [downloading, setDownloading] = useState(false);

  // Load config from URL on mount
  useEffect(() => {
    const p = new URLSearchParams(window.location.search);
    if (p.get('t') && TIERS[p.get('t')]) {
      const tk = p.get('t');
      const a = (p.get('a') || '').split(',').filter((x) => itemById[x]);
      const next = new Set(a.length ? a : TIERS[tk].items);
      TIERS[tk].items.forEach((id) => next.add(id));
      setTier(tk);
      setSelected(next);
    }
    if (p.get('s') && STATE_TAX[p.get('s')] !== undefined) setTaxState(p.get('s'));
  }, []);

  const selectedIds = [...selected];
  const total = computeTotal(tier, selectedIds);
  const rate = taxRateFor(taxState);
  const isLocked = useCallback((id) => TIERS[tier].items.includes(id), [tier]);

  const doFlash = () => { setFlash(true); setTimeout(() => setFlash(false), 260); };

  const selectTier = (key) => {
    setTier(key);
    setSelected(new Set(TIERS[key].items));
    doFlash();
  };

  const toggleItem = (id) => {
    if (isLocked(id)) return;
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
    doFlash();
  };

  const toggleCapex = (id) => {
    setCapexSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const cfgName = configName(tier, selectedIds);
  const refresh24 = total * TERM;
  const cash = cashTotal(selectedIds);
  const fin = financeTotal(selectedIds);
  const pctCash = cash > refresh24 ? Math.round(((cash - refresh24) / cash) * 100) : 0;
  const pctFin = fin > refresh24 ? Math.round(((fin - refresh24) / fin) * 100) : 0;

  const withTax = Math.round(total * (1 + rate));
  const pctLabel = (rate * 100).toFixed(3).replace(/\.?0+$/, '');

  // Big number + label logic
  let bigNumber = total;
  let priceLabel = 'Monthly subscription';
  if (taxState && rate > 0) {
    bigNumber = withTax;
    priceLabel = `Est. monthly with ${pctLabel}% ${taxState} tax`;
  }

  function encodeState() {
    const p = new URLSearchParams();
    p.set('t', tier);
    p.set('a', selectedIds.join(','));
    if (taxState) p.set('s', taxState);
    return window.location.origin + window.location.pathname + '?' + p.toString();
  }

  async function downloadPdf() {
    if (downloading) return;
    setDownloading(true);
    try {
      const body = mode === 'capex'
        ? { mode: 'capex', capexSelected: [...capexSelected], taxState }
        : { tier, selected: selectedIds, taxState };
      const res = await fetch('/api/pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error('pdf failed');
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = mode === 'capex'
        ? 'Sherpa-Purchase.pdf'
        : `Refresh-${cfgName.replace(/[^a-z0-9]+/gi, '-')}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (e) {
      // no-op; the customer already submitted, this is just their copy
    } finally {
      setDownloading(false);
    }
  }

  function openSend() {
    // Intent event: fires on the raw "Lock in" click, before the form.
    // Lets marketing see click-to-submit drop-off in GTM (not used for bidding).
    if (typeof window !== 'undefined') {
      const addonNames = selectedIds
        .filter((id) => !TIERS[tier].items.includes(id))
        .map((id) => itemById[id]?.name)
        .filter(Boolean);
      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push({
        event: 'refresh_intent',
        plan: TIERS[tier].name,
        plan_price: TIERS[tier].priceNum,
        addons: addonNames,
        total_monthly: total,
      });
    }
    setFormErr('');
    setHoneypot('');
    setSendOpenedAt(Date.now());
    setShowSend(true);
  }

  async function submitSend() {
    setFormErr('');
    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim());
    const phoneOk = form.phone.replace(/\D/g, '').length >= 10;
    if (!form.name.trim()) { setFormErr('Please enter your name.'); return; }
    if (!emailOk) { setFormErr('Please enter a valid email.'); return; }
    if (!phoneOk) { setFormErr('Please enter a valid phone number.'); return; }

    setSubmitting(true);
    try {
      if (mode === 'capex') {
        const capexIds = [...capexSelected];
        const res = await fetch('/api/submit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: form.name.trim(),
            email: form.email.trim(),
            phone: form.phone.trim(),
            mode: 'capex',
            capexSelected: capexIds,
            taxState,
            company_website: honeypot,
            elapsedMs: sendOpenedAt ? Date.now() - sendOpenedAt : 9999,
          }),
        });
        if (!res.ok) throw new Error('submit failed');
        const capexAddons = capexIds.map((id) => capexItemById[id]?.name).filter(Boolean);
        // Create/find the contact in HubSpot (basic fields + ad attribution).
        // No custom field writeback for CapEx yet — just get the lead into the CRM.
        submitCapexContact({
          name: form.name.trim(),
          email: form.email.trim(),
          phone: form.phone.trim(),
        });
        // Conversion event (separate from Refresh so marketing can measure it on its own).
        if (typeof window !== 'undefined') {
          window.dataLayer = window.dataLayer || [];
          window.dataLayer.push({
            event: 'capex_configure',
            addons: capexAddons,
            total_purchase: capexTotal(capexIds),
          });
        }
        setShowSend(false);
        setShowSent(true);
        return;
      }

      const res = await fetch('/api/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name.trim(),
          email: form.email.trim(),
          phone: form.phone.trim(),
          tier,
          selected: selectedIds,
          taxState,
          link: encodeState(),
          company_website: honeypot,
          elapsedMs: sendOpenedAt ? Date.now() - sendOpenedAt : 9999,
        }),
      });
      if (!res.ok) throw new Error('submit failed');
      const addonNames = selectedIds
        .filter((id) => !TIERS[tier].items.includes(id))
        .map((id) => itemById[id]?.name)
        .filter(Boolean);
      // Send to HubSpot via the Forms API (contact + attribution). Best-effort.
      submitToHubSpot({
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        planName: TIERS[tier].name,
        addonNames,
        monthlyTotal: total,
      });
      // Conversion event for Google Ads / GTM (spec from marketing).
      if (typeof window !== 'undefined') {
        window.dataLayer = window.dataLayer || [];
        window.dataLayer.push({
          event: 'refresh_configure',
          plan: TIERS[tier].name,
          plan_price: TIERS[tier].priceNum,
          addons: addonNames,
          total_monthly: total,
        });
      }
      setShowSend(false);
      setShowSent(true);
    } catch (e) {
      setFormErr('Something went wrong sending your build. Please try again, or email refresh@lucidbots.com.');
    } finally {
      setSubmitting(false);
    }
  }

  // Grouped addable items
  const included = ITEMS.filter((it) => it.included || isLocked(it.id));
  const addable = ITEMS.filter((it) => !(it.included || isLocked(it.id)) && !it.standalone);
  const standaloneItems = ITEMS.filter((it) => it.standalone && !isLocked(it.id));

  return (
    <>
      <header>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <a href="https://www.lucidbots.com" aria-label="Lucid Bots home" className="hdr-logo">
          <img alt="Lucid Bots" src={LOGO_SRC} />
        </a>
        <div className="hdr-right">
          <div className="mode-toggle" role="tablist" aria-label="Pricing mode">
            <button
              role="tab"
              aria-selected={mode === 'refresh'}
              className={`mode-btn ${mode === 'refresh' ? 'mode-on' : ''}`}
              onClick={() => setMode('refresh')}
            >Refresh</button>
            <button
              role="tab"
              aria-selected={mode === 'capex'}
              className={`mode-btn ${mode === 'capex' ? 'mode-on' : ''}`}
              onClick={() => setMode('capex')}
            >CapEx</button>
          </div>
          <div className="hdr-contact">
            <a className="hdr-btn" href="tel:+17049993356">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z" /></svg>
              <span>704-999-3356</span>
            </a>
            <a className="hdr-btn" href="mailto:refresh@lucidbots.com">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z" /><path d="M22 6l-10 7L2 6" /></svg>
              <span>refresh@lucidbots.com</span>
            </a>
          </div>
        </div>
      </header>

      {mode === 'capex' && (
        <CapexBody
          selected={capexSelected}
          toggle={toggleCapex}
          taxState={taxState}
          setTaxState={setTaxState}
          onInfo={setInfoItem}
          onLockIn={openSend}
          onCompare={() => setShowCompare(true)}
        />
      )}

      {mode === 'refresh' && (
      <>
      <div className="wrap">
        <div className="hero">
          <h1>Start earning with a Sherpa. <em>$0 down.</em></h1>
          <p>Build your subscription below. The drone, software, support, and upgrades, all in one monthly price.</p>
        </div>

        <div className="grid">
          <div>
            <div className="section-head">
              <h2>1 · Where are you today?</h2>
              <span className="hint">Pick one. We&apos;ll set your starting point.</span>
            </div>
            <div className="choices">
              {Object.values(TIERS).map((t) => (
                <button key={t.key} className={'choice' + (tier === t.key ? ' active' : '')} aria-pressed={tier === t.key} onClick={() => selectTier(t.key)}>
                  <span className="ch-text">{t.choice}</span><span className="ch-arrow">→</span>
                </button>
              ))}
            </div>

            <div className="section-head" style={{ marginTop: 30 }}>
              <h2>2 · Your plan</h2>
              <span className="hint">Switch anytime.</span>
            </div>
            <div className="tiers">
              {Object.values(TIERS).map((t) => (
                <button key={t.key} className={'tier' + (tier === t.key ? ' active' : '')} aria-pressed={tier === t.key} onClick={() => selectTier(t.key)}>
                  <div className="check"><svg viewBox="0 0 24 24" fill="none" stroke="#142933" strokeWidth="3.5"><path d="M20 6L9 17l-5-5" /></svg></div>
                  <div className="outcome">{t.outcome}</div>
                  <div className="num">{t.num}</div>
                  <div className="price">{t.price}<small> /mo · $0 down</small></div>
                  <div className="blurb">{t.blurb}</div>
                </button>
              ))}
            </div>

            <div className="section-head">
              <h2>3 · What&apos;s included, and what you can add</h2>
              <span className="hint">Base stays on. Add anything below.</span>
            </div>

            <div className="addons">
              {/* Consolidated included box */}
              <div className="inc-box">
                <div className="inc-head">
                  <div>
                    <div className="inc-eyebrow">Included in {TIERS[tier].name}</div>
                    <div className="inc-title">Everything you need to fly, all in one subscription</div>
                  </div>
                  <div className="inc-badge">$0 down · 24 mo</div>
                </div>
                <div className="inc-grid">
                  {included.map((it) => (
                    <div className="inc-item" key={it.id}>
                      <div className="inc-item-top">
                        <span className="inc-item-name">{it.name}</span>
                        <button className="info-btn" aria-label={`Learn more about ${it.name}`} onClick={() => setInfoItem(it)}>?</button>
                      </div>
                      <div className="inc-item-desc">{it.desc}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Standalone build options (e.g. NDAA compliance) */}
              {standaloneItems.map((it) => {
                const on = selected.has(it.id);
                return (
                  <div className={'standalone-opt' + (on ? ' on' : '')} key={it.id}>
                    <div className="so-main">
                      <div className="so-text">
                        <div className="so-title">{it.name}
                          <button className="info-btn" aria-label={`Learn more about ${it.name}`} onClick={() => setInfoItem(it)}>?</button>
                        </div>
                        <div className="so-benefit">{it.benefit}</div>
                      </div>
                      <div className="so-right">
                        <div className="so-price">${fmt(it.mo)}<small>/mo</small></div>
                        <button
                          className={'so-toggle' + (on ? ' on' : '')}
                          role="switch"
                          aria-checked={on}
                          aria-label={`Toggle ${it.name}`}
                          onClick={() => toggleItem(it.id)}
                        >
                          <span className="so-knob" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* Addable, grouped */}
              {addable.length > 0 && (
                <>
                  <div className="addable-intro">
                    <div className="ai-eyebrow">Add to your package</div>
                    <div className="ai-title">Pick what you need</div>
                    <div className="ai-sub">Build out your subscription with the capabilities below. Add or remove anytime, your monthly updates instantly.</div>
                  </div>
                  {Object.keys(GROUPS).map((gkey) => {
                    const inGroup = addable.filter((it) => it.group === gkey);
                    if (!inGroup.length) return null;
                    return (
                      <div key={gkey}>
                        <div className="addable-label">{GROUPS[gkey]}</div>
                        <div className="addable-grid">
                          {inGroup.map((it) => {
                            const on = selected.has(it.id);
                            return (
                              <div className={'card' + (on ? ' added' : '')} key={it.id}>
                                <div className="top">
                                  <div className="ttl">{it.name}
                                    <button className="info-btn" aria-label={`Learn more about ${it.name}`} onClick={() => setInfoItem(it)}>?</button>
                                  </div>
                                  <div className="mo">${fmt(it.mo)}<small>/mo</small></div>
                                </div>
                                <div className="benefit">{it.benefit}</div>
                                <button className="btn-add" onClick={() => toggleItem(it.id)}>
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
                </>
              )}
            </div>
          </div>

          {/* Sticky panel */}
          <div className="panel-col">
            <div className="panel">
              <span className="eyebrow">Your configuration</span>
              <div className="config-name">{cfgName}</div>
              <div className="price-label">{priceLabel}</div>
              <div className="priceblock">
                <span className="dollar">$</span>
                <span className={'amt' + (flash ? ' flash' : '')}>{fmt(bigNumber)}</span>
                <span className="per">/mo</span>
              </div>
              <div className="terms"><b>$0 down</b> · 24-month subscription</div>

              <div className="tax-row">
                <select value={taxState} aria-label="Select state for estimated tax" onChange={(e) => { setTaxState(e.target.value); doFlash(); }}>
                  <option value="">Add state for estimated tax</option>
                  {Object.keys(STATE_NAMES).sort((a, b) => STATE_NAMES[a].localeCompare(STATE_NAMES[b])).map((code) => (
                    <option key={code} value={code}>{STATE_NAMES[code]}</option>
                  ))}
                </select>
              </div>

              <div className="tax-line show">
                {taxState && rate > 0 && (
                  <span className="tl-total">${fmt(total)}/mo before tax · estimate uses the {taxState} state rate only, local taxes not included.</span>
                )}
                {taxState && rate === 0 && (
                  <span className="tl-total">{STATE_NAMES[taxState]} has no state sales tax.</span>
                )}
                <span className="tl-pt">Monthly pricing is shown before applicable taxes. Select your state above for an estimated tax amount.</span>
                <span className="tl-pt">A one-time shipping fee will be added at finalization based on the delivery location.</span>
                <span className="tl-pt">Refresh is a 24-month subscription with $0 down. Lucid Bots retains ownership of all hardware throughout the subscription term. At the end of the term, customers may choose to Refresh or Return their equipment.</span>
                <span className="tl-pt">This configuration summary is for planning purposes only and does not constitute a quote, financing offer, or binding contract.</span>
              </div>

              <div className="lineitems">
                <div className="li base-li"><span className="n">{TIERS[tier].name} essentials</span><span className="v">Included</span></div>
                {ITEMS.filter((it) => selected.has(it.id) && !isLocked(it.id) && !it.included).map((it) => (
                  <div className="li" key={it.id}><span className="n">{it.name}</span><span className="v">${fmt(it.mo)}/mo</span></div>
                ))}
              </div>

              <button className="btn btn-send" onClick={openSend}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" /></svg>
                Lock in this configuration
              </button>
            </div>

            {/* Savings card */}
            <div className="savings-card">
              <div className="sc-eyebrow">Refresh saves you</div>
              <div className="sc-pcts">
                <div className="sc-item">
                  <div className="sc-pct">{pctFin}%</div>
                  <div className="sc-lbl">lower than financing the same equipment</div>
                </div>
              </div>
              <button className="sc-more" onClick={() => setShowCompare(true)}>See the full breakdown</button>
            </div>
          </div>
        </div>

        <RigsInfo />
      </div>

      {/* Mobile sticky bar */}
      <div className="mbar">
        <div>
          <div className="ml">Monthly</div>
          <div className="mp"><span className="d">$</span>{fmt(bigNumber)}<small>/mo</small></div>
        </div>
        <button onClick={openSend}>Lock it in</button>
      </div>
      </>
      )}

      <SiteFooter />

      {/* Compare modal — Refresh mode */}
      {showCompare && mode === 'refresh' && (
        <div className="modal-bg show" onClick={(e) => { if (e.target.classList.contains('modal-bg')) setShowCompare(false); }}>
          <div className="modal">
            <button className="modal-close" aria-label="Close" onClick={() => setShowCompare(false)}>&times;</button>
            <span className="eyebrow">The smart-money comparison</span>
            <h3>Refresh is the lowest 24-month cost</h3>
            <p className="sub">Same equipment, three ways to pay. Refresh is the lowest total with nothing down, and every repair and upgrade stays on us.</p>
            <div className="savings-row">
              <div className="save-pill"><div className="pct">{pctFin}%</div><div className="lbl"><b>Lower than financing</b>over 24 months, interest included</div></div>
              <div className="save-pill"><div className="pct">{pctCash}%</div><div className="lbl"><b>Lower than buying cash</b>same equipment, $0 down</div></div>
            </div>
            <div className="cmp-cols">
              <div className="cmp-card win"><div className="lbl">Refresh</div><div className="big">${fmt(refresh24)}</div><div className="note">${fmt(total)}/mo · $0 down · all included</div><div className="pill">Lowest total</div></div>
              <div className="cmp-card"><div className="lbl">Buy with cash</div><div className="big">${fmt(cash)}</div><div className="note">Paid up front · service is extra</div></div>
              <div className="cmp-card"><div className="lbl">Buy &amp; finance</div><div className="big">${fmt(fin)}</div><div className="note">12% APR · +${fmt(fin - cash)} interest</div></div>
            </div>
            <div className="boomlift">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M3 21h18M5 21V10l7-5 7 5v11M9 21v-6h6v6" /></svg>
              <div className="txt">A 40-foot boom lift alone rents for <b>over $3,000 a month</b>, and all it does is lift a person to the work. Refresh puts a fully serviced Sherpa that does the work, upgraded every term, in that same monthly range.</div>
            </div>
          </div>
        </div>
      )}

      {/* Compare modal — CapEx mode */}
      {showCompare && mode === 'capex' && (() => {
        const eq = refreshEquivalent([...capexSelected]);
        return (
        <div className="modal-bg show" onClick={(e) => { if (e.target.classList.contains('modal-bg')) setShowCompare(false); }}>
          <div className="modal">
            <button className="modal-close" aria-label="Close" onClick={() => setShowCompare(false)}>&times;</button>
            <span className="eyebrow">Compare to Refresh</span>
            <h3>The same core build on Refresh</h3>
            <p className="sub">You are purchasing outright. Here is roughly what the same core equipment would run on a 24-month Refresh subscription, with service, loaner coverage, and upgrades included.</p>
            <div className="cmp-cols">
              <div className="cmp-card"><div className="lbl">Buy outright</div><div className="big">${fmt(capexTotal([...capexSelected]))}</div><div className="note">Paid up front · you own it</div></div>
              <div className="cmp-card win"><div className="lbl">Refresh</div><div className="big">${fmt(eq.mo)}/mo</div><div className="note">$0 down · service &amp; upgrades included</div><div className="pill">$0 down</div></div>
            </div>
            <div className="boomlift">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M12 2v20M2 12h20" /></svg>
              <div className="txt">Refresh spreads the cost over {eq.months} months with no money down, and every repair and upgrade stays on us. Owning outright means the equipment is yours from day one.{eq.excludedTraining ? ' Training is a one-time cost on both and is not included in this monthly estimate.' : ''} This is a planning estimate for the core aircraft and payloads, not a quote.</div>
            </div>
          </div>
        </div>
        );
      })()}

      {/* Info modal */}
      {infoItem && (() => {
        const inCapex = mode === 'capex';
        // In CapEx mode, show the item's own (purchase-native) copy. In Refresh
        // mode, shared items show the Refresh info text so carryover looks identical.
        const refreshItem = itemById[infoItem.id];
        const displayInfo = inCapex
          ? infoItem.info
          : ((refreshItem && refreshItem.info) ? refreshItem.info : infoItem.info);
        const capexItem = infoItem;
        return (
        <div className="modal-bg show" onClick={(e) => { if (e.target.classList.contains('modal-bg')) setInfoItem(null); }}>
          <div className="modal modal-sm">
            <button className="modal-close" aria-label="Close" onClick={() => setInfoItem(null)}>&times;</button>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              key={infoItem.id}
              className="info-img"
              alt={infoItem.name}
              src={`/products/${infoItem.id}.jpg`}
              style={{ display: 'none' }}
              onError={(e) => { e.currentTarget.style.display = 'none'; }}
              onLoad={(e) => { e.currentTarget.style.display = 'block'; }}
            />
            <span className="eyebrow">{inCapex ? 'About this item' : 'What you\u2019re adding'}</span>
            <h3>{infoItem.name}</h3>
            <p style={{ color: 'var(--grey)', fontSize: '14.5px', lineHeight: 1.6, margin: '10px 0 16px' }}>{displayInfo}</p>
            <div style={{ background: '#f0fbfd', border: '1px solid #cdeef4', borderRadius: 10, padding: '12px 16px', fontSize: '13.5px', color: 'var(--navy)' }}>
              {inCapex
                ? (capexItem?.included
                    ? <>Included with every purchase · <b>${fmt(capexItem.valueMo)}/mo</b> value</>
                    : capexItem?.core
                      ? <><b>${fmt(capexItem.price)}</b> · the foundation of every purchase build</>
                      : capexItem?.suite
                        ? <><b>${fmt(capexItem.priceUp)}</b> up front · or ${fmt(capexItem.priceMo)}/mo</>
                        : <><b>${fmt(capexItem?.price || 0)}</b> · one-time purchase</>)
                : (infoItem.included ? 'Included free on every Refresh subscription' : <><b>${fmt(infoItem.mo)}/mo</b> on Refresh · vs {infoItem.cash} to buy</>)}
            </div>
          </div>
        </div>
        );
      })()}

      {/* Send modal */}
      {showSend && (
        <div className="modal-bg show" onClick={(e) => { if (e.target.classList.contains('modal-bg')) setShowSend(false); }}>
          <div className="modal modal-sm">
            <button className="modal-close" aria-label="Close" onClick={() => setShowSend(false)}>&times;</button>
            <span className="eyebrow">Lock in this configuration</span>
            <h3>Send your build to Lucid Bots</h3>
            <p className="sub" style={{ marginBottom: 18 }}>Our team reviews your configuration and reaches out to walk you through next steps. No commitment, no payment today.</p>
            <div className="field"><label htmlFor="cName">Name</label><input id="cName" type="text" autoComplete="name" placeholder="Your full name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
            <div className="field"><label htmlFor="cEmail">Email</label><input id="cEmail" type="email" autoComplete="email" placeholder="you@company.com" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
            <div className="field"><label htmlFor="cPhone">Phone</label><input id="cPhone" type="tel" autoComplete="tel" placeholder="(555) 555-5555" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></div>
            {/* Honeypot: hidden from humans, bots tend to fill it. Do not remove. */}
            <div aria-hidden="true" style={{ position: 'absolute', left: '-9999px', width: 1, height: 1, overflow: 'hidden' }}>
              <label htmlFor="company_website">Company website (leave blank)</label>
              <input id="company_website" type="text" tabIndex={-1} autoComplete="off" value={honeypot} onChange={(e) => setHoneypot(e.target.value)} />
            </div>
            <div className="field-err">{formErr}</div>
            <button className="btn btn-send" style={{ width: '100%', marginTop: 6, opacity: submitting ? 0.7 : 1 }} disabled={submitting} onClick={submitSend}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" /></svg>
              {submitting ? 'Sending…' : 'Send to Lucid Bots'}
            </button>
            <p style={{ fontSize: 11, color: 'var(--grey-lt)', marginTop: 12, textAlign: 'center' }}>We&apos;ll review your build and reach out using the contact details above.</p>
          </div>
        </div>
      )}

      {/* Sent confirmation */}
      {showSent && (
        <div className="modal-bg show" onClick={(e) => { if (e.target.classList.contains('modal-bg')) setShowSent(false); }}>
          <div className="modal modal-sm" style={{ textAlign: 'center' }}>
            <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'var(--green-lt)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '4px auto 16px' }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="#1f9d57" strokeWidth="2.5" style={{ width: 28, height: 28 }}><path d="M20 6L9 17l-5-5" /></svg>
            </div>
            <h3>Your build is on its way</h3>
            <p className="sub" style={{ margin: '8px auto 18px' }}>Thanks. The Lucid Bots team has your configuration and will reach out soon to walk you through next steps. Want a copy for your records?</p>
            <button className="btn btn-send" style={{ width: '100%', marginBottom: 10, opacity: downloading ? 0.7 : 1 }} disabled={downloading} onClick={downloadPdf}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" /></svg>
              {downloading ? 'Building…' : 'Download your PDF'}
            </button>
            <button className="btn btn-primary" style={{ width: '100%' }} onClick={() => setShowSent(false)}>Done</button>
          </div>
        </div>
      )}

      {toast && (
        <div className="toast show">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M20 6L9 17l-5-5" /></svg>
          <span>{toast}</span>
        </div>
      )}
    </>
  );
}
