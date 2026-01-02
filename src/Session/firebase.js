// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries


import {
    GoogleAuthProvider,
    getAuth,
    signInWithPopup,
    signOut,
} from "firebase/auth";

// Your web app's Firebase configuration
// const firebaseConfig = {
//     apiKey: "AIzaSyAsTK9yDdOT-mdSOs7yfo7Om8bsoBmech0",
//     authDomain: "ptgettasks3prod.firebaseapp.com",
//     projectId: "ptgettasks3prod",
//     storageBucket: "ptgettasks3prod.appspot.com",
//     messagingSenderId: "854454902563",
//     appId: "1:854454902563:web:b9233fd0b0161fa6837696"
// };
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


const googleProvider = new GoogleAuthProvider();
const signInWithGoogle = async () => {
    try {
        const res = await signInWithPopup(auth, googleProvider);
        console.log(res);
        localStorage.setItem("token", res.user.accessToken)
        localStorage.setItem("refreshtoken", res.user.refreshToken)
    } catch (err) {
        console.error(err);
        alert(err.message);
    }
};

const logout = () => {
    signOut(auth);
    localStorage.removeItem("token")
};


export {
    auth,
    signInWithGoogle,
    logout,
};