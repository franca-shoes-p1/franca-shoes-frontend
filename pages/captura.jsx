import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import Head from 'next/head';
import s from '../styles/captura.module.css';
import {
  novoId, reduzirFoto, enfileirar, filaListar, filaApagar, fotosPendentes,
  sincronizar, tentarNovamente, carregarFornecedores,
} from '../lib/capturaCliente';

const TIPOS = [['loja', 'Loja'], ['fabrica', 'Fábrica'], ['camelo', 'Camelô']];
const CHAVE_FORN = 'captura_fornecedor_atual';

// Um bloco de fotos: "Tirar agora" (câmera) ou "Escolher da galeria" (várias de uma vez).
function BlocoFotos({ titulo, dica, fotos, ocupado, onAdicionar, onRemover }) {
  const camera = useRef(null);
  const galeria = useRef(null);
  const escolheu = (e) => {
    const arquivos = Array.from(e.target.files || []);
    e.target.value = '';
    if (arquivos.length) onAdicionar(arquivos);
  };
  return (
    <section className={s.bloco}>
      <h2 className={s.blocoTitulo}>{titulo}</h2>
      {dica && <p className={s.dica}>{dica}</p>}
      <div className={s.doisBotoes}>
        <button type="button" className={s.btnGrande} onClick={() => camera.current.click()} disabled={ocupado}>📷 Tirar agora</button>
        <button type="button" className={s.btnGrandeClaro} onClick={() => galeria.current.click()} disabled={ocupado}>🖼️ Escolher da galeria</button>
      </div>
      <input ref={camera} type="file" accept="image/*" capture="environment" hidden onChange={escolheu} />
      <input ref={galeria} type="file" accept="image/*" multiple hidden onChange={escolheu} />
      {fotos.length > 0 && (
        <div className={s.miniaturas}>
          {fotos.map((f) => (
            <div key={f.id} className={s.mini}>
              <img src={f.preview} alt="" />
              <button type="button" aria-label="Remover foto" onClick={() => onRemover(f.id)}>✕</button>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

export default function Captura() {
  const [auth, setAuth] = useState('carregando'); // carregando | pin | ok
  const [pin, setPin] = useState('');
  const [erroPin, setErroPin] = useState('');
  const [naoConfig, setNaoConfig] = useState(false);

  const [tela, setTela] = useState('fornecedor'); // fornecedor | novo | produto
  const [fornecedores, setFornecedores] = useState([]);
  const [pendentesForn, setPendentesForn] = useState([]);
  const [busca, setBusca] = useState('');
  const [atualId, setAtualId] = useState(null);

  const [fProduto, setFProduto] = useState([]);
  const [fEtiqueta, setFEtiqueta] = useState([]);
  const [fPonto, setFPonto] = useState([]);
  const [novo, setNovo] = useState({ apelido: '', nome: '', tipo: 'loja', whatsapp: '', local: 'endereco', endereco: '', dias_horarios: '' });

  const [ocupado, setOcupado] = useState(false);
  const [aviso, setAviso] = useState('');
  const [fotosFila, setFotosFila] = useState(0);
  const [comErro, setComErro] = useState(0);
  const [online, setOnline] = useState(true);
  const [instalar, setInstalar] = useState(null);

  // ---------- fila ----------
  const atualizarFila = useCallback(async () => {
    try {
      const fila = await filaListar();
      setFotosFila(fotosPendentes(fila));
      setComErro(fila.filter((i) => i.erro).length);
      setPendentesForn(fila.filter((i) => i.tipo === 'fornecedor').map((i) => ({ id: i.dados.id, apelido: i.dados.apelido, nome: i.dados.nome, tipo: i.dados.tipo, pendente: true })));
    } catch { /* IndexedDB indisponível */ }
  }, []);

  const carregarLista = useCallback(async () => {
    const r = await carregarFornecedores();
    if (r.login) { setAuth('pin'); return; }
    setFornecedores(r.lista);
    setOnline(r.online !== false);
  }, []);

  const enviarFila = useCallback(async () => {
    const r = await sincronizar();
    if (r.parou === 'login') setAuth('pin');
    if (r.enviados > 0) carregarLista();
    atualizarFila();
  }, [atualizarFila, carregarLista]);

  // ---------- início ----------
  useEffect(() => {
    if ('serviceWorker' in navigator) navigator.serviceWorker.register('/captura-sw.js', { scope: '/captura' }).catch(() => {});
    const antes = (e) => { e.preventDefault(); setInstalar(e); };
    window.addEventListener('beforeinstallprompt', antes);
    setOnline(navigator.onLine);
    setAtualId(localStorage.getItem(CHAVE_FORN));
    (async () => {
      try {
        const r = await fetch('/api/captura/sessao', { credentials: 'same-origin' });
        const j = await r.json();
        setNaoConfig(j.configurado === false);
        setAuth(j.ok ? 'ok' : 'pin');
      } catch {
        setAuth('ok'); // sem sinal: deixa usar com o que já está no celular; o envio confere o PIN depois
      }
    })();
    return () => window.removeEventListener('beforeinstallprompt', antes);
  }, []);

  useEffect(() => {
    if (auth !== 'ok') return undefined;
    carregarLista();
    atualizarFila();
    enviarFila();
    const voltou = () => { setOnline(true); enviarFila(); };
    const caiu = () => setOnline(false);
    window.addEventListener('online', voltou);
    window.addEventListener('offline', caiu);
    const t = setInterval(() => { if (navigator.onLine) enviarFila(); }, 20000);
    return () => { window.removeEventListener('online', voltou); window.removeEventListener('offline', caiu); clearInterval(t); };
  }, [auth, carregarLista, atualizarFila, enviarFila]);

  const todos = useMemo(() => {
    const ids = new Set(fornecedores.map((f) => f.id));
    return [...pendentesForn.filter((f) => !ids.has(f.id)), ...fornecedores];
  }, [fornecedores, pendentesForn]);
  const atual = todos.find((f) => f.id === atualId) || null;

  useEffect(() => { if (auth === 'ok' && atual && tela === 'fornecedor' && !busca) setTela('produto'); /* eslint-disable-next-line */ }, [auth, !!atual]);

  const filtrados = useMemo(() => {
    const q = busca.trim().toLowerCase();
    if (!q) return todos;
    return todos.filter((f) => `${f.apelido} ${f.nome || ''}`.toLowerCase().includes(q));
  }, [todos, busca]);

  // ---------- PIN ----------
  async function entrar(e) {
    e.preventDefault();
    setErroPin('');
    try {
      const r = await fetch('/api/captura/login', { method: 'POST', credentials: 'same-origin', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ pin }) });
      const j = await r.json();
      if (!r.ok) { setErroPin(j.erro || 'Não foi possível entrar.'); return; }
      setPin('');
      setAuth('ok');
    } catch { setErroPin('Sem sinal. Tente de novo.'); }
  }
  async function sair() {
    await fetch('/api/captura/sair', { method: 'POST', credentials: 'same-origin' }).catch(() => {});
    setAuth('pin');
  }

  // ---------- fotos ----------
  const adicionar = (setLista) => async (arquivos) => {
    setOcupado(true);
    setAviso('');
    try {
      const novas = [];
      for (const a of arquivos) {
        const blob = await reduzirFoto(a);
        novas.push({ id: novoId(), blob, preview: URL.createObjectURL(blob) });
      }
      setLista((l) => [...l, ...novas]);
    } catch { setAviso('Não consegui ler uma das fotos. Tente de novo.'); }
    setOcupado(false);
  };
  const remover = (setLista) => (id) => setLista((l) => {
    const f = l.find((x) => x.id === id);
    if (f) URL.revokeObjectURL(f.preview);
    return l.filter((x) => x.id !== id);
  });
  const limpar = (lista, setLista) => { lista.forEach((f) => URL.revokeObjectURL(f.preview)); setLista([]); };

  // ---------- fornecedor ----------
  function escolher(f) {
    setAtualId(f.id);
    localStorage.setItem(CHAVE_FORN, f.id);
    setBusca('');
    setAviso('');
    setTela('produto');
  }
  async function salvarNovo(e) {
    e.preventDefault();
    if (novo.apelido.trim().length < 2) { setAviso('Digite o apelido do fornecedor.'); return; }
    setOcupado(true);
    const id = novoId();
    const dados = {
      id, apelido: novo.apelido.trim(), nome: novo.nome.trim(), tipo: novo.tipo, whatsapp: novo.whatsapp.trim(),
      endereco: novo.local === 'endereco' ? novo.endereco.trim() : '',
      ponto_referencia: novo.local === 'ponto' ? novo.endereco.trim() : '',
      dias_horarios: novo.dias_horarios.trim(),
    };
    try {
      await enfileirar('fornecedor', dados, { ponto: fPonto.map((f) => f.blob) });
      limpar(fPonto, setFPonto);
      setNovo({ apelido: '', nome: '', tipo: 'loja', whatsapp: '', local: 'endereco', endereco: '', dias_horarios: '' });
      await atualizarFila();
      escolher({ id });
      enviarFila();
    } catch { setAviso('Não consegui guardar no celular. Tente de novo.'); }
    setOcupado(false);
  }

  // ---------- enviar produto ----------
  async function enviar() {
    if (!atual) { setAviso('Escolha o fornecedor primeiro.'); setTela('fornecedor'); return; }
    if (!fProduto.length) { setAviso('Falta a foto do produto.'); return; }
    if (!fEtiqueta.length) { setAviso('Falta a foto da etiqueta/preço.'); return; }
    if (fProduto.length !== fEtiqueta.length) { setAviso(`Você tem ${fProduto.length} foto(s) de produto e ${fEtiqueta.length} de etiqueta. Cada produto precisa da sua etiqueta, na mesma ordem.`); return; }
    setOcupado(true);
    try {
      await enfileirar('captura', { ids: fProduto.map(() => novoId()), fornecedor_id: atual.id }, { produto: fProduto.map((f) => f.blob), etiqueta: fEtiqueta.map((f) => f.blob) });
      limpar(fProduto, setFProduto);
      limpar(fEtiqueta, setFEtiqueta);
      setAviso('✅ Guardado! Pode fotografar o próximo produto.');
      await atualizarFila();
      window.scrollTo({ top: 0, behavior: 'smooth' });
      enviarFila();
    } catch { setAviso('Não consegui guardar no celular. Tente de novo.'); }
    setOcupado(false);
  }

  async function descartarComErro() {
    if (!window.confirm('Apagar do celular os envios que deram problema? As fotos deles serão perdidas.')) return;
    for (const i of await filaListar()) if (i.erro) await filaApagar(i.id);
    atualizarFila();
  }
  async function repetirComErro() { await tentarNovamente(); await enviarFila(); }

  // ---------- telas ----------
  const cabeca = (
    <Head>
      <title>Captura — /sapatos</title>
      <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
      <meta name="robots" content="noindex, nofollow" />
      <meta name="theme-color" content="#0b6b3a" />
      <link rel="manifest" href="/captura/manifest.webmanifest" />
      <link rel="apple-touch-icon" href="/captura/icon-192.png" />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="mobile-web-app-capable" content="yes" />
      <style>{'#__next > [role="note"]{display:none}'}</style>
    </Head>
  );

  if (auth === 'carregando') return <main className={s.pagina}>{cabeca}<p className={s.centro}>Carregando…</p></main>;

  if (auth === 'pin') {
    return (
      <main className={s.pagina}>
        {cabeca}
        <form className={s.pinCaixa} onSubmit={entrar}>
          <h1>📸 Captura</h1>
          <p>Digite o PIN para continuar.</p>
          <input className={s.campo} type="password" inputMode="numeric" autoComplete="current-password" placeholder="PIN" value={pin} onChange={(e) => setPin(e.target.value)} autoFocus />
          {erroPin && <p className={s.erro}>{erroPin}</p>}
          {naoConfig && <p className={s.erro}>O servidor ainda não tem o CAPTURA_PIN configurado.</p>}
          <button className={s.btnGrande} type="submit" disabled={!pin}>Entrar</button>
          {fotosFila > 0 && <p className={s.dica}>{fotosFila} fotos aguardando envio (serão enviadas depois do PIN).</p>}
        </form>
      </main>
    );
  }

  return (
    <main className={s.pagina}>
      {cabeca}
      <header className={s.topo}>
        <strong>📸 Captura</strong>
        <button type="button" className={s.linkBtn} onClick={sair}>Sair</button>
      </header>

      {!online && <div className={s.faixaOff}>Sem sinal — tudo fica guardado no celular.</div>}
      {fotosFila > 0 && <div className={s.faixaFila}>⏳ {fotosFila} {fotosFila === 1 ? 'foto aguardando' : 'fotos aguardando'} envio</div>}
      {comErro > 0 && (
        <div className={s.faixaErro}>
          {comErro} {comErro === 1 ? 'envio deu' : 'envios deram'} problema.
          <button type="button" onClick={repetirComErro}>Tentar de novo</button>
          <button type="button" onClick={descartarComErro}>Apagar</button>
        </div>
      )}
      {instalar && <button type="button" className={s.btnInstalar} onClick={async () => { instalar.prompt(); await instalar.userChoice; setInstalar(null); }}>📲 Instalar como app</button>}
      {aviso && <p className={aviso.startsWith('✅') ? s.ok : s.erro}>{aviso}</p>}

      {tela === 'fornecedor' && (
        <section>
          <h1 className={s.titulo}>Qual fornecedor?</h1>
          <input className={s.campo} type="search" placeholder="🔍 Buscar fornecedor" value={busca} onChange={(e) => setBusca(e.target.value)} />
          <button type="button" className={s.btnGrande} onClick={() => { setAviso(''); setTela('novo'); }}>➕ Novo fornecedor</button>
          <ul className={s.lista}>
            {filtrados.map((f) => (
              <li key={f.id}>
                <button type="button" className={s.item} onClick={() => escolher(f)}>
                  <b>{f.apelido}</b>
                  <span>{[f.nome, f.tipo, f.pendente ? 'aguardando envio' : ''].filter(Boolean).join(' · ')}</span>
                </button>
              </li>
            ))}
            {!filtrados.length && <li className={s.vazio}>{todos.length ? 'Nenhum fornecedor com esse nome.' : 'Nenhum fornecedor ainda. Toque em “Novo fornecedor”.'}</li>}
          </ul>
          {atual && <button type="button" className={s.btnGrandeClaro} onClick={() => setTela('produto')}>← Voltar para {atual.apelido}</button>}
        </section>
      )}

      {tela === 'novo' && (
        <form onSubmit={salvarNovo}>
          <h1 className={s.titulo}>Novo fornecedor</h1>
          <label className={s.rotulo}>Apelido *<input className={s.campo} value={novo.apelido} onChange={(e) => setNovo({ ...novo, apelido: e.target.value })} placeholder="Ex.: Dona Maria da banca 12" required /></label>
          <label className={s.rotulo}>Nome<input className={s.campo} value={novo.nome} onChange={(e) => setNovo({ ...novo, nome: e.target.value })} /></label>
          <div className={s.rotulo}>Tipo
            <div className={s.tipos}>
              {TIPOS.map(([v, nome]) => (
                <button key={v} type="button" className={novo.tipo === v ? s.tipoOn : s.tipo} onClick={() => setNovo({ ...novo, tipo: v })}>{nome}</button>
              ))}
            </div>
          </div>
          <label className={s.rotulo}>WhatsApp<input className={s.campo} type="tel" inputMode="tel" value={novo.whatsapp} onChange={(e) => setNovo({ ...novo, whatsapp: e.target.value })} placeholder="(16) 99999-9999" /></label>
          <div className={s.rotulo}>Onde fica?
            <div className={s.tipos}>
              <button type="button" className={novo.local === 'endereco' ? s.tipoOn : s.tipo} onClick={() => setNovo({ ...novo, local: 'endereco' })}>Endereço</button>
              <button type="button" className={novo.local === 'ponto' ? s.tipoOn : s.tipo} onClick={() => setNovo({ ...novo, local: 'ponto' })}>Ponto de referência</button>
            </div>
            <input className={s.campo} value={novo.endereco} onChange={(e) => setNovo({ ...novo, endereco: e.target.value })} placeholder={novo.local === 'endereco' ? 'Rua, número, bairro' : 'Ex.: ao lado da padaria, corredor B'} />
          </div>
          <label className={s.rotulo}>Dias e horários<input className={s.campo} value={novo.dias_horarios} onChange={(e) => setNovo({ ...novo, dias_horarios: e.target.value })} placeholder="Ex.: seg a sex, 8h às 17h" /></label>
          <BlocoFotos titulo="Foto do ponto / banca" fotos={fPonto} ocupado={ocupado} onAdicionar={adicionar(setFPonto)} onRemover={remover(setFPonto)} />
          <button className={s.btnGrande} type="submit" disabled={ocupado}>Salvar fornecedor</button>
          <button type="button" className={s.btnGrandeClaro} onClick={() => { setAviso(''); setTela(atual ? 'produto' : 'fornecedor'); }}>Cancelar</button>
        </form>
      )}

      {tela === 'produto' && (
        <section>
          <button type="button" className={s.fornAtual} onClick={() => { setAviso(''); setTela('fornecedor'); }}>
            <span>Fornecedor</span>
            <b>{atual ? atual.apelido : 'Escolher…'}</b>
            <em>trocar</em>
          </button>
          <BlocoFotos titulo="1. Foto do produto" dica="Tire na hora ou escolha várias da galeria (cada foto = um produto)." fotos={fProduto} ocupado={ocupado} onAdicionar={adicionar(setFProduto)} onRemover={remover(setFProduto)} />
          <BlocoFotos titulo="2. Foto da etiqueta / preço" dica="Uma etiqueta para cada produto, na mesma ordem. Mostre bem o preço." fotos={fEtiqueta} ocupado={ocupado} onAdicionar={adicionar(setFEtiqueta)} onRemover={remover(setFEtiqueta)} />
          <button type="button" className={s.btnEnviar} onClick={enviar} disabled={ocupado || !fProduto.length || !fEtiqueta.length}>
            {ocupado ? 'Aguarde…' : '✅ Enviar e próximo produto'}
          </button>
        </section>
      )}
    </main>
  );
}
