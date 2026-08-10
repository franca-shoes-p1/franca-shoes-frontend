import React, { useState, useMemo } from 'react';

export default function Loja() {
  // Produtos mock (serÃ¡ substituÃ­do por dados reais do backend em P2)
  const allProducts = [
    { id: 1, name: 'TÃªnis Casual Premium', category: 'CalÃ§ados', price: 129.90, size: 'P', color: 'Preto', image: 'ðŸ‘Ÿ' },
    { id: 2, name: 'Sneaker Branco', category: 'CalÃ§ados', price: 119.90, size: 'M', color: 'Branco', image: 'ðŸ‘Ÿ' },
    { id: 3, name: 'Vestido Florido', category: 'Moda Feminina', price: 89.90, size: 'P', color: 'Rosa', image: 'ðŸ‘—' },
    { id: 4, name: 'Blusa Social', category: 'Moda Feminina', price: 79.90, size: 'M', color: 'Azul', image: 'ðŸ‘—' },
    { id: 5, name: 'Camisa Polo', category: 'Moda Masculina', price: 99.90, size: 'M', color: 'Azul', image: 'ðŸ‘”' },
    { id: 6, name: 'CalÃ§a Jeans', category: 'Moda Masculina', price: 109.90, size: 'G', color: 'Azul', image: 'ðŸ‘”' },
    { id: 7, name: 'MacacÃ£o Infantil', category: 'Infantil', price: 59.90, size: 'P', color: 'Amarelo', image: 'ðŸ§¸' },
    { id: 8, name: 'Vestido Infantil', category: 'Infantil', price: 64.90, size: 'M', color: 'Rosa', image: 'ðŸ§¸' },
    { id: 9, name: 'Camiseta Esporte', category: 'Esporte', price: 69.90, size: 'M', color: 'Preto', image: 'âš½' },
    { id: 10, name: 'CalÃ§Ã£o Esportivo', category: 'Esporte', price: 79.90, size: 'G', color: 'Vermelho', image: 'âš½' },
    { id: 11, name: 'Camiseta Eco', category: 'Eco', price: 59.90, size: 'M', color: 'Verde', image: 'ðŸŒ±' },
    { id: 12, name: 'CalÃ§a SustentÃ¡vel', category: 'Eco', price: 99.90, size: 'G', color: 'Marrom', image: 'ðŸŒ±' },
    { id: 13, name: 'Vestido Religioso', category: 'ReligiÃ£o', price: 74.90, size: 'M', color: 'Branco', image: 'âœï¸' },
    { id: 14, name: 'Camisa Religiosa', category: 'ReligiÃ£o', price: 59.90, size: 'G', color: 'Azul', image: 'âœï¸' },
  ];

  const categories = ['CalÃ§ados', 'Moda Feminina', 'Moda Masculina', 'Infantil', 'Esporte', 'Eco', 'ReligiÃ£o'];
  const sizes = ['P', 'M', 'G', 'GG'];
  const colors = ['Preto', 'Branco', 'Azul', 'Rosa', 'Amarelo', 'Verde', 'Vermelho', 'Marrom'];

  // Estados dos filtros
  const [searchText, setSearchText] = useState('');
  const router = useRouter();

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
      alert(`✅ ${produto.nome} adicionado ao carrinho!`);
      router.push("/carrinho");
    } catch (erro) {
      alert("❌ Erro ao adicionar!");
      console.error(erro);
    }
  };
  const [selectedCategory, setSelectedCategory] = useState('');
  const router = useRouter();

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
      alert(`✅ ${produto.nome} adicionado ao carrinho!`);
      router.push("/carrinho");
    } catch (erro) {
      alert("❌ Erro ao adicionar!");
      console.error(erro);
    }
  };
  const [maxPrice, setMaxPrice] = useState(200);
  const router = useRouter();

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
      alert(`✅ ${produto.nome} adicionado ao carrinho!`);
      router.push("/carrinho");
    } catch (erro) {
      alert("❌ Erro ao adicionar!");
      console.error(erro);
    }
  };
  const [selectedSize, setSelectedSize] = useState('');
  const router = useRouter();

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
      alert(`✅ ${produto.nome} adicionado ao carrinho!`);
      router.push("/carrinho");
    } catch (erro) {
      alert("❌ Erro ao adicionar!");
      console.error(erro);
    }
  };
  const [selectedColor, setSelectedColor] = useState('');
  const router = useRouter();

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
      alert(`✅ ${produto.nome} adicionado ao carrinho!`);
      router.push("/carrinho");
    } catch (erro) {
      alert("❌ Erro ao adicionar!");
      console.error(erro);
    }
  };

  // Filtrar produtos
  const filteredProducts = useMemo(() => {
    return allProducts.filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(searchText.toLowerCase());
      const matchesCategory = selectedCategory === '' || product.category === selectedCategory;
      const matchesPrice = product.price <= maxPrice;
      const matchesSize = selectedSize === '' || product.size === selectedSize;
      const matchesColor = selectedColor === '' || product.color === selectedColor;

      return matchesSearch && matchesCategory && matchesPrice && matchesSize && matchesColor;
    });
  }, [searchText, selectedCategory, maxPrice, selectedSize, selectedColor]);

  const handleClearFilters = () => {
    setSearchText('');
    setSelectedCategory('');
    setMaxPrice(200);
    setSelectedSize('');
    setSelectedColor('');
  };

  return (
    <div className="loja-container">
      {/* HEADER */}
      <div className="loja-header">
        <h1>ðŸ›’ Loja Franca Shoes</h1>
        <p>Explore nossos 7 nichos e encontre os melhores produtos!</p>
      </div>

      <div className="loja-content">
        {/* SIDEBAR COM FILTROS */}
        <aside className="filters-sidebar">
          <div className="filters-header">
            <h2>Filtros</h2>
            <button className="clear-btn" onClick={handleClearFilters}>
              Limpar Tudo
            </button>
          </div>

          {/* BUSCA */}
          <div className="filter-group">
            <label>ðŸ” Buscar Produto</label>
            <input
              type="text"
              placeholder="Digite o nome ou marca..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="filter-input"
            />
          </div>

          {/* CATEGORIA */}
          <div className="filter-group">
            <label>ðŸ“¦ Categoria</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="filter-select"
            >
              <option value="">Todas as categorias</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {/* PREÃ‡O */}
          <div className="filter-group">
            <label>ðŸ’° PreÃ§o MÃ¡ximo</label>
            <input
              type="range"
              min="0"
              max="200"
              value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
              className="filter-slider"
            />
            <div className="price-display">
              R$ 0 - R$ {maxPrice.toFixed(2)}
            </div>
          </div>

          {/* TAMANHO */}
          <div className="filter-group">
            <label>ðŸ“ Tamanho</label>
            <select
              value={selectedSize}
              onChange={(e) => setSelectedSize(e.target.value)}
              className="filter-select"
            >
              <option value="">Todos os tamanhos</option>
              {sizes.map(size => (
                <option key={size} value={size}>{size}</option>
              ))}
            </select>
          </div>

          {/* COR */}
          <div className="filter-group">
            <label>ðŸŽ¨ Cor</label>
            <select
              value={selectedColor}
              onChange={(e) => setSelectedColor(e.target.value)}
              className="filter-select"
            >
              <option value="">Todas as cores</option>
              {colors.map(color => (
                <option key={color} value={color}>{color}</option>
              ))}
            </select>
          </div>

          {/* INFO DOS FILTROS */}
          <div className="filters-info">
            <p>
              <strong>{filteredProducts.length}</strong> produto(s) encontrado(s)
            </p>
          </div>
        </aside>

        {/* GRID DE PRODUTOS */}
        <main className="products-main">
          {filteredProducts.length > 0 ? (
            <div className="products-grid">
              {filteredProducts.map(product => (
                <div key={product.id} className="product-card">
                  <div className="product-image">
                    <span className="product-emoji">{product.image}</span>
                  </div>
                  <div className="product-info">
                    <h3>{product.name}</h3>
                    <p className="product-category">{product.category}</p>
                    <div className="product-specs">
                      <span className="spec">ðŸ“ {product.size}</span>
                      <span className="spec">ðŸŽ¨ {product.color}</span>
                    </div>
                    <div className="product-footer">
                      <span className="price">R$ {product.price.toFixed(2)}</span>
                      <button className="add-btn">🛒 Adicionar ao Carrinho</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="no-products">
              <p>ðŸ˜¢ Nenhum produto encontrado com os filtros selecionados.</p>
              <p>Tente ajustar os filtros!</p>
              <button className="reset-btn" onClick={handleClearFilters}>
                Limpar Filtros
              </button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

