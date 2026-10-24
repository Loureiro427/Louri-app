# Uso simples no Louri

O visual mantém o tema, as cores, a tipografia e os componentes existentes. Nenhuma biblioteca nova, animação contínua ou imagem foi adicionada.

- O Início oferece um tutorial de quatro dicas. Abrir o tutorial não registra água, comida ou peso. A pessoa pode dispensar, voltar ou concluir, e rever em Perfil → Como usar o Louri. O convite não volta a aparecer após dispensar ou concluir.
- Dicas curtas explicam plano versus consumo, medidas e correções do histórico. Cada uma pode ser dispensada separadamente e continua dispensada ao reabrir o app.
- Repetir última preenche porções para revisão, sem salvar consumo automaticamente. Também recupera uma combinação do histórico quando versões antigas não tinham a memória de porções. Alimentos inexistentes são ignorados; combinações com porções válidas são preservadas.
- Medida caseira permite escolher quantidade, meio de unidade e atalhos. Alternar para gramas não muda a porção. Os gramas permanecem como unidade de armazenamento e cálculo. Não se atribui medida automaticamente a alimentos personalizados ou a nomes apenas parecidos.
- O resumo semanal mostra dias com registros, refeições e média de água nos dias com registros de água ou refeições. Explica o denominador: um dia sem registro não é interpretado como ausência de consumo. Cada barra abre os registros daquele dia. As correções de dias anteriores existentes continuam sem reescrever os totais de hoje.
- Preferências por refeição continuam no Perfil. A notificação Android recebe a ação **Adiar 15 min**, tratada por receptor nativo, sem depender do JavaScript aberto. O adiamento é persistido, recuperado ao reiniciar e cancelado quando a preferência é desativada ou a refeição/meta já está concluída no plano nativo. Respeita silêncio e expira após atraso excessivo ou mudança de dia. Há um único adiamento pendente, correspondente ao aviso que a pessoa adiou mais recentemente, coerente com a única notificação de rotina exibida pelo app.

## Medidas aproximadas

As estimativas anteriores de pão (50 g), ovo (50 g), banana (80 g), maçã (130 g), arroz (25 g) e aveia (15 g) foram mantidas, agora com descrição explícita e quantidade ajustável. Frutas e ovos são identificados pelo peso de referência, sem prometer que toda unidade tem esse tamanho. A interface explica que tamanhos variam e permite ajustar em gramas. Arroz refere-se ao alimento cozido; aveia, a flocos.

Referências consultadas para utensílios: [TBCA — aveia, flocos finos, BRC0026A](https://www.tbca.net.br/base-dados/int_composicao_alimentos.php?n0REd3kv7e86D%2BViXWYUnQ%3D%3D=QUeZqwcspWYPvRv8B7RJzQ%3D%3D) indica colher de sopa cheia de 15 g; a [tabela histórica de porções da Anvisa](https://anvisalegis.datalegis.net/action/ActionDatalegis.php?acao=abrirTextoAto&codTipo=&cod_menu=1696&cod_modulo=134&desItem=&desItemFim=&numeroAto=00000039&orgao=RDC%2FDC%2FANVISA%2FMS&pesquisa=true&seqAto=000&tipo=RDC&valorAno=2001) registra colher de sopa de arroz cozido de 25 g. A concha média de feijão de 120 g é uma aproximação baseada em [Nutrição e sabor, UFRN](https://repositorio.ufrn.br/jspui/bitstream/123456789/21445/3/Nutricao%20e%20sabor%20%28livro%20digital%29.pdf), que usa essa equivalência para feijão-carioca. Os valores não são recomendações de quanto comer e não alteram a composição nutricional do catálogo.

## Validação

- Testes JS de regressão, repetição sem duplicar consumo, memória e histórico, medidas compatíveis e persistência de dicas/tutorial.
- Testes Java do relógio, incluindo 15 minutos, entrega antecipada, expiração e silêncio após adiar.
- Compilação isolada de ReminderEngine, ReminderReceiver e ReminderClock com javac, Android SDK e AndroidX locais. MainActivity e R são apenas símbolos mínimos de teste; isso não substitui uma compilação ou teste de integração Android.
- Navegador: tutorial, medidas de ovo (2× = 100 g), campo com teclado simulado e acesso pelo Perfil; sem salvar refeições de teste no perfil existente.

Não foi gerado, instalado ou executado APK. A ação nativa só estará disponível numa futura versão Android compilada pelo usuário. Antes de lançar, validar no aparelho: expandir aviso → Adiar; fechar app; conferir entrega, horário de silêncio, desativação de preferência, registro da refeição e reinício do aparelho.
