import React from 'react';

export default function Home() {
  return (
    <div className="home-container">
      {/* HERO */}
      <section className="hero">
        <div className="hero-content">
          <div className="hero-text">
            <h1>🚀 Franca Shoes - v5.1</h1>
            <p>Bem-vindo ao Franca Shoes Empire!</p>
            <p className="hero-subtitle">7 Nichos, 1 Plataforma, Infinitas Possibilidades</p>
            <button className="hero-btn">Entrar na Loja →</button>
          </div>
          <div className="hero-image">
            <div className="hero-box">👟</div>
          </div>
        </div>
      </section>

      {/* CATEGORIAS */}
      <section className="categories-section">
        <h2>7 Nichos Disponíveis:</h2>
        <div className="categories-grid">
          <div className="category-card">
            <div className="category-icon">👟</div>
            <h3>Calçados</h3>
            <p>Calçados Premium</p>
          </div>
          <div className="category-card">
            <div className="category-icon">👗</div>
            <h3>Moda Feminina</h3>
            <p>Moda Feminina Elegante</p>
          </div>
          <div className="category-card">
            <div className="category-icon">👔</div>
            <h3>Moda Masculina</h3>
            <p>Moda Masculina Sofisticada</p>
          </div>
          <div className="category-card">
            <div className="category-icon">👧</div>
            <h3>Infantil</h3>
            <p>Roupas Infantis</p>
          </div>
          <div className="category-card">
            <div className="category-icon">⛹️</div>
            <h3>Esporte</h3>
            <p>Esporte & Fitness</p>
          </div>
          <div className="category-card">
            <div className="category-icon">🌱</div>
            <h3>Eco</h3>
            <p>Sustentável</p>
          </div>
          <div className="category-card">
            <div className="category-icon">✝️</div>
            <h3>Religião</h3>
            <p>Comunidade Cristã</p>
          </div>
        </div>
      </section>

      {/* QUOTAÇÃO */}
      <section className="quotation-section">
        <h2>Cotação Automática</h2>
        <div className="quotation-content">
          <div className="quotation-text">
            <p>Sistema automático de cotação integrado com seu carrinho.</p>
            <ul>
              <li>✅ Cálculo automático de fretes</li>
              <li>✅ Integração com transportadoras</li>
              <li>✅ Cotação em tempo real</li>
            </ul>
          </div>
          <div className="quotation-form">
            <h3>Solicite uma Cotação</h3>
            <input type="text" placeholder="Seu nome" />
            <input type="email" placeholder="Seu email" />
            <textarea placeholder="Detalhes do pedido"></textarea>
            <button className="quote-btn">Solicitar Cotação</button>
          </div>
        </div>
      </section>

      {/* BENEFÍCIOS */}
      <section className="benefits-section">
        <h2>3 Benefícios Destacados</h2>
        <div className="benefits-grid">
          <div className="benefit-card">
            <div className="benefit-icon">🚚</div>
            <h3>Frete Grátis</h3>
            <p>Frete grátis em todas as compras acima de R$ 100.</p>
          </div>
          <div className="benefit-card">
            <div className="benefit-icon">💳</div>
            <h3>Parcelamento</h3>
            <p>Parcele em até 12x sem juros no cartão de crédito.</p>
          </div>
          <div className="benefit-card">
            <div className="benefit-icon">🔒</div>
            <h3>Segurança</h3>
            <p>Compra 100% segura com criptografia SSL.</p>
          </div>
        </div>
      </section>

      {/* STATUS */}
      <section className="status-section">
        <h2>Status do Sistema</h2>
        <div className="status-checks">
          <div className="status-item">
            <div className="status-dot green"></div>
            <p>Frontend rodando em http://localhost:3000</p>
          </div>
          <div className="status-item">
            <div className="status-dot green"></div>
            <p>Backend rodando em http://localhost:5000</p>
          </div>
          <div className="status-item">
            <div className="status-dot green"></div>
            <p>Banco de dados PostgreSQL pronto!</p>
          </div>
          <div className="status-item">
            <div className="status-dot green"></div>
            <p>🎉 Franca Shoes está PRONTO!</p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="cta-section">
        <h2>Comece a Vender Agora!</h2>
        <p>Sua loja online está pronta para receber clientes</p>
        <a href="/loja" className="cta-btn">Ir para Loja →</a>
      </section>

      {/* FOOTER */}
      <footer className="footer">
        <div className="footer-content">
          <div className="footer-section">
            <h4>Sobre</h4>
            <ul>
              <li><a href="#">Sobre Nós</a></li>
              <li><a href="#">Missão</a></li>
              <li><a href="#">Visão</a></li>
            </ul>
          </div>
          <div className="footer-section">
            <h4>Produtos</h4>
            <ul>
              <li><a href="#">Calçados</a></li>
              <li><a href="#">Moda</a></li>
              <li><a href="#">Esporte</a></li>
            </ul>
          </div>
          <div className="footer-section">
            <h4>Contato</h4>
            <ul>
              <li><a href="#">Email: contato@franca-shoes.com</a></li>
              <li><a href="#">WhatsApp: (16) 99999-9999</a></li>
              <li><a href="#">Telefone: (16) 3333-3333</a></li>
            </ul>
          </div>
          <div className="footer-section">
            <h4>Redes Sociais</h4>
            <ul>
              <li><a href="#">Instagram</a></li>
              <li><a href="#">TikTok</a></li>
              <li><a href="#">Facebook</a></li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; 2026 Franca Shoes. Todos os direitos reservados.</p>
          <p>Desenvolvido com ❤️ por Ricardo Belo</p>
        </div>
      </footer>
    </div>
  );
}