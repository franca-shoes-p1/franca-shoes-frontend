import React from 'react';

/* Desenhos próprios das quatro categorias. Acessórios = bolsa, cinto e carteira, que combinam com os calçados. */
const D = {
  roupas: (
    <>
      <path d="M22 8 10 14 4 26l9 5 3-4v29h32V27l3 4 9-5-6-12-12-6c-1 5-5 8-10 8s-9-3-10-8Z" fill="#38bdf8" />
      <path d="M22 8c1 5 5 8 10 8s9-3 10-8" fill="none" stroke="#0b2f66" strokeWidth="2.5" />
    </>
  ),
  calcados: (
    <>
      <path d="M5 24c6 4 12 4 16-2l14 11c6 4 20 4 23 11 1 3 1 5 0 6H6c-2-8-2-18-1-26Z" fill="#1e6bff" />
      <path d="M5 49h54v3c0 2-1 3-3 3H9c-2 0-4-2-4-4Z" fill="#0b2f66" />
      <path d="m26 30-5 6m11-1-5 6m11-1-4 5" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" />
    </>
  ),
  acessorios: (
    <>
      {/* bolsa */}
      <path d="M13 20v-5c0-12 18-12 18 0v5" fill="none" stroke="#7a3e16" strokeWidth="3.5" strokeLinecap="round" />
      <path d="M7 18h30l4 24c0 2-1 3-3 3H6c-2 0-3-1-3-3Z" fill="#c2702f" />
      <rect x="18" y="24" width="8" height="6" rx="2" fill="#ffd166" />
      {/* carteira */}
      <rect x="34" y="27" width="27" height="19" rx="4" fill="#8b4a1f" />
      <path d="M48 32h13v9H48c-3 0-3-9 0-9Z" fill="#a85f2a" />
      <circle cx="50" cy="36.5" r="2" fill="#ffd166" />
      {/* cinto */}
      <rect x="3" y="50" width="58" height="9" rx="4.5" fill="#5a2d0f" />
      <rect x="13" y="48" width="14" height="13" rx="3" fill="none" stroke="#f4b942" strokeWidth="3" />
      <path d="M20 54.5h9" stroke="#f4b942" strokeWidth="2.5" strokeLinecap="round" />
      <g fill="#f4d9b0"><circle cx="39" cy="54.5" r="1.3" /><circle cx="45" cy="54.5" r="1.3" /><circle cx="51" cy="54.5" r="1.3" /></g>
    </>
  ),
  suvenires: (
    <>
      <rect x="8" y="27" width="48" height="31" rx="4" fill="#ff6b81" />
      <rect x="5" y="19" width="54" height="11" rx="3" fill="#ff4d6d" />
      <path d="M28 19h8v39h-8Z" fill="#ffd166" />
      <path d="M32 19c-5-12-20-10-14 0Zm0 0c5-12 20-10 14 0Z" fill="none" stroke="#ffd166" strokeWidth="4" strokeLinejoin="round" />
    </>
  ),
};

export default function IconeProduto({ id, tamanho = '1em' }) {
  return (
    <svg viewBox="0 0 64 64" width={tamanho} height={tamanho} aria-hidden="true" focusable="false" style={{ display: 'inline-block', verticalAlign: 'middle' }}>
      {D[id]}
    </svg>
  );
}
