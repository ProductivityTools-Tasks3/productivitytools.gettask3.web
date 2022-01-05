import React, { useState } from 'react'
import { AuthService } from '../../services/authService';


export default function Home() {

    let authService = new AuthService();

    const [userAutenticated, setUserAuthenticated] = useState(false);


    const login = () => {
        authService.login();
    };


    const logout = () => {
        authService.logout();
    };


    return (
        <div>
            <p>This is home screen.</p>
            <button onClick={login}>Login</button>
            <button onClick={logout}>Logout</button>

        </div>
    )
}