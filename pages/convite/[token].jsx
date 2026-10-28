import { useState } from 'react';
import Head from 'next/head';
import { sb } from '../../lib/varejoServer';

export async function getServerSideProps({ params, res }) {
  res.setHeader('Cache-Control', 'no-store');
  const token = String(params.token || '');
  if (!/^[0-9a-f]{24}$/.test(token)) return { notFound: true };
  try {
    const [p] = await sb(`rf_pontos?token_convite=eq.${token}&select=nome,cidade,status`);
    if (!p) return { notFound: true };
    return { props: { token, nome: p.nome, cidade: p.cidade, status: p.status } };
  } catch (e) {
    return { notFound: true };
  }
}

export default function Convite({ token, nome, cidade, status }) {
  const [estado, setEstado] = useState(status);
  const [erro, setErro] = useState('');
  const [env, setEnv] = useState(false);
  async function responder(resposta) {
    setEnv(true); setErro('');
    try {
      const r = await fetch('/api/ponto/convite', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ token, resposta }) });
      const j = await r.json();
      if (!r.ok) throw new Error(j.erro || 'Erro');
      setEstado(j.status);
    } catch (e) { setErro(e.message); }
    setEnv(false);
  }
  const respondido = ['autorizado', 'ativo', 'recusado'].includes(estado);
  const css = `body{margin:0;font-family:system-ui,Arial,sans-serif;background:#f3f6fb;color:#14202e}
  .c{max-width:520px;margin:40px auto;padding:0 16px}.k{background:#fff;border-radius:14px;padding:24px;box-shadow:0 2px 14px #0001}
  h1{font-size:22px;margin:0 0 10px}p{line-height:1.5}.b{display:block;width:100%;padding:14px;border:0;border-radius:10px;font-size:16px;font-weight:700;cursor:pointer;margin-top:10px}
  .s{background:#1d4ed8;color:#fff}.n{background:#e5e7eb;color:#14202e}.b:disabled{opacity:.6}.e{color:#b91c1c}`;
  return (
    <div className="c">
      <Head><title>Convite · Ponto Parceiro</title><meta name="robots" content="noindex" /></Head>
      <style>{css}</style>
      <div className="k">
        <h1>Ponto Parceiro em {cidade}</h1>
        <p><b>{nome}</b>, convidamos você a deixar um cartaz pequeno com QR Code no seu mural. Em troca, o seu local aparece como Ponto Parceiro na nossa página da cidade, sem custo. Os calçados e acessórios vêm direto da fábrica de Franca-SP.</p>
        {respondido ? (
          <p><b>{estado === 'recusado' ? 'Tudo bem, registramos que você não quer participar. Não enviaremos novos convites.' : 'Obrigado! Registramos a sua autorização.'}</b></p>
        ) : (
          <>
            <button className="b s" disabled={env} onClick={() => responder('sim')}>Sim, autorizo o cartaz</button>
            <button className="b n" disabled={env} onClick={() => responder('nao')}>Não, obrigado</button>
          </>
        )}
        {erro && <p className="e">{erro}</p>}
      </div>
    </div>
  );
}
