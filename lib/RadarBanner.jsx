import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import QRCode from 'qrcode';
import s from '../styles/radar.module.css';
import RadarAssistente from './RadarAssistente';

/* Vitrine do Radar de Pontos na home: mesmo layout das outras vitrines, em tom marrom claro.
   Faixa com QR code de verdade (leva à página /radar), alfinetes de mapa e assistente. */
const PONTOS = [
  { c: s.p1, t: 'Rodoviária' }, { c: s.p2, t: 'Faculdade' }, { c: s.p3, t: 'Academia' },
  { c: s.p4, t: 'Padaria' }, { c: s.p5, t: 'Igreja' },
];

export default function RadarBanner() {
  const [qr, setQr] = useState('');
  useEffect(() => {
    let vivo = true;
    QRCode.toString('https://www.igreja.eco.br/radar', { type: 'svg', margin: 0, color: { dark: '#4a2f1a', light: '#fffaf2' } })
      .then((svg) => { if (vivo) setQr(svg); }).catch(() => {});
    return () => { vivo = false; };
  }, []);

  return (
    <section id="radar" className={s.banner} aria-label="Radar de Pontos">
      <div className={s.dentro}>
        <div className={s.esq}>
          <span className={s.pilula}><i />Novo · Radar de Pontos</span>
          <h2 className={s.titulo}>Seu calçado de fábrica, <em>a um QR de distância</em></h2>
          <p className={s.texto}>
            Cartazes com QR code em locais que autorizaram, cidade por cidade. Aponte o celular, veja a loja e compre por PIX ou cartão.
            A entrega é em mãos, em dia marcado. Começamos por Belo Horizonte.
          </p>
          <ul className={s.passos}>
            <li><b>1</b>Veja o cartaz</li>
            <li><b>2</b>Leia o QR</li>
            <li><b>3</b>Compre na loja</li>
          </ul>
          <div className={s.acoes}>
            <Link href="/radar" className={`${s.botao} ${s.principal}`}>Conhecer o projeto</Link>
            <Link href="/radar#assistente" className={`${s.botao} ${s.contorno}`}>Falar com o assistente</Link>
            <Link href="/admin/radar" className={`${s.botao} ${s.contorno}`}>🔑 Entrar nos painéis</Link>
          </div>
          <p className={s.nota}>Cartazes só em locais autorizados. Sem promessa de venda ou ganho.</p>
        </div>

        <div className={s.palco}>
          <div className={s.mapa} aria-hidden="true">
            {PONTOS.map((p) => (<span key={p.t} className={`${s.pino} ${p.c}`}><b /><em>{p.t}</em></span>))}
            <span className={s.cidade}>Belo Horizonte · MG</span>
          </div>
          <div className={s.faixa} aria-hidden="true">
            <span className={s.fio} />
            <div className={s.lona}>
              <small>Ponto Parceiro</small>
              <strong>Calçados direto da fábrica</strong>
              <div className={s.qr} dangerouslySetInnerHTML={{ __html: qr }} />
              <span className={s.leia}>Aponte a câmera</span>
            </div>
          </div>
          <RadarAssistente compacto />
        </div>
      </div>
      <div className={s.letreiro} aria-hidden="true">
        <div className={s.trilho}>
          {[0, 1].map((k) => (
            <span key={k}>📍 Ponto Parceiro · 📲 QR code · 👟 Calçados de fábrica · 🚌 Dia de Entrega · 🤝 Só com autorização · </span>
          ))}
        </div>
      </div>
    </section>
  );
}
