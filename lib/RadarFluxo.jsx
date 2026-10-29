// Ilustração do Radar para quem abre o painel pela primeira vez: o caminho do local ao cliente em cinco passos.
const PASSOS = [
  ['🗺️', 'Achar', 'O mapa lista rodoviárias e comércios da cidade'],
  ['💬', 'Convidar', 'Mensagem pedindo autorização, nunca sem pedir'],
  ['🤝', 'Autorizar', 'O local diz SIM e ganha vitrine grátis no site'],
  ['🖨️', 'Imprimir', 'Panfleto, cartão e cartaz com QR da cidade'],
  ['📱', 'Vender', 'A pessoa aponta o celular e compra na loja'],
];
export default function RadarFluxo({ aberto = true }) {
  return (
    <details open={aberto} style={{ margin: '0 0 14px', borderRadius: 16, overflow: 'hidden', border: '1px solid var(--bd)', background: 'linear-gradient(135deg,#0f2a5c 0%,#1e6bff 60%,#7cc4ff 100%)', color: '#fff' }}>
      <summary style={{ cursor: 'pointer', padding: '12px 16px', fontWeight: 700, listStyle: 'none' }}>📍 Radar de Pontos: como funciona (toque para abrir ou fechar)</summary>
      <div style={{ padding: '4px 16px 16px' }}>
        <p style={{ margin: '0 0 12px', fontSize: 15, opacity: 0.95 }}>Divulgação cidade por cidade, em locais que autorizaram, com um QR que leva à loja de calçados e acessórios de fábrica. Sem promessa de ganho para ninguém.</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(150px,1fr))', gap: 10 }}>
          {PASSOS.map(([e, t, d], i) => (
            <div key={t} style={{ background: 'rgba(255,255,255,.14)', borderRadius: 12, padding: '10px 12px' }}>
              <div style={{ fontSize: 26 }}>{e}</div>
              <div style={{ fontWeight: 700 }}>{i + 1}. {t}</div>
              <div style={{ fontSize: 13, opacity: 0.92 }}>{d}</div>
            </div>
          ))}
        </div>
      </div>
    </details>
  );
}
