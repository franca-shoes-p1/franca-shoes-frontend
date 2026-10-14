import Head from 'next/head';
import { useCallback, useEffect, useMemo, useState } from 'react';

const STATUS = [
  ['a_contatar', 'A contatar'],
  ['contatado', 'Contatado'],
  ['respondeu', 'Respondeu'],
  ['aprovado', 'Aprovado'],
  ['reprovado', 'Reprovado'],
  ['sem_resposta', 'Sem resposta'],
];
const SIMNAO = [
  ['nao_sei', 'Não sei'],
  ['sim', 'Sim'],
  ['nao', 'Não'],
];
const PARAMS_PADRAO = { taxa: 5, reserva: 8, imposto: 0, emb: 3, frete: 0, alvo: 30 };

const msgInicial = (nome) =>
  `Olá, tudo bem? Meu nome é Ricardo, sou de Franca. Atendo revendedores de outras cidades que querem comprar calçados de fábricas de Franca, e eu faço a retirada e o envio. ` +
  `Gostaria de saber (${nome}):\n\n` +
  `1) Qual a tabela de preços de atacado e o pedido mínimo?\n` +
  `2) Vocês aceitam retirada por terceiro, com o pedido e a nota no nome do cliente?\n` +
  `3) Autorizam o uso das fotos dos produtos para revenda?\n` +
  `4) Como funciona a troca e qual o prazo de produção?\n\n` +
  `Posso enviar o que precisarem para cadastro. Obrigado!`;

const lembrete = (nome) =>
  `Olá! Passando para lembrar da minha mensagem sobre a tabela de atacado da ${nome}. Se preferir, me diga um horário melhor para falarmos. Obrigado!`;

async function api(senha, corpo) {
  const r = await fetch('/api/nucleo', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ senha, ...corpo }),
  });
  const j = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(j.erro || `Erro ${r.status}`);
  return j.dados;
}

const num = (v) => {
  const n = parseFloat(String(v ?? '').replace(',', '.'));
  return Number.isNaN(n) ? null : n;
};
const brl = (v) =>
  v == null ? '—' : v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
const hoje = () => new Date().toISOString().slice(0, 10);
const maisDias = (d) => new Date(Date.now() + d * 86400000).toISOString().slice(0, 10);

function analise(p, par) {
  const custo = num(p.custo);
  if (custo == null) return null;
  const f = 1 - par.taxa / 100 - par.reserva / 100 - par.imposto / 100;
  const calc = (v) => {
    if (v == null || v <= 0) return null;
    const lucro = v * f - custo - par.emb - par.frete;
    return { lucro, margem: lucro / v };
  };
  const a = calc(num(p.preco_mercado_min));
  const b = calc(num(p.preco_mercado_max));
  let veredito = 'Sem referência';
  if (a) veredito = a.margem * 100 >= par.alvo ? 'Passa' : b && b.margem * 100 >= par.alvo ? 'Verificar' : 'Reprova';
  else if (b) veredito = b.margem * 100 >= par.alvo ? 'Verificar' : 'Reprova';
  const base = f - par.alvo / 100;
  const precoMin = base > 0 ? (custo + par.emb + par.frete) / base : null;
  return { a, b, veredito, precoMin };
}

export default function Nucleo() {
  const [senha, setSenha] = useState('');
  const [logado, setLogado] = useState(false);
  const [erro, setErro] = useState('');
  const [aba, setAba] = useState('geral');
  const [forn, setForn] = useState([]);
  const [prod, setProd] = useState([]);
  const [tarefas, setTarefas] = useState([]);
  const [par, setPar] = useState(PARAMS_PADRAO);
  const [aviso, setAviso] = useState('');

  const carregar = useCallback(async (s) => {
    const [f, p, t] = await Promise.all([
      api(s, { acao: 'listar', tabela: 'fornecedores', ordem: 'nome.asc' }),
      api(s, { acao: 'listar', tabela: 'produtos', ordem: 'criado_em.desc' }),
      api(s, { acao: 'listar', tabela: 'tarefas', ordem: 'semana.asc' }),
    ]);
    setForn(f);
    setProd(p);
    setTarefas(t);
  }, []);

  useEffect(() => {
    try {
      const s = sessionStorage.getItem('nucleo_senha');
      if (s) entrar(s);
    } catch {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function entrar(s) {
    setErro('');
    try {
      await api(s, { acao: 'entrar' });
      await carregar(s);
      setSenha(s);
      setLogado(true);
      try {
        sessionStorage.setItem('nucleo_senha', s);
      } catch {}
    } catch (e) {
      setErro(e.message);
      setLogado(false);
    }
  }

  const chamar = async (corpo) => {
    try {
      const r = await api(senha, corpo);
      setAviso('');
      return r;
    } catch (e) {
      setAviso(e.message);
      throw e;
    }
  };

  if (!logado) {
    return (
      <main className="nu-wrap">
        <Estilos />
        <Head><title>Núcleo</title><meta name="robots" content="noindex" /></Head>
        <div className="nu-login">
          <h1>Núcleo</h1>
          <p>Painel privado de fornecedores de Franca.</p>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              entrar(e.currentTarget.elements.senha.value);
            }}
          >
            <input name="senha" type="password" placeholder="Senha do painel" autoComplete="current-password" />
            <button type="submit">Entrar</button>
          </form>
          {erro && <p className="nu-erro">{erro}</p>}
        </div>
      </main>
    );
  }

  const abas = [
    ['geral', 'Visão geral'],
    ['fornecedores', 'Fornecedores'],
    ['catalogo', 'Catálogo e margem'],
    ['plano', 'Plano de 30 dias'],
  ];

  return (
    <main className="nu-wrap">
      <Estilos />
      <header className="nu-topo">
        <div>
          <h1>Núcleo · Revenda de Franca</h1>
          <p>Fornecedores, catálogo e plano em um só lugar.</p>
        </div>
        <button
          className="nu-sec"
          onClick={() => {
            try {
              sessionStorage.removeItem('nucleo_senha');
            } catch {}
            setLogado(false);
            setSenha('');
          }}
        >
          Sair
        </button>
      </header>
      <nav className="nu-abas">
        {abas.map(([k, nome]) => (
          <button key={k} className={aba === k ? 'on' : ''} onClick={() => setAba(k)}>
            {nome}
          </button>
        ))}
      </nav>
      {aviso && <p className="nu-erro">{aviso}</p>}

      {aba === 'geral' && <Geral forn={forn} tarefas={tarefas} prod={prod} par={par} irPara={setAba} />}
      {aba === 'fornecedores' && (
        <Fornecedores forn={forn} chamar={chamar} recarregar={() => carregar(senha)} />
      )}
      {aba === 'catalogo' && (
        <Catalogo forn={forn} prod={prod} par={par} setPar={setPar} chamar={chamar} recarregar={() => carregar(senha)} />
      )}
      {aba === 'plano' && <Plano tarefas={tarefas} chamar={chamar} recarregar={() => carregar(senha)} />}
    </main>
  );
}

function Geral({ forn, tarefas, prod, par, irPara }) {
  const contagem = STATUS.map(([k, nome]) => [nome, forn.filter((f) => f.status === k).length]);
  const vencidos = forn.filter((f) => f.proximo_followup && f.proximo_followup <= hoje() && !['aprovado', 'reprovado', 'sem_resposta'].includes(f.status));
  const passam = prod.filter((p) => analise(p, par)?.veredito === 'Passa');
  const pend = tarefas.filter((t) => !t.feita);
  const semana = pend.length ? Math.min(...pend.map((t) => t.semana)) : null;
  return (
    <section>
      <div className="nu-grade">
        {contagem.map(([nome, n]) => (
          <div className="nu-card nu-num" key={nome}>
            <strong>{n}</strong>
            <span>{nome}</span>
          </div>
        ))}
        <div className="nu-card nu-num">
          <strong>{passam.length}</strong>
          <span>Modelos que passam na margem</span>
        </div>
      </div>
      <div className="nu-card">
        <h2>Follow-ups para hoje</h2>
        {vencidos.length === 0 ? (
          <p className="nu-mudo">Nenhum follow-up vencido.</p>
        ) : (
          <ul>
            {vencidos.map((f) => (
              <li key={f.id}>
                {f.nome} · {f.status.replace('_', ' ')} · venceu em {f.proximo_followup}
              </li>
            ))}
          </ul>
        )}
        <button className="nu-sec" onClick={() => irPara('fornecedores')}>
          Abrir fornecedores
        </button>
      </div>
      <div className="nu-card">
        <h2>Próximas tarefas{semana ? ` (semana ${semana})` : ''}</h2>
        {pend.length === 0 ? (
          <p className="nu-mudo">Tudo feito.</p>
        ) : (
          <ul>
            {pend
              .filter((t) => t.semana === semana)
              .map((t) => (
                <li key={t.id}>{t.titulo}</li>
              ))}
          </ul>
        )}
        <button className="nu-sec" onClick={() => irPara('plano')}>
          Abrir plano
        </button>
      </div>
    </section>
  );
}

function Fornecedores({ forn, chamar, recarregar }) {
  const [aberto, setAberto] = useState(null);
  const [novo, setNovo] = useState('');
  const [filtro, setFiltro] = useState('todos');
  const lista = forn.filter((f) => filtro === 'todos' || f.status === filtro);

  async function adicionar() {
    if (!novo.trim()) return;
    await chamar({ acao: 'criar', tabela: 'fornecedores', dados: { nome: novo.trim() } });
    setNovo('');
    recarregar();
  }

  return (
    <section>
      <div className="nu-linha">
        <select value={filtro} onChange={(e) => setFiltro(e.target.value)}>
          <option value="todos">Todos os status</option>
          {STATUS.map(([k, n]) => (
            <option key={k} value={k}>
              {n}
            </option>
          ))}
        </select>
        <input value={novo} onChange={(e) => setNovo(e.target.value)} placeholder="Novo fornecedor" />
        <button onClick={adicionar}>Adicionar</button>
      </div>
      {lista.map((f) => (
        <div className="nu-card" key={f.id}>
          <div className="nu-cab" onClick={() => setAberto(aberto === f.id ? null : f.id)}>
            <strong>{f.nome}</strong>
            <span className={`nu-tag ${f.status}`}>{STATUS.find(([k]) => k === f.status)?.[1]}</span>
          </div>
          {aberto === f.id && <FichaFornecedor f={f} chamar={chamar} recarregar={recarregar} />}
        </div>
      ))}
    </section>
  );
}

function FichaFornecedor({ f, chamar, recarregar }) {
  const [e, setE] = useState(f);
  const [hist, setHist] = useState([]);
  const [resposta, setResposta] = useState('');
  const [sugestao, setSugestao] = useState(null);
  const [ocupado, setOcupado] = useState(false);
  const set = (k) => (ev) => setE({ ...e, [k]: ev.target.value });

  const carregarHist = useCallback(async () => {
    setHist(await chamar({ acao: 'listar', tabela: 'interacoes', filtro: `fornecedor_id=eq.${f.id}`, ordem: 'criado_em.desc' }));
  }, [chamar, f.id]);
  useEffect(() => {
    carregarHist().catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function salvar(extra = {}) {
    const dados = {
      canal: e.canal, contato: e.contato, site: e.site, status: e.status,
      minimo_pedido: e.minimo_pedido, aceita_terceiro: e.aceita_terceiro,
      nf_nome_cliente: e.nf_nome_cliente, autoriza_fotos: e.autoriza_fotos, vende_cpf: e.vende_cpf,
      troca: e.troca, prazo: e.prazo, observacoes: e.observacoes,
      proximo_followup: e.proximo_followup || null, ...extra,
    };
    await chamar({ acao: 'atualizar', tabela: 'fornecedores', id: f.id, dados });
    recarregar();
  }

  const fone = (e.contato || '').replace(/\D/g, '');
  const linkWa = fone ? `https://wa.me/${fone.startsWith('55') ? fone : '55' + fone}?text=${encodeURIComponent(msgInicial(f.nome))}` : null;

  async function registrarEnvio(texto) {
    await chamar({ acao: 'criar', tabela: 'interacoes', dados: { fornecedor_id: f.id, tipo: 'mensagem_enviada', texto } });
    await salvar({ status: e.status === 'a_contatar' ? 'contatado' : e.status, proximo_followup: maisDias(2) });
    setE({ ...e, status: e.status === 'a_contatar' ? 'contatado' : e.status, proximo_followup: maisDias(2) });
    carregarHist();
  }

  async function extrair() {
    setOcupado(true);
    try {
      const r = await chamar({ acao: 'extrair', texto: resposta });
      setSugestao(r);
    } finally {
      setOcupado(false);
    }
  }

  async function aplicar() {
    const s = sugestao || {};
    const novo = { ...e };
    ['minimo_pedido', 'troca', 'prazo', 'observacoes'].forEach((k) => { if (s[k]) novo[k] = s[k]; });
    ['aceita_terceiro', 'nf_nome_cliente', 'autoriza_fotos', 'vende_cpf'].forEach((k) => { if (s[k]) novo[k] = s[k]; });
    novo.status = ['a_contatar', 'contatado'].includes(novo.status) ? 'respondeu' : novo.status;
    setE(novo);
    await chamar({ acao: 'criar', tabela: 'interacoes', dados: { fornecedor_id: f.id, tipo: 'resposta', texto: resposta } });
    await chamar({
      acao: 'atualizar', tabela: 'fornecedores', id: f.id,
      dados: {
        minimo_pedido: novo.minimo_pedido, troca: novo.troca, prazo: novo.prazo, observacoes: novo.observacoes,
        aceita_terceiro: novo.aceita_terceiro, nf_nome_cliente: novo.nf_nome_cliente,
        autoriza_fotos: novo.autoriza_fotos, vende_cpf: novo.vende_cpf, status: novo.status,
      },
    });
    for (const p of s.produtos || []) {
      if (p?.nome) {
        await chamar({
          acao: 'criar', tabela: 'produtos',
          dados: { fornecedor_id: f.id, nome: p.nome, descricao: p.descricao || null, tamanhos: p.tamanhos || null, custo: num(p.custo) },
        });
      }
    }
    setSugestao(null);
    setResposta('');
    carregarHist();
    recarregar();
  }

  const campoSN = (k, rotulo) => (
    <label>
      {rotulo}
      <select value={e[k]} onChange={set(k)}>
        {SIMNAO.map(([v, n]) => (
          <option key={v} value={v}>{n}</option>
        ))}
      </select>
    </label>
  );

  return (
    <div className="nu-ficha">
      <div className="nu-form">
        <label>Status
          <select value={e.status} onChange={set('status')}>
            {STATUS.map(([k, n]) => <option key={k} value={k}>{n}</option>)}
          </select>
        </label>
        <label>Canal
          <select value={e.canal || 'whatsapp'} onChange={set('canal')}>
            {['whatsapp', 'instagram', 'email', 'site'].map((c) => <option key={c}>{c}</option>)}
          </select>
        </label>
        <label>Contato (telefone com DDD, @ ou e-mail)
          <input value={e.contato || ''} onChange={set('contato')} />
        </label>
        <label>Site
          <input value={e.site || ''} onChange={set('site')} />
        </label>
        <label>Pedido mínimo
          <input value={e.minimo_pedido || ''} onChange={set('minimo_pedido')} />
        </label>
        <label>Prazo de produção
          <input value={e.prazo || ''} onChange={set('prazo')} />
        </label>
        {campoSN('aceita_terceiro', 'Aceita retirada por terceiro?')}
        {campoSN('nf_nome_cliente', 'Nota no nome do cliente?')}
        {campoSN('autoriza_fotos', 'Autoriza usar as fotos?')}
        {campoSN('vende_cpf', 'Vende para CPF?')}
        <label>Troca
          <input value={e.troca || ''} onChange={set('troca')} />
        </label>
        <label>Próximo follow-up
          <input type="date" value={e.proximo_followup || ''} onChange={set('proximo_followup')} />
        </label>
        <label className="nu-larga">Observações
          <textarea rows={3} value={e.observacoes || ''} onChange={set('observacoes')} />
        </label>
      </div>
      <div className="nu-linha">
        <button onClick={() => salvar()}>Salvar ficha</button>
        {linkWa ? (
          <a className="nu-btn" href={linkWa} target="_blank" rel="noreferrer" onClick={() => registrarEnvio(msgInicial(f.nome))}>
            Abrir WhatsApp com a mensagem
          </a>
        ) : (
          <span className="nu-mudo">Preencha o telefone para abrir o WhatsApp.</span>
        )}
        <button className="nu-sec" onClick={() => navigator.clipboard?.writeText(msgInicial(f.nome))}>Copiar mensagem</button>
        <button className="nu-sec" onClick={() => navigator.clipboard?.writeText(lembrete(f.nome))}>Copiar lembrete</button>
      </div>
      <p className="nu-mudo">
        O WhatsApp abre no seu aparelho com o texto pronto e você aperta enviar. Nada é enviado sozinho.
      </p>

      <h3>Colar a resposta do fornecedor</h3>
      <textarea rows={4} value={resposta} onChange={(ev) => setResposta(ev.target.value)} placeholder="Cole aqui o texto da resposta (tabela, condições, produtos)" />
      <div className="nu-linha">
        <button disabled={!resposta.trim() || ocupado} onClick={extrair}>{ocupado ? 'Lendo…' : 'Extrair com IA'}</button>
      </div>
      {sugestao && (
        <div className="nu-card">
          <p><strong>A IA entendeu isto. Confira antes de aplicar:</strong></p>
          <pre>{JSON.stringify(sugestao, null, 2)}</pre>
          <button onClick={aplicar}>Aplicar na ficha e no catálogo</button>
        </div>
      )}

      <h3>Histórico</h3>
      {hist.length === 0 ? (
        <p className="nu-mudo">Nenhum registro ainda.</p>
      ) : (
        <ul className="nu-hist">
          {hist.map((h) => (
            <li key={h.id}>
              <span>{new Date(h.criado_em).toLocaleDateString('pt-BR')} · {h.tipo.replace('_', ' ')}</span>
              <p>{(h.texto || '').slice(0, 300)}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function Catalogo({ forn, prod, par, setPar, chamar, recarregar }) {
  const vazio = { fornecedor_id: '', nome: '', custo: '', preco_mercado_min: '', preco_mercado_max: '', descricao: '' };
  const [n, setN] = useState(vazio);
  const [soPassa, setSoPassa] = useState(false);
  const nomeForn = useMemo(() => Object.fromEntries(forn.map((f) => [f.id, f.nome])), [forn]);
  const set = (k) => (ev) => setN({ ...n, [k]: ev.target.value });

  async function adicionar() {
    if (!n.fornecedor_id || !n.nome.trim()) return;
    await chamar({
      acao: 'criar', tabela: 'produtos',
      dados: {
        fornecedor_id: n.fornecedor_id, nome: n.nome.trim(), descricao: n.descricao || null,
        custo: num(n.custo), preco_mercado_min: num(n.preco_mercado_min), preco_mercado_max: num(n.preco_mercado_max),
      },
    });
    setN(vazio);
    recarregar();
  }
  async function editar(p, k, v) {
    await chamar({ acao: 'atualizar', tabela: 'produtos', id: p.id, dados: { [k]: num(v) } });
    recarregar();
  }

  const linhas = prod
    .map((p) => ({ p, a: analise(p, par) }))
    .filter(({ a }) => !soPassa || a?.veredito === 'Passa');

  return (
    <section>
      <div className="nu-card">
        <h2>Regras da margem</h2>
        <div className="nu-form">
          {[['taxa', 'Taxa da plataforma %'], ['reserva', 'Reserva de devolução %'], ['imposto', 'Imposto %'], ['emb', 'Embalagem R$'], ['frete', 'Frete R$'], ['alvo', 'Margem-alvo %']].map(([k, r]) => (
            <label key={k}>{r}
              <input value={par[k]} onChange={(ev) => setPar({ ...par, [k]: num(ev.target.value) ?? 0 })} />
            </label>
          ))}
        </div>
      </div>
      <div className="nu-card">
        <h2>Novo modelo</h2>
        <div className="nu-form">
          <label>Fornecedor
            <select value={n.fornecedor_id} onChange={set('fornecedor_id')}>
              <option value="">Escolha</option>
              {forn.map((f) => <option key={f.id} value={f.id}>{f.nome}</option>)}
            </select>
          </label>
          <label>Modelo<input value={n.nome} onChange={set('nome')} /></label>
          <label>Custo (R$)<input value={n.custo} onChange={set('custo')} /></label>
          <label>Menor preço no mercado<input value={n.preco_mercado_min} onChange={set('preco_mercado_min')} /></label>
          <label>Maior preço no mercado<input value={n.preco_mercado_max} onChange={set('preco_mercado_max')} /></label>
          <label className="nu-larga">Descrição<input value={n.descricao} onChange={set('descricao')} /></label>
        </div>
        <button onClick={adicionar}>Adicionar modelo</button>
      </div>
      <label className="nu-check"><input type="checkbox" checked={soPassa} onChange={(e) => setSoPassa(e.target.checked)} /> Mostrar só os que passam</label>
      {linhas.length === 0 && <p className="nu-mudo">Nenhum modelo cadastrado.</p>}
      {linhas.map(({ p, a }) => (
        <div className="nu-card" key={p.id}>
          <div className="nu-cab">
            <strong>{p.nome}</strong>
            <span className={`nu-tag v-${(a?.veredito || 'Sem referência').replace(/\s|ê/g, '')}`}>{a?.veredito || 'Sem custo'}</span>
          </div>
          <p className="nu-mudo">{nomeForn[p.fornecedor_id]}{p.descricao ? ` · ${p.descricao}` : ''}</p>
          <div className="nu-form">
            <label>Custo<input defaultValue={p.custo ?? ''} onBlur={(e) => editar(p, 'custo', e.target.value)} /></label>
            <label>Preço mín.<input defaultValue={p.preco_mercado_min ?? ''} onBlur={(e) => editar(p, 'preco_mercado_min', e.target.value)} /></label>
            <label>Preço máx.<input defaultValue={p.preco_mercado_max ?? ''} onBlur={(e) => editar(p, 'preco_mercado_max', e.target.value)} /></label>
          </div>
          {a && (
            <p>
              No menor preço: lucro {brl(a.a?.lucro)} ({a.a ? (a.a.margem * 100).toFixed(0) + '%' : '—'}) · Preço mínimo para a margem-alvo: {brl(a.precoMin)}
            </p>
          )}
        </div>
      ))}
    </section>
  );
}

function Plano({ tarefas, chamar, recarregar }) {
  const semanas = [...new Set(tarefas.map((t) => t.semana))].sort();
  async function alternar(t) {
    await chamar({ acao: 'atualizar', tabela: 'tarefas', id: t.id, dados: { feita: !t.feita } });
    recarregar();
  }
  return (
    <section>
      {semanas.map((s) => (
        <div className="nu-card" key={s}>
          <h2>Semana {s}</h2>
          {tarefas.filter((t) => t.semana === s).sort((a, b) => a.ordem - b.ordem).map((t) => (
            <label className="nu-check" key={t.id}>
              <input type="checkbox" checked={t.feita} onChange={() => alternar(t)} /> {t.titulo}
            </label>
          ))}
        </div>
      ))}
    </section>
  );
}

function Estilos() {
  return (
    <style>{`
      .nu-wrap{--bg:#f6f7f9;--cd:#fff;--bd:#dfe3ea;--tx:#1b1f27;--mu:#667085;--ac:#2f6df6;--ok:#12805c;--no:#c0392b;--am:#a86b00;
        min-height:100vh;background:var(--bg);color:var(--tx);padding:16px;max-width:980px;margin:0 auto;font-family:system-ui,-apple-system,Segoe UI,Roboto,Arial,sans-serif}
      @media (prefers-color-scheme:dark){.nu-wrap{--bg:#0f1115;--cd:#171a21;--bd:#2a303c;--tx:#e8eaed;--mu:#9aa3b2;--ac:#6b9bff;--ok:#4cd6a0;--no:#ff7a6b;--am:#f5b942}}
      .nu-wrap h1{font-size:20px;margin:0}.nu-wrap h2{font-size:16px;margin:0 0 8px}.nu-wrap h3{font-size:14px;margin:16px 0 6px}
      .nu-topo{display:flex;justify-content:space-between;align-items:center;gap:12px;margin-bottom:12px}
      .nu-topo p,.nu-mudo{color:var(--mu);font-size:13px;margin:2px 0}
      .nu-abas{display:flex;gap:6px;flex-wrap:wrap;margin-bottom:14px}
      .nu-abas button{background:var(--cd);color:var(--mu);border:1px solid var(--bd);padding:9px 14px;border-radius:8px;cursor:pointer;font-size:14px}
      .nu-abas button.on{color:var(--tx);border-color:var(--ac)}
      .nu-card{background:var(--cd);border:1px solid var(--bd);border-radius:12px;padding:14px;margin-bottom:12px}
      .nu-grade{display:grid;grid-template-columns:repeat(auto-fill,minmax(130px,1fr));gap:10px;margin-bottom:12px}
      .nu-num{text-align:center;margin:0}.nu-num strong{display:block;font-size:26px}.nu-num span{color:var(--mu);font-size:12px}
      .nu-cab{display:flex;justify-content:space-between;align-items:center;gap:8px;cursor:pointer}
      .nu-tag{font-size:12px;padding:2px 10px;border-radius:999px;border:1px solid var(--bd);color:var(--mu);white-space:nowrap}
      .nu-tag.aprovado,.nu-tag.v-Passa{color:var(--ok);border-color:var(--ok)}
      .nu-tag.reprovado,.nu-tag.v-Reprova,.nu-tag.sem_resposta{color:var(--no);border-color:var(--no)}
      .nu-tag.v-Verificar,.nu-tag.contatado,.nu-tag.respondeu{color:var(--am);border-color:var(--am)}
      .nu-form{display:grid;grid-template-columns:repeat(auto-fill,minmax(210px,1fr));gap:10px;margin:10px 0}
      .nu-form label,.nu-larga{display:flex;flex-direction:column;gap:4px;font-size:12px;color:var(--mu)}
      .nu-larga{grid-column:1/-1}
      .nu-wrap input,.nu-wrap select,.nu-wrap textarea{background:var(--bg);color:var(--tx);border:1px solid var(--bd);border-radius:8px;padding:9px 10px;font-size:14px;font-family:inherit;width:100%;box-sizing:border-box}
      .nu-wrap button,.nu-btn{background:var(--ac);color:#fff;border:0;border-radius:8px;padding:9px 14px;font-size:14px;cursor:pointer;text-decoration:none;display:inline-block}
      .nu-wrap button:disabled{opacity:.5;cursor:default}
      .nu-wrap button.nu-sec{background:transparent;color:var(--tx);border:1px solid var(--bd)}
      .nu-linha{display:flex;gap:8px;flex-wrap:wrap;align-items:center;margin:10px 0}
      .nu-linha input,.nu-linha select{width:auto;flex:1;min-width:160px}
      .nu-check{display:flex;gap:8px;align-items:flex-start;padding:6px 0;font-size:14px}
      .nu-check input{width:auto;margin-top:3px}
      .nu-erro{color:var(--no);font-size:14px}
      .nu-hist{list-style:none;padding:0;margin:0}.nu-hist li{border-top:1px solid var(--bd);padding:8px 0;font-size:13px}.nu-hist span{color:var(--mu)}.nu-hist p{margin:4px 0}
      .nu-wrap pre{white-space:pre-wrap;font-size:12px;background:var(--bg);padding:10px;border-radius:8px;max-height:260px;overflow:auto}
      .nu-login{max-width:340px;margin:12vh auto 0;background:var(--cd);border:1px solid var(--bd);border-radius:12px;padding:22px}
      .nu-login form{display:flex;flex-direction:column;gap:10px;margin-top:12px}
      @media (max-width:560px){.nu-wrap{padding:12px}}
    `}</style>
  );
}
