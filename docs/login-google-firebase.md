# Google e salvamento no Louri

Implementação e configuração de 26/10/2026. Projeto Firebase `louri-fit-auth`, plano Spark, sem conta de faturamento, Analytics, Functions ou Storage.

## Experiência

- Continuar sem conta mantém o uso local e os dados existentes. Não inicializa Firebase.
- Entrar com Google está disponível na abertura e no Perfil. No navegador usa popup; no Android usa o plugin nativo e autentica o SDK JavaScript com o ID token retornado.
- Perfil, medidas, alimentos personalizados (sem fotos), preferências, água, refeições e histórico são salvos automaticamente. Fotos e autorização de notificações ficam no aparelho.
- Alterações são agrupadas por cinco segundos. Retorno ao app e reconexão também sincronizam. Falhas temporárias têm tentativas automáticas progressivas, limitadas para preservar a cota gratuita. Erros de permissão/configuração e cota não entram em repetição.
- O Perfil mostra o estado do salvamento, sem botão manual de sincronização.
- O perfil sem conta e cada UID têm caches separados. Sair restaura o visitante sem apagar o cache da conta. A tela só abre depois de conferir a sessão; páginas em memória são desmontadas ao trocar de conta.
- Em uma conta nova, o perfil local pode ser adotado, como informado antes da entrada. Se já houver dados diferentes, o usuário escolhe qual versão usar. A substituição exige confirmação e preserva uma cópia local anterior. Um aparelho sem perfil recupera automaticamente a conta existente.
- Excluir minha conta do Louri exige confirmação e reautenticação Google. Apaga o documento sincronizado, a identidade Firebase e o cache dessa conta neste aparelho. Não apaga a conta Google ou o perfil visitante. Não remove caches de outros aparelhos remotamente.

## Persistência e limites

O documento `users/{uid}/state/current` tem schema, revisão, payload JSON e timestamp do servidor. Transações com revisão impedem sobrescrita silenciosa entre aparelhos. Uma sessão antiga não recria automaticamente um documento previamente removido.

O payload usa uma lista explícita de campos, remove imagens recursivamente e tem limite de 800.000 bytes, abaixo do limite do documento. Se um histórico atingir esse tamanho, o app informa que ele permanece local. Não há sincronização ilimitada nem cobrança automática: o projeto permanece Spark e trata erros de cota mantendo os dados locais.

`nutri-app-storage` continua sendo o perfil ativo por compatibilidade. `louri-active-account` indica o proprietário e `louri-account:{owner}` guarda seu cache, revisão e versão já enviada. Esses dados locais dependem do armazenamento do navegador/WebView; não são criptografados separadamente pelo app. Limpar os dados ou remover o app pode apagar caches, alterações não enviadas e fotos.

Firestore usa cache em memória; não mantém um segundo banco persistente compartilhado entre contas. A recuperação offline usa somente o cache separado do próprio UID.

## Configuração publicada

- Provedor Google ativado, mediante confirmação do proprietário.
- Firestore Standard `(default)` criado em `southamerica-east1` (São Paulo), inicialmente bloqueado.
- `firestore.rules` publicadas mediante confirmação: somente o próprio UID autenticado via Google pode obter/criar/atualizar/apagar seu documento. Listagens e outros caminhos são negados. Escritas validam campos, schema, revisão e timestamp.
- App web: Louri Web. App Android: Louri Android, pacote `com.loureiro.louri`.
- SHA-1 de desenvolvimento deste computador cadastrada mediante confirmação. Não foi criada nova chave de assinatura.
- `localhost` já consta nos domínios autorizados. Usar `http://localhost:4173` no preview ou `http://localhost:5173` no Vite. `127.0.0.1`, domínios de terceiros e publicação web precisam ser autorizados separadamente, se utilizados.
- A configuração pública está em `src/services/firebaseClient.ts` e `android/app/google-services.json`. O JSON Android foi montado com os IDs e a chave pública exibidos pelo console, pois o download pelo navegador integrado não disponibilizou um arquivo. Não contém segredo OAuth, chave privada nem conta de serviço. As regras e autenticação protegem os dados.
- Plugin nativo registrado por `cap update android`; Google habilitado em `android/variables.gradle`, com `skipNativeAuth` e provedor Google em `capacitor.config.ts`.

## Validação

```powershell
npm test
npm run test:firebase
npm run build
npx eslint src scripts/test-firebase.mjs capacitor.config.ts
npm audit
```

`test:firebase` inicia somente o emulador Firestore com projeto `demo-louri-test`; a autenticação é simulada no transporte de teste. Não usa dados ou identidades reais. Java precisa estar no PATH. Os testes cobrem regras, fotos locais, limites, salvamento automático, offline, conflitos, saída, troca de conta, reautenticação na exclusão e prevenção de recriação por sessão antiga.

No teste web com o proprietário, o Perfil confirmou conta Google conectada e “Tudo salvo na sua conta”. O fluxo Android ainda precisa ser validado no aparelho. Nenhum APK foi gerado, instalado ou executado para esta integração.

Validação concluída: 83 testes do app e 19 testes de Firebase, build web e ESLint aprovados; `npm audit` sem vulnerabilidades. Após recarregar o navegador, sessão e dados foram recuperados e o salvamento automático permaneceu confirmado, sem botão de sincronização. Perfil validado em 360 px sem transbordamento horizontal.

## Antes da Play Store

1. Cadastrar no Firebase a SHA-1 da chave de assinatura de apps da Play Store, obtida na própria Play Console. Se houver outra assinatura de testes/release, cadastrar a impressão correspondente. A assinatura debug deste computador não cobre a versão distribuída pela loja.
2. Validar entrada, reabertura offline, retorno online, troca de conta e exclusão em aparelho físico, em uma compilação autorizada pelo proprietário.
3. Atualizar as declarações de coleta/armazenamento e o endereço público de privacidade na Play Console para refletir os dados de perfil e saúde sincronizados. Publicar o caminho externo de solicitação de exclusão exigido para a distribuição com conta; a exclusão dentro do app já está implementada.
4. Autorizar o domínio web definitivo se também houver uma versão pública no navegador.

## Referências

- [Firebase: Google no JavaScript](https://firebase.google.com/docs/auth/web/google-signin)
- [Capawesome: autenticação Firebase](https://capawesome.io/docs/sdks/capacitor/firebase/authentication/)
- [Firebase: configuração Android e recursos](https://firebase.google.com/docs/android/google-services-plugin-and-file)
- [Google Play: requisitos de exclusão de contas](https://support.google.com/googleplay/android-developer/answer/13327111?hl=en)
