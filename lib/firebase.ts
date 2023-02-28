import firebase from "firebase/compat/app";
import "firebase/compat/auth";
import "firebase/compat/firestore";
import "firebase/compat/storage";

const firebaseConfig = {
	apiKey: "AIzaSyD8chz4G0IgpfRXh9RwiMSm0lVI9UHKJF0",
	authDomain: "nextfire-25235.firebaseapp.com",
	projectId: "nextfire-25235",
	storageBucket: "nextfire-25235.appspot.com",
	messagingSenderId: "1005642145664",
	appId: "1:1005642145664:web:839c853e1cbbbaf5e4eb65",
};

if (!firebase.apps.length) {
	// only initializes if firebase doesn't already exist
	firebase.initializeApp(firebaseConfig);
}

export const auth = firebase.auth();
export const googleAuthProvider = new firebase.auth.GoogleAuthProvider();
export const firestore = firebase.firestore();
export const storage = firebase.storage();
export const STATE_CHANGED = firebase.storage.TaskEvent.STATE_CHANGED; // shows progress of file upload

// Helper functions

export async function getUserWithUsername(username: string) {
	const usersRef = firestore.collection("users");
	const query = usersRef.where("username", "==", username).limit(1); // sets up a query to the users database for a user with username == username
	const userDoc = (await query.get()).docs[0]; // uses the query on the database and returns the first (and only) doc which is the user
	return userDoc;
}

export function postToJSON(doc: any) {
	//converts timestamp to number or string to pass as json to the posts feed
	const data = doc.data();
	return {
		...data,
		createdAt: data.createdAt.toMillis(),
		updatedAt: data.createdAt.toMillis(),
	};
}

export const fromMillis = firebase.firestore.Timestamp.fromMillis;
export const serverTimestamp = firebase.firestore.FieldValue.serverTimestamp;
export const increment = firebase.firestore.FieldValue.increment;