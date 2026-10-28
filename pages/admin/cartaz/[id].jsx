// Cartaz com QR Code para imprimir (ou salvar como PDF). ?v=4 gera 4 cartazes por folha.
import { useEffect, useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import QRCode from 'qrcode';
import { api } from '../../../lib/adminClient';
import { SITE_PUBLICO } from '../../../lib/pontos';

const CSS = `
body{margin:0;background:#e5e7eb;font-family:system-ui,Arial,sans-serif}
.bar{position:sticky;top:0;background:#14202e;color:#fff;padding:10px 16px;display:flex;gap:10px;align-items:center;flex-wrap:wrap}
.bar button,.bar a{background:#1d4ed8;color:#fff;border:0;border-radius:8px;padding:8px 14px;font:inherit;font-weight:600;cursor:pointer;text-decoration:none}
.folha{width:210mm;min-height:297mm;margin:16px auto;background:#fff;display:grid;box-sizing:border-box}
.um{grid-template-columns:1fr}.quatro{grid-template-columns:1fr 1fr;grid-template-rows:1fr 1fr}
.cart{box-sizing:border-box;border:1px dashed #94a3b8;padding:8mm;display:flex;flex-direction:column;align-items:center;text-align:center;justify-content:center;gap:4mm;color:#061a3a}
.cart h1{margin:0;line-height:1.1;font-size:34pt}.quatro .cart h1{font-size:17pt}
.cart .sub{font-size:16pt;font-weight:600;color:#1e6bff}.quatro .cart .sub{font-size:9.5pt}
.cart img{width:100mm;height:100mm}.quatro .cart img{width:52mm;height:52mm}
.cart .ln{font-size:13pt}.quatro .cart .ln{font-size:7.5pt}
.cart .cod{font:700 14pt ui-monospace,Menlo,monospace;letter-spacing:2px}.quatro .cart .cod{font-size:8pt}
.cart .peq{font-size:9pt;color:#475569}.quatro .cart .peq{font-size:6pt}
@media print{body{background:#fff}.bar{display:none}.folha{margin:0;width:auto;min-height:100vh}.cart{border:0}@page{size:A4;margin:0}}
`;

export default function Cartaz() {
  const { query } = useRouter();
  const [ponto, setPonto] = useState(null);
  const [qr, setQr] = useState('');
  const [erro, setErro] = useState('');
  const quatro = query.v === '4';

  useEffect(() => {
    if (!query.id) return;
    api(`/api/admin/pontos/${query.id}`)
      .then(async (d) => {
        setPonto(d.ponto);
        setQr(await QRCode.toDataURL(`${SITE_PUBLICO}/p/${d.ponto.codigo}`, { margin: 1, width: 700, errorCorrectionLevel: 'M' }));
      })
      .catch((e) => setErro(e.status === 401 ? 'Entre no painel primeiro (/admin/pontos) e volte aqui.' : e.message));
  }, [query.id]);

  if (erro) return <p style={{ padding: 20 }}>{erro}</p>;
  if (!ponto || !qr) return <p style={{ padding: 20 }}>Gerando cartaz…</p>;

  const Um = () => (
    <div className="cart">
      <h1>Calçados direto da fábrica</h1>
      <div className="sub">Entrega em {ponto.cidade} em dia marcado</div>
      <img src={qr} alt="QR Code" />
      <div className="ln">Aponte a câmera do celular e escolha o seu modelo</div>
      <div className="cod">{SITE_PUBLICO.replace('https://', '')}/p/{ponto.codigo}</div>
      <div className="peq">Ponto Parceiro: {ponto.nome}</div>
    </div>
  );

  return (
    <>
      <Head><title>Cartaz {ponto.codigo}</title><meta name="robots" content="noindex" /></Head>
      <style>{CSS}</style>
      <div className="bar">
        <b>{ponto.nome}</b>
        <button onClick={() => window.print()}>Imprimir ou salvar PDF</button>
        <a href={`?v=${quatro ? '1' : '4'}`} onClick={(e) => { e.preventDefault(); window.location.search = quatro ? '' : '?v=4'; }}>{quatro ? 'Ver 1 por folha' : 'Ver 4 por folha'}</a>
        <span style={{ fontSize: 13 }}>Cole só onde o local autorizou.</span>
      </div>
      <div className={`folha ${quatro ? 'quatro' : 'um'}`}>
        {quatro ? [0, 1, 2, 3].map((i) => <Um key={i} />) : <Um />}
      </div>
    </>
  );
}
