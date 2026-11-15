import React, { createContext, useContext, useState, useEffect } from 'react';
import { StorageService } from '../services/storageService';
import { 
  auth, 
  googleProvider, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  updateProfile as updateFirebaseProfile,
  sendPasswordResetEmail,
  signInWithPopup,
  getFirebaseErrorMessage 
} from '../services/firebase';

const AUTH_USER_KEY = 'aetheria_auth_user';
const WISHLIST_KEY = 'aetheria_user_wishlist';

// Real users only - no hardcoded demo accounts
export const DEMO_USERS = {};

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem(AUTH_USER_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        // Wipe legacy mock accounts from localStorage
        if (
          parsed?.email === 'arif.hasan@dhakavoyages.com' || 
          parsed?.email === 'alexandria@aetheriatravels.com' ||
          parsed?.id === 'usr-arif-hasan' ||
          parsed?.id === 'usr-admin-alex'
        ) {
          localStorage.removeItem(AUTH_USER_KEY);
          return null;
        }
        return parsed;
      }
    } catch (e) {
      console.warn('Could not read user auth state', e);
    }
    return null;
  });

  const [wishlist, setWishlist] = useState(() => {
    try {
      const stored = localStorage.getItem(WISHLIST_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.warn('Could not read wishlist', e);
    }
    return [];
  });

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalTab, setAuthModalTab] = useState('login'); // 'login' | 'signup' | 'phone' | 'forgot'
  const [activeUserModal, setActiveUserModal] = useState(null); // 'bookings' | 'wishlist' | 'settings' | null
  const [isFirebaseInitialized, setIsFirebaseInitialized] = useState(false);

  // Real-time Firebase Authentication State Listener
  useEffect(() => {
    if (!auth) {
      setIsFirebaseInitialized(true);
      return;
    }
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        const displayName = firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'Voyager';
        const firstName = displayName.split(' ')[0] || 'Voyager';
        const isNormalAdmin = StorageService.isNormalAdmin(firebaseUser.email);

        let localProfile = {};
        try {
          const stored = localStorage.getItem(AUTH_USER_KEY);
          if (stored) {
            const parsed = JSON.parse(stored);
            if (parsed.email?.toLowerCase() === firebaseUser.email?.toLowerCase()) {
              localProfile = parsed;
            }
          }
        } catch (e) {}

        const mappedUser = {
          id: firebaseUser.uid,
          uid: firebaseUser.uid,
          name: displayName,
          firstName,
          email: firebaseUser.email,
          phone: firebaseUser.phoneNumber || localProfile.phone || '+8801700000000',
          avatar: firebaseUser.photoURL || localProfile.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
          role: isNormalAdmin ? 'normal_admin' : (localProfile.role || 'client'),
          membership: isNormalAdmin ? 'নরমাল অ্যাডমিন' : (localProfile.membership || 'সদস্য পরিব্রাজক'),
          joinedDate: localProfile.joinedDate || 'Firebase Verified',
          isFirebaseUser: true
        };

        setUser(mappedUser);
        localStorage.setItem(AUTH_USER_KEY, JSON.stringify(mappedUser));
        StorageService.syncUser(mappedUser);
      } else {
        // If Firebase says not logged in, but there is an active firebase session locally, clear it
        const stored = localStorage.getItem(AUTH_USER_KEY);
        if (stored) {
          try {
            const parsed = JSON.parse(stored);
            if (parsed.isFirebaseUser) {
              setUser(null);
              localStorage.removeItem(AUTH_USER_KEY);
            }
          } catch (e) {}
        }
      }
      setIsFirebaseInitialized(true);
    });

    return () => unsubscribe();
  }, []);

  // Save auth state & sync with users directory
  useEffect(() => {
    try {
      if (user) {
        localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
        StorageService.syncUser(user);
      } else {
        localStorage.removeItem(AUTH_USER_KEY);
      }
    } catch (e) {
      console.warn('Could not save user auth state', e);
    }
  }, [user]);

  // Save wishlist state
  useEffect(() => {
    try {
      localStorage.setItem(WISHLIST_KEY, JSON.stringify(wishlist));
    } catch (e) {
      console.warn('Could not save wishlist', e);
    }
  }, [wishlist]);

  // Open & Close Auth Modal
  const openAuthModal = (tab = 'login') => {
    setAuthModalTab(tab);
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
  };

  // Open & Close User Profile Modals
  const openUserModal = (modalName) => {
    setActiveUserModal(modalName);
  };

  const closeUserModal = () => {
    setActiveUserModal(null);
  };

  // 1. Firebase Login with Email & Password
  const loginWithEmail = async (email, password, rememberMe = true) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email.trim(), password);
      const fbUser = userCredential.user;
      const displayName = fbUser.displayName || email.split('@')[0] || 'Voyager';
      const firstName = displayName.split(' ')[0] || 'Voyager';
      const isNormalAdmin = StorageService.isNormalAdmin(fbUser.email);

      const authenticatedUser = {
        id: fbUser.uid,
        uid: fbUser.uid,
        name: displayName,
        firstName,
        email: fbUser.email,
        phone: fbUser.phoneNumber || '+8801700000000',
        avatar: fbUser.photoURL || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=300&q=80',
        role: isNormalAdmin ? 'normal_admin' : 'client',
        membership: isNormalAdmin ? 'নরমাল অ্যাডমিন' : 'VIP Voyager',
        joinedDate: 'আজ লগইন করেছেন',
        isFirebaseUser: true
      };

      setUser(authenticatedUser);
      localStorage.setItem(AUTH_USER_KEY, JSON.stringify(authenticatedUser));
      StorageService.syncUser(authenticatedUser);
      closeAuthModal();
      return authenticatedUser;
    } catch (error) {
      console.error('Firebase Login Error:', error);
      const message = getFirebaseErrorMessage(error);
      throw new Error(message);
    }
  };

  // 2. Firebase Signup with Email, Name & Phone
  const signupWithEmail = async ({ name, email, phone, password }) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email.trim(), password);
      const fbUser = userCredential.user;

      // Update Firebase Profile displayName
      try {
        await updateFirebaseProfile(fbUser, {
          displayName: name.trim()
        });
      } catch (profileErr) {
        console.warn('Could not update Firebase profile displayName:', profileErr);
      }

      const firstName = name.trim().split(' ')[0] || 'Voyager';
      const isNormalAdmin = StorageService.isNormalAdmin(email.trim());

      const newUser = {
        id: fbUser.uid,
        uid: fbUser.uid,
        name: name.trim(),
        firstName,
        email: email.trim(),
        phone: (phone || '').trim(),
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
        role: isNormalAdmin ? 'normal_admin' : 'client',
        membership: isNormalAdmin ? 'নরমাল অ্যাডমিন' : 'Silver Explorer',
        joinedDate: 'আজ নিবন্ধিত',
        isFirebaseUser: true
      };

      setUser(newUser);
      localStorage.setItem(AUTH_USER_KEY, JSON.stringify(newUser));
      StorageService.syncUser(newUser);
      closeAuthModal();
      return newUser;
    } catch (error) {
      console.error('Firebase Signup Error:', error);
      const message = getFirebaseErrorMessage(error);
      throw new Error(message);
    }
  };

  // 3. Firebase One-Click Google Authentication
  const loginWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const fbUser = result.user;
      const displayName = fbUser.displayName || 'Google Voyager';
      const firstName = displayName.split(' ')[0] || 'Voyager';
      const isNormalAdmin = StorageService.isNormalAdmin(fbUser.email);

      const googleUser = {
        id: fbUser.uid,
        uid: fbUser.uid,
        name: displayName,
        firstName,
        email: fbUser.email,
        phone: fbUser.phoneNumber || '+8801912987654',
        avatar: fbUser.photoURL || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
        role: isNormalAdmin ? 'normal_admin' : 'client',
        membership: isNormalAdmin ? 'নরমাল অ্যাডমিন' : 'Google Verified Voyager',
        joinedDate: 'Verified via Google',
        isFirebaseUser: true
      };

      setUser(googleUser);
      localStorage.setItem(AUTH_USER_KEY, JSON.stringify(googleUser));
      StorageService.syncUser(googleUser);
      closeAuthModal();
      return googleUser;
    } catch (error) {
      console.error('Firebase Google Sign-in Error:', error);
      const message = getFirebaseErrorMessage(error);
      throw new Error(message);
    }
  };

  // 4. Password Reset with Firebase
  const resetPassword = async (email) => {
    try {
      await sendPasswordResetEmail(auth, email.trim());
      return true;
    } catch (error) {
      console.error('Firebase Password Reset Error:', error);
      const message = getFirebaseErrorMessage(error);
      throw new Error(message);
    }
  };

  // Phone OTP Verification (Demo / Hybrid)
  const loginWithPhone = async (phone, otp) => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    const phoneUser = {
      id: `usr-ph-${Date.now()}`,
      name: `Voyager (${phone.slice(-4)})`,
      firstName: 'Voyager',
      email: `voyager${phone.slice(-4)}@aetheriatravels.com`,
      phone: phone.trim(),
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=300&q=80',
      role: 'client',
      membership: 'Verified Mobile Member',
      joinedDate: 'আজ যোগদান করেছেন'
    };

    setUser(phoneUser);
    closeAuthModal();
    return phoneUser;
  };

  // Switch demo account disabled - only real authenticated users
  const switchDemoAccount = () => {
    closeAuthModal();
  };

  // Update Profile
  const updateProfile = async (updatedFields) => {
    if (user && user.isFirebaseUser && auth.currentUser) {
      try {
        if (updatedFields.name) {
          await updateFirebaseProfile(auth.currentUser, {
            displayName: updatedFields.name
          });
        }
      } catch (e) {
        console.warn('Could not update profile in Firebase:', e);
      }
    }

    setUser((prev) => {
      if (!prev) return null;
      const firstName = updatedFields.name ? updatedFields.name.trim().split(' ')[0] : prev.firstName;
      const updated = {
        ...prev,
        ...updatedFields,
        firstName
      };
      localStorage.setItem(AUTH_USER_KEY, JSON.stringify(updated));
      StorageService.syncUser(updated);
      return updated;
    });
  };

  // Sign out from Firebase and local state
  const logout = async () => {
    try {
      await signOut(auth);
    } catch (e) {
      console.warn('Firebase Signout Error:', e);
    }
    setUser(null);
    localStorage.removeItem(AUTH_USER_KEY);
    closeUserModal();
  };

  // Wishlist toggle
  const toggleWishlist = (packageId) => {
    setWishlist((prev) => {
      if (prev.includes(packageId)) {
        return prev.filter(id => id !== packageId);
      } else {
        return [...prev, packageId];
      }
    });
  };

  const isPackageSaved = (packageId) => wishlist.includes(packageId);

  return (
    <AuthContext.Provider
      value={{
        user,
        wishlist,
        isAuthModalOpen,
        authModalTab,
        activeUserModal,
        isFirebaseInitialized,
        openAuthModal,
        closeAuthModal,
        openUserModal,
        closeUserModal,
        loginWithEmail,
        signupWithEmail,
        loginWithGoogle,
        resetPassword,
        loginWithPhone,
        switchDemoAccount,
        updateProfile,
        logout,
        toggleWishlist,
        isPackageSaved
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
