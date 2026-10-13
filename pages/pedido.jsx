import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import styles from '../styles/pedido.module.css';

const WHATSAPP = '5516991543663';
const LINK_WHATS = `https://wa.me/${WHATSAPP}?text=${encodeURIComponent('Olá! Quero pedir um serviço de IA e automação.')}`;

const SERVICOS = [
  'Atendimento automático',
  'Conteúdo automático',
  'Site ou portal',
  'Painel de gestão',
  'Instalação personalizada',
  'Pacote pronto para comércio',
  'Outro / ainda não sei',
];

const VAZIO = { nome: '', whatsapp: '', email: '', servico: '', cidade: '', mensagem: '', aceite: false, site: '' };

export default function Pedido() {
  const router = useRouter();
  const inicial = typeof router.query.servico === 'string' && SERVICOS.includes(router.query.servico) ? router.query.servico : '';
  const [dados, setDados] = useState(VAZIO);
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState('');
  const [enviado, setEnviado] = useState(false);

  useEffect(() => {
    const p = router.query.pacote;
    if (router.isReady && typeof p === 'string' && p) {
      setDados((d) => (d.mensagem ? d : { ...d, mensagem: `Quero saber mais sobre o pacote: ${p.slice(0, 80)}.\nMeu negócio: ` }));
    }
  }, [router.isReady, router.query.pacote]);

  const servicoAtual = dados.servico || inicial;
  const mudar = (campo) => (e) =>
    setDados({ ...dados, [campo]: e.target.type === 'checkbox' ? e.target.checked : e.target.value });

  async function enviar(e) {
    e.preventDefault();
    if (enviando) return;
    setErro('');
    setEnviando(true);
    try {
      const resp = await fetch('/api/pedido-servico', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...dados, servico: servicoAtual }),
      });
      const json = await resp.json().catch(() => ({}));
      if (resp.ok && json.ok) {
        setEnviado(true);
        setDados(VAZIO);
      } else {
        setErro(json.erro || 'Não foi possível enviar agora.');
      }
    } catch {
      setErro('Sem conexão no momento. Tente de novo.');
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className={styles.pagina}>
      <Head>
        <title>Pedir um serviço | Igreja Eco</title>
        <meta name="description" content="Peça um serviço de IA e automação. Respondemos pelo WhatsApp." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <header className={styles.topo}>
        <div className={styles.topoBarra}>
          <Link href="/" className={styles.marca}>
            <span className={styles.selo}>IE</span>
            <span>Igreja Eco</span>
          </Link>
          <Link href="/" className={styles.voltar}>← Voltar ao portal</Link>
        </div>
      </header>

      <main className={styles.conteudo}>
        {enviado ? (
          <div className={styles.sucesso} role="status">
            <span className={styles.sucessoIcone} aria-hidden="true">✓</span>
            <h1 className={styles.titulo}>Pedido recebido!</h1>
            <p>Obrigado. Vamos analisar o que você precisa e responder pelo WhatsApp que você informou.</p>
            <a href={LINK_WHATS} className={styles.botaoContorno} target="_blank" rel="noopener noreferrer">
              Prefere falar agora? Chame no WhatsApp
            </a>
            <Link href="/" className={styles.voltar} style={{ color: '#1b6e48' }}>Voltar ao portal</Link>
          </div>
        ) : (
          <>
            <p className={styles.sobretitulo}>Serviços de IA e Automação</p>
            <h1 className={styles.titulo}>Conte o que você precisa</h1>
            <p className={styles.intro}>
              Preencha em um minuto. Respondemos pelo WhatsApp, sem compromisso.
            </p>

            <form className={styles.cartao} onSubmit={enviar} noValidate>
              <div className={styles.linha}>
                <div className={styles.campo}>
                  <label htmlFor="nome">Seu nome</label>
                  <input id="nome" name="nome" autoComplete="name" value={dados.nome} onChange={mudar('nome')} required maxLength={80} />
                </div>
                <div className={styles.campo}>
                  <label htmlFor="whatsapp">Seu WhatsApp (com DDD)</label>
                  <input id="whatsapp" name="whatsapp" type="tel" inputMode="tel" autoComplete="tel" placeholder="(16) 99999-9999" value={dados.whatsapp} onChange={mudar('whatsapp')} required maxLength={25} />
                </div>
              </div>

              <div className={styles.linha}>
                <div className={styles.campo}>
                  <label htmlFor="servico">Tipo de serviço</label>
                  <select id="servico" name="servico" value={servicoAtual} onChange={mudar('servico')} required>
                    <option value="" disabled>Escolha uma opção</option>
                    {SERVICOS.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div className={styles.campo}>
                  <label htmlFor="cidade">Cidade e estado <small>(opcional)</small></label>
                  <input id="cidade" name="cidade" autoComplete="address-level2" placeholder="Ex.: Franca/SP" value={dados.cidade} onChange={mudar('cidade')} maxLength={80} />
                </div>
              </div>

              <div className={styles.campo}>
                <label htmlFor="email">E-mail <small>(opcional)</small></label>
                <input id="email" name="email" type="email" autoComplete="email" value={dados.email} onChange={mudar('email')} maxLength={120} />
              </div>

              <div className={styles.campo}>
                <label htmlFor="mensagem">O que você precisa?</label>
                <textarea id="mensagem" name="mensagem" placeholder="Conte em poucas palavras o seu negócio e o que deseja automatizar." value={dados.mensagem} onChange={mudar('mensagem')} required maxLength={1200} />
              </div>

              {/* campo-isca contra robôs */}
              <div className={styles.isca} aria-hidden="true">
                <label htmlFor="site">Não preencha este campo</label>
                <input id="site" name="site" tabIndex={-1} autoComplete="off" value={dados.site} onChange={mudar('site')} />
              </div>

              <label className={styles.aceite}>
                <input type="checkbox" checked={dados.aceite} onChange={mudar('aceite')} />
                <span>Concordo em usar estes dados somente para a Igreja Eco entrar em contato comigo sobre este pedido.</span>
              </label>

              {erro && (
                <div className={styles.erro} role="alert">
                  {erro}{' '}
                  <a href={LINK_WHATS} target="_blank" rel="noopener noreferrer">Ou chame no WhatsApp.</a>
                </div>
              )}

              <button type="submit" className={styles.botao} disabled={enviando}>
                {enviando ? 'Enviando…' : 'Enviar pedido'}
              </button>
            </form>
          </>
        )}
      </main>
    </div>
  );
}
