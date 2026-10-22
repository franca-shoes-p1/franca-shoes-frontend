/* Assistente: Site ou página de vendas */
(function () {
  var CTA = { "Vender produtos": "Comprar agora", "Receber contatos no WhatsApp": "Chamar no WhatsApp", "Apresentar o meu negócio": "Conheça o negócio", "Agendar atendimentos": "Agendar horário", "Vender um curso ou ebook": "Quero o curso" };
  var SEC = { "Sobre": ["🙋", "Quem somos"], "Serviços": ["🛠️", "O que fazemos"], "Produtos": ["🛍️", "Vitrine de produtos"], "Depoimentos": ["💬", "Clientes que recomendam"], "Perguntas": ["❓", "Perguntas frequentes"], "Galeria": ["🖼️", "Fotos e trabalhos"], "Preços": ["💲", "Planos e valores"], "Contato": ["📍", "Fale com a gente"] };
  function slug(s) { return (s || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, "").slice(0, 24) || "seusite"; }
  window.ASSISTENTE = {
    servico: "Site ou página de vendas",
    rotulo: "Monte o seu site",
    pilula: "Site ou página de vendas",
    tituloPagina: "Monte o seu site ou página de vendas | Igreja Eco",
    titulo: "Monte o seu site <em>em 4 passos</em> e veja ele aparecer",
    lead: "Diga o objetivo, escolha o estilo e as seções, dê nome e cor. O site de exemplo ao lado muda na hora. No fim, você manda o pedido e respondemos no WhatsApp, sem compromisso.",
    moldura: "navegador",
    fichas: ["⚡ Prévia ao vivo", "Pronto para celular"],
    url: function (e) { return slug(e.nomeNeg) + ".com.br"; },
    passos: [
      { titulo: "Qual é o objetivo do site?", dica: "Isso decide o botão principal e a estrutura da página.", campos: [
        { id: "objetivo", tipo: "opcoes", opcoes: [
          { v: "Vender produtos", e: "🛍️", t: "Vender produtos", s: "Vitrine, carrinho e pagamento." },
          { v: "Receber contatos no WhatsApp", e: "💬", t: "Receber contatos no WhatsApp", s: "Página que leva o cliente direto para a conversa." },
          { v: "Apresentar o meu negócio", e: "🏢", t: "Apresentar o meu negócio", s: "Cartão de visitas na internet." },
          { v: "Agendar atendimentos", e: "📅", t: "Agendar atendimentos", s: "Clínica, salão, consultoria, aulas." },
          { v: "Vender um curso ou ebook", e: "🎓", t: "Vender um curso ou ebook", s: "Página de vendas com chamada para comprar." }] }] },
      { titulo: "Estilo e seções", dica: "Escolha o jeito do site e o que aparece nele. Veja ao lado.", campos: [
        { id: "estilo", tipo: "opcoes", rotulo: "Estilo", opcoes: [
          { v: "Moderno", e: "✨", t: "Moderno", s: "Cores vivas e cantos arredondados." },
          { v: "Elegante", e: "🎩", t: "Elegante", s: "Letra clássica e visual sofisticado." },
          { v: "Divertido", e: "🎈", t: "Divertido", s: "Leve, colorido e amigável." },
          { v: "Minimalista", e: "▫️", t: "Minimalista", s: "Limpo, muito espaço em branco." }] },
        { id: "secoes", tipo: "chips", rotulo: "Seções da página", opcoes: Object.keys(SEC).map(function (k) { return { v: k, e: SEC[k][0] }; }) }] },
      { titulo: "Dê a cara ao site", dica: "Pode mudar depois. É só para vermos a ideia.", campos: [
        { id: "nomeNeg", tipo: "texto", rotulo: "Nome do negócio", placeholder: "Ex.: Clínica Bem Viver", max: 30 },
        { id: "frase", tipo: "texto", rotulo: "Frase de destaque", placeholder: "Ex.: Cuidado de verdade, perto de você", max: 70 },
        { id: "cor", tipo: "cores", rotulo: "Cor principal", opcoes: [
          { v: "Azul", a: "#1e6bff", b: "#12c6e8" }, { v: "Rosa", a: "#e5307a", b: "#ff8fb1" }, { v: "Verde", a: "#0a8f6a", b: "#43d6a4" },
          { v: "Laranja", a: "#f0600a", b: "#ffb347" }, { v: "Roxo", a: "#6a3de8", b: "#b18cff" }, { v: "Preto e dourado", a: "#14110f", b: "#c9a24a" }] }] }
    ],
    previa: function (e, esc) {
      var sec = e.secoes.length ? e.secoes : [];
      var blocos = sec.length
        ? sec.slice(0, 5).map(function (k) { return '<div class="bloco"><span class="ic">' + SEC[k][0] + "</span><span>" + esc(k) + "<small>" + esc(SEC[k][1]) + "</small></span></div>"; }).join("") + (sec.length > 5 ? '<div class="vazio">+ ' + (sec.length - 5) + " seção(ões)</div>" : "")
        : '<div class="vazio">Marque as seções no passo 2 e elas aparecem aqui.</div>';
      return '<div class="site" data-estilo="' + esc(e.estilo) + '">' +
        '<div class="nav"><strong>' + esc(e.nomeNeg || "Seu Negócio") + "</strong><span>Início · Contato</span></div>" +
        '<div class="heroi"><h4>' + esc(e.frase || "A frase de destaque do seu negócio aparece aqui") + "</h4><p>" + esc(e.objetivo) + '</p><span class="cta">' + esc(CTA[e.objetivo] || "Saiba mais") + "</span></div>" +
        '<div class="blocos">' + blocos + "</div></div>";
    },
    resumo: [["Objetivo", function (e) { return e.objetivo; }], ["Estilo", function (e) { return e.estilo; }], ["Seções", function (e) { return e.secoes; }], ["Negócio", function (e) { return e.nomeNeg; }], ["Frase", function (e) { return e.frase; }], ["Cor", function (e) { return e.cor; }]],
    descricao: function (e) {
      return "Objetivo: " + e.objetivo + " | Estilo: " + e.estilo + " | Seções: " + (e.secoes.join(", ") || "a definir") + " | Negócio: " + (e.nomeNeg || "a definir") + " | Frase: " + (e.frase || "a definir") + " | Cor: " + e.cor;
    },
    mensagem: function (e, d) {
      return "Olá! Quero montar o meu site ou página de vendas.\n\nNome: " + d.nome + "\nWhatsApp: " + d.whatsapp + "\nObjetivo: " + e.objetivo +
        "\nEstilo: " + e.estilo + "\nSeções: " + (e.secoes.join(", ") || "a definir") + "\nNome do negócio: " + (e.nomeNeg || "a definir") +
        "\nFrase de destaque: " + (e.frase || "a definir") + "\nCor: " + e.cor + (d.prazo ? "\nPrazo: " + d.prazo : "") + (d.obs ? "\nObservação: " + d.obs : "");
    }
  };
})();
