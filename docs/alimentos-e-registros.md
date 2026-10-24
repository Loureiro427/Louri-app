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

### Alimentos personalizados: apagar e personalizar

- Cada alimento tem as ações “Ícone ou foto” e “Apagar”, no registro e na biblioteca.
- Fotos JPG, PNG e WebP de até 15 MB são recortadas no centro e convertidas localmente para JPEG de 160 × 160 pixels; não há envio para servidor.
- Apagar exige confirmação, retira o alimento dos favoritos, preferências, porções do plano, memória de repetição e combinações. Combinações vazias são retiradas.
- A definição nutricional fica arquivada para permitir consultar e corrigir refeições anteriores sem alterar seus valores. Ela não aparece como uma opção nova do catálogo.
- As alterações de imagem e ícone são salvas automaticamente. Escolher um ícone substitui a foto.

### Unidades, medidas caseiras e edição

- Novos personalizados permitem escolher g ou ml. O campo legado `kcal100g` guarda energia por 100 da unidade declarada em `unidade`; os macros continuam em gramas por 100 dessa unidade. Ausência de unidade significa g, preservando os dados antigos. Não existe conversão automática de densidade entre g e ml.
- O registro, as combinações e a lista de compras exibem a unidade declarada. Bebidas geram ml/L nas compras.
- Ovos, pão francês, banana e maçã abrem em unidades; arroz e aveia em colheres; feijão em conchas. É possível voltar a gramas sem alterar a quantidade representada. As medidas caseiras são aproximações exibidas ao usuário.
- Açúcar refinado foi incluído com composição da [TACO 4, item 494](https://nepa.unicamp.br/wp-content/uploads/sites/27/2023/10/taco_4_edicao_ampliada_e_revisada.pdf). A colher de sopa cheia de 30 g usa a referência do [Manual de Contagem de Carboidratos da SBD, p. 46](https://www.sbp.com.br/fileadmin/user_upload/pdfs/Manual_Oficial_de_Contagem_decarboidratos.pdf); a estimativa fica visível e pode ser substituída por gramas.
- Editar um personalizado cria uma nova definição e arquiva a anterior, preservando ícone/foto. Favoritos, plano e combinações passam à nova definição; históricos mantêm a unidade e os valores anteriores. Ao repetir uma refeição antiga, a seleção usa a versão atual.
- Mantendo a unidade, as quantidades planejadas permanecem iguais. Ao trocar g/ml, mantém-se o número de porções de referência (ex.: duas porções de 30 g passam a duas porções de 200 ml). O formulário informa esse comportamento e pede conferir as quantidades.
- Fechar um formulário alterado pede confirmação para não perder o preenchimento.

### Bebidas do catálogo em ml

- Leite integral, café, café sem açúcar, chá, chá relaxante, vitamina e iogurte proteico de beber usam ml, mantendo seus IDs. Registro, combinações e compras reutilizam a unidade do catálogo.
- Essas entradas genéricas continuam sendo estimativas, agora identificadas por 100 ml. Os valores numéricos do catálogo foram mantidos; não se trata de uma conversão exata de densidade ou de valores de uma marca específica. Refeições já salvas não são regravadas nem recalculadas.
- Iogurte natural continua em g, com sua referência TACO por massa; a opção de beber está explicitamente identificada no preparo do iogurte proteico.
