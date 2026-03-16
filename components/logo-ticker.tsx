"use client";

import { motion } from "framer-motion";

const brands = [
  { name: "AWS", color: "#FF9900", letter: "A" },
  { name: "Google Cloud", color: "#4285F4", letter: "G" },
  { name: "Stripe", color: "#635BFF", letter: "S" },
  { name: "Notion", color: "#000000", letter: "N" },
  { name: "Vercel", color: "#000000", letter: "V" },
  { name: "Linear", color: "#5E6AD2", letter: "L" },
  { name: "Figma", color: "#F24E1E", letter: "F" },
  { name: "Supabase", color: "#3ECF8E", letter: "SB" },
];

export default function LogoTicker() {
  return (
    <div style={{ borderBottom: "1px solid #e4e4e7", background: "#fff", padding: "14px 0", overflow: "hidden" }}>
      <motion.div
        style={{ display: "flex", gap: "40px", width: "max-content", alignItems: "center", paddingLeft: "40px" }}
        animate={{ x: ["0px", "-50%"] }}
        transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
      >
        {[...brands, ...brands].map((brand, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: "8px", flexShrink: 0 }}>
            <div style={{
              width: "24px", height: "24px", borderRadius: "6px",
              background: brand.color, display: "flex", alignItems: "center",
              justifyContent: "center", fontSize: "0.6rem", fontWeight: 700,
              color: "#fff", flexShrink: 0
            }}>
              {brand.letter}
            </div>
            <span style={{ fontSize: "0.8rem", fontWeight: 500, color: "#71717a", whiteSpace: "nowrap" }}>
              {brand.name}
            </span>
          </div>
        ))}
      </motion.div>
    </div>
  );
}