import { useState } from 'react';
import Link from 'next/link';
import VarejoLayout from '../../lib/VarejoLayout';
import styles from '../../styles/varejo.module.css';
import f from '../../styles/fabricasFranca.module.css';
import { listarLojasPublicas, bonusDias } from '../../lib/fabricasFrancaServer';

export async function getServerSideProps({ res }) {
  res.setHeader('Cache-Control', 'public, s-maxage=120, stale-while-revalidate=300');
  const lojas = (await listarLojasPublicas()).map((l) => ({ id: l.id, nome: l.nome }));
  return { props: { lojas, bonus: await bonusDias() } };
}

// O cliente avisa que comprou no site de uma empresa listada. O dono confere e aprova no painel.
export default function RegistrarCompra({ lojas, bonus }) {
  const [d, setD] = useState({ nome: '', email: '', whatsapp: '', loja_id: '', chave: '', pedido: '', site: '' });
  const [erro, setErro] = useState('');
  const [ocupado, setOcupado] = useState(false);
  const [feito, setFeito] = useState(null);
  const mud = (k) => (e) => setD({ ...d, [k]: e.target.value });

  async function enviar(e) {
    e.preventDefault();
    setErro(''); setOcupado(true);
    try {
      const r = await fetch('/api/fabricas/comprovante', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(d) });
      const j = await r.json();
      if (!r.ok) throw new Error(j.erro || 'Não foi possível registrar.');
      setFeito(j);
    } catch (err) { setErro(err.message); }
    setOcupado(false);
  }

  return (
    <VarejoLayout titulo="Registrar minha compra">
      <div className={styles.caixa} style={{ maxWidth: 680 }}>
        <h1>Registrar minha compra</h1>
        {feito ? (
          <div className={f.ok}>
            <p><b>Compra registrada. Seu protocolo é o número {feito.protocolo}.</b></p>
            <p style={{ marginTop: 8 }}>
              Vamos conferir os dados em até 2 dias úteis.
              {feito.bonus_dias > 0 ? ` Se estiver tudo certo, você ganha ${feito.bonus_dias} dias de passe de boas-vindas e entra na Área do cliente com o seu e-mail e o número do protocolo.` : ''}
            </p>
            <p style={{ marginTop: 10 }}><Link href="/fabricas">Voltar às fábricas</Link> · <Link href="/area-do-cliente">Área do cliente</Link></p>
          </div>
        ) : (
          <form onSubmit={enviar}>
            <p style={{ margin: '8px 0 12px' }}>
              Comprou em uma empresa da nossa lista?{bonus > 0 ? ` Registre aqui e, depois da conferência, ganhe ${bonus} dias de passe de assinante.` : ' Registre aqui para ficar cadastrado.'}
              {' '}Usamos a chave da nota fiscal só para conferir a compra.
            </p>
            <div className={styles.formGrade}>
              <div className={`${styles.grupo} ${styles.cheio}`}><label>Nome completo *</label><input className={styles.campo} value={d.nome} onChange={mud('nome')} required autoComplete="name" /></div>
              <div className={styles.grupo}><label>E-mail *</label><input className={styles.campo} type="email" value={d.email} onChange={mud('email')} required autoComplete="email" /></div>
              <div className={styles.grupo}><label>WhatsApp com DDD *</label><input className={styles.campo} type="tel" value={d.whatsapp} onChange={mud('whatsapp')} required autoComplete="tel" placeholder="(16) 99999-9999" /></div>
              <div className={`${styles.grupo} ${styles.cheio}`}>
                <label>Em qual empresa você comprou? *</label>
                <select className={styles.campo} value={d.loja_id} onChange={mud('loja_id')} required>
                  <option value="">Escolha…</option>
                  {lojas.map((l) => <option key={l.id} value={l.id}>{l.nome}</option>)}
                </select>
              </div>
              <div className={`${styles.grupo} ${styles.cheio}`}>
                <label>Chave da nota fiscal (44 números)</label>
                <input className={styles.campo} inputMode="numeric" value={d.chave} onChange={mud('chave')} placeholder="Está no e-mail ou na nota que veio com o pedido" />
              </div>
              <div className={`${styles.grupo} ${styles.cheio}`}>
                <label>Número do pedido na loja da empresa (se não tiver a nota)</label>
                <input className={styles.campo} value={d.pedido} onChange={mud('pedido')} />
              </div>
              <input value={d.site} onChange={mud('site')} tabIndex={-1} autoComplete="off" style={{ display: 'none' }} />
            </div>
            {erro && <div className={styles.erro} style={{ marginTop: 10 }}>{erro}</div>}
            <button type="submit" className={styles.botaoPrincipal} disabled={ocupado} style={{ marginTop: 12 }}>{ocupado ? 'Enviando…' : 'Registrar minha compra'}</button>
            <p className={styles.parcela} style={{ marginTop: 10 }}>
              Registrar a compra não é obrigatório para comprar nem para assinar o passe. Cada compra só pode ser registrada uma vez.
            </p>
          </form>
        )}
      </div>
    </VarejoLayout>
  );
}
