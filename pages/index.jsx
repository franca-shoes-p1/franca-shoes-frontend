import React, { useEffect, useRef, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import styles from '../styles/home.module.css';
import AtelieBanner from '../lib/AtelieBanner';
import OficinaHomeBanner from '../lib/OficinaHomeBanner';
import AssistentesBanner from '../lib/AssistentesBanner';
import CampanhaBanner from '../lib/CampanhaBanner';
import AfiliadosBanner from '../lib/AfiliadosBanner';
import FestaBanner from '../lib/FestaBanner';

/* ------------------------------------------------------------------
   HOME: Loja de Calçados Pronta
   A home anterior (portal com todos os ramos) continua intacta em /portal.
   Para trocar o contato, edite só este bloco.
------------------------------------------------------------------- */
const CONFIG = {
  nome: 'Igreja Eco',
  whatsapp: '5516991543663',
  email: 'ricardobelo1973@gmail.com',
};

// VÍDEO DA APRESENTAÇÃO: cole aqui o endereço do vídeo quando estiver pronto.
// Aceita link do YouTube (https://www.youtube.com/watch?v=... ou youtu.be/...) ou arquivo .mp4.
// Enquanto estiver vazio, aparece o avatar animado de demonstração.
const VIDEO_URL = '';

const FALAS = [
  'Olá! Eu sou o assistente da Loja de Calçados Pronta.',
  'Nós criamos a sua loja online de calçados e acessórios, do zero, e entregamos pronta.',
  'Ela já vem com vitrine, carrinho e pagamento por PIX e cartão.',
  'Você cadastra os modelos pelo celular: tira a foto, põe o preço e publica.',
  'Você recebe o guia de fornecedores das fábricas de Franca, com lote mínimo e prazo.',
  'E aprende a vender com o nosso treinamento, com suporte depois da entrega.',
  'Escolha o seu nível: Iniciante, Intermediário ou Avançado. Chame no WhatsApp!',
];

function embedVideo(url) {
  if (!url) return null;
  const yt = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([\w-]{6,})/);
  if (yt) return { tipo: 'iframe', src: `https://www.youtube.com/embed/${yt[1]}?rel=0` };
  if (/\.(mp4|webm)(\?|$)/i.test(url)) return { tipo: 'video', src: url };
  return null;
}

const LINK_WHATS = `https://wa.me/${CONFIG.whatsapp}?text=${encodeURIComponent(
  'Olá! Vi o site e quero saber como funciona a Loja de Calçados Pronta.'
)}`;

// Os três projetos ativos, mostrados no menu do topo.
const PROJETOS = [
  { e: '🧩', t: 'Ateliê Sob Medida', d: 'Sites, agentes de WhatsApp e automações montados para você', href: '/atelie' },
  { e: '🛠️', t: 'Oficina Digital', d: 'Tarefas curtas pelo celular, com Pontos Oficina', href: '/oficina' },
  { e: '👟', t: 'Loja de Calçados Pronta', d: 'Sua loja online de calçados, entregue funcionando', href: '#calcados' },
];

const PARA_QUEM = [
  { e: '🌱', t: 'Quem quer começar', p: 'Nunca vendeu calçado e quer um negócio online pronto, sem aprender programação.' },
  { e: '📲', t: 'Quem já vende', p: 'Vende pelo WhatsApp, em feira ou como revendedora e quer uma loja própria com PIX e cartão.' },
  { e: '🏪', t: 'Lojistas e fábricas', p: 'Tem loja ou fábrica e quer vender também pela internet, com catálogo e regras sob medida.' },
];

const RECEBE = [
  { e: '🛍️', t: 'Loja online completa', p: 'Vitrine, carrinho, cálculo de frete e política de trocas, pronta para o celular.' },
  { e: '💳', t: 'PIX e cartão', p: 'Pagamento pelo Mercado Pago, na conta do próprio cliente. O dinheiro vai direto para ele.' },
  { e: '📸', t: 'Painel com foto do celular', p: 'Cadastre modelos em um minuto: tire a foto, informe preço e tamanhos, e publique.' },
  { e: '🏭', t: 'Guia de fornecedores', p: 'Lista de fábricas de Franca com condições confirmadas: lote mínimo, exigência de CNPJ e prazo.' },
  { e: '🎓', t: 'Treinamento', p: 'Você aprende a operar a loja, atender o cliente e divulgar, sem pressa.' },
  { e: '🤝', t: 'Suporte depois da entrega', p: 'Acompanhamento para tirar dúvidas nos primeiros dias com a loja funcionando.' },
];

const PASSOS = [
  { t: 'Conversa', p: 'Você conta o que quer vender e eu indico o nível certo.' },
  { t: 'Montagem', p: 'A loja é criada nas suas contas, com o seu nome e o seu WhatsApp.' },
  { t: 'Entrega', p: 'Você recebe a loja funcionando, com os primeiros modelos cadastrados.' },
  { t: 'Treinamento', p: 'Mostro como cadastrar modelos, receber pedidos e divulgar.' },
];

const NIVEIS = [
  {
    nome: 'Iniciante',
    para: 'Para quem nunca vendeu calçado',
    itens: ['Loja com PIX e cartão', 'Painel de cadastro pelo celular', '10 a 20 modelos cadastrados', 'Guia de fornecedores', 'Treinamento básico', 'Suporte por 7 dias'],
  },
  {
    nome: 'Intermediário',
    para: 'Para quem já vende no WhatsApp ou na feira',
    destaque: true,
    itens: ['Tudo do Iniciante', '20 a 50 modelos cadastrados', 'Aviso de pedido no WhatsApp', 'Pacote inicial de posts de divulgação', 'Domínio próprio (opcional)', 'Suporte por 15 dias'],
  },
  {
    nome: 'Avançado',
    para: 'Para lojistas e fábricas',
    itens: ['Tudo do Intermediário', 'Catálogo em lote e tamanhos combinados', 'Regras de preço e frete sob medida', 'Fornecedores do próprio cliente', 'Domínio próprio incluído', 'Suporte por 30 dias'],
  },
];

const FAQ = [
  ['Preciso saber programar?', 'Não. Eu monto tudo e ensino você a usar o painel, que funciona pelo celular.'],
  ['Preciso ter CNPJ?', 'Para a loja funcionar, não. Mas muitas fábricas de Franca vendem só para CNPJ e exigem lote mínimo. O guia de fornecedores mostra as condições de cada uma desde o início, para você decidir com clareza.'],
  ['A loja tem estoque?', 'Não. O pedido é comprado na fábrica depois que o pagamento é confirmado, e o prazo de preparo aparece para o cliente.'],
  ['De quem é a loja?', 'Sua. A loja fica nas suas contas (GitHub, Vercel, Supabase e Mercado Pago). Terminada a montagem, o acesso de quem montou é removido.'],
  ['Quanto custa?', 'Depende do nível e do que você precisa. Chame no WhatsApp e eu passo o valor certo para o seu caso, sem compromisso.'],
  ['Vou ganhar dinheiro?', 'Eu entrego a loja pronta e funcionando. Não prometo vendas nem lucro: o resultado depende dos modelos, dos preços e da sua divulgação.'],
];

export default function Home() {
  const raiz = useRef(null);
  const [menu, setMenu] = useState(false);
  const fechar = () => setMenu(false);
  const [fala, setFala] = useState(0);
  const video = embedVideo(VIDEO_URL);

  // animação de entrada ao rolar a página
  useEffect(() => {
    const el = raiz.current;
    if (!el || typeof IntersectionObserver === 'undefined') return;
    el.classList.add(styles.anim);
    const io = new IntersectionObserver(
      (itens) => itens.forEach((i) => { if (i.isIntersecting) { i.target.classList.add(styles.visivel); io.unobserve(i.target); } }),
      { threshold: 0.12 }
    );
    el.querySelectorAll('[data-reveal]').forEach((n) => io.observe(n));
    return () => io.disconnect();
  }, []);

  // legendas do avatar de demonstração
  useEffect(() => {
    if (video) return;
    const t = setInterval(() => setFala((f) => (f + 1) % FALAS.length), 3600);
    return () => clearInterval(t);
  }, [video]);

  return (
    <div className={styles.pagina} ref={raiz}>
      <Head>
        <title>Loja de Calçados Pronta | {CONFIG.nome}</title>
        <meta
          name="description"
          content="Criamos o seu negócio de calçados do zero e entregamos com tudo pronto e funcional: loja online com PIX e cartão, painel pelo celular, guia de fornecedores e treinamento."
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta property="og:title" content="Loja de Calçados Pronta" />
        <meta
          property="og:description"
          content="Criamos o seu negócio do zero e entregamos com tudo pronto e funcional para começar a comprar e vender agora mesmo!"
        />
      </Head>

      <header className={styles.cabecalho}>
        <div className={styles.contido + ' ' + styles.barra}>
          <a href="#topo" className={styles.marca} onClick={fechar}>
            <span className={styles.selo}>IE</span>
            <span>{CONFIG.nome}</span>
          </a>
          <button className={styles.botaoMenu} aria-label="Abrir menu" aria-expanded={menu} onClick={() => setMenu(!menu)}>
            <span /><span /><span />
          </button>
          <nav className={`${styles.topoMenu} ${menu ? styles.topoMenuAberto : ''}`} aria-label="Projetos">
            {PROJETOS.map((p) => (
              <Link key={p.t} href={p.href} className={styles.projeto} onClick={fechar}>
                <span className={styles.projIcone} aria-hidden="true">{p.e}</span>
                <span className={styles.projTexto}><b>{p.t}</b><small>{p.d}</small></span>
              </Link>
            ))}
            <a href="#campanha" className={styles.projCampanha} onClick={fechar}>🎁 Campanha</a>
            <Link href="/catalogo" className={styles.projCampanha} onClick={fechar}>📚 Catálogo</Link>
          </nav>
        </div>
      </header>

      <main id="topo">
        <FestaBanner />
        <CampanhaBanner />
        <AtelieBanner />
        <OficinaHomeBanner />
        <AfiliadosBanner />
        <section id="calcados" className={styles.hero}>
          <span className={`${styles.mancha} ${styles.m1}`} aria-hidden="true" />
          <span className={`${styles.mancha} ${styles.m2}`} aria-hidden="true" />
          <span className={`${styles.mancha} ${styles.m3}`} aria-hidden="true" />
          <div className={styles.contido + ' ' + styles.heroGrade}>
            <div>
              <span className={styles.selinho}>Negócio de calçados pronto para vender</span>
              <h1 className={styles.titulo}>
                Criamos o seu negócio do zero e entregamos <em>com tudo pronto e funcional</em>
              </h1>
              <p className={styles.lead}>
                Uma loja online de calçados e acessórios de Franca, com PIX e cartão, painel para cadastrar modelos pelo celular,
                guia de fornecedores e treinamento. Para começar a comprar e vender agora mesmo.
              </p>
              <div className={styles.acoes}>
                <a href="/monte-sua-loja" className={`${styles.botao} ${styles.principal}`}>
                  Quero a minha loja
                </a>
                <Link href="/calcados" className={`${styles.botao} ${styles.contorno}`}>Ver a loja de exemplo →</Link>
              </div>
              <p className={styles.nota}>Entregamos a loja funcionando. Não prometemos vendas nem lucro.</p>
            </div>

            <div className={styles.celularBox} aria-hidden="true">
              <div className={styles.celular}>
                <div className={styles.tela}>
                  <div className={styles.telaTopo}><span>👟 Sua Loja</span><span>🛒</span></div>
                  <div className={styles.telaGrade}>
                    {[['👠', '', 'Sandália salto', 'R$ 89,90'], ['👟', 'b', 'Tênis casual', 'R$ 119,90'], ['🥿', 'c', 'Sapatilha', 'R$ 69,90'], ['👞', 'd', 'Sapato social', 'R$ 139,90']].map(([e, cl, n, p]) => (
                      <div key={n} className={styles.telaCard}>
                        <div className={`${styles.telaFoto} ${cl ? styles[cl] : ''}`}>{e}</div>
                        <div className={styles.telaInfo}><strong>{n}</strong><span className={styles.telaPreco}>{p}</span></div>
                      </div>
                    ))}
                  </div>
                  <div className={styles.telaPix}>Pagar com PIX ou cartão</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <nav className={styles.subMenu} aria-label="Loja de Calçados Pronta">
          <div className={styles.contido + ' ' + styles.subGrade}>
            <span className={styles.subTitulo}>Loja de Calçados Pronta</span>
            <a href="#recebe">O que você recebe</a>
            <a href="#como">Como funciona</a>
            <a href="#niveis">Níveis</a>
            <a href="#duvidas">Dúvidas</a>
            <Link href="/calcados">Loja de exemplo</Link>
            <a href={LINK_WHATS} className={styles.subCta} target="_blank" rel="noopener noreferrer">Falar no WhatsApp</a>
          </div>
        </nav>

        <div className={styles.faixa}>
          <div className={styles.contido + ' ' + styles.faixaGrade}>
            <div className={styles.faixaItem}><span>💳</span>PIX e cartão</div>
            <div className={styles.faixaItem}><span>📲</span>Painel pelo celular</div>
            <div className={styles.faixaItem}><span>🏭</span>Fábricas de Franca</div>
            <div className={styles.faixaItem}><span>🎓</span>Treinamento incluso</div>
          </div>
        </div>

        <section id="video" className={`${styles.secao} ${styles.escura}`}>
          <span className={`${styles.mancha} ${styles.m2}`} aria-hidden="true" />
          <div className={styles.contido + ' ' + styles.videoGrade}>
            <div data-reveal="1">
              <p className={styles.sobre}>Apresentação</p>
              <h2 className={styles.h2}>Veja como a sua loja de calçados fica pronta</h2>
              <p className={styles.sub}>Nosso assistente explica o que é a Loja de Calçados Pronta: uma loja online de calçados e acessórios de Franca, montada por nós, com PIX e cartão, painel pelo celular, guia de fornecedores e treinamento.</p>
              <div className={styles.assistentes}>
                <span className={styles.chip}>🤖 Assistente de IA</span>
                <span className={styles.chip}>👟 Loja de calçados pronta</span>
                <span className={styles.chip}>💬 Orçamento no WhatsApp</span>
              </div>
            </div>
            <div data-reveal="2">
              <div className={styles.moldura}>
                {video && video.tipo === 'iframe' && (
                  <iframe src={video.src} title="Apresentação da Loja de Calçados Pronta" allow="accelerometer; encrypted-media; picture-in-picture" allowFullScreen />
                )}
                {video && video.tipo === 'video' && <video src={video.src} controls playsInline preload="metadata" />}
                {!video && (
                  <>
                    <span className={styles.selinhoVideo}>Avatar de demonstração</span>
                    <div className={styles.palco} aria-live="polite" aria-label="Apresentação da Loja de Calçados Pronta">
                      <div className={styles.avatar} aria-hidden="true">
                        <div className={styles.corpo} />
                        <div className={styles.cabeca}>
                          <span className={`${styles.olho} ${styles.olhoE}`} />
                          <span className={`${styles.olho} ${styles.olhoD}`} />
                          <span className={styles.boca} />
                        </div>
                      </div>
                      <div className={styles.legendaBox}>
                        <div key={fala} className={styles.balao}>{FALAS[fala]}</div>
                        <div className={styles.ondas} aria-hidden="true">
                          {Array.from({ length: 14 }).map((_, i) => <i key={i} />)}
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </section>

        <section className={styles.secao}>
          <div className={styles.contido}>
            <p className={styles.sobre}>Para quem é</p>
            <h2 className={styles.h2}>Um negócio pronto, do jeito que você está</h2>
            <p className={styles.sub}>Cada nível foi pensado para um ponto de partida diferente.</p>
            <div className={styles.grade3}>
              {PARA_QUEM.map((c) => (
                <div key={c.t} className={styles.cartao} data-reveal="1">
                  <div className={styles.emoji}>{c.e}</div>
                  <h3>{c.t}</h3>
                  <p>{c.p}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="recebe" className={`${styles.secao} ${styles.clara}`}>
          <div className={styles.contido}>
            <p className={styles.sobre}>O que você recebe</p>
            <h2 className={styles.h2}>Tudo o que precisa para abrir as portas</h2>
            <p className={styles.sub}>Você não precisa juntar ferramentas nem contratar vários profissionais.</p>
            <div className={styles.grade3}>
              {RECEBE.map((c) => (
                <div key={c.t} className={styles.cartao} data-reveal="1">
                  <div className={styles.emoji}>{c.e}</div>
                  <h3>{c.t}</h3>
                  <p>{c.p}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="como" className={`${styles.secao} ${styles.escura}`}>
          <div className={styles.contido}>
            <p className={styles.sobre}>Como funciona</p>
            <h2 className={styles.h2}>Da conversa à loja no ar em 4 passos</h2>
            <p className={styles.sub}>Você acompanha cada etapa e a loja fica nas suas contas.</p>
            <ol className={styles.passos}>
              {PASSOS.map((p, i) => (
                <li key={p.t} data-reveal="1">
                  <div className={styles.passoN}>{i + 1}</div>
                  <strong>{p.t}</strong>
                  <p>{p.p}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section id="niveis" className={styles.secao}>
          <div className={styles.contido}>
            <p className={styles.sobre}>Níveis</p>
            <h2 className={styles.h2}>Escolha o ponto de partida</h2>
            <p className={styles.sub}>Os valores são passados no WhatsApp, de acordo com o que você precisa.</p>
            <div className={styles.grade3}>
              {NIVEIS.map((n) => (
                <div key={n.nome} data-reveal="1" className={`${styles.cartao} ${styles.nivel} ${n.destaque ? styles.nivelDestaque : ''}`}>
                  {n.destaque && <span className={styles.etiqueta}>Mais procurado</span>}
                  <h3>{n.nome}</h3>
                  <p className={styles.nivelPara}>{n.para}</p>
                  <ul>{n.itens.map((i) => <li key={i}>{i}</li>)}</ul>
                  <div className={styles.preco}>Valor sob consulta</div>
                  <a href={LINK_WHATS} className={`${styles.botao} ${styles.contornoEscuro}`} target="_blank" rel="noopener noreferrer">
                    Pedir orçamento
                  </a>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className={`${styles.secao} ${styles.clara}`}>
          <div className={styles.contido + ' ' + styles.grade2}>
            <div className={styles.honesto} data-reveal="1">
              <h3>Transparência desde o começo</h3>
              <ul>
                <li>Entregamos a loja funcionando. Não prometemos vendas nem ganhos.</li>
                <li>A loja não tem estoque: o pedido é comprado na fábrica após o pagamento.</li>
                <li>Muitas fábricas de Franca exigem CNPJ e lote mínimo. Você vê isso antes de decidir.</li>
                <li>Pagamentos caem direto na sua conta do Mercado Pago.</li>
              </ul>
            </div>
            <div className={styles.cartao}>
              <div className={styles.emoji}>👀</div>
              <h3>Veja uma loja funcionando</h3>
              <p style={{ marginBottom: 16 }}>Navegue pela loja de exemplo no seu celular: vitrine, carrinho e política de trocas.</p>
              <Link href="/calcados" className={`${styles.botao} ${styles.principal}`}>Abrir a loja de exemplo →</Link>
            </div>
          </div>
        </section>

        <section id="duvidas" className={styles.secao}>
          <div className={styles.contido}>
            <p className={styles.sobre}>Dúvidas frequentes</p>
            <h2 className={styles.h2}>Perguntas que todo mundo faz</h2>
            <div className={styles.faq} style={{ marginTop: 28, maxWidth: 820 }}>
              {FAQ.map(([q, a]) => (
                <details key={q}>
                  <summary>{q}</summary>
                  <p>{a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        <section className={styles.final}>
          <div className={styles.contido}>
            <h2 className={styles.h2}>Pronto para ter a sua loja de calçados?</h2>
            <p>Chame no WhatsApp, conte o que você quer vender e eu indico o nível certo, sem compromisso.</p>
            <div className={styles.acoes}>
              <a href={LINK_WHATS} className={`${styles.botao} ${styles.principal}`} target="_blank" rel="noopener noreferrer">
                Chamar no WhatsApp
              </a>
              <a href={`mailto:${CONFIG.email}`} className={`${styles.botao} ${styles.contorno}`}>{CONFIG.email}</a>
            </div>
          </div>
        </section>

        <AssistentesBanner />
      </main>

      <footer className={styles.rodape}>
        <div className={styles.contido + ' ' + styles.rodapeCentro}>
          <a href="#topo" className={styles.marca} onClick={fechar}>
            <span className={styles.selo}>IE</span>
            <span>{CONFIG.nome}</span>
          </a>
          <button className={styles.botaoMenu} aria-label="Abrir menu" aria-expanded={menu} onClick={() => setMenu(!menu)}>
            <span /><span /><span />
          </button>
          <nav className={`${styles.menu} ${menu ? styles.menuAberto : ''}`}>
            <a href="#recebe" onClick={fechar}>O que você recebe</a>
            <a href="#como" onClick={fechar}>Como funciona</a>
            <a href="#niveis" onClick={fechar}>Níveis</a>
            <a href="#duvidas" onClick={fechar}>Dúvidas</a>
            <Link href="/calcados" onClick={fechar}>Loja de exemplo</Link>
            <a href={LINK_WHATS} className={styles.menuCta} target="_blank" rel="noopener noreferrer">Falar no WhatsApp</a>
          </nav>
          <p>Loja de Calçados Pronta: criamos o seu negócio do zero e entregamos com tudo pronto e funcional.</p>
          <Link href="/catalogo" className={styles.botaoPortal}>
            <span>Catálogo completo de produtos e serviços</span>
            <small>Tudo o que oferecemos e o que vem por aí</small>
          </Link>
          <Link href="/portal" className={styles.botaoPortal}>
            <span>Entrar no portal completo</span>
            <small>Escola, serviços de IA, loja, calculadora e mais</small>
          </Link>
        </div>
        <div className={styles.contido + ' ' + styles.rodapeFim}>
          <p>© 2026 {CONFIG.nome}. Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  );
}
