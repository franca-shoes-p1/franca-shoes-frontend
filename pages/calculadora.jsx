import { useEffect, useMemo, useState } from 'react';
import Head from 'next/head';

const PADRAO = { taxa: '5', reserva: '8', imposto: '0', emb: '3', frete: '0', servico: '0', alvo: '30' };
const CHAVE = 'calc_margem_cenarios_v1';

const num = (v) => {
  const n = parseFloat(String(v ?? '').replace(',', '.'));
  return Number.isFinite(n) ? n : 0;
};
const brl = (n) =>
  n == null || !Number.isFinite(n)
    ? '-'
    : n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
const pct = (n) => (n == null || !Number.isFinite(n) ? '-' : n.toFixed(1).replace('.', ',') + '%');

function calcular(c, v, qtd) {
  const custo = num(c.custo);
  const venda = num(c.venda);
  const descontos = (num(c.taxa) + num(c.reserva) + num(c.imposto)) / 100;
  const alvo = num(c.alvo) / 100;
  const custoTotal = custo + num(c.emb) + num(c.frete) + num(c.servico);
  const liquido = venda * (1 - descontos);
  const lucro = liquido - custoTotal;
  const margem = venda > 0 ? (lucro / venda) * 100 : null;
  const den = 1 - descontos - alvo;
  const precoMin = den > 0 ? custoTotal / den : null;
  const denEq = 1 - descontos;
  const precoEquilibrio = denEq > 0 ? custoTotal / denEq : null;
  const custoMax = venda > 0 ? venda * den - (num(c.emb) + num(c.frete) + num(c.servico)) : null;
  const pares = Math.max(1, Math.round(num(qtd)) || 1);
  return { custoTotal, liquido, lucro, margem, precoMin, precoEquilibrio, custoMax, pares, venda, custo, alvo: alvo * 100 };
}

export default function Calculadora() {
  const [c, setC] = useState({ custo: '', venda: '', ...PADRAO });
  const [qtd, setQtd] = useState('12');
  const [cenarios, setCenarios] = useState([]);
  const [nome, setNome] = useState('');
  const [aviso, setAviso] = useState('');

  useEffect(() => {
    try {
      const salvo = JSON.parse(localStorage.getItem(CHAVE) || '[]');
      if (Array.isArray(salvo)) setCenarios(salvo);
    } catch (e) {}
  }, []);

  function gravar(lista) {
    setCenarios(lista);
    try {
      localStorage.setItem(CHAVE, JSON.stringify(lista));
    } catch (e) {}
  }

  const campo = (k) => (e) => setC((x) => ({ ...x, [k]: e.target.value }));
  const r = useMemo(() => calcular(c, null, qtd), [c, qtd]);
  const temDados = num(c.custo) > 0 && num(c.venda) > 0;
  const passa = temDados && r.margem != null && r.margem >= r.alvo;

  function salvarCenario() {
    const n = nome.trim();
    if (!n) return setAviso('Dê um nome ao cenário.');
    const regras = { taxa: c.taxa, reserva: c.reserva, imposto: c.imposto, emb: c.emb, frete: c.frete, servico: c.servico, alvo: c.alvo };
    gravar([...cenarios.filter((x) => x.nome !== n), { nome: n, regras }]);
    setNome('');
    setAviso('Cenário salvo neste aparelho.');
  }
  function usarCenario(x) {
    setC((a) => ({ ...a, ...x.regras }));
    setAviso('Cenário "' + x.nome + '" aplicado.');
  }
  function apagarCenario(n) {
    gravar(cenarios.filter((x) => x.nome !== n));
  }
  function limpar() {
    setC((a) => ({ ...a, custo: '', venda: '' }));
    setAviso('');
  }
  async function copiar() {
    const t = [
      'Análise de margem',
      'Custo na fábrica: ' + brl(r.custo),
      'Preço de venda: ' + brl(r.venda),
      'Lucro por par: ' + brl(r.lucro) + ' (' + pct(r.margem) + ')',
      'Preço mínimo para ' + pct(r.alvo) + ' de margem: ' + brl(r.precoMin),
      'Lote de ' + r.pares + ' pares: lucro de ' + brl(r.lucro * r.pares),
      'Resultado: ' + (passa ? 'passa na margem-alvo' : 'não passa na margem-alvo'),
      'Estimativa, não promessa de lucro.',
    ].join('\n');
    try {
      await navigator.clipboard.writeText(t);
      setAviso('Resumo copiado. Cole no WhatsApp.');
    } catch (e) {
      setAviso('Não consegui copiar. Selecione o texto na tela.');
    }
  }

  return (
    <main className="cm">
      <Head>
        <title>Calculadora de margem de calçados</title>
        <meta name="description" content="Calcule o lucro por par, a margem e o preço mínimo de venda de um calçado comprado direto da fábrica." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#1f6b4a" />
      </Head>
      <style>{`
        .cm{--bg:#fbfaf7;--cd:#fff;--bd:#e5e1d8;--tx:#1d2420;--mu:#5f6b64;--ac:#1f6b4a;--ok:#1f6b4a;--no:#b3261e;
          background:var(--bg);color:var(--tx);min-height:100vh;font-family:system-ui,-apple-system,Segoe UI,Roboto,Arial,sans-serif;line-height:1.5;padding:16px}
        @media (prefers-color-scheme:dark){.cm{--bg:#0f1512;--cd:#17201b;--bd:#26332b;--tx:#e8eee9;--mu:#a2b0a7;--ac:#57c08e;--ok:#57c08e;--no:#ff8a80}}
        .cm-in{max-width:640px;margin:0 auto}
        .cm h1{font-size:24px;margin:8px 0 4px}
        .cm h2{font-size:16px;margin:0 0 10px}
        .cm-mu{color:var(--mu);font-size:14px}
        .cm-card{background:var(--cd);border:1px solid var(--bd);border-radius:12px;padding:14px;margin-top:12px}
        .cm-g{display:grid;grid-template-columns:1fr 1fr;gap:10px}
        .cm label{display:block;font-size:13px;color:var(--mu)}
        .cm input{width:100%;box-sizing:border-box;font-size:18px;padding:10px;border:1px solid var(--bd);border-radius:8px;background:var(--bg);color:var(--tx);margin-top:4px}
        .cm-big input{font-size:22px;font-weight:600}
        .cm-res{font-size:15px}
        .cm-res div{display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px solid var(--bd)}
        .cm-res div:last-child{border-bottom:0}
        .cm-tag{display:inline-block;padding:6px 14px;border-radius:999px;font-weight:700;color:#fff}
        .cm-btn{background:var(--ac);color:#fff;border:0;border-radius:8px;padding:11px 16px;font-size:15px;font-weight:600;cursor:pointer}
        .cm-btn2{background:transparent;color:var(--ac);border:1px solid var(--ac)}
        .cm-row{display:flex;gap:8px;flex-wrap:wrap;margin-top:10px}
        .cm-chip{display:flex;align-items:center;gap:6px;border:1px solid var(--bd);border-radius:999px;padding:6px 10px;font-size:14px}
        .cm-chip button{background:none;border:0;color:var(--tx);cursor:pointer;font-size:14px}
        .cm details summary{cursor:pointer;font-weight:600}
        .cm-foot{font-size:12px;color:var(--mu);margin:16px 0 32px}
      `}</style>
      <div className="cm-in">
        <h1>Calculadora de margem</h1>
        <p className="cm-mu">Digite o custo na fábrica e o preço de venda. O resultado aparece na hora.</p>

        <div className="cm-card cm-big">
          <div className="cm-g">
            <label>Custo na fábrica (R$ por par)
              <input inputMode="decimal" placeholder="45,00" value={c.custo} onChange={campo('custo')} />
            </label>
            <label>Preço de venda (R$)
              <input inputMode="decimal" placeholder="100,00" value={c.venda} onChange={campo('venda')} />
            </label>
          </div>
        </div>

        <div className="cm-card">
          <h2>Resultado</h2>
          {temDados ? (
            <>
              <p style={{ margin: '0 0 10px' }}>
                <span className="cm-tag" style={{ background: passa ? 'var(--ok)' : 'var(--no)' }}>
                  {passa ? 'Passa' : 'Não passa'}
                </span>{' '}
                <span className="cm-mu">margem-alvo de {pct(r.alvo)}</span>
              </p>
              <div className="cm-res">
                <div><span>Lucro por par</span><b>{brl(r.lucro)}</b></div>
                <div><span>Margem sobre a venda</span><b>{pct(r.margem)}</b></div>
                <div><span>Preço mínimo para a meta</span><b>{brl(r.precoMin)}</b></div>
                <div><span>Custo máximo na fábrica para a meta</span><b>{brl(r.custoMax)}</b></div>
                <div><span>Preço de equilíbrio (lucro zero)</span><b>{brl(r.precoEquilibrio)}</b></div>
                <div><span>Custo total por par</span><b>{brl(r.custoTotal)}</b></div>
                <div>
                  <span>
                    Lote de{' '}
                    <input
                      inputMode="numeric"
                      value={qtd}
                      onChange={(e) => setQtd(e.target.value)}
                      style={{ width: 64, fontSize: 15, padding: 4, display: 'inline-block', margin: 0 }}
                    />{' '}
                    pares
                  </span>
                  <b>{brl(r.lucro * r.pares)}</b>
                </div>
              </div>
              <div className="cm-row">
                <button className="cm-btn" onClick={copiar}>Copiar resumo</button>
                <button className="cm-btn cm-btn2" onClick={limpar}>Limpar</button>
              </div>
            </>
          ) : (
            <p className="cm-mu">Preencha custo e preço de venda para ver o lucro.</p>
          )}
        </div>

        <div className="cm-card">
          <details>
            <summary>Regras da margem (taxas e custos)</summary>
            <div className="cm-g" style={{ marginTop: 10 }}>
              <label>Taxa da plataforma (%)<input inputMode="decimal" value={c.taxa} onChange={campo('taxa')} /></label>
              <label>Reserva de devolução (%)<input inputMode="decimal" value={c.reserva} onChange={campo('reserva')} /></label>
              <label>Imposto (%)<input inputMode="decimal" value={c.imposto} onChange={campo('imposto')} /></label>
              <label>Margem-alvo (%)<input inputMode="decimal" value={c.alvo} onChange={campo('alvo')} /></label>
              <label>Embalagem (R$ por par)<input inputMode="decimal" value={c.emb} onChange={campo('emb')} /></label>
              <label>Frete (R$ por par)<input inputMode="decimal" value={c.frete} onChange={campo('frete')} /></label>
              <label>Retirada por par (R$)<input inputMode="decimal" value={c.servico} onChange={campo('servico')} /></label>
            </div>
            <p className="cm-mu" style={{ marginTop: 8 }}>
              Retirada por par é o que o revendedor paga pelo serviço de retirada e envio (por exemplo R$ 6 ou R$ 8).
            </p>
          </details>
        </div>

        <div className="cm-card">
          <h2>Meus cenários</h2>
          <p className="cm-mu" style={{ marginTop: 0 }}>
            Salve um conjunto de regras com um nome (por exemplo, o de cada plataforma de venda) e reaplique com um toque. Fica guardado só neste aparelho.
          </p>
          <div className="cm-row" style={{ marginTop: 0 }}>
            <input
              style={{ flex: 1, minWidth: 160, fontSize: 16, margin: 0 }}
              placeholder="Nome do cenário"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
            />
            <button className="cm-btn" onClick={salvarCenario}>Salvar</button>
          </div>
          <div className="cm-row">
            {cenarios.length === 0 && <span className="cm-mu">Nenhum cenário salvo ainda.</span>}
            {cenarios.map((x) => (
              <span className="cm-chip" key={x.nome}>
                <button onClick={() => usarCenario(x)}>{x.nome}</button>
                <button onClick={() => apagarCenario(x.nome)} aria-label={'Apagar ' + x.nome}>×</button>
              </span>
            ))}
          </div>
          {aviso && <p className="cm-mu" style={{ marginBottom: 0 }}>{aviso}</p>}
        </div>

        <p className="cm-foot">
          Estimativa para ajudar a decidir, não promessa de lucro. A conta usa: lucro = venda × (1 − taxa − reserva − imposto) − custo − embalagem − frete − retirada. Para ter no celular, abra esta página no navegador e use Adicionar à tela inicial.
        </p>
      </div>
    </main>
  );
}
