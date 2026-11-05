# Instalação pelo GitHub module e atualizações

Destino autorizado: https://github.com/srwayne15-bot/StremioK-PTBR

Confira que o repositório público e seus arquivos estão acessíveis pelo CDN antes de adicionar o endereço na TV.

No TizenBrew, escolher **GitHub module** e informar:

`srwayne15-bot/StremioK-PTBR@main`

O campo espera usuário/repositório e uma referência opcional; não colar a URL completa do GitHub, o caminho de um ZIP nem o nome do pacote npm. O TizenBrew adiciona internamente o prefixo gh/ e busca package.json e arquivos por jsDelivr. A referência main acompanha esta ramificação; uma referência a um commit fixo manteria aquela versão.

## Como chegam melhorias

1. Alterar a cópia de desenvolvimento e executar os testes.
2. Publicar a melhoria na ramificação main do mesmo repositório. Uma edição apenas local não muda a TV.
3. Atualizar a versão do pacote e os parâmetros ?v= dos recursos para evitar o cache da TV; conferir também a política de cache do CDN.
4. Fechar e reabrir o módulo na TV. Não é uma atualização instantânea da tela que já está aberta.
5. Se o serviço mudou, reiniciar o serviço/TizenBrew: o código do TizenBrew reaproveita serviços já em execução e não recarrega um serviço saudável em toda abertura do módulo.

Não é necessário adicionar um novo módulo para cada melhoria mantida na mesma referência. Cache do CDN e do navegador pode atrasar a chegada dos arquivos; não há garantia de atualização imediata. Uma implantação deve conferir todos os arquivos no CDN antes de anunciar a atualização, para reduzir o risco de misturar recursos de versões diferentes.

O original permanece um módulo separado. Não alterar o prefixo stremiokptbr., banco stremiokptbr, IDs WGT ou portas como parte de uma atualização comum, pois isso pode fazer a versão parecer uma instalação nova. O TizenBrew mantém a cota compartilhada e o acesso entre módulos.

Fontes conferidas: [carregador de módulos](https://github.com/reisxd/TizenBrew/blob/main/tizenbrew-app/TizenBrew/service-nextgen/service/utils/moduleLoader.js), [proxy e ciclo dos serviços](https://github.com/reisxd/TizenBrew/blob/main/tizenbrew-app/TizenBrew/service-nextgen/service/index.js), [carregador do serviço](https://github.com/reisxd/TizenBrew/blob/main/tizenbrew-app/TizenBrew/service-nextgen/service/utils/serviceLauncher.js).
