// Aviso de cookies do site. Só existe por causa do pixel do TikTok (pixels.js).
//
// Sem pixel configurado em pixels-config.js, nada acontece: o aviso não aparece
// e o site continua sem cookie nenhum. Com pixel configurado, o aviso aparece
// uma vez; "Aceitar" guarda a escolha e carrega o pixel; "Recusar" guarda a
// escolha e não carrega nada. A escolha fica em localStorage (mdf-consentimento)
// e pode ser desfeita em "Mudar minha escolha", na Privacidade deste site.
(function () {
  var CHAVE = 'mdf-consentimento';
  var cfg = window.MDF_PIXELS || {};
  var temPixel = !!cfg.tiktokPixelId;

  function escolha() {
    try { return localStorage.getItem(CHAVE); } catch (e) { return null; }
  }
  function guardar(valor) {
    try { localStorage.setItem(CHAVE, valor); } catch (e) { /* sem storage, a escolha vale só nesta página */ }
  }
  function banner() { return document.getElementById('banner-cookies'); }
  function mostrar() { var b = banner(); if (b) { b.hidden = false; document.documentElement.setAttribute('data-banner-cookies', 'aberto'); } }
  function esconder() { var b = banner(); if (b) { b.hidden = true; document.documentElement.removeAttribute('data-banner-cookies'); } }

  window.aceitarCookies = function () {
    guardar('aceito');
    esconder();
    if (typeof window.carregarPixels === 'function') window.carregarPixels();
  };
  window.recusarCookies = function () {
    guardar('recusado');
    esconder();
  };
  // Link "Mudar minha escolha" na Privacidade deste site: apaga a escolha e
  // mostra o aviso de novo. Quem tinha aceitado só para de ser medido ao
  // recarregar a página (o pixel já carregado não é descarregado).
  window.mudarCookies = function () {
    try { localStorage.removeItem(CHAVE); } catch (e) { /* nada */ }
    if (temPixel) mostrar();
    return false;
  };
  window.consentimentoAtual = escolha;

  function iniciar() {
    if (!temPixel) return;
    var atual = escolha();
    if (atual === 'aceito') {
      if (typeof window.carregarPixels === 'function') window.carregarPixels();
      return;
    }
    if (atual === 'recusado') return;
    mostrar();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', iniciar);
  else iniciar();
})();
