import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import { api, ADMIN_CSS } from '../lib/adminClient';

const STATUS = {
  aberta: 'Aberta',
  em_andamento: 'Em andamento',
  em_revisao: 'Em revisão',
  aprovada: 'Aprovada',
  devolvida: 'Devolvida para ajustes',
};
const real = (n) => Number(n || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

export default function Operador() {
  const [d, setD] = useState(null);
  const [msg, setMsg] = useState(null);
  const [links, setLinks] = useState({});

  async function carregar() {
    try {
      setD(await api('/api/op/operador'));
    } catch (e) {
      if (e.status === 401) window.location.href = '/entrar';
      else setMsg({ tipo: 'er', texto: e.message });
    }
  }
  useEffect(() => {
    carregar();
  }, []);

  async function acao(corpo, ok) {
    setMsg(null);
    try {
      await api('/api/op/operador', { method: 'POST', body: corpo });
      if (ok) setMsg({ tipo: 'ok', texto: ok });
      await carregar();
    } catch (e) {
      setMsg({ tipo: 'er', texto: e.message });
    }
  }
  async function sair() {
    await api('/api/op/logout', { method: 'POST', body: {} });
    window.location.href = '/entrar';
  }

  if (!d) return <div className="ea"><style>{ADMIN_CSS}</style><div className="ea-in">{msg ? <div className={`ea-msg ${msg.tipo}`}>{msg.texto}</div> : 'Carregando…'}</div></div>;

  const aReceber = (d.pagamentos || []).filter((p) => p.status === 'pendente').reduce((s, p) => s + Number(p.valor), 0);
  const recebido = (d.pagamentos || []).filter((p) => p.status === 'pago').reduce((s, p) => s + Number(p.valor), 0);

  return (
    <div className="ea">
      <Head>
        <title>Minhas missões</title>
        <meta name="robots" content="noindex" />
      </Head>
      <style>{ADMIN_CSS}</style>
      <div className="ea-in">
        <div className="ea-row" style={{ justifyContent: 'space-between' }}>
          <div>
            <h1>Olá, {d.perfil.nome || 'operador'}</h1>
            <div className="ea-mu">Suas missões, pontos e pagamentos</div>
          </div>
          <button className="ea-btn ea-btn2" onClick={sair}>Sair</button>
        </div>

        {msg && <div className={`ea-msg ${msg.tipo}`}>{msg.texto}</div>}

        {d.pendente ? (
          <div className="ea-card">
            <h2>Conta aguardando aprovação</h2>
            <p className="ea-mu">Assim que o responsável liberar o seu acesso, as missões abertas aparecem aqui.</p>
          </div>
        ) : (
          <>
            <div className="ea-grid" style={{ marginTop: 16 }}>
              <div className="ea-card" style={{ marginTop: 0 }}><div className="ea-mu">Pontos aprovados</div><h1>{d.pontos}</h1></div>
              <div className="ea-card" style={{ marginTop: 0 }}><div className="ea-mu">Crédito a pagar</div><h1>{real(aReceber)}</h1></div>
              <div className="ea-card" style={{ marginTop: 0 }}><div className="ea-mu">Já recebido</div><h1>{real(recebido)}</h1></div>
            </div>

            <div className="ea-card">
              <h2>Minhas missões</h2>
              {!d.minhas.length && <div className="ea-mu">Você ainda não pegou nenhuma missão. Escolha uma abaixo.</div>}
              {d.minhas.map((t) => (
                <div className="ea-item" key={t.id} style={{ alignItems: 'flex-start', flexDirection: 'column' }}>
                  <div className="ea-row" style={{ width: '100%', justifyContent: 'space-between' }}>
                    <strong>{t.titulo}</strong>
                    <span className={`ea-tag ${t.status === 'aprovada' ? 'ok' : t.status === 'devolvida' ? 'er' : 'am'}`}>{STATUS[t.status] || t.status}</span>
                  </div>
                  <div className="ea-mu">Setor: {t.setor} · {t.pontos} pontos · {real(t.valor_fixo)}</div>
                  {t.status === 'devolvida' && t.comentario_revisao && <div className="ea-msg er" style={{ width: '100%', boxSizing: 'border-box' }}>Ajuste pedido: {t.comentario_revisao}</div>}
                  {(t.status === 'em_andamento' || t.status === 'devolvida') && (
                    <div className="ea-row" style={{ width: '100%' }}>
                      <input style={{ flex: 1, minWidth: 220 }} placeholder="Link da entrega (https://…)" value={links[t.id] || ''} onChange={(e) => setLinks({ ...links, [t.id]: e.target.value })} />
                      <button className="ea-btn" onClick={() => acao({ acao: 'entregar', id: t.id, link: links[t.id] }, 'Entrega enviada para revisão.')}>Enviar entrega</button>
                    </div>
                  )}
                  {t.link_entrega && <a href={t.link_entrega} target="_blank" rel="noopener noreferrer">Ver entrega enviada</a>}
                </div>
              ))}
            </div>

            <div className="ea-card">
              <h2>Missões abertas</h2>
              {!d.abertas.length && <div className="ea-mu">Nenhuma missão aberta agora. Volte em breve.</div>}
              {d.abertas.map((t) => (
                <div className="ea-item" key={t.id}>
                  <div>
                    <strong>{t.titulo}</strong>
                    <div className="ea-mu">Setor: {t.setor} · {t.pontos} pontos · {real(t.valor_fixo)}</div>
                  </div>
                  <button className="ea-btn" onClick={() => acao({ acao: 'pegar', id: t.id }, 'Missão sua! Ela já aparece em "Minhas missões".')}>Pegar</button>
                </div>
              ))}
            </div>

            <div className="ea-card">
              <h2>Pagamentos</h2>
              <p className="ea-mu">
                Missões de produtos internos viram "crédito a pagar": o valor fica registrado e é liberado a partir das primeiras vendas, conforme combinado em contrato.
              </p>
              {!d.pagamentos.length && <div className="ea-mu">Nada por aqui ainda.</div>}
              {d.pagamentos.map((p) => (
                <div className="ea-item" key={p.id}>
                  <div>
                    <strong>{real(p.valor)}</strong>
                    <div className="ea-mu">{p.referencia || p.tipo}</div>
                  </div>
                  <span className={`ea-tag ${p.status === 'pago' ? 'ok' : 'am'}`}>{p.status === 'pago' ? 'Pago' : 'A pagar'}</span>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
