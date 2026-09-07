// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";

import {
    GoogleAuthProvider,
    getAuth,
    signInWithPopup,
    signOut,
    setPersistence,
    browserLocalPersistence,
} from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyA5rZKf-dVt6mKGvMHa9pgJ_P6gohdmLeo",
    authDomain: "ptprojectsweb.firebaseapp.com",
    projectId: "ptprojectsweb",
    storageBucket: "ptprojectsweb.firebasestorage.app",
    messagingSenderId: "93484780890",
    appId: "1:93484780890:web:0e9f7b8629d308ff9ff763"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Ensure local persistence is explicitly enabled across browser sessions
setPersistence(auth, browserLocalPersistence).catch((err) => {
    console.error("Failed to set Firebase auth persistence:", err);
});

let authInitializedPromise = null;

const waitForAuth = () => {
    if (!authInitializedPromise) {
        authInitializedPromise = new Promise((resolve) => {
            const unsubscribe = auth.onAuthStateChanged((user) => {
                unsubscribe();
                resolve(user);
            });
        });
    }
    return authInitializedPromise;
};

const getAuthToken = async (forceRefresh = false) => {
    let user = auth.currentUser;
    if (!user) {
        user = await waitForAuth();
    }
    if (user) {
        try {
            const token = await user.getIdToken(forceRefresh);
            localStorage.setItem("token", token);
            localStorage.setItem("refreshToken", user.refreshToken);
            return token;
        } catch (err) {
            console.error("Error getting fresh token from Firebase user:", err);
        }
    }
    return localStorage.getItem("token");
};

const googleProvider = new GoogleAuthProvider();
const signInWithGoogle = async () => {
    try {
        await setPersistence(auth, browserLocalPersistence);
        const res = await signInWithPopup(auth, googleProvider);
        console.log(res);
        const token = await res.user.getIdToken();
        localStorage.setItem("token", token);
        localStorage.setItem("refreshToken", res.user.refreshToken);
        return res.user;
    } catch (err) {
        console.error(err);
        alert(err.message);
    }
};

const logout = async () => {
    try {
        await signOut(auth);
    } finally {
        localStorage.removeItem("token");
        localStorage.removeItem("refreshToken");
    }
};

export {
    auth,
    signInWithGoogle,
    logout,
    waitForAuth,
    getAuthToken,
};