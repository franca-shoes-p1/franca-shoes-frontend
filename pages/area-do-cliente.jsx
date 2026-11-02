import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import VarejoLayout from '../lib/VarejoLayout';
import styles from '../styles/varejo.module.css';
import { brl, VAREJO } from '../lib/varejo';

const dataBR = (s) => (s ? new Date(s).toLocaleDateString('pt-BR') : '');

// Área do cliente: entra com e-mail + número de um pedido pago. Mostra o passe, os descontos por ramo e os pedidos.
export default function AreaCliente() {
  const [d, setD] = useState(null);
  const [f, setF] = useState({ email: '', numero: '' });
  const [erro, setErro] = useState('');
  const [ocupado, setOcupado] = useState(false);

  const carregar = useCallback(() => fetch('/api/membro/eu').then((r) => r.json()).then(setD).catch(() => setD({ logado: false, ramos: [] })), []);
  useEffect(() => { carregar(); }, [carregar]);

  async function entrar(e) {
    e.preventDefault();
    setErro(''); setOcupado(true);
    try {
      const r = await fetch('/api/membro/entrar', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(f) });
      const j = await r.json();
      if (!r.ok) throw new Error(j.erro || 'Não foi possível entrar.');
      await carregar();
    } catch (err) { setErro(err.message); }
    setOcupado(false);
  }
  async function sair() { await fetch('/api/membro/sair', { method: 'POST' }); await carregar(); }

  if (!d) return <VarejoLayout titulo="Área do cliente"><p>Carregando…</p></VarejoLayout>;

  if (!d.logado)
    return (
      <VarejoLayout titulo="Área do cliente">
        <div className={styles.caixa} style={{ maxWidth: 520 }}>
          <h1>Área do cliente</h1>
          <p style={{ margin: '8px 0 12px' }}>Entre com o e-mail da sua compra e o número de um pedido pago.</p>
          <form onSubmit={entrar}>
            <div className={styles.formGrade}>
              <div className={styles.grupo}><label>E-mail *</label><input className={styles.campo} type="email" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} required autoComplete="email" /></div>
              <div className={styles.grupo}><label>Número do pedido *</label><input className={styles.campo} inputMode="numeric" value={f.numero} onChange={(e) => setF({ ...f, numero: e.target.value })} required /></div>
            </div>
            {erro && <div className={styles.erro} style={{ marginTop: 10 }}>{erro}</div>}
            <button type="submit" className={styles.botaoPrincipal} disabled={ocupado} style={{ marginTop: 12 }}>{ocupado ? 'Entrando…' : 'Entrar'}</button>
          </form>
          <p className={styles.parcela} style={{ marginTop: 12 }}>
            Ainda não comprou? Conheça o <Link href="/assinar">passe de assinante</Link> ou <Link href="/calcados">veja a vitrine</Link>.
          </p>
        </div>
      </VarejoLayout>
    );

  return (
    <VarejoLayout titulo="Área do cliente">
      <div className={styles.caixa} style={{ maxWidth: 760 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
          <h1>Olá{d.nome ? `, ${String(d.nome).split(' ')[0]}` : ''}!</h1>
          <button className={styles.botaoSecundario} onClick={sair}>Sair</button>
        </div>
        <div className={d.ativo ? styles.ok : styles.aviso} style={{ marginTop: 12 }}>
          {d.ativo
            ? <>✓ Seu passe está <b>ativo até {dataBR(d.expira_em)}</b>. Você tem desconto de assinante nos produtos abaixo.</>
            : <>Seu passe {d.expira_em ? <>venceu em {dataBR(d.expira_em)}</> : 'não está ativo'}. <Link href={`/assinar?email=${encodeURIComponent(d.email)}`}>Renove por {brl(d.preco_passe)}</Link> e volte a ter desconto.</>}
        </div>
        {d.ativo && <p style={{ marginTop: 8 }}><Link href={`/assinar?email=${encodeURIComponent(d.email)}`}>Renovar agora (os dias se somam)</Link></p>}

        <h2 style={{ marginTop: 18 }}>Seus descontos por ramo</h2>
        <div style={{ display: 'grid', gap: 8, margin: '10px 0' }}>
          {d.ramos.map((r) => (
            <div key={r.slug} className={styles.linhaTotal} style={{ alignItems: 'flex-start' }}>
              <span><b>{r.nome}</b><br /><small>{r.automatico ? 'Aplicado sozinho quando você compra logado nesta área.' : `Peça pelo WhatsApp informando o e-mail ${d.email}.`}</small></span>
              <span style={{ textAlign: 'right' }}>{r.modo === 'margem' ? 'o que a margem permite' : `até ${Number(r.teto_pct)}%`}</span>
            </div>
          ))}
        </div>
        <p style={{ display: 'flex', gap: 10, flexWrap: 'wrap', margin: '12px 0' }}>
          <Link className={styles.botaoPrincipal} href="/calcados">Ir para a vitrine</Link>
          <a className={styles.botaoSecundario} href={`https://wa.me/${VAREJO.whatsapp}?text=${encodeURIComponent(`Olá! Sou assinante (${d.email}) e quero um orçamento.`)}`} target="_blank" rel="noopener noreferrer">Pedir orçamento pelo WhatsApp</a>
        </p>

        <h2 style={{ marginTop: 18 }}>Seus pedidos</h2>
        {d.pedidos.length === 0 && <p className={styles.parcela}>Nenhum pedido ainda.</p>}
        <div style={{ display: 'grid', gap: 6, margin: '10px 0' }}>
          {d.pedidos.map((p) => (
            <div key={p.numero} className={styles.linhaTotal}>
              <span>Pedido nº {p.numero} · {dataBR(p.criado_em)} · <b>{p.rotulo}</b></span>
              <span>{brl(p.total)} · <Link href={`/acompanhar?pedido=${p.numero}`}>acompanhar</Link></span>
            </div>
          ))}
        </div>
      </div>
    </VarejoLayout>
  );
}
