# Revisão para lançamento — 24/10/2026

Revisão de código, build web e interface, preservando o visual e os dados do Louri. Nenhum APK foi gerado, instalado ou executado. Nenhuma publicação ou mensagem real de suporte foi enviada.

## Melhorias entregues

- Bebidas aceitam ml, copos e xícaras. O tamanho do recipiente pode ser ajustado por alimento; alterar a capacidade mantém o número de recipientes e recalcula o total. Valores inválidos e totais acima do limite são recusados.
- A medida preferida e as capacidades ficam salvas no aparelho. Ao selecionar novamente um alimento, a porção inicial respeita a medida escolhida. Edição e exclusão de personalizados transferem ou retiram a preferência correspondente.
- Quantidades aceitam vírgula decimal e setas do teclado. Trocar a medida preserva a quantidade real e as calorias.
- Telas com pouca altura têm cabeçalho compacto, área de conteúdo rolável e botão de salvar acessível.
- Ampliação da página liberada; o cálculo da área visível distingue zoom de teclado. O tutorial agora usa os nomes atuais dos controles.
- Favicon do Louri e ícones de instalação web incluídos no build. Os arquivos originais eram PNG com extensão WebP; as cópias públicas têm extensão, MIME e dimensões conferidos. O manifesto usa caminhos relativos.
- ESLint ignora artefatos Android já gerados, mantendo a revisão do código-fonte.

## Validações executadas

| Verificação                                                     | Resultado                                                                                                                                                                                          |
| --------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `npm test`                                                      | 83 verificações aprovadas: cálculos, horários, histórico, sequência, busca, compras, personalizados, lembretes, persistência, funcionamento sem internet em testes de lógica/store e novas medidas |
| `npx eslint .`                                                  | Aprovado                                                                                                                                                                                           |
| `npm run build`                                                 | TypeScript e build web aprovados                                                                                                                                                                   |
| `npm audit` e `npm audit --omit=dev`                            | Nenhuma vulnerabilidade conhecida reportada                                                                                                                                                        |
| JUnit de `ReminderClockTest`, compilado diretamente com `javac` | 7 testes aprovados; não executou Gradle nem empacotamento Android                                                                                                                                  |
| Build servido localmente em modo produção                       | Tela inicial e botão “Começar Agora” abriram o cadastro; sem aceitar termos nem finalizar um novo perfil                                                                                           |
| Arquivos do build via HTTP local                                | Manifesto, 7 ícones PNG e assets iniciais disponíveis com formatos corretos                                                                                                                        |
| Início, Plano, Evolução e Perfil em 320 × 720                   | Carregaram sem erros de console ou transbordamento lateral dos cartões/páginas                                                                                                                     |
| Registro em 640 × 360                                           | Conteúdo rolável e botão de salvar dentro da área visível                                                                                                                                          |
| Formulário existente em 320 × 420                               | Campo de nome focado entre 185 e 219 px, dentro da área visível; saiu sem salvar alterações                                                                                                        |
| Copos e vírgula pela interface                                  | 1,5 copo de 300 ml resultou em 450 ml; preferência de copo de 300 ml permaneceu após recarregar                                                                                                    |
| Capacidade inválida pela interface                              | 0 ml recusado, preservando a capacidade anterior                                                                                                                                                   |
| Tutorial                                                        | Quatro dicas revisadas pela interface                                                                                                                                                              |

Os testes de interface usaram o perfil local “Teste Louri”. Não registraram consumo de refeições. O comportamento offline coberto pelos testes de lógica não equivale a um teste de recarregar o site sem rede: o build Android usa assets locais, e não foi criado um novo serviço de cache web.

## Conferência necessária em aparelho físico

Estas etapas não foram executadas nesta revisão e continuam necessárias antes de publicar:

1. No Samsung e no Redmi Note 12, abrir campos de nome, quantidade, alimentos personalizados e suporte com teclado visível; conferir o campo focado e os botões. Repetir com fonte ampliada nas configurações do Android e, se possível, TalkBack.
2. Usar o aplicativo instalado em modo avião, registrar água e refeição, fechar e reabrir; conferir a persistência. Não é necessário enviar suporte para fazer esse teste.
3. Conferir um lembrete agendado com o app em segundo plano e fechado, depois de reiniciar o aparelho e após mudança de horário. JUnit valida o relógio, não a entrega pelo Android ou suas restrições de bateria.
4. Selecionar uma foto real da galeria no aparelho e conferir retorno ao formulário.

Não se deve interpretar a aprovação do build web e dos testes como validação de um APK ou autorização para publicá-lo. A avaliação da Play Store, login, backup/exportação e Supabase permaneceram fora destas alterações.
