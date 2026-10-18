// Cabeçalho e rodapé das páginas públicas de e-books.
export const WHATS = '5516991543663';

export function Cabecalho({ ativo }) {
  const contato = `https://wa.me/${WHATS}?text=${encodeURIComponent('Olá! Vim pelo site de e-books.')}`;
  return (
    <header className="eb-head">
      <div className="eb-wrap">
        <a className="eb-logo" href="/">
          <i />
          igreja.eco.br
        </a>
        <nav className="eb-nav" aria-label="Principal">
          <a href="/" className={ativo === 'inicio' ? 'on' : ''}>
            Início
          </a>
          <a href="/ebooks" className={ativo === 'ebooks' ? 'on' : ''}>
            E-books
          </a>
          <a href={contato} target="_blank" rel="noopener noreferrer">
            Contato
          </a>
        </nav>
      </div>
    </header>
  );
}

export function Rodape() {
  return (
    <footer className="eb-foot">
      <div className="eb-wrap">
        <b>igreja.eco.br</b>
        <span>E-books práticos para quem aprende fazendo.</span>
      </div>
    </footer>
  );
}
