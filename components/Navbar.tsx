import { UserContext } from "@/lib/context";
import Link from "next/link";
import { useContext } from "react";

export default function Navbar() {
	const { user, username } = useContext(UserContext);

	return (
		<nav className="navbar">
			<ul>
				<li>
					<Link href="/">
						<button className="btn-logo">FEED</button>
					</Link>
				</li>
				{user && (
					<>
						<li className="push-left">
							<Link href="/admin">
								<button className="btn-blue">Write Posts</button>
							</Link>
						</li>
						<li>
							<Link href={`/${username}`}>
								<img
									src={user?.photoURL}
									alt="Profile photo"
								/>
							</Link>
						</li>
					</>
				)}
				{!user && (
					<li>
						<Link href="/enter">
							<button className="btn-blue">Log in</button>
						</Link>
					</li>
				)}
			</ul>
		</nav>
	);
}
