// Pré-avaliação automática de uma entrega: só confere regras objetivas e mostra uma SUGESTÃO ao dono.
// Nunca aprova nem recusa sozinha.
const PROIBIDAS = ['renda garantida', 'ganhe por mês', 'ganhe por mes', 'estágio', 'estagio', 'emprego', 'sociedade', 'retorno', 'lucro garantido', 'fique rico', 'dinheiro fácil', 'dinheiro facil'];
const norm = (s) => String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');

export const TIPOS_REGRA = [
  ['min_caracteres', 'Texto com no mínimo N caracteres'],
  ['contem', 'Contém o texto'],
  ['nao_contem', 'NÃO contém o texto'],
  ['sem_colchetes', 'Sem [colchetes] sobrando'],
  ['min_linhas', 'Linhas que começam com o texto (mínimo N)'],
  ['anexo', 'Tem imagem anexada'],
];

// Aplica as regras cadastradas no painel (op_cartoes.regras): [{tipo, campo, valor, minimo, msg}]
function aplicarRegras(regras, respostas, anexos, alerta, bom) {
  for (const r of regras) {
    const v = String((respostas || {})[r.campo] || '');
    const nome = r.msg || r.tipo;
    const min = parseInt(r.minimo, 10) || 0;
    let ok = true;
    if (r.tipo === 'min_caracteres') ok = v.trim().length >= (parseInt(r.valor, 10) || min || 1);
    else if (r.tipo === 'contem') ok = norm(v).includes(norm(r.valor));
    else if (r.tipo === 'nao_contem') ok = !norm(v).includes(norm(r.valor));
    else if (r.tipo === 'sem_colchetes') ok = !/\[[^\]]*\]/.test(v);
    else if (r.tipo === 'min_linhas') {
      const alvo = norm(r.valor);
      const n = v.split('\n').filter((l) => norm(l).trim().startsWith(alvo)).length;
      ok = n >= (min || 1);
    } else if (r.tipo === 'anexo') ok = !!(anexos && anexos.length);
    else continue;
    (ok ? bom : alerta)(ok ? `OK: ${nome}` : `Falhou: ${nome}`);
  }
}

export function preAvaliar(codigo, respostas = {}, anexos = [], observacoes = '', regras = null) {
  const itens = [];
  const alerta = (t) => itens.push({ ok: false, t });
  const bom = (t) => itens.push({ ok: true, t });
  const texto = Object.values(respostas || {}).join('\n');
  const n = norm(texto);

  const achadas = PROIBIDAS.filter((p) => n.includes(norm(p)));
  const avisada = norm(observacoes).length > 5;
  if (achadas.length) (avisada ? bom : alerta)(`Palavra proibida no texto: ${achadas.join(', ')}${avisada ? ' (o operador avisou nas observações)' : ''}`);
  else bom('Nenhuma palavra proibida encontrada');

  if (Array.isArray(regras) && regras.length) {
    aplicarRegras(regras, respostas, anexos, alerta, bom);
  } else if (codigo === 'C2') {
    const leg = String(respostas.legenda || '');
    if (leg.trim().length < 40) alerta('Legenda muito curta');
    const col = leg.match(/\[[^\]]*\]/g);
    if (col) alerta(`Ainda há colchetes na legenda: ${col.slice(0, 3).join(' ')}`); else bom('Sem colchetes na legenda');
    const nl = norm(leg);
    if (nl.includes('sem promessa de ganho') && nl.includes('trabalho autonomo')) bom('Aviso obrigatório presente'); else alerta('Aviso obrigatório ausente ou incompleto');
    if (nl.includes('igreja.eco.br')) bom('Contém o link igreja.eco.br'); else alerta('Não encontrei o link igreja.eco.br na legenda');
    if (!anexos || anexos.length === 0) alerta('Sem imagem anexada'); else bom('Imagem anexada');
  } else if (codigo === 'C3') {
    const base = String(respostas.base || '');
    const p = (base.match(/^\s*pergunta\s*:/gim) || []).length;
    const r = (base.match(/^\s*resposta\s*:/gim) || []).length;
    if (p >= 10 && r >= 10) bom(`${p} perguntas e ${r} respostas`); else alerta(`Esperadas 10 perguntas e 10 respostas; encontrei ${p} e ${r}`);
    const falta = (base.match(/falta informa/gi) || []).length;
    if (falta) bom(`${falta} resposta(s) marcada(s) como FALTA INFORMAÇÃO`);
    if (String(respostas.faltas || '').trim().length < 3) alerta('Lista do que falta ao cliente está vazia');
  } else {
    if (texto.trim().length < 20 && (!anexos || anexos.length === 0)) alerta('Entrega muito curta e sem anexo');
  }
  const nivel = itens.some((i) => !i.ok) ? 'atencao' : 'ok';
  return { nivel, itens };
}
