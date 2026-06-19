// Single source of truth for pricing data and calculations.
// Used by the configurator UI, the PDF generator, and the email body.

export const TERM = 24;
export const FIN_FACTOR = 1.1298; // 12% APR, 24mo total paid per $ financed

export const ITEMS = [
  { id: 'flight', name: 'Sherpa Flight System', benefit: '', desc: 'Drone, 8 batteries, 2 chargers. The base on every tier, sized to keep a crew working between battery swaps.', info: 'The core of every Refresh subscription: the drone, eight batteries, and two chargers. The eight-battery, two-charger setup is the point. Your crew keeps one set flying while the other recharges, so the drone never sits idle waiting on a swap. This is the machine and the uptime, with nothing else to buy to get started.', mo: 1887, cashNum: 45750, cash: '$45,750', base: true },
  { id: 'window', name: 'Window Payload', benefit: '', desc: 'Windows, soft wash, and building exteriors.', info: 'The payload that turns Sherpa into a money-maker on day one. It handles the everyday work that fills most cleaning schedules: windows, soft wash, and building exteriors. It comes with an onboard chemical tank and variable mix control, so you get a streak-free finish with one button. These are the jobs you already book and bill for, now done faster and without anyone on a lift.', mo: 475, cashNum: 11500, cash: '$11,500' },
  { id: 'shield', name: 'Shield Payload', benefit: 'Bid the sealing jobs you turn away today.', group: 'bigger', desc: 'Sealing and surface protection, the highest-ticket jobs in the industry.', info: 'Unlocks sealing and surface-protection work, the highest-ticket jobs in the industry. Sherpa applies sealant at over 200 sq ft per minute with a uniform, manufacturer-spec finish, work that used to take days now done in hours, with nobody on scaffolding. For a crew already booked on window work, this is how revenue per crew climbs: the same team now bids on sealing and restoration jobs they used to turn away. The conversation here is about the new revenue this opens, not the cost.', mo: 620, cashNum: 15000, cash: '$15,000' },
  { id: 'tether', name: 'Power Tether', benefit: 'Stay in the air all day and finish up to 40% more jobs.', group: 'more', desc: 'Nearly unlimited flight time, no battery swaps, up to 40% more efficiency.', info: 'Feeds Sherpa continuous power from the ground, so there are no battery swaps and effectively unlimited flight time. We\'ve kept a Sherpa cleaning nonstop for over an hour at full pressure in the field, no landing, no swaps. On a job site that means roughly 40% more efficiency, because the crew stays in the air and finishes more jobs per day. This is the upgrade for proven operators whose limit is revenue per day, not capability.', mo: 815, cashNum: 19800, cash: '$19,800' },
  { id: 'bizbox', name: 'Business in a Box Training', benefit: 'Run the business right from day one, no guesswork.', group: 'customers', desc: 'The playbook for running a cleaning company: operations, pricing, quoting, safety.', info: 'The full operating playbook for someone who\'s never run a cleaning company. It covers operations, pricing, quoting, and safety. Most new operators fail for one of two reasons, and this removes the first: not knowing how to actually run the business. You start with a proven system instead of figuring it out as you go.', mo: 125, cashNum: 3000, cash: '$3,000' },
  { id: 'mktg', name: 'Marketing Content Package', benefit: 'Launch with a brand and leads, not from scratch.', group: 'customers', desc: 'Professional video and content so a new operator has a brand and leads from day one.', info: 'Professional video and marketing content, ready on day one. This removes the second reason new operators fail: no brand and no way to find customers. Instead of building a presence from scratch, you launch with polished material you can put in front of leads immediately.', mo: 415, cashNum: 10000, cash: '$10,000' },
  { id: 'ojt', name: 'On-the-Job Training / Consultation', benefit: 'We work your first jobs with you so revenue starts now.', group: 'customers', desc: 'We work the first jobs alongside the crew so new revenue starts immediately.', info: 'Our team comes on site and works your first jobs alongside your crew. We don\'t just hand over the equipment and leave. We make sure revenue starts right away and your team is confident on the bigger-ticket work before they\'re on their own.', mo: 205, cashNum: 5000, cash: '$5,000' },
  { id: 'loaner', name: 'Loaner Fleet + Premium Support', benefit: '', desc: 'If it breaks, we swap it. The crew never stops earning.', info: 'Downtime never costs you a job. If your Sherpa goes down, we ship a loaner so your crew keeps working and keeps earning. For a business where every grounded day is lost revenue, this is the difference between a minor hiccup and a missed payroll.', mo: 495, cashNum: 500, cashMonthly: true, cash: '$500/mo' },
  { id: 'diag', name: 'Remote Diagnostics', benefit: '', desc: 'We see problems before they do, and head off downtime before it costs a job.', info: 'We watch your Sherpa\'s health remotely and catch issues before you\'d ever notice them. Problems get flagged and handled before they become downtime, so the drone stays in the air and your schedule stays intact. Less guessing, fewer surprise repairs, more flying.', mo: 99, cashNum: 100, cashMonthly: true, cash: '$100/mo' },
  { id: 'app', name: 'Lucid Bots Mobile App', benefit: '', desc: 'Quoting and job management in their pocket. Included free on every Refresh subscription.', info: 'Quoting and job management, right in your operator\'s pocket. Run the whole business from a phone, from day one. It\'s included free on every Refresh subscription and never a paid add-on, so every customer gets it standard.', mo: 0, cashNum: 160, cashMonthly: true, cash: '$160/mo', included: true },
  { id: 'ndaa', name: 'NDAA-Compliant Build', benefit: 'Built to NDAA-compliant specifications for federal, defense, and public-sector work.', desc: 'Built to NDAA-compliant specifications.', info: 'Configures your Sherpa to meet the component and sourcing rules of the National Defense Authorization Act, the federal standard that bars drones with Chinese-made critical parts. As of late 2025, federal agencies, contractors, and anyone using federal grant money are now restricted to compliant equipment, and enforcement is fully active. This build qualifies your Sherpa for that work. If you bid on government, defense, or publicly funded jobs, this is what gets you in the door. (Note: Sherpa is already U.S.-made in Charlotte, NC, which is a strong starting point for this.)', mo: 460, cashNum: 11040, cash: '$11,040', standalone: true },
];

export const GROUPS = {
  customers: 'Get more customers',
  more: 'Do more jobs per day',
  bigger: 'Win bigger jobs',
};

export const TIERS = {
  base:   { key: 'base',   num: 'Base Camp', outcome: 'Add a drone to my crew',     name: 'Base Camp', price: '$2,950', priceNum: 2950, blurb: 'Existing cleaners adding a drone to a crew they already run.', choice: 'I already clean',   items: ['flight', 'window', 'loaner', 'diag', 'app'] },
  ascent: { key: 'ascent', num: 'Ascent',    outcome: 'Start a cleaning business',  name: 'Ascent',    price: '$3,500', priceNum: 3500, blurb: 'Entrepreneurs going zero-to-one, no cleaning revenue yet.',     choice: "I'm just starting", items: ['flight', 'window', 'loaner', 'diag', 'app', 'bizbox', 'mktg'] },
  summit: { key: 'summit', num: 'Summit',    outcome: 'Do bigger jobs, faster',     name: 'Summit',    price: '$4,600', priceNum: 4600, blurb: 'Proven operators wanting more airtime and higher-ticket jobs.', choice: "I'm scaling",      items: ['flight', 'window', 'loaner', 'diag', 'app', 'shield', 'tether', 'ojt'] },
};

export const itemById = Object.fromEntries(ITEMS.map((i) => [i.id, i]));

// State base sales-tax rates (state-level only; local city/county not included).
export const STATE_TAX = {
  AL:4.0, AK:0.0, AZ:5.6, AR:6.5, CA:7.25, CO:2.9, CT:6.35, DE:0.0, FL:6.0,
  GA:4.0, HI:4.0, ID:6.0, IL:6.25, IN:7.0, IA:6.0, KS:6.5, KY:6.0, LA:4.45,
  ME:5.5, MD:6.0, MA:6.25, MI:6.0, MN:6.875, MS:7.0, MO:4.225, MT:0.0, NE:5.5,
  NV:6.85, NH:0.0, NJ:6.625, NM:5.0, NY:4.0, NC:4.75, ND:5.0, OH:5.75, OK:4.5,
  OR:0.0, PA:6.0, RI:7.0, SC:6.0, SD:4.5, TN:7.0, TX:6.25, UT:6.1, VT:6.0,
  VA:5.3, WA:6.5, WV:6.0, WI:5.0, WY:4.0, DC:6.0,
};
export const STATE_NAMES = {
  AL:'Alabama',AK:'Alaska',AZ:'Arizona',AR:'Arkansas',CA:'California',CO:'Colorado',
  CT:'Connecticut',DE:'Delaware',FL:'Florida',GA:'Georgia',HI:'Hawaii',ID:'Idaho',
  IL:'Illinois',IN:'Indiana',IA:'Iowa',KS:'Kansas',KY:'Kentucky',LA:'Louisiana',
  ME:'Maine',MD:'Maryland',MA:'Massachusetts',MI:'Michigan',MN:'Minnesota',MS:'Mississippi',
  MO:'Missouri',MT:'Montana',NE:'Nebraska',NV:'Nevada',NH:'New Hampshire',NJ:'New Jersey',
  NM:'New Mexico',NY:'New York',NC:'North Carolina',ND:'North Dakota',OH:'Ohio',OK:'Oklahoma',
  OR:'Oregon',PA:'Pennsylvania',RI:'Rhode Island',SC:'South Carolina',SD:'South Dakota',
  TN:'Tennessee',TX:'Texas',UT:'Utah',VT:'Vermont',VA:'Virginia',WA:'Washington',
  WV:'West Virginia',WI:'Wisconsin',WY:'Wyoming',DC:'Washington, D.C.',
};

export const fmt = (n) => n.toLocaleString('en-US');

// Total anchors to the tier's published price, then adds any items beyond the tier's set.
export function computeTotal(tierKey, selectedIds) {
  let t = TIERS[tierKey].priceNum;
  selectedIds.forEach((id) => {
    if (!TIERS[tierKey].items.includes(id)) t += itemById[id].mo;
  });
  return t;
}

export function cashTotal(selectedIds) {
  let c = 0;
  selectedIds.forEach((id) => {
    const it = itemById[id];
    c += it.cashMonthly ? it.cashNum * TERM : it.cashNum;
  });
  return c;
}

export function financeTotal(selectedIds) {
  let f = 0;
  selectedIds.forEach((id) => {
    const it = itemById[id];
    if (it.cashMonthly) f += it.cashNum * TERM;
    else f += it.cashNum * FIN_FACTOR;
  });
  return Math.round(f);
}

export function configName(tierKey, selectedIds) {
  for (const t of Object.values(TIERS)) {
    if (t.items.length === selectedIds.length && t.items.every((i) => selectedIds.includes(i)))
      return t.name;
  }
  return TIERS[tierKey].name + ' + custom';
}

export function taxRateFor(stateCode) {
  return stateCode && STATE_TAX[stateCode] !== undefined ? STATE_TAX[stateCode] / 100 : 0;
}
