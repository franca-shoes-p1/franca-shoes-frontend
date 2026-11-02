import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import VarejoLayout from '../lib/VarejoLayout';
import styles from '../styles/varejo.module.css';
import { VAREJO, brl } from '../lib/varejo';
import { ETAPAS, rotuloStatus } from '../lib/pedidosStatus';

// Página pública: o cliente digita o número do pedido e o e-mail da compra e vê em que etapa está.
const dataBR = (d) => (d ? String(d).split('-').reverse().join('/') : '');

export default function Acompanhar() {
  const { query, isReady } = useRouter();
  const [f, setF] = useState({ numero: '', email: '' });
  const [r, setR] = useState(null);
  const [erro, setErro] = useState('');
  const [ocupado, setOcupado] = useState(false);

  useEffect(() => {
    if (isReady && query.pedido) setF((p) => ({ ...p, numero: String(query.pedido).replace(/\D/g, '') }));
  }, [isReady, query.pedido]);

  async function consultar(e) {
    e.preventDefault();
    setErro(''); setR(null); setOcupado(true);
    try {
      const res = await fetch('/api/varejo/acompanhar', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(f) });
      const j = await res.json();
      if (!res.ok) throw new Error(j.erro || 'Erro na consulta.');
      setR(j);
    } catch (err) { setErro(err.message); }
    setOcupado(false);
  }

  const etapas = r ? ETAPAS[r.entrega] || ETAPAS.correios : [];
  const idx = r ? etapas.indexOf(r.status) : -1;
  const fora = r && idx < 0; // recusado, cancelado, reembolsado, em conferência
  const rod = r && r.entrega === 'rodoviaria';
  const msg = encodeURIComponent(`Olá! Quero saber do meu pedido nº ${r ? r.numero : f.numero}.`);

  return (
    <VarejoLayout titulo="Acompanhar pedido">
      <div className={styles.caixa} style={{ maxWidth: 680 }}>
        <h1>Acompanhar o meu pedido</h1>
        <p style={{ margin: '8px 0 14px' }}>Digite o número do pedido e o e-mail usado na compra.</p>
        <form onSubmit={consultar}>
          <div className={styles.formGrade}>
            <div className={styles.grupo}>
              <label>Número do pedido *</label>
              <input className={styles.campo} inputMode="numeric" value={f.numero} onChange={(e) => setF({ ...f, numero: e.target.value })} required placeholder="Ex.: 12" />
            </div>
            <div className={styles.grupo}>
              <label>E-mail da compra *</label>
              <input className={styles.campo} type="email" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} required autoComplete="email" />
            </div>
          </div>
          <button type="submit" className={styles.botaoPrincipal} disabled={ocupado} style={{ marginTop: 12 }}>{ocupado ? 'Consultando…' : 'Ver o meu pedido'}</button>
        </form>
        {erro && <div className={styles.erro} style={{ marginTop: 12 }}>{erro}</div>}
      </div>

      {r && (
        <div className={styles.caixa} style={{ maxWidth: 680, marginTop: 16 }}>
          <h2>Pedido nº {r.numero}</h2>
          <p style={{ margin: '6px 0 14px', fontSize: '1.1rem' }}><b>{r.rotulo}</b></p>

          {!fora && (
            <ol style={{ listStyle: 'none', padding: 0, margin: '0 0 16px', display: 'grid', gap: 8 }}>
              {etapas.map((s, i) => (
                <li key={s} style={{ display: 'flex', gap: 10, alignItems: 'center', opacity: i <= idx ? 1 : 0.45 }}>
                  <span style={{ width: 26, height: 26, borderRadius: '50%', display: 'grid', placeItems: 'center', fontWeight: 800, fontSize: 13, background: i <= idx ? '#14933f' : '#d6dee9', color: '#fff' }}>{i < idx ? '✓' : i + 1}</span>
                  <span style={{ fontWeight: i === idx ? 800 : 500 }}>{rotuloStatus(s)}</span>
                </li>
              ))}
            </ol>
          )}
          {fora && (
            <p style={{ marginBottom: 14 }}>
              {r.status === 'pagamento_recusado' && 'O pagamento não foi concluído e nada foi cobrado. Você pode fazer um novo pedido ou falar com a gente.'}
              {r.status === 'cancelado' && 'Este pedido foi cancelado.'}
              {r.status === 'reembolsado' && 'O valor foi reembolsado pelo mesmo meio de pagamento da compra.'}
              {r.status === 'valor_divergente' && 'Estamos conferindo o pagamento deste pedido. Se precisar, fale com a gente pelo WhatsApp.'}
            </p>
          )}

          <div style={{ fontSize: '0.95rem', display: 'grid', gap: 4 }}>
            {r.itens.map((i, k) => <div key={k}>{i.quantidade}× {i.titulo} (nº {i.tamanho})</div>)}
            <div style={{ marginTop: 6 }}>Total pago: <b>{brl(r.total)}</b> {Number(r.frete) > 0 ? `(com frete de ${brl(r.frete)})` : '(frete grátis)'}</div>
          </div>

          {rod && (
            <div className={styles.parcela} style={{ marginTop: 14 }}>
              <b>Retirada na rodoviária de {r.cidade}-{r.estado}.</b>{' '}
              {r.lote
                ? r.lote.status === 'aberto'
                  ? `Seu lote está juntando pedidos: ${r.lote.pedidos} de ${r.lote.minimo}. Avisamos a data pelo WhatsApp quando fechar.`
                  : r.lote.data_saida
                    ? `Seu lote já fechou. Saída prevista: ${dataBR(r.lote.data_saida)}. Combinamos o local e o horário da retirada pelo WhatsApp. Leve um documento com foto.`
                    : 'Seu lote já fechou. Em breve avisamos a data e o horário da retirada pelo WhatsApp.'
                : 'Assim que o pagamento for confirmado, seu pedido entra no lote da cidade.'}
            </div>
          )}
          {!rod && r.codigo_rastreio && (
            <div className={styles.parcela} style={{ marginTop: 14 }}>
              <b>Código de rastreio:</b> {r.codigo_rastreio}{' '}
              <a href="https://rastreamento.correios.com.br/" target="_blank" rel="noopener noreferrer">Abrir o rastreamento dos Correios</a>
            </div>
          )}

          <p style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 16 }}>
            <a className={styles.botaoSecundario} href={`https://wa.me/${VAREJO.whatsapp}?text=${msg}`} target="_blank" rel="noopener noreferrer">Falar no WhatsApp</a>
            <Link className={styles.botaoSecundario} href="/como-comprar">Ver o passo a passo da compra</Link>
          </p>
        </div>
      )}
    </VarejoLayout>
  );
}
