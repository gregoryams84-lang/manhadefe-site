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

Links para a bio das redes (curtos, estáveis, já com a origem e `meio=bio`,
caem no bloco da fila de espera / download): `manhadefe.com.br/instagram`,
`/tiktok`, `/facebook`, `/youtube`, `/whatsapp`, `/kwai`. Campanha: `&campanha=natal`.

`manhadefe.com.br/convite` é o link que o botão ENVIAR do app põe no fim da
mensagem (origem `whatsapp`, meio `convite`): separa quem chegou por indicação
de um amigo de quem chegou pela bio (`meio=bio`). Endereço estável, circula em
mensagens por anos: nunca mudar nem apagar. A página traz as etiquetas `og:`
da página inicial, para o link ganhar título e imagem quando alguém o cola
sozinho numa conversa.

Origem, meio e campanha ficam guardados na aba (`mdf-origem`, `mdf-meio`,
`mdf-campanha`) e não se perdem se a pessoa navegar por outras páginas antes de
tocar no botão da loja. Os três andam juntos: um link novo que traga qualquer
um deles substitui os três, e o que ele não trouxer volta ao padrão (`site`,
`site`, `lancamento`). Assim o `convite` de uma chegada anterior não gruda em
outra origem aberta depois na mesma aba.

**Como nomear origem, meio e campanha.** O texto do link vai inteiro para o
Google (e às vezes para a Meta) quando a pessoa autoriza a medição no app, e a
política do app promete que a tradição dela nunca chega a essas empresas. Por
isso o `site.js` recusa por inteiro, e devolve ao padrão, qualquer valor que:

- tenha mais de 36 caracteres (teto do Firebase) ou algo fora de `a-z`, `0-9`,
  ponto, hífen e sublinhado (maiúsculas e acentos são normalizados antes);
- contenha, sem acento, uma destas sequências: aparecida, senhora, maria,
  catolic, evangel, protestant, crente, gospel, terco, rosario, missa, culto,
  santo, santa, hino, orac, igreja, padre, pastor, bispo, bibli, jesus, deus,
  crist, devoc, novena, salmo, louvor, relig, paroqui;
- seja `desconhecida`, `google-ads` ou `google-play` (marcadores do próprio app).

Então a campanha de outubro não pode chamar `mae-aparecida`: use algo neutro,
como `campanha=outubro` ou `campanha=15-10`. Recusa, não conserta: um valor
cortado em 36 ou sem uma letra ainda poderia passar a palavra. A lista é do chat
do app (02/10/2026) e o app aplica a mesma regra.

## QR de impressão

`node ferramentas/gerar-qr.mjs` gera `qr/<origem>.svg` e `.png` (santinho,
impresso, facebook, instagram, tiktok, youtube, whatsapp). Todos apontam para
`/baixar/?origem=<origem>&meio=qr`: a loja pode mudar sem reimprimir nada.
Tamanho mínimo impresso: 2,5 cm, sem cortar a borda clara.

## "Me avise"

As respostas vão para um Formulário Google (`aviseForm` em `js/config.js`;
detalhes em `apps-script/LEIA-ME.md`). Sem `aviseForm.id`, o formulário abre
o e-mail pronto para contato@manhadefe.com.br.

## Regras que o site não pode quebrar

1. `/privacidade` sempre no ar, com a política completa do app.
2. Nada de pagamento, Pix ou link de compra: a assinatura é vendida na loja.
3. Contato só por e-mail (contato@manhadefe.com.br). Sem WhatsApp, telefone ou chat.
4. Nenhum link, logo, cor ou texto de outra marca da empresa.
5. Nenhum número inventado: os números da página são contados no aplicativo.
6. Acessibilidade: letra de 18 px ou mais, botões de 64 px ou mais, contraste alto.
7. Se o site passar a usar análise de visitas, pixel ou cookie, atualizar antes a
   `/privacidade-do-site/` (a política do app não muda).
