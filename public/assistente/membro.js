/* Assistente: Seja membro (cadastro da Igreja Evangelho dos Pobres dos Alimentos Sagrados). Gratuito, sem dízimo nem oferta. */
(function () {
  var SERVIR = [{ v: "Acolhimento", e: "🤝" }, { v: "Ensino", e: "📖" }, { v: "Mordomia (horta e despensa)", e: "🌱" }, { v: "Partilha (cestas)", e: "🧺" }, { v: "Cuidado com os membros", e: "💛" }, { v: "Comunicação (vídeos e posts)", e: "🎬" }, { v: "Ainda não sei", e: "❔" }];
  var GRUPOS = [{ v: "Estudo da Palavra", e: "📖" }, { v: "Horta e despensa", e: "🌱" }, { v: "Cestas e partilha", e: "🧺" }, { v: "Visita e cuidado", e: "💛" }, { v: "Vídeo e comunicação", e: "🎬" }, { v: "Quero ajuda para escolher", e: "🧭" }];
  var SIM_ACEITE = "Li a declaração de fé e aceito os 6 compromissos";
  var ADULTO = "Tenho 18 anos ou mais";
  var DADOS = "Autorizo o uso dos meus dados só para contato da igreja";
  function lista(v) { return (v && v.length) ? v.join(", ") : "a definir"; }
  function ou(v) { return v ? v : "a definir"; }

  window.ASSISTENTE = {
    servico: "Cadastro de membro",
    rotulo: "Seja membro",
    pilula: "Cadastro de membro · gratuito",
    tituloPagina: "Seja membro | Igreja Eco",
    titulo: "Faça parte da igreja <em>desde o começo</em>",
    lead: "Ser membro é gratuito e a igreja não pede dízimo nem oferta. Leva poucos minutos: você diz onde mora, onde gostaria de servir e confirma a declaração de fé e os compromissos. Uma pessoa responde pelo WhatsApp em até 48 horas.",
    moldura: "celular",
    endpoint: "/api/membro",
    fichas: ["🪪 Carteirinha ao vivo", "Sem dízimo nem oferta"],
    finalDica: "Uma pessoa do acolhimento responde pelo WhatsApp, pelo nome, em até 48 horas.",
    finalNota: "Guardamos só o necessário para o contato da igreja, com a sua autorização. Ninguém é pressionado a dar, a entrar ou a ficar, e você pode sair quando quiser.",
    prazoRotulo: "Melhor horário para falarmos (opcional)",
    botaoEnviar: "Enviar meu cadastro",
    sucessoTitulo: function (r) { return "Cadastro nº " + r.numero + " recebido!"; },
    sucessoTexto: function () { return "Bem-vindo! Uma pessoa do acolhimento vai chamar você pelo WhatsApp. Se preferir adiantar, envie também esta mensagem no WhatsApp da igreja:"; },
    passos: [
      { titulo: "Conte um pouco sobre você", dica: "Só o necessário para o acolhimento chamar você.", obrigatorio: ["cidade"], campos: [
        { id: "cidade", tipo: "texto", rotulo: "Cidade e estado", placeholder: "Ex.: Franca, SP", max: 80 },
        { id: "conheceu", tipo: "select", rotulo: "Como conheceu a igreja?", opcoes: ["Canal no YouTube", "Instagram", "Facebook", "Telegram", "Indicação de alguém", "Pelo site", "Outro"] }] },
      { titulo: "Onde você gostaria de servir?", dica: "Marque quantos quiser. Você pode mudar depois, sem compromisso.", campos: [
        { id: "servir", tipo: "chips", opcoes: SERVIR }] },
      { titulo: "Quer entrar num grupo?", dica: "Os grupos têm de 3 a 12 pessoas, um responsável e uma tarefa. Eles serão abertos conforme chegarem os primeiros membros.", campos: [
        { id: "grupos", tipo: "chips", opcoes: GRUPOS }] },
      { titulo: "Declaração de fé", dica: "Cremos em um só Deus, Pai, Filho e Espírito Santo; que a Bíblia é a Palavra de Deus; em Jesus Cristo, verdadeiro Deus e verdadeiro homem, que morreu na cruz e ressuscitou; que o Espírito Santo habita, guia e fortalece os que creem; que a salvação é pela graça, por meio da fé, e não se compra com contribuição; que a igreja é a comunidade dos que seguem a Cristo; no batismo e na ceia; na volta de Cristo, sem marcar data (Mateus 24:36); no chamado de Jesus a deixar o que nos prende, repartir com os pobres e carregar a própria cruz, de forma voluntária; e em viver com amor, honestidade e respeito.", campos: [] },
      { titulo: "Compromissos do membro", dica: "1) Estudar a Palavra com regularidade. 2) Servir em um grupo, conforme o que puder. 3) Respeitar as pessoas e a ordem da igreja. 4) Cuidar da privacidade: não expor dados nem pedidos de oração de outras pessoas. 5) Partilhar voluntariamente, sem obrigação e sem pressão. 6) Respeitar a doutrina cristã evangélica, como está na declaração de fé.", obrigatorio: ["aceite", "idade", "dados"], campos: [
        { id: "aceite", tipo: "opcoes", semPadrao: true, rotulo: "Declaração e compromissos", opcoes: [{ v: SIM_ACEITE, e: "✅", t: "Li e aceito", s: "A declaração de fé e os 6 compromissos." }] },
        { id: "idade", tipo: "opcoes", semPadrao: true, rotulo: "Idade", opcoes: [
          { v: ADULTO, e: "🙋", t: "Tenho 18 anos ou mais", s: "Cadastro em meu próprio nome." },
          { v: "Sou responsável por um menor de 18 anos", e: "👨‍👩‍👧", t: "Sou responsável por um menor", s: "Menores participam só com autorização e acompanhamento." }] },
        { id: "dados", tipo: "opcoes", semPadrao: true, rotulo: "Seus dados", opcoes: [{ v: DADOS, e: "🔒", t: "Autorizo o uso dos meus dados", s: "Só para contato da igreja." }] }] }
    ],
    url: function () { return "igreja.eco.br/seja-membro"; },
    previa: function (e, esc) {
      var chips = function (arr) { return (arr && arr.length ? arr : ["a definir"]).map(function (x) { return '<span style="display:inline-block;background:rgba(255,255,255,.18);border-radius:99px;padding:3px 9px;font-size:11px;margin:2px">' + esc(x) + "</span>"; }).join(""); };
      return '<div style="padding:18px 14px;font-family:system-ui,sans-serif;color:#fff;min-height:100%;background:linear-gradient(160deg,#13307a,#2f6fe0)">' +
        '<div style="font-size:11px;letter-spacing:.8px;opacity:.85;text-transform:uppercase">Igreja Evangelho dos Pobres dos Alimentos Sagrados</div>' +
        '<div style="margin-top:14px;font-size:22px;font-weight:800">🪪 Membro</div>' +
        '<div style="margin-top:12px;font-size:12px;opacity:.9">Cidade</div><div style="font-weight:700">' + esc(e.cidade || "sua cidade") + "</div>" +
        '<div style="margin-top:12px;font-size:12px;opacity:.9">Quero servir em</div><div>' + chips(e.servir) + "</div>" +
        '<div style="margin-top:12px;font-size:12px;opacity:.9">Grupo de interesse</div><div>' + chips(e.grupos) + "</div>" +
        (e.aceite ? '<div style="margin-top:16px;background:#25d366;color:#06361b;border-radius:10px;padding:8px 10px;font-size:12px;font-weight:700">✓ Declaração e compromissos aceitos</div>' : "") +
        '<div style="margin-top:14px;font-size:11px;opacity:.8">Gratuito. Sem dízimo nem oferta.</div></div>';
    },
    resumo: [["Cidade", function (e) { return e.cidade; }], ["Como conheceu", function (e) { return e.conheceu; }], ["Quer servir em", function (e) { return e.servir; }], ["Grupos", function (e) { return e.grupos; }], ["Compromissos", function (e) { return e.aceite ? "Aceitos" : ""; }]],
    descricao: function (e) { return "Cidade: " + ou(e.cidade) + " | Servir: " + lista(e.servir) + " | Grupos: " + lista(e.grupos); },
    dados: function (e, base) {
      return { nome: base.nome, whatsapp: base.whatsapp, horario: base.prazo, obs: base.obs, site: base.site, cidade: e.cidade, conheceu: e.conheceu,
        servir: e.servir, grupos: e.grupos, aceite: e.aceite === SIM_ACEITE, maior_18: e.idade === ADULTO, responsavel_menor: e.idade !== ADULTO && !!e.idade, dados_autorizados: e.dados === DADOS };
    },
    mensagem: function (e, d) {
      return "Olá! Fiz o cadastro de membro no site da Igreja Eco.\n\nNome: " + d.nome + "\nWhatsApp: " + d.whatsapp + "\nCidade: " + ou(e.cidade) +
        "\nQuero servir em: " + lista(e.servir) + "\nGrupos: " + lista(e.grupos) + (d.prazo ? "\nMelhor horário: " + d.prazo : "") + (d.obs ? "\nObservação: " + d.obs : "");
    }
  };
})();
