import { useEffect, useState, useCallback } from 'react';
import Head from 'next/head';
import { api, STATUS_EBOOK, ADMIN_CSS } from '../../../lib/adminClient';

export default function AdminEbooks() {
  const [fase, setFase] = useState('carregando'); // carregando | login | pronto
  const [lista, setLista] = useState([]);
  const [msg, setMsg] = useState(null); // { tipo: 'ok' | 'er', texto }
  const [senha, setSenha] = useState('');
  const [ocupado, setOcupado] = useState(false);
  const [form, setForm] = useState({ titulo: '', nicho: '', publico: '', num_capitulos: 8 });

  const carregar = useCallback(async () => {
    try {
      const d = await api('/api/admin/ebooks');
      setLista(d.ebooks || []);
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

  // Atualiza sozinho enquanto algum e-book está sendo escrito
  useEffect(() => {
    if (fase !== 'pronto' || !lista.some((e) => e.status === 'escrevendo')) return undefined;
    const t = setInterval(carregar, 15000);
    return () => clearInterval(t);
  }, [fase, lista, carregar]);

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

  async function criar(ev) {
    ev.preventDefault();
    setOcupado(true);
    setMsg(null);
    try {
      await api('/api/admin/ebooks', { method: 'POST', body: { ...form, num_capitulos: Number(form.num_capitulos) } });
      setMsg({ tipo: 'ok', texto: 'Pedido enviado! O n8n está escrevendo. Isso leva alguns minutos; a lista atualiza sozinha.' });
      setForm({ titulo: '', nicho: '', publico: '', num_capitulos: 8 });
      await carregar();
    } catch (e) {
      setMsg({ tipo: 'er', texto: e.message });
    }
    setOcupado(false);
  }

  const mudar = (campo) => (ev) => setForm({ ...form, [campo]: ev.target.value });

  return (
    <main className="ea">
      <Head>
        <title>Painel de e-books</title>
        <meta name="robots" content="noindex,nofollow" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <style>{ADMIN_CSS}</style>
      <div className="ea-in">
        <div className="ea-row" style={{ justifyContent: 'space-between' }}>
          <div>
            <h1>Painel de e-books</h1>
            <div className="ea-mu">Crie, revise e publique seus e-books.</div>
          </div>
          {fase === 'pronto' && (
            <button className="ea-btn ea-btn2" onClick={sair}>
              Sair
            </button>
          )}
        </div>

        {msg && <div className={`ea-msg ${msg.tipo}`}>{msg.texto}</div>}

        {fase === 'carregando' && <p className="ea-mu">Carregando…</p>}

        {fase === 'login' && (
          <form className="ea-card" onSubmit={entrar} style={{ maxWidth: 420 }}>
            <h2>Entrar</h2>
            <label htmlFor="senha">Senha do painel</label>
            <input id="senha" type="password" value={senha} onChange={(e) => setSenha(e.target.value)} autoComplete="current-password" />
            <p>
              <button className="ea-btn" disabled={ocupado || !senha}>
                {ocupado ? 'Entrando…' : 'Entrar'}
              </button>
            </p>
          </form>
        )}

        {fase === 'pronto' && (
          <>
            <form className="ea-card" onSubmit={criar}>
              <h2>Novo e-book</h2>
              <div className="ea-grid">
                <div>
                  <label htmlFor="titulo">Título (tema do e-book)</label>
                  <input id="titulo" value={form.titulo} onChange={mudar('titulo')} placeholder="Ex.: Ovinocultura de corte para iniciantes" />
                </div>
                <div>
                  <label htmlFor="nicho">Nicho</label>
                  <input id="nicho" value={form.nicho} onChange={mudar('nicho')} placeholder="Ex.: ovinocultura" />
                </div>
                <div>
                  <label htmlFor="publico">Para quem é</label>
                  <input id="publico" value={form.publico} onChange={mudar('publico')} placeholder="Ex.: pequenos produtores rurais" />
                </div>
                <div>
                  <label htmlFor="caps">Capítulos (3 a 20)</label>
                  <input id="caps" type="number" min="3" max="20" value={form.num_capitulos} onChange={mudar('num_capitulos')} />
                </div>
              </div>
              <p>
                <button className="ea-btn" disabled={ocupado || !form.titulo || !form.nicho || !form.publico}>
                  {ocupado ? 'Enviando…' : 'Gerar e-book automaticamente'}
                </button>
              </p>
            </form>

            <div className="ea-card">
              <h2>Seus e-books</h2>
              {lista.length === 0 && <p className="ea-mu">Nenhum e-book ainda. Crie o primeiro acima.</p>}
              {lista.map((e) => {
                const caps = e.ebook_chapters || [];
                const aprovados = caps.filter((c) => c.status === 'aprovado').length;
                const classe = e.status === 'publicado' ? 'ok' : e.status === 'erro' ? 'er' : e.status === 'revisao_humana' ? 'am' : '';
                return (
                  <div className="ea-item" key={e.id}>
                    <div>
                      <b>{e.titulo}</b>
                      <div className="ea-mu">
                        {e.nicho || '—'} · capítulos aprovados: {aprovados}/{caps.length}
                        {e.preco != null ? ` · R$ ${Number(e.preco).toFixed(2).replace('.', ',')}` : ''}
                      </div>
                    </div>
                    <div className="ea-row">
                      <span className={`ea-tag ${classe}`}>{STATUS_EBOOK[e.status] || e.status}</span>
                      <a href={`/admin/ebooks/${e.id}`} className="ea-btn ea-btn2">
                        Abrir
                      </a>
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
