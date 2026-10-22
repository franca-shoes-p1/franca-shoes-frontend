import { useEffect, useState, useCallback, useRef } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { api, ADMIN_CSS } from '../../lib/adminClient';

const VAZIO = { titulo: '', categoria: '', material: '', tamanhos: '', descricao: '', preco: '', foto_url: '' };
const brl = (n) => 'R$ ' + Number(n || 0).toFixed(2).replace('.', ',');

// Reduz a foto do celular (vários MB) para ~1200px antes de enviar.
async function reduzirFoto(arquivo) {
  let img;
  try {
    img = await createImageBitmap(arquivo, { imageOrientation: 'from-image' });
  } catch {
    img = await new Promise((ok, falha) => {
      const el = new Image();
      el.onload = () => ok(el);
      el.onerror = falha;
      el.src = URL.createObjectURL(arquivo);
    });
  }
  const w0 = img.width || img.naturalWidth;
  const h0 = img.height || img.naturalHeight;
  const escala = Math.min(1, 1200 / Math.max(w0, h0));
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(w0 * escala);
  canvas.height = Math.round(h0 * escala);
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#fff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL('image/jpeg', 0.82);
}

export default function OperadorCatalogo() {
  const [fase, setFase] = useState('carregando'); // carregando | login | semacesso | pronto
  const [lista, setLista] = useState([]);
  const [form, setForm] = useState(VAZIO);
  const [editandoId, setEditandoId] = useState(null);
  const [msg, setMsg] = useState(null);
  const [ocupado, setOcupado] = useState(false);
  const [enviandoFoto, setEnviandoFoto] = useState(false);
  const topoForm = useRef(null);

  const carregar = useCallback(async () => {
    try {
      const d = await api('/api/operador/catalogo');
      setLista(d.produtos || []);
      setFase('pronto');
    } catch (e) {
      if (e.status === 401) setFase('login');
      else if (e.status === 403) { setMsg({ tipo: 'er', texto: e.message }); setFase('semacesso'); }
      else { setMsg({ tipo: 'er', texto: e.message }); setFase('pronto'); }
    }
  }, []);
  useEffect(() => { carregar(); }, [carregar]);

  const mudar = (campo) => (ev) => setForm({ ...form, [campo]: ev.target.value });

  async function escolherFoto(ev) {
    const arquivo = ev.target.files && ev.target.files[0];
    ev.target.value = '';
    if (!arquivo) return;
    setEnviandoFoto(true);
    setMsg(null);
    try {
      const imagem = await reduzirFoto(arquivo);
      const d = await api('/api/operador/catalogo/foto', { method: 'POST', body: { imagem } });
      setForm((f) => ({ ...f, foto_url: d.url }));
    } catch (e) {
      setMsg({ tipo: 'er', texto: e.message || 'Não consegui enviar a foto.' });
    }
    setEnviandoFoto(false);
  }

  function editar(p) {
    setEditandoId(p.id);
    setForm({
      titulo: p.titulo_publico || p.nome || '',
      categoria: p.categoria || '',
      material: p.material || '',
      tamanhos: p.tamanhos || '',
      descricao: p.descricao || '',
      preco: p.preco_venda_sugerido ? String(p.preco_venda_sugerido).replace('.', ',') : '',
      foto_url: p.foto_url || '',
    });
    setMsg(null);
    if (topoForm.current) topoForm.current.scrollIntoView({ behavior: 'smooth' });
  }
  function cancelar() { setEditandoId(null); setForm(VAZIO); setMsg(null); }

  async function salvar(ev) {
    ev.preventDefault();
    setOcupado(true);
    setMsg(null);
    try {
      if (editandoId) {
        await api(`/api/operador/catalogo/${editandoId}`, { method: 'PATCH', body: form });
        setMsg({ tipo: 'ok', texto: 'Modelo atualizado.' });
      } else {
        await api('/api/operador/catalogo', { method: 'POST', body: form });
        setMsg({ tipo: 'ok', texto: 'Modelo enviado para revisão. Ele só vai para a loja depois que a coordenação publicar.' });
      }
      setEditandoId(null);
      setForm(VAZIO);
      await carregar();
    } catch (e) {
      setMsg({ tipo: 'er', texto: e.message });
    }
    setOcupado(false);
  }

  return (
    <div className="ea">
      <Head>
        <title>Cadastro de modelos</title>
        <meta name="robots" content="noindex,nofollow" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <style>{ADMIN_CSS}</style>
        <style>{`
          .pc-thumb{width:56px;height:56px;border-radius:8px;object-fit:cover;background:var(--bd);flex:none;display:flex;align-items:center;justify-content:center;font-size:24px}
          .pc-foto{width:100%;max-width:240px;aspect-ratio:1/1;border:2px dashed var(--bd);border-radius:12px;display:flex;align-items:center;justify-content:center;overflow:hidden;background:var(--bg);font-size:48px}
          .pc-foto img{width:100%;height:100%;object-fit:cover}
          .pc-info{min-width:0;flex:1}
        `}</style>
      </Head>
      <div className="ea-in" style={{ maxWidth: 720 }}>
        <div className="ea-row" style={{ justifyContent: 'space-between' }}>
          <div>
            <h1>Cadastro de modelos</h1>
            <div className="ea-mu">Os modelos entram ocultos e a coordenação revisa antes de publicar.</div>
          </div>
          <Link href="/operador" className="ea-btn ea-btn2">Minhas tarefas</Link>
        </div>

        {msg && <div className={`ea-msg ${msg.tipo}`}>{msg.texto}</div>}
        {fase === 'carregando' && <div className="ea-card">Carregando…</div>}
        {fase === 'login' && (
          <div className="ea-card">
            <h2>Entre primeiro</h2>
            <p className="ea-mu">Faça login em <Link href="/operador">Minhas tarefas</Link> com o seu código.</p>
          </div>
        )}
        {fase === 'semacesso' && (
          <div className="ea-card">
            <h2>Sem permissão</h2>
            <p className="ea-mu">A coordenação ainda não liberou o cadastro de modelos para você, ou você ainda não aceitou as regras em <Link href="/operador">Minhas tarefas</Link>.</p>
          </div>
        )}

        {fase === 'pronto' && (
          <>
            <form className="ea-card" onSubmit={salvar} ref={topoForm}>
              <h2>{editandoId ? 'Editar modelo' : 'Novo modelo'}</h2>
              <div className="ea-msg" style={{ marginTop: 0, marginBottom: 12 }}>
                Use só fotos que a fábrica autorizou ou que você mesmo tirou. Preencha com o que foi informado, sem inventar. Preço de venda: o que a coordenação passou.
              </div>

              <label>Foto</label>
              <div className="ea-row" style={{ alignItems: 'flex-start' }}>
                <div className="pc-foto">{form.foto_url ? <img src={form.foto_url} alt="" /> : '📷'}</div>
                <div style={{ flex: 1, minWidth: 200 }}>
                  <label className="ea-btn ea-btn2" style={{ display: 'inline-block', color: 'var(--ac)', fontSize: 14, marginBottom: 8 }}>
                    {enviandoFoto ? 'Enviando…' : form.foto_url ? 'Trocar foto' : 'Tirar ou escolher foto'}
                    <input type="file" accept="image/*" onChange={escolherFoto} disabled={enviandoFoto} style={{ display: 'none' }} />
                  </label>
                </div>
              </div>

              <div className="ea-grid" style={{ marginTop: 14 }}>
                <div><label>Nome do modelo *</label><input value={form.titulo} onChange={mudar('titulo')} required placeholder="Sandália Rasteira Dourada" /></div>
                <div><label>Categoria</label><input value={form.categoria} onChange={mudar('categoria')} placeholder="Sandálias, Bolsas, Cintos…" /></div>
                <div><label>Material</label><input value={form.material} onChange={mudar('material')} placeholder="Como a fábrica informou" /></div>
                <div><label>Números disponíveis</label><input value={form.tamanhos} onChange={mudar('tamanhos')} placeholder="35 ao 40" /></div>
                <div><label>Preço de venda (R$) *</label><input value={form.preco} onChange={mudar('preco')} required inputMode="decimal" placeholder="89,90" /></div>
              </div>

              <div style={{ marginTop: 12 }}>
                <label>Descrição (2 a 4 linhas, sem exagero)</label>
                <textarea value={form.descricao} onChange={mudar('descricao')} />
              </div>

              <div className="ea-row" style={{ marginTop: 14 }}>
                <button className="ea-btn ea-btn-ok" disabled={ocupado || enviandoFoto}>{ocupado ? 'Salvando…' : editandoId ? 'Salvar alterações' : 'Enviar para revisão'}</button>
                {editandoId && <button type="button" className="ea-btn ea-btn2" onClick={cancelar}>Cancelar</button>}
              </div>
            </form>

            <div className="ea-card">
              <h2>Meus modelos ({lista.length})</h2>
              {lista.length === 0 && <p className="ea-mu">Você ainda não cadastrou nenhum modelo.</p>}
              {lista.map((p) => {
                const publicado = p.publicado && p.ativo;
                return (
                  <div key={p.id} className="ea-item">
                    <div className="ea-row" style={{ flexWrap: 'nowrap', flex: 1, minWidth: 0 }}>
                      {p.foto_url ? <img className="pc-thumb" src={p.foto_url} alt="" /> : <div className="pc-thumb">👟</div>}
                      <div className="pc-info">
                        <b>{p.titulo_publico || p.nome}</b>
                        <span className="ea-mu">{brl(p.preco_venda_sugerido)}{p.categoria ? ` · ${p.categoria}` : ''}</span>{' '}
                        {publicado ? <span className="ea-tag ok">publicado</span> : <span className="ea-tag am">aguardando revisão</span>}
                      </div>
                    </div>
                    {!publicado && <button className="ea-btn ea-btn2" onClick={() => editar(p)}>Editar</button>}
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
