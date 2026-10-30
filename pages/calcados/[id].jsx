import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import VarejoLayout from '../../lib/VarejoLayout';
import styles from '../../styles/varejo.module.css';
import { brl, VAREJO, parseTamanhos, adicionarAoCarrinho, guardarRevDaUrl, lerRev } from '../../lib/varejo';

export default function Produto() {
  const { query, isReady } = useRouter();
  const [p, setP] = useState(null);
  const [estado, setEstado] = useState('carregando');
  const [tamanho, setTamanho] = useState('');
  const [qtd, setQtd] = useState(1);
  const [erro, setErro] = useState('');
  const [adicionado, setAdicionado] = useState(false);

  useEffect(() => {
    if (!isReady) return;
    guardarRevDaUrl();
    const codigo = lerRev();
    fetch(`/api/varejo/catalogo?id=${encodeURIComponent(query.id)}${codigo ? `&rev=${codigo}` : ''}`)
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((j) => {
        setP(j.produto);
        setEstado('ok');
      })
      .catch(() => setEstado('naoencontrado'));
  }, [isReady, query.id]);

  if (estado === 'carregando') return <VarejoLayout><p>Carregando…</p></VarejoLayout>;
  if (estado === 'naoencontrado')
    return (
      <VarejoLayout titulo="Produto não encontrado">
        <div className={styles.vazio}>
          <p>Este modelo não está mais disponível.</p>
          <p style={{ marginTop: 10 }}>
            <Link href="/calcados">← Ver outros modelos</Link>
          </p>
        </div>
      </VarejoLayout>
    );

  const tamanhos = parseTamanhos(p.tamanhos);

  function adicionar() {
    setErro('');
    if (!tamanho) {
      setErro(tamanhos.length ? 'Escolha o seu número.' : 'Informe o tamanho desejado.');
      return;
    }
    adicionarAoCarrinho({
      id: p.id,
      nome: p.titulo,
      preco: p.preco,
      tamanho: tamanho.trim(),
      quantidade: Math.max(1, Math.min(10, parseInt(qtd, 10) || 1)),
      foto: p.foto,
    });
    setAdicionado(true);
  }

  return (
    <VarejoLayout titulo={p.titulo}>
      <p style={{ marginBottom: 12 }}>
        <Link href="/calcados">← Voltar</Link>
      </p>
      <div className={styles.produto}>
        <div className={styles.produtoFoto}>{p.foto ? <img src={p.foto} alt={p.titulo} /> : '👟'}</div>
        <div className={styles.produtoInfo}>
          {p.categoria && <span className={styles.cardCategoria}>{p.categoria}</span>}
          <h1>{p.titulo}</h1>
          {p.material && <span className={styles.itemMeta}>Material: {p.material}</span>}
          <div className={styles.precoGrande}>{brl(p.preco)}</div>
          {p.vendedor ? (
            <>
              <span className={styles.parcela}>Vendido e enviado por <b>{p.vendedor}</b>. Pagamento por PIX direto ao fornecedor. Frete calculado no carrinho.</span>
              {p.sobConsulta && <span className={styles.parcela} style={{ display: 'block' }}>O fornecedor confirma o seu número antes de separar o pedido.</span>}
              <span className={styles.parcela} style={{ display: 'block' }}>
                Loja de fábrica: o seu par é feito e separado depois do pedido.{' '}
                {p.prazoConfeccao > 0 ? <>Confecção: <b>{p.prazoConfeccao} dia(s)</b>. </> : null}
                {p.prazoPostagem > 0 ? <>Separação: até {p.prazoPostagem} dia(s) útil(eis) depois do pagamento. </> : null}
                A entrega acontece depois, por rota de entrega ou pelos Correios, e o prazo é confirmado no pedido.
              </span>
              {p.troca && (
                <details style={{ marginTop: 8 }}>
                  <summary style={{ cursor: 'pointer' }}>Política de troca deste vendedor</summary>
                  {p.troca.map((t, k) => <span key={k} className={styles.parcela} style={{ display: 'block' }}>{t}</span>)}
                </details>
              )}
            </>
          ) : (
            <span className={styles.parcela}>Pague no PIX ou cartão. Frete calculado no carrinho.</span>
          )}

          <div className={styles.rotulo}>Número</div>
          {tamanhos.length > 0 ? (
            <div className={styles.tamanhos}>
              {tamanhos.map((t) => (
                <button
                  key={t}
                  type="button"
                  className={`${styles.tamanho} ${tamanho === t ? styles.tamanhoAtivo : ''}`}
                  onClick={() => {
                    setTamanho(t);
                    setAdicionado(false);
                  }}
                >
                  {t}
                </button>
              ))}
            </div>
          ) : (
            <input
              className={`${styles.campo} ${styles.quantidade}`}
              value={tamanho}
              onChange={(e) => setTamanho(e.target.value)}
              placeholder="Ex.: 38 ou Único"
              maxLength={10}
            />
          )}

          <div className={styles.rotulo}>Quantidade</div>
          <input
            className={`${styles.campo} ${styles.quantidade}`}
            type="number"
            min="1"
            max="10"
            value={qtd}
            onChange={(e) => setQtd(e.target.value)}
          />

          {erro && <div className={styles.erro}>{erro}</div>}
          <button className={styles.botaoPrincipal} onClick={adicionar}>
            Adicionar ao carrinho
          </button>
          {adicionado && (
            <div className={styles.ok}>
              ✓ Adicionado!{' '}
              <Link href="/calcados/carrinho">Ir para o carrinho →</Link>
            </div>
          )}

          <div className={styles.aviso}>
            🏭 Este modelo é separado direto na fábrica depois do pagamento: saída em {VAREJO.prazoPreparoDias}, {VAREJO.prazoEntregaInfo}.
          </div>

          {p.descricao && <p className={styles.descricao}>{p.descricao}</p>}
          <ul className={styles.garantias}>
            <li>✓ Pagamento seguro pelo Mercado Pago</li>
            <li>✓ Direito de arrependimento em 7 dias após o recebimento</li>
            <li>
              ✓ Dúvidas?{' '}
              <a href={`https://wa.me/${VAREJO.whatsapp}`} target="_blank" rel="noopener noreferrer">
                Chame no WhatsApp
              </a>
            </li>
          </ul>
        </div>
      </div>
    </VarejoLayout>
  );
}
