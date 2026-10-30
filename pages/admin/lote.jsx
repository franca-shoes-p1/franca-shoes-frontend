// Folha "Lote do dia" e autorização de retirada de cada cliente, prontas para imprimir.
import { useEffect, useState, useCallback } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { api, ADMIN_CSS } from '../../lib/adminClient';
import AdminNav from '../../lib/AdminNav';
import { fmtCpf } from '../../lib/fornecedores';

const CSS = `
.lt-folha{background:#fff;color:#111;border:1px solid #cbd5e1;border-radius:8px;padding:18px;margin:14px 0}
.lt-folha h2,.lt-folha h3{color:#111;margin:0 0 6px}
.lt-folha table{width:100%;border-collapse:collapse;font-size:14px}
.lt-folha td,.lt-folha th{border:1px solid #94a3b8;padding:6px;text-align:left;vertical-align:top}
.lt-aut{page-break-before:always}
.lt-aut p{line-height:1.5;margin:8px 0}
.lt-box{display:inline-block;width:14px;height:14px;border:1px solid #111;vertical-align:middle}
@media print{
  body{background:#fff!important}
  .lt-nao-imprimir{display:none!important}
  .lt-folha{border:0;margin:0;padding:0}
}
`;
const hoje = () => new Date().toLocaleDateString('pt-BR');
const mais = (dias) => new Date(Date.now() + dias * 86400000).toLocaleDateString('pt-BR');
const pares = (p) => (p.itens || []).reduce((s, i) => s + Number(i.quantidade || 0), 0);

export default function Lote() {
  const [fase, setFase] = useState('carregando');
  const [d, setD] = useState(null);
  const [erro, setErro] = useState('');
  const [cpfT, setCpfT] = useState('');
  const [so, setSo] = useState('rota'); // rota | todos

  useEffect(() => { try { setCpfT(localStorage.getItem('transportador_cpf') || ''); } catch (e) {} }, []);
  const salvaCpf = (v) => { setCpfT(v); try { localStorage.setItem('transportador_cpf', v); } catch (e) {} };

  const carregar = useCallback(async () => {
    try { setD(await api('/api/admin/fornecedores')); setFase('pronto'); }
    catch (e) { if (e.status === 401) setFase('login'); else { setErro(e.message); setFase('pronto'); } }
  }, []);
  useEffect(() => { carregar(); }, [carregar]);

  if (fase === 'carregando') return <div className="ea"><style>{ADMIN_CSS}</style><p>Carregando…</p></div>;
  if (fase === 'login') return <div className="ea"><style>{ADMIN_CSS}</style><div className="ea-card">Entre primeiro no painel: <Link href="/admin/fornecedores">abrir Fornecedores</Link> e volte aqui.</div></div>;

  const emp = (id) => (d?.empresas || []).find((e) => e.id === id) || {};
  const lista = (d?.pedidos || []).filter((p) => ['pronto_coleta', 'coletado'].includes(p.status) && (so === 'todos' || p.modo_entrega === 'rota'));
  const porForn = {};
  lista.forEach((p) => { (porForn[p.fornecedor_id] = porForn[p.fornecedor_id] || []).push(p); });
  const totalPares = lista.reduce((s, p) => s + pares(p), 0);

  return (
    <div className="ea">
      <style>{ADMIN_CSS}{CSS}</style>
      <Head><title>Lote do dia</title><meta name="robots" content="noindex" /></Head>
      <div className="lt-nao-imprimir">
        <AdminNav />
        <h1>Lote do dia</h1>
        {erro && <div className="ea-msg er">{erro}</div>}
        <div className="ea-card">
          <p className="ea-mu">Mostra os pedidos prontos para coleta ou já coletados. Escolha o modo de entrega de cada um em Fornecedores → Pedidos. Imprima esta página: a primeira folha é a conferência por fornecedor, e depois vem a autorização de cada cliente.</p>
          <div className="ea-row" style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
            <label style={{ margin: 0 }}>Seu CPF (sai na autorização)</label>
            <input value={cpfT} onChange={(ev) => salvaCpf(ev.target.value)} inputMode="numeric" placeholder="000.000.000-00" style={{ maxWidth: 200 }} />
            <select value={so} onChange={(ev) => setSo(ev.target.value)}><option value="rota">Só pedidos de rota</option><option value="todos">Todos (rota e Correios)</option></select>
            <button className="ea-btn" onClick={() => window.print()} disabled={!lista.length}>Imprimir</button>
          </div>
          <p style={{ margin: '8px 0 0' }}><b>{lista.length}</b> pedido(s) · <b>{totalPares}</b> par(es){totalPares > 30 ? ' ⚠ acima de 30 pares: não cabe numa viagem só' : ''}</p>
        </div>
        {lista.length === 0 && <div className="ea-card">Nenhum pedido pronto para coleta neste modo.</div>}
      </div>

      {lista.length > 0 && (
        <div className="lt-folha">
          <h2>Lote do dia · {hoje()}</h2>
          <p style={{ margin: '0 0 8px' }}>Regra: o lote só embarca com todas as notas e autorizações na bolsa de mão, nunca dentro do bagageiro.</p>
          {Object.entries(porForn).map(([fid, ps]) => (
            <div key={fid} style={{ marginBottom: 14 }}>
              <h3>{emp(fid).nome_fantasia || 'Fornecedor'} · {ps.reduce((s, p) => s + pares(p), 0)} par(es)</h3>
              <div>Coleta: {emp(fid).endereco_coleta || 'sem endereço cadastrado'} · WhatsApp {emp(fid).whatsapp}</div>
              <table>
                <thead><tr><th>Pedido</th><th>Itens</th><th>Cliente e CPF (nota)</th><th>Local de entrega na nota</th><th>Nota nº</th><th>Coletado</th></tr></thead>
                <tbody>
                  {ps.map((p) => (
                    <tr key={p.id}>
                      <td>#{p.numero}</td>
                      <td>{(p.itens || []).map((i, k) => <div key={k}>{i.quantidade}× {i.titulo}{i.tamanho ? ` (nº ${i.tamanho})` : ''}</div>)}</td>
                      <td>{p.cliente_nome}<br />{fmtCpf(p.cliente_cpf) || 'sem CPF'}</td>
                      <td>{p.local_entrega || 'A DEFINIR'}</td>
                      <td>_______</td>
                      <td><span className="lt-box" /> nota <span className="lt-box" /> peças</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}
        </div>
      )}

      {lista.map((p) => (
        <div key={p.id} className="lt-folha lt-aut">
          <h2 style={{ textAlign: 'center' }}>AUTORIZAÇÃO DE RETIRADA E TRANSPORTE DE MERCADORIA</h2>
          <p>
            Eu, <b>{p.cliente_nome}</b>, CPF <b>{fmtCpf(p.cliente_cpf) || '______________'}</b>, comprador da nota fiscal nº ________, emitida por{' '}
            <b>{emp(p.fornecedor_id).nome_fantasia || '__________'}</b> em ___/___/______, autorizo <b>RICARDO BELLO</b>, CPF{' '}
            <b>{fmtCpf(cpfT) || '______________'}</b>, a retirar na fábrica a mercadoria descrita na nota e a transportá-la até o local de entrega
            indicado na própria nota: <b>{p.local_entrega || '______________________________'}</b>.
          </p>
          <ul>
            <li>Pedido nº: {p.numero}</li>
            <li>Itens: {(p.itens || []).map((i) => `${i.quantidade}× ${i.titulo}${i.tamanho ? ` (nº ${i.tamanho})` : ''}`).join('; ')}</li>
            <li>Validade: até {mais(30)}</li>
          </ul>
          <p>
            O portador não é o vendedor da mercadoria e atua apenas como transportador autorizado por mim. A mercadoria será entregue no local
            indicado e retirada por mim mediante o código do pedido.
          </p>
          <p>
            Autorização aceita digitalmente no site em{' '}
            <b>{p.aceite_autorizacao_em ? new Date(p.aceite_autorizacao_em).toLocaleString('pt-BR') : '(sem registro)'}</b>.
          </p>
          <p>Local e data: ____________________________ Assinatura do cliente (se exigida): ____________________________</p>
        </div>
      ))}
    </div>
  );
}
