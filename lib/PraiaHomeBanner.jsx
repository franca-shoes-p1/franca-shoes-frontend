import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import s from '../styles/praiaHome.module.css';

/* Capa do Parceiros da Praia na home: mesmo molde da Oficina, em tons de mar e pôr do sol.
   O número de vagas vem do painel (kits reais); sem vagas cadastradas, mostra "em breve". */
const LINHAS = ['Kit emprestado', 'Estoque do dia', 'Venda na praia', 'Conferência por foto', 'Lucro do dia', 'Divisão 50/50 no PIX'];
const icone = { fill: 'none', stroke: '#ffe2a8', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round', viewBox: '0 0 24 24' };

export default function PraiaHomeBanner() {
  const [v, setV] = useState(null);
  useEffect(() => {
    let vivo = true;
    fetch('/api/praia/vagas').then((r) => r.json()).then((d) => { if (vivo) setV(d); }).catch(() => {});
    return () => { vivo = false; };
  }, []);
  const texto = !v ? 'Vagas limitadas' : v.total > 0 ? `${v.livres} de ${v.total} vagas abertas` : 'Vagas limitadas';
  return (
    <>
      <section className={s.banner} aria-label="Parceiros da Praia">
        <div className={s.dentro}>
          <div>
            <span className={s.pilula}><i />Novo · {texto}</span>
            <h2 className={s.titulo}>Venda comida na praia <em>em parceria</em>.</h2>
            <p className={s.texto}>
              Você entra com o trabalho, eu entro com o kit e o estoque do dia. No fim, a conta é aberta e o lucro é dividido 50/50.
              Parceria entre autônomos, sem horário fixo e sem promessa de ganho.
            </p>
            <ul className={s.passos}>
              <li><b>1</b>Cadastre-se</li>
              <li><b>2</b>Regularize</li>
              <li><b>3</b>Venda</li>
            </ul>
            <div className={s.acoes}>
              <Link href="/praia/cadastro" className={`${s.botao} ${s.principal}`}>Quero uma vaga</Link>
              <Link href="/praia" className={`${s.botao} ${s.contorno}`}>Como funciona</Link>
            </div>
            <p className={s.nota}>Cada vaga é um kit real. Cadastro de ambulante e curso de manipulação são exigidos. Sem vínculo de emprego.</p>
          </div>
          <div className={s.palco} aria-hidden="true">
            <div className={s.cartao}>
              <h4 className={s.cartaoTopo}><span>Dia de venda</span><span>Exemplo</span></h4>
              {LINHAS.map((n) => (
                <div key={n} className={s.linha}><span>{n}</span><div className={s.barra}><span /></div><div className={s.ok}>✓</div></div>
              ))}
              <div className={s.rodape}><span>Conta aberta todo dia</span><span>Parceiros da Praia</span></div>
            </div>
            <div className={`${s.chip} ${s.c1}`}><svg {...icone}><circle cx="12" cy="12" r="4" /><path d="M12 2v3M12 19v3M2 12h3M19 12h3M5 5l2 2M17 17l2 2M19 5l-2 2M7 17l-2 2" /></svg>Temporada de verão</div>
            <div className={`${s.chip} ${s.c2}`}><svg {...icone}><path d="M3 12h18M7 7l-4 5 4 5M17 7l4 5-4 5" /></svg>Lucro 50/50</div>
            <div className={`${s.chip} ${s.c3}`}><svg {...icone}><rect x="7" y="2" width="10" height="20" rx="2" /><path d="M11 18h2" /></svg>Tudo pelo celular</div>
          </div>
        </div>
      </section>
      <nav className={s.faixa} aria-label="Atalhos do Parceiros da Praia">
        <div className={s.faixaGrade}>
          <Link href="/praia/cadastro" className={s.faixaItem}><span>🙋</span>Quero uma vaga</Link>
          <Link href="/praia#como" className={s.faixaItem}><span>🧭</span>Como funciona</Link>
          <Link href="/praia/socio" className={s.faixaItem}><span>🔑</span>Área do sócio</Link>
          <Link href="/praia#duvidas" className={s.faixaItem}><span>❓</span>Dúvidas</Link>
        </div>
      </nav>
    </>
  );
}
