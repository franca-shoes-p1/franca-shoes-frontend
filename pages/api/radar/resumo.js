// Para o n8n: resumo do dia do Radar, já com o texto pronto para o Telegram.
import { exigirRadarToken } from '../../../lib/radarToken';
import { sb } from '../../../lib/varejoServer';
import { SITE_PUBLICO } from '../../../lib/pontos';

const tenta = async (caminho) => { try { return await sb(caminho); } catch (e) { return []; } };

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (!exigirRadarToken(req, res)) return;
  try {
    const pontos = await sb('rf_pontos?select=status,contato_whatsapp,contato_email,convidado_em,perfil_status&limit=5000');
    const desde = encodeURIComponent(new Date(Date.now() - 86400000).toISOString());
    const [divs, trocas, visitas] = await Promise.all([
      tenta('rf_divulgacoes?status=eq.pendente&select=id&limit=1000'),
      tenta('rf_trocas?status=eq.proposta&select=id&limit=1000'),
      tenta(`rf_pontos_visitas?em=gte.${desde}&select=id&limit=5000`),
    ]);
    const tem = (p) => /^\d{11}$/.test(String(p.contato_whatsapp || '')) || p.contato_email;
    const dias = (iso) => (iso ? Math.floor((Date.now() - new Date(iso).getTime()) / 86400000) : 0);
    const n = {
      fila: pontos.filter((p) => p.status === 'mapeado' && tem(p)).length,
      sem_contato: pontos.filter((p) => p.status === 'mapeado' && !tem(p)).length,
      aguardando: pontos.filter((p) => p.status === 'convidado').length,
      lembretes: pontos.filter((p) => p.status === 'convidado' && dias(p.convidado_em) >= 5).length,
      autorizados: pontos.filter((p) => p.status === 'autorizado').length,
      perfis: pontos.filter((p) => p.perfil_status === 'pendente').length,
      divulgacoes: divs.length,
      trocas: trocas.length,
      visitas_24h: visitas.length,
    };
    const linhas = [];
    const add = (v, t) => { if (v > 0) linhas.push(`• ${t}: ${v}`); };
    add(n.perfis, 'Perfis de parceiros para aprovar');
    add(n.divulgacoes, 'Divulgações para conferir');
    add(n.autorizados, 'Autorizados para imprimir e colar o cartaz');
    add(n.lembretes, 'Lembretes a enviar (5+ dias sem resposta)');
    add(n.fila, 'Convites na fila (com WhatsApp ou e-mail)');
    add(n.aguardando, 'Aguardando resposta');
    add(n.trocas, 'Propostas de troca abertas entre parceiros');
    add(n.sem_contato, 'Locais sem contato (adicione o WhatsApp)');
    const corpo = linhas.length ? linhas.join('\n') : 'Nada pendente hoje.';
    const texto = `📍 Radar de Pontos: resumo de hoje\n\n${corpo}\n\n📈 Visitas pelos QR nas últimas 24h: ${n.visitas_24h}\n\n👉 ${SITE_PUBLICO}/admin/radar`;
    return res.json({ ...n, texto });
  } catch (e) {
    console.error('radar/resumo', e.message);
    return res.status(500).json({ erro: 'Não foi possível montar o resumo.', texto: '⚠️ O resumo do Radar não funcionou hoje. Veja o painel: ' + SITE_PUBLICO + '/admin/radar' });
  }
}
