// Materiais para imprimir: panfleto A5, cartão de visita, cartazes dos locais autorizados e kit por cidade.
// Uma folha-modelo de cada; você tira as cópias na copiadora (o kit diz quantas).
import { useEffect, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import QRCode from 'qrcode';
import { api } from '../../lib/adminClient';
import { CIDADES, PRIMEIRA_FASE, SITE_PUBLICO, TIPOS } from '../../lib/pontos';
import { codigoMaterial, PARTES, WHATS_TXT } from '../../lib/material';

const CSS = `
body{margin:0;background:#e5e7eb;font-family:system-ui,Arial,sans-serif;color:#061a3a}
.bar{position:sticky;top:0;z-index:5;background:#14202e;color:#fff;padding:10px 16px;display:flex;gap:10px;align-items:center;flex-wrap:wrap}
.bar select,.bar input{font:inherit;padding:7px 10px;border-radius:8px;border:0}
.bar button,.bar a{background:#1d4ed8;color:#fff;border:0;border-radius:8px;padding:8px 14px;font:inherit;font-weight:600;cursor:pointer;text-decoration:none}
.bar a.cz{background:#475569}
.aviso{max-width:210mm;margin:12px auto;padding:0 12px;font-size:14px;color:#334155}
.folha{width:210mm;height:296mm;margin:14px auto;background:#fff;box-sizing:border-box;overflow:hidden;position:relative;break-after:page}.folha:last-child{break-after:auto}
.g4{display:grid;grid-template-columns:1fr 1fr;grid-template-rows:1fr 1fr}
.g10{display:grid;grid-template-columns:1fr 1fr;grid-template-rows:repeat(5,1fr)}
.cel{box-sizing:border-box;border:1px dashed #94a3b8;display:flex}
.pan{padding:9mm;flex-direction:column;align-items:center;text-align:center;justify-content:center;gap:3mm;width:100%}
.pan h1{margin:0;font-size:19pt;line-height:1.1}.pan .s{font-size:11pt;font-weight:700;color:#1e40af}
.pan img{width:56mm;height:56mm}.pan .l{font-size:9.5pt}.pan .u{font:700 9.5pt ui-monospace,Menlo,monospace}
.pan .p{font-size:7.5pt;color:#475569;border-top:1px solid #cbd5e1;padding-top:2mm;width:100%}
.car{padding:4mm;align-items:center;gap:4mm;width:100%}
.car img{width:34mm;height:34mm;flex:none}.car .t{text-align:left}
.car h2{margin:0 0 1.5mm;font-size:11.5pt;line-height:1.1}.car .a{font-size:8pt;margin:0}.car .u{font:700 8pt ui-monospace,Menlo,monospace;margin-top:1.5mm}
.cz1{padding:12mm;flex-direction:column;align-items:center;text-align:center;justify-content:center;gap:5mm;width:100%;border:0}
.cz1 h1{margin:0;font-size:34pt;line-height:1.1}.cz1 .s{font-size:16pt;font-weight:700;color:#1e40af}.cz1 img{width:100mm;height:100mm}
.cz1 .l{font-size:13pt}.cz1 .u{font:700 14pt ui-monospace,Menlo,monospace;letter-spacing:1px}.cz1 .p{font-size:9pt;color:#475569}
.kit{padding:16mm;font-size:11pt;line-height:1.4}
.kit h1{font-size:26pt;margin:0 0 2mm}.kit h2{font-size:14pt;margin:8mm 0 2mm;border-bottom:2px solid #061a3a;padding-bottom:1mm}
.kit table{width:100%;border-collapse:collapse;font-size:10pt}.kit td,.kit th{border-bottom:1px solid #cbd5e1;padding:2mm 1.5mm;text-align:left;vertical-align:top}
.kit .cx{width:6mm;height:6mm;border:1.5px solid #061a3a;display:inline-block}
.kit .nota{font-size:9pt;color:#475569}
@media print{body{background:#fff}.bar,.aviso,.nao{display:none}.folha{margin:0;box-shadow:none}@page{size:A4;margin:0}}
`;

const LOJA = (cod) => `${SITE_PUBLICO}/p/${cod}`;

export default function Material() {
  const [fase, setFase] = useState('carregando');
  const [pontos, setPontos] = useState([]);
  const [cidade, setCidade] = useState(PRIMEIRA_FASE[0]);
  const [parte, setParte] = useState('kit');
  const [qP, setQP] = useState(40);
  const [qC, setQC] = useState(50);
  const [qr, setQr] = useState({});
  const [erro, setErro] = useState('');

  useEffect(() => {
    api('/api/admin/pontos').then((d) => { setPontos(d.pontos || []); setFase('pronto'); })
      .catch((e) => { if (e.status === 401) setErro('Entre no painel primeiro (/admin/radar) e volte aqui.'); else setErro(e.message); });
  }, []);

  const autorizados = pontos.filter((p) => p.cidade === cidade && ['autorizado', 'ativo'].includes(p.status));
  const visitar = pontos.filter((p) => p.cidade === cidade && ['autorizado', 'ativo', 'convidado'].includes(p.status));
  const cP = codigoMaterial(cidade, 'panfleto');
  const cC = codigoMaterial(cidade, 'cartao');

  useEffect(() => {
    let vivo = true;
    (async () => {
      const mk = (u) => QRCode.toDataURL(u, { margin: 1, width: 600, errorCorrectionLevel: 'M' });
      const novo = { P: await mk(LOJA(cP)), C: await mk(LOJA(cC)) };
      for (const p of autorizados) novo[p.id] = await mk(`${SITE_PUBLICO}/p/${p.codigo}`);
      if (vivo) setQr(novo);
    })();
    return () => { vivo = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cidade, pontos]);

  if (erro) return <p style={{ padding: 20 }}>{erro}</p>;
  if (fase === 'carregando') return <p style={{ padding: 20 }}>Carregando…</p>;

  const Pan = () => (
    <div className="cel pan">
      <h1>Calçados direto da fábrica</h1>
      <div className="s">Entrega em {cidade} em dia marcado</div>
      {qr.P && <img src={qr.P} alt="QR Code da loja" />}
      <div className="l">Aponte a câmera do celular e escolha o seu modelo</div>
      <div className="u">{LOJA(cP).replace('https://', '')}</div>
      <div className="p">Pague por PIX ou cartão. Dúvidas no WhatsApp {WHATS_TXT}. Quer divulgar o seu negócio de graça? igreja.eco.br/radar</div>
    </div>
  );
  const Car = () => (
    <div className="cel car">
      {qr.C && <img src={qr.C} alt="QR Code da loja" />}
      <div className="t">
        <h2>Calçados direto da fábrica</h2>
        <p className="a">Aponte a câmera e escolha. Entrega em {cidade} em dia marcado.</p>
        <p className="a">WhatsApp {WHATS_TXT}</p>
        <div className="u">{LOJA(cC).replace('https://', '')}</div>
      </div>
    </div>
  );
  const folhaPan = <div className="folha g4">{[0, 1, 2, 3].map((i) => <Pan key={i} />)}</div>;
  const folhaCar = <div className="folha g10">{Array.from({ length: 10 }, (_, i) => <Car key={i} />)}</div>;
  const cartazes = autorizados.map((p) => (
    <div className="folha" key={p.id}>
      <div className="cel cz1">
        <h1>Calçados direto da fábrica</h1>
        <div className="s">Entrega em {cidade} em dia marcado</div>
        {qr[p.id] && <img src={qr[p.id]} alt="QR Code" />}
        <div className="l">Aponte a câmera do celular e escolha o seu modelo</div>
        <div className="u">{SITE_PUBLICO.replace('https://', '')}/p/{p.codigo}</div>
        <div className="p">Ponto Parceiro: {p.nome}</div>
      </div>
    </div>
  ));
  const copiasPan = Math.max(1, Math.ceil(qP / 4));
  const copiasCar = Math.max(1, Math.ceil(qC / 10));
  const capa = (
    <div className="folha kit">
      <h1>Kit {cidade} ({CIDADES[cidade] ? CIDADES[cidade].uf : ''})</h1>
      <div className="nota">Gerado em {new Date().toLocaleDateString('pt-BR')} · leve este kit impresso e a nota/autorização que se aplicar</div>
      <h2>O que imprimir</h2>
      <table><tbody>
        <tr><td><span className="cx" /></td><td>Folha de panfletos (4 por folha)</td><td>tirar <b>{copiasPan}</b> cópia(s) = {copiasPan * 4} panfletos</td></tr>
        <tr><td><span className="cx" /></td><td>Folha de cartões (10 por folha)</td><td>tirar <b>{copiasCar}</b> cópia(s) = {copiasCar * 10} cartões, cortar na tesoura</td></tr>
        <tr><td><span className="cx" /></td><td>Cartazes A4 (um por local autorizado)</td><td>tirar <b>1</b> cópia de cada ({autorizados.length} cartaz(es))</td></tr>
      </tbody></table>
      <h2>Locais para visitar ({visitar.length})</h2>
      {visitar.length === 0 ? <p>Ainda não há locais convidados ou autorizados nesta cidade. Veja o painel Captação.</p> : (
        <table>
          <thead><tr><th></th><th>Local</th><th>Tipo</th><th>Situação</th><th>Endereço / observação</th></tr></thead>
          <tbody>{visitar.map((p) => (
            <tr key={p.id}><td><span className="cx" /></td><td><b>{p.nome}</b>{p.contato_whatsapp ? <div className="nota">WhatsApp {p.contato_whatsapp}</div> : null}</td><td>{TIPOS[p.tipo] || p.tipo}</td><td>{p.status === 'convidado' ? 'Só convidado' : 'Autorizado'}</td><td>{[p.endereco, p.observacao].filter(Boolean).join(' · ').slice(0, 120)}</td></tr>
          ))}</tbody>
        </table>
      )}
      <p className="nota">Regra: cartaz só nos locais autorizados (status Autorizado). Local que só foi convidado: entregue panfleto e cartão e peça autorização, sem colar nada. Quem recusou não recebe nada.</p>
    </div>
  );

  return (
    <>
      <Head><title>Materiais · {cidade}</title><meta name="robots" content="noindex" /></Head>
      <style>{CSS}</style>
      <div className="bar nao">
        <Link href="/admin/captacao" className="cz">← Captação</Link>
        <select value={cidade} onChange={(e) => setCidade(e.target.value)}>
          {Object.keys(CIDADES).map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        <select value={parte} onChange={(e) => setParte(e.target.value)}>
          {Object.entries(PARTES).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
        <label style={{ fontSize: 13 }}>Panfletos <input type="number" min="4" step="4" value={qP} onChange={(e) => setQP(Number(e.target.value) || 4)} style={{ width: 64 }} /></label>
        <label style={{ fontSize: 13 }}>Cartões <input type="number" min="10" step="10" value={qC} onChange={(e) => setQC(Number(e.target.value) || 10)} style={{ width: 64 }} /></label>
        <button onClick={() => window.print()}>Imprimir ou salvar PDF</button>
      </div>
      <div className="aviso nao">
        Cada página abaixo é uma folha A4. Na impressora da copiadora, imprima o PDF e tire as cópias indicadas. As visitas dos panfletos ({cP}) e dos cartões ({cC}) são contadas no painel Captação.
      </div>
      {(parte === 'kit') && capa}
      {(parte === 'kit' || parte === 'panfleto') && folhaPan}
      {(parte === 'kit' || parte === 'cartao') && folhaCar}
      {(parte === 'kit' || parte === 'cartaz') && (autorizados.length ? cartazes : <div className="aviso nao">Esta cidade ainda não tem locais autorizados. Os cartazes aparecem aqui quando alguém disser sim.</div>)}
    </>
  );
}
