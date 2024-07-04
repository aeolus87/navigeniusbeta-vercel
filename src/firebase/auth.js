import { auth, db } from './firebase';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  sendEmailVerification,
  updatePassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
} from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { ref, get, set } from 'firebase/database';

// New function to get user's device ID
export const getUserDeviceId = async (userId) => {
  try {
    const userDoc = await getDoc(doc(db, 'users', userId));
    if (userDoc.exists()) {
      return userDoc.data().device_id;
    }
    return null;
  } catch (error) {
    console.error('Error getting user device ID:', error);
    throw error;
  }
};

// New function to link device to user
export const linkDeviceToUser = async (userId, deviceCode) => {
  try {
    // Check if the device code exists in the database
    const deviceRef = ref(db, `Devices/${deviceCode}`);
    const deviceSnapshot = await get(deviceRef);

    if (deviceSnapshot.exists()) {
      // Update user document with device ID
      await updateDoc(doc(db, 'users', userId), { device_id: deviceCode });

      // Update device data with user ID
      await set(ref(db, `Devices/${deviceCode}/user_id`), userId);

      return true;
    } else {
      throw new Error('Invalid device code');
    }
  } catch (error) {
    console.error('Error linking device to user:', error);
    throw error;
  }
};

// New function to unlink device from user
export const unlinkDeviceFromUser = async (userId) => {
  try {
    const userDoc = await getDoc(doc(db, 'users', userId));
    if (userDoc.exists() && userDoc.data().device_id) {
      const deviceId = userDoc.data().device_id;

      // Remove device ID from user document
      await updateDoc(doc(db, 'users', userId), { device_id: null });

      // Remove user ID from device data
      await set(ref(db, `Devices/${deviceId}/user_id`), null);

      return true;
    } else {
      throw new Error('User has no linked device');
    }
  } catch (error) {
    console.error('Error unlinking device from user:', error);
    throw error;
  }
};

export const doCreateUserWithEmailAndPassword = async (
  email,
  password,
  fullname,
) => {
  if (!email || !password || !fullname) {
    throw new Error('Email, password, and fullname are required');
  }

  try {
    const { user } = await createUserWithEmailAndPassword(
      auth,
      email,
      password,
    );

    await setDoc(doc(db, 'users', user.uid), {
      uid: user.uid,
      email: user.email,
      fullname: fullname,
    });

    await sendEmailVerification(user, {
      url: `${window.location.origin}/verified`,
    });

    return user;
  } catch (error) {
    console.error('Error creating user:', error);
    throw error;
  }
};

export const doSignInWithEmailAndPassword = async (email, password) => {
  if (!email || !password) {
    throw new Error('Email and password are required');
  }

  try {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password,
    );
    if (!userCredential.user.emailVerified) {
      throw new Error('Please verify your email before logging in.');
    }
    return userCredential;
  } catch (error) {
    console.error('Error signing in:', error);
    throw error;
  }
};

export const doSignInWithGoogle = async () => {
  const provider = new GoogleAuthProvider();
  try {
    const result = await signInWithPopup(auth, provider);
    const user = result.user;

    // Check if the user exists in Firestore
    const userDoc = await getDoc(doc(db, 'users', user.uid));

    if (!userDoc.exists()) {
      // User doesn't exist in Firestore, needs to complete registration
      return {
        user,
        needsToCompleteRegistration: true,
      };
    }

    return {
      user,
      needsToCompleteRegistration: false,
    };
  } catch (error) {
    console.error('Error signing in with Google:', error);
    throw error;
  }
};
export const doSignOut = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error('Error signing out:', error);
    throw error;
  }
};

export const doPasswordReset = async (email) => {
  if (!email) {
    throw new Error('Email is required');
  }

  try {
    await sendPasswordResetEmail(auth, email);
  } catch (error) {
    console.error('Error sending password reset email:', error);
    throw error;
  }
};

export const doPasswordChange = async (password) => {
  if (!password) {
    throw new Error('New password is required');
  }

  if (!auth.currentUser) {
    throw new Error('No authenticated user');
  }

  try {
    await updatePassword(auth.currentUser, password);
  } catch (error) {
    console.error('Error updating password:', error);
    throw error;
  }
};

export const doSendEmailVerification = async () => {
  if (!auth.currentUser) {
    throw new Error('No authenticated user');
  }

  try {
    await sendEmailVerification(auth.currentUser, {
      url: `${window.location.origin}/dashboard`,
    });
  } catch (error) {
    console.error('Error sending email verification:', error);
    throw error;
  }
};
