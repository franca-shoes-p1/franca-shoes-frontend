import React from 'react';
import Head from 'next/head';
import Link from 'next/link';
import s from '../styles/radar.module.css';
import RadarAssistente from '../lib/RadarAssistente';
import { WHATS_RADAR } from '../lib/radarAssistente';

const PASSOS = [
  { t: 'Mapeamos a cidade', p: 'Procuramos locais com muito movimento: rodoviárias, faculdades, academias, igrejas, padarias e comércios.' },
  { t: 'Convidamos por mensagem', p: 'Cada local recebe uma mensagem curta com um link. Lá, a pessoa escolhe "Sim, autorizo o cartaz" ou "Não, obrigado".' },
  { t: 'Colamos só onde autorizou', p: 'Depois do "sim", o responsável leva o cartaz pessoalmente e o local passa a aparecer como Ponto Parceiro.' },
  { t: 'O QR leva à loja', p: 'Quem passa aponta o celular, abre a loja e compra por PIX ou cartão. A entrega é em mãos, em dia marcado.' },
];

export default function Radar() {
  return (
    <div className={s.pagina}>
      <Head>
        <title>Radar de Pontos · Calçados de fábrica por cidade</title>
        <meta name="description" content="Cartazes com QR code em locais autorizados, cidade por cidade, que levam à loja de calçados e acessórios de fábrica. Começando por Belo Horizonte." />
      </Head>

      <div className={s.barra}>
        <Link href="/">← Voltar ao site</Link>
        <Link href="/admin/radar" className={`${s.botao} ${s.contorno}`}>🔑 Entrar nos painéis</Link>
      </div>

      <header className={s.banner}>
        <div className={s.dentro} style={{ gridTemplateColumns: "minmax(0, 1fr)" }}>
          <div className={s.esq}>
            <span className={s.pilula}><i />Radar de Pontos</span>
            <h1 className={s.titulo}>Divulgação cidade por cidade, <em>só com autorização</em></h1>
            <p className={s.texto}>
              O Radar de Pontos leva a loja de calçados e acessórios de fábrica até as pessoas, por meio de cartazes com QR code em locais
              que disseram "sim". Esta página explica como tudo funciona, para quem tem um comércio e para quem quer comprar.
            </p>
            <div className={s.acoes}>
              <a href="#assistente" className={`${s.botao} ${s.principal}`}>Perguntar ao assistente</a>
              <Link href="/radar/participar" className={`${s.botao} ${s.contorno}`}>Quero participar</Link>
              <Link href="/calcados" className={`${s.botao} ${s.contorno}`}>Ver a loja</Link>
              <a href={WHATS_RADAR} className={`${s.botao} ${s.contorno}`} target="_blank" rel="noopener noreferrer">Chamar no WhatsApp</a>
            </div>
          </div>
        </div>
      </header>

      <section className={s.bloco}>
        <p className={s.rotulo}>Como funciona</p>
        <h2 className={s.h2}>Quatro passos, sem surpresa</h2>
        <p className={s.sub}>Nada é colado antes de um "sim". Quem recusa não recebe mais mensagem.</p>
        <div className={s.grade}>
          {PASSOS.map((p, i) => (
            <div className={s.etapa} key={p.t}><b>{i + 1}</b><div><h3>{p.t}</h3><p>{p.p}</p></div></div>
          ))}
        </div>
      </section>

      <section className={s.bloco}>
        <p className={s.rotulo}>Troca de divulgação</p>
        <h2 className={s.h2}>Qualquer pessoa pode participar</h2>
        <p className={s.sub}>Cada um ajuda o outro a ser encontrado, sem custo e sem contrato. Você pode participar de quatro jeitos, juntos ou separados.</p>
        <div className={s.grade}>
          <div className={s.cartao}><div className={s.emoji}>🧰</div><h3>Tenho um negócio, serviço ou projeto</h3><p>Ganha uma vitrine grátis no site, com logotipo, frase e contatos, que você mesmo monta num painel simples.</p></div>
          <div className={s.cartao}><div className={s.emoji}>📌</div><h3>Tenho um espaço</h3><p>Mural de condomínio, igreja, escola, associação ou comércio: você cede um cantinho para o cartaz com QR code.</p></div>
          <div className={s.cartao}><div className={s.emoji}>📱</div><h3>Não tenho ponto físico</h3><p>Sem problema: divulgue pelo celular, no status, nos stories ou nos grupos. O painel entrega a imagem com o seu QR e uma legenda nova por semana. Você também pode propor troca de divulgação com outros parceiros da sua cidade.</p></div>
          <div className={s.cartao}><div className={s.emoji}>🗣️</div><h3>Quero indicar</h3><p>Conhece um bom local ou alguém que ia gostar? Indique pelo WhatsApp e nós fazemos o convite com respeito.</p></div>
        </div>
        <div className={s.acoes}><Link href="/radar/participar" className={`${s.botao} ${s.principal}`}>Quero participar</Link></div>
      </section>

      <section className={s.faixaBege}>
        <div className={s.bloco}>
          <div className={s.duas}>
            <div className={s.cartao}>
              <div className={s.emoji}>🏪</div>
              <h3>Para quem cede um espaço ou tem um negócio</h3>
              <ul className={s.lista}>
                <li>Cartaz pequeno com o seu nome como "Ponto Parceiro" e uma vitrine grátis no site, com a sua marca.</li>
                <li>Sem custo e sem contrato. Você pede para retirar quando quiser.</li>
                <li>Você responde pelo link da mensagem, no seu tempo.</li>
                <li>Não prometemos pagamento nem comissão ao ponto.</li>
              </ul>
            </div>
            <div className={s.cartao}>
              <div className={s.emoji}>🛍️</div>
              <h3>Para quem quer comprar</h3>
              <ul className={s.lista}>
                <li>Aponte a câmera do celular para o QR do cartaz.</li>
                <li>Escolha na loja e pague por PIX ou cartão.</li>
                <li>Entrega em mãos em "Dia de Entrega" marcado na sua cidade.</li>
                <li>Preços e condições aparecem antes de pagar.</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className={s.bloco}>
        <p className={s.rotulo}>Cuidados</p>
        <h2 className={s.h2}>O que fazemos e o que não fazemos</h2>
        <div className={s.grade}>
          <div className={s.cartao}><div className={s.emoji}>✅</div><h3>Só locais autorizados</h3><p>Nada em postes, muros ou prédios públicos. Cartaz só onde o responsável permitiu.</p></div>
          <div className={s.cartao}><div className={s.emoji}>🔒</div><h3>Privacidade</h3><p>O QR só conta visitas, sem guardar dados pessoais. Contatos de estabelecimentos servem apenas para o convite.</p></div>
          <div className={s.cartao}><div className={s.emoji}>📵</div><h3>Poucas mensagens</h3><p>Convites enviados aos poucos, um por local. Uma recusa encerra o contato.</p></div>
          <div className={s.cartao}><div className={s.emoji}>🤝</div><h3>Sem promessa de ganho</h3><p>O Radar divulga a loja. Não garante vendas nem renda para ninguém.</p></div>
        </div>
      </section>

      <section className={s.faixaBege}>
        <div className={s.bloco}>
          <p className={s.rotulo}>Cidades</p>
          <h2 className={s.h2}>Começamos por Belo Horizonte (MG)</h2>
          <p className={s.sub}>Abrimos uma cidade de cada vez, para cuidar bem de cada ponto. A sua cidade é a próxima? Chame no WhatsApp.</p>
          <a href={WHATS_RADAR} className={`${s.botao} ${s.principal}`} target="_blank" rel="noopener noreferrer">Pedir a minha cidade</a>
        </div>
      </section>

      <section className={s.bloco}>
        <p className={s.rotulo}>Assistente</p>
        <h2 className={s.h2}>Tire a sua dúvida agora</h2>
        <p className={s.sub}>Respostas prontas sobre o projeto. Se não achar, o WhatsApp resolve.</p>
        <div style={{ maxWidth: 720 }}><RadarAssistente /></div>
      </section>

      <footer className={s.rodape}>
        <p>Painéis do responsável: <Link href="/admin/radar">Painel do dia</Link> · <Link href="/admin/pontos">Mapa e pontos</Link></p>
      </footer>
    </div>
  );
}
