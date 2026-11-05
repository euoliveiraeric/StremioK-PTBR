# StremioK PT-BR

Versão independente do [StremioK de Kepler75](https://github.com/Kepler75/StremioK), baseada no commit d37839db2b0f03cf7e70060550f6605dcf72dec3, sob licença MIT.

Interface PT-BR por padrão, com alternativa English em Configurações › Aparência › Idioma da interface. Alvo: Samsung Tizen 3.0+ (2017), JavaScript ES5 e AVPlay. Validação automatizada em computador; ainda não testada em TV física.

## TizenBrew

No gerenciador de módulos, escolher **GitHub module** e informar:

`srwayne15-bot/StremioK-PTBR@main`

Depois abrir **StremioK PT-BR**. Esta é uma cópia separada: não remover o módulo original stremiok. A integração depende da versão do TizenBrew executar serviços de módulos. Se o módulo aparecer como desconhecido logo após uma publicação, aguardar a propagação do CDN e atualizar a lista do TizenBrew; não limpar os dados do aplicativo.

O GitHub module usa o CDN jsDelivr. Não é necessário publicar no npm nem assinar WGT para esta rota. O projeto mantém private:true para impedir publicação npm acidental; isso não restringe a leitura deste repositório público.

## Melhorias desta versão

- Botão ↻ Atualizar na seleção de temporadas/episódios; refaz detalhes e libera novas tentativas de imagens. Na tela de fontes, refaz também a lista de fontes.
- Recuperação da tela aberta ao retornar de outro aplicativo; respostas antigas não substituem a consulta nova.
- Preferência **Filtro original + PT-BR** por título: áudio original entre as faixas disponíveis; legendas PT-BR obrigatórias para a fonte aparecer quando o filtro está ativo. Não cria conteúdo ausente nem adivinha a correspondência de temporadas entre catálogos.
- **Player › Legendas › Atualizar legendas** consulta os complementos sem sair do vídeo.
- Chaves de dados stremiokptbr.*, IndexedDB stremiokptbr e portas 8198/8199 separados do original. O TizenBrew continua compartilhando cota e acesso ao armazenamento entre módulos.

Os títulos, sinopses, descrições de fontes e conteúdo das legendas enviados por terceiros não são traduzidos. Indicações de idioma no nome de uma fonte são informações do fornecedor, sem verificação das faixas antes de abrir o arquivo.

## Atualizações

Melhorias publicadas na ramificação main chegam pelo mesmo endereço do módulo, após reabertura e propagação dos caches. Alterações no serviço podem exigir reiniciar o serviço/TizenBrew, pois ele reaproveita serviços já em execução. Não há atualização instantânea da tela aberta. Ver [atualizações e instalação pelo GitHub](GITHUB-TIZENBREW.md).

## Documentação e testes

- [Guia PT-BR, dados e instalação WGT](PT-BR.md)
- [Validação e limitações](docs/VALIDACAO-PTBR.md)
- [Documentação original preservada](docs/README-UPSTREAM.md)

Na versão inicial, foram executados 25 cenários automatizados em computador, incluindo sintaxe ES5, interface PT-BR/EN, respostas atrasadas, áudio simulado, preservação de dados e recuperação de cotas. Isso não confirma reprodução real, compatibilidade do decodificador ou funcionamento na Samsung UN55MU7500. Nenhum teste na TV foi alegado.

Para repetir, na raiz deste projeto com Node moderno para as ferramentas:

`npm install`

`npm test`

`npm run test:browser`

O último usa Edge no caminho padrão do Windows ou o executável definido em STREMIOK_BROWSER_PATH. Dependências de teste não são enviadas à TV. O código do aplicativo e dos serviços permanece ES5.

Este cliente não hospeda mídia; cada usuário configura seus complementos e fontes. A licença MIT original e as licenças das bibliotecas/fontes foram mantidas.

## Atualização 2.2.8-ptbr.3

O controle **Filtro original + PT-BR** também está na tela de fontes dentro da temporada/episódio. Ativado, oculta fontes sem os idiomas informados e fontes inelegíveis. A mesma regra protege reprodução automática, retomar, próximo episódio e seleção de fonte dentro do player. O filtro é por título e mantém as escolhas existentes; pode resultar em lista vazia quando os complementos não informam os idiomas. Sem informação não significa que a faixa não exista, e sim que não pode ser confirmada para exibição nesse modo.

O idioma original vem de campos explícitos nos metadados. Se faltar, o app pode consultar o TMDB pelo ID exato do título usando a chave já configurada; sem essa informação, não presume inglês, japonês, país de produção ou gênero. O botão **Áudio original** permite escolher o idioma desse título e salvar a escolha. Exemplos de política: francês para um título cujo original é francês, alemão para um original alemão e japonês para um original japonês. A preferência pelo original continua mesmo quando a ocultação de fontes é desativada.

Nesta atualização, 28 verificações automatizadas de regressão, áudio original e filtro passaram em computador. Veja [regras e evidências da versão 3](docs/AUDIO-ORIGINAL-PTBR3.md). Sem teste físico desta atualização na TV.
