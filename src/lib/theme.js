// ── Theme: Colors, Fonts ──
const C = {
  bg: "#07070E", surface: "#0C0C16", surfAlt: "#111119",
  border: "#1C1C2E", borderLt: "#15152A",
  text: "#E8E8F0", textSec: "#C8C8D8", textMut: "#B0B0C8",
  blue: "#E0E0F0", blueLt: "#FFFFFF", blueDk: "#C0C0D8", blueBg: "rgba(200,200,255,.03)",
  dark: "#F0F0F8", dark2: "#E0E0EC",
  /* Purple accent — planet.ai main color */
  purple: "#8B7BF4", purpleLt: "#A89BFF", purpleDk: "#6B5CD4",
  purpleBg: "rgba(139,123,244,.06)", purpleBorder: "rgba(139,123,244,.2)",
  b1: "#FFFFFF",   /* White — urgent */
  b2: "#E0E0F0",   /* White-ish — primary */
  b3: "#6B6B88",   /* Muted purple-grey */
  b4: "#E8E8F0",   /* White — success/accent */
  b5: "#2A2A3E",   /* Dark purple-grey */
  b6: "#12121C",   /* Near black */
  muted: "#404058",
  /* Red/Green — very muted, only for critical status */
  red: "#E87070", redBg: "rgba(232,112,112,.06)",
  gold: "#8B7BF4", goldBg: "rgba(139,123,244,.04)",
  green: "#7BE0A0", greenBg: "rgba(123,224,160,.04)",
  accent: "#FFFFFF",
  cardBg: "rgba(14,14,24,.8)",
  cardBorder: "rgba(139,123,244,.08)",
  cardShadow: "0 1px 3px rgba(0,0,0,.2), 0 0 0 1px rgba(139,123,244,.06), 0 0 30px rgba(255,255,255,.04), 0 0 70px rgba(255,255,255,.02)",
};
const FONT = "https://fonts.googleapis.com/css2?family=Outfit:wght@200;300;400;500;600;700&family=Noto+Sans+JP:wght@300;400;500;600;700&family=JetBrains+Mono:wght@300;400;500;600&display=swap";
const hd = "'Outfit', 'Noto Sans JP', system-ui, sans-serif";
const bd = "'Noto Sans JP', 'Outfit', system-ui, -apple-system, sans-serif";
const mono = "'JetBrains Mono', 'SF Mono', monospace";

export { C, FONT, hd, bd, mono };
