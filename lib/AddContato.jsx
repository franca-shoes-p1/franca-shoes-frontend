// Botão "Adicionar contato": acrescenta WhatsApp e/ou e-mail a um ponto que já existe (só no painel do admin).
import { useState } from 'react';
import { api } from './adminClient';

export const normalizaWhats = (v) => {
  let d = String(v || '').replace(/\D/g, '');
  if (d.startsWith('55') && d.length >= 12) d = d.slice(2);
  return d;
};

export default function AddContato({ ponto, onSalvo, pequeno }) {
  const [aberto, setAberto] = useState(false);
  const [w, setW] = useState(ponto.contato_whatsapp || '');
  const [e, setE] = useState(ponto.contato_email || '');
  const [erro, setErro] = useState('');
  const [ocupado, setOcupado] = useState(false);

  async function salvar(ev) {
    ev.preventDefault();
    setErro('');
    const num = normalizaWhats(w);
    const mail = e.trim().toLowerCase();
    if (!num && !mail) return setErro('Informe um WhatsApp ou um e-mail.');
    if (num && !/^\d{2}9\d{8}$/.test(num)) return setErro('WhatsApp: use DDD + 9 + 8 dígitos. Ex.: 31 99999-9999. Telefone fixo não serve.');
    if (mail && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(mail)) return setErro('E-mail inválido.');
    setOcupado(true);
    try {
      await api(`/api/admin/pontos/${ponto.id}`, { method: 'PATCH', body: { contato_whatsapp: num || null, contato_email: mail || null } });
      setAberto(false);
      if (onSalvo) await onSalvo();
    } catch (x) { setErro(x.message); }
    setOcupado(false);
  }

  if (!aberto) return <button type="button" className={`ea-btn ea-btn2${pequeno ? ' rd-sm' : ''}`} onClick={() => setAberto(true)}>{ponto.contato_whatsapp || ponto.contato_email ? 'Editar contato' : 'Adicionar contato'}</button>;
  return (
    <form onSubmit={salvar} style={{ flex: '1 1 100%', marginTop: 8 }}>
      <label>WhatsApp (com DDD)</label>
      <input value={w} onChange={(x) => setW(x.target.value)} inputMode="tel" placeholder="31 99999-9999" />
      <label>E-mail</label>
      <input value={e} onChange={(x) => setE(x.target.value)} type="email" placeholder="contato@local.com.br" />
      {erro && <div className="ea-msg er" style={{ marginTop: 8 }}>{erro}</div>}
      <div className="ea-row" style={{ marginTop: 8 }}>
        <button className="ea-btn ea-btn-ok rd-sm" disabled={ocupado}>Salvar contato</button>
        <button type="button" className="ea-btn ea-btn2 rd-sm" onClick={() => setAberto(false)}>Cancelar</button>
      </div>
    </form>
  );
}
