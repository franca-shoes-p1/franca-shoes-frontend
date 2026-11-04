import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import styles from '../styles/vitrine.module.css';
import { brl, VAREJO } from './varejo';

/* ------------------------------------------------------------------
   VITRINE DA HOME (consumidor final)
   - Mostra os modelos publicados na loja (/api/varejo/catalogo). Cada um leva a /calcados/[id].
   - Enquanto um modelo ainda não está cadastrado em /admin/calcados, ele aparece como "VITRINE_FIXA"
     (foto + botão de WhatsApp, sem preço inventado). Para ligar o botão de compra, cadastre o modelo
     no painel e retire-o desta lista.
   - Retirada na rodoviária das capitais: lista em CIDADES_RODOVIARIA (ajuste quando mudar a rota).
------------------------------------------------------------------- */
const VITRINE_FIXA = [
  {
    chave: 'sapato-social-marrom-935',
    titulo: 'Sapato Social Masculino Marrom em Couro — 935',
    categoria: 'Masculino',
    foto: '/produtos/marrom-hero.jpg',
    fotos: ['/produtos/marrom-hero.jpg', '/produtos/marrom-lado.jpg', '/produtos/marrom-par.jpg'],
    detalhe: 'Couro legítimo, ajuste em elástico e bico quadrado. Números 37 ao 44.',
  },
  {
    chave: 'sapato-social-preto-934',
    titulo: 'Sapato Social Masculino Preto em Couro — 934',
    categoria: 'Masculino',
    foto: '/produtos/preto-hero.jpg',
    fotos: ['/produtos/preto-hero.jpg', '/produtos/preto-look.jpg', '/produtos/preto-par.jpg'],
    detalhe: 'Couro legítimo preto com ajuste em elástico. Números 37 ao 44.',
  },
];

const CIDADES_RODOVIARIA = ['Belo Horizonte', 'Rio de Janeiro', 'Goiânia', 'Curitiba', 'Campo Grande', 'Vitória', 'Salvador', 'Florianópolis', 'São Paulo'];

const zap = (texto) => `https://wa.me/${VAREJO.whatsapp}?text=${encodeURIComponent(texto)}`;

function utms() {
  if (typeof window === 'undefined') return {};
  const q = new URLSearchParams(window.location.search);
  const o = {};
  ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content'].forEach((k) => {
    let v = q.get(k);
    try {
      if (v) sessionStorage.setItem(k, v);
      else v = sessionStorage.getItem(k);
    } catch (e) {}
    if (v) o[k] = v;
  });
  return o;
}

function Cartao({ p }) {
  const [i, setI] = useState(0);
  const fotos = p.fotos && p.fotos.length ? p.fotos : p.foto ? [p.foto] : [];
  const comLoja = !!p.id;
  return (
    <article className={styles.card}>
      <div className={styles.foto}>
        {fotos.length ? <img src={fotos[i]} alt={p.titulo} loading="lazy" /> : <div className={styles.semFoto}>Sem foto</div>}
        {p.categoria && <span className={styles.selo}>{p.categoria}</span>}
      </div>
      {fotos.length > 1 && (
        <div className={styles.mini}>
          {fotos.map((f, k) => (
            <button key={f} type="button" className={k === i ? styles.miniOn : ''} onClick={() => setI(k)} aria-label={`Foto ${k + 1}`}>
              <img src={f} alt="" loading="lazy" />
            </button>
          ))}
        </div>
      )}
      <h3>{p.titulo}</h3>
      {p.detalhe || p.descricao ? <p className={styles.detalhe}>{(p.detalhe || p.descricao).slice(0, 110)}</p> : null}
      <div className={styles.preco}>{comLoja && p.preco > 0 ? brl(p.preco) : 'Preço no WhatsApp'}</div>
      {comLoja ? (
        <Link href={`/calcados/${p.id}`} className={styles.btnComprar}>
          Escolher o número e comprar
        </Link>
      ) : (
        <a className={styles.btnComprar} href={zap(`Olá! Tenho interesse no ${p.titulo}. Qual o preço e o prazo?`)} target="_blank" rel="noopener noreferrer">
          Pedir preço no WhatsApp
        </a>
      )}
    </article>
  );
}

export default function VitrineHome() {
  const [lojaProdutos, setLojaProdutos] = useState([]);
  const [categoria, setCategoria] = useState('');
  const [enviado, setEnviado] = useState(false);
  const [erro, setErro] = useState('');
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    fetch('/api/varejo/catalogo')
      .then((r) => r.json())
      .then((j) => setLojaProdutos(j.produtos || []))
      .catch(() => setLojaProdutos([]));
  }, []);

  const produtos = useMemo(() => {
    const daLoja = lojaProdutos.map((p) => ({ ...p, fotos: p.foto ? [p.foto] : [] }));
    return daLoja.length ? daLoja : VITRINE_FIXA;
  }, [lojaProdutos]);

  const categorias = useMemo(() => [...new Set(produtos.map((p) => p.categoria).filter(Boolean))].sort(), [produtos]);
  const lista = categoria ? produtos.filter((p) => p.categoria === categoria) : produtos;

  async function enviar(e) {
    e.preventDefault();
    setErro('');
    setEnviando(true);
    const f = new FormData(e.target);
    try {
      const r = await fetch('/api/leads/captar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nome: f.get('nome'),
          whatsapp: f.get('whatsapp'),
          interesse: f.get('interesse'),
          cidade: f.get('cidade'),
          entrega: f.get('cidade') ? 'rodoviaria' : '',
          site: f.get('site'),
          pagina: typeof window !== 'undefined' ? window.location.pathname : '',
          ...utms(),
        }),
      });
      const j = await r.json();
      if (!r.ok) throw new Error(j.erro || 'Erro');
      setEnviado(true);
    } catch (err) {
      setErro(err.message || 'Não foi possível enviar. Chame no WhatsApp.');
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className={styles.pagina}>
      <div className={styles.faixaTopo}>Calçados direto das fábricas de Franca-SP · Pague por PIX ou cartão</div>

      <header className={styles.topo}>
        <div className={styles.contido}>
          <strong className={styles.marca}>igreja.eco.br</strong>
          <nav>
            <a href="#vitrine">Vitrine</a>
            <a href="#como">Como comprar</a>
            <Link href="/calcados">Loja completa</Link>
            <a href="#novidades">Receber ofertas</a>
          </nav>
        </div>
      </header>

      <section className={styles.hero}>
        <div className={styles.contido}>
          <span className={styles.tag}>PREÇO DE FÁBRICA</span>
          <h1>Calçados e acessórios direto das fábricas de Franca</h1>
          <p>
            Escolha o modelo, pague por PIX ou cartão e <strong>retire na rodoviária da sua cidade, sem frete</strong>, ou receba pelos Correios em
            todo o Brasil.
          </p>
          <div className={styles.botoes}>
            <a className={styles.btnPrimario} href="#vitrine">
              Ver a vitrine
            </a>
            <a className={styles.btnSecundario} href={zap('Olá! Vim pelo site e quero ver os calçados.')} target="_blank" rel="noopener noreferrer">
              Falar no WhatsApp
            </a>
          </div>
          <ul className={styles.provas}>
            <li>✔ Couro e materiais de fábrica</li>
            <li>✔ Retirada na rodoviária: frete grátis</li>
          </ul>
        </div>
      </section>

      <section id="vitrine" className={styles.secao}>
        <div className={styles.contido}>
          <h2>Vitrine</h2>
          {categorias.length > 1 && (
            <div className={styles.chips}>
              <button type="button" className={!categoria ? styles.chipOn : ''} onClick={() => setCategoria('')}>
                Todos
              </button>
              {categorias.map((c) => (
                <button key={c} type="button" className={categoria === c ? styles.chipOn : ''} onClick={() => setCategoria(c)}>
                  {c}
                </button>
              ))}
            </div>
          )}
          <div className={styles.grade}>
            {lista.map((p) => (
              <Cartao key={p.id || p.chave} p={p} />
            ))}
          </div>
          <p className={styles.nota}>
            Pedido separado na fábrica depois do pagamento ({VAREJO.prazoPreparoDias}), {VAREJO.prazoEntregaInfo}. Na retirada em rodoviária, o prazo
            depende do fechamento do lote da cidade.
          </p>
        </div>
      </section>

      <section id="como" className={`${styles.secao} ${styles.clara}`}>
        <div className={styles.contido}>
          <h2>Como comprar</h2>
          <div className={styles.passos}>
            <div>
              <b>1</b>
              <h3>Escolha</h3>
              <p>Veja o modelo, escolha o número e a forma de receber.</p>
            </div>
            <div>
              <b>2</b>
              <h3>Pague</h3>
              <p>PIX ou cartão pelo Mercado Pago, direto no site.</p>
            </div>
            <div>
              <b>3</b>
              <h3>Separamos</h3>
              <p>Com o pagamento aprovado, o par é comprado e separado na fábrica.</p>
            </div>
            <div>
              <b>4</b>
              <h3>Receba</h3>
              <p>Retire na rodoviária da sua cidade (frete grátis) ou receba pelos Correios.</p>
            </div>
          </div>
          <div className={styles.rodoviarias}>
            <strong>Retirada na rodoviária:</strong> {CIDADES_RODOVIARIA.join(' · ')}.
          </div>
        </div>
      </section>

      <section id="novidades" className={styles.secao}>
        <div className={styles.contido}>
          {enviado ? (
            <div className={styles.ok}>
              <h2>Pronto! ✔</h2>
              <p>Recebemos seu contato. Vamos falar com você no WhatsApp.</p>
            </div>
          ) : (
            <form className={styles.lead} onSubmit={enviar}>
              <h2>Receba ofertas e avisos dos lotes da sua cidade</h2>
              <p>Deixe seu WhatsApp. Avisamos de promoção, modelo novo e do dia da retirada na rodoviária.</p>
              <input name="nome" placeholder="Seu nome" required autoComplete="name" />
              <input name="whatsapp" placeholder="WhatsApp com DDD" required inputMode="tel" autoComplete="tel" />
              <select name="cidade" defaultValue="">
                <option value="">Prefiro receber pelos Correios</option>
                {CIDADES_RODOVIARIA.map((c) => (
                  <option key={c} value={c}>
                    Retirar na rodoviária de {c}
                  </option>
                ))}
              </select>
              <input name="interesse" placeholder="O que você procura? (ex.: sapato social 42)" />
              <input name="site" tabIndex={-1} autoComplete="off" className={styles.armadilha} aria-hidden="true" />
              {erro && <p className={styles.erro}>{erro}</p>}
              <button type="submit" className={styles.btnPrimario} disabled={enviando}>
                {enviando ? 'Enviando…' : 'QUERO RECEBER'}
              </button>
              <small>Usamos seu contato só para falar da sua compra e das ofertas da loja. Responda SAIR para parar.</small>
            </form>
          )}
        </div>
      </section>

      <footer className={styles.rodape}>
        <div className={styles.contido}>
          <strong>igreja.eco.br</strong> · Franca-SP · WhatsApp{' '}
          <a href={zap('Olá!')} target="_blank" rel="noopener noreferrer">
            (16) 99154-3663
          </a>{' '}
          · <a href="mailto:ricardobelo1973@gmail.com">ricardobelo1973@gmail.com</a>
          <div>
            <Link href="/calcados/politicas">Trocas e entrega</Link> · <a href="https://www.instagram.com/ricardobelo1973">Instagram</a> ·{' '}
            <a href="https://t.me/igrejaeco_ricardo">Falar no Telegram</a> · <a href="https://www.youtube.com/@RicardoBello-o6v">YouTube</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
