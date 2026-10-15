import Head from 'next/head';

const WHATSAPP = 'https://wa.me/5516991543663?text=' +
  encodeURIComponent('Olá! Quero saber mais sobre comprar calçados de Franca com retirada e envio.');

const passos = [
  ['1', 'Você escolhe', 'Um catálogo curado de modelos de fábricas de Franca, só com os que deixam margem de pelo menos 30% depois das taxas.'],
  ['2', 'Você compra direto', 'O pedido sai no seu nome e você paga a fábrica. Eu não vendo o calçado e não fico com o seu dinheiro.'],
  ['3', 'Eu retiro e confiro', 'Retiro em Franca, confiro os pares, fotografo o lote e aviso no mesmo dia.'],
  ['4', 'Eu envio', 'Despacho para a sua cidade. O frete é cobrado pelo custo real, mais uma taxa de despacho combinada antes.'],
];

const diretrizes = [
  'A margem é calculada antes de você comprar, com a taxa da plataforma, a reserva de devolução e a embalagem.',
  'Não prometo lucro. Se um modelo não deixar margem, digo que não vale a pena.',
  'Pedido mínimo e troca seguem a regra de cada fábrica. A troca, em geral, vale só para defeito de fabricação e em prazo curto.',
  'Fotos das fábricas só são usadas com autorização. Quando não há, eu fotografo os pares na retirada.',
  'O que eu cobro é serviço: instalação, mensalidade, retirada por par e despacho.',
];

const fases = [
  ['Semana 1', 'Contato com as fábricas de Franca: tabelas, pedido mínimo e regras de retirada.'],
  ['Semana 2', 'Catálogo com margem calculada e fotos próprias dos modelos aprovados.'],
  ['Semana 3', 'Conversa com os primeiros revendedores e análise de margem sem custo.'],
  ['Semana 4', 'Primeiros pedidos-piloto e ajuste da oferta.'],
];

const pacotes = [
  {
    nome: 'Parceiro',
    para: 'Para quem já tem site ou loja.',
    instalacao: 'R$ 697',
    mensal: 'R$ 147',
    par: 'R$ 6',
    minimo: 'R$ 90',
    itens: [
      'Catálogo curado, só com modelos que deixam margem',
      'Calculadora de margem por modelo',
      'Atendimento por WhatsApp com IA',
      'Montagem do pedido para você enviar à fábrica',
      'Retirada, conferência e fotos do lote em Franca',
    ],
  },
  {
    nome: 'Iniciante',
    para: 'Para quem está começando do zero.',
    instalacao: 'R$ 1.497',
    mensal: 'R$ 247',
    par: 'R$ 8',
    minimo: 'R$ 120',
    itens: [
      'Tudo do pacote Parceiro',
      'Loja pronta para você começar a vender',
      'Políticas de troca e entrega prontas',
      'Posts semanais criados com IA',
      'Treinamento e revisão do seu primeiro pedido',
    ],
  },
];

export default function ProjetoFornecedores() {
  return (
    <main className="pf">
      <Head>
        <title>Calçados de Franca para quem mora longe | Igreja Eco</title>
        <meta name="description" content="Retirada, conferência e envio de calçados de fábricas de Franca-SP para revendedores de outras cidades, com a margem calculada antes de comprar." />
      </Head>
      <style>{`
        .pf{--bg:#fbfaf7;--cd:#fff;--bd:#e5e1d8;--tx:#1d2420;--mu:#5f6b64;--ac:#1f6b4a;--ac2:#14513a;
          background:var(--bg);color:var(--tx);min-height:100vh;font-family:system-ui,-apple-system,Segoe UI,Roboto,Arial,sans-serif;line-height:1.55}
        @media (prefers-color-scheme:dark){.pf{--bg:#0f1512;--cd:#17201b;--bd:#26332b;--tx:#e8eee9;--mu:#a2b0a7;--ac:#57c08e;--ac2:#3da676}}
        .pf-in{max-width:960px;margin:0 auto;padding:0 16px}
        .pf-hero{padding:64px 0 40px}
        .pf h1{font-size:clamp(28px,5vw,44px);line-height:1.15;margin:0 0 14px;letter-spacing:-.01em}
        .pf h2{font-size:22px;margin:0 0 14px}
        .pf p{margin:0 0 12px}
        .pf-mu{color:var(--mu)}
        .pf-sec{padding:28px 0;border-top:1px solid var(--bd)}
        .pf-btn{display:inline-block;background:var(--ac);color:#fff;text-decoration:none;padding:13px 22px;border-radius:10px;font-weight:600}
        .pf-btn:hover{background:var(--ac2)}
        .pf-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(210px,1fr));gap:12px}
        .pf-card{background:var(--cd);border:1px solid var(--bd);border-radius:12px;padding:16px}
        .pf-card b{display:block;margin-bottom:4px}
        .pf-n{display:inline-flex;width:28px;height:28px;border-radius:50%;background:var(--ac);color:#fff;align-items:center;justify-content:center;font-size:14px;margin-bottom:8px}
        .pf ul{padding-left:20px;margin:0}.pf li{margin-bottom:8px}
        .pf-foot{padding:28px 0 48px;color:var(--mu);font-size:14px}
      `}</style>
      <div className="pf-in">
        <section className="pf-hero">
          <p className="pf-mu">Igreja Eco · Franca-SP</p>
          <h1>Calçados de fábricas de Franca, mesmo que você more longe</h1>
          <p className="pf-mu">
            Eu moro em Franca. Retiro, confiro e envio os pares que você compra direto da fábrica, com a margem calculada antes do pedido.
          </p>
          <a className="pf-btn" href={WHATSAPP}>Falar pelo WhatsApp</a>
          {' '}
          <a className="pf-btn" style={{ background: 'transparent', color: 'var(--ac)', border: '1px solid var(--ac)' }} href="/calculadora">Calcular minha margem</a>
        </section>

        <section className="pf-sec">
          <h2>Como funciona</h2>
          <div className="pf-grid">
            {passos.map(([n, t, d]) => (
              <div className="pf-card" key={n}>
                <span className="pf-n">{n}</span>
                <b>{t}</b>
                <span className="pf-mu">{d}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="pf-sec">
          <h2>Diretrizes do projeto</h2>
          <ul>{diretrizes.map((d) => <li key={d}>{d}</li>)}</ul>
        </section>

        <section className="pf-sec">
          <h2>Dois pacotes, valores de lançamento</h2>
          <div className="pf-grid">
            {pacotes.map((p) => (
              <div className="pf-card" key={p.nome}>
                <b style={{ fontSize: 18 }}>{p.nome}</b>
                <span className="pf-mu">{p.para}</span>
                <p style={{ margin: '12px 0 4px' }}><b style={{ display: 'inline' }}>{p.instalacao}</b> de instalação (uma vez)</p>
                <p style={{ margin: '0 0 4px' }}><b style={{ display: 'inline' }}>{p.mensal}</b> por mês</p>
                <p style={{ margin: '0 0 12px' }}><b style={{ display: 'inline' }}>{p.par}</b> por par retirado (mínimo de {p.minimo} por retirada)</p>
                <ul>{p.itens.map((i) => <li key={i}>{i}</li>)}</ul>
              </div>
            ))}
          </div>
          <p className="pf-mu" style={{ marginTop: 12 }}>
            Os pares são comprados por você, direto da fábrica, e pagos à fábrica. Os valores acima são só do meu serviço e podem ser ajustados para os primeiros clientes, sem fidelidade. O frete é cobrado pelo custo real. Não prometo lucro: a margem é calculada antes de cada compra.
          </p>
        </section>

        <section className="pf-sec">
          <h2>Programação dos próximos 30 dias</h2>
          <div className="pf-grid">
            {fases.map(([s, d]) => (
              <div className="pf-card" key={s}>
                <b>{s}</b>
                <span className="pf-mu">{d}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="pf-sec">
          <h2>Quer ser um dos primeiros?</h2>
          <p className="pf-mu">Mande uma mensagem e peça a análise de margem de 3 modelos, sem custo.</p>
          <a className="pf-btn" href={WHATSAPP}>Pedir minha análise</a>
        </section>

        <p className="pf-foot">Serviço de retirada, conferência e envio. A compra é feita por você diretamente com a fábrica.</p>
      </div>
    </main>
  );
}
