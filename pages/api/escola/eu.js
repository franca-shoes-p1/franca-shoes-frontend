// Quem está logado na escola (para o cabeçalho das páginas).
import { alunoLogado } from '../../../lib/escolaServer';

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  const a = await alunoLogado(req).catch(() => null);
  if (!a) return res.json({ logado: false });
  return res.json({ logado: true, nome: a.nome, email: a.email });
}
