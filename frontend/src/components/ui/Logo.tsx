import React from 'react';

interface LogoProps {
  variant?: 'light' | 'dark';
}

export function Logo({ variant = 'light' }: LogoProps) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <img src="/logo.png" alt="Zoqel Logo" width={32} height={32} style={{ objectFit: 'contain' }} />
      <span
        style={{
          fontSize: 20,
          fontWeight: 700,
          letterSpacing: "0.1em",
          color: variant === "dark" ? "#ffffff" : "#101828",
        }}
      >
        ZOQEL
      </span>
    </div>
  );
}
