import Head from 'next/head';
import VitrineHome from '../lib/VitrineHome';

// Prévia da nova home com vitrine de produtos. A home atual (/) e a /vitrine existente continuam como estão até você aprovar.
export default function NovaHome() {
  return (
    <>
      <Head>
        <title>Calçados direto das fábricas de Franca | igreja.eco.br</title>
        <meta name="description" content="Calçados e acessórios a preço de fábrica. Pague por PIX ou cartão e retire na rodoviária da sua cidade ou receba pelos Correios." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <VitrineHome />
    </>
  );
}
