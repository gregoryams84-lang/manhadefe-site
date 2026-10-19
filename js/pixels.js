// Pixel do TikTok, carregado SÓ depois do "Aceitar" (consentimento.js) e só
// com ID em pixels-config.js. O que ele recebe daqui:
//   - a página aberta (ttq.page), em todas as páginas que têm o aviso;
//   - ClickButton quando a pessoa toca no selo do Google Play;
//   - SubmitForm quando alguém entra na fila de espera do iPhone.
// Nunca sai daqui e-mail, nome ou qualquer coisa digitada: o e-mail da fila vai
// só para o Formulário Google (site.js). Nada de identify.
(function () {
  var cfg = window.MDF_PIXELS || {};
  var carregado = false;

  function carregarTikTok(id) {
    if (window.ttq && window.ttq.load) return;
    var w = window, t = 'ttq';
    // Sem isto o events.js não acha a fila e nenhum evento sai (visto no site
    // do Toca o Negócio em 2026-09-12).
    w.TiktokAnalyticsObject = t;
    var ttq = w[t] = w[t] || [];
    ttq.methods = ['page', 'track', 'identify', 'instances', 'debug', 'on', 'off', 'once', 'ready', 'alias', 'group', 'enableCookie', 'disableCookie', 'holdConsent', 'revokeConsent', 'grantConsent'];
    ttq.setAndDefer = function (obj, m) { obj[m] = function () { obj.push([m].concat(Array.prototype.slice.call(arguments, 0))); }; };
    for (var i = 0; i < ttq.methods.length; i++) ttq.setAndDefer(ttq, ttq.methods[i]);
    ttq.instance = function (e) { var inst = ttq._i[e] || []; for (var j = 0; j < ttq.methods.length; j++) ttq.setAndDefer(inst, ttq.methods[j]); return inst; };
    ttq.load = function (e, n) {
      var u = 'https://analytics.tiktok.com/i18n/pixel/events.js';
      ttq._i = ttq._i || {}; ttq._i[e] = []; ttq._i[e]._u = u; ttq._t = ttq._t || {}; ttq._t[e] = +new Date(); ttq._o = ttq._o || {}; ttq._o[e] = n || {};
      var s = document.createElement('script'); s.type = 'text/javascript'; s.async = true; s.src = u + '?sdkid=' + e + '&lib=' + t;
      var f = document.getElementsByTagName('script')[0]; f.parentNode.insertBefore(s, f);
    };
    ttq.load(id);
    ttq.page();
  }

  function tiktok(fn) {
    if (!carregado || !window.ttq) return;
    try { fn(); } catch (e) { /* medição nunca quebra a página */ }
  }

  window.carregarPixels = function () {
    if (carregado) return;
    if (!cfg.tiktokPixelId) return;
    carregado = true;
    try { carregarTikTok(cfg.tiktokPixelId); } catch (e) { carregado = false; }
  };

  // Toque no selo do Google Play: a "conversão" que o site consegue medir.
  document.addEventListener('click', function (ev) {
    var a = ev.target && ev.target.closest ? ev.target.closest('a.selo-android') : null;
    if (!a) return;
    tiktok(function () {
      window.ttq.track('ClickButton', { content_type: 'product', content_id: 'google_play', content_name: 'Selo do Google Play' });
    });
  }, true);

  // Fila de espera enviada (site.js avisa com este evento; só a loja, nunca o e-mail).
  document.addEventListener('mdf:fila', function (ev) {
    var loja = (ev.detail && ev.detail.loja) || 'fila';
    tiktok(function () {
      window.ttq.track('SubmitForm', { content_type: 'product', content_id: 'fila-' + loja, content_name: 'Fila de espera ' + loja });
    });
  });
})();
