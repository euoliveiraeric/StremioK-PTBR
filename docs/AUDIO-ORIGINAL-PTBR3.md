# Áudio original + legenda PT-BR — versão 2.2.8-ptbr.3

Publicação 2.2.8-ptbr.3 no repositório independente. Substitui a proposta anterior restrita a japonês. Publicar os arquivos não equivale a executar a atualização ou testar a versão na TV.

A preferência passa a ser o idioma original da obra em todas as séries e animes, com legendas PT-BR. Um original francês usa francês, um original alemão usa alemão e um original japonês usa japonês. Não é imposto japonês, inglês ou o idioma da TV a todos os títulos.

## Como o idioma é identificado

1. Uma escolha manual salva em **Áudio original**, dentro da temporada/episódio, tem prioridade para aquele título.
2. Sem escolha manual, são usados campos explícitos de idioma original dos metadados, como `original_language`.
3. Quando essa informação não existe e uma chave TMDB já está configurada, o app pode consultar os detalhes pelo ID exato do título. Não busca pelo nome e não inclui uma chave de API própria.
4. Sem confirmação, mostra **Não informado** e permite escolher o idioma. Não deduz por nome, país, gênero anime ou lista de idiomas falados.

## Fontes e reprodução

O filtro **original + PT-BR** fica ativado por padrão para séries e animes e aparece dentro da temporada e da tela de fontes do episódio. Oculta fontes inelegíveis, fontes em outros idiomas e fontes sem confirmação suficiente. Informação genérica como multi/dual ou português sem variante não comprova a combinação escolhida. Legendas obtidas para o episódio em geral não são tratadas como comprovação de correspondência com um arquivo específico.

Retomar, reproduzir melhor fonte, próximo episódio e seletor de fontes do player seguem a mesma regra. Quando nada corresponde, a lista fica vazia com uma explicação, sem iniciar uma fonte incompatível como fallback.

Desativar a ocultação para um título permite ver a lista completa, mas mantém a preferência de reprodução por áudio original e PT-BR. As escolhas manuais e exceções são salvas e incluídas na exportação/importação de configurações. As chaves antigas e os dados do StremioK original permanecem preservados.

Os idiomas de uma fonte são informações do complemento, não uma garantia obtida abrindo todos os vídeos. O aplicativo não cria uma faixa ausente nem garante a correção dos metadados, a disponibilidade do link ou a sincronização de um release real.

## Validação

28 testes aprovados em computador nesta versão: 11 verificações de regressão e 17 do filtro e dos idiomas, com jsdom, aplicação completa, fontes fictícias e AVPlay simulado. Entre os casos estão fontes e faixas originais francesas/alemãs versus inglês/japonês, idioma desconhecido sem suposição, seleção manual, busca TMDB por ID exato, escolha manual protegida de resposta atrasada, foco do seletor preservado, exportação de preferências, fonte inelegível oculta e ausência de fallback no próximo episódio. Sintaxe ES5 e catálogo PT-BR/EN também foram conferidos.

Os exemplos de títulos usados nos testes são dados fictícios com idiomas explícitos. Não houve consulta à disponibilidade de streams reais de Lupin ou Dark, reprodução de Netflix ou teste físico desta atualização na TV. Os testes de navegador da primeira versão não foram apresentados como uma nova execução desta atualização.

Evidências: `evidencias-audio-original-ptbr3/runtime-results.json` e `evidencias-audio-original-ptbr3/strict-filter-results.json`.

## Pacotes preparados

- Código: `StremioK-PTBR-2.2.8-ptbr.3-codigo.zip`.
- Módulo local: `stremiok-ptbr-local-2.2.8-ptbr.3.tgz` (não publicado no npm).
- WGT sem assinatura: `StremioK-PTBR-2.2.8-ptbr.3-unsigned.wgt`; versão numérica do widget 2.2.10.

O endereço no TizenBrew continua sendo `srwayne15-bot/StremioK-PTBR@main`. Será preciso reabrir o módulo e considerar a propagação dos caches. Nada foi instalado remotamente na TV.

Documentação consultada para a consulta opcional de metadados: [detalhes de séries no TMDB](https://developer.themoviedb.org/reference/tv-series-details) e [detalhes de filmes](https://developer.themoviedb.org/reference/movie-details).
