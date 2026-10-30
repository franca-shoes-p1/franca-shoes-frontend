import { useEffect, useState } from 'react';
import Link from 'next/link';
import VarejoLayout from '../../lib/VarejoLayout';
import styles from '../../styles/varejo.module.css';
import {
  brl, lerCarrinho, chaveItem, subtotalCarrinho, calcularFrete, ESTADOS, VAREJO, lerPonto,
} from '../../lib/varejo';

const VAZIO = {
  nome: '', cpf: '', autorizo: false, email: '', whatsapp: '', cep: '', rua: '', numero: '', complemento: '', bairro: '', cidade: '', estado: '', observacao: '', site: '',
};

export default function Checkout() {
  const [itens, setItens] = useState([]);
  const [pronto, setPronto] = useState(false);
  const [f, setF] = useState(VAZIO);
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState('');

  useEffect(() => {
    setItens(lerCarrinho());
    setPronto(true);
  }, []);

  const mudar = (e) => setF((p) => ({ ...p, [e.target.name]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }));
  const subtotal = subtotalCarrinho(itens);
  const frete = f.estado ? calcularFrete(f.estado, subtotal) : null;
  const total = subtotal + (frete || 0);

  async function buscarCep(valor) {
    const cep = valor.replace(/\D/g, '');
    if (cep.length !== 8) return;
    try {
      const r = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
      const j = await r.json();
      if (j && !j.erro) {
        setF((p) => ({
          ...p,
          rua: p.rua || j.logradouro || '',
          bairro: p.bairro || j.bairro || '',
          cidade: j.localidade || p.cidade,
          estado: j.uf || p.estado,
        }));
      }
    } catch {}
  }

  async function enviar(e) {
    e.preventDefault();
    setErro('');
    setEnviando(true);
    try {
      const r = await fetch('/api/varejo/pedido', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...f,
          ponto: lerPonto(),
          itens: itens.map((i) => ({ id: i.id, tamanho: i.tamanho, quantidade: i.quantidade })),
        }),
      });
      const j = await r.json();
      if (!r.ok || !j.url) throw new Error(j.erro || 'Erro ao iniciar o pagamento.');
      window.location.href = j.url; // vai para o Mercado Pago (PIX ou cartão)
    } catch (err) {
      setErro(err.message);
      setEnviando(false);
    }
  }

  if (!pronto) return <VarejoLayout titulo="Entrega e pagamento"><p>Carregando…</p></VarejoLayout>;
  if (itens.length === 0)
    return (
      <VarejoLayout titulo="Entrega e pagamento">
        <div className={styles.vazio}>
          <p>Seu carrinho está vazio.</p>
          <p style={{ marginTop: 10 }}>
            <Link href="/calcados" className={styles.botaoSecundario}>Ver os modelos</Link>
          </p>
        </div>
      </VarejoLayout>
    );

  return (
    <VarejoLayout titulo="Entrega e pagamento">
      <h1 style={{ marginBottom: 14 }}>Entrega e pagamento</h1>
      {erro && <div className={styles.erro}>{erro}</div>}
      <form onSubmit={enviar} className={styles.duasColunas}>
        <div className={styles.caixa}>
          <h2>Seus dados</h2>
          <div className={styles.formGrade}>
            <div className={`${styles.grupo} ${styles.cheio}`}>
              <label>Nome completo *</label>
              <input className={styles.campo} name="nome" value={f.nome} onChange={mudar} required autoComplete="name" />
            </div>
            <div className={styles.grupo}>
              <label>CPF * (a nota fiscal sai no seu nome)</label>
              <input className={styles.campo} name="cpf" value={f.cpf} onChange={mudar} inputMode="numeric" maxLength={14} placeholder="000.000.000-00" autoComplete="off" />
            </div>
            <div className={styles.grupo}>
              <label>E-mail *</label>
              <input className={styles.campo} name="email" type="email" value={f.email} onChange={mudar} required autoComplete="email" />
            </div>
            <div className={styles.grupo}>
              <label>WhatsApp com DDD *</label>
              <input className={styles.campo} name="whatsapp" type="tel" value={f.whatsapp} onChange={mudar} required autoComplete="tel" placeholder="(16) 99999-9999" />
            </div>
          </div>

          <h2 style={{ marginTop: 22 }}>Endereço de entrega</h2>
          <div className={styles.formGrade}>
            <div className={styles.grupo}>
              <label>CEP *</label>
              <input
                className={styles.campo}
                name="cep"
                value={f.cep}
                onChange={(e) => {
                  mudar(e);
                  buscarCep(e.target.value);
                }}
                required
                inputMode="numeric"
                maxLength={9}
                placeholder="00000-000"
                autoComplete="postal-code"
              />
            </div>
            <div className={styles.grupo}>
              <label>Estado *</label>
              <select className={styles.campo} name="estado" value={f.estado} onChange={mudar} required>
                <option value="">Selecione</option>
                {ESTADOS.map((uf) => (
                  <option key={uf} value={uf}>{uf}</option>
                ))}
              </select>
            </div>
            <div className={`${styles.grupo} ${styles.cheio}`}>
              <label>Rua *</label>
              <input className={styles.campo} name="rua" value={f.rua} onChange={mudar} required autoComplete="address-line1" />
            </div>
            <div className={styles.grupo}>
              <label>Número *</label>
              <input className={styles.campo} name="numero" value={f.numero} onChange={mudar} required maxLength={15} />
            </div>
            <div className={styles.grupo}>
              <label>Complemento</label>
              <input className={styles.campo} name="complemento" value={f.complemento} onChange={mudar} maxLength={60} />
            </div>
            <div className={styles.grupo}>
              <label>Bairro *</label>
              <input className={styles.campo} name="bairro" value={f.bairro} onChange={mudar} required />
            </div>
            <div className={styles.grupo}>
              <label>Cidade *</label>
              <input className={styles.campo} name="cidade" value={f.cidade} onChange={mudar} required />
            </div>
            <div className={`${styles.grupo} ${styles.cheio}`}>
              <label>Observação (opcional)</label>
              <input className={styles.campo} name="observacao" value={f.observacao} onChange={mudar} maxLength={300} placeholder="Ponto de referência, melhor horário…" />
            </div>
            <input name="site" value={f.site} onChange={mudar} tabIndex={-1} autoComplete="off" style={{ display: 'none' }} />
          </div>
        </div>

        <div className={styles.caixa}>
          <h2>Resumo do pedido</h2>
          {itens.map((i) => (
            <div key={chaveItem(i)} className={styles.linhaTotal} style={{ fontSize: '0.9rem' }}>
              <span>
                {i.quantidade}× {i.nome} (nº {i.tamanho})
              </span>
              <span>{brl(i.preco * i.quantidade)}</span>
            </div>
          ))}
          <div className={styles.linhaTotal} style={{ marginTop: 8 }}>
            <span>Produtos</span>
            <span>{brl(subtotal)}</span>
          </div>
          <div className={styles.linhaTotal}>
            <span>Frete</span>
            <span>{frete === null ? 'escolha o estado' : frete === 0 ? 'Grátis' : brl(frete)}</span>
          </div>
          <div className={`${styles.linhaTotal} ${styles.totalFinal}`}>
            <span>Total</span>
            <span>{brl(total)}</span>
          </div>
          <label style={{ display: 'flex', gap: 8, alignItems: 'flex-start', marginTop: 12, fontSize: '0.88rem' }}>
            <input type="checkbox" name="autorizo" checked={f.autorizo} onChange={mudar} style={{ marginTop: 3 }} />
            <span>
              Para modelos de fornecedores: autorizo a retirada na fábrica e o transporte da minha mercadoria por quem faz a entrega, com a nota fiscal no meu nome.
              Li o <Link href="/calcados/politicas">regulamento</Link>.
            </span>
          </label>
          <button type="submit" className={styles.botaoPrincipal} disabled={enviando || frete === null}>
            {enviando ? 'Abrindo pagamento…' : 'Pagar com PIX ou cartão'}
          </button>
          <p className={styles.parcela} style={{ marginTop: 10 }}>
            Modelos da própria loja: você paga no Mercado Pago (PIX ou cartão) e o pedido sai em {VAREJO.prazoPreparoDias}.
            Modelos de fornecedores: o PIX vai direto ao fornecedor, que faz o par depois do pedido; a página seguinte mostra o código.
          </p>
          <p style={{ marginTop: 10 }}>
            <Link href="/calcados/carrinho">← Voltar ao carrinho</Link>
          </p>
        </div>
      </form>
    </VarejoLayout>
  );
}
