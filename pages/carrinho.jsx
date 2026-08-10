import { useState, useEffect } from 'react';
import Link from 'next/link';
import styles from '../styles/carrinho.module.css';

export default function Carrinho() {
  const [carrinho, setCarrinho] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const carrinhoSalvo = localStorage.getItem('carrinho');
    if (carrinhoSalvo) {
      setCarrinho(JSON.parse(carrinhoSalvo));
    }
    setLoading(false);
  }, []);

  const handleRemover = (id) => {
    const novoCarrinho = carrinho.filter(item => item.id !== id);
    setCarrinho(novoCarrinho);
    localStorage.setItem('carrinho', JSON.stringify(novoCarrinho));
  };

  const calcularTotal = () => {
    return carrinho.reduce((total, item) => total + (item.preco * item.quantidade), 0).toFixed(2);
  };

  if (loading) {
    return <div className={styles.container}>Carregando...</div>;
  }

  return (
    <div className={styles.container}>
      <div className={styles.conteudo}>
        <h1>🛒 Seu Carrinho</h1>

        {carrinho.length === 0 ? (
          <div className={styles.vazio}>
            <p>Carrinho vazio!</p>
            <Link href="/loja">
              <button className={styles.botao}>Voltar para Loja</button>
            </Link>
          </div>
        ) : (
          <>
            <table className={styles.tabela}>
              <thead>
                <tr>
                  <th>Produto</th>
                  <th>Quantidade</th>
                  <th>Preço Unit.</th>
                  <th>Subtotal</th>
                  <th>Ação</th>
                </tr>
              </thead>
              <tbody>
                {carrinho.map((item) => (
                  <tr key={item.id}>
                    <td>{item.nome}</td>
                    <td>{item.quantidade}</td>
                    <td>R$ {parseFloat(item.preco).toFixed(2)}</td>
                    <td>R$ {(item.preco * item.quantidade).toFixed(2)}</td>
                    <td>
                      <button 
                        className={styles.botaoRemover}
                        onClick={() => handleRemover(item.id)}
                      >
                        ❌ Remover
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className={styles.resumo}>
              <div className={styles.linha}>
                <span>Subtotal:</span>
                <span>R$ {calcularTotal()}</span>
              </div>
              <div className={styles.linha}>
                <span>Frete:</span>
                <span>GRÁTIS</span>
              </div>
              <div className={styles.total}>
                <span>Total:</span>
                <span>R$ {calcularTotal()}</span>
              </div>
            </div>

            <div className={styles.botoes}>
              <Link href="/loja">
                <button className={styles.botaoSecundario}>← Continuar Comprando</button>
              </Link>
              <Link href="/checkout">
                <button className={styles.botaoPrincipal}>Ir para Checkout →</button>
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
