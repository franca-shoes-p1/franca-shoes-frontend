import { useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import VarejoLayout from '../../lib/VarejoLayout';
import styles from '../../styles/varejo.module.css';
import { VAREJO, limparCarrinho } from '../../lib/varejo';

export default function Obrigado() {
  const { query } = useRouter();
  const falhou = query.falhou === '1';
  const pedido = String(query.pedido || '').replace(/\D/g, '');

  useEffect(() => {
    // Só esvazia o carrinho se o cliente voltou do pagamento sem falha.
    if (query.pedido && !falhou) limparCarrinho();
  }, [query.pedido, falhou]);

  const msg = encodeURIComponent(`Olá! Fiz o pedido nº ${pedido} na loja e tenho uma dúvida.`);

  return (
    <VarejoLayout titulo="Pedido">
      <div className={styles.caixa} style={{ maxWidth: 640 }}>
        {falhou ? (
          <>
            <h1>O pagamento não foi concluído</h1>
            <p style={{ margin: '10px 0' }}>
              Nada foi cobrado. Seus itens continuam no carrinho: é só tentar de novo, com PIX ou outro cartão.
            </p>
            <Link href="/calcados/carrinho" className={styles.botaoPrincipal}>Voltar ao carrinho</Link>
          </>
        ) : (
          <>
            <h1>Pedido{pedido ? ` nº ${pedido}` : ''} recebido ✅</h1>
            <p style={{ margin: '10px 0' }}>
              Assim que o Mercado Pago confirmar o pagamento (o PIX costuma cair na hora), vamos separar seus calçados na fábrica e enviar.
              Saída em {VAREJO.prazoPreparoDias}, {VAREJO.prazoEntregaInfo}. Avisamos você por e-mail e WhatsApp.
            </p>
            <p style={{ margin: '10px 0' }}>
              Se o pagamento ainda estiver pendente, finalize pelo link que o Mercado Pago enviou ao seu e-mail.
            </p>
            <p style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 16 }}>
              <a className={styles.botaoSecundario} href={`https://wa.me/${VAREJO.whatsapp}?text=${msg}`} target="_blank" rel="noopener noreferrer">
                Falar no WhatsApp
              </a>
              <Link className={styles.botaoSecundario} href="/calcados">Continuar comprando</Link>
            </p>
          </>
        )}
      </div>
    </VarejoLayout>
  );
}
