import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import VarejoLayout from '../../lib/VarejoLayout';
import styles from '../../styles/varejo.module.css';
import { brl, VAREJO, guardarRevDaUrl, lerRev } from '../../lib/varejo';

export default function Vitrine() {
  const [produtos, setProdutos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categoria, setCategoria] = useState('');
  const [busca, setBusca] = useState('');
  const [rev, setRev] = useState(null);
  const [revInativo, setRevInativo] = useState(false);

  useEffect(() => {
    guardarRevDaUrl();
    const codigo = lerRev();
    fetch('/api/varejo/catalogo' + (codigo ? `?rev=${codigo}` : ''))
      .then((r) => r.json())
      .then((j) => { setProdutos(j.produtos || []); setRev(j.revendedor || null); setRevInativo(!!j.revInativo); })
      .catch(() => setProdutos([]))
      .finally(() => setLoading(false));
  }, []);

  const categorias = useMemo(() => [...new Set(produtos.map((p) => p.categoria).filter(Boolean))].sort(), [produtos]);
  const filtrados = useMemo(() => {
    const b = busca.trim().toLowerCase();
    return produtos.filter(
      (p) => (!categoria || p.categoria === categoria) && (!b || `${p.titulo} ${p.categoria} ${p.material}`.toLowerCase().includes(b))
    );
  }, [produtos, categoria, busca]);

  return (
    <VarejoLayout>
      {rev && <div className={styles.faixa}>🤝 Você está sendo atendido por <strong>{rev.nome}</strong>{rev.cidade ? ` (${rev.cidade}/${rev.estado})` : ''}. Os preços já são os dele.</div>}
      {revInativo && <div className={styles.erro}>Este link de revendedor está inativo no momento. Os preços abaixo são os preços normais do site.</div>}
      <div className={styles.faixa}>
        🏭 Calçados e acessórios direto das fábricas de Franca. Pague com <strong>PIX ou cartão</strong>. Seu pedido é separado na
        fábrica em {VAREJO.prazoPreparoDias} e enviado para você.
      </div>

      <div className={styles.filtros}>
        <input className={styles.busca} placeholder="Buscar modelo…" value={busca} onChange={(e) => setBusca(e.target.value)} />
        <button className={`${styles.chip} ${!categoria ? styles.chipAtivo : ''}`} onClick={() => setCategoria('')}>
          Todos
        </button>
        {categorias.map((c) => (
          <button key={c} className={`${styles.chip} ${categoria === c ? styles.chipAtivo : ''}`} onClick={() => setCategoria(c)}>
            {c}
          </button>
        ))}
      </div>

      {loading ? (
        <p>Carregando…</p>
      ) : filtrados.length === 0 ? (
        <div className={styles.vazio}>
          <p>{produtos.length === 0 ? 'Estamos montando o catálogo. Volte em breve!' : 'Nenhum modelo encontrado com esse filtro.'}</p>
          <p style={{ marginTop: 10 }}>
            <a href={`https://wa.me/${VAREJO.whatsapp}`} target="_blank" rel="noopener noreferrer">
              Fale com a loja no WhatsApp
            </a>
          </p>
        </div>
      ) : (
        <div className={styles.grade}>
          {filtrados.map((p) => (
            <Link key={p.id} href={`/calcados/${p.id}`} className={styles.card}>
              <div className={styles.foto}>{p.foto ? <img src={p.foto} alt={p.titulo} loading="lazy" /> : '👟'}</div>
              <div className={styles.cardCorpo}>
                {p.categoria && <span className={styles.cardCategoria}>{p.categoria}</span>}
                <span className={styles.cardTitulo}>{p.titulo}</span>
                <span className={styles.preco}>{brl(p.preco)}</span>
                <span className={styles.parcela}>{p.vendedor ? `por ${p.vendedor}` : 'no PIX ou cartão'}</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </VarejoLayout>
  );
}
