import React, { useState } from 'react'
import { AuthService } from '../../services/authService';
import {signInWithGoogle} from '../../Session/firebase'



export default function Home() {

    let authService = new AuthService();

    const [userAutenticated, setUserAuthenticated] = useState(false);


    const login = () => {
        authService.login();
    };

    
    const flogin = () => {
        signInWithGoogle();
    };


    const logout = () => {
        authService.logout();
    };


    return (
        <div>
            <p>This is home screen.</p>
            <button onClick={login}>Login</button>
            <button onClick={flogin}>fLogin</button>
            <button onClick={logout}>Logout</button>

        </div>
    )
}