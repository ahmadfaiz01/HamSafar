import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  updateProfile
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../config/firebase';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Effect to handle auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      setLoading(false);
      
      // If this is a new login (not just a page refresh), 
      // you could store a flag in sessionStorage
      if (user && sessionStorage.getItem('isLoggingIn') === 'true') {
        sessionStorage.removeItem('isLoggingIn');
        // navigate('/profile'); // We'll handle navigation in the login component instead
      }
    });

    return unsubscribe;
  }, []);

  const signup = async (name, email, password) => {
    try {
      setError('');
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      // Update user profile with name
      await updateProfile(userCredential.user, {
        displayName: name
      });

      // Create user document in Firestore
      await setDoc(doc(db, 'users', userCredential.user.uid), {
        name: name,
        email: email,
        createdAt: serverTimestamp(),
        lastLogin: serverTimestamp()
      });

      return userCredential.user;
    } catch (err) {
      console.error('Signup error:', err);
      setError(err.message);
      throw err;
    }
  };

  const login = async (email, password) => {
    try {
      setError('');
      sessionStorage.setItem('isLoggingIn', 'true');
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      
      // Update user's last login time
      const userRef = doc(db, 'users', userCredential.user.uid);
      await setDoc(userRef, {
        lastLogin: serverTimestamp()
      }, { merge: true });

      return userCredential.user;
    } catch (err) {
      console.error('Login error:', err);
      setError(err.message);
      throw err;
    }
  };

  const googleSignIn = async () => {
    try {
      setError('');
      sessionStorage.setItem('isLoggingIn', 'true');
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      
      // Check if user document exists, if not create one
      const userRef = doc(db, 'users', result.user.uid);
      const userSnap = await getDoc(userRef);
      
      if (!userSnap.exists()) {
        // Create new user document
        await setDoc(userRef, {
          name: result.user.displayName || '',
          email: result.user.email,
          photoURL: result.user.photoURL || '',
          createdAt: serverTimestamp(),
          lastLogin: serverTimestamp()
        });
      } else {
        // Update last login time
        await setDoc(userRef, {
          lastLogin: serverTimestamp()
        }, { merge: true });
      }

      return result.user;
    } catch (err) {
      console.error('Google Sign In error:', err);
      setError(err.message);
      throw err;
    }
  };

  const logout = async () => {
    try {
      setError('');
      return await signOut(auth);
    } catch (err) {
      console.error('Logout error:', err);
      setError(err.message);
      throw err;
    }
  };

  const value = {
    currentUser,
    signup,
    login,
    googleSignIn,
    logout,
    error,
    setError,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;