import AuthCheck from "@/components/AuthCheck";
import PostFeed from "@/components/PostFeed";
import { UserContext } from "@/lib/context";
import { auth, firestore } from "@/lib/firebase";
import { serverTimestamp } from "firebase/firestore";
import kebabCase from "lodash.kebabcase";
import { useRouter } from "next/router";
import { useContext, useState } from "react";
import { useCollection } from "react-firebase-hooks/firestore";
import { toast } from "react-hot-toast";

export default function AdminPostsPage({}) {
	return (
		<main>
			<AuthCheck>
				<PostList />
				<CreateNewPost />
			</AuthCheck>
		</main>
	);
}

function PostList() {
	const ref = firestore
		.collection("users")
		.doc(auth.currentUser?.uid)
		.collection("posts");
	const query:any = ref.orderBy("createdAt");
	const [querySnapshot] = useCollection(query);

	const posts = querySnapshot?.docs.map((doc) => doc.data());

	return (
		<>
			<h1>Manage your posts</h1>
			<PostFeed
				posts={posts}
				admin
			/>
		</>
	);
}

function CreateNewPost() {
	const router = useRouter();
	const { username } = useContext(UserContext);
	const [title, setTitle] = useState("");

	const slug = encodeURI(kebabCase(title));

	const isValid = title.length > 3 && title.length < 100;

	const createPost = async (e: any) => {
		e.preventDefault();

		const uid = auth.currentUser?.uid;

		const ref = firestore
			.collection("users")
			.doc(uid)
			.collection("posts")
			.doc(slug);
		const data = {
			title,
			slug,
			uid,
			username,
			published: false,
			content: "# hello world!",
			createdAt: serverTimestamp(),
			updatedAt: serverTimestamp(),
			heartCount: 0,
		};

		await ref.set(data);
		toast.success("Post created!");

		router.push(`/admin/${slug}`);
	};

	return (
		<form onSubmit={createPost}>
			<input
				name="title"
				onChange={(e) => setTitle(e.target.value)}
				placeholder="My Awesome Article!"
				className="input"
			/>
			<p>
				<strong>Slug: </strong>
				{slug}
			</p>
			<button
				type="submit"
				disabled={!isValid}
				className="btn-green">
				Submit
			</button>
		</form>
	);
}
