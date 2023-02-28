import Loader from "@/components/Loader";
import PostFeed from "@/components/PostFeed";
import { firestore, fromMillis, postToJSON } from "@/lib/firebase";
import { use, useState } from "react";

const LIMIT = 1;

export async function getServerSideProps(context: any) {
	const postsQuery = firestore
		.collectionGroup("posts") // get any sub collection wherever nested
		.where("published", "==", true)
		.orderBy("createdAt", "desc")
		.limit(LIMIT);

	const posts = (await postsQuery.get()).docs.map(postToJSON);

	return { props: { posts } };
}

export default function Home(props: any) {
	const [posts, setPosts] = useState(props.posts);
	const [loading, setLoading] = useState(false);

	const [postsEnd, setPostsEnd] = useState(false);

	const getMorePosts = async () => {
		setLoading(true);
		const last = posts[posts.length - 1];

		const cursor =
			typeof last.createdAt === "number"
				? fromMillis(last.createdAt)
				: last.createdAt; // if number make into timestamp (when rendered on server it will be a number)

		const query = firestore
			.collectionGroup("posts")
			.where("published", "==", true)
			.orderBy("createdAt", "desc")
			.startAfter(cursor) // start after the latest document in the current list
			.limit(LIMIT);

		const newPosts = (await query.get()).docs.map((doc) => doc.data());

		setPosts(posts.concat(newPosts));
		setLoading(false);

		if (newPosts.length < LIMIT) {
			setPostsEnd(true);
		}
	};

	return (
		<main>
			<PostFeed posts={posts} />
			{!loading && !postsEnd && (
				<button onClick={getMorePosts}>Load more</button>
			)}

			<Loader show={loading} />

			{postsEnd && "You have reached the end"}
		</main>
	);
}
