# Ajustes de pré-lançamento

## Comportamento desta versão

- Sem Supabase, conta ou sincronização online. A integração antiga pode ser consultada no commit `a751b89`; não integra esta versão nem suas dependências.
- Avaliação por estrelas preservada, conforme decisão do usuário.
- Suporte e sugestões continuam enviando diretamente ao Discord, por decisão do usuário. O formulário informa o destino e exige confirmação antes do envio. Somente mensagem e contato opcional são enviados; dados do perfil e de saúde não são anexados.
- O envio aguarda a confirmação do Discord, limita mensagens simultâneas e aplica um intervalo local de 30 minutos após o sucesso. Uma falha mantém o texto para tentar novamente. Timeout significa envio não confirmado, não garantia de que a mensagem foi descartada.
- Webhooks ficam em `.env.local`, ignorado pelo Git, com os nomes do `.env.example`. Em outro checkout, copie o exemplo e configure os dois canais antes de disponibilizar o suporte. Variáveis `VITE_*` são incluídas no app distribuído: isso não torna os webhooks secretos e o intervalo local não substitui proteção no servidor. O histórico do Git também contém os endereços antigos. A migração para um serviço protegido fica para uma versão futura.
- Peso usa os mesmos limites de 30 a 300 kg no cadastro, atualização, histórico e ações da loja. Valores fora dos limites não alteram os dados.
- Proteção de falhas cobre a estrutura principal e cada aba. As abas são carregadas na primeira visita e preservadas depois. Falhas exibem opções de tentar novamente ou voltar ao início, sem apagar dados.
- Formatação numérica reutiliza instâncias de `Intl.NumberFormat`, e os formulários não dependem mais de efeitos para sincronizar seus estados iniciais.

## Validação sem APK

```powershell
npx tsc -p tsconfig.app.json --noEmit
npx eslint src
npm test
npm audit --omit=dev
```

Os testes de suporte simulam a rede e não enviam mensagens reais ao Discord.

A atualização compatível das dependências corrigiu os alertas que tinham solução automática. A auditoria de produção ficou sem alertas. A auditoria completa ainda identifica 7 vulnerabilidades na cadeia de ferramentas de desenvolvimento do Capacitor (`@capacitor/assets`, `sharp`, `tar`, `xcode`, `uuid` e dependentes), sem solução automática compatível. Não foram forçadas versões incompatíveis dessas ferramentas; elas não devem ser tratadas como uma auditoria completamente limpa.

Não houve geração, instalação nem execução de APK nesta etapa. Testes no aparelho e a distribuição continuam dependendo de autorização explícita.

Referência para a confirmação de entrega e bloqueio de menções: [Discord — Execute Webhook](https://docs.discord.com/developers/resources/webhook#execute-webhook).
