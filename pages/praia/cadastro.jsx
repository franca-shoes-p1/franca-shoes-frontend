import React, { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import styles from '../../styles/home.module.css';
import p from '../../styles/praia.module.css';
import PraiaLayout from '../../lib/PraiaLayout';
import { api } from '../../lib/adminClient';

export default function Cadastro() {
  const router = useRouter();
  const [f, setF] = useState({ nome: '', telefone: '', cidade: '', bairro: '', tem_pix: 'sim', disponibilidade: '', experiencia: '', aceito: false, site: '' });
  const [msg, setMsg] = useState(null);
  const [ocupado, setOcupado] = useState(false);
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  async function enviar(ev) {
    ev.preventDefault();
    setOcupado(true); setMsg(null);
    try {
      const origem = new URLSearchParams(window.location.search).get('ponto') || '';
      const r = await api('/api/praia/cadastro', { method: 'POST', body: { ...f, tem_pix: f.tem_pix === 'sim', origem } });
      router.push(`/praia/obrigado?lista=${r.lista_espera ? 1 : 0}`);
    } catch (e) { setMsg(e.message); setOcupado(false); }
  }

  return (
    <PraiaLayout titulo="Quero uma vaga" descricao="Cadastre-se para vender comida na praia em parceria. Vagas limitadas por cidade.">
      <section className={`${styles.secao} ${styles.clara}`}>
        <div className={styles.contido + ' ' + p.cadGrade}>
          <div>
            <p className={styles.sobre}>Cadastro</p>
            <h1 className={styles.h2}>Quero uma vaga</h1>
            <p className={styles.sub}>Preencha ao lado. A coordenação chama você no WhatsApp para conversar.</p>
            <ul className={p.lista}>
              <li><b>Sem custo para se cadastrar.</b></li>
              <li><b>Vagas limitadas por cidade.</b> Sem vaga, você entra na lista de espera.</li>
              <li><b>Sem promessa de ganho.</b> Você vê a conta de cada dia.</li>
              <li><b>Parceria entre autônomos.</b> Sem vínculo de emprego.</li>
            </ul>
          </div>
          <form className={p.form} onSubmit={enviar}>
            {msg && <div className={p.erro}>{msg}</div>}
            <label htmlFor="n">Seu nome</label>
            <input id="n" type="text" value={f.nome} onChange={set('nome')} required />
            <label htmlFor="t">WhatsApp com DDD</label>
            <input id="t" type="tel" inputMode="tel" value={f.telefone} onChange={set('telefone')} required />
            <label htmlFor="c">Cidade onde mora (litoral)</label>
            <input id="c" type="text" value={f.cidade} onChange={set('cidade')} required />
            <label htmlFor="b">Bairro (opcional)</label>
            <input id="b" type="text" value={f.bairro} onChange={set('bairro')} />
            <label htmlFor="x">Você tem chave PIX no seu nome?</label>
            <select id="x" value={f.tem_pix} onChange={set('tem_pix')}><option value="sim">Sim</option><option value="nao">Ainda não</option></select>
            <label htmlFor="d">Em quais dias e horários pode vender? (opcional)</label>
            <input id="d" type="text" value={f.disponibilidade} onChange={set('disponibilidade')} />
            <label htmlFor="e">Experiência com vendas ou comida (opcional)</label>
            <textarea id="e" value={f.experiencia} onChange={set('experiencia')} />
            <input className={p.isca} name="site" tabIndex={-1} autoComplete="off" aria-hidden="true" value={f.site} onChange={set('site')} />
            <label className={p.aceite}>
              <input type="checkbox" checked={f.aceito} onChange={(e) => setF({ ...f, aceito: e.target.checked })} />
              <span>Aceito receber contato por WhatsApp sobre o Parceiros da Praia. Usaremos meus dados só para isso, conforme a <Link href="/praia/privacidade">política de privacidade</Link>.</span>
            </label>
            <button className={`${styles.botao} ${styles.principal} ${p.enviar}`} disabled={ocupado || !f.aceito}>{ocupado ? 'Enviando…' : 'Enviar cadastro'}</button>
          </form>
        </div>
      </section>
    </PraiaLayout>
  );
}
