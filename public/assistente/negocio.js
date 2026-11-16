/* Assistente: Monte o seu negócio (pedido de construção). Passos mudam conforme o tipo de negócio. */
(function () {
  var CORES = [
    { v: "Verde", a: "#0a8f6a", b: "#43d6a4" }, { v: "Azul", a: "#1e6bff", b: "#12c6e8" }, { v: "Rosa", a: "#e5307a", b: "#ff8fb1" },
    { v: "Laranja", a: "#f0600a", b: "#ffb347" }, { v: "Roxo", a: "#6a3de8", b: "#b18cff" }, { v: "Preto e dourado", a: "#14110f", b: "#c9a24a" }
  ];
  var COM = "Comércio", SER = "Serviço", PRO = "Produto próprio", CON = "Conteúdo ou curso", IND = "Ainda não sei";
  var COM_OU_PRO = function (e) { return e.tipo === COM || e.tipo === PRO; };
  var ATENDENTE = function (e) { return (e.pacote || "").indexOf("Projeto + Atendente") === 0; };

  function slug(s) { return String(s || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]/g, ""); }
  function lista(v) { return (v && v.length) ? v.join(", ") : "a definir"; }
  function ou(v) { return v ? v : "a definir"; }

  /* campos que só valem para o tipo escolhido */
  function oferta(e) {
    if (COM_OU_PRO(e)) return { "Entrega": lista(e.entrega), "Tamanho do catálogo": ou(e.catalogo) };
    if (e.tipo === SER) return { "Como atende": lista(e.atende), "Como cobra": ou(e.cobra) };
    if (e.tipo === CON) return { "Formatos": lista(e.formato), "Cobrança": ou(e.cobranca) };
    return {};
  }

  window.ASSISTENTE = {
    servico: "Pedido de construção",
    rotulo: "Monte o seu negócio",
    pilula: "Pedido de construção",
    tituloPagina: "Monte o seu negócio | Igreja Eco",
    titulo: "Descreva o seu negócio <em>passo a passo</em> e veja o site ganhar forma",
    lead: "Conte o que você vende ou faz. As perguntas mudam conforme o tipo de negócio e o desenho aparece ao lado. No fim, você manda o pedido e continuamos a conversa pelo WhatsApp, sem compromisso.",
    moldura: "navegador",
    endpoint: "/api/construcao",
    fichas: ["⚡ Desenho ao vivo", "Aviso ao dono no Telegram"],
    passos: [
      { titulo: "Que tipo de negócio é o seu?", dica: "A escolha define as próximas perguntas.", campos: [
        { id: "tipo", tipo: "opcoes", opcoes: [
          { v: COM, e: "🛍️", t: "Comércio", s: "Vendo produtos numa loja ou ponto de venda." },
          { v: SER, e: "🔧", t: "Serviço", s: "Presto um serviço, com agenda ou orçamento." },
          { v: PRO, e: "🏭", t: "Produto próprio", s: "Eu fabrico ou crio o que vendo." },
          { v: CON, e: "🎓", t: "Conteúdo ou curso", s: "Ensino, publico ou vendo conteúdo digital." },
          { v: IND, e: "💡", t: "Ainda não sei", s: "Tenho uma ideia e quero ajuda para definir." }] }] },
      { titulo: "Conte sobre o negócio", dica: "Respostas curtas já bastam. Você completa o resto depois, na área do cliente.", campos: [
        { id: "nomeNeg", tipo: "texto", rotulo: "Nome do negócio", placeholder: "Ex.: Casa da Maria", max: 40 },
        { id: "vende", tipo: "texto", rotulo: "O que você vende ou faz?", placeholder: "Ex.: bolos e doces para festas", max: 120 },
        { id: "publico", tipo: "texto", rotulo: "Quem é o seu cliente?", placeholder: "Ex.: famílias do bairro", max: 120 },
        { id: "como", tipo: "select", rotulo: "Como você vende hoje?", opcoes: ["Pelo WhatsApp", "Em loja ou ponto físico", "Instagram ou redes sociais", "Marketplace", "Ainda não vendo"] }] },
      { titulo: "Entrega e catálogo", se: COM_OU_PRO, dica: "Isso define o que o site precisa mostrar sobre os produtos.", campos: [
        { id: "entrega", tipo: "chips", rotulo: "Como o cliente recebe?", opcoes: [{ v: "Retirada no local", e: "🏪" }, { v: "Entrega local", e: "🛵" }, { v: "Envio pelos Correios", e: "📦" }, { v: "Sob encomenda", e: "🧾" }] },
        { id: "catalogo", tipo: "select", rotulo: "Quantos produtos você tem?", opcoes: ["Poucos (até 10)", "Alguns (11 a 50)", "Muitos (mais de 50)", "Ainda não sei"] }] },
      { titulo: "Agenda e orçamento", se: function (e) { return e.tipo === SER; }, dica: "Isso define se o site precisa de agenda ou de pedido de orçamento.", campos: [
        { id: "atende", tipo: "chips", rotulo: "Como você atende?", opcoes: [{ v: "No meu local", e: "🏠" }, { v: "Na casa do cliente", e: "🚗" }, { v: "Online", e: "💻" }, { v: "Com hora marcada", e: "📅" }] },
        { id: "cobra", tipo: "select", rotulo: "Como você cobra?", opcoes: ["Preço fixo por serviço", "Por hora", "Por orçamento", "Ainda não defini"] }] },
      { titulo: "O seu conteúdo", se: function (e) { return e.tipo === CON; }, dica: "Isso define se o site precisa de área de alunos e pagamento.", campos: [
        { id: "formato", tipo: "chips", rotulo: "Que formatos você vai oferecer?", opcoes: [{ v: "Cursos em vídeo", e: "🎬" }, { v: "E-books", e: "📘" }, { v: "Blog ou artigos", e: "📝" }, { v: "Comunidade ou assinatura", e: "👥" }, { v: "Mentoria", e: "🧭" }] },
        { id: "cobranca", tipo: "select", rotulo: "Como pretende cobrar?", opcoes: ["Venda única", "Assinatura mensal", "Gratuito no começo", "Ainda não sei"] }] },
      { titulo: "O que o site precisa ter?", dica: "Marque quantos quiser. O desenho ao lado mostra as suas escolhas.", campos: [
        { id: "paginas", tipo: "chips", opcoes: [{ v: "Página inicial", e: "🏠" }, { v: "Catálogo ou serviços", e: "📖" }, { v: "Contato e WhatsApp", e: "💬" }, { v: "Agenda online", e: "📅" }, { v: "Pagamento online", e: "💳" }, { v: "Área do cliente", e: "🔐" }, { v: "Blog", e: "📝" }, { v: "Perguntas frequentes", e: "❓" }] }] },
      { titulo: "Dê a cara do negócio", dica: "Pode mudar depois. É só para vermos a ideia.", campos: [
        { id: "estilo", tipo: "opcoes", opcoes: [
          { v: "Simples e limpo", e: "⚪", t: "Simples e limpo", s: "Fundo claro, leitura fácil." },
          { v: "Moderno e colorido", e: "🎨", t: "Moderno e colorido", s: "Cores fortes e chamadas em destaque." },
          { v: "Sofisticado e escuro", e: "🖤", t: "Sofisticado e escuro", s: "Fundo escuro, visual premium." }] },
        { id: "cor", tipo: "cores", rotulo: "Cor principal", opcoes: CORES }] },
      { titulo: "Quer o Atendente WhatsApp junto?", dica: "O Atendente responde os clientes no WhatsApp com os dados que você acabou de nos passar.", campos: [
        { id: "pacote", tipo: "opcoes", opcoes: [
          { v: "Projeto + Atendente WhatsApp", e: "📦", t: "Projeto + Atendente WhatsApp", s: "O negócio e o atendimento prontos juntos, com piloto de 14 dias." },
          { v: "Só o projeto, por enquanto", e: "🧱", t: "Só o projeto, por enquanto", s: "O Atendente pode ser incluído depois." }] }] },
      { titulo: "Como o WhatsApp funciona no Atendente", se: ATENDENTE, dica: "Leia com atenção. O Atendente usa o canal NÃO oficial do WhatsApp, ligado a um número comum (de preferência separado do seu principal). Não há taxa de API da Meta, mas existe o risco de a Meta limitar ou bloquear o número, às vezes sem aviso. A conexão pode cair e precisar ser refeita, e não garantimos funcionamento sem interrupção. Não fazemos disparo em massa. O canal oficial da Meta é opcional, exige CNPJ ou MEI e tem cobrança da Meta por mensagem.", campos: [
        { id: "ciente", tipo: "opcoes", opcoes: [
          { v: "Li e quero seguir com o canal não oficial", e: "✅", t: "Li e quero seguir assim", s: "Entendi o risco de bloqueio do número e a falta de garantia." },
          { v: "Quero conversar sobre o canal oficial", e: "🏢", t: "Quero conversar sobre o canal oficial", s: "Tenho CNPJ ou MEI e prefiro mais segurança." }] }] }
    ],
    url: function (e) { return (slug(e.nomeNeg) || "seunegocio") + ".com.br"; },
    previa: function (e, esc) {
      var p = e.paginas || [];
      var tem = function (k) { return p.indexOf(k) >= 0; };
      var titulos = {}; titulos[COM] = "Tudo o que você procura, perto de você"; titulos[SER] = "Agende o seu atendimento"; titulos[PRO] = "Feito com cuidado, entregue para você"; titulos[CON] = "Aprenda no seu ritmo";
      var tit = titulos[e.tipo] || "A sua ideia no ar";
      var escuro = e.estilo === "Sofisticado e escuro", colorido = e.estilo === "Moderno e colorido";
      var fundo = escuro ? "#16121f" : "#ffffff", texto = escuro ? "#f4f1fa" : "#2a1457";
      var hero = colorido || !escuro ? "linear-gradient(135deg,var(--cor,#6a3de8),var(--cor2,#b18cff))" : "linear-gradient(135deg,#2b2340,#16121f)";
      var menu = ["Página inicial", "Catálogo ou serviços", "Contato e WhatsApp", "Blog"].filter(tem).slice(0, 4).map(function (m) { return '<span style="font-size:11px;opacity:.8">' + esc(m.split(" ")[0] === "Página" ? "Início" : m.split(" ")[0]) + "</span>"; }).join("");
      var cartoes = ["Catálogo ou serviços", "Agenda online", "Pagamento online", "Área do cliente", "Perguntas frequentes"].filter(tem).slice(0, 3).map(function (m) { return '<div style="flex:1;border:1px solid rgba(128,128,128,.3);border-radius:8px;padding:10px 8px;font-size:11px;text-align:center">' + esc(m) + "</div>"; }).join("");
      var botoes = (tem("Contato e WhatsApp") ? '<span style="background:#25d366;color:#fff;border-radius:999px;padding:6px 12px;font-size:12px;font-weight:700">Falar no WhatsApp</span>' : "") +
        (tem("Agenda online") ? ' <span style="background:#fff;color:#2a1457;border-radius:999px;padding:6px 12px;font-size:12px;font-weight:700">Agendar</span>' : "");
      var selo = ATENDENTE(e) ? '<div style="margin:10px 14px 14px;background:#fff8d6;border:1px dashed #d4a800;color:#5a4700;border-radius:10px;padding:6px 10px;font-size:11px">💬 Atendente WhatsApp incluído no pacote</div>' : "";
      return '<div style="background:' + fundo + ";color:" + texto + ';font-family:system-ui,sans-serif;min-height:100%">' +
        '<div style="display:flex;justify-content:space-between;align-items:center;gap:8px;padding:10px 14px;border-bottom:1px solid rgba(128,128,128,.25)"><b style="font-size:13px">' + esc(e.nomeNeg || "Seu Negócio") + '</b><span style="display:flex;gap:10px">' + menu + "</span></div>" +
        '<div style="background:' + hero + ';color:#fff;padding:26px 16px"><div style="font-size:18px;font-weight:800;line-height:1.2">' + esc(tit) + '</div><div style="font-size:12px;opacity:.92;margin-top:6px">' + esc(e.vende || "O que você vende ou faz aparece aqui") + '</div><div style="margin-top:12px;display:flex;gap:8px;flex-wrap:wrap">' + botoes + "</div></div>" +
        '<div style="display:flex;gap:8px;padding:14px">' + (cartoes || '<div style="flex:1;border:1px dashed rgba(128,128,128,.4);border-radius:8px;padding:12px;font-size:11px;text-align:center;opacity:.7">Marque as páginas do passo 5 para vê-las aqui</div>') + "</div>" + selo + "</div>";
    },
    resumo: [["Tipo", function (e) { return e.tipo; }], ["Negócio", function (e) { return e.nomeNeg; }], ["O que vende ou faz", function (e) { return e.vende; }],
      ["Páginas", function (e) { return e.paginas; }], ["Estilo", function (e) { return e.estilo; }], ["Pacote", function (e) { return e.pacote; }]],
    descricao: function (e) {
      return "Tipo: " + e.tipo + " | Negócio: " + ou(e.nomeNeg) + " | Vende/faz: " + ou(e.vende) + " | Pacote: " + e.pacote;
    },
    dados: function (e, base) {
      var respostas = {
        negocio: { "Tipo": e.tipo, "Nome do negócio": ou(e.nomeNeg), "O que vende ou faz": ou(e.vende), "Público": ou(e.publico), "Como vende hoje": e.como },
        oferta: oferta(e),
        paginas: { "Páginas e funções": lista(e.paginas) },
        identidade: { "Estilo": e.estilo, "Cor principal": e.cor },
        atendimento: { "Pacote": e.pacote, "Canal WhatsApp": ATENDENTE(e) ? ou(e.ciente) : "não se aplica" },
        prazo: { "Prazo": base.prazo || "a definir", "Observação": base.obs || "nenhuma" }
      };
      return { nome: base.nome, whatsapp: base.whatsapp, prazo: base.prazo, tipo_negocio: e.tipo, segmento: e.vende, pacote_atendente: ATENDENTE(e), respostas: respostas, site: base.site };
    },
    mensagem: function (e, d) {
      var of = oferta(e), linhas = Object.keys(of).map(function (k) { return "\n" + k + ": " + of[k]; }).join("");
      return "Olá! Quero montar o meu negócio no site.\n\nNome: " + d.nome + "\nWhatsApp: " + d.whatsapp + "\nTipo: " + e.tipo + "\nNegócio: " + ou(e.nomeNeg) +
        "\nO que vende ou faz: " + ou(e.vende) + "\nPúblico: " + ou(e.publico) + linhas + "\nPáginas: " + lista(e.paginas) + "\nEstilo: " + e.estilo + " / " + e.cor +
        "\nPacote: " + e.pacote + (ATENDENTE(e) ? "\nCanal WhatsApp: " + ou(e.ciente) : "") + (d.prazo ? "\nPrazo: " + d.prazo : "") + (d.obs ? "\nObservação: " + d.obs : "");
    }
  };
})();
