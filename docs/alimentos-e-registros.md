# Alimentos e registros — outubro de 2026

## Experiência

- Busca ignora acentos, caixa, pontuação e ordem das palavras. Inclui pão de sal/cacetinho, bolacha e aipim/macaxeira. Mandioca, batata-doce, arroz cru e cozido são opções diferentes.
- Registrados recentemente vêm antes dos favoritos e das preferências. A consulta lê até 30 dias do histórico. Selecionar e favoritar não registra consumo.
- Meus alimentos abre pelo Perfil ou pela refeição. A pessoa consulta sua lista, adiciona pelo rótulo e pode salvar/usá-lo imediatamente, mantendo a seleção anterior. Combinações continuam em Refeições salvas.
- O formulário usa uma coluna do rótulo e o peso da porção em gramas. Converte para 100 g, aceita vírgula decimal e exige os quatro valores explícitos. Zero é válido. Não estima nutrientes pelo nome nem converte ml automaticamente em gramas.
- X, Escape, fundo da janela e Voltar nativo pedem confirmação se houver porções alteradas. Continuar mantém o preenchimento. Alimento ainda não salvo recebe a mesma proteção. Há beforeunload para recarga/fechamento do navegador, sujeito às regras dele. Voltar pelo histórico do navegador não é um bloqueador de rotas; não houve migração para Data Router.
- Compras consolida nomes equivalentes e unidades compatíveis. Quantidades desconhecidas, preparos e estados diferentes de comprado/em casa permanecem separados, para não marcar uma quantidade inteira como resolvida por engano. A aba Em casa dá acesso ao que saiu de Falta comprar.

## Notificações

Uma caixa de entrada em memória mantém o alvo até o Início estar montado e ativo. Foi removida a espera fixa de 100 ms. Um preenchimento aberto não é sobrescrito pelo aviso: o alvo aguarda.

Refeição concluída abre seu registro com explicação e opção de corrigir, sem registrar novamente. Refeição removida do plano apresenta orientação. Novos avisos Android carregam a data de origem; um aviso de ontem abre o histórico correspondente. Avisos antigos, sem data, mantêm compatibilidade.

Os campos nativos novos dependem da próxima versão Android compilada pelo usuário. Nenhum APK foi gerado, instalado ou executado.

## Catálogo

Os IDs antigos foram mantidos. Totais históricos já salvos continuam nos snapshots; novos registros e edições usam a referência atual e permitem revisão antes de salvar.

Fonte: [TACO, 4ª edição — NEPA/Unicamp](https://nepa.unicamp.br/wp-content/uploads/sites/27/2023/10/taco_4_edicao_ampliada_e_revisada.pdf). Foram conferidos arroz branco cozido/cru, aveia em flocos, feijão-carioca cozido, queijo Minas frescal, iogurte natural e mandioca cozida. Cada item guarda o número da referência. A [TBCA BRC0906B](https://www.tbca.net.br/base-dados/int_composicao_alimentos.php?n0REd3kv7e86D%2BViXWYUnQ%3D%3D=0yCVxiTAXoDyoY0%2F70demA%3D%3D) é a referência da tapioca pronta, sem manteiga e sem recheio.

Arroz cru e mandioca foram adicionados separadamente. O item que misturava batata e mandioca passa a identificar batata-doce; leite é separado de iogurte e legumes assados de cozidos. Demais receitas e marcas variáveis estão identificadas como estimativas. O catálogo inteiro ainda não deve ser apresentado como validado pela TACO/TBCA.

## Verificação

Testes JS cobrem regressões, busca, recentes, comparação de alterações, rótulo, persistência, zero kcal, caixa de entrada e destino de lembretes e consolidação de compras. TypeScript, ESLint e build web verificam a integração.

No navegador a 360 px foram conferidos busca por cacetinho, confirmação de saída, continuidade com valores mantidos, cadastro de cereal no perfil de teste e seleção da porção de 30 g sem registrar consumo.

Validar no aparelho, na próxima versão Android: toque com app fechado, refeição já registrada, aviso de ontem e Voltar com teclado aberto. Não houve geração de APK.
