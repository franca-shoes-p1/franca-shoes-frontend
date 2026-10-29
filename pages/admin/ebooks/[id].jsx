import { useEffect, useState, useCallback } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { api, STATUS_EBOOK, STATUS_CAP, ADMIN_CSS } from '../../../lib/adminClient';
import AdminNav from '../../../lib/AdminNav';

const CAMPOS = [
  ['titulo', 'Título'],
  ['subtitulo', 'Subtítulo'],
  ['slug', 'Endereço (slug) — igreja.eco.br/ebooks/…'],
  ['preco', 'Preço (R$)'],
  ['link_pagamento', 'Link de pagamento (https://…) — opcional'],
  ['capa_url', 'Endereço da capa (https://…)'],
  ['arquivo_pdf_url', 'Link privado do PDF (só para você entregar)'],
  ['arquivo_epub_url', 'Link privado do EPUB (só para você entregar)'],
  ['projeto_slug', 'Ramo do portal (ex.: escola-ovinocultura)'],
];

function formDe(e) {
  const f = Object.fromEntries(CAMPOS.map(([k]) => [k, e[k] ?? '']));
  f.descricao_venda = e.descricao_venda ?? '';
  return f;
}

function Capitulo({ cap, onMudou }) {
  const [aberto, setAberto] = useState(false);
  const [texto, setTexto] = useState(cap.texto_md || '');
  const [ocupado, setOcupado] = useState(false);
  const [erro, setErro] = useState('');

  useEffect(() => {
    setTexto(cap.texto_md || '');
  }, [cap.texto_md]);

  const verificar = (texto.match(/\[VERIFICAR:/g) || []).length;
  const classe = cap.status === 'aprovado' ? 'ok' : cap.status === 'reescrever' ? 'er' : cap.status === 'escrito' ? 'am' : '';

  async function enviar(corpo) {
    setOcupado(true);
    setErro('');
    try {
      const d = await api(`/api/admin/chapters/${cap.id}`, { method: 'PATCH', body: corpo });
      onMudou(d.capitulo);
    } catch (e) {
      setErro(e.message);
    }
    setOcupado(false);
  }

  return (
    <div className="ea-item" style={{ display: 'block' }}>
      <div className="ea-row" style={{ justifyContent: 'space-between' }}>
        <div>
          <b>
            {cap.ordem}. {cap.titulo}
          </b>
          {verificar > 0 && <span className="ea-tag am" style={{ marginLeft: 8 }}>{verificar} trecho(s) para verificar</span>}
        </div>
        <div className="ea-row">
          <span className={`ea-tag ${classe}`}>{STATUS_CAP[cap.status] || cap.status}</span>
          <button className="ea-btn ea-btn2" onClick={() => setAberto(!aberto)}>
            {aberto ? 'Fechar' : 'Ler / editar'}
          </button>
        </div>
      </div>
      {aberto && (
        <div style={{ marginTop: 10 }}>
          {!cap.texto_md && <p className="ea-mu">Este capítulo ainda não foi escrito.</p>}
          <textarea style={{ minHeight: 360 }} value={texto} onChange={(e) => setTexto(e.target.value)} />
          <div className="ea-row" style={{ marginTop: 8 }}>
            <button className="ea-btn ea-btn2" disabled={ocupado || texto === (cap.texto_md || '')} onClick={() => enviar({ texto_md: texto })}>
              Salvar edição
            </button>
            <button className="ea-btn ea-btn-ok" disabled={ocupado || !cap.texto_md || verificar > 0 || texto !== (cap.texto_md || '')} onClick={() => enviar({ status: 'aprovado' })}>
              Aprovar
            </button>
            <button className="ea-btn ea-btn-er" disabled={ocupado} onClick={() => enviar({ status: 'reescrever' })}>
              Pedir reescrita
            </button>
          </div>
          {verificar > 0 && <p className="ea-mu">Confira cada trecho marcado com [VERIFICAR: …], corrija e apague a marcação para poder aprovar.</p>}
          {erro && <div className="ea-msg er">{erro}</div>}
        </div>
      )}
    </div>
  );
}

export default function AdminEbook() {
  const router = useRouter();
  const { id } = router.query;
  const [ebook, setEbook] = useState(null);
  const [form, setForm] = useState({});
  const [msg, setMsg] = useState(null);
  const [ocupado, setOcupado] = useState(false);

  const carregar = useCallback(async () => {
    if (!id) return;
    try {
      const d = await api(`/api/admin/ebooks/${id}`);
      setEbook(d.ebook);
      setForm((f) => (Object.keys(f).length ? f : formDe(d.ebook)));
    } catch (e) {
      if (e.status === 401) router.push('/admin/ebooks');
      else setMsg({ tipo: 'er', texto: e.message });
    }
  }, [id, router]);

  useEffect(() => {
    carregar();
  }, [carregar]);

  // Enquanto o n8n escreve, recarrega sozinho (sem apagar o que você digitou nos campos)
  useEffect(() => {
    if (!ebook || ebook.status !== 'escrevendo') return undefined;
    const t = setInterval(async () => {
      try {
        const d = await api(`/api/admin/ebooks/${id}`);
        setEbook(d.ebook);
        // terminou de escrever: traz os campos gerados (slug, texto de venda, preço)
        if (d.ebook.status !== 'escrevendo') setForm(formDe(d.ebook));
      } catch (e) {
        /* tenta de novo no próximo ciclo */
      }
    }, 15000);
    return () => clearInterval(t);
  }, [ebook, id]);

  function atualizarCapitulo(novo) {
    setEbook((e) => ({
      ...e,
      publicado: novo.status === 'aprovado' ? e.publicado : false,
      ebook_chapters: e.ebook_chapters.map((c) => (c.id === novo.id ? novo : c)),
    }));
  }

  async function salvar() {
    setOcupado(true);
    setMsg(null);
    try {
      const d = await api(`/api/admin/ebooks/${id}`, { method: 'PATCH', body: form });
      setEbook((e) => ({ ...e, ...d.ebook }));
      setMsg({ tipo: 'ok', texto: 'Dados salvos.' });
    } catch (e) {
      setMsg({ tipo: 'er', texto: e.message });
    }
    setOcupado(false);
  }

  async function publicar(valor) {
    setOcupado(true);
    setMsg(null);
    try {
      const d = await api(`/api/admin/ebooks/${id}`, { method: 'PATCH', body: { ...form, publicado: valor } });
      setEbook((e) => ({ ...e, ...d.ebook }));
      setMsg({ tipo: 'ok', texto: valor ? 'Publicado na loja!' : 'Tirado da loja.' });
    } catch (e) {
      setMsg({ tipo: 'er', texto: e.message });
    }
    setOcupado(false);
  }

  async function reescrever() {
    setOcupado(true);
    setMsg(null);
    try {
      await api(`/api/admin/ebooks/${id}`, { method: 'POST', body: { acao: 'reescrever' } });
      setMsg({ tipo: 'ok', texto: 'Pedido enviado ao n8n. Os capítulos marcados estão sendo reescritos.' });
      await carregar();
    } catch (e) {
      setMsg({ tipo: 'er', texto: e.message });
    }
    setOcupado(false);
  }

  const mudar = (campo) => (ev) => setForm({ ...form, [campo]: ev.target.value });
  const caps = (ebook && ebook.ebook_chapters) || [];
  const marcados = caps.filter((c) => c.status === 'reescrever').length;
  const aprovados = caps.filter((c) => c.status === 'aprovado').length;

  return (
    <main className="ea">
      <Head>
        <title>{ebook ? ebook.titulo : 'E-book'} · Painel</title>
        <meta name="robots" content="noindex,nofollow" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <style>{ADMIN_CSS}</style>
      <div className="ea-in">
        <AdminNav />
        <p>
          <a href="/admin/ebooks">← Todos os e-books</a>
        </p>
        {!ebook && !msg && <p className="ea-mu">Carregando…</p>}
        {msg && <div className={`ea-msg ${msg.tipo}`}>{msg.texto}</div>}

        {ebook && (
          <>
            <h1>{ebook.titulo}</h1>
            <div className="ea-row">
              <span className="ea-tag">{STATUS_EBOOK[ebook.status] || ebook.status}</span>
              <span className="ea-mu">
                capítulos aprovados: {aprovados}/{caps.length}
              </span>
              {ebook.publicado && ebook.slug && (
                <a href={`/ebooks/${ebook.slug}`} target="_blank" rel="noopener noreferrer">
                  Ver na loja
                </a>
              )}
            </div>
            {ebook.status === 'erro' && <div className="ea-msg er">Algo falhou na geração: {ebook.erro_msg || 'sem detalhes'}. Veja a execução no n8n.</div>}
            {ebook.status === 'escrevendo' && <div className="ea-msg">O n8n está escrevendo. Esta página atualiza sozinha.</div>}

            <div className="ea-card">
              <h2>Dados de venda</h2>
              <div className="ea-grid">
                {CAMPOS.map(([k, rotulo]) => (
                  <div key={k}>
                    <label htmlFor={k}>{rotulo}</label>
                    <input id={k} value={form[k] ?? ''} onChange={mudar(k)} />
                  </div>
                ))}
              </div>
              <div style={{ marginTop: 12 }}>
                <label htmlFor="descricao_venda">Texto da página de venda</label>
                <textarea id="descricao_venda" value={form.descricao_venda ?? ''} onChange={mudar('descricao_venda')} />
              </div>
              <div className="ea-row" style={{ marginTop: 12 }}>
                <button className="ea-btn" disabled={ocupado} onClick={salvar}>
                  Salvar dados
                </button>
                {!ebook.publicado && (
                  <button className="ea-btn ea-btn-ok" disabled={ocupado || ebook.status === 'escrevendo'} onClick={() => publicar(true)}>
                    Publicar na loja
                  </button>
                )}
                {ebook.publicado && (
                  <button className="ea-btn ea-btn-er" disabled={ocupado} onClick={() => publicar(false)}>
                    Tirar da loja
                  </button>
                )}
              </div>
              <p className="ea-mu">Para publicar: todos os capítulos aprovados, endereço (slug) e preço preenchidos.</p>
            </div>

            <div className="ea-card">
              <div className="ea-row" style={{ justifyContent: 'space-between' }}>
                <h2>Capítulos</h2>
                {marcados > 0 && (
                  <button className="ea-btn" disabled={ocupado || ebook.status === 'escrevendo'} onClick={reescrever}>
                    Reescrever {marcados} marcado(s)
                  </button>
                )}
              </div>
              {caps.length === 0 && <p className="ea-mu">Os capítulos aparecem aqui assim que o n8n criar o sumário.</p>}
              {caps.map((c) => (
                <Capitulo key={c.id} cap={c} onMudou={atualizarCapitulo} />
              ))}
            </div>
          </>
        )}
      </div>
    </main>
  );
}
