# "Me avise" — como funciona

**Em uso (desde 26/09/2026): Formulário Google.** O site envia cada cadastro
para um Formulário Google, sem a pessoa ver o formulário; as respostas ficam na
aba Respostas e na planilha ligada a ele. Configuração em `js/config.js`
(`aviseForm`): o `id` é o trecho do link do formulário entre `/d/e/` e
`/viewform`; os `campos` são os códigos `entry.NNN` de cada pergunta.

Como achar os códigos das perguntas: abra o link público do formulário
(`…/viewform`), veja o código-fonte e procure `FB_PUBLIC_LOAD_DATA_`; cada
pergunta aparece com o nome e um número — o código é `entry.<número>`.
(O chat do site faz isso por script em segundos; é só mandar o link.)

Perguntas do formulário atual, todas de resposta curta: **E-mail**, **Loja**,
**Origem**, **Autorização**. Nas configurações do formulário, "Coletar
endereços de e-mail" tem de ficar em "Não coletar" e "Limitar a 1 resposta"
desligada; qualquer uma delas ligada exige login e o envio falha.

Regra combinada na política do site: depois de mandar o aviso de lançamento,
apague as respostas. Se alguém pedir para sair antes, apague a linha da pessoa.

---

## Alternativa: Apps Script (`me-avise.gs`)

Um app da web que grava numa planilha, com deduplicação. Não está em uso:
em 24/09/2026 as implantações feitas nas contas do Workspace e na conta
pessoal devolveram "Acesso negado" para visitantes sem login, mesmo com
"Quem pode acessar: Qualquer pessoa". Se um dia for usado, preencha
`aviseEndpoint` em `js/config.js` com o endereço `/exec` e deixe `aviseForm`
sem `id`.
