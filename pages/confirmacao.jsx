import { useState, useEffect } from 'react';
import Link from 'next/link';
import styles from '../styles/confirmacao.module.css';

export default function Confirmacao() {
  const [pedido, setPedido] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const ultimoPedido = localStorage.getItem('ultimoPedido');
    if (ultimoPedido) {
      setPedido(JSON.parse(ultimoPedido));
    }
    setLoading(false);
  }, []);

  if (loading) {
    return <div className={styles.container}>Carregando...</div>;
  }

  if (!pedido) {
    return (
      <div className={styles.container}>
        <div className={styles.conteudo}>
          <h1>Nenhum pedido encontrado</h1>
          <Link href="/loja">
            <button className={styles.botao}>Voltar para Loja</button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.conteudo}>
        <div className={styles.sucesso}>
          <h1>✅ Pedido Confirmado!</h1>
          <p>Seu pedido foi recebido com sucesso</p>
        </div>

        <div className={styles.pedidoInfo}>
          <div className={styles.card}>
            <h2>Detalhes do Pedido</h2>
            <p><strong>ID do Pedido:</strong> {pedido.id}</p>
            <p><strong>Cliente:</strong> {pedido.cliente.nome}</p>
            <p><strong>Email:</strong> {pedido.cliente.email}</p>
            <p><strong>Telefone:</strong> {pedido.cliente.telefone}</p>
            <p><strong>Endereço:</strong> {pedido.cliente.endereco}, {pedido.cliente.numero}</p>
            <p><strong>Cidade/Estado:</strong> {pedido.cliente.cidade}, {pedido.cliente.estado}</p>
          </div>

          <div className={styles.card}>
            <h2>Itens do Pedido</h2>
            {pedido.carrinho.map((item, idx) => (
              <div key={idx} className={styles.item}>
                <p>{item.nome}</p>
                <p>{item.quantidade}x R$ {parseFloat(item.preco).toFixed(2)}</p>
              </div>
            ))}
            <div className={styles.total}>
              <strong>Total: R$ {pedido.total}</strong>
            </div>
          </div>

          <div className={styles.card}>
            <h2>📱 PIX Simulado</h2>
            <p className={styles.qrinfo}>QR Code PIX seria gerado aqui</p>
            <p><small>Em produção, integre com a API do banco para gerar QR Code real</small></p>
            <div className={styles.pixinfo}>
              <p><strong>Chave PIX:</strong> sua-chave@banco.com</p>
              <p><strong>Valor:</strong> R$ {pedido.total}</p>
            </div>
          </div>
        </div>

        <div className={styles.acoes}>
          <Link href="/loja">
            <button className={styles.botaoPrincipal}>Fazer Novo Pedido</button>
          </Link>
        </div>
      </div>
    </div>
  );
}
