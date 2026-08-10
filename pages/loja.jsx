import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import styles from "../styles/loja.module.css";

export default function Loja() {
  const router = useRouter();
  const [produtos, setProdutos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const produtosAdmin = localStorage.getItem("produtos");
    if (produtosAdmin) {
      setProdutos(JSON.parse(produtosAdmin));
    } else {
      const produtosExemplo = [
        {
          id: 1,
          nome: "Tênis Esportivo Preto",
          preco: 189.90,
          imagem: "https://via.placeholder.com/300x300?text=Tênis+Preto",
          descricao: "Conforto e estilo",
          nicho: "1",
        },
        {
          id: 2,
          nome: "Tênis Branco Clássico",
          preco: 159.90,
          imagem: "https://via.placeholder.com/300x300?text=Tênis+Branco",
          descricao: "Design clássico",
          nicho: "1",
        },
        {
          id: 3,
          nome: "Sapato Social Marrom",
          preco: 249.90,
          imagem: "https://via.placeholder.com/300x300?text=Sapato+Social",
          descricao: "Elegância garantida",
          nicho: "1",
        },
      ];
      setProdutos(produtosExemplo);
      localStorage.setItem("produtos", JSON.stringify(produtosExemplo));
    }
    setLoading(false);
  }, []);

  const handleAdicionarCarrinho = (produto) => {
    try {
      const carrinho = JSON.parse(localStorage.getItem("carrinho") || "[]");
      const itemExistente = carrinho.find((item) => item.id === produto.id);
      if (itemExistente) {
        itemExistente.quantidade += 1;
      } else {
        carrinho.push({ ...produto, quantidade: 1 });
      }
      localStorage.setItem("carrinho", JSON.stringify(carrinho));
      alert(`✅ ${produto.nome} adicionado!`);
      router.push("/carrinho");
    } catch (erro) {
      alert("❌ Erro!");
      console.error(erro);
    }
  };

  if (loading) {
    return <div className={styles.container}>Carregando...</div>;
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>🛍️ LOJA FRANCA SHOES</h1>
        <Link href="/carrinho">
          <button className={styles.botaoCarrinho}>🛒 Ver Carrinho</button>
        </Link>
      </div>

      <div className={styles.grid}>
        {produtos.map((produto) => (
          <div key={produto.id} className={styles.card}>
            <div className={styles.imagem}>
              <img src={produto.imagem} alt={produto.nome} />
            </div>
            <div className={styles.conteudo}>
              <h3>{produto.nome}</h3>
              <p className={styles.descricao}>{produto.descricao}</p>
              <div className={styles.preco}>R$ {parseFloat(produto.preco).toFixed(2)}</div>
              <button
                className={styles.botao}
                onClick={() => handleAdicionarCarrinho(produto)}
              >
                🛒 Adicionar ao Carrinho
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
