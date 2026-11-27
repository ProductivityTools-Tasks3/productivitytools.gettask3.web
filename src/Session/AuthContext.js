import React, { createContext, useEffect, useContext, useState, useCallback } from 'react';
import { auth } from './firebase';
import statusService from '../services/statusService';

const AuthContext = createContext({
    user: null,
    loading: false,
    tokenRefreshTime: null,
    refreshToken: async () => null,
});

export function AuthProvider({ children }) {
    const [user, setUser] = useState(() => {
        const cachedEmail = localStorage.getItem("cachedUserEmail");
        return cachedEmail ? { email: cachedEmail, isCachedOfflineUser: true } : null;
    });
    const [loading, setLoading] = useState(true);
    const [tokenRefreshTime, setTokenRefreshTime] = useState(() => {
        const stored = localStorage.getItem("tokenRefreshTime");
        return stored ? new Date(stored) : null;
    });

    const refreshToken = useCallback(async () => {
        if (typeof navigator !== "undefined" && !navigator.onLine) {
            return localStorage.getItem("token");
        }
        const currentUser = auth.currentUser;
        if (currentUser) {
            const token = await currentUser.getIdToken(true);
            const now = new Date();
            localStorage.setItem("token", token);
            localStorage.setItem("refreshToken", currentUser.refreshToken);
            localStorage.setItem("tokenRefreshTime", now.toISOString());
            setTokenRefreshTime(now);
            return token;
        }
        return null;
    }, []);

    useEffect(() => {
        // Adds an observer for changes to the signed-in user's ID token, which includes sign-in, sign-out, and token refresh events.
        const unsubscribe = auth.onIdTokenChanged(async (currentUser) => {
            if (!currentUser) {
                if (typeof navigator !== "undefined" && !navigator.onLine) {
                    const cachedEmail = localStorage.getItem("cachedUserEmail");
                    if (cachedEmail) {
                        setUser({ email: cachedEmail, isCachedOfflineUser: true });
                        setLoading(false);
                        return;
                    }
                }
                console.log("AuthProvider: No user signed in");
                setUser(null);
                setTokenRefreshTime(null);
                localStorage.removeItem("token");
                localStorage.removeItem("refreshToken");
                localStorage.removeItem("tokenRefreshTime");
                localStorage.removeItem("cachedUserEmail");
            } else {
                setUser(currentUser);
                if (currentUser.email) {
                    localStorage.setItem("cachedUserEmail", currentUser.email);
                }
                try {
                    const token = await currentUser.getIdToken();
                    localStorage.setItem("token", token);
                    localStorage.setItem("refreshToken", currentUser.refreshToken);

                    let issuedAt = new Date();
                    if (typeof currentUser.getIdTokenResult === "function") {
                        try {
                            const tokenResult = await currentUser.getIdTokenResult();
                            if (tokenResult?.claims?.iat) {
                                issuedAt = new Date(tokenResult.claims.iat * 1000);
                            }
                        } catch (resErr) {
                            console.warn("AuthProvider: Failed to inspect token metadata:", resErr);
                        }
                    }
                    localStorage.setItem("tokenRefreshTime", issuedAt.toISOString());
                    setTokenRefreshTime(issuedAt);
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
            if (typeof navigator !== "undefined" && !navigator.onLine) return;
            const currentUser = auth.currentUser;
            if (currentUser) {
                console.log("AuthProvider: Periodic token refresh");
                try {
                    statusService.info("Auto-refreshing session token...");
                    await refreshToken();
                    statusService.success("Session token refreshed");
                } catch (err) {
                    console.error("AuthProvider: Periodic token refresh failed", err);
                }
            }
        }, 10 * 60 * 1000);
        return () => clearInterval(handle);
    }, [refreshToken]);

    return (
        <AuthContext.Provider value={{ user, loading, tokenRefreshTime, refreshToken }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => {
    return useContext(AuthContext);
};
