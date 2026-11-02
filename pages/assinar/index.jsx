import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import VarejoLayout from '../../lib/VarejoLayout';
import styles from '../../styles/varejo.module.css';
import { brl, VAREJO } from '../../lib/varejo';
import { PASSE } from '../../lib/assinatura';

// Página pública: explica o passe de assinante e abre o pagamento.
export default function Assinar() {
  const { query, isReady } = useRouter();
  const [plano, setPlano] = useState({ preco_passe: PASSE.precoPadrao, ramos: [] });
  const [f, setF] = useState({ nome: '', email: '', whatsapp: '', site: '' });
  const [erro, setErro] = useState('');
  const [ocupado, setOcupado] = useState(false);

  useEffect(() => {
    fetch('/api/varejo/planos').then((r) => r.json()).then(setPlano).catch(() => {});
  }, []);
  useEffect(() => {
    if (isReady && query.email) setF((p) => ({ ...p, email: String(query.email).slice(0, 120) }));
  }, [isReady, query.email]);

  async function assinar(e) {
    e.preventDefault();
    setErro(''); setOcupado(true);
    try {
      const r = await fetch('/api/varejo/passe', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(f) });
      const j = await r.json();
      if (!r.ok || !j.url) throw new Error(j.erro || 'Erro ao abrir o pagamento.');
      window.location.href = j.url;
    } catch (err) { setErro(err.message); setOcupado(false); }
  }
  const mud = (k) => (e) => setF({ ...f, [k]: e.target.value });

  return (
    <VarejoLayout titulo="Passe de assinante">
      <div className={styles.caixa} style={{ maxWidth: 760 }}>
        <h1>Passe de assinante</h1>
        <p style={{ margin: '8px 0 12px' }}>
          Por <b>{brl(plano.preco_passe)}</b> a cada {PASSE.dias} dias você paga menos nos produtos e serviços do site e acessa a Área do cliente.
          É opcional: quem não assina compra normalmente pelo preço geral.
        </p>
        <h2 style={{ marginTop: 14 }}>Quanto você economiza</h2>
        <div style={{ display: 'grid', gap: 8, margin: '10px 0' }}>
          {plano.ramos.map((r) => (
            <div key={r.slug} className={styles.linhaTotal} style={{ alignItems: 'flex-start' }}>
              <span><b>{r.nome}</b><br /><small>{r.automatico ? 'Desconto aplicado sozinho no checkout' : 'Desconto combinado pelo WhatsApp ao pedir'}</small></span>
              <span style={{ textAlign: 'right' }}>{r.modo === 'margem' ? 'o máximo que a margem permite' : `até ${Number(r.teto_pct)}%`}</span>
            </div>
          ))}
        </div>
        <p className={styles.parcela}>
          No calçado o desconto é menor porque a margem é pequena: ele é calculado produto a produto e aparece na página de cada modelo.
          Quem compra um produto físico ganha {PASSE.dias} dias de passe de boas-vindas.
        </p>

        <h2 style={{ marginTop: 18 }}>Assinar agora</h2>
        <form onSubmit={assinar}>
          <div className={styles.formGrade}>
            <div className={`${styles.grupo} ${styles.cheio}`}><label>Nome completo *</label><input className={styles.campo} value={f.nome} onChange={mud('nome')} required autoComplete="name" /></div>
            <div className={styles.grupo}><label>E-mail * (use o mesmo das compras)</label><input className={styles.campo} type="email" value={f.email} onChange={mud('email')} required autoComplete="email" /></div>
            <div className={styles.grupo}><label>WhatsApp com DDD *</label><input className={styles.campo} type="tel" value={f.whatsapp} onChange={mud('whatsapp')} required autoComplete="tel" placeholder="(16) 99999-9999" /></div>
            <input value={f.site} onChange={mud('site')} tabIndex={-1} autoComplete="off" style={{ display: 'none' }} />
          </div>
          {erro && <div className={styles.erro} style={{ marginTop: 10 }}>{erro}</div>}
          <button type="submit" className={styles.botaoPrincipal} disabled={ocupado} style={{ marginTop: 12 }}>{ocupado ? 'Abrindo pagamento…' : `Pagar ${brl(plano.preco_passe)} com PIX ou cartão`}</button>
        </form>
        <p className={styles.parcela} style={{ marginTop: 10 }}>
          O passe vale {PASSE.dias} dias a partir do pagamento e se renova quando você paga de novo (os dias se somam). Não renova sozinho nem cobra no cartão sem você pedir.
          Direito de arrependimento de 7 dias, conforme o Código de Defesa do Consumidor: fale conosco pelo{' '}
          <a href={`https://wa.me/${VAREJO.whatsapp}`} target="_blank" rel="noopener noreferrer">WhatsApp</a>.
        </p>
        <p style={{ marginTop: 10 }}><Link href="/area-do-cliente">Já sou cliente: entrar na Área do cliente</Link></p>
      </div>
    </VarejoLayout>
  );
}
