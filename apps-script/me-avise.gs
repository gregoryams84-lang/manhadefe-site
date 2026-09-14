/**
 * Manhã de Fé — "Me avise" (lista de espera do lançamento).
 *
 * Recebe o formulário do site e grava uma linha na planilha onde este script
 * está (Extensões > Apps Script). Guarda só o necessário para mandar UM aviso.
 * Regras de privacidade: manhadefe.com.br/privacidade-do-site
 * Passo a passo de instalação: apps-script/LEIA-ME.md
 */

var ABA = 'avisos';
var CABECALHO = ['data_hora', 'email', 'loja', 'origem', 'campanha', 'pagina', 'texto_autorizado'];

function doPost(e) {
  var p = (e && e.parameter) || {};
  if (p.site) return resposta_();                       // campo-isca preenchido: robô

  var email = String(p.email || '').trim().toLowerCase();
  if (email.length > 200 || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) return resposta_();
  if (p.consentimento !== 'sim') return resposta_();

  var trava = LockService.getScriptLock();
  trava.waitLock(10000);
  try {
    var aba = pegarAba_();
    var ultima = aba.getLastRow();
    if (ultima > 1) {
      var existentes = aba.getRange(2, 2, ultima - 1, 1).getValues();
      for (var i = 0; i < existentes.length; i++) {
        if (String(existentes[i][0]).replace(/^'/, '') === email) return resposta_(); // já está na lista
      }
    }
    aba.appendRow([
      new Date(),
      seguro_(email),
      curto_(p.loja),
      curto_(p.origem),
      curto_(p.campanha),
      curto_(p.pagina),
      seguro_(String(p.texto_consentimento || '').slice(0, 300))
    ]);
  } finally {
    trava.releaseLock();
  }
  return resposta_();
}

function pegarAba_() {
  var planilha = SpreadsheetApp.getActiveSpreadsheet();
  var aba = planilha.getSheetByName(ABA);
  if (!aba) {
    aba = planilha.insertSheet(ABA);
    aba.appendRow(CABECALHO);
    aba.setFrozenRows(1);
  }
  return aba;
}

// Só letras, números, barra, hífen e sublinhado; no máximo 60 caracteres.
function curto_(v) {
  return String(v || '').replace(/[^a-z0-9_\/-]/gi, '').slice(0, 60);
}

// Evita que um texto começado por = + - @ vire fórmula na planilha.
function seguro_(v) {
  return /^[=+\-@]/.test(v) ? "'" + v : v;
}

function resposta_() {
  return ContentService.createTextOutput('ok');
}
