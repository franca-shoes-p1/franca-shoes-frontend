/* Assistente: Peça uma tarefa à Oficina (cliente). Usa o mesmo motor do Ateliê. */
(function () {
  var TIPOS = {
    "Texto ou legenda": ["✍️", "Legenda para o post", "Pronta em 1 dia"],
    "Arte para redes sociais": ["🎨", "Post quadrado", "Feita no Canva"],
    "Base de respostas de atendimento": ["💬", "20 perguntas e respostas", "Para o WhatsApp"],
    "Pesquisa e lista": ["🔎", "Lista organizada", "Com fontes"],
    "Conferência e testes": ["✅", "Checklist de testes", "Antes de entregar"],
    "Outra tarefa": ["🧩", "Tarefa sob medida", "Combinamos juntos"]
  };
  var PAD = [["✍️", "Legenda para o post", "Pronta em 1 dia"], ["🎨", "Post quadrado", "Feita no Canva"], ["💬", "20 perguntas e respostas", "Para o WhatsApp"], ["✅", "Checklist de testes", "Antes de entregar"]];
  window.ASSISTENTE = {
    servico: "Tarefa avulsa da Oficina",
    rotulo: "Peça uma tarefa",
    pilula: "Oficina Digital",
    tituloPagina: "Peça uma tarefa à Oficina Digital | Igreja Eco",
    titulo: "Peça uma tarefa <em>em 4 passos</em> e veja o cartão ganhar forma",
    lead: "Diga o que precisa, quando precisa e como quer receber. O cartão de tarefa ao lado muda na hora. No fim, você manda o pedido e respondemos no WhatsApp, sem compromisso.",
    moldura: "celular",
    fichas: ["⚡ Prévia ao vivo", "Conferido antes de entregar"],
    passos: [
      { titulo: "O que você precisa?", dica: "Marque quantos tipos quiser. O cartão mostra as suas escolhas.", campos: [
        { id: "tipos", tipo: "chips", opcoes: [{ v: "Texto ou legenda", e: "✍️" }, { v: "Arte para redes sociais", e: "🎨" }, { v: "Base de respostas de atendimento", e: "💬" }, { v: "Pesquisa e lista", e: "🔎" }, { v: "Conferência e testes", e: "✅" }, { v: "Outra tarefa", e: "🧩" }] }] },
      { titulo: "Conte um pouco mais", dica: "Quanto mais claro, melhor a entrega. Pode mudar depois.", campos: [
        { id: "titulo", tipo: "texto", rotulo: "Nome da tarefa", placeholder: "Ex.: Posts da semana da minha loja", max: 40 },
        { id: "quantidade", tipo: "select", rotulo: "Tamanho do pedido", opcoes: ["Uma tarefa pequena", "Um pacote de 3 a 5 tarefas", "Trabalho contínuo, toda semana", "Ainda não sei"] }] },
      { titulo: "Para quando e com que cuidado?", dica: "Isso define a prioridade e a conferência.", campos: [
        { id: "urgencia", tipo: "opcoes", opcoes: [
          { v: "Sem pressa", e: "🌿", t: "Sem pressa", s: "Posso esperar alguns dias." },
          { v: "Esta semana", e: "📅", t: "Esta semana", s: "Preciso nos próximos dias." },
          { v: "Urgente", e: "⏱️", t: "Urgente", s: "Preciso o quanto antes." }] },
        { id: "conferencia", tipo: "select", rotulo: "Conferência", opcoes: ["Padrão (checklist e revisão da IA)", "Quero aprovar antes de usar", "Ainda não sei"] }] }
    ],
    previa: function (e, esc) {
      var itens = e.tipos.length ? e.tipos.slice(0, 4).map(function (x) { return TIPOS[x]; }) : PAD.slice();
      while (itens.length < 4) itens.push(PAD[itens.length]);
      return '<div class="barra"><span>📋 ' + esc(e.titulo || "Sua tarefa") + "</span><span>✓</span></div>" +
        '<div class="faixa">' + e.tipos.map(function (x) { return "<em>" + esc(x) + "</em>"; }).join("") + "</div>" +
        '<div class="grade">' + itens.map(function (i) { return '<div class="card"><div class="foto">' + i[0] + "</div><b>" + esc(i[1]) + "</b><span>" + esc(i[2]) + "</span></div>"; }).join("") + "</div>" +
        '<div class="pagar">' + esc(e.urgencia) + " · conferido antes</div>";
    },
    resumo: [["Precisa de", function (e) { return e.tipos; }], ["Nome da tarefa", function (e) { return e.titulo; }], ["Tamanho", function (e) { return e.quantidade; }], ["Prazo", function (e) { return e.urgencia; }], ["Conferência", function (e) { return e.conferencia; }]],
    descricao: function (e) {
      return "Tipos: " + (e.tipos.join(", ") || "a definir") + " | Tarefa: " + (e.titulo || "a definir") + " | Tamanho: " + e.quantidade + " | Prazo: " + e.urgencia + " | Conferência: " + e.conferencia;
    },
    mensagem: function (e, d) {
      return "Olá! Quero pedir uma tarefa à Oficina Digital.\n\nNome: " + d.nome + "\nWhatsApp: " + d.whatsapp +
        "\nPreciso de: " + (e.tipos.join(", ") || "a definir") + "\nTarefa: " + (e.titulo || "a definir") + "\nTamanho: " + e.quantidade +
        "\nPrazo: " + e.urgencia + "\nConferência: " + e.conferencia + (d.prazo ? "\nPrazo informado: " + d.prazo : "") + (d.obs ? "\nObservação: " + d.obs : "");
    }
  };
})();
