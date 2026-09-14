/* Manhã de Fé — o que muda sem mexer no resto do site.
   Quando uma loja aprovar o app: troque noAr para true (e, na Apple,
   preencha idApple e providerToken). Os blocos de download, o QR e a
   página /baixar mudam sozinhos. */
window.MDF_CONFIG = {
  site: 'https://manhadefe.com.br',

  // Teste grátis e preço, iguais nas duas lojas.
  diasGratis: 7,
  preco: 'R$ 9,90',

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

  // Endereço do Google Apps Script que guarda os e-mails do "Me avise"
  // (ver apps-script/LEIA-ME.md). Vazio: o formulário abre o e-mail pronto.
  aviseEndpoint: '',

  // Faixa de presente de Natal: aparece sozinha entre estas datas.
  natal: { de: '2026-11-15', ate: '2026-12-25' }
};
