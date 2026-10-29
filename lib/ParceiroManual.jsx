// Manual do parceiro: instruções de operação dentro do painel, em linguagem simples.
import s from '../styles/radar.module.css';
import { WHATS_RADAR } from './radarAssistente';

const SECOES = [
  ['Primeiros passos', (
    <ol>
      <li><b>Monte a sua vitrine:</b> preencha logotipo, frase e contatos e clique em "Salvar e enviar para análise".</li>
      <li><b>Espere a aprovação:</b> nós conferimos e publicamos. A situação muda de "Em análise" para "Publicado".</li>
      <li><b>Divulgue:</b> use a área "Divulgação e trocas", no fim desta página, para publicar uma imagem por semana nos seus canais.</li>
    </ol>
  )],
  ['Como montar a vitrine', (
    <>
      <ul>
        <li><b>Logotipo ou foto da fachada:</b> envie só imagens que são suas. Quadrada fica melhor. Se não tiver logotipo, use uma foto do local.</li>
        <li><b>Frase curta (até 80 letras):</b> o que você faz, em uma linha. Ex.: "Pães quentinhos desde 1998".</li>
        <li><b>Sobre o seu negócio (até 400 letras):</b> conte o que você vende ou faz. Escreva a verdade, sem exagero.</li>
        <li><b>Horário, endereço, WhatsApp, Instagram e site:</b> só aparece o que você preencher. Contato que você não escrever aqui não é divulgado.</li>
      </ul>
      <p>A prévia ao lado mostra como a vitrine vai aparecer. Você pode editar quando quiser, mas cada alteração volta para análise e a página mostra só o nome até ser aprovada de novo.</p>
    </>
  )],
  ['As situações da vitrine', (
    <ul>
      <li><b>Ainda não enviado:</b> você ainda não clicou em "Salvar e enviar para análise".</li>
      <li><b>Em análise:</b> recebemos e vamos conferir.</li>
      <li><b>Publicado:</b> está no ar, na sua página, na página da cidade e na Vitrine dos Parceiros do site.</li>
      <li><b>Precisa de ajuste:</b> pedimos uma correção. Revise os textos ou a imagem e envie de novo.</li>
    </ul>
  )],
  ['Divulgação digital toda semana', (
    <>
      <p>É a sua parte da troca: você divulga a loja nos seus canais e o site divulga o seu negócio. Uma publicação por semana já basta.</p>
      <ol>
        <li>Em "Publicação desta semana", escolha <b>Story / status</b> (vertical) ou <b>Post</b> (quadrado) e clique em <b>Baixar imagem</b>. A imagem já vem com o seu QR.</li>
        <li>Clique em <b>Copiar legenda</b>, cole na publicação e publique no status, nos stories, no feed ou em grupos.</li>
        <li>Em "Comprovar a publicação", escolha onde publicou, cole o link (se tiver) ou escreva uma observação, e clique em <b>Enviar comprovação</b>.</li>
        <li>Nós conferimos. Quando aprovada, a publicação conta para o seu selo.</li>
      </ol>
      <p>O tema muda toda semana, então você não repete a mesma publicação. O sistema não posta por você: a publicação é sempre sua.</p>
    </>
  )],
  ['Selos', (
    <ul>
      <li><b>Parceiro Divulgador:</b> 1 publicação aprovada.</li>
      <li><b>Parceiro Prata:</b> 4 publicações aprovadas.</li>
      <li><b>Parceiro Ouro:</b> 12 publicações aprovadas.</li>
    </ul>
  )],
  ['Cartaz de papel (se você tem um espaço)', (
    <>
      <p>Se você tem um balcão, mural ou parede onde pode deixar um cartaz com QR Code, combinamos com você a entrega do cartaz. Cole só onde você tem permissão. Se não tiver espaço físico, não se preocupe: a divulgação digital já faz a sua parte da troca.</p>
    </>
  )],
  ['Troca com outros parceiros', (
    <ol>
      <li>Quando a sua vitrine estiver publicada, informe o seu ramo e clique em <b>Quero trocar divulgação</b>.</li>
      <li>Você verá os parceiros da sua cidade que também ligaram a opção. Clique em <b>Propor troca</b> no que fizer sentido.</li>
      <li>O outro parceiro vê a proposta no painel dele e aceita ou recusa.</li>
      <li>Se aceitar, vocês veem o WhatsApp, o Instagram e a página um do outro e combinam entre si: cada um divulga o outro, no ritmo de vocês.</li>
    </ol>
  )],
  ['Boas práticas e regras', (
    <ul>
      <li>Divulgue só o que é verdade. Nada de promessa de lucro, preço que não existe ou entrega que não combinamos.</li>
      <li>Use só imagens e textos seus.</li>
      <li>Não envie mensagens em massa para quem não conhece o seu negócio. Publique nos seus canais e converse com quem responder.</li>
      <li>Participar não custa nada e não há contrato. Não há pagamento, comissão ou promessa de vendas: é uma troca de divulgação.</li>
      <li>Conteúdo ofensivo ou enganoso é retirado do site.</li>
    </ul>
  )],
  ['Perguntas frequentes', (
    <>
      <p><b>Quem vê o meu contato?</b> Só o que você escrever na vitrine, e apenas depois de aprovado. Parceiros com troca combinada veem o WhatsApp e o Instagram que estão na sua vitrine.</p>
      <p><b>Perdi o link do meu painel.</b> Ele é a sua chave de acesso e não tem senha. Chame no WhatsApp para recuperar.</p>
      <p><b>Posso mudar a vitrine depois?</b> Pode, quando quiser. Volta para análise e o site mostra só o nome até ser aprovada de novo.</p>
      <p><b>Como saio do programa?</b> No fim da coluna da direita, clique em "Quero sair do programa". Seu local sai do site e não recebe mais mensagens.</p>
      <p><b>A divulgação "está em análise" faz muito tempo.</b> Chame no WhatsApp que verificamos.</p>
    </>
  )],
];

export default function ParceiroManual({ abertoInicio }) {
  return (
    <details className={s.cartao} open={!!abertoInicio} style={{ margin: '0 auto', maxWidth: 1000 }}>
      <summary style={{ cursor: 'pointer', fontWeight: 800, fontSize: 18 }}>📖 Manual do parceiro: como usar este painel</summary>
      <p style={{ margin: '10px 0 0' }}>Instruções passo a passo. Clique em cada título para abrir.</p>
      {SECOES.map(([t, c], i) => (
        <details key={t} style={{ borderTop: '1px solid rgba(138,84,41,.2)', marginTop: 10, paddingTop: 10 }}>
          <summary style={{ cursor: 'pointer', fontWeight: 700 }}>{i + 1}. {t}</summary>
          <div style={{ marginTop: 8, lineHeight: 1.55 }}>{c}</div>
        </details>
      ))}
      <p style={{ margin: '14px 0 0' }}>Ficou com dúvida? <a href={WHATS_RADAR} target="_blank" rel="noopener noreferrer">Chame no WhatsApp</a>.</p>
    </details>
  );
}
