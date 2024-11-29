// pages/_app.js
import React from 'react';

function MyApp({ Component, pageProps }: { Component: React.ElementType, pageProps: any }) {
    return (
 +
            <Component {...pageProps} />
  
    );
}

export default MyApp;
