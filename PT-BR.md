# StremioK PT-BR — versão local 2.2.8-ptbr.3

Derivada do [StremioK de Kepler75](https://github.com/Kepler75/StremioK), commit `d37839db2b0f03cf7e70060550f6605dcf72dec3`, sob licença MIT. Esta cópia é distribuída separadamente em srwayne15-bot/StremioK-PTBR e não é uma distribuição oficial do autor original.

Alvo: Samsung UN55MU7500 (2017), Tizen 3.0 e JavaScript ES5. A base original já foi desenvolvida para uma Samsung de 2017. Os testes desta entrega foram feitos no computador, com dados fictícios e simulações; não comprovam funcionamento na UN55MU7500.

## O que mudou

- Interface em PT-BR por padrão. Em **Configurações › Aparência › Idioma da interface**, escolha English para voltar ao inglês; a seleção salva reinicia o aplicativo.
- **↻ Atualizar** na barra de temporadas/episódios: consulta os detalhes novamente, libera imagens que falharam para nova tentativa e invalida fontes e dados temporários. Se estiver na tela de fontes, consulta também as fontes novamente. As legendas dos complementos são consultadas ao iniciar a reprodução, com os dados do arquivo quando a fonte os informa.
- Ao voltar do YouTube ou de outro aplicativo, uma transição de segundo plano para primeiro plano atualiza os detalhes/fontes da tela aberta. Uma reprodução ativa ou janela de confirmação adia essa atualização até poder fazê-la. Não reinicia a TV.
- Respostas de consultas antigas não substituem uma tela atualizada. Uma nova busca de legendas também descarta resultados da busca anterior no mesmo vídeo.
- **Filtro original + PT-BR**, na seleção de episódios: Ativado por padrão para séries e animes, com opção por título. Prioriza áudio original entre as faixas informadas e legenda brasileira entre as legendas em português. Com o filtro ativado, português genérico e PT-PT não são escolhidos automaticamente. Fontes sem informação explícita sobre o idioma original e PT-BR ficam ocultas. Desativar o filtro permite ver todas as fontes, mantendo a preferência de reprodução por áudio original e PT-BR.
- Com o filtro ativo, ficam visíveis apenas fontes elegíveis que informam áudio original e legendas PT-BR em campos próprios ou campos de idioma rotulados. Informações ausentes, nomes genéricos, multi/dual, português sem variante, links para outros aplicativos, torrents sem servidor e formatos conhecidos como incompatíveis ficam ocultos. Isso é informação do fornecedor, não verificação por reprodução. Desativar o filtro restaura a lista completa.
- **Player › Legendas › Atualizar legendas** consulta os complementos novamente sem sair do vídeo. O ajuste de sincronização em **Legendas › Sincronização** continua disponível para releases com tempos diferentes.

Os títulos, sinopses, nomes de episódios, nomes de fontes, conteúdo das legendas e mensagens enviadas por terceiros não são traduzidos pelo aplicativo. O catálogo aplica-se aos textos estáticos da interface. Identificadores de episódios, idiomas, teclas, protocolos e erros técnicos usados pela lógica permanecem estáveis; registros técnicos de diagnóstico podem continuar em inglês. As traduções tiveram uma primeira passagem assistida por tradução automática, com revisão dos controles e fluxos centrais; não houve revisão linguística humana exaustiva em cada tela na TV.

## Anime: o que isso resolve e o que depende das fontes

Abra o título, confira **Áudio original** e escolha o episódio normalmente. O filtro original + PT-BR fica ativado por padrão para séries e animes. O aplicativo tentará selecionar as faixas disponíveis, sem exigir que você refaça a escolha de idioma em cada episódio. Ele não cria áudio/legenda ausente nem garante que todo complemento catalogue uma temporada da mesma forma.

Esta versão não converte números de temporadas nem troca IDs Kitsu/MAL/IMDb por aproximação. Os pedidos mantêm o identificador enviado pelo catálogo. Se um anime foi cadastrado como uma série diferente ou como um novo título para cada temporada, será necessário escolher a entrada correspondente no catálogo. Nenhuma disponibilidade real de Tokyo Revengers foi testada.

## Separação do original e armazenamento

| Item | Original | PT-BR |
|---|---|---|
| Nome do módulo | `stremiok` | `stremiok-ptbr-local` (não publicado) |
| Nome no lançador | StremioK | StremioK PT-BR |
| Pacote WGT | `StremioK01` | `StremPTB01` |
| Aplicativo WGT | `StremioK01.StremioK` | `StremPTB01.StremioK` |
| Chaves locais | `stremiok.*` | `stremiokptbr.*` |
| Banco IndexedDB | `stremiok` | `stremiokptbr` |
| Serviço TizenBrew / WGT | 8098 / 8099 | 8198 / 8199 |
| Página do celular TizenBrew / WGT | 8108 / 8109 | 8208 / 8209 |

Os serviços auxiliares e os arquivos privados do WGT também usam o novo pacote. As portas evitam o conflito conhecido com o original; a disponibilidade delas no seu aparelho ainda precisa ser conferida.

**TizenBrew continua tendo uma única origem compartilhada.** O prefixo evita que esta cópia leia/apague por engano os dados do original; não cria isolamento de segurança e não aumenta a cota. Outro módulo da mesma origem ainda pode ler os dados. A base original descreve cerca de **5 MB de localStorage** para configurações, progresso e outros dados, compartilhados entre módulos no TizenBrew. IndexedDB tem uma cota variável, dependente do navegador, espaço livre e aparelho; não é correto prometer um limite fixo para esta TV. Os valores reais da sua TV não foram medidos.

Em **Configurações › Diagnóstico › Armazenamento**, consulte o uso antes de importar grandes listas. O painel de localStorage inclui o total da origem compartilhada. A limpeza de caches e a reorganização do banco nesta cópia alcançam apenas suas chaves/banco PT-BR. Se a cota continuar esgotada, uma gravação pode falhar e o app avisa; não apaga histórico ou credenciais do original para abrir espaço. Não use “limpar dados” do próprio TizenBrew como procedimento de atualização.

A primeira abertura da cópia começa independente. Para copiar configurações, use **Exportar configuração** no original e **Importar arquivo de configuração** no PT-BR; revise as opções antes de confirmar a importação. O formato de exportação original foi preservado, mas os valores importados são gravados no novo prefixo. O exportador original não inclui todo o histórico/progresso; esta entrega não tenta transferi-los silenciosamente. O histórico do original permanece onde estava.

## Pacotes e instalação — somente após autorização

A publicação no GitHub foi autorizada. Nada foi instalado na TV ou publicado no npm. O pacote npm contém `private: true` para impedir publicação acidental.

### WGT separado

O arquivo `StremioK-PTBR-2.2.8-ptbr.3-unsigned.wgt` é um arquivo WGT sem assinatura. Ele contém os recursos web e o serviço, mas **não pode ser tratado como pronto para instalar diretamente em uma TV comercial sem assinatura**. Não houve validação no SDK Tizen, ausente neste computador.

Após sua autorização, há duas rotas:

1. Em Apps2Samsung, escolher este arquivo como WGT personalizado e assiná-lo com seu certificado Samsung, verificando o novo ID `StremPTB01` antes da instalação. Nunca selecionar o WGT original por engano. A base original documenta essa rota; a versão de Apps2Samsung e sua capacidade de assinatura devem ser verificadas no momento da instalação.
2. Em Tizen Studio com extensão Samsung TV e um perfil de certificado Samsung que contenha o DUID da sua TV, importar este projeto como aplicação web existente. Gerar o pacote assinado do projeto, conferir `StremPTB01.StremioK` e instalar pelo gerenciador de dispositivos. Não importar o código original por cima desta pasta.

O modo desenvolvedor da TV exige o IP do computador e reinicialização da TV após a configuração. Consulte o [guia oficial de conexão da Samsung](https://developer.samsung.com/smarttv/develop/getting-started/using-sdk/tv-device.html). Não execute a etapa de instalação até autorizar o acesso à TV e revisar o pacote assinado. Para futuras atualizações desta cópia, mantenha o mesmo ID e certificado; não desinstale o original.

Para reconstruir apenas o WGT sem assinatura no Windows:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File scripts/build-wgt.ps1
```

O script cria `dist/` e se recusa a substituir um arquivo já existente. O projeto web não usa transpilation; os arquivos são os próprios fontes ES5. A assinatura deve ser feita separadamente pelo SDK/ferramenta Samsung.

### Módulo TizenBrew separado

O `.tgz` foi gerado por `npm pack`, com nome independente. O fluxo normal documentado do TizenBrew usa um módulo npm publicado e servido pela rede, não a instalação direta de um `.tgz` local no menu “Add NPM module”. **Não digite `stremiok-ptbr-local` nesse menu ainda: ele não foi publicado.**

Depois de revisar e autorizar a distribuição, será necessário escolher um nome npm disponível, revisar a configuração `private` e os metadados, publicar a cópia e só então adicioná-la pelo novo nome no TizenBrew. Outra possibilidade é configurar um ambiente de desenvolvimento de módulos compatível com a versão instalada do TizenBrew; isso não foi configurado nem testado nesta entrega. A opção GitHub module permite usar este repositório público sem npm nem assinatura de WGT; veja [GITHUB-TIZENBREW.md](GITHUB-TIZENBREW.md). Veja a [documentação oficial de módulos do TizenBrew](https://github.com/reisxd/TizenBrew/blob/main/docs/MODULES.md).

## Testes e limites

Os relatórios JSON e imagens entregues em `evidencias/` registram as execuções. Os testes usam complementos fictícios, navegador desktop, IndexedDB simulado e AVPlay simulado. A análise de sintaxe ES5 cobre código próprio, serviços e o Shaka já incluído na base. Não houve teste em Chromium 47 real, emulador Tizen, assinatura Samsung, decodificação de áudio/vídeo, sincronização de legenda de um release real, retorno do aplicativo YouTube na TV ou reprodução de Tokyo Revengers.

Para repetir os testes do código no computador, use Node moderno para as ferramentas (isso não altera o ES5 enviado à TV):

```powershell
npm install
npm test
npm run test:browser
```

O teste de navegador usa Edge instalado no caminho padrão do Windows. Ajuste `STREMIOK_BROWSER_PATH` para outro Chromium compatível, se necessário. As dependências de teste não são enviadas ao WGT nem ao módulo. O catálogo fonte está em `locales/pt-BR.json` e sua cópia embutida em `js/i18n.js`; mantenha os dois sincronizados — o teste compara cada entrada.

Antes de considerar a versão validada no aparelho, conferir com autorização: iniciar original e PT-BR separadamente; verificar histórico no original; abrir série e atualizar; sair para YouTube e voltar; testar fonte com áudio original e PT-BR disponíveis; testar ausência dessas faixas; confirmar troca PT-BR/EN e retenção de dados depois de fechar. Nenhum desses testes físicos foi alegado como executado.

## Idioma original em séries e animes — 2.2.8-ptbr.3

A preferência padrão é áudio original da obra + legenda PT-BR. Um idioma específico não é imposto a todos os títulos. O app usa original_language e campos equivalentes explícitos; pode consultar o TMDB pelo ID exato usando uma chave previamente configurada. País, nome do título, gênero anime e lista de idiomas falados não são usados para adivinhar o original.

Se faltar o idioma original, use **Áudio original** dentro da temporada/episódio. A escolha é salva para aquele título e tem prioridade sobre o catálogo; **Usar metadados do título** remove a escolha manual. Sem original identificado, o modo estrito oculta as fontes e explica o motivo. Desativar a ocultação não muda a preferência por áudio original/PT-BR. Essas escolhas e exceções passam a integrar a exportação/importação de configurações.
