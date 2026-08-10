import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import styles from '../styles/checkout.module.css';

export default function Checkout() {
  const router = useRouter();
  const [carrinho, setCarrinho] = useState([]);
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    telefone: '',
    endereco: '',
    numero: '',
    complemento: '',
    cidade: '',
    estado: '',
    cep: '',
  });
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState('');

  useEffect(() => {
    const carrinhoSalvo = localStorage.getItem('carrinho');
    if (carrinhoSalvo) {
      setCarrinho(JSON.parse(carrinhoSalvo));
    } else {
      setErro('Carrinho vazio!');
    }
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const calcularTotal = () => {
    return carrinho.reduce((total, item) => total + (item.preco * item.quantidade), 0).toFixed(2);
  };

  const handleConfirmarCompra = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErro('');
    setSucesso('');

    try {
      // Validação básica
      if (!formData.nome || !formData.email || !formData.telefone || !formData.endereco) {
        throw new Error('Preencha todos os campos obrigatórios');
      }

      const total = calcularTotal();

      // Simular chamada ao backend para gerar PIX
      const response = await fetch('/api/pix/gerar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cliente: formData,
          carrinho: carrinho,
          total: parseFloat(total),
        }),
      });

      if (!response.ok) {
        throw new Error('Erro ao processar pagamento');
      }

      const data = await response.json();
      
      // Salvar pedido no localStorage
      localStorage.setItem('ultimoPedido', JSON.stringify({
        id: data.pedidoId || Date.now(),
        cliente: formData,
        carrinho: carrinho,
        total: total,
        pix: data.pix,
        qrCode: data.qrCode,
        dataPedido: new Date().toISOString(),
      }));

      setSucesso('Pedido criado com sucesso! Redirecionando...');
      
      setTimeout(() => {
        router.push('/confirmacao');
      }, 1500);
    } catch (err) {
      setErro(err.message);
    } finally {
      setLoading(false);
    }
  };

  const total = calcularTotal();

  return (
    <div className={styles.container}>
      <div className={styles.conteudo}>
        <h1>Checkout</h1>

        {erro && <div className={styles.erro}>{erro}</div>}
        {sucesso && <div className={styles.sucesso}>{sucesso}</div>}

        <div className={styles.grid}>
          {/* Formulário */}
          <div className={styles.formulario}>
            <h2>Dados de Entrega</h2>
            <form onSubmit={handleConfirmarCompra}>
              <div className={styles.grupo}>
                <label>Nome Completo *</label>
                <input
                  type="text"
                  name="nome"
                  value={formData.nome}
                  onChange={handleInputChange}
                  placeholder="Seu nome"
                  required
                />
              </div>

              <div className={styles.grupo}>
                <label>Email *</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="seu@email.com"
                  required
                />
              </div>

              <div className={styles.grupo}>
                <label>Telefone/WhatsApp *</label>
                <input
                  type="tel"
                  name="telefone"
                  value={formData.telefone}
                  onChange={handleInputChange}
                  placeholder="(11) 99999-9999"
                  required
                />
              </div>

              <div className={styles.grupo}>
                <label>CEP</label>
                <input
                  type="text"
                  name="cep"
                  value={formData.cep}
                  onChange={handleInputChange}
                  placeholder="12345-678"
                />
              </div>

              <div className={styles.grupo}>
                <label>Endereço *</label>
                <input
                  type="text"
                  name="endereco"
                  value={formData.endereco}
                  onChange={handleInputChange}
                  placeholder="Rua, avenida, etc"
                  required
                />
              </div>

              <div className={styles.grupo}>
                <label>Número *</label>
                <input
                  type="text"
                  name="numero"
                  value={formData.numero}
                  onChange={handleInputChange}
                  placeholder="123"
                  required
                />
              </div>

              <div className={styles.grupo}>
                <label>Complemento</label>
                <input
                  type="text"
                  name="complemento"
                  value={formData.complemento}
                  onChange={handleInputChange}
                  placeholder="Apto, sala, etc"
                />
              </div>

              <div className={styles.grupo}>
                <label>Cidade *</label>
                <input
                  type="text"
                  name="cidade"
                  value={formData.cidade}
                  onChange={handleInputChange}
                  placeholder="São Paulo"
                  required
                />
              </div>

              <div className={styles.grupo}>
                <label>Estado *</label>
                <input
                  type="text"
                  name="estado"
                  value={formData.estado}
                  onChange={handleInputChange}
                  placeholder="SP"
                  required
                />
              </div>

              <button type="submit" disabled={loading} className={styles.botao}>
                {loading ? 'Processando...' : 'Confirmar Compra'}
              </button>
            </form>
          </div>

          {/* Resumo do Pedido */}
          <div className={styles.resumo}>
            <h2>Resumo do Pedido</h2>
            
            <div className={styles.itens}>
              {carrinho.length === 0 ? (
                <p>Carrinho vazio</p>
              ) : (
                carrinho.map((item, idx) => (
                  <div key={idx} className={styles.item}>
                    <div className={styles.info}>
                      <p className={styles.nome}>{item.nome}</p>
                      <p className={styles.detalhe}>{item.quantidade}x R$ {parseFloat(item.preco).toFixed(2)}</p>
                    </div>
                    <p className={styles.preco}>R$ {(item.preco * item.quantidade).toFixed(2)}</p>
                  </div>
                ))
              )}
            </div>

            <div className={styles.totalizacao}>
              <div className={styles.linha}>
                <span>Subtotal:</span>
                <span>R$ {total}</span>
              </div>
              <div className={styles.linha}>
                <span>Frete:</span>
                <span>GRÁTIS</span>
              </div>
              <div className={styles.total}>
                <span>Total:</span>
                <span>R$ {total}</span>
              </div>
            </div>

            <div className={styles.info}>
              <p>✓ Frete grátis em toda assinatura Franca+</p>
              <p>✓ Prazo de 5 a 10 dias úteis</p>
              <p>✓ PIX com QR code</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
