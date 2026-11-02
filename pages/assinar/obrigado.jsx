import { useRouter } from 'next/router';
import Link from 'next/link';
import VarejoLayout from '../../lib/VarejoLayout';
import styles from '../../styles/varejo.module.css';
import { VAREJO } from '../../lib/varejo';
import { PASSE } from '../../lib/assinatura';

export default function ObrigadoPasse() {
  const { query } = useRouter();
  const pedido = String(query.pedido || '').replace(/\D/g, '');
  return (
    <VarejoLayout titulo="Passe de assinante">
      <div className={styles.caixa} style={{ maxWidth: 640 }}>
        <h1>Recebemos o seu pedido do passe{pedido ? ` (nº ${pedido})` : ''} ✅</h1>
        <p style={{ margin: '10px 0' }}>
          Assim que o Mercado Pago confirmar o pagamento (o PIX costuma cair na hora), o seu passe vale por {PASSE.dias} dias.
          Para entrar na Área do cliente use o e-mail da compra e o número do pedido{pedido ? <> <b>{pedido}</b></> : ''}.
        </p>
        <p style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 16 }}>
          <Link className={styles.botaoPrincipal} href="/area-do-cliente">Entrar na Área do cliente</Link>
          <a className={styles.botaoSecundario} href={`https://wa.me/${VAREJO.whatsapp}`} target="_blank" rel="noopener noreferrer">Falar no WhatsApp</a>
        </p>
      </div>
    </VarejoLayout>
  );
}
