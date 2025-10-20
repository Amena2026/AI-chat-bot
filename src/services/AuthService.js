import { 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  updateProfile
} from 'firebase/auth';
import { auth, googleProvider } from '../config/firebase';
import { ref, set } from 'firebase/database';
import { database } from '../config/firebase';

// sign up creates a new user account with email and password and saves the profile to the database
export const signUp = async (email, password, displayName) => {
  try {
    // Create user account
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Update display name
    await updateProfile(user, { displayName });

    // Save user profile to Realtime Database
    await set(ref(database, `users/${user.uid}`), {
      email: user.email,
      displayName: displayName,
      createdAt: Date.now()
    });

    return user;
  } catch (error) {
    console.error('Signup error:', error);
    throw error;
  }
};

// Sign in existing users with eamil and password
export const signIn = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
};

// open google popup and signs in
export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;

    // Save/update user profile in database
    await set(ref(database, `users/${user.uid}`), {
      email: user.email,
      displayName: user.displayName,
      createdAt: Date.now()
    });

    return user;
  } catch (error) {
    console.error('Google sign-in error:', error);
    throw error;
  }
};

// Get user's ID token for backend authentication
export const getUserToken = async () => {
  try {
    if (auth.currentUser) {
      return await auth.currentUser.getIdToken();
    }
    return null;
  } catch (error) {
    console.error('Error getting token:', error);
    throw error;
  }
};