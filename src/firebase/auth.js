import { auth } from "./firebase";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  sendEmailVerification,
  updatePassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut
} from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { db } from "./firebase"; // Import the Firestore database instance

export const doCreateUserWithEmailAndPassword = async (email, password, fullname) => {
  try {
    const { user } = await createUserWithEmailAndPassword(auth, email, password);

    // Create a new document in the "users" collection with the user's information
    await setDoc(doc(db, "users", user.uid), {
      uid: user.uid,
      email: user.email,
      fullname: fullname // Make sure "fullname" matches the field name in Firestore
    });

    return user;
  } catch (error) {
    console.error("Error creating user document:", error);
    throw error;
  }
};


export const doSignInWithEmailAndPassword = (email, password) => {
  return signInWithEmailAndPassword(auth, email, password);
};

export const doSignInWithGoogle = async () => {
  const provider = new GoogleAuthProvider();
  await signInWithPopup(auth, provider);
};

export const doSignOut = () => {
  return signOut(auth);
};

export const doPasswordReset = (email) => {
  return sendPasswordResetEmail(auth, email);
};

export const doPasswordChange = (password) => {
  return updatePassword(auth.currentUser, password);
};

export const doSendEmailVerification = () => {
  return sendEmailVerification(auth.currentUser, {
    url: `${window.location.origin}/home`,
  });
};