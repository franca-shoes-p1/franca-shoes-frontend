/* Assistente: Loja de Calçados Pronta */
(function () {
  var EX = { Femininos: ["👠", "Sandália salto", "R$ 89,90"], Masculinos: ["👞", "Sapato social", "R$ 139,90"], Infantis: ["👟", "Tênis infantil", "R$ 79,90"], Esportivos: ["🏃", "Tênis esportivo", "R$ 149,90"], "Sandálias": ["🩴", "Sandália rasteira", "R$ 59,90"], "Acessórios": ["👜", "Bolsa e cinto", "R$ 49,90"] };
  var PAD = [["👠", "Sandália salto", "R$ 89,90"], ["👟", "Tênis casual", "R$ 119,90"], ["🥿", "Sapatilha", "R$ 69,90"], ["👞", "Sapato social", "R$ 139,90"]];
  window.ASSISTENTE = {
    servico: "Loja de Calçados Pronta",
    rotulo: "Monte a sua loja",
    pilula: "Loja de Calçados Pronta",
    tituloPagina: "Monte a sua loja de calçados | Igreja Eco",
    titulo: "Monte a sua loja <em>em 4 passos</em> e veja ela ganhar forma",
    lead: "Escolha o seu nível, o que quer vender e o nome da loja. A vitrine ao lado muda na hora. No fim, você manda o pedido e respondemos no WhatsApp, sem compromisso.",
    moldura: "celular",
    fichas: ["⚡ Prévia ao vivo", "PIX e cartão"],
    passos: [
      { titulo: "Qual é o seu momento?", dica: "Isso define o tamanho da loja que montamos para você.", campos: [
        { id: "nivel", tipo: "opcoes", opcoes: [
          { v: "Iniciante", e: "🌱", t: "Iniciante", s: "Nunca vendi calçado. Quero começar com tudo pronto." },
          { v: "Intermediário", e: "📲", t: "Intermediário", s: "Já vendo pelo WhatsApp, feira ou como revendedor(a)." },
          { v: "Avançado", e: "🏪", t: "Avançado", s: "Tenho loja ou fábrica e quero vender também pela internet." },
          { v: "Não sei, preciso de ajuda", e: "🤔", t: "Ainda não sei", s: "Prefiro que vocês me ajudem a escolher." }] }] },
      { titulo: "O que você quer vender?", dica: "Marque quantos quiser. A vitrine mostra as suas escolhas.", campos: [
        { id: "cats", tipo: "chips", opcoes: [{ v: "Femininos", e: "👠" }, { v: "Masculinos", e: "👞" }, { v: "Infantis", e: "👟" }, { v: "Esportivos", e: "🏃" }, { v: "Sandálias", e: "🩴" }, { v: "Acessórios", e: "👜" }] },
        { id: "onde", tipo: "select", rotulo: "Onde você vende hoje?", opcoes: ["Ainda não vendo", "WhatsApp", "Instagram", "Feira ou loja física", "Marketplace (Mercado Livre, Shopee)"] }] },
      { titulo: "Dê a cara da sua loja", dica: "Pode mudar depois. É só para vermos a ideia.", campos: [
        { id: "nomeLoja", tipo: "texto", rotulo: "Nome da loja", placeholder: "Ex.: Passos de Franca", max: 30 },
        { id: "cor", tipo: "cores", rotulo: "Cor principal", opcoes: [
          { v: "Azul", a: "#1e6bff", b: "#12c6e8" }, { v: "Rosa", a: "#e5307a", b: "#ff8fb1" }, { v: "Verde", a: "#0a8f6a", b: "#43d6a4" },
          { v: "Laranja", a: "#f0600a", b: "#ffb347" }, { v: "Roxo", a: "#6a3de8", b: "#b18cff" }, { v: "Preto e dourado", a: "#14110f", b: "#c9a24a" }] },
        { id: "modelos", tipo: "select", rotulo: "Quantos modelos quer começar a vender?", opcoes: ["10 a 20 modelos", "20 a 50 modelos", "Mais de 50 modelos", "Ainda não sei"] }] }
    ],
    previa: function (e, esc) {
      var itens = e.cats.length ? e.cats.slice(0, 4).map(function (x) { return EX[x]; }) : PAD.slice();
      while (itens.length < 4) itens.push(PAD[itens.length]);
      return '<div class="barra"><span>👟 ' + esc(e.nomeLoja || "Sua Loja") + "</span><span>🛒</span></div>" +
        '<div class="faixa">' + e.cats.map(function (x) { return "<em>" + esc(x) + "</em>"; }).join("") + "</div>" +
        '<div class="grade">' + itens.map(function (i) { return '<div class="card"><div class="foto">' + i[0] + "</div><b>" + esc(i[1]) + "</b><span>" + esc(i[2]) + "</span></div>"; }).join("") + "</div>" +
        '<div class="pagar">Pagar com PIX ou cartão</div>';
    },
    resumo: [["Nível", function (e) { return e.nivel; }], ["Vai vender", function (e) { return e.cats; }], ["Nome da loja", function (e) { return e.nomeLoja; }], ["Cor", function (e) { return e.cor; }], ["Começa com", function (e) { return e.modelos; }]],
    descricao: function (e) {
      return "Nível: " + e.nivel + " | Vender: " + (e.cats.join(", ") || "a definir") + " | Vende hoje em: " + e.onde + " | Nome da loja: " + (e.nomeLoja || "a definir") + " | Cor: " + e.cor + " | Modelos: " + e.modelos;
    },
    mensagem: function (e, d) {
      return "Olá! Quero montar a minha loja de calçados.\n\nNome: " + d.nome + "\nWhatsApp: " + d.whatsapp + "\nNível: " + e.nivel +
        "\nQuero vender: " + (e.cats.join(", ") || "a definir") + "\nVendo hoje em: " + e.onde + "\nNome da loja: " + (e.nomeLoja || "a definir") +
        "\nCor: " + e.cor + "\nModelos no início: " + e.modelos + (d.prazo ? "\nPrazo: " + d.prazo : "") + (d.obs ? "\nObservação: " + d.obs : "");
    }
  };
})();
