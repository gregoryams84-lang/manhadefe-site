/* Manhã de Fé — "Mande um versículo hoje".
   Monta a imagem do cartão no próprio navegador (nada é enviado para nós)
   e abre a folha de partilha do celular; no computador, salva a imagem. */
(function () {
  'use strict';

  var cartoes = document.querySelectorAll('[data-versiculo]');
  if (!cartoes.length) return;

  var SITE = (window.MDF_CONFIG && window.MDF_CONFIG.site) || location.origin;
  var podeArquivo = false;
  try {
    podeArquivo = !!(navigator.canShare &&
      navigator.canShare({ files: [new File(['x'], 'teste.png', { type: 'image/png' })] }));
  } catch (e) { podeArquivo = false; }

  cartoes.forEach(function (c) {
    var r = c.querySelector('[data-rotulo]');
    if (r) r.textContent = podeArquivo ? 'Mandar para a família' : 'Salvar a imagem';
  });

  function quebrar(g, texto, largura) {
    var palavras = texto.split(' '), linhas = [], linha = '';
    palavras.forEach(function (p) {
      var teste = linha ? linha + ' ' + p : p;
      if (g.measureText(teste).width > largura && linha) { linhas.push(linha); linha = p; }
      else linha = teste;
    });
    if (linha) linhas.push(linha);
    return linhas;
  }

  function desenhar(texto, ref) {
    var fontes = document.fonts ? Promise.all([
      document.fonts.load('600 64px Lora'), document.fonts.load('600 40px Inter')
    ]).catch(function () {}) : Promise.resolve();
    return fontes.then(function () {
      var W = 1080, H = 1350;
      var cv = document.createElement('canvas');
      cv.width = W; cv.height = H;
      var g = cv.getContext('2d');

      g.fillStyle = '#FBF6EC';
      g.fillRect(0, 0, W, H);
      g.strokeStyle = '#E3D8C2';
      g.lineWidth = 4;
      g.strokeRect(48, 48, W - 96, H - 96);

      // sol nascendo
      var cx = W / 2, cy = 300;
      g.fillStyle = '#C8952E';
      g.beginPath(); g.arc(cx, cy, 70, Math.PI, 0); g.closePath(); g.fill();
      g.strokeStyle = '#C8952E'; g.lineWidth = 12; g.lineCap = 'round';
      [-150, -120, -90, -60, -30].forEach(function (a) {
        var rad = a * Math.PI / 180;
        g.beginPath();
        g.moveTo(cx + Math.cos(rad) * 100, cy + Math.sin(rad) * 100);
        g.lineTo(cx + Math.cos(rad) * 136, cy + Math.sin(rad) * 136);
        g.stroke();
      });
      g.fillStyle = '#1E3A5F';
      g.fillRect(cx - 170, cy + 4, 340, 8);

      // versículo, do maior tamanho que couber
      g.textAlign = 'center';
      g.fillStyle = '#221D18';
      var citado = '“' + texto + '”';
      var tam = 72, linhas, lh;
      do {
        g.font = '600 ' + tam + 'px Lora, Georgia, serif';
        linhas = quebrar(g, citado, 860);
        lh = tam * 1.32;
        tam -= 4;
      } while (linhas.length * lh > 560 && tam > 40);
      tam += 4;
      var topo = 420 + (600 - linhas.length * lh) / 2 + tam;
      linhas.forEach(function (l, i) { g.fillText(l, cx, topo + i * lh); });

      g.font = '600 44px Inter, Arial, sans-serif';
      g.fillStyle = '#6B4A12';
      g.fillText(ref, cx, topo + (linhas.length - 1) * lh + 96);

      g.fillStyle = '#1E3A5F';
      g.font = '600 48px Lora, Georgia, serif';
      g.fillText('Manhã de Fé', cx, H - 156);
      g.fillStyle = '#6B4A12';
      g.font = '500 34px Inter, Arial, sans-serif';
      g.fillText('manhadefe.com.br', cx, H - 104);

      return new Promise(function (ok) { cv.toBlob(ok, 'image/png'); });
    });
  }

  document.addEventListener('click', function (ev) {
    var botao = ev.target.closest('[data-versiculo] button');
    if (!botao) return;
    var c = botao.closest('[data-versiculo]');
    var status = c.querySelector('.versiculo-status');
    var texto = c.getAttribute('data-texto');
    var ref = c.getAttribute('data-ref');
    var nome = 'manha-de-fe-' + ref.toLowerCase().normalize('NFD').replace(/[^a-z0-9]+/g, '-').replace(/-+$/, '') + '.png';
    botao.disabled = true;
    desenhar(texto, ref).then(function (blob) {
      var arquivo = new File([blob], nome, { type: 'image/png' });
      if (podeArquivo) {
        return navigator.share({
          files: [arquivo],
          title: 'Manhã de Fé',
          text: 'Um versículo para hoje. ' + SITE + '/?origem=versiculo'
        }).catch(function () { /* a pessoa fechou a partilha: nada a fazer */ });
      }
      var a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = nome;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(function () { URL.revokeObjectURL(a.href); }, 5000);
      status.textContent = 'A imagem foi salva na pasta de downloads do seu computador.';
    }).then(function () { botao.disabled = false; }, function () {
      botao.disabled = false;
      status.textContent = 'Não conseguimos montar a imagem neste navegador. Tente em outro, como o Chrome.';
    });
  });
})();
