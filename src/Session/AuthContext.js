import React, { createContext, useEffect, useContext, useState } from 'react';
import { auth } from './firebase';

const AuthContext = createContext({
    user: null,
    loading: false
});

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Adds an observer for changes to the signed-in user's ID token, which includes sign-in, sign-out, and token refresh events.
        const unsubscribe = auth.onIdTokenChanged(async (currentUser) => {
            if (!currentUser) {
                console.log("AuthProvider: No user signed in");
                setUser(null);
                localStorage.removeItem("token");
                localStorage.removeItem("refreshToken");
            } else {
                try {
                    const token = await currentUser.getIdToken();
                    setUser(currentUser);
                    localStorage.setItem("token", token);
                    localStorage.setItem("refreshToken", currentUser.refreshToken);
                    console.log("AuthProvider: User authenticated, token updated");
                } catch (err) {
                    console.error("AuthProvider: Error getting token:", err);
                }
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    useEffect(() => {
        // Proactively refresh token every 10 minutes while app is open
        const handle = setInterval(async () => {
            const currentUser = auth.currentUser;
            if (currentUser) {
                console.log("AuthProvider: Periodic token refresh");
                try {
                    const token = await currentUser.getIdToken(true);
                    localStorage.setItem("token", token);
                } catch (err) {
                    console.error("AuthProvider: Periodic token refresh failed", err);
                }
            }
        }, 10 * 60 * 1000);
        return () => clearInterval(handle);
    }, []);

    return (
        <AuthContext.Provider value={{ user, loading }}>{children}</AuthContext.Provider>
    );
}

export const useAuth = () => {
    return useContext(AuthContext);
};