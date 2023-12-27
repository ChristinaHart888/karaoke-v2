import React from "react";
import Link from "next/link";

export default function Navbar() {
	return (
		<nav>
			<h1>Karaoke_V2</h1>
			<Link href="/">Dashboard</Link>
			<Link href="/room">Room</Link>
		</nav>
	);
}
