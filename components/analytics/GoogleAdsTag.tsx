import Script from "next/script";
import { googleAdsTagId } from "@/lib/googleAdsConversion";

/**
 * Loads the Google tag so lead conversions can be reported. Renders nothing
 * unless NEXT_PUBLIC_GOOGLE_ADS_TAG_ID is set, so development and preview
 * builds stay free of tracking by default.
 */
export function GoogleAdsTag() {
  if (!googleAdsTagId) return null;

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${googleAdsTagId}`}
        strategy="afterInteractive"
      />
      <Script id="google-ads-gtag" strategy="afterInteractive">
        {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', '${googleAdsTagId}');`}
      </Script>
    </>
  );
}
