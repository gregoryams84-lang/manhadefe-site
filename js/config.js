/* Manhã de Fé — o que muda sem mexer no resto do site.
   Quando uma loja aprovar o app: troque noAr para true (e, na Apple,
   preencha idApple e providerToken). Os blocos de download, o QR e a
   página /baixar mudam sozinhos. */
window.MDF_CONFIG = {
  site: 'https://manhadefe.com.br',

  // Teste grátis e preço, iguais nas duas lojas.
  diasGratis: 7,
  preco: 'R$ 39,90',       // plano anual
  precoMensal: 'R$ 4,50',  // plano mensal

  lojas: {
    android: {
      noAr: false,
      pacote: 'com.manhadefe.manha_de_fe'
    },
    iphone: {
      noAr: false,
      idApple: '',        // número do app na App Store (apps.apple.com/br/app/id...)
      providerToken: ''   // App Store Connect > Analytics > Campanhas ("pt")
    }
  },

  // "Me avise": as respostas vão para um Formulário Google (e a planilha
  // ligada a ele). Os códigos "entry." são os das perguntas do formulário;
  // ver apps-script/LEIA-ME.md. Sem id: o site abre o e-mail pronto.
  aviseForm: {
    id: '1FAIpQLScySry7cLv_bOMWfUr6AsQ7G6uM-PvM1eyYx0-7ygKpZurI9w',
    campos: { email: 'entry.2065457779', loja: 'entry.853952691', origem: 'entry.1846208247', autorizacao: 'entry.822905497' }
  },
  aviseEndpoint: '',  // alternativa: app da web do Apps Script (não usada)

  // Faixa de presente de Natal: aparece sozinha entre estas datas.
  natal: { de: '2026-11-15', ate: '2026-12-25' }
};
