import './globals.css';
import Script from 'next/script';

export const metadata = {
  title: 'Lucid Refresh · Build Your Subscription',
  description: 'Build a working Sherpa subscription. $0 down, 24-month subscription.',
  alternates: {
    canonical: 'https://pricing.lucidbots.com/',
  },
};

const PRICING_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'ItemList',
  name: 'Lucid Refresh Subscription Plans',
  url: 'https://pricing.lucidbots.com/',
  itemListElement: [
    { '@type': 'ListItem', position: 1, item: { '@type': 'Product', name: 'Base Camp', description: 'Existing cleaners adding a drone to a crew they already run.', offers: { '@type': 'Offer', price: '2950', priceCurrency: 'USD', priceSpecification: { '@type': 'UnitPriceSpecification', price: '2950', priceCurrency: 'USD', referenceQuantity: { '@type': 'QuantitativeValue', value: '1', unitCode: 'MON' } } } } },
    { '@type': 'ListItem', position: 2, item: { '@type': 'Product', name: 'Ascent', description: 'Entrepreneurs going zero-to-one, no cleaning revenue yet.', offers: { '@type': 'Offer', price: '3500', priceCurrency: 'USD', priceSpecification: { '@type': 'UnitPriceSpecification', price: '3500', priceCurrency: 'USD', referenceQuantity: { '@type': 'QuantitativeValue', value: '1', unitCode: 'MON' } } } } },
    { '@type': 'ListItem', position: 3, item: { '@type': 'Product', name: 'Summit', description: 'Proven operators wanting more airtime and higher-ticket jobs.', offers: { '@type': 'Offer', price: '4600', priceCurrency: 'USD', priceSpecification: { '@type': 'UnitPriceSpecification', price: '4600', priceCurrency: 'USD', referenceQuantity: { '@type': 'QuantitativeValue', value: '1', unitCode: 'MON' } } } } },
  ],
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Poppins:wght@500;600;700&family=Inter:wght@400;500;600&family=Roboto:wght@400;500&display=swap"
          rel="stylesheet"
        />
        {/* Pricing structured data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(PRICING_SCHEMA) }}
        />
      </head>
      <body>
        {/* Google Tag Manager (noscript) */}
        <noscript>
          <iframe
            src="https://www.googletagmanager.com/ns.html?id=GTM-W2KFGTK"
            height="0"
            width="0"
            style={{ display: 'none', visibility: 'hidden' }}
          />
        </noscript>
        {children}

        {/* Google Tag Manager */}
        <Script id="gtm" strategy="afterInteractive">
          {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','GTM-W2KFGTK');`}
        </Script>

        {/* HubSpot */}
        <Script
          id="hs-script-loader"
          strategy="afterInteractive"
          src="//js.hs-scripts.com/22607993.js"
        />
      </body>
    </html>
  );
}
