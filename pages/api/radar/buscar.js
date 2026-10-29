// Para o n8n: roda a busca automática de locais (uma cidade e alguns tipos por vez).
import { exigirRadarToken } from '../../../lib/radarToken';
import { mapearCidade } from '../../../lib/mapearCidade';
import { GRUPOS } from '../../../lib/mapeador';

export const config = { maxDuration: 40 };

export default async function handler(req, res) {
  if (!exigirRadarToken(req, res)) return;
  if (req.method !== 'POST') return res.status(405).json({ erro: 'Método não permitido.' });
  const b = req.body && typeof req.body === 'object' ? req.body : {};
  const r = await mapearCidade({ cidade: b.cidade, uf: b.uf, grupos: b.grupos, quantos: b.quantos || 100 });
  const nomes = (Array.isArray(b.grupos) ? b.grupos : []).map((g) => (GRUPOS[g] ? GRUPOS[g].nome.split(' (')[0] : g)).join(', ');
  const texto = r.status === 200
    ? `🔎 Busca de locais em ${b.cidade} (${nomes}): ${r.json.cadastrados} novo(s) cadastrado(s), ${r.json.com_contato} com WhatsApp ou e-mail.`
    : `⚠️ A busca de locais em ${b.cidade} (${nomes}) não funcionou: ${r.json.erro}`;
  return res.status(r.status === 200 ? 200 : r.status).json({ ...r.json, texto });
}
