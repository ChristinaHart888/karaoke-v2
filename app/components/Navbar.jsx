import React from "react";
import Link from "next/link";
export default function Navbar() {
  return (
    <nav
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        backgroundColor: "#580994",
        paddingInline: "1em",
      }}
    >
      <h1 style={{}}>Karaoke_V2</h1>
      <div
        className="links"
        style={{
          width: "50%",
          display: "flex",
          justifyContent: "flex-end",
        }}
      >
        <Link
          href="/"
          style={{
            marginInline: "0.5em",
            color: "white",
            textDecoration: "none",
          }}
        >
          Dashboard
        </Link>
        <Link
          href="/room"
          style={{
            marginInline: "0.5em",
            color: "white",
            textDecoration: "none",
          }}
        >
          Room
        </Link>
      </div>
    </nav>
  );
}
