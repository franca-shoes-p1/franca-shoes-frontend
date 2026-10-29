// Painel do parceiro: o acesso é pelo link secreto do convite (token). Lê e salva o perfil; qualquer alteração vai para análise.
import { sb } from '../../../lib/varejoServer';
import { limparPerfil } from '../../../lib/parceiro';
import { avisar } from '../../../lib/avisar';

const COLS_LISTA = ['id','codigo','nome','cidade','uf','tipo','status','perfil_status','perfil_slogan','perfil_descricao','perfil_logo','perfil_whatsapp','perfil_instagram','perfil_site','perfil_horario','perfil_endereco'];
const so = (o) => Object.fromEntries(COLS_LISTA.map((k) => [k, o[k]]));
const COLS = 'id,codigo,nome,cidade,uf,tipo,status,perfil_status,perfil_slogan,perfil_descricao,perfil_logo,perfil_whatsapp,perfil_instagram,perfil_site,perfil_horario,perfil_endereco';

async function achar(token) {
  if (!/^[0-9a-f]{24}$/.test(String(token || ''))) return null;
  const [p] = await sb(`rf_pontos?token_convite=eq.${token}&select=${COLS}`);
  return p || null;
}

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  try {
    const token = req.method === 'GET' ? req.query.token : (req.body || {}).token;
    const p = await achar(token);
    if (!p) return res.status(404).json({ erro: 'Link inválido.' });
    if (!['autorizado', 'ativo'].includes(p.status)) return res.status(403).json({ erro: 'O painel abre depois que você autoriza o cartaz.' });

    if (req.method === 'GET') return res.json({ ponto: so(p) });

    if (req.method === 'POST') {
      const b = req.body || {};
      if (b.acao === 'sair') {
        await sb(`rf_pontos?id=eq.${p.id}`, { method: 'PATCH', body: JSON.stringify({ status: 'recusado', respondido_em: new Date().toISOString(), perfil_status: 'rascunho' }) });
        return res.json({ ok: true, saiu: true });
      }
      const { erro, dados } = limparPerfil(b.perfil, process.env.SUPABASE_URL);
      if (erro) return res.status(400).json({ erro });
      const [novo] = await sb(`rf_pontos?id=eq.${p.id}`, { method: 'PATCH', body: JSON.stringify({ ...dados, perfil_status: 'pendente', perfil_atualizado_em: new Date().toISOString() }) });
      await avisar(`📝 ${p.nome} (${p.cidade}) enviou a vitrine para análise. Confira no passo 5 do Painel do dia.`);
      return res.json({ ponto: so({ ...p, ...novo }) });
    }
    res.setHeader('Allow', 'GET, POST');
    return res.status(405).json({ erro: 'Método não permitido.' });
  } catch (e) {
    console.error('parceiro/perfil', e.message);
    const faltaSql = /perfil_|column/i.test(e.message || '');
    return res.status(500).json({ erro: faltaSql ? 'O painel ainda está sendo preparado. Tente mais tarde.' : 'Não foi possível concluir.' });
  }
}
