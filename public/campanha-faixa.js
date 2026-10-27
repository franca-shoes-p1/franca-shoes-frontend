/* Faixa da Campanha de Inauguração para as páginas estáticas (public/). As páginas do Next usam lib/CampanhaFaixa.jsx. */
(function () {
  try {
    if (document.getElementById('faixa-campanha')) return;
    var d = document.createElement('div');
    d.id = 'faixa-campanha';
    d.setAttribute('role', 'note');
    d.style.cssText = 'background:linear-gradient(90deg,#064a24,#0a6a35);color:#fff;font:14px/1.4 Segoe UI,system-ui,Arial,sans-serif;padding:8px 20px;text-align:center;position:relative;z-index:9999';
    d.innerHTML = '🎁 <b>Campanha de Inauguração:</b> ganhe um calçado ou acessório juntando Pontos ou Créditos. <a href="/campanha" style="background:#ffd400;color:#064a24;font-weight:800;border-radius:999px;padding:3px 12px;text-decoration:none;white-space:nowrap;margin-left:6px">Ver as regras</a>';
    document.body.insertBefore(d, document.body.firstChild);
  } catch (e) {}
})();
