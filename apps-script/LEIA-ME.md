# "Me avise" — como ligar (5 minutos, uma vez só)

Enquanto o endereço do script não estiver em `js/config.js` (`aviseEndpoint`),
o formulário "Me avise" funciona assim mesmo: ele abre o programa de e-mail da
pessoa com a mensagem pronta para contato@manhadefe.com.br. Ligando o script,
os e-mails passam a cair direto numa planilha, sem a pessoa precisar enviar
nada.

1. Entre no Google Drive com a conta **suporte@** (a mesma que recebe o
   contato@manhadefe.com.br).
2. Crie uma planilha nova com o nome **Manhã de Fé — Me avise**.
3. Na planilha: **Extensões > Apps Script**.
4. Apague o que estiver no editor, cole todo o conteúdo de `me-avise.gs` e
   clique em **Salvar**.
5. **Implantar > Nova implantação**. Em "Selecionar tipo", escolha
   **App da Web**.
   - Descrição: `Me avise`
   - Executar como: **Eu**
   - Quem pode acessar: **Qualquer pessoa**
6. Clique em **Implantar**, autorize com a conta suporte@ e copie o
   **URL do app da Web** (termina em `/exec`).
7. Mande esse endereço para o chat do site; ele entra em `aviseEndpoint`.

A aba `avisos` é criada sozinha no primeiro envio. Colunas: data e hora,
e-mail, loja, origem, campanha, página e o texto que a pessoa autorizou.

**Regra combinada na política do site:** depois de mandar o aviso de
lançamento, apague as linhas. Se alguém pedir para sair antes, apague a linha
da pessoa na hora.
