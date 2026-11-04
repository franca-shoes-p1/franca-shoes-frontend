import '../styles/globals.css';
import '../styles/admin.css';
import React from 'react';
import CampanhaFaixa from '../lib/CampanhaFaixa';
import RefCapture from '../lib/RefCapture';
import DivulgacaoClique from '../lib/DivulgacaoClique';

function MyApp({ Component, pageProps }) {
  return (
    <>
      <RefCapture />
      <DivulgacaoClique />
      <CampanhaFaixa />
      <Component {...pageProps} />
    </>
  );
}

export default MyApp;