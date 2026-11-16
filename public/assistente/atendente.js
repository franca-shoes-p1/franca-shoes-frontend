/* Assistente: Atendente WhatsApp (monte o seu atendente em 4 passos, com prévia ao vivo de uma conversa) */
(function () {
  var DADOS = {
    "Loja": { e: "🛍️", ola: "Olá! Procura algum produto?", q1: "Quanto custa o tênis?", r1: "O Tênis esportivo custa R$ 119,90, tamanhos 37 ao 43.", q2: "Quero comprar", r2: "Pedido anotado: 1 Tênis esportivo, R$ 119,90.", ag: "Posso reservar amanhã, às 10h30?", aviso: "Novo pedido: Tênis esportivo, R$ 119,90." },
    "Clínica ou consultório": { e: "🩺", ola: "Olá! Quer marcar ou remarcar um horário?", q1: "Quanto custa a consulta?", r1: "A consulta custa R$ 200,00 (valor de exemplo).", q2: "Quero marcar", r2: "Pedido anotado: consulta amanhã, 10h30.", ag: "Tenho vaga amanhã às 9h, 10h30 e 15h.", aviso: "Horário reservado: amanhã, 10h30." },
    "Restaurante ou padaria": { e: "🍽️", ola: "Olá! Quer ver o cardápio de hoje?", q1: "Qual o prato do dia?", r1: "Hoje: frango assado com arroz e salada, R$ 28,00.", q2: "Quero 2 pratos", r2: "Pedido anotado: 2 pratos do dia, R$ 56,00.", ag: "Posso deixar pronto para as 12h?", aviso: "Novo pedido: 2 pratos do dia, R$ 56,00." },
    "Serviços ou oficina": { e: "🔧", ola: "Olá! Qual serviço você precisa?", q1: "Quanto custa a revisão?", r1: "A revisão básica custa R$ 180,00 (valor de exemplo).", q2: "Quero fazer", r2: "Pedido anotado: revisão básica.", ag: "Posso encaixar na quinta, às 14h?", aviso: "Novo serviço: revisão básica, quinta 14h." },
    "Salão ou estética": { e: "💇", ola: "Olá! Quer marcar um horário?", q1: "Quanto custa o corte?", r1: "O corte custa R$ 60,00 (valor de exemplo).", q2: "Quero marcar", r2: "Pedido anotado: corte, sexta 15h.", ag: "Tenho sexta às 15h ou sábado às 9h.", aviso: "Horário reservado: sexta, 15h." },
    "Outro": { e: "💼", ola: "Olá! Como posso ajudar?", q1: "Quanto custa?", r1: "Os valores aparecem aqui, do jeito que você cadastrar.", q2: "Quero contratar", r2: "Pedido anotado. O dono entra em contato.", ag: "Qual dia e horário ficam melhores para você?", aviso: "Novo cliente interessado." }
  };
  function b(t, c) { return '<div style="align-self:' + (c ? "flex-end" : "flex-start") + ";max-width:86%;background:" + (c ? "#d9fdd3" : "#fff") + ';border-radius:12px;padding:6px 10px;font-size:.74rem;line-height:1.35;box-shadow:0 1px 2px rgba(0,0,0,.1);color:#1b1b1b">' + t + "</div>"; }
  window.ASSISTENTE = {
    servico: "Atendente WhatsApp",
    rotulo: "Monte o seu atendente",
    pilula: "Atendente WhatsApp",
    tituloPagina: "Monte o seu atendente de WhatsApp | Igreja Eco",
    titulo: "Monte o seu atendente <em>passo a passo</em> e veja a conversa ganhar forma",
    lead: "Diga o tipo de negócio, o que o assistente deve fazer e o nome dele. A conversa ao lado muda na hora. No fim, você manda o pedido e respondemos no WhatsApp, sem compromisso.",
    moldura: "celular",
    fichas: ["⚡ Prévia ao vivo", "Aviso no Telegram"],
    passos: [
      { titulo: "Qual é o seu negócio?", dica: "Isso define os exemplos de conversa que aparecem na prévia.", campos: [
        { id: "negocio", tipo: "opcoes", opcoes: [
          { v: "Loja", e: "🛍️", t: "Loja", s: "Vendo produtos e recebo pedidos pelo WhatsApp." },
          { v: "Clínica ou consultório", e: "🩺", t: "Clínica ou consultório", s: "Marco consultas e quero reduzir as faltas." },
          { v: "Restaurante ou padaria", e: "🍽️", t: "Restaurante ou padaria", s: "Cardápio, encomendas e pedidos do dia." },
          { v: "Serviços ou oficina", e: "🔧", t: "Serviços ou oficina", s: "Orçamentos, prazos e agendamentos." },
          { v: "Salão ou estética", e: "💇", t: "Salão ou estética", s: "Horários livres e confirmações." },
          { v: "Outro", e: "💼", t: "Outro tipo de negócio", s: "Conto o meu caso e vocês adaptam." }] }] },
      { titulo: "O que o assistente deve fazer?", dica: "Marque quantos quiser. A conversa ao lado mostra as suas escolhas.", campos: [
        { id: "funcoes", tipo: "chips", opcoes: [{ v: "Catálogo e preços", e: "📖" }, { v: "Marcar horário", e: "📅" }, { v: "Anotar pedidos", e: "🛒" }, { v: "Responder dúvidas", e: "❓" }, { v: "Avisar no Telegram", e: "🔔" }, { v: "Lembrar o cliente", e: "⏰" }] },
        { id: "volume", tipo: "select", rotulo: "Quantas conversas você atende por dia?", opcoes: ["Menos de 10", "10 a 30", "Mais de 30", "Ainda não sei"] }] },
      { titulo: "Dê a cara do seu assistente", dica: "Pode mudar depois. É só para vermos a ideia.", campos: [
        { id: "nomeNeg", tipo: "texto", rotulo: "Nome do seu negócio", placeholder: "Ex.: Passos de Franca", max: 30 },
        { id: "nomeAss", tipo: "texto", rotulo: "Nome do assistente", placeholder: "Ex.: Duda", max: 20 },
        { id: "cor", tipo: "cores", rotulo: "Cor principal", opcoes: [
          { v: "Verde", a: "#0a8f6a", b: "#43d6a4" }, { v: "Azul", a: "#1e6bff", b: "#12c6e8" }, { v: "Rosa", a: "#e5307a", b: "#ff8fb1" },
          { v: "Laranja", a: "#f0600a", b: "#ffb347" }, { v: "Roxo", a: "#6a3de8", b: "#b18cff" }, { v: "Preto e dourado", a: "#14110f", b: "#c9a24a" }] }] },
      { titulo: "Como o WhatsApp funciona no Atendente", dica: "Leia com atenção. O Atendente usa o canal NÃO oficial do WhatsApp, ligado a um número comum (de preferência separado do seu principal). Não há taxa de API da Meta, mas existe o risco de a Meta limitar ou bloquear o número, às vezes sem aviso. A conexão pode cair e precisar ser refeita, e não garantimos funcionamento sem interrupção. Não fazemos disparo em massa. O canal oficial da Meta é opcional, exige CNPJ ou MEI e tem cobrança da Meta por mensagem.", campos: [
        { id: "ciente", tipo: "opcoes", opcoes: [
          { v: "Li e quero seguir com o canal não oficial", e: "✅", t: "Li e quero seguir assim", s: "Entendi o risco de bloqueio do número e a falta de garantia." },
          { v: "Quero conversar sobre o canal oficial", e: "🏢", t: "Quero conversar sobre o canal oficial", s: "Tenho CNPJ ou MEI e prefiro mais segurança." }] }] }
    ],
    previa: function (e, esc) {
      var d = DADOS[e.negocio] || DADOS["Loja"];
      var f = e.funcoes || [];
      var tem = function (k) { return f.indexOf(k) >= 0; };
      var m = b(esc(d.ola), false);
      if (tem("Catálogo e preços") || tem("Responder dúvidas") || !f.length) m += b(esc(d.q1), true) + b(esc(d.r1), false);
      if (tem("Marcar horário")) m += b("Quero marcar um horário", true) + b(esc(d.ag), false);
      if (tem("Anotar pedidos")) m += b(esc(d.q2), true) + b(esc(d.r2), false);
      if (tem("Lembrar o cliente")) m += b("Lembrete: amanhã, 10h30. Confirma?", false);
      if (tem("Avisar no Telegram")) m += '<div style="background:#fff8d6;border:1px dashed #d4a800;border-radius:10px;padding:6px 9px;font-size:.68rem;line-height:1.35;color:#5a4700"><b>📲 Aviso ao dono (Telegram)</b><br>' + esc(d.aviso) + "</div>";
      return '<div class="barra"><span>' + d.e + " " + esc(e.nomeAss || "Seu assistente") + "</span><span>● online</span></div>" +
        '<div style="padding:4px 14px 0;font-size:.68rem;color:#555">' + esc(e.nomeNeg || "Seu Negócio") + "</div>" +
        '<div style="flex:1;display:flex;flex-direction:column;gap:6px;padding:10px 12px;background:#efeae2;overflow:hidden">' + m + "</div>" +
        '<div class="pagar">Responde 24 horas por dia</div>';
    },
    resumo: [["Negócio", function (e) { return e.negocio; }], ["Faz", function (e) { return e.funcoes; }], ["Conversas por dia", function (e) { return e.volume; }], ["Nome do negócio", function (e) { return e.nomeNeg; }], ["Nome do assistente", function (e) { return e.nomeAss; }], ["Canal WhatsApp", function (e) { return e.ciente; }], ["Cor", function (e) { return e.cor; }]],
    descricao: function (e) {
      return "Negócio: " + e.negocio + " | Funções: " + ((e.funcoes || []).join(", ") || "a definir") + " | Conversas por dia: " + e.volume + " | Nome do negócio: " + (e.nomeNeg || "a definir") + " | Canal: " + (e.ciente || "a confirmar") + " | Assistente: " + (e.nomeAss || "a definir") + " | Cor: " + e.cor;
    },
    mensagem: function (e, d) {
      return "Olá! Quero montar o meu Atendente WhatsApp.\n\nNome: " + d.nome + "\nWhatsApp: " + d.whatsapp + "\nNegócio: " + e.negocio +
        "\nFunções: " + ((e.funcoes || []).join(", ") || "a definir") + "\nConversas por dia: " + e.volume + "\nNome do negócio: " + (e.nomeNeg || "a definir") +
        "\nNome do assistente: " + (e.nomeAss || "a definir") + "\nCanal WhatsApp: " + (e.ciente || "a confirmar") + "\nCor: " + e.cor + (d.prazo ? "\nPrazo: " + d.prazo : "") + (d.obs ? "\nObservação: " + d.obs : "");
    }
  };
})();
