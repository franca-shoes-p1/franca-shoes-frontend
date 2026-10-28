import React, { useMemo, useState } from 'react';
import s from '../styles/livros.module.css';
import LivroCapa from './LivroCapa';
import { TIPOS, TEMAS, PUBLICOS, SETORES, montarFicha } from './motorLivros';

const WHATS = '5516991543663';

export default function MotorLivros() {
  const [tipo, setTipo] = useState('manual');
  const [tema, setTema] = useState('mordomia');
  const [publico, setPublico] = useState('igreja');
  const [copiado, setCopiado] = useState(false);
  const f = useMemo(() => montarFicha({ tipo, tema, publico }), [tipo, tema, publico]);

  async function copiar() {
    try {
      await navigator.clipboard.writeText(f.texto);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2200);
    } catch (e) {
      setCopiado(false);
    }
  }

  return (
    <div className={s.motor}>
      <div className={s.motorForm}>
        <label htmlFor="mt">Tipo de livro</label>
        <select id="mt" value={tipo} onChange={(e) => setTipo(e.target.value)}>
          {Object.entries(TIPOS).map(([k, v]) => <option key={k} value={k}>{v.nome}</option>)}
        </select>
        <label htmlFor="mm">Tema</label>
        <select id="mm" value={tema} onChange={(e) => setTema(e.target.value)}>
          {Object.entries(TEMAS).map(([k, v]) => <option key={k} value={k}>{v.nome}</option>)}
        </select>
        <label htmlFor="mp">Para quem</label>
        <select id="mp" value={publico} onChange={(e) => setPublico(e.target.value)}>
          {Object.entries(PUBLICOS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
        <p className={s.motorNota}>A ficha muda na hora. Não usa IA nem gasta nada: é um modelo pronto que a equipe depois transforma em livro de verdade.</p>
      </div>

      <div className={s.motorSaida} aria-live="polite">
        <div className={s.motorCapa}><LivroCapa livro={f.livro} /></div>
        <div className={s.motorFicha}>
          <h3>{f.titulo}</h3>
          <p className={s.motorSelo}>{f.selo}</p>
          <ol>
            {f.capitulos.map((c) => <li key={c}>{c.replace(/^\d+\.\s/, '')}</li>)}
          </ol>
          <p className={s.motorPreco}><b>Preço de teste:</b> {f.preco}</p>
          <div className={s.motorEquipe}>
            {SETORES.map((x) => <span key={x.t} title={x.d}>{x.e} {x.t}</span>)}
          </div>
          <div className={s.motorAcoes}>
            <a className={s.btn} href={`https://wa.me/${WHATS}?text=${encodeURIComponent(f.pedido)}`} target="_blank" rel="noopener noreferrer">Pedir este livro</a>
            <button type="button" className={s.btnC} onClick={copiar}>{copiado ? 'Ficha copiada' : 'Copiar a ficha'}</button>
          </div>
          <p className={s.motorNota}>Pedido sem compromisso. Não prometemos vendas nem ganhos.</p>
        </div>
      </div>
    </div>
  );
}
