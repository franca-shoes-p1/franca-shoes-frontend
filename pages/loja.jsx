import React, { useState, useMemo } from 'react';

export default function Loja() {
  // Produtos mock (será substituído por dados reais do backend em P2)
  const allProducts = [
    { id: 1, name: 'Tênis Casual Premium', category: 'Calçados', price: 129.90, size: 'P', color: 'Preto', image: '👟' },
    { id: 2, name: 'Sneaker Branco', category: 'Calçados', price: 119.90, size: 'M', color: 'Branco', image: '👟' },
    { id: 3, name: 'Vestido Florido', category: 'Moda Feminina', price: 89.90, size: 'P', color: 'Rosa', image: '👗' },
    { id: 4, name: 'Blusa Social', category: 'Moda Feminina', price: 79.90, size: 'M', color: 'Azul', image: '👗' },
    { id: 5, name: 'Camisa Polo', category: 'Moda Masculina', price: 99.90, size: 'M', color: 'Azul', image: '👔' },
    { id: 6, name: 'Calça Jeans', category: 'Moda Masculina', price: 109.90, size: 'G', color: 'Azul', image: '👔' },
    { id: 7, name: 'Macacão Infantil', category: 'Infantil', price: 59.90, size: 'P', color: 'Amarelo', image: '🧸' },
    { id: 8, name: 'Vestido Infantil', category: 'Infantil', price: 64.90, size: 'M', color: 'Rosa', image: '🧸' },
    { id: 9, name: 'Camiseta Esporte', category: 'Esporte', price: 69.90, size: 'M', color: 'Preto', image: '⚽' },
    { id: 10, name: 'Calção Esportivo', category: 'Esporte', price: 79.90, size: 'G', color: 'Vermelho', image: '⚽' },
    { id: 11, name: 'Camiseta Eco', category: 'Eco', price: 59.90, size: 'M', color: 'Verde', image: '🌱' },
    { id: 12, name: 'Calça Sustentável', category: 'Eco', price: 99.90, size: 'G', color: 'Marrom', image: '🌱' },
    { id: 13, name: 'Vestido Religioso', category: 'Religião', price: 74.90, size: 'M', color: 'Branco', image: '✝️' },
    { id: 14, name: 'Camisa Religiosa', category: 'Religião', price: 59.90, size: 'G', color: 'Azul', image: '✝️' },
  ];

  const categories = ['Calçados', 'Moda Feminina', 'Moda Masculina', 'Infantil', 'Esporte', 'Eco', 'Religião'];
  const sizes = ['P', 'M', 'G', 'GG'];
  const colors = ['Preto', 'Branco', 'Azul', 'Rosa', 'Amarelo', 'Verde', 'Vermelho', 'Marrom'];

  // Estados dos filtros
  const [searchText, setSearchText] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [maxPrice, setMaxPrice] = useState(200);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');

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
        <h1>🛒 Loja Franca Shoes</h1>
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
            <label>🔍 Buscar Produto</label>
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
            <label>📦 Categoria</label>
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

          {/* PREÇO */}
          <div className="filter-group">
            <label>💰 Preço Máximo</label>
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
            <label>📐 Tamanho</label>
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
            <label>🎨 Cor</label>
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
                      <span className="spec">📏 {product.size}</span>
                      <span className="spec">🎨 {product.color}</span>
                    </div>
                    <div className="product-footer">
                      <span className="price">R$ {product.price.toFixed(2)}</span>
                      <button className="add-btn">Adicionar</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="no-products">
              <p>😢 Nenhum produto encontrado com os filtros selecionados.</p>
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
