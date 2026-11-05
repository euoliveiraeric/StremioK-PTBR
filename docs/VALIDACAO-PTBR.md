# Relatório de validação — StremioK PT-BR 2.2.8-ptbr.1

Data: 05/11/2026. Base: Kepler75/StremioK, commit `d37839db2b0f03cf7e70060550f6605dcf72dec3`.

**25 cenários automatizados passaram no computador**, sem erros de script registrados no teste de navegador. O alvo é a Samsung UN55MU7500/Tizen 3.0, mas não houve acesso à TV, teste no aparelho, emulador Tizen ou Chromium 47 real. Não foi reproduzido um vídeo real nem testada a disponibilidade de Tokyo Revengers.

## Escopo e evidências

| Verificação | Evidência / resultado |
|---|---|
| Sintaxe ES5 | 40 arquivos, incluindo aplicação, serviços, QR code e Shaka já incluído na base; analisador Acorn com ecmaVersion 5 |
| Catálogo | 1993 entradas PT-BR; comparação entre JSON e runtime embutido, alternativa EN, ausência de traduções vazias e de limites de lote corrompidos |
| Inventário de strings | 37 arquivos de código próprio; 2535 ocorrências de chaves de interface; 127 literais nas traduções da página do celular; demais literais preservados e listados no inventário |
| Interface | Edge desktop sem janela, resolução 1920×1080; complementos, imagens e episódios fictícios; seis capturas PNG |
| Armazenamento | QuotaExceededError simulado, jsdom e fake-indexeddb; dados sentinela do original e de outro módulo preservados |
| Áudio | AVPlay simulado: selecionou japonês em vez do inglês lembrado; preferências normais de outro título mantidas; aviso quando japonês não foi informado |
| Legendas | Ordem estável PT-BR → português genérico → PT-PT; nova busca no mesmo contexto descarta a resposta antiga; conteúdo das legendas não é traduzido |
| Retomada | Eventos visibilitychange simulados; detalhes/fontes novamente consultados após saída e retorno; navegação durante uma atualização não foi revertida por resposta atrasada |
| Pacote WGT | 62 arquivos, cada SHA-256 conferido contra o fonte; ZIP e XML lidos; sem assinatura; sem validador do SDK Tizen |
| Módulo npm | npm pack local, nome independente, private:true; não publicado e não adicionado ao TizenBrew |

O inventário completo está em `StremioK-ptBR/locales/inventory.json`. A categoria de literais preservados inclui IDs, protocolos, seletores, chaves, dados e tokens de erro usados pela lógica. Não é uma afirmação de revisão linguística exaustiva em todas as telas na TV. Os nomes e sinopses recebidos de complementos permanecem como foram enviados.

## Casos executados

| Cenário | Resultado |
|---|---|
| All shipped app, service and vendor JavaScript parses as ES5 | Passou |
| Catalogue matches compiled runtime, has no empty translations or shifted batch markers | Passou |
| Language saving failure preserves active language | Passou |
| Quota recovery removes only PT-BR caches; original and other module data survive | Passou |
| IndexedDB tidy preserves own data and never deletes original database | Passou |
| Anime audio chooses Japanese over remembered English and keeps usual settings elsewhere | Passou |
| Anime reports missing Japanese track instead of claiming availability | Passou |
| Export/import format copies settings into PT-BR without touching original | Passou |
| Phone pages localize static text and preserve exported content in PT-BR and EN | Passou |
| Boot PT-BR without script errors | Passou |
| Settings and language selector PT-BR | Passou |
| Independent series screen, refresh button and metadata untouched | Passou |
| Refresh fetches metadata and preserves season and original data | Passou |
| Anime is opt-in and applies only to selected title | Passou |
| Source requests keep the original episode identifier | Passou |
| Returning from background refreshes current source list | Passou |
| Navigation during refresh rejects late screen updates | Passou |
| Brazilian subtitle priority is stable and does not change track data | Passou |
| Subtitle refresh in same playback rejects stale addon responses | Passou |
| Refresh failure keeps the previous episode details | Passou |
| Overlapping source rescans cannot replace new results with old ones | Passou |
| All main settings sections render in PT-BR without script errors | Passou |
| English survives reload and keeps translation alternatives | Passou |
| Keyboard navigation and original stored data remain available | Passou |

## O que precisa de validação no aparelho

- Aceitação do WGT depois da assinatura com certificado Samsung para o DUID da TV; IDs dos serviços e permissões no Tizen 3.0.
- Navegação e legibilidade no motor real de 2017; memória disponível e responsividade com catálogos grandes.
- Reprodução AVPlay, seleção efetiva do áudio pelo decodificador, fontes HLS/MP4/MKV e comportamento depois de abrir o aplicativo YouTube real.
- Cota e uso reais do armazenamento compartilhado do TizenBrew, disponibilidade das portas 8198/8199 e 8208/8209 e execução do serviço pela versão instalada do TizenBrew.
- Disponibilidade e sincronização de legendas PT-BR para os releases usados; correspondência do catálogo com a temporada desejada de cada anime.

Os limites de armazenamento não foram medidos na TV. A base descreve aproximadamente 5 MB de localStorage e IndexedDB variável. Um novo prefixo de chaves evita colisões acidentais, mas não cria uma nova cota nem isolamento de segurança dentro do TizenBrew. O guia explica a cópia voluntária de configurações e as limitações do exportador original quanto ao histórico.

## Arquivos de evidência

- `evidencias/runtime-results.json`: testes de catálogo, ES5, dados, áudio e páginas do celular.
- `evidencias/browser-results.json`: resultados de navegador, contagem de consultas fictícias e erros de script.
- `evidencias/packaging-results.json`: comparação dos arquivos do WGT com o código.
- `evidencias/npm-pack.json`: conteúdo e integridade do pacote npm.
- `evidencias/01-inicio-ptbr.png` a `06-english.png`: imagens da interface com dados fictícios.

## Referências consultadas

- [Código e documentação do StremioK](https://github.com/Kepler75/StremioK): arquitetura ES5/AVPlay, instalação, exportação, cotas descritas pela base e armazenamento compartilhado.
- [Módulos do TizenBrew](https://github.com/reisxd/TizenBrew/blob/main/docs/MODULES.md): módulos como páginas servidas pela rede, metadados de pacote e serviço.
- [Conexão de uma TV ao SDK Samsung](https://developer.samsung.com/smarttv/develop/getting-started/using-sdk/tv-device.html): preparação da instalação com ferramentas Samsung.
- [Especificações do motor web Samsung](https://developer.samsung.com/smarttv/develop/specifications/web-engine-specifications.html): alvo Tizen 3.0/geração 2017; esta entrega não executou esse motor real.

Relatório das validações locais da versão inicial, anterior à publicação no GitHub. A publicação posterior não equivale a teste na TV. Nenhum pacote foi publicado no npm e nenhuma instalação ou alteração de dados foi feita na TV.


Validação adicional da publicação GitHub: o endereço de módulo gh/usuário/repositório@main foi simulado e selecionou o serviço TizenBrew na porta 8198. Teste passou em computador, sem publicação npm e sem TV.
