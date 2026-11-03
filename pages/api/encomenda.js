// Recebe a encomenda da página /encomendar (funil de vendas da Entrega em Casa).
// Guarda em rf_encomendas e avisa o Telegram pelo n8n. O cliente NÃO paga nada aqui:
// a cotação vem depois e o pagamento é em dinheiro, na visita.
import crypto from 'crypto';
import { sb, txt } from '../../lib/varejoServer';
import { ESTADOS } from '../../lib/varejo';
import { avisar } from '../../lib/avisar';

const tentativas = new Map(); // limite simples por IP (reinicia quando a instância reinicia)
function limite(ip) {
  const agora = Date.now();
  const lista = (tentativas.get(ip) || []).filter((t) => agora - t < 3600000);
  if (lista.length >= 6) return false;
  lista.push(agora); tentativas.set(ip, lista);
  return true;
}

const CATEGORIAS = ['calcado_fem', 'calcado_masc', 'calcado_infantil', 'acessorio', 'outro'];
const HORARIOS = ['manha', 'tarde', 'noite', 'qualquer'];
const PACOTES = ['loja_pronta', 'revenda', 'site', 'servicos'];

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ erro: 'Método não permitido.' });
  const b = req.body && typeof req.body === 'object' ? req.body : {};
  if (b.site) return res.json({ ok: true });                 // campo-armadilha para robôs
  if (!(Number(b.tempo) >= 4000)) return res.json({ ok: true }); // robôs enviam rápido demais: descarta em silêncio
  const ip = String(req.headers['x-forwarded-for'] || '').split(',')[0].trim() || 'x';
  if (!limite(ip)) return res.status(429).json({ erro: 'Muitas tentativas. Tente de novo mais tarde ou chame no WhatsApp.' });

  const nome = txt(b.nome, 120);
  const whatsapp = String(b.whatsapp || '').replace(/\D/g, '').replace(/^55(?=\d{10,11}$)/, '');
  const email = txt(b.email, 120).toLowerCase();
  const produto = txt(b.produto, 600);
  const categoria = CATEGORIAS.includes(b.categoria) ? b.categoria : 'calcado_fem';
  const numeracao = txt(b.numeracao, 40);
  const quantidade = Math.floor(Number(b.quantidade));
  let referencia = txt(b.referencia, 300);
  const cidade = txt(b.cidade, 80);
  const uf = txt(b.uf, 2).toUpperCase();
  const bairro = txt(b.bairro, 80);
  const endereco = txt(b.endereco, 160);
  const melhor_horario = HORARIOS.includes(b.melhor_horario) ? b.melhor_horario : 'qualquer';
  const interesse = (Array.isArray(b.interesse_pacote) ? b.interesse_pacote : []).filter((x) => PACOTES.includes(x));

  if (nome.length < 3) return res.status(400).json({ erro: 'Informe seu nome.' });
  if (whatsapp.length < 10 || whatsapp.length > 11) return res.status(400).json({ erro: 'Informe um WhatsApp com DDD.' });
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) return res.status(400).json({ erro: 'E-mail inválido.' });
  if (produto.length < 4) return res.status(400).json({ erro: 'Conte o que você quer encomendar.' });
  if (!(quantidade >= 1 && quantidade <= 10)) return res.status(400).json({ erro: 'A quantidade deve ficar entre 1 e 10.' });
  if (cidade.length < 2 || !ESTADOS.includes(uf)) return res.status(400).json({ erro: 'Informe sua cidade e o estado.' });
  if (endereco.length < 5) return res.status(400).json({ erro: 'Informe a rua e o número para a visita.' });
  if (b.aceite_visita !== true) return res.status(400).json({ erro: 'Marque que aceita a visita em casa para continuar.' });
  if (/^https?:/i.test(referencia) && !/^https:\/\//i.test(referencia)) {
    return res.status(400).json({ erro: 'O link de referência precisa começar com https://.' });
  }

  try {
    for (let i = 0; i < 3; i++) {
      const codigo = 'EN' + crypto.randomBytes(3).toString('hex').toUpperCase();
      try {
        await sb('rf_encomendas', {
          method: 'POST',
          body: JSON.stringify([{
            codigo, nome, whatsapp, email: email || null, categoria, produto, numeracao: numeracao || null,
            quantidade, referencia: referencia || null, cidade, uf, bairro: bairro || null, endereco,
            melhor_horario, aceite_visita: true, interesse_pacote: interesse,
          }]),
        });
        await avisar(`🛍️ Encomenda ${codigo}: ${produto.slice(0, 70)} (x${quantidade}) · ${cidade}/${uf}${interesse.length ? ' · quer saber do pacote' : ''}`);
        return res.status(201).json({ ok: true, codigo });
      } catch (e) {
        if (!/duplicate|unique|23505/i.test(e.message)) throw e; // código repetido: tenta outro
      }
    }
    throw new Error('codigo repetido');
  } catch (e) {
    console.error('encomenda', e.message);
    return res.status(500).json({ erro: 'Não foi possível registrar agora. Tente mais tarde ou chame no WhatsApp.' });
  }
}
