import { useState, useEffect } from "react";
import Link from "next/link";
import Head from "next/head";
import styles from "../styles/loja.module.css";

const CHAVE = "carrinho_fr";
const brl = (n) => "R$ " + Number(n || 0).toFixed(2).replace(".", ",");

export default function Loja() {
  const [modelos, setModelos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [qtd, setQtd] = useState({});
  const [noCarrinho, setNoCarrinho] = useState(0);

  const lerCarrinho = () => {
    try {
      return JSON.parse(localStorage.getItem(CHAVE) || "[]");
    } catch {
      return [];
    }
  };

  useEffect(() => {
    setNoCarrinho(lerCarrinho().reduce((s, i) => s + i.quantidade, 0));
    fetch("/api/catalogo")
      .then((r) => r.json())
      .then((j) => setModelos(j.modelos || []))
      .catch(() => setModelos([]))
      .finally(() => setLoading(false));
  }, []);

  const adicionar = (m) => {
    const q = Math.max(1, parseInt(qtd[m.id] || 12, 10) || 1);
    const carrinho = lerCarrinho();
    const item = carrinho.find((i) => i.id === m.id);
    if (item) item.quantidade += q;
    else carrinho.push({ id: m.id, nome: m.titulo, preco: m.precoFabrica, quantidade: q });
    try {
      localStorage.setItem(CHAVE, JSON.stringify(carrinho));
    } catch {}
    setNoCarrinho(carrinho.reduce((s, i) => s + i.quantidade, 0));
  };

  if (loading) return <div className={styles.container}>Carregando...</div>;

  return (
    <div className={styles.container}>
      <Head>
        <title>Loja — calçados e acessórios de Franca</title>
      </Head>
      <div className={styles.header}>
        <h1>🛍️ Loja de Franca</h1>
        <Link href="/carrinho">
          <button className={styles.botaoCarrinho}>🛒 Carrinho ({noCarrinho} pares)</button>
        </Link>
      </div>

      <p style={{ maxWidth: 1200, margin: "-20px auto 24px", color: "#555" }}>
        Modelos de fábricas de Franca já conferidos. Escolha as quantidades e envie o pedido: eu confirmo preço e estoque com a
        fábrica e te respondo pelo WhatsApp. Não há pagamento no site.
      </p>

      {modelos.length === 0 ? (
        <p style={{ maxWidth: 1200, margin: "0 auto" }}>
          Catálogo em montagem. Os primeiros modelos entram assim que forem confirmados com as fábricas.{" "}
          <Link href="/calculadora">Teste sua margem na calculadora</Link>.
        </p>
      ) : (
        <div className={styles.grid}>
          {modelos.map((m) => (
            <div key={m.id} className={styles.card}>
              <div className={styles.imagem}>
                {m.foto && /^https:\/\//.test(m.foto) ? (
                  <img src={m.foto} alt={m.titulo} />
                ) : (
                  <div style={{ fontSize: 64, textAlign: "center", padding: "60px 0" }}>👟</div>
                )}
              </div>
              <div className={styles.conteudo}>
                <h3>{m.titulo}</h3>
                <p className={styles.descricao}>{[m.categoria, m.material, m.tamanhos].filter(Boolean).join(" · ")}</p>
                <div className={styles.preco}>{brl(m.precoFabrica)} <small>por par na fábrica</small></div>
                {m.precoVenda > 0 && <p className={styles.descricao}>Venda sugerida: {brl(m.precoVenda)}</p>}
                <div style={{ display: "flex", gap: 8, alignItems: "center", margin: "8px 0" }}>
                  <label style={{ fontSize: 13 }}>Pares:</label>
                  <input
                    type="number"
                    min="1"
                    value={qtd[m.id] ?? 12}
                    onChange={(e) => setQtd({ ...qtd, [m.id]: e.target.value })}
                    style={{ width: 80, padding: 6 }}
                  />
                </div>
                <button className={styles.botao} onClick={() => adicionar(m)}>
                  🛒 Adicionar ao pedido
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
