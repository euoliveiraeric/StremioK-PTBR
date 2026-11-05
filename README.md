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
- Preferência **Anime: JP + PT-BR** por título: áudio japonês entre as faixas disponíveis; prioridade para legendas brasileiras entre as legendas em português. Não cria conteúdo ausente nem adivinha a correspondência de temporadas entre catálogos.
- **Player › Legendas › Atualizar legendas** consulta os complementos sem sair do vídeo.
- Chaves de dados stremiokptbr.*, IndexedDB stremiokptbr e portas 8198/8199 separados do original. O TizenBrew continua compartilhando cota e acesso ao armazenamento entre módulos.

Os títulos, sinopses, descrições de fontes e conteúdo das legendas enviados por terceiros não são traduzidos. Indicações de japonês no nome de uma fonte são informações do fornecedor, sem verificação das faixas antes de abrir o arquivo.

## Atualizações

Melhorias publicadas na ramificação main chegam pelo mesmo endereço do módulo, após reabertura e propagação dos caches. Alterações no serviço podem exigir reiniciar o serviço/TizenBrew, pois ele reaproveita serviços já em execução. Não há atualização instantânea da tela aberta. Ver [atualizações e instalação pelo GitHub](GITHUB-TIZENBREW.md).

## Documentação e testes

- [Guia PT-BR, dados e instalação WGT](PT-BR.md)
- [Validação e limitações](docs/VALIDACAO-PTBR.md)
- [Documentação original preservada](docs/README-UPSTREAM.md)

Foram executados 25 cenários automatizados em computador, incluindo sintaxe ES5, interface PT-BR/EN, respostas atrasadas, áudio simulado, preservação de dados e recuperação de cotas. Isso não confirma reprodução real, compatibilidade do decodificador ou funcionamento na Samsung UN55MU7500. Nenhum teste na TV foi alegado.

Para repetir, na raiz deste projeto com Node moderno para as ferramentas:

`npm install`

`npm test`

`npm run test:browser`

O último usa Edge no caminho padrão do Windows ou o executável definido em STREMIOK_BROWSER_PATH. Dependências de teste não são enviadas à TV. O código do aplicativo e dos serviços permanece ES5.

Este cliente não hospeda mídia; cada usuário configura seus complementos e fontes. A licença MIT original e as licenças das bibliotecas/fontes foram mantidas.
