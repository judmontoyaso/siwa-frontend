'use client';
import React from 'react';

const LoginButton = () => {
    const startSession = () => {
        window.location.href = '/api/auth/login';
    }

    return (
        <button type="button" onClick={startSession}>Iniciar Sesión</button>
    );
}

export default LoginButton;