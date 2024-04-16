// pages/_app.js
import { PopupProvider } from '@/app/popupContext';
import React from 'react';

function MyApp({ Component, pageProps }: { Component: React.ElementType, pageProps: any }) {
    return (
        <PopupProvider>
            <Component {...pageProps} />
        </PopupProvider>
    );
}

export default MyApp;
