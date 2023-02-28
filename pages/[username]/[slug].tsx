import AuthCheck from "@/components/AuthCheck";
import Heart from "@/components/HeartButton";
import PostContent from "@/components/PostContent";
import { firestore, getUserWithUsername, postToJSON } from "@/lib/firebase";
import { useDocumentData } from "react-firebase-hooks/firestore";

export async function getStaticProps({ params }: any) {
	const { username, slug } = params;
	const userDoc = await getUserWithUsername(username);

	if (!userDoc) {
		return { notFound: true };
	}

	let post;
	let path;

	if (userDoc) {
		const postRef = userDoc.ref.collection("posts").doc(slug);
		post = postToJSON(await postRef.get());

		path = postRef.path;
	}
	return {
		props: { post, path },
		revalidate: 5000,
	};
}

export async function getStaticPaths() {
	const snapshot = await firestore.collectionGroup("posts").get();

	const paths = snapshot.docs.map((doc) => {
		// mapping through all post docs
		const { slug, username } = doc.data();
		return {
			params: { username, slug },
		};
	});

	return { paths, fallback: "blocking" }; // fallback blocking: when page not rendered yet, fallback to SSR, render page, cache etc
}

export default function Post(props: any) {
	const postRef:any = firestore.doc(props.path);
	const [realtimePost] = useDocumentData(postRef);

	const post = realtimePost || props.post;

	return (
		<main className="container">
			<section>
				<PostContent post={post} />
			</section>

			<aside className="card">
				<p>
					<strong>{post.heartCount || 0} 🤍</strong>
				</p>

				<AuthCheck>
					<Heart postRef={postRef} />
				</AuthCheck>

			</aside>
		</main>
	);
}
