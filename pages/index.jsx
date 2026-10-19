import React, { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import styles from '../styles/portal.module.css';

/* ------------------------------------------------------------------
   CONFIGURAÇÃO DO PORTAL
   Para adicionar um novo ramo de negócio, basta incluir um item em RAMOS.
   Contato: preencha whatsapp (só números, com DDD, ex: '5516912345678') e
   email. Enquanto estiverem vazios, a seção de contato fica escondida.
------------------------------------------------------------------- */
const CONFIG = {
  nome: 'Igreja Eco',
  slogan: 'Conhecimento, tecnologia e comércio em um só lugar',
  whatsapp: '5516991543663',
  email: 'ricardobelo1973@gmail.com',
};

const RAMOS = [
  {
    id: 'ovinocultura',
    icone: '🐑',
    titulo: 'Escola de Ovinocultura',
    texto:
      'Cursos para quem está começando e para o produtor rural: raças e cruzamentos, manejo, nutrição, sanidade e gestão.',
    status: 'Em breve',
    destaque: true,
    link: '#escola',
    chamada: 'Conhecer a escola',
  },
  {
    id: 'servicos-ia',
    icone: '🤖',
    titulo: 'Serviços de IA e Automação',
    texto:
      'Atendimento automático, conteúdo para redes sociais, sites e painéis de gestão para produtores e comércios de todo o Brasil.',
    status: 'Sob consulta',
    destaque: true,
    link: '#servicos',
    chamada: 'Ver serviços',
  },
  {
    id: 'loja',
    icone: '🛍️',
    titulo: 'Loja Franca Shoes',
    texto:
      'Calçados e acessórios de Franca. Escolha os produtos, monte o carrinho e pague com Pix.',
    status: 'Disponível',
    destaque: true,
    link: '/loja',
    chamada: 'Ir para a loja',
    interno: true,
  },
  {
    id: 'revenda',
    icone: '🚚',
    titulo: 'Calçados de Franca para quem mora longe',
    texto:
      'Você compra direto da fábrica e eu retiro, confiro e envio. A margem é calculada antes do pedido.',
    status: 'Em teste',
    destaque: true,
    link: '/projeto-fornecedores',
    chamada: 'Ver como funciona',
    interno: true,
  },
  {
    id: 'amazonia',
    icone: '🌿',
    titulo: 'Alimentos da Amazônia',
    texto: 'Produtos naturais da floresta, vindos de comunidades parceiras.',
    status: 'Em breve',
  },
  {
    id: 'ebooks',
    icone: '📚',
    titulo: 'E-books e Materiais Digitais',
    texto: 'Guias práticos de “como fazer”, com passo a passo e lista de conferência para usar no dia a dia.',
    status: 'Disponível',
    destaque: true,
    link: '/ebooks',
    chamada: 'Ver os e-books',
    interno: true,
  },
  {
    id: 'novos',
    icone: '✨',
    titulo: 'Novos ramos',
    texto: 'O portal cresce com novas áreas. Fique de olho.',
    status: 'Em breve',
  },
];

const TRILHAS = [
  'Fundamentos da criação',
  'Raças e cruzamentos',
  'Manejo e pastagem',
  'Nutrição e suplementação',
  'Sanidade e prevenção',
  'Reprodução e melhoramento',
  'Instalações e equipamentos',
  'Gestão e comercialização',
];

const SERVICOS = [
  { icone: '💬', titulo: 'Atendimento automático', texto: 'Respostas e agendamentos no WhatsApp e no email, com IA.' },
  { icone: '📣', titulo: 'Conteúdo automático', texto: 'Posts para Instagram, Facebook, TikTok e Telegram, com a sua aprovação.' },
  { icone: '🌐', titulo: 'Site ou portal', texto: 'Página institucional ou loja digital pronta para vender.' },
  { icone: '📊', titulo: 'Painel de gestão', texto: 'Cadastro e acompanhamento de clientes, pedidos ou rebanho.' },
  { icone: '⚙️', titulo: 'Instalação personalizada', texto: 'Montagem do sistema sob medida para o seu negócio.' },
];

const PASSOS = [
  { n: '1', titulo: 'Escolha', texto: 'Navegue pelos ramos e encontre o que você precisa.' },
  { n: '2', titulo: 'Peça ou compre', texto: 'Compre na loja com Pix ou peça um serviço.' },
  { n: '3', titulo: 'Receba', texto: 'Acompanhe o pedido e conte com o nosso atendimento.' },
];

const PASSOS_REVENDA = [
  'Você escolhe modelos de um catálogo com margem calculada',
  'Você compra direto da fábrica, no seu nome',
  'Eu retiro em Franca, confiro os pares e fotografo o lote',
  'Eu envio para a sua cidade, com frete a custo real',
];

function Icone({ children }) {
  return <span className={styles.icone} aria-hidden="true">{children}</span>;
}

export default function Home() {
  const [menuAberto, setMenuAberto] = useState(false);
  const fechar = () => setMenuAberto(false);
  const temContato = Boolean(CONFIG.whatsapp || CONFIG.email);
  const linkWhats = CONFIG.whatsapp
    ? `https://wa.me/${CONFIG.whatsapp}?text=${encodeURIComponent('Olá! Vim pelo site e gostaria de mais informações.')}`
    : null;

  return (
    <div className={styles.pagina}>
      <Head>
        <title>{CONFIG.nome} | Ovinocultura, IA e Loja</title>
        <meta
          name="description"
          content="Escola de Ovinocultura, serviços de IA e automação e loja virtual de calçados de Franca, reunidos em um só portal."
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      {/* CABEÇALHO */}
      <header className={styles.cabecalho}>
        <div className={styles.contido + ' ' + styles.barra}>
          <a href="#topo" className={styles.marca} onClick={fechar}>
            <span className={styles.marcaSelo}>IE</span>
            <span>{CONFIG.nome}</span>
          </a>
          <button
            className={styles.botaoMenu}
            aria-label="Abrir menu"
            aria-expanded={menuAberto}
            onClick={() => setMenuAberto(!menuAberto)}
          >
            <span /><span /><span />
          </button>
          <nav className={`${styles.menu} ${menuAberto ? styles.menuAberto : ''}`}>
            <a href="#ramos" onClick={fechar}>Ramos</a>
            <a href="#escola" onClick={fechar}>Escola</a>
            <a href="#servicos" onClick={fechar}>Serviços</a>
            <a href="#revenda" onClick={fechar}>Revenda</a>
            <Link href="/calculadora" onClick={fechar}>Calculadora</Link>
            <Link href="/catalogo" onClick={fechar}>Catálogo</Link>
            <Link href="/ebooks" onClick={fechar}>E-books</Link>
            {temContato && <a href="#contato" onClick={fechar}>Contato</a>}
            <Link href="/loja" className={styles.menuLoja} onClick={fechar}>Loja</Link>
            <Link href="/carrinho" className={styles.menuCarrinho} onClick={fechar}>🛒 Carrinho</Link>
          </nav>
        </div>
      </header>

      <main id="topo">
        {/* HERO */}
        <section className={styles.hero}>
          <div className={styles.contido + ' ' + styles.heroGrade}>
            <div>
              <p className={styles.sobretitulo}>Portal institucional</p>
              <h1 className={styles.heroTitulo}>{CONFIG.slogan}</h1>
              <p className={styles.heroTexto}>
                Aprenda ovinocultura, automatize o seu negócio com inteligência artificial e compre na loja
                virtual. Tudo reunido em um só endereço.
              </p>
              <div className={styles.heroAcoes}>
                <a href="#ramos" className={styles.botaoPrincipal}>Explorar o portal</a>
                <Link href="/loja" className={styles.botaoSecundario}>Ir para a loja →</Link>
              </div>
            </div>
            <div className={styles.heroPainel} aria-hidden="true">
              <div className={styles.heroCartao}><Icone>🐑</Icone><strong>Escola</strong><small>Cursos de ovinocultura</small></div>
              <div className={styles.heroCartao}><Icone>🤖</Icone><strong>IA e automação</strong><small>Serviços sob medida</small></div>
              <div className={styles.heroCartao}><Icone>🛍️</Icone><strong>Loja</strong><small>Compre com Pix</small></div>
            </div>
          </div>
        </section>

        {/* BANNER: CALCULADORA DE MARGEM */}
        <section
          id="calculadora"
          style={{ background: 'linear-gradient(135deg, var(--verde-escuro) 0%, var(--verde) 100%)', color: '#fff', padding: '44px 0' }}
        >
          <div className={styles.contido} style={{ display: 'flex', flexWrap: 'wrap', gap: 28, alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ flex: '1 1 380px', minWidth: 0 }}>
              <p style={{ display: 'inline-block', background: 'var(--dourado)', color: '#1f1700', fontWeight: 800, fontSize: '0.75rem', letterSpacing: 1.2, textTransform: 'uppercase', padding: '5px 12px', borderRadius: 999, margin: '0 0 12px' }}>
                Ferramenta gratuita
              </p>
              <h2 style={{ fontSize: 'clamp(1.6rem, 4vw, 2.3rem)', lineHeight: 1.15, margin: '0 0 10px', color: '#fff' }}>
                Calculadora de margem de calçados
              </h2>
              <p style={{ margin: '0 0 16px', maxWidth: 560, opacity: 0.92 }}>
                Vai revender calçados? Descubra em segundos quanto sobra de lucro por par, qual o preço mínimo para vender
                e até quanto a fábrica pode cobrar. Sem cadastro, direto no celular ou no computador.
              </p>
              <Link href="/calculadora" className={styles.botaoPrincipal}>Abrir a calculadora →</Link>
            </div>
            <ol style={{ flex: '1 1 300px', margin: 0, padding: 0, listStyle: 'none', display: 'grid', gap: 10, maxWidth: 440 }}>
              {[
                ['1', 'Digite o custo do par na fábrica'],
                ['2', 'Digite o preço pelo qual vai vender'],
                ['3', 'Veja se passa: lucro, margem e preço mínimo'],
                ['4', 'Copie o resumo e mande no WhatsApp'],
              ].map(([n, t]) => (
                <li key={n} style={{ display: 'flex', gap: 12, alignItems: 'center', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.18)', borderRadius: 14, padding: '10px 14px' }}>
                  <span style={{ flex: 'none', width: 28, height: 28, borderRadius: '50%', background: 'var(--dourado)', color: '#1f1700', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{n}</span>
                  <span>{t}</span>
                </li>
              ))}
            </ol>
          </div>
          <p className={styles.contido} style={{ margin: '14px auto 0', fontSize: '0.8rem', opacity: 0.75 }}>
            Estimativa para ajudar a decidir, não promessa de lucro.
          </p>
        </section>

        {/* RAMOS */}
        <section id="ramos" className={styles.secao}>
          <div className={styles.contido}>
            <p className={styles.sobretituloEscuro}>Nossos ramos</p>
            <h2 className={styles.titulo}>Tudo o que você encontra aqui</h2>
            <p className={styles.subtitulo}>Cada ramo funciona como uma área do portal. Novas áreas entram aos poucos.</p>
            <div className={styles.gradeRamos}>
              {RAMOS.map((r) => (
                <article key={r.id} className={`${styles.ramo} ${r.destaque ? styles.ramoDestaque : ''}`}>
                  <div className={styles.ramoTopo}>
                    <Icone>{r.icone}</Icone>
                    <span className={`${styles.etiqueta} ${r.status === 'Disponível' ? styles.etiquetaOk : ''}`}>{r.status}</span>
                  </div>
                  <h3>{r.titulo}</h3>
                  <p>{r.texto}</p>
                  {r.link && (r.interno
                    ? <Link href={r.link} className={styles.ramoLink}>{r.chamada} →</Link>
                    : <a href={r.link} className={styles.ramoLink}>{r.chamada} →</a>)}
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* ESCOLA */}
        <section id="escola" className={`${styles.secao} ${styles.secaoClara}`}>
          <div className={styles.contido + ' ' + styles.duasColunas}>
            <div>
              <p className={styles.sobretituloEscuro}>Escola de Ovinocultura</p>
              <h2 className={styles.titulo}>Aprenda a criar ovinos com método</h2>
              <p className={styles.subtitulo}>
                Um pacote com mais de 15 cursos em vídeo, feito para iniciantes e produtores rurais. O primeiro
                curso, <strong>Raças e Cruzamentos</strong>, ensina a escolher a raça certa, o primeiro passo
                de uma criação de sucesso.
              </p>
              <ul className={styles.lista}>
                <li>Aulas em vídeo no seu ritmo</li>
                <li>Área do aluno com seus cursos</li>
                <li>Material de apoio e quiz ao final de cada módulo</li>
              </ul>
              <p className={styles.aviso}>As primeiras turmas abrem em breve.</p>
            </div>
            <div className={styles.trilhas}>
              <h3>Trilhas de estudo</h3>
              <ol>
                {TRILHAS.map((t) => <li key={t}>{t}</li>)}
              </ol>
            </div>
          </div>
        </section>

        {/* SERVIÇOS */}
        <section id="servicos" className={styles.secao}>
          <div className={styles.contido}>
            <p className={styles.sobretituloEscuro}>Serviços de IA e Automação</p>
            <h2 className={styles.titulo}>Tecnologia que trabalha por você</h2>
            <p className={styles.subtitulo}>Soluções para produtores rurais e comércios, em qualquer lugar do Brasil.</p>
            <div className={styles.gradeServicos}>
              {SERVICOS.map((s) => (
                <div key={s.titulo} className={styles.servico}>
                  <Icone>{s.icone}</Icone>
                  <h3>{s.titulo}</h3>
                  <p>{s.texto}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* LOJA */}
        <section id="loja" className={styles.lojaFaixa}>
          <div className={styles.contido + ' ' + styles.lojaGrade}>
            <div>
              <p className={styles.sobretitulo}>Loja virtual</p>
              <h2 className={styles.tituloClaro}>Franca Shoes</h2>
              <p className={styles.lojaTexto}>
                Calçados e acessórios de Franca. Escolha, monte o carrinho e finalize com pagamento por Pix.
              </p>
              <a href="https://loja.igreja.eco.br" className={styles.botaoPrincipal}>Entrar na loja</a>
            </div>
            <ol className={styles.passos}>
              {PASSOS.map((p) => (
                <li key={p.n}>
                  <span className={styles.passoNumero}>{p.n}</span>
                  <div><strong>{p.titulo}</strong><p>{p.texto}</p></div>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* REVENDA DE CALÇADOS DE FRANCA */}
        <section id="revenda" className={`${styles.secao} ${styles.secaoClara}`}>
          <div className={styles.contido + ' ' + styles.duasColunas}>
            <div>
              <p className={styles.sobretituloEscuro}>Revenda de calçados</p>
              <h2 className={styles.titulo}>Calçados de Franca, mesmo que você more longe</h2>
              <p className={styles.subtitulo}>
                Para quem quer vender calçados e não mora perto das fábricas. Você compra direto da fábrica e eu
                cuido da retirada, da conferência e do envio.
              </p>
              <ul className={styles.lista}>
                <li>Margem calculada antes de você comprar</li>
                <li>Sem promessa de lucro: se o modelo não compensa, eu aviso</li>
                <li>Cobro só o serviço de retirada, conferência e envio</li>
              </ul>
              <Link href="/projeto-fornecedores" className={styles.ramoLink}>Ver como funciona →</Link>
              <p className={styles.aviso}>Em fase de teste com os primeiros revendedores.</p>
            </div>
            <div className={styles.trilhas}>
              <h3>Como funciona</h3>
              <ol>
                {PASSOS_REVENDA.map((t) => <li key={t}>{t}</li>)}
              </ol>
            </div>
          </div>
        </section>

        {/* CONTATO (só aparece quando WhatsApp ou email estiverem preenchidos) */}
        {temContato && (
          <section id="contato" className={styles.secao}>
            <div className={styles.contido + ' ' + styles.contatoCaixa}>
              <h2 className={styles.titulo}>Fale com a gente</h2>
              <p className={styles.subtitulo}>Tire dúvidas sobre cursos, serviços ou pedidos.</p>
              <div className={styles.heroAcoes}>
                {linkWhats && <a href={linkWhats} className={styles.botaoPrincipal} target="_blank" rel="noopener noreferrer">Chamar no WhatsApp</a>}
                {CONFIG.email && <a href={`mailto:${CONFIG.email}`} className={styles.botaoContorno}>{CONFIG.email}</a>}
              </div>
            </div>
          </section>
        )}
      </main>

      {/* RODAPÉ */}
      <footer className={styles.rodape}>
        <div className={styles.contido + ' ' + styles.rodapeGrade}>
          <div>
            <a href="#topo" className={styles.marca}>
              <span className={styles.marcaSelo}>IE</span>
              <span>{CONFIG.nome}</span>
            </a>
            <p>{CONFIG.slogan}.</p>
          </div>
          <div>
            <h4>Navegação</h4>
            <a href="#ramos">Ramos</a>
            <a href="#escola">Escola de Ovinocultura</a>
            <a href="#servicos">Serviços de IA</a>
            <a href="#revenda">Revenda de Franca</a>
            <Link href="/calculadora">Calculadora de margem</Link>
            <Link href="/catalogo">Catálogo de calçados</Link>
            <Link href="/ebooks">E-books práticos</Link>
          </div>
          <div>
            <h4>Loja</h4>
            <Link href="/loja">Produtos</Link>
            <Link href="/carrinho">Carrinho</Link>
          </div>
        </div>
        <div className={styles.rodapeFim}>
          <p>© 2026 {CONFIG.nome}. Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  );
}
