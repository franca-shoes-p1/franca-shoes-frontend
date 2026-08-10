'use client';
import React, { useState, useEffect } from 'react';

export default function Admin() {
  const [produtos, setProdutos] = useState([]);
  const [nome, setNome] = useState('');
  const [preco, setPreco] = useState('');

  useEffect(() => {
    const salvos = localStorage.getItem('admin_produtos');
    if (salvos) setProdutos(JSON.parse(salvos));
  }, []);

  const adicionar = () => {
    if (!nome || !preco) { alert('Preencha nome e preço!'); return; }
    const novo = { id: Date.now(), nome, preco };
    const novos = [...produtos, novo];
    setProdutos(novos);
    localStorage.setItem('admin_produtos', JSON.stringify(novos));
    setNome('');
    setPreco('');
  };

  const deletar = (id) => {
    const novos = produtos.filter(p => p.id !== id);
    setProdutos(novos);
    localStorage.setItem('admin_produtos', JSON.stringify(novos));
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px', fontFamily: 'sans-serif' }}>
      <h1 style={{ color: '#1E40AF' }}>⚙️ Admin Panel</h1>
      <a href="/" style={{ marginRight: '10px', color: '#10B981' }}>← HOME</a>
      <a href="/loja" style={{ color: '#10B981' }}>LOJA →</a>

      <div style={{ marginTop: '30px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
        <div style={{ background: '#f8f9fa', padding: '20px', borderRadius: '8px' }}>
          <h2>Adicionar Produto</h2>
          <input 
            placeholder="Nome" 
            value={nome} 
            onChange={e => setNome(e.target.value)}
            style={{ width: '100%', padding: '8px', marginBottom: '10px', borderRadius: '4px', border: '1px solid #ddd' }}
          />
          <input 
            placeholder="Preço" 
            value={preco} 
            onChange={e => setPreco(e.target.value)}
            style={{ width: '100%', padding: '8px', marginBottom: '10px', borderRadius: '4px', border: '1px solid #ddd' }}
            type="number"
            step="0.01"
          />
          <button 
            onClick={adicionar}
            style={{ width: '100%', padding: '10px', background: '#10B981', color: 'white', border: 'none', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer' }}
          >
            ➕ Adicionar
          </button>
        </div>

        <div>
          <h2>Produtos ({produtos.length})</h2>
          {produtos.length === 0 ? (
            <p style={{ color: '#999' }}>Nenhum produto</p>
          ) : (
            produtos.map(p => (
              <div key={p.id} style={{ background: '#f8f9fa', padding: '15px', marginBottom: '10px', borderRadius: '6px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <strong>{p.nome}</strong>
                  <p style={{ margin: '5px 0 0 0', color: '#10B981', fontWeight: 'bold' }}>R$ {parseFloat(p.preco).toFixed(2)}</p>
                </div>
                <button 
                  onClick={() => deletar(p.id)}
                  style={{ padding: '8px 12px', background: '#EF4444', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                >
                  🗑️
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}