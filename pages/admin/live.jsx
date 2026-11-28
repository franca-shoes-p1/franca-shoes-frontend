// Painel da live: feito para usar no celular enquanto filma.
import { useCallback, useEffect, useState } from 'react';
import Head from 'next/head';
import { api, ADMIN_CSS } from '../../lib/adminClient';
import AdminNav from '../../lib/AdminNav';
import { reduzirFoto } from '../../lib/reduzirFoto';

const CAT = { roupas: 'Roupas', calcados: 'Calçados', acessorios: 'Acessórios', suvenires: 'Suvenires' };
const brl = (n) => Number(n).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
// mesma leitura do servidor: ponto só é milhar quando vêm três números depois
const num = (v) => Number(String(v).replace(/[^\d,.]/g, '').replace(/\.(?=\d{3}(\D|$))/g, '').replace(',', '.')) || 0;
const VAZIO = { nome: '', categoria: '', custo: '', preco: '', tamanhos: '', descricao: '', foto_url: '' };

export default function AdminLive() {
  const [fase, setFase] = useState('carregando');
  const [d, setD] = useState(null);
  const [senha, setSenha] = useState('');
  const [msg, setMsg] = useState(null);
  const [ocupado, setOcupado] = useState('');
  const [f, setF] = useState(VAZIO);
  const [fornecedor, setFornecedor] = useState('');
  const [foto, setFoto] = useState('');
  const [precoManual, setPrecoManual] = useState(false);
  const [loja, setLoja] = useState({ nome: '', contato: '', acrescimo: '40' });

  const carregar = useCallback(async () => {
    try { setD(await api('/api/admin/live')); setFase('pronto'); }
    catch (e) { if (e.status === 401) setFase('login'); else { setMsg({ tipo: 'er', texto: e.message }); setFase('pronto'); } }
  }, []);
  useEffect(() => { carregar(); }, [carregar]);

  const enviar = async (corpo, okTexto) => {
    setOcupado('Salvando…'); setMsg(null);
    try { setD(await api('/api/admin/live', { method: 'POST', body: corpo })); setMsg({ tipo: 'ok', texto: okTexto }); setOcupado(''); return true; }
    catch (e) { setMsg({ tipo: 'er', texto: e.message }); setOcupado(''); return false; }
  };
  const entrar = async (ev) => {
    ev.preventDefault();
    try { await api('/api/admin/login', { method: 'POST', body: { senha } }); setSenha(''); setMsg(null); await carregar(); }
    catch (e) { setMsg({ tipo: 'er', texto: e.message }); }
  };
  const muda = (k) => (e) => {
    const v = e.target.value;
    if (k === 'preco') setPrecoManual(true);
    setF((x) => {
      const n = { ...x, [k]: v };
      // sugere o dobro do custo, até você escrever outro preço
      if (k === 'custo' && !precoManual) n.preco = num(v) ? String((num(v) * 2).toFixed(2)).replace('.', ',') : '';
      return n;
    });
  };
  const escolherFoto = async (e) => {
    const arq = e.target.files && e.target.files[0];
    e.target.value = '';
    if (!arq) return;
    setOcupado('Enviando a foto…'); setMsg(null);
    try {
      const dados = await reduzirFoto(arq);
      const r = await api('/api/admin/produtos/foto', { method: 'POST', body: { imagem: dados } });
      setFoto(dados);
      setF((x) => ({ ...x, foto_url: r.url }));
    } catch (err) { setMsg({ tipo: 'er', texto: err.message }); }
    setOcupado('');
  };
  const pedirIA = async () => {
    setOcupado('A IA está olhando a foto…'); setMsg(null);
    try {
      const r = await api('/api/admin/live', { method: 'POST', body: { acao: 'ia', imagem: foto } });
      setF((x) => ({ ...x, nome: r.nome || x.nome, categoria: r.categoria || x.categoria, descricao: r.descricao || x.descricao }));
      setMsg({ tipo: 'ok', texto: 'Confira o que a IA escreveu antes de publicar.' });
    } catch (e) { setMsg({ tipo: 'er', texto: e.message }); }
    setOcupado('');
  };
  const publicar = async (e) => {
    e.preventDefault();
    if (await enviar({ acao: 'publicar', ...f, fornecedor }, 'Publicado na vitrine.')) { setF(VAZIO); setFoto(''); setPrecoManual(false); }
  };
  const criarLoja = async (e) => {
    e.preventDefault();
    if (await enviar({ acao: 'loja_nova', ...loja }, 'Loja criada. Copie o link abaixo.')) setLoja({ nome: '', contato: '', acrescimo: '40' });
  };
  const copiar = async (slug) => {
    const link = `${window.location.origin}/moda/loja/${slug}`;
    try { await navigator.clipboard.writeText(link); setMsg({ tipo: 'ok', texto: `Link copiado: ${link}` }); }
    catch (e) { setMsg({ tipo: 'ok', texto: `Copie o link: ${link}` }); }
  };
  const custo = num(f.custo);
  const preco = num(f.preco);

  return (
    <>
      <Head><title>Painel da live</title><meta name="robots" content="noindex" /><meta name="viewport" content="width=device-width, initial-scale=1" /></Head>
      <div className="ea">
        <style>{ADMIN_CSS}</style>
        <div className="ea-in" style={{ maxWidth: 720 }}>
          <AdminNav />
          <h1>Painel da live</h1>
          <div className="ea-mu">Fotografe, informe o custo e publique. A vitrine se atualiza sozinha em poucos segundos.</div>
          {fase === 'carregando' && <div className="ea-card">Carregando…</div>}
          {fase === 'login' && (
            <form className="ea-card" onSubmit={entrar}>
              <h2>Entrar</h2><label>Senha do painel</label>
              <input type="password" value={senha} onChange={(e) => setSenha(e.target.value)} autoComplete="current-password" />
              <div style={{ marginTop: 12 }}><button className="ea-btn">Entrar</button></div>
            </form>
          )}
          {(msg || ocupado) && <div className={`ea-msg ${ocupado ? '' : msg.tipo}`} role="status" style={{ position: 'sticky', top: 8, zIndex: 2 }}>{ocupado || msg.texto}</div>}
          {fase === 'pronto' && d && d.semSql && <div className="ea-card"><h2>Falta uma etapa</h2><p>Rode uma vez o SQL da loja ao vivo no Supabase e recarregue esta página.</p></div>}

          {fase === 'pronto' && d && !d.semSql && (
            <>
              <form className="ea-card" onSubmit={publicar}>
                <h2>Novo produto</h2>
                <label>Foto (só do produto, sem rostos)</label>
                <input type="file" accept="image/*" onChange={escolherFoto} />
                {foto && (
                  <div className="ea-row" style={{ marginTop: 10 }}>
                    <img src={foto} alt="Foto do produto" style={{ width: 120, height: 120, objectFit: 'cover', borderRadius: 10 }} />
                    <button type="button" className="ea-btn ea-btn2" onClick={pedirIA} disabled={!!ocupado}>✨ Preencher com IA</button>
                  </div>
                )}
                <div className="ea-grid" style={{ marginTop: 12 }}>
                  <div><label>Nome</label><input value={f.nome} onChange={muda('nome')} /></div>
                  <div><label>Categoria</label><select value={f.categoria} onChange={muda('categoria')}><option value="">Escolha</option>{Object.entries(CAT).map(([k, t]) => <option key={k} value={k}>{t}</option>)}</select></div>
                  <div><label>Custo no fornecedor (só você vê)</label><input inputMode="decimal" value={f.custo} onChange={muda('custo')} placeholder="50,00" /></div>
                  <div><label>Preço na sua vitrine</label><input inputMode="decimal" value={f.preco} onChange={muda('preco')} placeholder="100,00" /></div>
                  <div><label>Tamanhos ou cores</label><input value={f.tamanhos} onChange={muda('tamanhos')} /></div>
                  <div><label>Fornecedor (só você vê)</label><input value={fornecedor} onChange={(e) => setFornecedor(e.target.value)} /></div>
                </div>
                <div style={{ marginTop: 12 }}><label>Descrição</label><input value={f.descricao} onChange={muda('descricao')} maxLength={200} /></div>
                {custo > 0 && preco >= custo && <p className="ea-mu">Seu ganho na sua vitrine: {brl(preco - custo)}, antes das despesas.</p>}
                <button className="ea-btn ea-btn-ok" style={{ width: '100%' }} disabled={!!ocupado}>Publicar agora</button>
              </form>

              <div className="ea-card">
                <h2>Produtos ({d.produtos.length})</h2>
                <p className="ea-mu"><a href="/moda/vitrine" target="_blank" rel="noreferrer">Abrir a vitrine</a></p>
                {d.produtos.map((p) => (
                  <div className="ea-item" key={p.id} style={{ flexWrap: 'wrap' }}>
                    <div><b>#{p.numero} {p.nome}</b><div className="ea-mu">custo {brl(p.custo)} · vitrine {brl(p.preco_vitrine)} · {p.status === 'visivel' ? 'à vista' : p.status}</div></div>
                    <div className="ea-row">
                      <button className="ea-btn ea-btn2" onClick={() => enviar({ acao: 'status', id: p.id, status: p.status === 'esgotado' ? 'visivel' : 'esgotado' }, 'Atualizado.')}>{p.status === 'esgotado' ? 'Disponível' : 'Esgotou'}</button>
                      <button className="ea-btn ea-btn2" onClick={() => enviar({ acao: 'status', id: p.id, status: p.status === 'oculto' ? 'visivel' : 'oculto' }, 'Atualizado.')}>{p.status === 'oculto' ? 'Mostrar' : 'Ocultar'}</button>
                      <button className="ea-btn ea-btn2 ea-btn-er" onClick={() => window.confirm(`Excluir "${p.nome}" para sempre?`) && enviar({ acao: 'excluir', id: p.id }, 'Excluído.')}>Excluir</button>
                    </div>
                  </div>
                ))}
              </div>

              <form className="ea-card" onSubmit={criarLoja}>
                <h2>Lojas dos membros</h2>
                <p className="ea-mu">Cada loja mostra os mesmos produtos. O preço é o custo mais o acréscimo do lojista, nunca acima do seu.</p>
                <div className="ea-grid">
                  <div><label>Nome da loja</label><input value={loja.nome} onChange={(e) => setLoja({ ...loja, nome: e.target.value })} placeholder="Loja da Maria" /></div>
                  <div><label>Contato do lojista (só você vê)</label><input value={loja.contato} onChange={(e) => setLoja({ ...loja, contato: e.target.value })} /></div>
                  <div><label>Acréscimo sobre o custo (%)</label><input inputMode="numeric" value={loja.acrescimo} onChange={(e) => setLoja({ ...loja, acrescimo: e.target.value })} /></div>
                </div>
                <p className="ea-mu">Exemplo: custo R$ 50 com 40% = preço R$ 70. As despesas da venda saem da parte do lojista.</p>
                <button className="ea-btn" disabled={!!ocupado}>Criar loja</button>
                {d.lojas.map((l) => (
                  <div className="ea-item" key={l.id} style={{ flexWrap: 'wrap' }}>
                    <div><b>{l.nome}</b><div className="ea-mu">/moda/loja/{l.slug} · +{l.acrescimo}% {l.ativo ? '' : '· desligada'}</div></div>
                    <div className="ea-row">
                      <button type="button" className="ea-btn ea-btn2" onClick={() => copiar(l.slug)}>Copiar link</button>
                      <button type="button" className="ea-btn ea-btn2" onClick={() => enviar({ acao: 'loja_ativo', id: l.id, ativo: !l.ativo }, 'Atualizado.')}>{l.ativo ? 'Desligar' : 'Ligar'}</button>
                    </div>
                  </div>
                ))}
              </form>
            </>
          )}
        </div>
      </div>
    </>
  );
}
