import '../styles/globals.css';
import '../styles/admin.css';
import React from 'react';
import CampanhaFaixa from '../lib/CampanhaFaixa';
import RefCapture from '../lib/RefCapture';

function MyApp({ Component, pageProps }) {
  return (
    <>
      <RefCapture />
      <CampanhaFaixa />
      <Component {...pageProps} />
    </>
  );
}

export default MyApp;