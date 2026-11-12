import { useEffect, useState, useCallback } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { api, ADMIN_CSS } from '../../lib/adminClient';

// Deixa endereços do site clicáveis dentro do texto.
function comLinks(t) {
  return String(t).split(/((?:https?:\/\/)?www\.igreja\.eco\.br\/[^\s)]*)/g).map((p, i) => {
    if (i % 2 === 0) return p;
    const href = /^https?:/.test(p) ? p : 'https://' + p;
    return <a key={i} href={href} target="_blank" rel="noopener noreferrer">{p}</a>;
  });
}

const brl = (n) => 'R$ ' + Number(n || 0).toFixed(2).replace('.', ',');
const STATUS = {
  pendente: ['A fazer', ''],
  em_andamento: ['Em andamento', 'am'],
  entregue: ['Entregue, aguardando revisão', 'am'],
  ajuste: ['Ajuste pedido', 'er'],
  aprovada: ['Aprovada, aguardando pagamento', 'ok'],
  paga: ['Paga', 'ok'],
};

export default function Operador() {
  const [fase, setFase] = useState('carregando');
  const [dados, setDados] = useState(null);
  const [codigo, setCodigo] = useState('');
  const [aceito, setAceito] = useState(false);
  const [msg, setMsg] = useState(null);
  const [ocupado, setOcupado] = useState(false);
  const [textos, setTextos] = useState({});

  const carregar = useCallback(async () => {
    try {
      setDados(await api('/api/operador/tarefas'));
      setFase('pronto');
    } catch (e) {
      if (e.status === 401) setFase('login');
      else { setMsg({ tipo: 'er', texto: e.message }); setFase('login'); }
    }
  }, []);
  useEffect(() => { carregar(); }, [carregar]);

  async function rodar(fn, ok) {
    setOcupado(true); setMsg(null);
    try { await fn(); if (ok) setMsg({ tipo: 'ok', texto: ok }); await carregar(); }
    catch (e) { setMsg({ tipo: 'er', texto: e.message }); }
    setOcupado(false);
  }
  const entrar = (ev) => { ev.preventDefault(); rodar(async () => { await api('/api/operador/login', { method: 'POST', body: { codigo } }); setCodigo(''); }); };
  const sair = async () => { await api('/api/operador/logout', { method: 'POST', body: {} }); setDados(null); setFase('login'); };
  const aceitar = () => rodar(() => api('/api/operador/tarefas', { method: 'POST', body: { aceito: true } }));
  const acao = (t, a, extra = {}, ok) => rodar(() => api(`/api/operador/tarefas/${t.id}`, { method: 'POST', body: { acao: a, ...extra } }), ok);

  const op = dados && dados.operador;
  const tarefas = (dados && dados.tarefas) || [];
  const abertas = tarefas.filter((t) => !['paga'].includes(t.status));
  const pagas = tarefas.filter((t) => t.status === 'paga');

  return (
    <div className="ea">
      <Head><title>Minhas tarefas</title><meta name="robots" content="noindex" /></Head>
      <style>{ADMIN_CSS}{'.po-ent{margin-top:8px;padding:10px;border-radius:8px;background:var(--bg);border:1px solid var(--bd);white-space:pre-wrap;word-break:break-word;font-size:14px}'}</style>
      <div className="ea-in" style={{ maxWidth: 720 }}>
        <div className="ea-row" style={{ justifyContent: 'space-between' }}>
          <div>
            <h1>Minhas tarefas</h1>
            {op && <div className="ea-mu">{op.nome} · {op.setor}</div>}
          </div>
          {fase === 'pronto' && <button className="ea-btn ea-btn2" onClick={sair}>Sair</button>}
        </div>

        {msg && <div className={`ea-msg ${msg.tipo}`}>{msg.texto}</div>}
        {fase === 'carregando' && <div className="ea-card">Carregando…</div>}

        {fase === 'login' && (
          <form className="ea-card" onSubmit={entrar}>
            <h2>Entrar</h2>
            <label>Seu código de acesso</label>
            <input value={codigo} onChange={(e) => setCodigo(e.target.value)} placeholder="XXXXX-XXXXX" autoCapitalize="characters" autoFocus required />
            <p className="ea-mu">O código foi enviado a você pela equipe. Sem código? Fale com quem te convidou.</p>
            <button className="ea-btn" disabled={ocupado}>{ocupado ? 'Entrando…' : 'Entrar'}</button>
          </form>
        )}

        {fase === 'pronto' && op && !op.aceite_em && (
          <div className="ea-card">
            <h2>Antes de começar: regras de trabalho</h2>
            <ul>
              <li>Você trabalha como prestador <b>autônomo</b>: sem horário fixo, sem subordinação e sem exclusividade. Pode recusar tarefas.</li>
              <li>Você recebe <b>por tarefa aprovada</b>, depois que o cliente pagou a parte correspondente. O valor de cada tarefa aparece antes de você começar.</li>
              <li>Comissão existe apenas sobre <b>vendas reais</b>, nunca por trazer pessoas.</li>
              <li>Não prometa renda ou resultado a nenhum cliente.</li>
              <li>Guardamos só os dados pessoais necessários (nome, contato e Pix), para pagar você e organizar o trabalho.</li>
              <li>Os dados dos clientes são confidenciais e só podem ser usados na tarefa.</li>
            </ul>
            <p className="ea-mu">Este resumo não substitui o acordo de prestação de serviço, que você pode ler e tirar dúvidas antes de aceitar.</p>
            <label style={{ display: 'flex', gap: 8, alignItems: 'center', color: 'var(--tx)' }}>
              <input type="checkbox" style={{ width: 'auto' }} checked={aceito} onChange={(e) => setAceito(e.target.checked)} /> Li e aceito as regras.
            </label>
            <div style={{ marginTop: 12 }}><button className="ea-btn" disabled={!aceito || ocupado} onClick={aceitar}>Aceitar e continuar</button></div>
          </div>
        )}

        {fase === 'pronto' && op && op.aceite_em && (
          <>
            <div className="ea-card">
              <h2>Oficina Digital</h2>
              <p className="ea-mu" style={{ marginTop: 0 }}>Cartões de Tarefa, seus Pontos e benefícios.</p>
              <Link href="/operador/oficina" className="ea-btn">Abrir a Oficina</Link>
            </div>
            {op.pode_postagens && (
              <div className="ea-card">
                <h2>Postagens do dia</h2>
                <p className="ea-mu" style={{ marginTop: 0 }}>A divulgação do dia já chega pronta (texto e arte). Você só publica no horário e marca como feita.</p>
                <Link href="/operador/postagens" className="ea-btn">Abrir a fila de postagens</Link>
              </div>
            )}
            {op.pode_catalogo && (
              <div className="ea-card">
                <h2>Cadastro de modelos</h2>
                <p className="ea-mu" style={{ marginTop: 0 }}>Você tem permissão para cadastrar modelos. Eles entram ocultos e só vão para a loja depois que a coordenação revisar e publicar.</p>
                <Link href="/operador/catalogo" className="ea-btn">Cadastrar modelos</Link>
              </div>
            )}
            {abertas.length === 0 && <div className="ea-card ea-mu">Nenhuma tarefa para você agora. Quando houver, ela aparece aqui.</div>}
            {abertas.map((t) => {
              const [rot, cor] = STATUS[t.status] || [t.status, ''];
              return (
                <div className="ea-card" key={t.id}>
                  <div className="ea-row" style={{ justifyContent: 'space-between' }}>
                    <div>
                      <h2 style={{ margin: 0 }}>{t.titulo}</h2>
                      <div className="ea-mu">Ordem #{t.ordem.numero} · {t.ordem.cliente} · {t.setor}</div>
                    </div>
                    <span className={`ea-tag ${cor}`}>{rot}</span>
                  </div>
                  <p style={{ marginBottom: 6 }}><b>{brl(t.valor)}</b>{t.prazo ? ` · prazo ${t.prazo.split('-').reverse().join('/')}` : ''}</p>
                  {t.instrucoes && <div className="po-ent"><b>Como fazer:</b>{'\n'}{comLinks(t.instrucoes)}</div>}
                  {t.criterio && <div className="po-ent"><b>Será aprovada se:</b>{'\n'}{t.criterio}</div>}
                  {t.status === 'ajuste' && t.comentario_revisao && <div className="po-ent" style={{ borderColor: 'var(--er)' }}><b>Ajuste pedido:</b> {t.comentario_revisao}</div>}
                  {t.entrega_texto && t.status !== 'em_andamento' && <div className="po-ent"><b>Sua entrega:</b>{'\n'}{t.entrega_texto}</div>}

                  <div style={{ marginTop: 12 }}>
                    {['pendente', 'ajuste'].includes(t.status) && (
                      <button className="ea-btn" disabled={ocupado} onClick={() => acao(t, 'iniciar', {}, 'Tarefa iniciada.')}>{t.status === 'ajuste' ? 'Refazer o ajuste' : 'Começar'}</button>
                    )}
                    {t.status === 'em_andamento' && (
                      <>
                        <label>Entrega (descreva ou cole o link do trabalho)</label>
                        <textarea value={textos[t.id] || ''} onChange={(e) => setTextos({ ...textos, [t.id]: e.target.value })} />
                        <div style={{ marginTop: 10 }}>
                          <button className="ea-btn ea-btn-ok" disabled={ocupado} onClick={() => acao(t, 'entregar', { texto: textos[t.id] || '' }, 'Entrega enviada para revisão.')}>Entregar para revisão</button>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
            {pagas.length > 0 && (
              <div className="ea-card">
                <h2>Já pagas</h2>
                {pagas.map((t) => (
                  <div className="ea-item" key={t.id}><span>#{t.ordem.numero} · {t.titulo}</span><span><b>{brl(t.valor)}</b> · {t.paga_em ? new Date(t.paga_em).toLocaleDateString('pt-BR') : ''}</span></div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
