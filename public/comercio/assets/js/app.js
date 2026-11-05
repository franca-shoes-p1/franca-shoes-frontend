/* Loja Igreja Eco — vitrine de afiliados do Mercado Livre
   Lê os produtos de products.json (caminho relativo, funciona em subpasta). */
(function () {
  'use strict';

  var ARQUIVO = '/comercio/products.json';
  var CHAVE_FAV = 'lojaIgrejaEco:favoritos';
  var REL = 'sponsored nofollow noopener';

  // Ícones das categorias (traço simples, sem biblioteca)
  var ICONES = {
    todas: '<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>',
    games: '<path d="M6 9h12a4 4 0 0 1 3.9 4.9l-.6 2.6a2.5 2.5 0 0 1-4.3 1.1L15 15.5H9l-2 2.1a2.5 2.5 0 0 1-4.3-1.1l-.6-2.6A4 4 0 0 1 6 9z"/><path d="M7.5 11.5v3M6 13h3"/><circle cx="16" cy="12.2" r=".6"/><circle cx="17.8" cy="14" r=".6"/>',
    eletrodomesticos: '<path d="M6 7h12l-1 13H7z"/><path d="M4 7h16M9 4h6v3"/><path d="M10 11v5M14 11v5"/>',
    ferramentas: '<path d="M14.7 6.3a4 4 0 0 0-5.4 5.4L3 18l3 3 6.3-6.3a4 4 0 0 0 5.4-5.4l-2.5 2.5-2.4-.6-.6-2.4z"/>',
    beleza: '<path d="M9 3h6v4H9z"/><path d="M8 7h8l1 4v9a1 1 0 0 1-1 1H8a1 1 0 0 1-1-1v-9z"/><path d="M7 13h10"/>',
    celulares: '<rect x="6" y="2.5" width="12" height="19" rx="2.5"/><path d="M10.5 18.5h3"/>',
    informatica: '<rect x="4" y="4" width="16" height="11" rx="1.5"/><path d="M2 19h20l-2-4H4z"/>',
    eletronicos: '<path d="M4 14v-2a8 8 0 0 1 16 0v2"/><rect x="2.5" y="14" width="4.5" height="7" rx="1.5"/><rect x="17" y="14" width="4.5" height="7" rx="1.5"/>',
    esportes: '<path d="M6.5 6.5v11M17.5 6.5v11M3.5 9v6M20.5 9v6M6.5 12h11"/>',
    moda: '<path d="M8 3 3 6l2 4 2-1v12h10V9l2 1 2-4-5-3a4 4 0 0 1-8 0z"/>',
    veiculos: '<path d="M5 16V11l2-5h10l2 5v5"/><path d="M3 16h18v3H3z"/><circle cx="7.5" cy="13.5" r="1"/><circle cx="16.5" cy="13.5" r="1"/>'
  };

  var dados = { produtos: [], categorias: [] };
  var mapaCat = {};
  var favoritos = carregarFavoritos();
  var estado = { busca: '', categoria: '', faixas: [], soFav: false };

  var $ = function (s, el) { return (el || document).querySelector(s); };
  var $$ = function (s, el) { return Array.prototype.slice.call((el || document).querySelectorAll(s)); };

  // ---------- utilidades ----------
  function esc(t) {
    return String(t == null ? '' : t).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function linkSeguro(url) {
    // Aceita só endereços https (links de afiliado meli.la / mercadolivre)
    return /^https:\/\//i.test(url || '') ? url : '#';
  }
  function icone(nome, classe) {
    return '<svg class="' + (classe || 'ic') + '" viewBox="0 0 24 24" aria-hidden="true">' + (ICONES[nome] || ICONES.todas) + '</svg>';
  }
  function dataCurta(iso) {
    var p = String(iso || '').split('-');
    return p.length === 3 ? p[2] + '/' + p[1] : '';
  }
  function dataLonga(iso) {
    var p = String(iso || '').split('-');
    return p.length === 3 ? p[2] + '/' + p[1] + '/' + p[0] : '';
  }
  function moeda(v) {
    return Number(v).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }
  function normalizar(t) {
    return String(t || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
  }
  function carregarFavoritos() {
    try { return JSON.parse(localStorage.getItem(CHAVE_FAV)) || []; } catch (e) { return []; }
  }
  function salvarFavoritos() {
    try { localStorage.setItem(CHAVE_FAV, JSON.stringify(favoritos)); } catch (e) { /* navegador sem armazenamento */ }
    var c = $('#contadorFav');
    c.textContent = favoritos.length;
    c.hidden = favoritos.length === 0;
  }

  // ---------- card ----------
  function card(p) {
    var cat = mapaCat[p.categoria] || { nome: p.categoria };
    var link = esc(linkSeguro(p.link));
    var fav = favoritos.indexOf(p.id) > -1;
    var whats = 'https://wa.me/?text=' + encodeURIComponent('Olha esse produto no Mercado Livre: ' + p.nome + ' ' + p.link);
    var obs = p.precoObs ? ' <small>' + esc(p.precoObs) + '</small>' : '';
    return '' +
      '<article class="card">' +
        (p.posicao ? '<span class="card__selo"><b>' + esc(p.posicao) + 'º</b> em ' + esc(cat.nome) + '</span>' : '') +
        '<button type="button" class="card__fav" data-fav="' + esc(p.id) + '" aria-pressed="' + fav + '" aria-label="' + (fav ? 'Remover dos favoritos' : 'Salvar nos favoritos') + ': ' + esc(p.nome) + '">' +
          '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 21s-7-4.5-9.5-9A5.5 5.5 0 0 1 12 6a5.5 5.5 0 0 1 9.5 6c-2.5 4.5-9.5 9-9.5 9z"/></svg>' +
        '</button>' +
        '<a class="card__img" href="' + link + '" target="_blank" rel="' + REL + '" tabindex="-1" aria-hidden="true">' +
          '<img src="' + esc(p.imagem) + '" alt="' + esc(p.nome) + '" loading="lazy" decoding="async" width="300" height="300" referrerpolicy="no-referrer">' +
        '</a>' +
        '<h3 class="card__nome"><a href="' + link + '" target="_blank" rel="' + REL + '">' + esc(p.nome) + '</a></h3>' +
        '<p class="card__preco">' + moeda(p.preco) + obs + '</p>' +
        '<p class="card__data">Preço consultado em ' + esc(dataCurta(p.consultadoEm)) + '</p>' +
        '<a class="card__btn" href="' + link + '" target="_blank" rel="' + REL + '">Ver no Mercado Livre</a>' +
        '<div class="card__acoes">' +
          '<a class="card__atual" href="' + link + '" target="_blank" rel="' + REL + '">Ver preço atual no Mercado Livre</a>' +
          '<a class="card__whats" href="' + esc(whats) + '" target="_blank" rel="noopener" aria-label="Compartilhar ' + esc(p.nome) + ' no WhatsApp">' +
            '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 12a8 8 0 0 1-11.8 7L4 20l1.1-4A8 8 0 1 1 20 12z"/></svg>WhatsApp' +
          '</a>' +
        '</div>' +
      '</article>';
  }

  function porPosicao(a, b) { return (a.posicao || 999) - (b.posicao || 999); }

  // ---------- montagem inicial ----------
  function montarCategorias() {
    var botoes = '<li><button type="button" data-cat="" aria-pressed="true">' + icone('todas') + 'Todas</button></li>';
    var gaveta = '';
    var rodape = '';
    var opcoes = '';
    dados.categorias.forEach(function (c) {
      botoes += '<li><button type="button" data-cat="' + esc(c.id) + '" aria-pressed="false">' + icone(c.icone) + esc(c.nome) + '</button></li>';
      gaveta += '<li><button type="button" data-cat="' + esc(c.id) + '" data-fecha>' + icone(c.icone) + esc(c.nome) + '</button></li>';
      rodape += '<li><button type="button" data-cat="' + esc(c.id) + '">' + esc(c.nome) + '</button></li>';
      opcoes += '<option value="' + esc(c.id) + '">' + esc(c.nome) + '</option>';
    });
    $('#categorias').innerHTML = botoes;
    $('#gavetaCategorias').innerHTML = gaveta;
    $('#rodapeCategorias').innerHTML = rodape;
    $('#filtroCategoria').insertAdjacentHTML('beforeend', opcoes);
  }

  function montarVitrine() {
    // Destaque: o mais bem colocado de cada categoria
    var destaque = dados.categorias.map(function (c) {
      return dados.produtos.filter(function (p) { return p.categoria === c.id; }).sort(porPosicao)[0];
    }).filter(Boolean);
    $('#gradeDestaque').innerHTML = destaque.map(card).join('');

    // Uma seção por categoria, na ordem do Mercado Livre
    var html = '';
    dados.categorias.forEach(function (c) {
      var lista = dados.produtos.filter(function (p) { return p.categoria === c.id; }).sort(porPosicao);
      if (!lista.length) return;
      html += '<section class="secao" id="cat-' + esc(c.id) + '">' +
        '<div class="secao__cabeca"><h2>' + icone(c.icone, '') + 'Mais vendidos em ' + esc(c.nome) + '</h2>' +
        (c.fonteRanking ? '<a class="secao__fonte" href="' + esc(linkSeguro(c.fonteRanking)) + '" target="_blank" rel="noopener">Ver ranking completo</a>' : '') +
        '</div><div class="grade">' + lista.map(card).join('') + '</div></section>';
    });
    $('#secoesCategorias').innerHTML = html;
  }

  // ---------- filtros ----------
  function filtrosAtivos() {
    return !!(estado.busca || estado.categoria || estado.faixas.length || estado.soFav);
  }

  function noIntervalo(preco, faixa) {
    var p = faixa.split('-');
    var min = parseFloat(p[0]) || 0;
    var max = p[1] === '' ? Infinity : parseFloat(p[1]);
    return preco >= min && preco <= max;
  }

  function aplicar() {
    var termos = normalizar(estado.busca).split(/\s+/).filter(Boolean);
    var ativos = filtrosAtivos();

    // Sincroniza botões e campos
    $$('[data-cat]').forEach(function (b) {
      if (b.hasAttribute('aria-pressed')) b.setAttribute('aria-pressed', String(b.getAttribute('data-cat') === estado.categoria));
    });
    $('#filtroCategoria').value = estado.categoria;
    $$('input[name="faixa"]').forEach(function (i) { i.checked = estado.faixas.indexOf(i.value) > -1; });
    $('#soFavoritos').checked = estado.soFav;

    var n = (estado.categoria ? 1 : 0) + estado.faixas.length + (estado.soFav ? 1 : 0);
    var cf = $('#contadorFiltros');
    cf.textContent = n; cf.hidden = n === 0;

    $('#vitrine').hidden = ativos;
    $('#resultados').hidden = !ativos;

    if (!ativos) {
      $('#resultado').textContent = dados.produtos.length + ' produtos em ' + dados.categorias.length + ' categorias';
      return;
    }

    var lista = dados.produtos.filter(function (p) {
      if (estado.categoria && p.categoria !== estado.categoria) return false;
      if (estado.soFav && favoritos.indexOf(p.id) === -1) return false;
      if (estado.faixas.length && !estado.faixas.some(function (f) { return noIntervalo(p.preco, f); })) return false;
      if (termos.length) {
        var alvo = normalizar(p.nome + ' ' + ((mapaCat[p.categoria] || {}).nome || ''));
        return termos.every(function (t) { return alvo.indexOf(t) > -1; });
      }
      return true;
    });

    // Mantém a ordem das categorias do Mercado Livre e a posição no ranking
    var ordem = {};
    dados.categorias.forEach(function (c, i) { ordem[c.id] = i; });
    lista.sort(function (a, b) { return (ordem[a.categoria] - ordem[b.categoria]) || porPosicao(a, b); });

    var titulo = estado.soFav ? 'Meus favoritos' :
      estado.categoria ? 'Mais vendidos em ' + mapaCat[estado.categoria].nome : 'Resultados';
    if (estado.busca) titulo += ' para "' + estado.busca + '"';
    $('#tituloResultados').textContent = titulo;
    $('#gradeResultados').innerHTML = lista.map(card).join('');
    $('#gradeResultados').hidden = !lista.length;
    $('#vazio').hidden = !!lista.length;
    $('#resultado').textContent = lista.length + (lista.length === 1 ? ' produto encontrado' : ' produtos encontrados');
  }

  function limpar() {
    estado = { busca: '', categoria: '', faixas: [], soFav: false };
    $('#busca').value = '';
    aplicar();
  }

  function irParaProdutos() {
    var alvo = $('#produtos');
    var y = alvo.getBoundingClientRect().top + window.pageYOffset - ($('.topo').offsetHeight + 10);
    window.scrollTo({ top: Math.max(0, y), behavior: 'smooth' });
  }

  // ---------- gaveta e painel de filtros ----------
  var abertos = [];
  function abrir(el, gatilho) {
    el.classList.add('aberta');
    el.setAttribute('aria-hidden', 'false');
    $('#veu').hidden = false;
    document.body.style.overflow = 'hidden';
    if (gatilho) gatilho.setAttribute('aria-expanded', 'true');
    abertos.push({ el: el, gatilho: gatilho });
    var foco = el.querySelector('button, a, select, input');
    if (foco) foco.focus();
  }
  function fecharTudo() {
    abertos.forEach(function (a) {
      a.el.classList.remove('aberta');
      if (a.el.id === 'gaveta') a.el.setAttribute('aria-hidden', 'true');
      if (a.gatilho) { a.gatilho.setAttribute('aria-expanded', 'false'); }
    });
    var ultimo = abertos[abertos.length - 1];
    abertos = [];
    $('#veu').hidden = true;
    document.body.style.overflow = '';
    if (ultimo && ultimo.gatilho) ultimo.gatilho.focus();
  }

  // ---------- eventos ----------
  function ligarEventos() {
    var timer;
    $('#busca').addEventListener('input', function (e) {
      clearTimeout(timer);
      timer = setTimeout(function () { estado.busca = e.target.value.trim(); aplicar(); }, 120);
    });
    $('#busca').addEventListener('keydown', function (e) {
      if (e.key === 'Enter') { e.preventDefault(); irParaProdutos(); }
    });

    document.addEventListener('click', function (e) {
      var fav = e.target.closest('[data-fav]');
      if (fav) {
        var id = fav.getAttribute('data-fav');
        var i = favoritos.indexOf(id);
        if (i > -1) favoritos.splice(i, 1); else favoritos.push(id);
        salvarFavoritos();
        var marcado = i === -1;
        $$('[data-fav="' + id.replace(/"/g, '') + '"]').forEach(function (b) {
          b.setAttribute('aria-pressed', String(marcado));
          b.setAttribute('aria-label', (marcado ? 'Remover dos favoritos' : 'Salvar nos favoritos') + b.getAttribute('aria-label').replace(/^[^:]*/, ''));
        });
        if (estado.soFav) aplicar();
        return;
      }

      var cat = e.target.closest('[data-cat]');
      if (cat) {
        var id2 = cat.getAttribute('data-cat');
        estado.categoria = (id2 && estado.categoria === id2 && cat.closest('#categorias')) ? '' : id2;
        estado.soFav = false;
        if (cat.hasAttribute('data-fecha')) fecharTudo();
        aplicar();
        if (!cat.closest('#categorias')) irParaProdutos();
        return;
      }

      if (e.target.closest('[data-favoritos]') || e.target.closest('#verFavoritos')) {
        fecharTudo();
        estado.soFav = true; estado.categoria = ''; estado.busca = ''; estado.faixas = [];
        $('#busca').value = '';
        aplicar(); irParaProdutos();
        return;
      }

      if (e.target.closest('[data-limpar]')) { limpar(); return; }
      if (e.target.closest('[data-fecha]')) { fecharTudo(); }
    });

    $('#filtroCategoria').addEventListener('change', function (e) { estado.categoria = e.target.value; aplicar(); });
    $$('input[name="faixa"]').forEach(function (i) {
      i.addEventListener('change', function () {
        estado.faixas = $$('input[name="faixa"]:checked').map(function (x) { return x.value; });
        aplicar();
      });
    });
    $('#soFavoritos').addEventListener('change', function (e) { estado.soFav = e.target.checked; aplicar(); });
    $('#limparFiltros').addEventListener('click', limpar);

    $('#abrirMenu').addEventListener('click', function () { abrir($('#gaveta'), this); });
    $('#abrirCategorias').addEventListener('click', function () { abrir($('#gaveta'), this); });
    $('#fecharMenu').addEventListener('click', fecharTudo);
    $('#abrirFiltros').addEventListener('click', function () { abrir($('#filtros'), this); });
    $('#fecharFiltros').addEventListener('click', fecharTudo);
    $('#aplicarFiltros').addEventListener('click', function () { fecharTudo(); irParaProdutos(); });
    $('#veu').addEventListener('click', fecharTudo);
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && abertos.length) fecharTudo(); });

    var btnTopo = $('#voltarTopo');
    window.addEventListener('scroll', function () { btnTopo.hidden = window.pageYOffset < 600; }, { passive: true });
    btnTopo.addEventListener('click', function () { window.scrollTo({ top: 0, behavior: 'smooth' }); });

    var site = location.href.split('#')[0];
    $('#compartilharSite').href = 'https://wa.me/?text=' + encodeURIComponent('Veja os mais vendidos do Mercado Livre na Loja Igreja Eco: ' + site);
  }

  // ---------- início ----------
  function iniciar(json) {
    dados.categorias = json.categorias || [];
    dados.produtos = (json.produtos || []).filter(function (p) { return p && p.id && p.nome && p.link; });
    dados.categorias.forEach(function (c) { mapaCat[c.id] = c; });

    var data = json.atualizadoEm || '';
    $$('.js-data-atualizacao').forEach(function (el) { el.textContent = dataCurta(data); });
    $('#ano').textContent = (data.split('-')[0]) || new Date().getFullYear();

    montarCategorias();
    montarVitrine();
    salvarFavoritos();
    $('#carregando').hidden = true;
    aplicar();
  }

  ligarEventos();
  fetch(ARQUIVO, { cache: 'no-cache' })
    .then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); })
    .then(iniciar)
    .catch(function () {
      $('#carregando').textContent = 'Não foi possível carregar os produtos. Se você abriu o arquivo direto do computador, use um servidor (veja o README).';
    });
})();
