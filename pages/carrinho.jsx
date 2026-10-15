import { useState, useEffect } from "react";
import Link from "next/link";
import Head from "next/head";
import styles from "../styles/carrinho.module.css";

const CHAVE = "carrinho_fr";
const brl = (n) => "R$ " + Number(n || 0).toFixed(2).replace(".", ",");

export default function Carrinho() {
  const [carrinho, setCarrinho] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      setCarrinho(JSON.parse(localStorage.getItem(CHAVE) || "[]"));
    } catch {}
    setLoading(false);
  }, []);

  const salvar = (novo) => {
    setCarrinho(novo);
    try {
      localStorage.setItem(CHAVE, JSON.stringify(novo));
    } catch {}
  };
  const remover = (id) => salvar(carrinho.filter((i) => i.id !== id));
  const mudar = (id, q) => {
    const n = Math.max(1, parseInt(q, 10) || 1);
    salvar(carrinho.map((i) => (i.id === id ? { ...i, quantidade: n } : i)));
  };
  const total = carrinho.reduce((s, i) => s + i.preco * i.quantidade, 0);
  const pares = carrinho.reduce((s, i) => s + i.quantidade, 0);

  if (loading) return <div className={styles.container}>Carregando...</div>;

  return (
    <div className={styles.container}>
      <Head>
        <title>Seu pedido</title>
      </Head>
      <div className={styles.conteudo}>
        <h1>🛒 Seu pedido</h1>
        {carrinho.length === 0 ? (
          <div className={styles.vazio}>
            <p>Nenhum modelo no pedido ainda.</p>
            <Link href="/loja">
              <button className={styles.botao}>Ver a loja</button>
            </Link>
          </div>
        ) : (
          <>
            <table className={styles.tabela}>
              <thead>
                <tr>
                  <th>Modelo</th>
                  <th>Pares</th>
                  <th>Preço/par na fábrica</th>
                  <th>Subtotal</th>
                  <th>Ação</th>
                </tr>
              </thead>
              <tbody>
                {carrinho.map((i) => (
                  <tr key={i.id}>
                    <td>{i.nome}</td>
                    <td>
                      <input
                        type="number"
                        min="1"
                        value={i.quantidade}
                        onChange={(e) => mudar(i.id, e.target.value)}
                        style={{ width: 70, padding: 4 }}
                      />
                    </td>
                    <td>{brl(i.preco)}</td>
                    <td>{brl(i.preco * i.quantidade)}</td>
                    <td>
                      <button className={styles.botaoRemover} onClick={() => remover(i.id)}>
                        ❌ Remover
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className={styles.resumo}>
              <div className={styles.linha}>
                <span>Pares:</span>
                <span>{pares}</span>
              </div>
              <div className={styles.linha}>
                <span>Frete e serviço:</span>
                <span>a combinar</span>
              </div>
              <div className={styles.total}>
                <span>Total estimado na fábrica:</span>
                <span>{brl(total)}</span>
              </div>
            </div>
            <p style={{ fontSize: 13, color: "#666" }}>
              Valores sujeitos à confirmação com a fábrica (preço, estoque e pedido mínimo). Nada é cobrado pelo site.
            </p>

            <div className={styles.botoes}>
              <Link href="/loja">
                <button className={styles.botaoSecundario}>← Continuar escolhendo</button>
              </Link>
              <Link href="/checkout">
                <button className={styles.botaoPrincipal}>Enviar pedido →</button>
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
