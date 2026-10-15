import { useEffect, useMemo, useState } from 'react';
import Head from 'next/head';

const WHATS = '5516991543663';
// Regras usadas na estimativa (as mesmas padrão da calculadora)
const R = { taxa: 5, reserva: 8, imposto: 0, emb: 3, servico: 6 };

const brl = (n) => (Number.isFinite(n) ? n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) : '-');
const fotoOk = (u) => typeof u === 'string' && u.startsWith('https://');
const dataBr = (d) => (d ? d.split('-').reverse().join('/') : '');

function lucroPar(m) {
  const liquido = m.precoVenda * (1 - (R.taxa + R.reserva + R.imposto) / 100);
  return liquido - m.precoFabrica - R.emb - R.servico;
}

export default function Catalogo() {
  const [modelos, setModelos] = useState(null);
  const [qtd, setQtd] = useState({});

  useEffect(() => {
    fetch('/api/catalogo')
      .then((r) => r.json())
      .then((j) => setModelos(Array.isArray(j.modelos) ? j.modelos : []))
      .catch(() => setModelos([]));
  }, []);

  const q = (id) => Math.max(0, Math.floor(Number(qtd[id]) || 0));
  const mudar = (id, v) => setQtd((x) => ({ ...x, [id]: v }));

  const resumo = useMemo(() => {
    const itens = (modelos || []).filter((m) => q(m.id) > 0);
    const pares = itens.reduce((s, m) => s + q(m.id), 0);
    const fabrica = itens.reduce((s, m) => s + q(m.id) * m.precoFabrica, 0);
    const venda = itens.reduce((s, m) => s + q(m.id) * m.precoVenda, 0);
    const lucro = itens.reduce((s, m) => s + q(m.id) * lucroPar(m), 0);
    return { itens, pares, fabrica, venda, lucro };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [modelos, qtd]);

  function linkWhats() {
    const linhas = resumo.itens.map((m) => `- ${q(m.id)} x ${m.titulo} (fábrica ${brl(m.precoFabrica)})`);
    const texto = [
      'Olá! Quero uma cotação destes modelos do catálogo:',
      ...linhas,
      `Total: ${resumo.pares} pares, ${brl(resumo.fabrica)} na fábrica.`,
      'Pode confirmar preço, pedido mínimo e prazo?',
    ].join('\n');
    return `https://wa.me/${WHATS}?text=${encodeURIComponent(texto)}`;
  }

  return (
    <main className="ct">
      <Head>
        <title>Catálogo de calçados de Franca | Igreja Eco</title>
        <meta name="description" content="Modelos de calçados de fábricas de Franca-SP com margem calculada. Monte a sua cotação e envie pelo WhatsApp." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <style>{`
        .ct{--bg:#fbfaf7;--cd:#fff;--bd:#e5e1d8;--tx:#1d2420;--mu:#5f6b64;--ac:#1f6b4a;
          background:var(--bg);color:var(--tx);min-height:100vh;font-family:system-ui,-apple-system,Segoe UI,Roboto,Arial,sans-serif;line-height:1.5;padding:16px 16px 120px}
        @media (prefers-color-scheme:dark){.ct{--bg:#0f1512;--cd:#17201b;--bd:#26332b;--tx:#e8eee9;--mu:#a2b0a7;--ac:#57c08e}}
        .ct-in{max-width:1000px;margin:0 auto}
        .ct h1{font-size:clamp(24px,5vw,36px);margin:12px 0 6px}
        .ct-mu{color:var(--mu);font-size:14px}
        .ct-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(250px,1fr));gap:14px;margin-top:18px}
        .ct-card{background:var(--cd);border:1px solid var(--bd);border-radius:14px;overflow:hidden;display:flex;flex-direction:column}
        .ct-foto{aspect-ratio:4/3;background:var(--bd);display:flex;align-items:center;justify-content:center;font-size:42px}
        .ct-foto img{width:100%;height:100%;object-fit:cover}
        .ct-corpo{padding:14px;display:flex;flex-direction:column;gap:6px;flex:1}
        .ct-corpo h3{margin:0;font-size:17px}
        .ct-linha{display:flex;justify-content:space-between;font-size:14px}
        .ct-btn{display:inline-block;background:var(--ac);color:#fff;border:0;border-radius:10px;padding:12px 20px;font-weight:700;font-size:15px;text-decoration:none;cursor:pointer}
        .ct-btn2{background:transparent;color:var(--ac);border:1px solid var(--ac)}
        .ct input{width:90px;font-size:16px;padding:8px;border:1px solid var(--bd);border-radius:8px;background:var(--bg);color:var(--tx)}
        .ct-barra{position:fixed;left:0;right:0;bottom:0;background:var(--cd);border-top:1px solid var(--bd);padding:12px 16px;box-shadow:0 -4px 16px rgba(0,0,0,.08)}
        .ct-barra-in{max-width:1000px;margin:0 auto;display:flex;gap:12px;align-items:center;justify-content:space-between;flex-wrap:wrap}
        .ct-vazio{background:var(--cd);border:1px solid var(--bd);border-radius:14px;padding:22px;margin-top:18px}
      `}</style>
      <div className="ct-in">
        <p className="ct-mu"><a href="/projeto-fornecedores" style={{ color: 'var(--ac)' }}>← Como funciona</a></p>
        <h1>Catálogo de calçados de Franca</h1>
        <p className="ct-mu">
          Modelos que passaram na análise de margem. Escolha as quantidades, veja a estimativa do seu lucro e envie a cotação pelo WhatsApp.
          O nome da fábrica é informado quando você fecha o pedido-piloto.
        </p>

        {modelos === null && <p className="ct-mu">Carregando...</p>}

        {modelos && modelos.length === 0 && (
          <div className="ct-vazio">
            <b>Catálogo em montagem.</b>
            <p className="ct-mu" style={{ margin: '6px 0 14px' }}>
              Os primeiros modelos entram assim que forem confirmados com as fábricas. Enquanto isso, teste a sua margem na calculadora ou fale comigo.
            </p>
            <a className="ct-btn" href="/calculadora">Abrir a calculadora</a>{' '}
            <a className="ct-btn ct-btn2" href={`https://wa.me/${WHATS}`}>Falar pelo WhatsApp</a>
          </div>
        )}

        {modelos && modelos.length > 0 && (
          <div className="ct-grid">
            {modelos.map((m) => {
              const l = lucroPar(m);
              const mg = m.precoVenda > 0 ? (l / m.precoVenda) * 100 : 0;
              return (
                <div className="ct-card" key={m.id}>
                  <div className="ct-foto">{fotoOk(m.foto) ? <img src={m.foto} alt={m.titulo} loading="lazy" /> : '👟'}</div>
                  <div className="ct-corpo">
                    <h3>{m.titulo}</h3>
                    {m.descricao && <span className="ct-mu">{m.descricao}</span>}
                    {(m.material || m.tamanhos) && (
                      <span className="ct-mu">{[m.material, m.tamanhos && `Tamanhos ${m.tamanhos}`].filter(Boolean).join(' · ')}</span>
                    )}
                    <div className="ct-linha"><span>Preço na fábrica</span><b>{brl(m.precoFabrica)}</b></div>
                    <div className="ct-linha"><span>Venda sugerida</span><b>{brl(m.precoVenda)}</b></div>
                    <div className="ct-linha"><span>Lucro estimado por par</span><b>{brl(l)} ({mg.toFixed(0)}%)</b></div>
                    {m.confirmadoEm && <span className="ct-mu">Preço confirmado em {dataBr(m.confirmadoEm)}</span>}
                    <label className="ct-mu" style={{ marginTop: 'auto' }}>
                      Pares{' '}
                      <input inputMode="numeric" placeholder="0" value={qtd[m.id] ?? ''} onChange={(e) => mudar(m.id, e.target.value)} />
                    </label>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {modelos && modelos.length > 0 && (
          <p className="ct-mu" style={{ marginTop: 18 }}>
            Estimativa com taxa de {R.taxa}%, reserva de devolução de {R.reserva}%, embalagem de {brl(R.emb)} e retirada de {brl(R.servico)} por par.
            Preços podem mudar; confirmo antes do pedido. Não é promessa de lucro.{' '}
            <a href="/calculadora" style={{ color: 'var(--ac)' }}>Ajustar as regras na calculadora</a>.
          </p>
        )}
      </div>

      {resumo.pares > 0 && (
        <div className="ct-barra">
          <div className="ct-barra-in">
            <div>
              <b>{resumo.pares} pares</b> · fábrica {brl(resumo.fabrica)} · lucro estimado {brl(resumo.lucro)}
              <div className="ct-mu">Cada fábrica tem um pedido mínimo; eu confirmo na cotação.</div>
            </div>
            <a className="ct-btn" href={linkWhats()} target="_blank" rel="noopener noreferrer">Enviar cotação pelo WhatsApp</a>
          </div>
        </div>
      )}
    </main>
  );
}
