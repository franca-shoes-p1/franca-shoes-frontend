import React from 'react';
import s from '../styles/escola.module.css';

/* Mostra o texto da aula sem aceitar HTML: "## " vira subtítulo, "- " vira lista, linha em branco separa parágrafos. */
export default function EscolaTexto({ texto }) {
  const blocos = String(texto || '').replace(/\r/g, '').split(/\n{2,}/).map((b) => b.trim()).filter(Boolean);
  return (
    <div className={s.texto}>
      {blocos.map((b, i) => {
        if (b.startsWith('## ')) return <h3 key={i}>{b.slice(3)}</h3>;
        const linhas = b.split('\n');
        if (linhas.every((l) => l.trim().startsWith('- '))) {
          return <ul key={i}>{linhas.map((l, j) => <li key={j}>{l.trim().slice(2)}</li>)}</ul>;
        }
        return <p key={i}>{b}</p>;
      })}
    </div>
  );
}
