import { useEffect, useState } from 'react';
import Link from 'next/link';
import VarejoLayout from '../../lib/VarejoLayout';
import styles from '../../styles/varejo.module.css';
import { VAREJO } from '../../lib/varejo';
import { RODOVIARIAS } from '../../lib/rodoviarias';
import { MENSALIDADE, TOLERANCIA_DIAS } from '../../lib/revendedores';

// RASCUNHO: texto operacional. Peça revisão de contador/advogado antes de divulgar amplamente (troca em itens sob medida, comissão, repasse, nota no nome do cliente final).
export default function Regulamento() {
  const [forn, setForn] = useState(null);
  useEffect(() => {
    fetch('/api/varejo/regulamento').then((r) => r.json()).then((j) => setForn(j.fornecedores || [])).catch(() => setForn([]));
  }, []);

  return (
    <VarejoLayout titulo="Regulamento">
      <div className={styles.texto}>
        <h1>Regulamento</h1>
        <p>Aqui está, em linguagem simples, como funciona a compra, a entrega e a troca na {VAREJO.nomeLoja}. O site está em fase de testes.</p>

        <h2>1. Quem faz o quê</h2>
        <ul>
          <li><b>Fornecedor (fábrica):</b> é quem vende. Define preço, estoque, prazo de confecção e política de troca, recebe o PIX do preço do produto e emite a nota fiscal no nome e CPF do cliente final.</li>
          <li><b>{VAREJO.nomeLoja}:</b> faz a intermediação, a coleta na fábrica e a entrega, e recebe a comissão e o frete em um segundo PIX.</li>
          <li><b>Revendedor:</b> atende o cliente pelo seu link, define a sua margem e entrega ao cliente a mercadoria recebida da loja.</li>
          <li><b>Cliente:</b> escolhe, paga, informa o CPF para a nota e retira ou recebe o pedido.</li>
        </ul>

        <h2>2. Preço e pagamento em dois PIX</h2>
        <p>O preço que você vê é a soma do preço da fábrica, da comissão da loja e, quando a compra vem pelo link de um revendedor, da margem dele. O pagamento é feito em dois PIX:</p>
        <ul>
          <li><b>PIX 1:</b> o preço do produto, direto para a conta do fornecedor.</li>
          <li><b>PIX 2:</b> comissão da loja, margem do revendedor (se houver) e frete, para a loja.</li>
        </ul>
        <p>Confira sempre o nome do titular na tela do banco antes de confirmar cada PIX.</p>

        <h2>3. Nota fiscal, CPF e autorização</h2>
        <p>A nota fiscal é emitida pelo fornecedor no nome e CPF do cliente final, com o local de entrega do pedido. Por isso pedimos o seu CPF e a sua autorização para a retirada e o transporte da mercadoria, que você aceita ao comprar. A nota acompanha a mercadoria durante o transporte. Seus dados são usados só para o pedido, a nota e a entrega.</p>

        <h2>4. Prazo de confecção</h2>
        <p>Os pares são feitos ou separados depois do pedido. O prazo de confecção de cada modelo aparece na página dele e conta a partir da confirmação do pagamento.</p>

        <h2>5. Entrega</h2>
        <p><b>Entrega em mãos, na rodoviária.</b> Atendemos as maiores rodoviárias: {RODOVIARIAS.map((r) => r.nome).join('; ')}. São Paulo (Tietê) é atendida só em rota especial, quando houver pedidos suficientes.</p>
        <p>A entrega tem <b>dia e hora marcados</b>, sem janela de espera. O revendedor avisa você, e o aviso fica registrado no pedido. Se o cliente não aparecer no horário, a mercadoria segue pelos Correios, com o frete por conta do cliente.</p>
        <p><b>Correios.</b> Onde não houver rodoviária atendida, o envio é pelos Correios, com a nota fiscal fixada por fora da embalagem e código de rastreio.</p>
        <p><b>Frete.</b> O valor é calculado por uma tabela de custo estimado com acréscimo de 10% e mostrado antes do pagamento.</p>

        <h2>6. Trocas, devoluções e desistência</h2>
        <ul>
          <li><b>Defeito de fabricação:</b> troca sem custo para o cliente, no prazo definido por cada fábrica (recomendado: no mínimo 30 dias).</li>
          <li><b>Troca por tamanho ou vontade:</b> segue a política de cada fábrica: se aceita, em quantos dias e quem paga o frete. A política aparece em cada modelo e na lista abaixo.</li>
          <li><b>Prazo:</b> conta a partir da data em que você pede a troca, pelo WhatsApp da loja.</li>
          <li><b>Desistência em 7 dias:</b> em compras pela internet vale o direito de arrependimento do Código de Defesa do Consumidor, com o produto sem uso e na embalagem. Para pares feitos sob medida ou por encomenda, as condições estão em revisão; em caso de dúvida, fale com a loja antes de comprar.</li>
        </ul>
        <p>Se faltar estoque, o pedido é cancelado e o PIX devolvido.</p>

        <h2>7. Política de troca de cada fábrica</h2>
        {forn === null && <p>Carregando…</p>}
        {forn && forn.length === 0 && <p>Ainda não há fábricas ativas. Quando houver, a política de cada uma aparecerá aqui.</p>}
        {forn && forn.map((f) => (
          <div key={f.nome} style={{ marginBottom: 12 }}>
            <b>{f.nome}</b>
            <ul>{f.troca.map((l, i) => <li key={i}>{l}</li>)}</ul>
          </div>
        ))}

        <h2>8. Revendedores</h2>
        <ul>
          <li>Assinatura mensal de R$ {MENSALIDADE},00, paga por PIX e confirmada pela loja. Vencida, o link continua valendo por {TOLERANCIA_DIAS} dias; depois, quem entrar pelo link vê os preços normais.</li>
          <li>A margem é definida pelo revendedor e é repassada a ele depois da entrega confirmada e do PIX 2 recebido.</li>
          <li>As vendas ficam registradas no nome do revendedor.</li>
          <li>Quer ser revendedor? <Link href="/revendedor">Peça o cadastro</Link>.</li>
        </ul>

        <h2>9. Contato</h2>
        <p>
          WhatsApp:{' '}
          <a href={`https://wa.me/${VAREJO.whatsapp}`} target="_blank" rel="noopener noreferrer">
            {VAREJO.whatsapp.replace(/^55(\d{2})(\d{5})(\d{4})$/, '($1) $2-$3')}
          </a>
        </p>
        <p><Link href="/calcados/politicas">Ver também: trocas, devoluções e entrega</Link></p>
      </div>
    </VarejoLayout>
  );
}
