import { createContext, useEffect, useContext, useState } from 'react'
import { auth } from './firebase'

const AuthContext = createContext({
    user: null
})

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null)

    useEffect(() => {
        //Adds an observer for changes to the signed-in user's ID token, which includes sign-in, sign-out, and token refresh events.
        return auth.onIdTokenChanged(async (user) => {
            if (!user) {
                console.log("missing user")
                setUser(null)
            }
            else {
                const token = await user.getIdToken();
                setUser(user);
                localStorage.setItem("token", token);
                console.log("AuthProvider\Token", token);
            }
        })
    }, []);

    
    useEffect(() => {
        const handle = setInterval(async () => {
            const user = auth.currentUser;
            if (user) {
                console.log("refresh");
                //true - force refresh
                await user.getIdToken(true);
                console.log(user);
            }
        }, 4 * 6 * 1000);
        return () => clearInterval(handle);
    }, [])

    return (
        <AuthContext.Provider value={{ user }}>{children}</AuthContext.Provider>
    )
}

export const useAuth = () => {
    return useContext(AuthContext);
}