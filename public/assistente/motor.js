/* Motor dos assistentes do Ateliê: lê um arquivo de configuração (window.ASSISTENTE) e monta
   a página em passos, com prévia ao vivo, resumo, envio para /api/atelie e mensagem do WhatsApp.
   Para criar um assistente novo: copie um arquivo de configuração (loja.js ou site.js), troque os
   passos e a prévia, e crie uma página com <div id="app"> + motor.js + a configuração. */
(function () {
  var C = window.ASSISTENTE;
  if (!C) return;
  var WHATS = C.whats || "5516991543663";
  var app = document.getElementById("app");

  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  function $(id) { return document.getElementById(id); }

  /* ---------- montagem da página ---------- */
  var total = C.passos.length + 1;

  function htmlCampo(c) {
    var h = "";
    if (c.tipo === "opcoes") {
      h += '<div class="niveis">' + c.opcoes.map(function (o, i) {
        return '<label class="opcao"><input type="radio" name="' + c.id + '" value="' + esc(o.v) + '"' + ((c.padrao ? c.padrao === o.v : i === 0) ? " checked" : "") + '><span class="caixa"><strong>' + (o.e ? o.e + " " : "") + esc(o.t || o.v) + "</strong>" + (o.s ? "<small>" + esc(o.s) + "</small>" : "") + "</span></label>";
      }).join("") + "</div>";
    } else if (c.tipo === "chips") {
      h += '<div class="chips">' + c.opcoes.map(function (o) {
        return '<label class="opcao"><input type="checkbox" name="' + c.id + '" value="' + esc(o.v) + '"><span class="caixa">' + (o.e ? o.e + " " : "") + esc(o.v) + "</span></label>";
      }).join("") + "</div>";
    } else if (c.tipo === "texto") {
      h += '<label class="campo">' + esc(c.rotulo) + '<input type="text" id="f_' + c.id + '" maxlength="' + (c.max || 60) + '" placeholder="' + esc(c.placeholder || "") + '" autocomplete="off"></label>';
    } else if (c.tipo === "select") {
      h += '<label class="campo">' + esc(c.rotulo) + '<select id="f_' + c.id + '">' + c.opcoes.map(function (o) { return "<option>" + esc(o) + "</option>"; }).join("") + "</select></label>";
    } else if (c.tipo === "cores") {
      h += '<p class="subtitulo" id="rot_' + c.id + '">' + esc(c.rotulo) + '</p><fieldset class="cores" aria-labelledby="rot_' + c.id + '">' + c.opcoes.map(function (o, i) {
        return '<label class="opcao"><input type="radio" name="' + c.id + '" value="' + esc(o.v) + '" data-a="' + o.a + '" data-b="' + o.b + '"' + (i === 0 ? " checked" : "") + ' aria-label="' + esc(o.v) + '"><span class="caixa" style="background:linear-gradient(135deg,' + o.a + "," + o.b + ')"></span></label>';
      }).join("") + "</fieldset>";
    }
    return h;
  }

  var passosHtml = C.passos.map(function (p, i) {
    var corpo = p.campos.map(function (c) {
      var tem = c.tipo === "opcoes" || c.tipo === "chips";
      return tem && c.rotulo ? '<p class="subtitulo">' + esc(c.rotulo) + "</p>" + htmlCampo(c) : htmlCampo(c);
    }).join("");
    return '<section class="passo' + (i === 0 ? " ativo" : "") + '" data-passo="' + (i + 1) + '"><h2>' + esc(p.titulo) + '</h2><p class="dica">' + esc(p.dica || "") + "</p>" + corpo + "</section>";
  }).join("");

  var barrasHtml = ""; for (var b = 0; b < total; b++) barrasHtml += "<span></span>";

  var moldura;
  if (C.moldura === "navegador") {
    moldura = '<div class="janela" aria-hidden="true"><div class="jtopo"><i></i><i></i><i></i><b id="pvUrl">seusite.com.br</b></div><div id="pvConteudo"></div></div>';
  } else {
    moldura = '<div class="celular" aria-hidden="true"><div class="tela" id="pvConteudo"></div></div>';
  }

  app.innerHTML =
    '<div class="fundo"><i class="bolha b1"></i><i class="bolha b2"></i><i class="bolha b3"></i>' +
    '<div class="topo"><a href="/">👟 Igreja Eco</a><a class="voltar" href="/assistentes">← Todos os assistentes</a></div>' +
    '<main class="dentro"><div>' +
    '<span class="pilula"><i></i>' + esc(C.pilula) + "</span>" +
    "<h1>" + C.titulo + "</h1>" +
    '<p class="lead">' + esc(C.lead) + "</p>" +
    '<form class="cartao" id="assistente" novalidate>' +
    '<div class="progresso" id="progresso" aria-hidden="true">' + barrasHtml + "</div>" +
    '<p class="passo-info" id="passoInfo" aria-live="polite">Passo 1 de ' + total + "</p>" +
    passosHtml +
    '<section class="passo" data-passo="' + total + '"><h2>Quase lá! Seus dados</h2><p class="dica">Respondemos pelo WhatsApp com a indicação e o orçamento.</p>' +
    '<dl class="resumo" id="resumo"></dl>' +
    '<label class="campo">Seu nome<input type="text" id="nome" maxlength="120" autocomplete="name" required></label>' +
    '<label class="campo">WhatsApp com DDD<input type="tel" id="whatsapp" maxlength="30" autocomplete="tel" inputmode="tel" placeholder="(16) 99999-9999" required></label>' +
    '<label class="campo">Prazo desejado (opcional)<input type="text" id="prazo" maxlength="80" placeholder="Ex.: o mais rápido possível"></label>' +
    '<label class="campo">Quer contar mais alguma coisa? (opcional)<textarea id="obs" maxlength="500"></textarea></label>' +
    '<div class="hp" aria-hidden="true"><label>Não preencha <input type="text" id="site" tabindex="-1" autocomplete="off"></label></div>' +
    '<p class="nota">Guardamos só os dados necessários para responder o seu pedido, e apenas para isso. Não prometemos vendas nem lucro: entregamos o que foi combinado.</p></section>' +
    '<p class="erro" id="erro" role="alert"></p>' +
    '<div class="acoes" id="botoes"><button type="button" class="btn contorno" id="voltar" hidden>Voltar</button><button type="button" class="btn principal" id="avancar">Continuar</button></div>' +
    '<section class="sucesso" id="sucesso" hidden><div class="selo" aria-hidden="true">✓</div><h2 id="sucessoTitulo"></h2><p id="sucessoTexto" style="color:var(--cinza);margin-top:6px"></p><pre id="msg"></pre>' +
    '<div class="acoes" style="justify-content:center"><button type="button" class="btn contorno" id="copiar">Copiar mensagem</button><a class="btn principal" id="zap" target="_blank" rel="noopener">Abrir WhatsApp</a></div>' +
    '<p class="nota" id="copiado" aria-live="polite">WhatsApp da agência: (16) 99154-3663</p></section>' +
    "</form></div>" +
    '<aside class="palco" aria-label="Prévia ao vivo"><div class="palco-in">' + moldura +
    (C.fichas || []).map(function (f, i) { return '<span class="chip c' + (i + 1) + '">' + esc(f) + "</span>"; }).join("") +
    "</div></aside></main></div>";

  document.title = C.tituloPagina || document.title;

  /* ---------- estado e prévia ---------- */
  var form = $("assistente");
  var campos = [];
  C.passos.forEach(function (p) { p.campos.forEach(function (c) { campos.push(c); }); });

  function estado() {
    var e = {};
    campos.forEach(function (c) {
      if (c.tipo === "opcoes" || c.tipo === "cores") {
        var r = form.querySelector('input[name="' + c.id + '"]:checked');
        e[c.id] = r ? r.value : "";
        if (c.tipo === "cores" && r) { e[c.id + "_a"] = r.getAttribute("data-a"); e[c.id + "_b"] = r.getAttribute("data-b"); }
      } else if (c.tipo === "chips") {
        e[c.id] = [].slice.call(form.querySelectorAll('input[name="' + c.id + '"]:checked')).map(function (x) { return x.value; });
      } else {
        e[c.id] = ($("f_" + c.id).value || "").trim();
      }
    });
    return e;
  }
  function previa() {
    var e = estado(), r = document.documentElement.style;
    campos.forEach(function (c) {
      if (c.tipo === "cores" && e[c.id + "_a"]) { r.setProperty("--cor", e[c.id + "_a"]); r.setProperty("--cor2", e[c.id + "_b"]); }
    });
    $("pvConteudo").innerHTML = C.previa(e, esc);
    if ($("pvUrl") && C.url) $("pvUrl").textContent = C.url(e);
  }
  form.addEventListener("input", previa);
  form.addEventListener("change", previa);
  previa();

  /* ---------- navegação ---------- */
  var passos = [].slice.call(form.querySelectorAll(".passo"));
  var barras = [].slice.call(document.querySelectorAll("#progresso span"));
  var info = $("passoInfo"), erro = $("erro"), btnV = $("voltar"), btnA = $("avancar");
  var atual = 0, enviando = false;

  function resumo() {
    var e = estado();
    $("resumo").innerHTML = C.resumo.map(function (l) {
      var v = l[1](e); if (Array.isArray(v)) v = v.join(", ");
      return "<div><dt>" + esc(l[0]) + "</dt><dd>" + esc(v || "A definir") + "</dd></div>";
    }).join("");
  }
  function mostrar(i) {
    atual = i;
    passos.forEach(function (p, k) { p.classList.toggle("ativo", k === i); });
    barras.forEach(function (x, k) { x.classList.toggle("feito", k <= i); });
    info.textContent = "Passo " + (i + 1) + " de " + total;
    btnV.hidden = i === 0;
    btnA.textContent = i === total - 1 ? "Enviar meu pedido" : "Continuar";
    erro.textContent = "";
    if (i === total - 1) resumo();
    var h = passos[i].querySelector("h2"); if (h) { h.setAttribute("tabindex", "-1"); h.focus({ preventScroll: true }); }
    form.scrollIntoView({ behavior: "smooth", block: "start" });
  }
  function validar() {
    if (atual === total - 1) {
      if ($("nome").value.trim().length < 2) { erro.textContent = "Informe o seu nome."; $("nome").focus(); return false; }
      if ($("whatsapp").value.replace(/\D/g, "").length < 10) { erro.textContent = "Informe o WhatsApp com DDD."; $("whatsapp").focus(); return false; }
    }
    return true;
  }
  function fim(res, msg) {
    [].slice.call(form.querySelectorAll(".passo,.progresso,.passo-info,#botoes,#erro")).forEach(function (n) { n.hidden = true; n.style.display = "none"; });
    var s = $("sucesso"); s.hidden = false;
    $("sucessoTitulo").textContent = res.ok ? "Pedido nº " + res.numero + " registrado!" : "Quase pronto!";
    $("sucessoTexto").textContent = res.ok
      ? "Recebemos o seu pedido. Para agilizar, envie também esta mensagem no WhatsApp da agência:"
      : (res.erro || "Não conseguimos registrar agora.") + " Envie esta mensagem pelo WhatsApp da agência e cuidamos do resto:";
    $("msg").textContent = msg;
    $("zap").href = "https://wa.me/" + WHATS + "?text=" + encodeURIComponent(msg);
    s.scrollIntoView({ behavior: "smooth", block: "start" });
    var t = s.querySelector("h2"); t.setAttribute("tabindex", "-1"); t.focus({ preventScroll: true });
  }
  function enviar() {
    if (enviando) return;
    enviando = true; btnA.disabled = true; btnA.textContent = "Enviando...";
    var e = estado();
    var dados = {
      tipo: "pedido",
      nome: $("nome").value.trim(),
      whatsapp: $("whatsapp").value.trim(),
      servico: C.servico,
      descricao: ("[" + C.rotulo + "] " + C.descricao(e) + ($("obs").value.trim() ? " | Obs: " + $("obs").value.trim() : "")),
      prazo: $("prazo").value.trim(),
      site: $("site").value
    };
    var msg = C.mensagem(e, { nome: dados.nome, whatsapp: dados.whatsapp, prazo: dados.prazo, obs: $("obs").value.trim() });
    fetch("/api/atelie", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(dados) })
      .then(function (r) { return r.json().then(function (j) { return { ok: r.ok && j.ok === true, numero: j.numero, erro: j.erro }; }); })
      .catch(function () { return { ok: false }; })
      .then(function (res) { fim(res, msg); });
  }
  btnA.addEventListener("click", function () {
    if (!validar()) return;
    if (atual < total - 1) mostrar(atual + 1); else enviar();
  });
  btnV.addEventListener("click", function () { if (atual > 0) mostrar(atual - 1); });
  form.addEventListener("submit", function (e) { e.preventDefault(); btnA.click(); });
  $("copiar").addEventListener("click", function () {
    var m = $("copiado"), t = $("msg").textContent;
    function sel() { var r = document.createRange(); r.selectNodeContents($("msg")); var s = getSelection(); s.removeAllRanges(); s.addRange(r); m.textContent = "Texto selecionado. Copie com Ctrl+C."; }
    try { navigator.clipboard.writeText(t).then(function () { m.textContent = "Mensagem copiada."; }, sel); } catch (x) { sel(); }
  });
  barras[0].classList.add("feito");
})();
