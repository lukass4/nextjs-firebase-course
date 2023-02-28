import PostFeed from "@/components/PostFeed";
import UserProfile from "@/components/UserProfile";
import { getUserWithUsername, postToJSON } from "@/lib/firebase";

export async function getServerSideProps({ query }: any) {
	const { username } = query;
	const userDoc = await getUserWithUsername(username);

	if (!userDoc) {
		return { notFound: true };
	}

	let user = null;
	let posts = null;

	if (userDoc) {
		user = userDoc.data(); // user = the user doc in the database
		const postsQuery = userDoc.ref
			.collection("posts") // the posts collection in the userDoc
			.where("published", "==", true) // only published posts
			.orderBy("createdAt", "desc") // ordered by date created, descending order
			.limit(5); // first 5 only

		posts = (await postsQuery.get()).docs.map(postToJSON);
	}

	return {
		props: { user, posts }, // will be passed to the page component as props
	};
}

async function getUser(username: string) {
	return await getUserWithUsername(username);
}

export default function UserProfilePage({ user, posts }: any) {
	console.log(getUser("lukas"));
	console.log(posts);
	return (
		<main>
			<UserProfile user={user} />
			<PostFeed posts={posts} />
		</main>
	);
}
