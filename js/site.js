/* Manhã de Fé — comportamento do site.
   Sem cookies e sem ferramenta de terceiros. De qual link a pessoa veio
   (?origem=) fica só nesta aba, em sessionStorage, e segue para a loja:
   Google Play recebe utm_source no "referrer"; a App Store recebe ct=. */
(function () {
  'use strict';

  var C = window.MDF_CONFIG || {};
  var LOJAS = C.lojas || {};
  var SITE = C.site || location.origin;
  var DIAS = C.diasGratis || 7;
  var PRECO = (C.preco || 'R$ 9,90').replace(/ /g, ' '); // "R$" nunca separa do valor
  var raiz = document.documentElement;

  var TEXTO_CONSENTIMENTO = 'Quero receber um único e-mail avisando quando o Manhã de Fé estiver na loja. Depois do aviso, meu e-mail é apagado.';

  /* ---------- de onde a pessoa veio ---------- */
  function limpar(v) {
    return String(v || '').toLowerCase().replace(/[^a-z0-9_-]/g, '').slice(0, 40);
  }
  var params = new URLSearchParams(location.search);
  var origem = limpar(params.get('origem') || params.get('utm_source'));
  var campanha = limpar(params.get('campanha') || params.get('utm_campaign'));
  var meio = limpar(params.get('meio') || params.get('utm_medium')) || 'site';
  try {
    if (origem) sessionStorage.setItem('mdf-origem', origem);
    else origem = sessionStorage.getItem('mdf-origem') || '';
    if (campanha) sessionStorage.setItem('mdf-campanha', campanha);
    else campanha = sessionStorage.getItem('mdf-campanha') || '';
  } catch (e) { /* aba privada ou armazenamento bloqueado: segue sem lembrar */ }
  origem = origem || 'site';
  campanha = campanha || 'lancamento';

  /* ---------- aparelho e lojas ---------- */
  var ua = navigator.userAgent || '';
  var ehIphone = /iPhone|iPad|iPod/i.test(ua) || (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1);
  var ehAndroid = !ehIphone && /Android/i.test(ua);
  var aparelho = ehIphone ? 'iphone' : (ehAndroid ? 'android' : 'outro');
  var noAr = {
    android: !!(LOJAS.android && LOJAS.android.noAr),
    iphone: !!(LOJAS.iphone && LOJAS.iphone.noAr && LOJAS.iphone.idApple)
  };
  raiz.setAttribute('data-aparelho', aparelho);
  raiz.setAttribute('data-lojas', (noAr.android || noAr.iphone) ? 'alguma' : 'nenhuma');

  function urlLoja(loja) {
    if (loja === 'android') {
      var ref = 'utm_source=' + origem + '&utm_medium=' + meio + '&utm_campaign=' + campanha;
      return 'https://play.google.com/store/apps/details?id=' + LOJAS.android.pacote +
        '&referrer=' + encodeURIComponent(ref);
    }
    var i = LOJAS.iphone;
    var u = 'https://apps.apple.com/br/app/id' + i.idApple + '?mt=8&ct=' + encodeURIComponent(origem);
    if (i.providerToken) u += '&pt=' + encodeURIComponent(i.providerToken);
    return u;
  }

  function escapar(t) {
    return String(t).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  /* ---------- preço e dias em todo o site ---------- */
  document.querySelectorAll('[data-dias]').forEach(function (el) { el.textContent = DIAS; });
  document.querySelectorAll('[data-preco]').forEach(function (el) { el.textContent = PRECO; });

  var plataformas = document.querySelector('[data-texto-plataformas]');
  if (plataformas) {
    if (noAr.android && noAr.iphone) plataformas.textContent = 'Sim, nos dois: Google Play e App Store.';
    else if (noAr.android) plataformas.textContent = 'No Android já está no Google Play. No iPhone chega logo depois: deixe seu e-mail em "Me avise" e mandamos um aviso.';
    else if (noAr.iphone) plataformas.textContent = 'No iPhone já está na App Store. No Android chega logo depois: deixe seu e-mail em "Me avise" e mandamos um aviso.';
  }

  /* ---------- código QR (gerado aqui, sem serviço de fora) ---------- */
  function carregarQr(pronto) {
    if (window.qrcode) { pronto(); return; }
    var s = document.createElement('script');
    s.src = '/js/qrcode.js';
    s.onload = pronto;
    document.head.appendChild(s);
  }
  function qrSvg(texto) {
    var q = window.qrcode(0, 'M');
    q.addData(texto);
    q.make();
    var n = q.getModuleCount(), m = 4, t = n + m * 2, d = '';
    for (var r = 0; r < n; r++) {
      for (var c = 0; c < n; c++) {
        if (q.isDark(r, c)) d += 'M' + (c + m) + ' ' + (r + m) + 'h1v1h-1z';
      }
    }
    return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + t + ' ' + t + '" shape-rendering="crispEdges" role="img" aria-label="Código para abrir a loja no celular">' +
      '<rect width="' + t + '" height="' + t + '" fill="#FBF6EC"/><path fill="#221D18" d="' + d + '"/></svg>';
  }

  /* ---------- bloco de download ---------- */
  var SELOS = {
    android: { img: '/selos/google-play-pt-br.svg', w: 239, h: 71, alt: 'Disponível no Google Play' },
    iphone: { img: '/selos/app-store-pt-br.svg', w: 135, h: 40, alt: 'Baixar na App Store' }
  };
  function selo(loja) {
    var s = SELOS[loja];
    return '<a class="selo selo-' + loja + '" href="' + escapar(urlLoja(loja)) + '">' +
      '<img src="' + s.img + '" width="' + s.w + '" height="' + s.h + '" alt="' + s.alt + '"></a>';
  }

  var contador = 0;
  function formAvise(loja, secundario) {
    contador += 1;
    var id = 'email-' + contador;
    var titulo;
    // Antes de qualquer loja aprovar, o título é o mesmo em todo aparelho.
    if (loja === 'ambas' || (!noAr.android && !noAr.iphone)) titulo = 'O Manhã de Fé está chegando às lojas';
    else if (loja === 'iphone') titulo = secundario ? 'Tem iPhone? Lá ainda não saiu.' : 'No iPhone, o Manhã de Fé ainda não saiu';
    else titulo = secundario ? 'Tem Android? Lá ainda não saiu.' : 'No Android, o Manhã de Fé ainda não saiu';
    return '<form class="avise' + (secundario ? ' avise-secundario' : '') + '" data-avise data-loja="' + loja + '" novalidate>' +
      '<h3 class="avise-titulo">' + titulo + '</h3>' +
      '<p class="avise-texto">Deixe seu e-mail e mandamos um único aviso quando der para baixar.</p>' +
      '<label class="campo-rotulo" for="' + id + '">Seu e-mail</label>' +
      '<input class="campo" id="' + id + '" name="email" type="email" autocomplete="email" inputmode="email" autocapitalize="off" spellcheck="false" required>' +
      '<label class="consentimento"><input type="checkbox" name="consentimento" value="sim" required><span>' + TEXTO_CONSENTIMENTO + '</span></label>' +
      '<div class="isca" aria-hidden="true"><label>Deixe em branco <input type="text" name="site" tabindex="-1" autocomplete="off"></label></div>' +
      '<button class="botao botao-principal" type="submit">Me avise</button>' +
      '<p class="avise-status" role="status" aria-live="polite"></p>' +
      '<p class="avise-nota">Só isso, nada mais. Veja <a href="/privacidade-do-site/">como cuidamos do seu e-mail</a>.</p>' +
      '</form>';
  }

  function montarBaixar(el) {
    var visiveis = aparelho === 'outro' ? ['android', 'iphone'] : [aparelho];
    var noArAqui = visiveis.filter(function (l) { return noAr[l]; });
    var faltam = visiveis.filter(function (l) { return !noAr[l]; });
    var partes = [];
    if (noArAqui.length) {
      partes.push('<div class="baixar-lojas">' +
        (aparelho === 'outro' ? '<div class="baixar-qr"><div class="qr" data-qr></div><p class="qr-legenda">Aponte a câmera do seu celular para o código</p></div>' : '') +
        '<div class="selos">' + noArAqui.map(selo).join('') + '</div></div>');
    }
    if (faltam.length) {
      partes.push(formAvise(faltam.length === 2 ? 'ambas' : faltam[0], noArAqui.length > 0));
    }
    partes.push('<p class="baixar-preco">' + (noArAqui.length ? '' : 'Quando sair: ') +
      DIAS + ' dias grátis. Depois, ' + PRECO + ' por ano, com renovação automática.</p>');
    el.innerHTML = partes.join('');

    var alvo = el.querySelector('[data-qr]');
    if (alvo) {
      carregarQr(function () {
        alvo.innerHTML = qrSvg(SITE + '/baixar/?origem=' + encodeURIComponent(origem) + '&meio=qr');
      });
    }
  }
  document.querySelectorAll('[data-baixar]').forEach(montarBaixar);

  /* ---------- "Me avise" ---------- */
  function erro(status, texto) {
    status.className = 'avise-status erro';
    status.textContent = texto;
  }
  function sucesso(form, email) {
    form.innerHTML = '<p class="avise-ok" role="status">Pronto. Anotamos <strong>' + escapar(email) +
      '</strong>. Quando o Manhã de Fé chegar à loja, mandamos um único e-mail.</p>';
  }
  document.addEventListener('submit', function (ev) {
    var f = ev.target;
    if (!f.matches || !f.matches('[data-avise]')) return;
    ev.preventDefault();
    var status = f.querySelector('.avise-status');
    var botao = f.querySelector('button[type="submit"]');
    status.className = 'avise-status';
    status.textContent = '';
    var email = f.email.value.trim();
    if (!email) {
      erro(status, 'Escreva o seu e-mail no campo acima.');
      f.email.focus();
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
      erro(status, 'Confira o e-mail: ele precisa ter @ e terminar em algo como .com ou .com.br.');
      f.email.focus();
      return;
    }
    if (!f.consentimento.checked) {
      erro(status, 'Para mandarmos o aviso, marque a caixa de autorização logo acima do botão.');
      f.consentimento.focus();
      return;
    }
    if (f.site.value) { sucesso(f, email); return; } // campo-isca preenchido: robô

    var loja = f.getAttribute('data-loja');
    if (!C.aviseEndpoint) {
      var nomeLoja = loja === 'iphone' ? 'iPhone' : loja === 'android' ? 'Android' : 'Android ou iPhone';
      location.href = 'mailto:contato@manhadefe.com.br?subject=' + encodeURIComponent('Me avise quando o Manhã de Fé sair') +
        '&body=' + encodeURIComponent(TEXTO_CONSENTIMENTO + '\n\nMeu e-mail: ' + email + '\nCelular: ' + nomeLoja + '\n(origem: ' + origem + ')');
      status.textContent = 'Seu programa de e-mail vai abrir com a mensagem pronta. É só enviar. Se ele não abrir, escreva para contato@manhadefe.com.br com o assunto "Me avise".';
      return;
    }
    var dados = new URLSearchParams({
      email: email, consentimento: 'sim', loja: loja, origem: origem, campanha: campanha,
      pagina: location.pathname, texto_consentimento: TEXTO_CONSENTIMENTO
    });
    botao.disabled = true;
    botao.textContent = 'Enviando…';
    fetch(C.aviseEndpoint, { method: 'POST', mode: 'no-cors', body: dados }).then(function () {
      sucesso(f, email);
    }, function () {
      botao.disabled = false;
      botao.textContent = 'Me avise';
      erro(status, 'Não conseguimos registrar agora. Tente de novo em alguns minutos, ou escreva para contato@manhadefe.com.br.');
    });
  });

  /* ---------- cartão de amostra: tradição e narração ---------- */
  function iniciarAmostra(area) {
    var cartao = area.querySelector('[data-cartao]');
    var botao = area.querySelector('[data-ouvir]');
    var rotulo = area.querySelector('[data-rotulo-ouvir]');
    var barra = area.querySelector('[data-progresso]');
    var tempo = area.querySelector('[data-tempo]');
    var escolhas = area.querySelectorAll('[data-escolher]');
    var atual = area.getAttribute('data-tradicao-atual');

    function audio() { return area.querySelector('audio[data-audio="' + atual + '"]'); }
    function fmt(s) {
      s = Math.max(0, Math.round(s || 0));
      return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0');
    }
    function pintar() {
      var a = audio();
      var total = isFinite(a.duration) && a.duration ? a.duration : Number(a.getAttribute('data-duracao'));
      var fim = a.ended || (total && a.currentTime >= total - 0.05);
      barra.style.width = (total ? Math.min(100, a.currentTime / total * 100) : 0) + '%';
      tempo.textContent = fmt(a.currentTime) + ' de ' + fmt(total);
      botao.classList.toggle('tocando', !a.paused);
      rotulo.textContent = !a.paused ? 'Pausar' : (fim ? 'Ouvir de novo' : 'Ouvir');
    }
    area.querySelectorAll('audio').forEach(function (a) {
      ['timeupdate', 'play', 'pause', 'ended', 'loadedmetadata'].forEach(function (ev) {
        a.addEventListener(ev, function () { if (a === audio()) pintar(); });
      });
    });
    botao.addEventListener('click', function () {
      var a = audio();
      if (a.paused) {
        if (a.ended) a.currentTime = 0;
        var p = a.play();
        if (p && p.catch) p.catch(function () { pintar(); });
      } else {
        a.pause();
      }
    });
    escolhas.forEach(function (b) {
      b.addEventListener('click', function () {
        area.querySelectorAll('audio').forEach(function (a) { a.pause(); a.currentTime = 0; });
        atual = b.getAttribute('data-escolher');
        area.setAttribute('data-tradicao-atual', atual);
        cartao.setAttribute('data-tradicao-atual', atual);
        escolhas.forEach(function (o) { o.setAttribute('aria-pressed', String(o === b)); });
        pintar();
      });
    });
    pintar();
  }
  document.querySelectorAll('[data-amostra]').forEach(iniciarAmostra);

  /* ---------- faixa de Natal ---------- */
  var n = C.natal;
  if (n) {
    var hoje = new Date();
    if (hoje >= new Date(n.de + 'T00:00:00') && hoje <= new Date(n.ate + 'T23:59:59')) {
      document.querySelectorAll('[data-natal]').forEach(function (el) { el.hidden = false; });
    }
  }

  /* ---------- link para uma pergunta abre a resposta ---------- */
  function abrirPergunta() {
    if (!location.hash) return;
    var alvo = document.getElementById(location.hash.slice(1));
    if (alvo && alvo.tagName === 'DETAILS') alvo.open = true;
  }
  window.addEventListener('hashchange', abrirPergunta);
  abrirPergunta();

  /* ---------- /baixar: manda cada aparelho para a sua loja ---------- */
  if (document.body.getAttribute('data-pagina') === 'baixar' && aparelho !== 'outro' && noAr[aparelho]) {
    location.replace(urlLoja(aparelho));
  }
})();
