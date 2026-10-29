import { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { api, ADMIN_CSS } from '../../lib/adminClient';
import AdminNav from '../../lib/AdminNav';

const VAZIO = { titulo: '', categoria: '', material: '', tamanhos: '', descricao: '', custo: '', preco: '', foto_url: '' };
const brl = (n) => 'R$ ' + Number(n || 0).toFixed(2).replace('.', ',');
const num = (v) => {
  let s = String(v ?? '').replace(/[^\d,.-]/g, '');
  if (s.includes(',')) s = s.replace(/\./g, '').replace(',', '.');
  const n = parseFloat(s);
  return Number.isFinite(n) ? n : 0;
};

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

export default function AdminCalcados() {
  const [fase, setFase] = useState('carregando'); // carregando | login | pronto
  const [lista, setLista] = useState([]);
  const [senha, setSenha] = useState('');
  const [form, setForm] = useState(VAZIO);
  const [editandoId, setEditandoId] = useState(null);
  const [msg, setMsg] = useState(null);
  const [ocupado, setOcupado] = useState(false);
  const [enviandoFoto, setEnviandoFoto] = useState(false);
  const [busca, setBusca] = useState('');
  const topoForm = useRef(null);

  const carregar = useCallback(async () => {
    try {
      const d = await api('/api/admin/produtos');
      setLista(d.produtos || []);
      setFase('pronto');
    } catch (e) {
      if (e.status === 401) setFase('login');
      else {
        setMsg({ tipo: 'er', texto: e.message });
        setFase('pronto');
      }
    }
  }, []);

  useEffect(() => {
    carregar();
  }, [carregar]);

  const categorias = useMemo(() => [...new Set(lista.map((p) => p.categoria).filter(Boolean))].sort(), [lista]);
  const visiveis = useMemo(() => {
    const b = busca.trim().toLowerCase();
    return lista.filter((p) => !b || `${p.titulo_publico || ''} ${p.nome || ''} ${p.categoria || ''}`.toLowerCase().includes(b));
  }, [lista, busca]);

  const mudar = (campo) => (ev) => setForm({ ...form, [campo]: ev.target.value });

  async function entrar(ev) {
    ev.preventDefault();
    setOcupado(true);
    setMsg(null);
    try {
      await api('/api/admin/login', { method: 'POST', body: { senha } });
      setSenha('');
      await carregar();
    } catch (e) {
      setMsg({ tipo: 'er', texto: e.message });
    }
    setOcupado(false);
  }

  async function sair() {
    await api('/api/admin/logout', { method: 'POST', body: {} });
    setLista([]);
    setFase('login');
  }

  async function escolherFoto(ev) {
    const arquivo = ev.target.files && ev.target.files[0];
    ev.target.value = '';
    if (!arquivo) return;
    setEnviandoFoto(true);
    setMsg(null);
    try {
      const imagem = await reduzirFoto(arquivo);
      const d = await api('/api/admin/produtos/foto', { method: 'POST', body: { imagem } });
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
      custo: p.custo ? String(p.custo).replace('.', ',') : '',
      preco: p.preco_venda_sugerido ? String(p.preco_venda_sugerido).replace('.', ',') : '',
      foto_url: p.foto_url || '',
    });
    setMsg(null);
    if (topoForm.current) topoForm.current.scrollIntoView({ behavior: 'smooth' });
  }

  function cancelar() {
    setEditandoId(null);
    setForm(VAZIO);
    setMsg(null);
  }

  async function salvar(ev) {
    ev.preventDefault();
    setOcupado(true);
    setMsg(null);
    try {
      if (editandoId) {
        await api(`/api/admin/produtos/${editandoId}`, { method: 'PATCH', body: form });
        setMsg({ tipo: 'ok', texto: 'Modelo atualizado.' });
      } else {
        await api('/api/admin/produtos', { method: 'POST', body: form });
        setMsg({ tipo: 'ok', texto: 'Modelo cadastrado e já está na loja!' });
      }
      setEditandoId(null);
      setForm(VAZIO);
      await carregar();
    } catch (e) {
      setMsg({ tipo: 'er', texto: e.message });
    }
    setOcupado(false);
  }

  async function alternar(p) {
    const publicar = !(p.publicado && p.ativo);
    try {
      await api(`/api/admin/produtos/${p.id}`, { method: 'PATCH', body: { publicado: publicar } });
      await carregar();
    } catch (e) {
      setMsg({ tipo: 'er', texto: e.message });
    }
  }

  const margem = num(form.preco) - num(form.custo);

  return (
    <main className="ea">
      <Head>
        <title>Painel de calçados</title>
        <meta name="robots" content="noindex,nofollow" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <style>{ADMIN_CSS}</style>
        <style>{`
          .pc-thumb{width:56px;height:56px;border-radius:8px;object-fit:cover;background:var(--bd);flex:none;display:flex;align-items:center;justify-content:center;font-size:24px}
          .pc-foto{width:100%;max-width:240px;aspect-ratio:1/1;border:2px dashed var(--bd);border-radius:12px;display:flex;align-items:center;justify-content:center;overflow:hidden;background:var(--bg);font-size:48px}
          .pc-foto img{width:100%;height:100%;object-fit:cover}
          .pc-info{min-width:0;flex:1}
          .pc-info b{display:block;overflow:hidden;text-overflow:ellipsis}
          .pc-acoes{display:flex;gap:8px;flex-wrap:wrap}
          .pc-acoes .ea-btn{padding:7px 12px;font-size:14px}
        `}</style>
      </Head>
      <div className="ea-in">
        <AdminNav />
        <div className="ea-row" style={{ justifyContent: 'space-between' }}>
          <div>
            <h1>Painel de calçados</h1>
            <div className="ea-mu">Cadastre os modelos que aparecem em /calcados</div>
          </div>
          <div className="ea-row">
            <Link href="/calcados" className="ea-btn ea-btn2">Ver a loja</Link>
            {fase === 'pronto' && <button className="ea-btn ea-btn2" onClick={sair}>Sair</button>}
          </div>
        </div>

        {msg && <div className={`ea-msg ${msg.tipo}`}>{msg.texto}</div>}

        {fase === 'carregando' && <p className="ea-mu" style={{ marginTop: 20 }}>Carregando…</p>}

        {fase === 'login' && (
          <form className="ea-card" onSubmit={entrar}>
            <h2>Entrar</h2>
            <label>Senha do painel</label>
            <input type="password" value={senha} onChange={(e) => setSenha(e.target.value)} autoFocus required />
            <div style={{ marginTop: 12 }}>
              <button className="ea-btn" disabled={ocupado}>{ocupado ? 'Entrando…' : 'Entrar'}</button>
            </div>
          </form>
        )}

        {fase === 'pronto' && (
          <>
            <form className="ea-card" onSubmit={salvar} ref={topoForm}>
              <h2>{editandoId ? 'Editar modelo' : 'Novo modelo'}</h2>

              <label>Foto</label>
              <div className="ea-row" style={{ alignItems: 'flex-start' }}>
                <div className="pc-foto">{form.foto_url ? <img src={form.foto_url} alt="" /> : '📷'}</div>
                <div style={{ flex: 1, minWidth: 200 }}>
                  <label className="ea-btn ea-btn2" style={{ display: 'inline-block', color: 'var(--ac)', fontSize: 14, marginBottom: 8 }}>
                    {enviandoFoto ? 'Enviando…' : form.foto_url ? 'Trocar foto' : 'Tirar ou escolher foto'}
                    <input type="file" accept="image/*" onChange={escolherFoto} disabled={enviandoFoto} style={{ display: 'none' }} />
                  </label>
                  <label>ou cole o endereço (https://…) de uma foto</label>
                  <input value={form.foto_url} onChange={mudar('foto_url')} placeholder="https://…" inputMode="url" />
                </div>
              </div>

              <div className="ea-grid" style={{ marginTop: 14 }}>
                <div>
                  <label>Nome do modelo *</label>
                  <input value={form.titulo} onChange={mudar('titulo')} required placeholder="Sapatênis Couro Marrom" />
                </div>
                <div>
                  <label>Categoria</label>
                  <input value={form.categoria} onChange={mudar('categoria')} list="cats" placeholder="Sapatênis, Bolsas, Cintos…" />
                  <datalist id="cats">{categorias.map((c) => <option key={c} value={c} />)}</datalist>
                </div>
                <div>
                  <label>Material</label>
                  <input value={form.material} onChange={mudar('material')} placeholder="Couro legítimo" />
                </div>
                <div>
                  <label>Números disponíveis</label>
                  <input value={form.tamanhos} onChange={mudar('tamanhos')} placeholder="38 ao 44  ou  35, 36, 37" />
                </div>
                <div>
                  <label>Preço de venda ao cliente (R$) *</label>
                  <input value={form.preco} onChange={mudar('preco')} required inputMode="decimal" placeholder="149,90" />
                </div>
                <div>
                  <label>Custo na fábrica (R$) — só você vê</label>
                  <input value={form.custo} onChange={mudar('custo')} inputMode="decimal" placeholder="89,00" />
                </div>
              </div>

              {num(form.preco) > 0 && num(form.custo) > 0 && (
                <div className="ea-msg" style={{ marginTop: 12 }}>
                  Diferença bruta: <b>{brl(margem)}</b> por par (antes da taxa do Mercado Pago e do frete).
                </div>
              )}

              <div style={{ marginTop: 12 }}>
                <label>Descrição</label>
                <textarea value={form.descricao} onChange={mudar('descricao')} placeholder="Detalhes que ajudam a vender: solado, fechamento, cores…" />
              </div>

              <div className="ea-row" style={{ marginTop: 14 }}>
                <button className="ea-btn ea-btn-ok" disabled={ocupado || enviandoFoto}>
                  {ocupado ? 'Salvando…' : editandoId ? 'Salvar alterações' : 'Cadastrar na loja'}
                </button>
                {editandoId && <button type="button" className="ea-btn ea-btn2" onClick={cancelar}>Cancelar</button>}
              </div>
            </form>

            <div className="ea-card">
              <div className="ea-row" style={{ justifyContent: 'space-between' }}>
                <h2 style={{ margin: 0 }}>Modelos ({lista.length})</h2>
                <input style={{ maxWidth: 240 }} placeholder="Buscar…" value={busca} onChange={(e) => setBusca(e.target.value)} />
              </div>
              {visiveis.length === 0 && <p className="ea-mu" style={{ marginTop: 12 }}>Nenhum modelo ainda.</p>}
              {visiveis.map((p) => {
                const noAr = p.publicado && p.ativo && Number(p.preco_venda_sugerido) > 0;
                return (
                  <div key={p.id} className="ea-item">
                    <div className="ea-row" style={{ flexWrap: 'nowrap', flex: 1, minWidth: 0 }}>
                      {p.foto_url ? <img className="pc-thumb" src={p.foto_url} alt="" /> : <div className="pc-thumb">👟</div>}
                      <div className="pc-info">
                        <b>{p.titulo_publico || p.nome}</b>
                        <span className="ea-mu">
                          {brl(p.preco_venda_sugerido)}{p.categoria ? ` · ${p.categoria}` : ''}
                        </span>{' '}
                        {noAr ? <span className="ea-tag ok">na loja</span> : <span className="ea-tag am">fora da loja</span>}
                        {Number(p.preco_venda_sugerido) <= 0 && <span className="ea-tag er">sem preço de venda</span>}
                        {p.de_operador && !noAr && <span className="ea-tag am">enviado por operador: revisar</span>}
                      </div>
                    </div>
                    <div className="pc-acoes">
                      <button className="ea-btn ea-btn2" onClick={() => editar(p)}>Editar</button>
                      <button className="ea-btn ea-btn2" onClick={() => alternar(p)}>{p.publicado && p.ativo ? 'Ocultar' : 'Publicar'}</button>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </main>
  );
}
