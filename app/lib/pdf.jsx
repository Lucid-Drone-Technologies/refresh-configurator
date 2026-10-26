import React from 'react';
import fs from 'fs';
import path from 'path';
import { Document, Page, Text, View, Image, StyleSheet, Font, renderToBuffer } from '@react-pdf/renderer';
import {
  TIERS, ITEMS, fmt, computeTotal, configName,
  taxRateFor, STATE_NAMES, TERM,
} from './data';

// ---- Brand assets ----------------------------------------------------------
const fontsDir = path.join(process.cwd(), 'public', 'fonts');
let FONTS_OK = false;
try {
  Font.register({
    family: 'Poppins',
    fonts: [
      { src: path.join(fontsDir, 'Poppins-SemiBold.ttf'), fontWeight: 600 },
      { src: path.join(fontsDir, 'Poppins-Bold.ttf'), fontWeight: 700 },
    ],
  });
  Font.register({
    family: 'Roboto',
    fonts: [
      { src: path.join(fontsDir, 'Roboto-Regular.ttf'), fontWeight: 400 },
      { src: path.join(fontsDir, 'Roboto-Medium.ttf'), fontWeight: 500 },
    ],
  });
  FONTS_OK = true;
} catch (e) {
  FONTS_OK = false;
}
Font.registerHyphenationCallback((word) => [word]);

let LOGO_DATA_URI = null;
try {
  const logoPath = path.join(process.cwd(), 'public', 'lucidbots-white.png');
  LOGO_DATA_URI = `data:image/png;base64,${fs.readFileSync(logoPath).toString('base64')}`;
} catch (e) {
  LOGO_DATA_URI = null;
}

const CYAN = '#23c0d8';
const CYAN_DK = '#1aa3b8';
const NAVY = '#142933';
const GREY = '#606060';
const GOLD = '#FFD700';
const LINE = '#e6ebed';
const PAPER = '#f4f6f7';

const HEAD = FONTS_OK ? 'Poppins' : 'Helvetica-Bold';
const BODY = FONTS_OK ? 'Roboto' : 'Helvetica';

const styles = StyleSheet.create({
  page: { paddingTop: 34, paddingBottom: 28, paddingHorizontal: 40, fontSize: 10, color: NAVY, fontFamily: BODY, display: 'flex', flexDirection: 'column' },

  band: { backgroundColor: NAVY, borderRadius: 12, paddingVertical: 16, paddingHorizontal: 22, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  logo: { height: 24, width: 80, objectFit: 'contain' },
  brand: { color: '#fff', fontSize: 17, fontFamily: HEAD, fontWeight: 700 },
  brandBots: { color: CYAN },
  bandRight: { alignItems: 'flex-end' },
  bandTag: { color: '#9fc4cf', fontSize: 8, letterSpacing: 1.5, fontFamily: BODY, fontWeight: 500 },
  bandSub: { color: '#6f95a0', fontSize: 7, fontFamily: BODY, marginTop: 3 },
  accentRule: { height: 3, backgroundColor: CYAN, borderRadius: 2, marginTop: 0, marginBottom: 20, width: 54 },

  hero: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 18 },
  heroLeft: { flex: 1, paddingRight: 18 },
  eyebrow: { color: CYAN_DK, fontSize: 8, letterSpacing: 1.2, marginBottom: 5, fontFamily: BODY, fontWeight: 500 },
  cfgName: { fontSize: 24, fontFamily: HEAD, fontWeight: 700, color: NAVY, lineHeight: 1 },
  cfgSub: { fontSize: 9, color: GREY, marginTop: 5, fontFamily: BODY },
  priceWrap: { alignItems: 'flex-end', minWidth: 150 },
  priceLabel: { fontSize: 7.5, color: GREY, letterSpacing: 0.8, marginBottom: 5, fontFamily: BODY, fontWeight: 500 },
  bigPrice: { fontSize: 34, fontFamily: HEAD, fontWeight: 700, color: NAVY, lineHeight: 1 },
  bigPriceSmall: { fontSize: 14, color: GREY },
  preTax: { fontSize: 8.5, color: GREY, marginTop: 4, fontFamily: BODY },

  contact: { flexDirection: 'row', backgroundColor: PAPER, borderRadius: 8, paddingVertical: 10, paddingHorizontal: 14, marginBottom: 16, gap: 22 },
  contactItem: { flexDirection: 'column' },
  contactLabel: { fontSize: 7, color: GREY, letterSpacing: 0.8, marginBottom: 2, fontFamily: BODY, fontWeight: 500 },
  contactVal: { fontSize: 9.5, color: NAVY, fontFamily: BODY, fontWeight: 500 },

  sectionLabel: { fontSize: 9, fontFamily: HEAD, fontWeight: 600, color: NAVY, marginBottom: 7, marginTop: 4 },
  sectionAccent: { color: CYAN_DK },

  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 5.5, borderBottomWidth: 0.7, borderBottomColor: LINE },
  rowName: { fontSize: 10, color: NAVY, fontFamily: BODY, fontWeight: 500, flex: 1, paddingRight: 10 },
  rowPrice: { fontSize: 10, color: NAVY, fontFamily: BODY, fontWeight: 500 },

  baseBox: { backgroundColor: '#f0fbfd', borderWidth: 1, borderColor: '#cdeef4', borderRadius: 8, padding: 11, marginBottom: 12 },
  baseTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 },
  baseTitle: { fontSize: 10.5, fontFamily: HEAD, fontWeight: 600, color: NAVY },
  baseTag: { fontSize: 8.5, color: CYAN_DK, fontFamily: BODY, fontWeight: 500 },
  baseList: { fontSize: 8.5, color: GREY, lineHeight: 1.5, fontFamily: BODY },

  totalsBox: { marginTop: 14, borderTopWidth: 1.5, borderTopColor: NAVY, paddingTop: 10 },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  totalLabel: { fontSize: 9.5, color: GREY, fontFamily: BODY },
  totalLabelStrong: { fontSize: 11, color: NAVY, fontFamily: HEAD, fontWeight: 600 },
  totalVal: { fontSize: 9.5, color: GREY, fontFamily: BODY, fontWeight: 500 },
  totalValStrong: { fontSize: 13, color: NAVY, fontFamily: HEAD, fontWeight: 700 },
  grandRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: NAVY, borderRadius: 8, paddingVertical: 10, paddingHorizontal: 14, marginTop: 8 },
  grandLabel: { fontSize: 10.5, color: '#fff', fontFamily: HEAD, fontWeight: 600 },
  grandSub: { fontSize: 7.5, color: '#9fc4cf', fontFamily: BODY, marginTop: 1 },
  grandVal: { fontSize: 19, color: '#fff', fontFamily: HEAD, fontWeight: 700 },
  goldAccent: { color: GOLD },

  spacer: { flexGrow: 1, minHeight: 16 },
  contactBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: '#f0fbfd', borderWidth: 1, borderColor: '#cdeef4', borderRadius: 8, paddingVertical: 10, paddingHorizontal: 14, marginTop: 18 },
  contactBarLabel: { fontSize: 8.5, color: NAVY, fontFamily: HEAD, fontWeight: 600 },
  contactBarText: { fontSize: 9, color: NAVY, fontFamily: BODY, fontWeight: 500 },
  contactBarDot: { fontSize: 9, color: CYAN_DK, fontFamily: BODY },
  footer: { borderTopWidth: 0.7, borderTopColor: LINE, paddingTop: 9, marginTop: 12, fontSize: 7, color: GREY, lineHeight: 1.5, fontFamily: BODY },
});

function RefreshDoc({ data }) {
  const { tier, selected, taxState, contact } = data;
  const total = computeTotal(tier, selected);
  const rate = taxRateFor(taxState);
  const withTax = Math.round(total * (1 + rate));
  const pctLabel = (rate * 100).toFixed(3).replace(/\.?0+$/, '');
  const taxed = !!(taxState && rate > 0);
  const cfg = configName(tier, selected);

  const baseItems = ITEMS.filter((it) => TIERS[tier].items.includes(it.id));
  const addedItems = ITEMS.filter((it) => selected.includes(it.id) && !TIERS[tier].items.includes(it.id));
  const bigNum = taxed ? withTax : total;

  return (
    <Document>
      <Page size="LETTER" style={styles.page}>
        <View style={styles.band}>
          {LOGO_DATA_URI
            ? <Image src={LOGO_DATA_URI} style={styles.logo} />
            : <Text style={styles.brand}>LUCID<Text style={styles.brandBots}>BOTS</Text></Text>}
          <View style={styles.bandRight}>
            <Text style={styles.bandTag}>REFRESH SUBSCRIPTION SUMMARY</Text>
            <Text style={styles.bandSub}>Soft-washing power in the sky · Charlotte, NC</Text>
          </View>
        </View>
        <View style={styles.accentRule} />

        <View style={styles.hero}>
          <View style={styles.heroLeft}>
            <Text style={styles.eyebrow}>YOUR CONFIGURATION</Text>
            <Text style={styles.cfgName}>{cfg}</Text>
            <Text style={styles.cfgSub}>24-month Refresh subscription  ·  $0 down</Text>
          </View>
          <View style={styles.priceWrap}>
            <Text style={styles.priceLabel}>
              {taxed ? `EST. MONTHLY WITH ${pctLabel}% ${taxState} TAX` : 'MONTHLY SUBSCRIPTION'}
            </Text>
            <Text style={styles.bigPrice}>${fmt(bigNum)}<Text style={styles.bigPriceSmall}>/mo</Text></Text>
            {taxed ? <Text style={styles.preTax}>${fmt(total)}/mo before tax</Text> : null}
          </View>
        </View>

        {contact ? (
          <View style={styles.contact}>
            <View style={styles.contactItem}>
              <Text style={styles.contactLabel}>PREPARED FOR</Text>
              <Text style={styles.contactVal}>{contact.name}</Text>
            </View>
            <View style={styles.contactItem}>
              <Text style={styles.contactLabel}>EMAIL</Text>
              <Text style={styles.contactVal}>{contact.email}</Text>
            </View>
            <View style={styles.contactItem}>
              <Text style={styles.contactLabel}>PHONE</Text>
              <Text style={styles.contactVal}>{contact.phone}</Text>
            </View>
          </View>
        ) : null}

        <Text style={styles.sectionLabel}>YOUR <Text style={styles.sectionAccent}>{TIERS[tier].name.toUpperCase()}</Text> PACKAGE</Text>
        <View style={styles.baseBox}>
          <View style={styles.baseTop}>
            <Text style={styles.baseTitle}>Everything you need to fly, all in one subscription</Text>
            <Text style={styles.baseTag}>Included</Text>
          </View>
          <Text style={styles.baseList}>{baseItems.map((it) => it.name).join('   ·   ')}</Text>
        </View>

        {addedItems.length > 0 ? (
          <View>
            <Text style={styles.sectionLabel}>CAPABILITIES YOU ADDED</Text>
            {addedItems.map((it) => (
              <View style={styles.row} key={it.id}>
                <Text style={styles.rowName}>{it.name}</Text>
                <Text style={styles.rowPrice}>+${fmt(it.mo)}/mo</Text>
              </View>
            ))}
          </View>
        ) : null}

        <View style={styles.totalsBox}>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>{TIERS[tier].name} base subscription</Text>
            <Text style={styles.totalVal}>${fmt(TIERS[tier].priceNum)}/mo</Text>
          </View>
          {addedItems.length > 0 ? (
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Added capabilities</Text>
              <Text style={styles.totalVal}>+${fmt(total - TIERS[tier].priceNum)}/mo</Text>
            </View>
          ) : null}
          <View style={styles.totalRow}>
            <Text style={styles.totalLabelStrong}>Monthly subscription{taxed ? ' (before tax)' : ''}</Text>
            <Text style={styles.totalValStrong}>${fmt(total)}/mo</Text>
          </View>
          {taxed ? (
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Estimated {pctLabel}% {taxState} state tax</Text>
              <Text style={styles.totalVal}>+${fmt(withTax - total)}/mo</Text>
            </View>
          ) : null}

          <View style={styles.grandRow}>
            <View>
              <Text style={styles.grandLabel}>{taxed ? 'Estimated total monthly' : 'Total monthly'}</Text>
              <Text style={styles.grandSub}>24-month subscription  ·  <Text style={styles.goldAccent}>$0 down</Text></Text>
            </View>
            <Text style={styles.grandVal}>${fmt(bigNum)}<Text style={{ fontSize: 11 }}>/mo</Text></Text>
          </View>
        </View>

        <View style={styles.spacer} />

        {!contact ? (
          <View style={styles.contactBar}>
            <Text style={styles.contactBarLabel}>Questions?</Text>
            <Text style={styles.contactBarText}>Call 704-999-3356</Text>
            <Text style={styles.contactBarDot}>·</Text>
            <Text style={styles.contactBarText}>sales@lucidbots.com</Text>
          </View>
        ) : null}

        <Text style={styles.footer}>
          {taxed
            ? `Tax shown is an estimate using the ${taxState} state rate only and excludes local city and county taxes; final tax is confirmed at order. `
            : 'Monthly pricing is shown before applicable taxes; select a state in the builder for an estimate. '}
          A one-time shipping fee is added at finalization based on delivery location. Refresh is a 24-month subscription with $0 down. Lucid Bots retains ownership of all hardware throughout the term; at the end of the term, customers may choose to Refresh or Return their equipment. This configuration summary is for planning purposes only and does not constitute a quote, financing offer, or binding contract.
        </Text>
      </Page>
    </Document>
  );
}

export async function generatePdf(data) {
  return renderToBuffer(<RefreshDoc data={data} />);
}
