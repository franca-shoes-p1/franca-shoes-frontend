// Vitrine que se atualiza sozinha durante a live. Serve a loja principal e as lojas dos membros.
import React, { useEffect, useState } from 'react';
import IconeProduto from './IconeProduto';
import v from '../styles/vitrineLive.module.css';

const CAT = [['', 'Tudo'], ['roupas', 'Roupas'], ['calcados', 'Calçados'], ['acessorios', 'Acessórios'], ['suvenires', 'Suvenires']];
const WHATSAPP = '5516991543663';
const brl = (n) => Number(n).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

export default function VitrineLive({ slug }) {
  const [dados, setDados] = useState(null);
  const [erro, setErro] = useState('');
  const [cat, setCat] = useState('');
  const [lista, setLista] = useState({});

  useEffect(() => {
    if (slug === undefined) return undefined;
    let vivo = true;
    const buscar = async () => {
      try {
        const r = await fetch(`/api/moda/vitrine${slug ? `?l=${encodeURIComponent(slug)}` : ''}`, { cache: 'no-store' });
        const j = await r.json();
        if (!vivo) return;
        if (r.ok) { setDados(j); setErro(''); } else setErro(j.erro || 'A vitrine está indisponível agora.');
      } catch (e) { if (vivo) setErro('Sem conexão. Tentando de novo…'); }
    };
    buscar();
    const t = setInterval(() => { if (!document.hidden) buscar(); }, 15000);
    return () => { vivo = false; clearInterval(t); };
  }, [slug]);

  const produtos = dados ? dados.produtos.filter((p) => !cat || p.categoria === cat) : [];
  const escolhidos = dados ? dados.produtos.filter((p) => lista[p.numero] && !p.esgotado) : [];
  const total = escolhidos.reduce((s, p) => s + p.preco * lista[p.numero], 0);
  const mudar = (n, q) => setLista((l) => { const x = { ...l, [n]: Math.max(0, Math.min(99, q)) }; if (!x[n]) delete x[n]; return x; });
  const mensagem = () => [
    'Olá! Tenho interesse nestes produtos da vitrine:',
    ...(dados.loja ? [`Loja: ${dados.loja.nome} (${dados.loja.slug})`] : []),
    ...escolhidos.map((p) => `• #${p.numero} ${p.nome} — ${lista[p.numero]} x ${brl(p.preco)}`),
    `Total sem frete: ${brl(total)}`,
    'Tamanho/cor: ',
  ].join('\n');

  return (
    <section className={v.area}>
      <div className={v.contido}>
        <h1>{dados && dados.loja ? dados.loja.nome : 'Vitrine ao vivo'}</h1>
        <p className={v.sub}>{dados && dados.loja ? 'Loja de membro · atendimento pela central Igreja Eco. ' : ''}Os produtos aparecem aqui durante as lives. Preços sem frete. A reserva só vale depois de confirmada.</p>
        <div className={v.filtros} role="group" aria-label="Categorias">
          {CAT.map(([k, t]) => <button key={k} type="button" className={cat === k ? v.on : undefined} aria-pressed={cat === k} onClick={() => setCat(k)}>{t}</button>)}
        </div>
        {erro && <p className={v.vazio} role="alert">{erro}</p>}
        {!dados && !erro && <p className={v.vazio}>Carregando a vitrine…</p>}
        {dados && !erro && produtos.length === 0 && <p className={v.vazio}>Ainda não há produtos aqui. Volte no horário da próxima live.</p>}
        <div className={v.grade}>
          {produtos.map((p) => (
            <article key={p.numero} className={v.cartao}>
              <div className={v.foto}>
                {p.foto ? <img src={p.foto} alt={p.nome} loading="lazy" /> : <IconeProduto id={p.categoria} tamanho={72} />}
                {p.esgotado && <span className={v.esgotado}>Esgotado</span>}
              </div>
              <div className={v.info}>
                <small>Código #{p.numero}</small>
                <h2>{p.nome}</h2>
                {p.descricao && <p>{p.descricao}</p>}
                {p.tamanhos && <p><b>Tamanhos/cores:</b> {p.tamanhos}</p>}
                <strong>{brl(p.preco)}</strong>
                {!p.esgotado && (lista[p.numero] ? (
                  <div className={v.qtd}>
                    <button type="button" aria-label="Tirar um" onClick={() => mudar(p.numero, lista[p.numero] - 1)}>−</button>
                    <span>{lista[p.numero]} na lista</span>
                    <button type="button" aria-label="Pôr mais um" onClick={() => mudar(p.numero, lista[p.numero] + 1)}>+</button>
                  </div>
                ) : <button type="button" className={v.por} onClick={() => mudar(p.numero, 1)}>Pôr na minha lista</button>)}
              </div>
            </article>
          ))}
        </div>
      </div>
      {escolhidos.length > 0 && (
        <div className={v.barra}>
          <span><b>{brl(total)}</b> · {escolhidos.length} {escolhidos.length === 1 ? 'produto' : 'produtos'}</span>
          <a href={`https://wa.me/${WHATSAPP}?text=${encodeURIComponent(mensagem())}`} target="_blank" rel="noopener noreferrer">Enviar orçamento no WhatsApp</a>
        </div>
      )}
    </section>
  );
}
