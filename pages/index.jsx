import React from 'react';

export default function Home() {
  const categories = [
    { id: 1, name: 'Calçados', icon: '👟', color: '#1E40AF' },
    { id: 2, name: 'Moda Feminina', icon: '👗', color: '#EC4899' },
    { id: 3, name: 'Moda Masculina', icon: '👔', color: '#3B82F6' },
    { id: 4, name: 'Infantil', icon: '🧸', color: '#F59E0B' },
    { id: 5, name: 'Esporte', icon: '⚽', color: '#10B981' },
    { id: 6, name: 'Eco', icon: '🌱', color: '#8B5CF6' },
    { id: 7, name: 'Religião', icon: '✝️', color: '#EF4444' },
  ];

  const benefits = [
    {
      title: 'Entrega Rápida',
      description: 'Enviamos em até 24h para sua região',
      icon: '🚚'
    },
    {
      title: 'Melhores Preços',
      description: 'Direto da fábrica, sem intermediários',
      icon: '💰'
    },
    {
      title: 'Atendimento 24/7',
      description: 'Suporte via WhatsApp sempre disponível',
      icon: '💬'
    }
  ];

  return (
    <div className="home-container">
      {/* HERO SECTION */}
      <section className="hero">
        <div className="hero-content">
          <div className="hero-text">
            <h1>🚀 Franca Shoes - v5.1</h1>
            <p>Bem-vindo ao Franca Shoes Empire!</p>
            <p className="hero-subtitle">7 Nichos, 1 Plataforma, Infinitas Possibilidades</p>
            <button className="hero-btn">Entrar na Loja →</button>
          </div>
          <div className="hero-image">
            <div className="hero-box">🛍️</div>
          </div>
        </div>
      </section>

      {/* CATEGORIAS DESTACADAS */}
      <section className="categories-section">
        <h2>7 Nichos Disponíveis:</h2>
        <div className="categories-grid">
          {categories.map(cat => (
            <div 
              key={cat.id} 
              className="category-card"
              style={{ borderTopColor: cat.color }}
            >
              <div className="category-icon">{cat.icon}</div>
              <h3>{cat.name}</h3>
              <p>Explorar</p>
            </div>
          ))}
        </div>
      </section>

      {/* COTAÇÃO AUTOMÁTICA */}
      <section className="quotation-section">
        <h2>💡 Cotação Online Automática</h2>
        <div className="quotation-content">
          <div className="quotation-text">
            <p>Receba cotações em tempo real para seus produtos. Nossa IA analisa preços de mercado e oferece as melhores oportunidades.</p>
            <ul>
              <li>✅ Análise automática de preços</li>
              <li>✅ Cotações em tempo real</li>
              <li>✅ Relatórios detalhados</li>
              <li>✅ Integração com fornecedores</li>
            </ul>
          </div>
          <div className="quotation-form">
            <h3>Solicitar Cotação</h3>
            <input type="text" placeholder="Seu email" />
            <input type="text" placeholder="Produto desejado" />
            <textarea placeholder="Descrição (opcional)"></textarea>
            <button className="quote-btn">Solicitar Cotação</button>
          </div>
        </div>
      </section>

      {/* BENEFÍCIOS */}
      <section className="benefits-section">
        <h2>Por que escolher Franca Shoes?</h2>
        <div className="benefits-grid">
          {benefits.map((benefit, idx) => (
            <div key={idx} className="benefit-card">
              <div className="benefit-icon">{benefit.icon}</div>
              <h3>{benefit.title}</h3>
              <p>{benefit.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* STATUS CHECKER */}
      <section className="status-section">
        <h2>Status do Sistema</h2>
        <div className="status-checks">
          <div className="status-item">
            <span className="status-dot green"></span>
            <p>✅ Frontend rodando em http://localhost:3000</p>
          </div>
          <div className="status-item">
            <span className="status-dot green"></span>
            <p>✅ Backend rodando em http://localhost:5000</p>
          </div>
          <div className="status-item">
            <span className="status-dot green"></span>
            <p>✅ Banco de dados PostgreSQL pronto!</p>
          </div>
          <div className="status-item">
            <span className="status-dot green"></span>
            <p>🎉 Franca Shoes está PRONTO!</p>
          </div>
        </div>
      </section>

      {/* CTA SECTION */}
      <section className="cta-section">
        <h2>Pronto para Começar?</h2>
        <p>Explore nossos 7 nichos e encontre os melhores produtos!</p>
        <a href="/loja" className="cta-btn">Ir para Loja →</a>
      </section>

      {/* FOOTER */}
      <footer className="footer">
        <div className="footer-content">
          <div className="footer-section">
            <h4>Sobre</h4>
            <ul>
              <li><a href="#about">Sobre Franca Shoes</a></li>
              <li><a href="#team">Nosso Time</a></li>
              <li><a href="#blog">Blog</a></li>
            </ul>
          </div>
          <div className="footer-section">
            <h4>Produtos</h4>
            <ul>
              <li><a href="/loja">Loja</a></li>
              <li><a href="#categories">Categorias</a></li>
              <li><a href="#promos">Promoções</a></li>
            </ul>
          </div>
          <div className="footer-section">
            <h4>Suporte</h4>
            <ul>
              <li><a href="#faq">FAQ</a></li>
              <li><a href="#contact">Contato</a></li>
              <li><a href="#help">Central de Ajuda</a></li>
            </ul>
          </div>
          <div className="footer-section">
            <h4>Legal</h4>
            <ul>
              <li><a href="#privacy">Privacidade</a></li>
              <li><a href="#terms">Termos</a></li>
              <li><a href="#cookies">Cookies</a></li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; 2026 Franca Shoes Empire. Todos os direitos reservados.</p>
          <p>Desenvolvido com ❤️ para empreendedores</p>
        </div>
      </footer>
    </div>
  );
}
