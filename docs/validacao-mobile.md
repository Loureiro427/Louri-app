# Validação mobile sem APK

## Correções

- Android passou de `adjustPan` para `adjustResize`. O teclado usa `resizeOnFullScreen` e o app acompanha `visualViewport` e os eventos nativos de exibição/ocultação. Quando o WebView já encolheu, a altura do teclado não é descontada uma segunda vez.
- O campo focado é rolado para a área visível. Com teclado aberto, o editor de refeição fica mais compacto e a navegação inferior sai do caminho. Janelas respeitam a altura disponível; isso cobre o caso de teclados Samsung sobrepondo campos.
- Voltar no Android prioriza teclado, janela mais interna, etapa do cadastro e navegação. Na Home, minimiza o app em vez de encerrar a atividade. Não interfere na exibição dos lembretes.
- `@capacitor/app` foi adicionado. O novo plugin e a configuração de teclado precisam entrar na próxima sincronização nativa feita pelo usuário. Não foi executado `cap sync`, Gradle, geração, instalação ou execução de APK nesta etapa.
- Sem internet, alimentação, água e histórico continuam locais. O suporte não tenta enviar se o navegador informa falta de conexão e mantém o rascunho de texto na sessão. Contato e consentimento não são reaproveitados ao reabrir o formulário. Rascunho é limpo após envio confirmado. Isso não implementa fila de envio automático.
- A chave `nutri-app-storage` foi mantida. Dados da versão 0 são migrados para a versão 1, preenchendo campos ausentes sem apagar histórico, plano, pesos, favoritos, alimentos personalizados, combinações ou sequência. O teste usa a reidratação real do Zustand, não apenas uma cópia de objetos.
- Tema claro e textos secundários ganharam contraste; os pares de tokens verificados ficam acima de 4,5:1. Controles principais têm áreas de toque maiores, campos em telas de toque evitam zoom por fonte pequena e foco de teclado fica visível.
- Auditoria de todas as dependências ficou em zero alertas conhecidos. Removido o gerador de ícones antigo que carregava `sharp` e `tar` legados; ícones e splash existentes não foram regenerados. O override de `uuid` em `xcode` preserva a API CommonJS `v4` utilizada pela ferramenta.

## O que os testes cobrem

1. Cálculo da altura com teclado sobreposto, WebView redimensionada e teclado fechado.
2. Pilha de Voltar: janela interna antes da tela e limpeza dos handlers ao desmontar.
3. Reidratação de uma instalação antiga preservando os dados existentes.
4. Água e refeições gravadas e reabertas sem rede; suporte sem solicitação de rede.
5. Rascunhos separados por canal e apagados após confirmação de envio.

Essas verificações não substituem a avaliação física do teclado e do botão Voltar.

## Confirmar no aparelho, quando houver uma atualização autorizada

| Cenário | Resultado esperado |
| --- | --- |
| Samsung, teclado aberto no nome, peso, quantidade e suporte | Campo/cursor visível; a área de conteúdo permite rolagem até o botão |
| Abrir e fechar teclado várias vezes; girar a tela com teclado aberto | Altura volta ao normal, sem espaço vazio ou campo encoberto |
| Voltar com teclado; Voltar com janela; Voltar na Home | Esconde teclado; fecha a camada atual; minimiza o app |
| Coleção de alimentos aberta sobre o editor | Primeiro Voltar fecha a coleção; o próximo fecha o editor |
| Modo avião | Registrar água e refeição, reabrir o app e conferir que os dados permanecem |
| Falha no envio do suporte | Erro claro e texto mantido para uma nova tentativa, sem envios automáticos |
| Atualizar sobre a instalação anterior, com a mesma assinatura | Perfil, histórico, sequência e plano preservados; não limpar dados nem desinstalar para testar atualização |
| Tema claro, fonte grande e TalkBack | Texto legível, foco identificável, campos nomeados e controles alcançáveis |

No navegador, a execução já carregada pode operar offline; reabrir a página web sem rede pela primeira vez não equivale a abrir o pacote Android, cujos arquivos são locais. Não foi acrescentado um service worker nem prometido cache offline da hospedagem web.

Referências: [Capacitor App](https://capacitorjs.com/docs/apis/app), [Capacitor Keyboard](https://capacitorjs.com/docs/apis/keyboard), [correção do uuid](https://github.com/advisories/GHSA-w5hq-g745-h8pq).
