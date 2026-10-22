import { useEffect, useState } from 'react';
import Link from 'next/link';
import VarejoLayout from '../../lib/VarejoLayout';
import styles from '../../styles/varejo.module.css';
import { brl, lerCarrinho, salvarCarrinho, chaveItem, subtotalCarrinho, totalPares, VAREJO } from '../../lib/varejo';

export default function Carrinho() {
  const [itens, setItens] = useState([]);
  const [pronto, setPronto] = useState(false);

  useEffect(() => {
    setItens(lerCarrinho());
    setPronto(true);
  }, []);

  const atualizar = (novo) => {
    setItens(novo);
    salvarCarrinho(novo);
  };
  const remover = (k) => atualizar(itens.filter((i) => chaveItem(i) !== k));
  const mudar = (k, q) => {
    const n = Math.max(1, Math.min(10, parseInt(q, 10) || 1));
    atualizar(itens.map((i) => (chaveItem(i) === k ? { ...i, quantidade: n } : i)));
  };

  const subtotal = subtotalCarrinho(itens);

  return (
    <VarejoLayout titulo="Carrinho">
      <h1 style={{ marginBottom: 14 }}>🛒 Seu carrinho</h1>
      {!pronto ? (
        <p>Carregando…</p>
      ) : itens.length === 0 ? (
        <div className={styles.vazio}>
          <p>Seu carrinho está vazio.</p>
          <p style={{ marginTop: 10 }}>
            <Link href="/calcados" className={styles.botaoSecundario}>Ver os modelos</Link>
          </p>
        </div>
      ) : (
        <div className={styles.duasColunas}>
          <div className={styles.caixa}>
            {itens.map((i) => {
              const k = chaveItem(i);
              return (
                <div key={k} className={styles.linhaItem}>
                  <div className={styles.miniFoto}>
                    {i.foto && /^https:\/\//.test(i.foto) ? <img src={i.foto} alt="" /> : '👟'}
                  </div>
                  <div>
                    <div className={styles.itemNome}>{i.nome}</div>
                    <div className={styles.itemMeta}>
                      Nº {i.tamanho} · {brl(i.preco)} cada
                    </div>
                    <div style={{ marginTop: 6, display: 'flex', alignItems: 'center', gap: 8 }}>
                      <input
                        className={styles.campo}
                        style={{ width: 70, padding: 6 }}
                        type="number"
                        min="1"
                        max="10"
                        value={i.quantidade}
                        onChange={(e) => mudar(k, e.target.value)}
                      />
                      <button className={styles.remover} onClick={() => remover(k)}>
                        Remover
                      </button>
                    </div>
                  </div>
                  <div className={styles.itemDireita}>{brl(i.preco * i.quantidade)}</div>
                </div>
              );
            })}
          </div>

          <div className={styles.caixa}>
            <h2>Resumo</h2>
            <div className={styles.linhaTotal}>
              <span>Produtos ({totalPares(itens)})</span>
              <span>{brl(subtotal)}</span>
            </div>
            <div className={styles.linhaTotal}>
              <span>Frete</span>
              <span>calculado no próximo passo</span>
            </div>
            <div className={`${styles.linhaTotal} ${styles.totalFinal}`}>
              <span>Subtotal</span>
              <span>{brl(subtotal)}</span>
            </div>
            <Link href="/calcados/checkout" className={styles.botaoPrincipal}>
              Continuar para entrega e pagamento
            </Link>
            <p className={styles.parcela} style={{ marginTop: 10 }}>
              Separado na fábrica em {VAREJO.prazoPreparoDias} após o pagamento.
            </p>
            <p style={{ marginTop: 12 }}>
              <Link href="/calcados">← Continuar comprando</Link>
            </p>
          </div>
        </div>
      )}
    </VarejoLayout>
  );
}
