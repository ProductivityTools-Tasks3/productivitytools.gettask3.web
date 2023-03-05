import React, { useState } from 'react'
import { signInWithGoogle } from '../../Session/firebase'



export default function Home() {
    const flogin = () => {
        signInWithGoogle();
    };

    return (
        <div>
            <p>This is home screen. v3</p>
            <button onClick={flogin}>fLogin</button>
        </div>
    )
}