import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { REDES } from './redes';
import s from '../styles/botaoAtendimento.module.css';

// Botão flutuante "Fale conosco" em todas as páginas públicas.
// Fica escondido no painel do dono, na área do operador e na própria página de contato.
const ESCONDER = ['/admin', '/operador', '/contato'];

export default function BotaoAtendimento() {
  const router = useRouter();
  const [aberto, setAberto] = useState(false);
  const caminho = router.pathname || '';
  if (ESCONDER.some((p) => caminho === p || caminho.startsWith(p + '/'))) return null;

  const zap = REDES.find((r) => r.id === 'whatsapp');
  const tg = REDES.find((r) => r.id === 'telegram');
  const de = encodeURIComponent((router.asPath || '/').split('?')[0].slice(0, 60));

  return (
    <div className={s.raiz}>
      {aberto && (
        <div className={s.menu} role="menu">
          {zap && zap.url && <a role="menuitem" href={zap.url} target="_blank" rel="noopener noreferrer" style={{ '--c': zap.cor }}>WhatsApp</a>}
          {tg && tg.url && <a role="menuitem" href={tg.url} target="_blank" rel="noopener noreferrer" style={{ '--c': tg.cor }}>Telegram</a>}
          <Link role="menuitem" href={`/contato?de=${de}`} style={{ '--c': '#1d4ed8' }} onClick={() => setAberto(false)}>Enviar mensagem</Link>
        </div>
      )}
      <button
        type="button"
        className={s.bt}
        aria-expanded={aberto}
        aria-label={aberto ? 'Fechar opções de atendimento' : 'Abrir opções de atendimento'}
        onClick={() => setAberto((v) => !v)}
      >
        {aberto ? '×' : 'Fale conosco'}
      </button>
    </div>
  );
}
