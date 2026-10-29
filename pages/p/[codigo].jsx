// Destino do QR Code: conta a visita do ponto e leva à página do parceiro (que, se o ponto não estiver ativo, segue para a loja).
import { sb } from '../../lib/varejoServer';

export async function getServerSideProps({ params, res }) {
  const codigo = String(params.codigo || '').toUpperCase();
  const valido = /^[A-Z0-9]{4,10}$/.test(codigo);
  if (valido) {
    try {
      await sb('rf_pontos_visitas', { method: 'POST', body: JSON.stringify({ codigo }) });
    } catch (e) {}
  }
  res.setHeader('Cache-Control', 'no-store');
  return { redirect: { destination: valido ? `/ponto/${codigo}` : '/calcados', permanent: false } };
}

export default function Ir() {
  return null;
}
