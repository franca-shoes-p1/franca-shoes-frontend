import { useState, useEffect } from "react";
import Link from "next/link";
import Head from "next/head";
import styles from "../styles/checkout.module.css";

const CHAVE = "carrinho_fr";
const WHATS = "5516991543663";
const brl = (n) => "R$ " + Number(n || 0).toFixed(2).replace(".", ",");

export default function Checkout() {
  const [carrinho, setCarrinho] = useState([]);
  const [f, setF] = useState({ nome: "", whatsapp: "", email: "", cidade: "", estado: "", observacao: "", site: "" });
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");
  const [feito, setFeito] = useState(null);

  useEffect(() => {
    try {
      setCarrinho(JSON.parse(localStorage.getItem(CHAVE) || "[]"));
    } catch {}
  }, []);

  const mudar = (e) => setF((p) => ({ ...p, [e.target.name]: e.target.value }));
  const total = carrinho.reduce((s, i) => s + i.preco * i.quantidade, 0);

  async function enviar(e) {
    e.preventDefault();
    setLoading(true);
    setErro("");
    try {
      const r = await fetch("/api/pedido", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...f, itens: carrinho.map((i) => ({ id: i.id, quantidade: i.quantidade })) }),
      });
      const j = await r.json();
      if (!r.ok) throw new Error(j.erro || "Erro ao enviar o pedido.");
      const linhas = j.itens.map((i) => `• ${i.quantidade} par(es) — ${i.titulo} (${brl(i.preco_fabrica)}/par)`).join("\n");
      const msg =
        `Olá! Fiz o pedido nº ${j.numero} no site.\n\n${linhas}\n\n` +
        `Total estimado na fábrica: ${brl(j.total)} (${j.pares} pares)\n` +
        `Nome: ${f.nome}\nCidade: ${f.cidade}${f.estado ? "/" + f.estado : ""}\n` +
        (f.observacao ? `Obs.: ${f.observacao}\n` : "") +
        `\nPode confirmar preço, estoque e prazo?`;
      try {
        localStorage.removeItem(CHAVE);
      } catch {}
      setCarrinho([]);
      setFeito({ numero: j.numero, link: `https://wa.me/${WHATS}?text=${encodeURIComponent(msg)}` });
    } catch (err) {
      setErro(err.message);
    } finally {
      setLoading(false);
    }
  }

  if (feito) {
    return (
      <div className={styles.container}>
        <div className={styles.conteudo}>
          <h1>Pedido nº {feito.numero} registrado ✅</h1>
          <p>
            Falta um passo: toque no botão abaixo para me enviar o pedido pelo WhatsApp. Eu confirmo preço, estoque e prazo com a
            fábrica e te respondo. Nada foi cobrado.
          </p>
          <p>
            <a href={feito.link} target="_blank" rel="noopener noreferrer">
              <button className={styles.botao}>Enviar pelo WhatsApp</button>
            </a>
          </p>
          <p>
            <Link href="/loja">← Voltar para a loja</Link>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <Head>
        <title>Enviar pedido</title>
      </Head>
      <div className={styles.conteudo}>
        <h1>Enviar pedido</h1>
        {erro && <div className={styles.erro}>{erro}</div>}
        <div className={styles.grid}>
          <div className={styles.formulario}>
            <h2>Seus dados</h2>
            <form onSubmit={enviar}>
              <div className={styles.grupo}>
                <label>Nome completo *</label>
                <input name="nome" value={f.nome} onChange={mudar} required placeholder="Seu nome" />
              </div>
              <div className={styles.grupo}>
                <label>WhatsApp com DDD *</label>
                <input name="whatsapp" type="tel" value={f.whatsapp} onChange={mudar} required placeholder="(11) 99999-9999" />
              </div>
              <div className={styles.grupo}>
                <label>E-mail</label>
                <input name="email" type="email" value={f.email} onChange={mudar} placeholder="seu@email.com" />
              </div>
              <div className={styles.grupo}>
                <label>Cidade *</label>
                <input name="cidade" value={f.cidade} onChange={mudar} required placeholder="Sua cidade" />
              </div>
              <div className={styles.grupo}>
                <label>Estado</label>
                <input name="estado" value={f.estado} onChange={mudar} maxLength={2} placeholder="SP" />
              </div>
              <div className={styles.grupo}>
                <label>Observação</label>
                <input name="observacao" value={f.observacao} onChange={mudar} placeholder="Numerações, cores, prazo..." />
              </div>
              <input name="site" value={f.site} onChange={mudar} tabIndex={-1} autoComplete="off" style={{ display: "none" }} />
              <button type="submit" disabled={loading || carrinho.length === 0} className={styles.botao}>
                {loading ? "Enviando..." : "Registrar pedido"}
              </button>
            </form>
          </div>

          <div className={styles.resumo}>
            <h2>Resumo</h2>
            <div className={styles.itens}>
              {carrinho.length === 0 ? (
                <p>
                  Pedido vazio. <Link href="/loja">Ver a loja</Link>
                </p>
              ) : (
                carrinho.map((i) => (
                  <div key={i.id} className={styles.item}>
                    <div className={styles.info}>
                      <p className={styles.nome}>{i.nome}</p>
                      <p className={styles.detalhe}>
                        {i.quantidade} x {brl(i.preco)}
                      </p>
                    </div>
                    <p className={styles.preco}>{brl(i.preco * i.quantidade)}</p>
                  </div>
                ))
              )}
            </div>
            <div className={styles.totalizacao}>
              <div className={styles.total}>
                <span>Total estimado na fábrica:</span>
                <span>{brl(total)}</span>
              </div>
            </div>
            <div className={styles.info}>
              <p>✓ Sem pagamento no site</p>
              <p>✓ Eu confirmo preço, estoque e prazo com a fábrica</p>
              <p>✓ Frete e serviço combinados no WhatsApp</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
