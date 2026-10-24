import { useEffect, useState, useCallback } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { api, ADMIN_CSS } from '../../../lib/adminClient';
import { reduzirFoto } from '../../../lib/reduzirFoto';

const brl = (n) => 'R$ ' + Number(n || 0).toFixed(2).replace('.', ',');
const ST = { entregue: 'Em análise', ajuste: 'Ajuste pedido', aprovada: 'Aprovada', paga: 'Paga', recusada: 'Recusada' };

export default function CartaoPagina() {
  const { query } = useRouter();
  const id = query.id;
  const [d, setD] = useState(null);
  const [msg, setMsg] = useState(null);
  const [login, setLogin] = useState(false);
  const [chk, setChk] = useState([]);
  const [resp, setResp] = useState({});
  const [obs, setObs] = useState('');
  const [anexos, setAnexos] = useState([]);
  const [ocupado, setOcupado] = useState(false);

  const carregar = useCallback(async () => {
    if (!id) return;
    try {
      const r = await api(`/api/operador/oficina/cartao?id=${id}`);
      setD(r);
      setChk((c) => (c.length === r.cartao.checklist.length ? c : r.cartao.checklist.map(() => null)));
    } catch (e) { if (e.status === 401) setLogin(true); else setMsg({ tipo: 'er', texto: e.message }); }
  }, [id]);
  useEffect(() => { carregar(); }, [carregar]);

  async function anexar(ev) {
    const arq = ev.target.files && ev.target.files[0];
    ev.target.value = '';
    if (!arq) return;
    setOcupado(true); setMsg(null);
    try {
      const imagem = await reduzirFoto(arq);
      const r = await api('/api/operador/oficina/upload', { method: 'POST', body: { imagem } });
      setAnexos((a) => [...a, r.url]);
    } catch (e) { setMsg({ tipo: 'er', texto: e.message || 'Não consegui enviar a imagem.' }); }
    setOcupado(false);
  }

  async function enviar(ev) {
    ev.preventDefault();
    if (chk.some((x) => x === null)) return setMsg({ tipo: 'er', texto: 'Responda sim ou não em todos os itens do checklist.' });
    setOcupado(true); setMsg(null);
    try {
      await api('/api/operador/oficina/entregar', { method: 'POST', body: { cartao_id: id, checklist: chk, respostas: resp, anexos, observacoes: obs } });
      setAnexos([]); setResp({}); setObs('');
      setMsg({ tipo: 'ok', texto: 'Entrega enviada. Você será avisado quando for analisada.' });
      await carregar();
    } catch (e) { setMsg({ tipo: 'er', texto: e.message }); }
    setOcupado(false);
  }

  const c = d && d.cartao;
  const ult = d && d.minhas[0];
  const podeEntregar = c && d.aceite_em && !(ult && ['entregue'].includes(ult.status)) && !(c.unica && ult && ['aprovada', 'paga'].includes(ult.status));

  return (
    <div className="ea">
      <Head><title>{c ? c.titulo : 'Cartão'}</title><meta name="robots" content="noindex" /></Head>
      <style>{ADMIN_CSS}{'.cp-l{padding-left:20px;margin:6px 0}.cp-l li{margin:4px 0}.cp-sn{display:flex;gap:14px;align-items:flex-start;padding:8px 0;border-top:1px solid var(--bd)}.cp-sn>span{flex:1}.cp-sn label{display:inline-flex;gap:4px;align-items:center;color:var(--tx)}.cp-sn input{width:auto}.cp-img{width:84px;height:84px;object-fit:cover;border-radius:8px;border:1px solid var(--bd)}'}</style>
      <div className="ea-in" style={{ maxWidth: 720 }}>
        <Link href="/operador/oficina" className="ea-mu">← Voltar aos cartões</Link>
        {msg && <div className={`ea-msg ${msg.tipo}`}>{msg.texto}</div>}
        {login && <div className="ea-card">Faça login em <Link href="/operador">/operador</Link> e volte.</div>}
        {!c && !login && !msg && <div className="ea-card">Carregando…</div>}

        {c && (
          <>
            <h1>{c.titulo}</h1>
            <div className="ea-mu">{c.tempo} · {c.valor ? brl(c.valor) : 'sem pagamento em dinheiro'} · +{c.pontos} Pontos Oficina</div>

            {ult && <div className={`ea-msg ${ult.status === 'ajuste' || ult.status === 'recusada' ? 'er' : 'ok'}`}>Sua última entrega: <b>{ST[ult.status] || ult.status}</b>{ult.comentario_revisao ? ` · ${ult.comentario_revisao}` : ''}</div>}

            <div className="ea-card"><b>Objetivo:</b> {c.objetivo}<br /><b>Como saber que acabou:</b> {c.pronto_quando}</div>
            <div className="ea-card"><h2 style={{ marginTop: 0 }}>Material pronto</h2><ul className="cp-l">{c.material.map((m, i) => <li key={i}>{m}</li>)}</ul></div>
            <div className="ea-card"><h2 style={{ marginTop: 0 }}>Passo a passo</h2><ol className="cp-l">{c.passos.map((m, i) => <li key={i}>{m}</li>)}</ol></div>
            <div className="ea-card"><h2 style={{ marginTop: 0 }}>Erros comuns</h2><ul className="cp-l">{c.erros.map((m, i) => <li key={i}>{m}</li>)}</ul></div>
            {c.seguranca && <div className="ea-card"><b>Segurança:</b> {c.seguranca}</div>}
            {c.avaliacao && <div className="ea-card"><b>Como é avaliada:</b> {c.avaliacao}</div>}

            {podeEntregar && (
              <form className="ea-card" onSubmit={enviar}>
                <h2 style={{ marginTop: 0 }}>Sua entrega</h2>
                <label>Checklist</label>
                {c.checklist.map((t, i) => (
                  <div className="cp-sn" key={i}>
                    <span>{t}</span>
                    <label><input type="radio" name={'c' + i} checked={chk[i] === true} onChange={() => setChk((a) => a.map((x, j) => (j === i ? true : x)))} /> Sim</label>
                    <label><input type="radio" name={'c' + i} checked={chk[i] === false} onChange={() => setChk((a) => a.map((x, j) => (j === i ? false : x)))} /> Não</label>
                  </div>
                ))}
                {c.campos.map((f) => (
                  <div key={f.id}>
                    <label>{f.rotulo}</label>
                    <textarea value={resp[f.id] || ''} onChange={(e) => setResp({ ...resp, [f.id]: e.target.value })} required style={{ minHeight: f.longo ? 140 : 60 }} />
                  </div>
                ))}
                {c.prints > 0 && (
                  <div>
                    <label>Imagens / prints ({anexos.length} de {c.prints} no mínimo)</label>
                    <div className="ea-row">{anexos.map((u) => <img key={u} src={u} alt="" className="cp-img" />)}</div>
                    <input type="file" accept="image/*" onChange={anexar} disabled={ocupado || anexos.length >= 10} />
                  </div>
                )}
                <label>Observações (o que viu de estranho, dúvidas)</label>
                <textarea value={obs} onChange={(e) => setObs(e.target.value)} />
                <div style={{ marginTop: 12 }}><button className="ea-btn ea-btn-ok" disabled={ocupado}>{ocupado ? 'Aguarde…' : 'Enviar entrega'}</button></div>
              </form>
            )}
            {c && !d.aceite_em && <div className="ea-card">Aceite as regras de trabalho em <Link href="/operador">Minhas tarefas</Link> para poder entregar.</div>}
          </>
        )}
      </div>
    </div>
  );
}
