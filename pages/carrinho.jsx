'use client';
import React, { useState, useEffect } from 'react';

export default function Carrinho() {
  const [items, setItems] = useState([]);

  useEffect(() => {
    const salvos = localStorage.getItem('carrinho_items');
    if (salvos) setItems(JSON.parse(salvos));
  }, []);

  const remover = (id) => {
    const novos = items.filter(i => i.id !== id);
    setItems(novos);
    localStorage.setItem('carrinho_items', JSON.stringify(novos));
  };

  const total = items.reduce((sum, item) => sum + (item.preco * item.quantidade), 0);

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px', fontFamily: 'sans-serif' }}>
      <h1 style={{ color: '#1E40AF' }}>🛒 Carrinho de Compras</h1>
      <a href="/loja" style={{ color: '#10B981', marginRight: '10px' }}>← Voltar para LOJA</a>

      {items.length === 0 ? (
        <div style={{ marginTop: '40px', textAlign: 'center' }}>
          <p style={{ color: '#999', fontSize: '18px' }}>Seu carrinho está vazio 😢</p>
          <a href="/loja" style={{ display: 'inline-block', marginTop: '20px', padding: '10px 20px', background: '#10B981', color: 'white', textDecoration: 'none', borderRadius: '4px' }}>
            Voltar para Loja →
          </a>
        </div>
      ) : (
        <>
          <div style={{ marginTop: '30px' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '20px' }}>
              <thead>
                <tr style={{ background: '#f0f4ff', borderBottom: '2px solid #1E40AF' }}>
                  <th style={{ padding: '12px', textAlign: 'left' }}>Produto</th>
                  <th style={{ padding: '12px', textAlign: 'center' }}>Quantidade</th>
                  <th style={{ padding: '12px', textAlign: 'right' }}>Preço Unit.</th>
                  <th style={{ padding: '12px', textAlign: 'right' }}>Subtotal</th>
                  <th style={{ padding: '12px', textAlign: 'center' }}>Ação</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.id} style={{ borderBottom: '1px solid #eee' }}>
                    <td style={{ padding: '12px' }}>{item.nome}</td>
                    <td style={{ padding: '12px', textAlign: 'center' }}>{item.quantidade}</td>
                    <td style={{ padding: '12px', textAlign: 'right' }}>R$ {parseFloat(item.preco).toFixed(2)}</td>
                    <td style={{ padding: '12px', textAlign: 'right', fontWeight: 'bold' }}>
                      R$ {(item.preco * item.quantidade).toFixed(2)}
                    </td>
                    <td style={{ padding: '12px', textAlign: 'center' }}>
                      <button 
                        onClick={() => remover(item.id)}
                        style={{ padding: '6px 10px', background: '#EF4444', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                      >
                        🗑️
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '30px' }}>
              <div style={{ background: '#f0f4ff', padding: '20px', borderRadius: '8px', minWidth: '300px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', fontSize: '16px' }}>
                  <span>Subtotal:</span>
                  <span>R$ {total.toFixed(2)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', fontSize: '16px' }}>
                  <span>Frete:</span>
                  <span>R$ 0.00</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '20px', fontWeight: 'bold', color: '#1E40AF', borderTop: '1px solid #ddd', paddingTop: '10px' }}>
                  <span>Total:</span>
                  <span>R$ {total.toFixed(2)}</span>
                </div>
              </div>
            </div>

            <div style={{ textAlign: 'right' }}>
              <button 
                onClick={() => window.location.href = '/checkout'}
                style={{ padding: '12px 30px', background: '#10B981', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '16px', fontWeight: 'bold' }}
              >
                ➡️ Ir para Checkout
              </button>
            </div>
          </>
        </>
      )}
    </div>
  );
}