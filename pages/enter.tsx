import { UserContext } from "@/lib/context";
import { auth, firestore, googleAuthProvider } from "@/lib/firebase";
import { useCallback, useContext, useEffect, useState } from "react";
import debounce from "lodash.debounce";

export default function Enter({}) {
	const { user, username } = useContext(UserContext);

	return (
		<main>
			{user ? (
				!username ? (
					<UsernameForm />
				) : (
					<SignOutButton />
				)
			) : (
				<SignInButton />
			)}
		</main>
	);
}

function SignInButton() {
	const signInWithGoogle = async () => {
		await auth.signInWithPopup(googleAuthProvider);
	};
	return (
		<button
			className="btn-google"
			onClick={signInWithGoogle}>
			<img src={"/google.png"} /> Sign in with Google
		</button>
	);
}

function SignOutButton() {
	return <button onClick={() => auth.signOut()}>Sign Out</button>;
}

function UsernameForm() {
	const [formValue, setFormValue] = useState("");
	const [isValid, setIsValid] = useState(false);
	const [loading, setIsLoading] = useState(false);

	const { user, username } = useContext(UserContext);

	useEffect(() => {
		checkUsername(formValue);
	}, [formValue]);

	const onChange = (e: any) => {
		const val = e.target.value.toLowerCase();
		const re = /^(?=[a-zA-Z0-9._]{3,15}$)(?!.*[_.]{2})[^_.].*[^_.]$/;

		if (val.length < 3) {
			setFormValue(val);
			setIsLoading(false);
			setIsValid(false);
		}

		if (re.test(val)) {
			setFormValue(val);
			setIsLoading(true);
			setIsValid(false);
		}
	};

	const checkUsername = useCallback(
		debounce(async (username: string) => {
			//debounce waits for 500ms until user stops typing to read db
			if (username.length >= 3) {
				const ref = firestore.doc(`usernames/${username}`);
				const { exists } = await ref.get();
				console.log("Firestore read executed!");
				setIsValid(!exists);
				setIsLoading(false);
			}
		}, 500),
		[]
	);

	const onSubmit = async (e: any) => {
		e.preventDefault(); //stops page refresh

		const userDoc = firestore.doc(`users/${user.uid}`);
		const usernameDoc = firestore.doc(`usernames/${formValue}`);

		//writes together as a batch
		const batch = firestore.batch();
		batch.set(userDoc, {
			username: formValue,
			photoURL: user.photoURL,
			displayName: user.displayName,
		});
		batch.set(usernameDoc, { uid: user.uid });
		await batch.commit();
	};

	interface Props {
		username: string;
		isValid: boolean;
		loading: boolean;
	}

	const UsernameMessage: React.FC<Props> = ({ username, isValid, loading }) => {
		if (loading) {
			return <p>Checking...</p>;
		} else if (isValid) {
			return <p className="text-success">{username} is available!</p>;
		} else if (username && !isValid) {
			return <p className="text-danger">That username is taken!</p>;
		} else {
			return <p></p>;
		}
	};

	return (
		<section>
			<h3>Choose Username</h3>
			<form onSubmit={onSubmit}>
				<input
					name="username"
					placeholder="myname"
					value={formValue}
					onChange={onChange}
				/>

				<UsernameMessage
					username={formValue}
					isValid={isValid}
					loading={loading}></UsernameMessage>

				<button
					type="submit"
					className="btn-green"
					disabled={!isValid}>
					Choose
				</button>

				<h3>Debug State</h3>
				<div>
					Username: {formValue}
					<br />
					Loading: {loading.toString()}
					<br />
					Username Valid: {isValid.toString()}
				</div>
			</form>
		</section>
	);
}
