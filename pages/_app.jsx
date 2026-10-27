import '../styles/globals.css';
import '../styles/admin.css';
import React from 'react';
import CampanhaFaixa from '../lib/CampanhaFaixa';

function MyApp({ Component, pageProps }) {
  return (
    <>
      <CampanhaFaixa />
      <Component {...pageProps} />
    </>
  );
}

export default MyApp;