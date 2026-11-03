import React from 'react';
import Head from 'next/head';
import Link from 'next/link';
import s from '../styles/entrega.module.css';

const WHATS = 'https://wa.me/5516991543663?text=' + encodeURIComponent('Olá! Vi a Entrega em Casa no site e quero saber mais.');

const RESUMO = [
  { e: '📝', t: 'Você pede', p: 'Descreve o produto que procura, sem catálogo e sem pagar nada.' },
  { e: '🏭', t: 'Nós cotamos', p: 'O radar acha a empresa de Franca com o melhor preço e o pedido mínimo.' },
  { e: '📦', t: 'O lote fecha', p: 'Os pedidos do mesmo produto se somam até completar o mínimo da empresa.' },
  { e: '🚌', t: 'A rota sai', p: 'Compramos e levamos em viagem, passando por várias cidades.' },
  { e: '🏠', t: 'Você prova', p: 'Na sua casa, com calma. Gostou, paga em dinheiro. Não gostou, não paga.' },
];

const ETAPAS = [
  { t: 'Encomenda', p: 'No formulário você descreve o produto (modelo, numeração, quantidade, foto ou link de referência) e aceita a visita em casa.' },
  { t: 'Cotação pelo radar', p: 'O radar de preços procura a empresa de Franca com melhor preço e menor pedido mínimo, calcula o preço final e responde com preço e prazo estimado.' },
  { t: 'Lote mínimo', p: 'Os pedidos do mesmo produto se somam. Quando completam o pedido mínimo da empresa, a compra é aprovada.' },
  { t: 'Compra e retirada em Franca', p: 'A compra é feita e retirada em mãos, direto na empresa, com nota fiscal. Cada par é conferido e etiquetado com o código do seu pedido.' },
  { t: 'Montagem da rota', p: 'Com lotes completos suficientes, os pedidos são agrupados por cidade e a rota é montada com os horários do passe livre.' },
  { t: 'Viagem', p: 'Ida e volta pelo passe livre, com 2 a 4 cidades em sequência e todas as entregas na mesma viagem.' },
  { t: 'Visita em casa', p: 'Você recebe a visita em uma janela de uma hora, experimenta o produto e só paga, em dinheiro, se gostar.' },
  { t: 'Depois da rota', p: 'O caixa é fechado, a sobra é oferecida nas paradas seguintes e no site, e quem ainda espera lote recebe aviso do andamento.' },
];

const PODE_PEDIR = [
  'Calçados femininos, masculinos e infantis',
  'Acessórios como bolsas, cintos e carteiras',
  'Sandálias, tênis, sapatos sociais e botas',
  'Qualquer produto que possa ser comprado e retirado em mãos, direto na empresa, em Franca, e que caiba na bagagem da viagem',
];

const CRITERIOS = [
  ['Pedidos confirmados', 'Quantas pessoas da cidade pediram e confirmaram a visita.'],
  ['Endereços próximos', 'Quanto mais perto uma casa da outra, mais visitas cabem por dia.'],
  ['Logística', 'Horários do passe livre, rodoviária e deslocamento entre as paradas.'],
  ['Data forte', 'Datas como Dia das Mães, Black Friday e Natal aceleram os pedidos.'],
  ['Confiança dos pedidos', 'Cadastros completos e confirmados por WhatsApp.'],
  ['Clima e produto', 'Sandália no calor, calçado fechado no frio.'],
];

const PACOTE = [
  ['Negócio de calçados pronto para vender', 'Quem quer revender na própria cidade', 'Loja virtual do revendedor, oferecida depois da primeira compra'],
  ['Projeto de revenda', 'Quem quer começar a revender', 'Vitrine de fábricas de Franca, painel e orientação, em assinatura mensal'],
  ['Site e e-commerce sob medida', 'Lojistas e pequenos comércios', 'Serviço feito por operadores da Oficina Digital'],
  ['Serviços digitais', 'Pequenos comércios', 'Divulgação automática, SEO e atendimento no WhatsApp com IA'],
];

const BASTIDORES = [
  ['📡', 'Radar diário', 'Todo dia o radar varre as empresas de Franca e guarda o histórico de preços.'],
  ['💬', 'Cotação automática', 'Cada encomenda recebe preço e prazo estimado por WhatsApp.'],
  ['📊', 'Contagem do lote', 'O sistema soma os pedidos e mostra quantos faltam para fechar.'],
  ['🗺️', 'Montagem da rota', 'A IA agrupa as cidades, ordena as paradas e encaixa os horários de ônibus.'],
  ['📣', 'Divulgação', 'Textos, artes e posts são gerados e agendados nas redes todas as semanas.'],
  ['✅', 'Confirmações', 'Cada visita é confirmada 3 dias, 1 dia e 2 horas antes.'],
];

const CUIDADOS = [
  { e: '💵', t: 'Você não paga antes', p: 'O formulário não cobra nada. O pagamento é em dinheiro, só na visita, depois de provar.' },
  { e: '🚪', t: 'Saída livre', p: 'Não há prazo máximo de espera, e você pode sair da fila a qualquer momento, sem multa e sem explicação.' },
  { e: '🔒', t: 'Seus dados', p: 'Nome, WhatsApp e endereço servem só para cotação, confirmação e visita. Não vendemos nem repassamos seus dados.' },
  { e: '🛡️', t: 'Segurança dos dois lados', p: 'Visitamos só cadastros confirmados por WhatsApp. Se preferir, combinamos um ponto público, como uma padaria ou praça.' },
  { e: '🤝', t: 'Sem promessa de data ou ganho', p: 'A viagem sai quando o lote fecha. O pacote tecnológico é um serviço, não uma promessa de renda.' },
  { e: '🔁', t: 'Troca na hora', p: 'Se não servir ou vier com defeito, resolvemos na visita. As condições completas aparecem antes de você confirmar.' },
];

const FAQ = [
  ['Preciso pagar para fazer a encomenda?', 'Não. O formulário é grátis e não pede cartão nem PIX. Você só paga na visita, em dinheiro, depois de provar o produto.'],
  ['Por que só dinheiro?', 'Nas visitas de calçados e acessórios o recebimento é só em dinheiro. Tenha o valor aproximado separado; a cotação mostra o preço antes da visita.'],
  ['Quanto tempo demora?', 'Não há prazo fixo. A viagem sai quando os pedidos completam o lote mínimo da empresa e há visitas suficientes na sua cidade. Você acompanha o andamento por WhatsApp.'],
  ['Posso desistir da fila?', 'Sim, a qualquer momento. É só avisar pelo WhatsApp com o código da encomenda.'],
  ['E se eu não gostar do produto na visita?', 'Você não paga nada. O par volta para a bag e é oferecido na próxima parada ou no site.'],
  ['Minha cidade entra na rota?', 'Entra quando houver visitas confirmadas suficientes. Hoje o mínimo é de 6 por cidade. Enquanto isso, você fica em lista de espera para a rota seguinte.'],
  ['Qualquer produto pode ser encomendado?', 'Qualquer um que possa ser comprado e retirado em mãos, direto na empresa, em Franca, e que caiba na bagagem. Se não der, avisamos na cotação.'],
  ['O pacote tecnológico é obrigatório?', 'Não. Ele é um extra para quem quer revender ou ter um site. Se contratar, o pagamento do pacote digital é normalmente por PIX.'],
];

export default function EntregaEmCasa() {
  return (
    <div className={s.pagina}>
      <Head>
        <title>Entrega em Casa · Peça o que quiser e prove antes de pagar</title>
        <meta name="description" content="Encomende calçados e acessórios direto de fábricas de Franca, receba a visita em casa, prove e só pague, em dinheiro, se gostar. A viagem sai quando o lote fecha." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div className={s.topo}>
        <Link href="/">← Voltar ao site</Link>
        <Link href="/encomendar" className={`${s.botao} ${s.principal}`}>Fazer minha encomenda</Link>
      </div>

      <header className={s.hero}>
        <div className={s.dentro} style={{ gridTemplateColumns: 'minmax(0, 1fr)' }}>
          <div className={s.esq}>
            <span className={s.pilula}><i />Entrega em Casa</span>
            <h1 className={s.titulo}>Peça o que quiser, prove em casa e <em>só pague se gostar</em></h1>
            <p className={s.texto}>
              Esta página explica tudo sobre o projeto, do pedido à visita: como o preço é formado, como o lote fecha, como a rota é montada,
              como funciona o pagamento e o que fazemos para você e nós ficarmos seguros.
            </p>
            <div className={s.acoes}>
              <Link href="/encomendar" className={`${s.botao} ${s.principal}`}>Fazer minha encomenda</Link>
              <a href="#como" className={`${s.botao} ${s.contorno}`}>Ver como funciona</a>
              <a href={WHATS} className={`${s.botao} ${s.contorno}`} target="_blank" rel="noopener noreferrer">Chamar no WhatsApp</a>
            </div>
          </div>
        </div>
      </header>

      <section className={s.bloco}>
        <p className={s.rotulo}>Em resumo</p>
        <h2 className={s.h2}>Cinco passos, sem surpresa</h2>
        <p className={s.sub}>Você não paga nada até provar o produto na sua casa.</p>
        <div className={s.grade}>
          {RESUMO.map((r) => (
            <div className={s.card} key={r.t}><div className={s.emoji}>{r.e}</div><h3>{r.t}</h3><p>{r.p}</p></div>
          ))}
        </div>
      </section>

      <section id="como" className={s.faixaVerde}>
        <div className={s.bloco}>
          <p className={s.rotulo}>Passo a passo completo</p>
          <h2 className={s.h2}>As oito etapas de cada rota</h2>
          <p className={s.sub}>O sistema avisa pelo WhatsApp em cada etapa, para você saber onde o seu pedido está.</p>
          <div className={s.grade}>
            {ETAPAS.map((e, i) => (
              <div className={s.etapa} key={e.t}><b>{i + 1}</b><div><h3>{e.t}</h3><p>{e.p}</p></div></div>
            ))}
          </div>
        </div>
      </section>

      <section className={s.bloco}>
        <div className={s.dois}>
          <div>
            <p className={s.rotulo}>O que pedir</p>
            <h2 className={s.h2}>Sem catálogo: você descreve, nós procuramos</h2>
            <p className={s.sub}>Em vez de escolher entre poucos modelos, você diz o que quer. O radar procura nas empresas de Franca.</p>
          </div>
          <div className={s.card}>
            <h3>Dá para encomendar</h3>
            <ul className={s.lista}>{PODE_PEDIR.map((x) => <li key={x}>{x}</li>)}</ul>
          </div>
        </div>
      </section>

      <section className={s.faixaVerde}>
        <div className={s.bloco}>
          <p className={s.rotulo}>Preço e lote mínimo</p>
          <h2 className={s.h2}>Como o preço é formado e quando o lote fecha</h2>
          <div className={s.dois}>
            <div className={s.card}>
              <div className={s.emoji}>💰</div>
              <h3>Preço</h3>
              <ul className={s.lista}>
                <li>Preço de fábrica mais a margem do projeto.</li>
                <li>Você recebe o preço final na cotação, antes de a visita ser confirmada.</li>
                <li>O valor é o mesmo que você paga na visita, em dinheiro.</li>
              </ul>
            </div>
            <div className={s.card}>
              <div className={s.emoji}>📦</div>
              <h3>Lote mínimo</h3>
              <ul className={s.lista}>
                <li>Cada empresa vende a partir de um pedido mínimo.</li>
                <li>Os pedidos do mesmo produto se somam até completar esse mínimo.</li>
                <li>O sistema mostra quantos pedidos faltam e avisa quando o lote fecha.</li>
                <li>Não há prazo máximo de espera, e você pode sair da fila quando quiser.</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className={s.bloco}>
        <p className={s.rotulo}>A visita</p>
        <h2 className={s.h2}>Prove em casa, com calma</h2>
        <div className={s.dois}>
          <div className={s.card}>
            <div className={s.emoji}>🏠</div>
            <h3>Como é a visita</h3>
            <ul className={s.lista}>
              <li>Janela de uma hora, confirmada por WhatsApp.</li>
              <li>Você prova o par pedido (e numerações vizinhas, quando houver).</li>
              <li>Gostou: paga em dinheiro e recebe recibo.</li>
              <li>Não gostou: não paga, e o par segue viagem.</li>
            </ul>
          </div>
          <div className={s.card}>
            <div className={s.emoji}>🛡️</div>
            <h3>Segurança</h3>
            <ul className={s.lista}>
              <li>Só visitamos cadastros confirmados por WhatsApp.</li>
              <li>A rota é compartilhada em tempo real com uma pessoa de confiança.</li>
              <li>Se preferir, combinamos um ponto público (padaria, praça).</li>
              <li>Nunca pedimos dinheiro antes da visita.</li>
            </ul>
          </div>
        </div>
      </section>

      <section className={s.faixaVerde}>
        <div className={s.bloco}>
          <p className={s.rotulo}>Rota e cidades</p>
          <h2 className={s.h2}>A viagem sai quando os lotes fecham</h2>
          <p className={s.sub}>
            Não há data fixa. Cada rota junta de 2 a 4 cidades em sequência e só sai quando os lotes estão completos e há visitas confirmadas
            suficientes (hoje, o mínimo é de 6 por cidade). A campanha fica aberta no Brasil inteiro, mas as visitas acontecem em ondas, porque
            a viagem é feita por uma pessoa só, com limite de bagagem. As cidades que ainda não atingiram o mínimo ficam em lista de espera para a rota seguinte.
          </p>
          <p className={s.sub}>
            Começamos pelas capitais: Belo Horizonte, Rio de Janeiro, Goiânia, Curitiba, Campo Grande, Vitória, Salvador, Florianópolis e São Paulo.
            Qualquer cidade com pedidos suficientes também pode entrar.
          </p>
          <div className={s.rolagem}>
            <table className={s.tabela}>
              <thead><tr><th>Como a cidade entra na rota</th><th>O que olhamos</th></tr></thead>
              <tbody>{CRITERIOS.map(([a, b]) => (<tr key={a}><td><b>{a}</b></td><td>{b}</td></tr>))}</tbody>
            </table>
          </div>
        </div>
      </section>

      <section id="pacote" className={s.bloco}>
        <p className={s.rotulo}>Pacote tecnológico</p>
        <h2 className={s.h2}>Do calçado ao seu próprio negócio</h2>
        <p className={s.sub}>
          Quem encomenda calçado pode conhecer, depois, produtos e serviços digitais. É um segundo passo opcional: a encomenda funciona sem ele.
          O pacote digital é cobrado normalmente por PIX. Não prometemos ganhos nem renda.
        </p>
        <div className={s.rolagem}>
          <table className={s.tabela}>
            <thead><tr><th>Oferta</th><th>Para quem</th><th>Como funciona</th></tr></thead>
            <tbody>{PACOTE.map(([a, b, c]) => (<tr key={a}><td><b>{a}</b></td><td>{b}</td><td>{c}</td></tr>))}</tbody>
          </table>
        </div>
        <div className={s.acoes} style={{ marginTop: 22 }}>
          <a href={WHATS} className={`${s.botao} ${s.verde}`} target="_blank" rel="noopener noreferrer">Quero saber do pacote</a>
        </div>
      </section>

      <section className={s.faixaVerde}>
        <div className={s.bloco}>
          <p className={s.rotulo}>Bastidores</p>
          <h2 className={s.h2}>IA e automação trabalhando por você</h2>
          <p className={s.sub}>Quase tudo que não é físico é feito pelo sistema, para o preço ficar baixo e o aviso chegar na hora certa.</p>
          <div className={s.grade}>
            {BASTIDORES.map(([e, t, p]) => (
              <div className={s.card} key={t}><div className={s.emoji}>{e}</div><h3>{t}</h3><p>{p}</p></div>
            ))}
          </div>
        </div>
      </section>

      <section className={s.bloco}>
        <p className={s.rotulo}>Cuidados</p>
        <h2 className={s.h2}>O que garantimos e o que não prometemos</h2>
        <div className={s.grade}>
          {CUIDADOS.map((c) => (
            <div className={s.card} key={c.t}><div className={s.emoji}>{c.e}</div><h3>{c.t}</h3><p>{c.p}</p></div>
          ))}
        </div>
      </section>

      <section className={s.faixaVerde}>
        <div className={s.bloco}>
          <p className={s.rotulo}>Dúvidas</p>
          <h2 className={s.h2}>Perguntas que todo mundo faz</h2>
          <div className={s.faq} style={{ maxWidth: 820 }}>
            {FAQ.map(([q, a]) => (<details key={q}><summary>{q}</summary><p>{a}</p></details>))}
          </div>
        </div>
      </section>

      <section className={s.final}>
        <div className={s.bloco}>
          <h2 className={s.h2}>Pronto para pedir o seu?</h2>
          <p>Leva dois minutos, não custa nada e você sai da fila quando quiser.</p>
          <div className={s.acoes}>
            <Link href="/encomendar" className={`${s.botao} ${s.principal}`}>Fazer minha encomenda</Link>
            <a href={WHATS} className={`${s.botao} ${s.contorno}`} target="_blank" rel="noopener noreferrer">Chamar no WhatsApp</a>
          </div>
        </div>
      </section>

      <footer className={s.rodape}>
        <p>Entrega em Casa · Igreja Eco. Preços, prazos e disponibilidade dependem de cada empresa e de cada lote.</p>
      </footer>
    </div>
  );
}
