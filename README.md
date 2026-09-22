# manhadefe.com.br

Site do aplicativo **Manhã de Fé** (AUREA EDUCACIONAL LTDA, CNPJ 67.140.776/0001-88).
GitHub Pages, branch `main`, pasta raiz; domínio em `CNAME`. HTML, CSS e JS puros,
sem etapa de build, sem cookies e sem nada de terceiros carregado na página.

## Páginas

| Endereço | O que é |
|---|---|
| `/` | Página comercial (promessa, amostra, preço, perguntas, download) |
| `/catolico/`, `/evangelico/` | Uma página por tradição (destino dos anúncios de cada público) |
| `/baixar/` | Manda o iPhone para a App Store e o Android para o Google Play |
| `/privacidade/` | **Política do aplicativo** — URL cadastrada nas duas lojas, não mudar |
| `/privacidade-do-site/` | Política do site (formulário "Me avise") |
| `/termos/` | Termos de uso (a Apple exige o link em app com assinatura) |

## Quando uma loja aprovar o app

Tudo muda em `js/config.js`:

- Google Play: `lojas.android.noAr = true`.
- App Store: `lojas.iphone.noAr = true`, `idApple` (número do app) e
  `providerToken` (App Store Connect > Analytics > Campanhas).

Com as duas em `false`, todo bloco de download vira "Me avise". Com uma só no
ar, cada aparelho vê a sua situação (o Android baixa, o iPhone deixa o e-mail).
Teste grátis (`diasGratis`), preço anual (`preco`) e preço mensal (`precoMensal`) também ficam ali; o texto das páginas usa `data-preco` e `data-preco-mes`.

## De onde veio cada instalação

Qualquer link do site aceita `?origem=` (ou `utm_source=`), por exemplo
`https://manhadefe.com.br/?origem=instagram`. A origem segue até a loja:

- Google Play: `referrer=utm_source=<origem>&utm_medium=<meio>&utm_campaign=<campanha>`
  (Play Console > Aquisição de usuários).
- App Store: `ct=<origem>` (App Store Connect > Analytics > Campanhas).

Links sugeridos: `?origem=facebook`, `?origem=instagram`, `?origem=tiktok`,
`?origem=youtube`, `?origem=whatsapp`. Campanha: `&campanha=natal`.

## QR de impressão

`node ferramentas/gerar-qr.mjs` gera `qr/<origem>.svg` e `.png` (santinho,
impresso, facebook, instagram, tiktok, youtube, whatsapp). Todos apontam para
`/baixar/?origem=<origem>&meio=qr`: a loja pode mudar sem reimprimir nada.
Tamanho mínimo impresso: 2,5 cm, sem cortar a borda clara.

## "Me avise"

Ver `apps-script/LEIA-ME.md`. Enquanto `aviseEndpoint` estiver vazio, o
formulário abre o e-mail pronto para contato@manhadefe.com.br.

## Regras que o site não pode quebrar

1. `/privacidade` sempre no ar, com a política completa do app.
2. Nada de pagamento, Pix ou link de compra: a assinatura é vendida na loja.
3. Contato só por e-mail (contato@manhadefe.com.br). Sem WhatsApp, telefone ou chat.
4. Nenhum link, logo, cor ou texto de outra marca da empresa.
5. Nenhum número inventado: os números da página são contados no aplicativo.
6. Acessibilidade: letra de 18 px ou mais, botões de 64 px ou mais, contraste alto.
7. Se o site passar a usar análise de visitas, pixel ou cookie, atualizar antes a
   `/privacidade-do-site/` (a política do app não muda).
