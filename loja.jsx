import React, { useState, useMemo } from 'react';
import './loja.css';

export default function Loja() {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [priceRange, setPriceRange] = useState(200);
  const [size, setSize] = useState('');
  const [color, setColor] = useState('');

  const mockProducts = [
    { id: 1, name: 'Tênis Esportivo', category: 'Calçados', price: 150, size: 'M', color: 'Azul' },
    { id: 2, name: 'Vestido Social', category: 'Moda Feminina', price: 200, size: 'P', color: 'Preto' },
    { id: 3, name: 'Camisa Casual', category: 'Moda Masculina', price: 80, size: 'M', color: 'Branco' },
    { id: 4, name: 'Jaqueta Infantil', category: 'Infantil', price: 120, size: 'G', color: 'Vermelho' },
    { id: 5, name: 'Bermuda Esporte', category: 'Esporte', price: 90, size: 'M', color: 'Azul' },
    { id: 6, name: 'Blusa Eco', category: 'Eco', price: 110, size: 'P', color: 'Verde' },
    { id: 7, name: 'Camiseta Religião', category: 'Religião', price: 60, size: 'M', color: 'Branco' },
    { id: 8, name: 'Sandália Comfort', category: 'Calçados', price: 75, size: 'G', color: 'Preto' },
    { id: 9, name: 'Calça Jeans', category: 'Moda Feminina', price: 130, size: 'M', color: 'Azul' },
    { id: 10, name: 'Polo Premium', category: 'Moda Masculina', price: 95, size: 'G', color: 'Cinza' },
    { id: 11, name: 'Tênis Infantil', category: 'Infantil', price: 140, size: 'P', color: 'Amarelo' },
    { id: 12, name: 'Meia Esporte', category: 'Esporte', price: 40, size: 'M', color: 'Preto' },
    { id: 13, name: 'Sacola Eco', category: 'Eco', price: 50, size: '', color: 'Bege' },
    { id: 14, name: 'Corrente Religião', category: 'Religião', price: 85, size: '', color: 'Ouro' },
  ];

  const filteredProducts = useMemo(() => {
    return mockProducts.filter(product =>
      product.name.toLowerCase().includes(search.toLowerCase()) &&
      (category === '' || product.category === category) &&
      product.price <= priceRange &&
      (size === '' || product.size === size) &&
      (color === '' || product.color === color)
    );
  }, [search, category, priceRange, size, color]);

  return (
    <div className="loja-container">
      <div className="loja-sidebar">
        <h2>Filtros</h2>
        
        <div className="filter-group">
          <label>Buscar:</label>
          <input
            type="text"
            placeholder="Nome do produto"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="filter-group">
          <label>Categoria:</label>
          <select value={category} onChange={(e) => setCategory(e.target.value)}>
            <option value="">Todas</option>
            <option value="Calçados">Calçados</option>
            <option value="Moda Feminina">Moda Feminina</option>
            <option value="Moda Masculina">Moda Masculina</option>
            <option value="Infantil">Infantil</option>
            <option value="Esporte">Esporte</option>
            <option value="Eco">Eco</option>
            <option value="Religião">Religião</option>
          </select>
        </div>

        <div className="filter-group">
          <label>Preço: R$ {priceRange}</label>
          <input
            type="range"
            min="0"
            max="200"
            value={priceRange}
            onChange={(e) => setPriceRange(Number(e.target.value))}
          />
        </div>

        <div className="filter-group">
          <label>Tamanho:</label>
          <select value={size} onChange={(e) => setSize(e.target.value)}>
            <option value="">Todos</option>
            <option value="P">P</option>
            <option value="M">M</option>
            <option value="G">G</option>
            <option value="GG">GG</option>
          </select>
        </div>

        <div className="filter-group">
          <label>Cor:</label>
          <select value={color} onChange={(e) => setColor(e.target.value)}>
            <option value="">Todas</option>
            <option value="Branco">Branco</option>
            <option value="Preto">Preto</option>
            <option value="Azul">Azul</option>
            <option value="Vermelho">Vermelho</option>
            <option value="Verde">Verde</option>
            <option value="Amarelo">Amarelo</option>
            <option value="Cinza">Cinza</option>
            <option value="Bege">Bege</option>
          </select>
        </div>

        <button className="clear-btn" onClick={() => {
          setSearch('');
          setCategory('');
          setPriceRange(200);
          setSize('');
          setColor('');
        }}>Limpar Tudo</button>
      </div>

      <div className="loja-content">
        <h1>Loja - {filteredProducts.length} produtos</h1>
        <div className="products-grid">
          {filteredProducts.map(product => (
            <div key={product.id} className="product-card">
              <div className="product-image">📦</div>
              <h3>{product.name}</h3>
              <p className="category">{product.category}</p>
              <p className="price">R$ {product.price.toFixed(2)}</p>
              <button className="add-to-cart">Adicionar ao Carrinho</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}