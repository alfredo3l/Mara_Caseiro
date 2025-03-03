# Diretrizes de Interação com Github

⚠️ **AVISO CRÍTICO**
A URL definida neste documento (URL_OFICIAL_DO_PROJETO) é a ÚNICA URL CORRETA e fonte da verdade.
Se a URL remota do seu repositório estiver diferente, é a URL remota que DEVE ser corrigida, NUNCA o contrário.

## Repositório Oficial do Projeto
URL_OFICIAL_DO_PROJETO="https://github.com/alfredo3l/Mara_Caseiro"

## DIRETRIZES FUNDAMENTAIS:

1. **HIERARQUIA E VERIFICAÇÃO DA URL DO REPOSITÓRIO:**
   - A URL_OFICIAL_DO_PROJETO definida acima é IMUTÁVEL e só pode ser alterada por decisão explícita de mudança do projeto
   - NUNCA altere a URL_OFICIAL_DO_PROJETO para corresponder à URL remota
   - Antes de QUALQUER operação Git, o sistema DEVE verificar se a URL remota corresponde à URL_OFICIAL_DO_PROJETO
   - Se a URL remota estiver diferente, ela DEVE ser corrigida AUTOMATICAMENTE para URL_OFICIAL_DO_PROJETO

2. **PROCESSO DE VERIFICAÇÃO OBRIGATÓRIO:**
   ```bash
   # 1. Verificar URL atual do remoto
   REMOTE_URL=$(git remote get-url origin 2>/dev/null)

   # 2. Comparar com URL oficial do projeto
   if [ "$REMOTE_URL" != "$URL_OFICIAL_DO_PROJETO" ]; then
       echo "⚠️ ATENÇÃO: URL remota incorreta detectada!"
       echo "URL Atual: $REMOTE_URL"
       echo "URL Oficial: $URL_OFICIAL_DO_PROJETO"
       
       # 3. Corrigir automaticamente a URL remota para corresponder à oficial
       git remote remove origin 2>/dev/null
       git remote add origin "$URL_OFICIAL_DO_PROJETO"
       echo "✓ URL remota corrigida automaticamente para: $URL_OFICIAL_DO_PROJETO"
   fi
   ```

⚠️ **IMPORTANTE:** Esta verificação é OBRIGATÓRIA e deve ser executada ANTES de qualquer operação de envio.

## Tipos de commits:

1. Primeiro commit do projeto:
    - Usar mensagem: "feat: initial commit - project setup"
2. Commits subsequentes:
    - Seguir o padrão: "tipo: descrição breve"
    - Tipos comuns:
        - feat (nova funcionalidade)
        - fix (correção)
        - docs (documentação)
        - style (formatação)
        - refactor (refatoração)
        - test (testes)
        - chore (tarefas)

## Processo de Envio de Alterações:

1. **VERIFICAÇÃO INICIAL OBRIGATÓRIA:**
   - Executar verificação da URL do repositório conforme processo acima
   - NUNCA prosseguir se a URL remota não corresponder à URL_OFICIAL_DO_PROJETO
   - Corrigir a URL remota se necessário

2. Verificar configuração Git e autenticação:
    ```bash
    # Verificar configuração Git
    git config --get user.name
    git config --get user.email
    
    # Se não estiver configurado, configurar:
    # git config --global user.name "Seu Nome"
    # git config --global user.email "seu@email.com"
    ```
    
3. Verificar login Github:
    ```bash
    gh auth status
    # Se não estiver logado:
    # gh auth login
    ```
    
4. Verificar status das alterações:
    ```bash
    git status
    ```
    
5. Se houver alterações:
    ```bash
    # Adicionar alterações
    git add .
    
    # Criar commit com mensagem descritiva
    git commit -m "tipo: descrição das alterações"
    
    # Enviar para o repositório remoto
    git push origin main
    ```

## Regras para Mensagens de Commit:
- Antes de criar um commit, verificar arquivos alterados com `git status`
- Criar mensagem descritiva e breve
- Para alterações menores, usar um único commit
- Para alterações maiores, separar em commits lógicos

## Casos Especiais:
Se for explicitamente solicitado trabalhar em outra branch:

1. Criar nova branch: `git checkout -b nome-da-branch`
2. Fazer alterações necessárias
3. Seguir processo normal de commit
4. Criar PR para main quando solicitado

## Criação de PR (SOMENTE quando solicitado):
`gh pr create --title "Título aqui..." --body "Descrição das alterações"`

- Mensagem do PR deve ser única, sem quebras de linha
- Descrever todas as alterações de forma clara e concisa

Esta versão enfatiza que:
1. Por padrão, todas as alterações devem ser feitas diretamente na branch `main`
2. Só devemos criar branches específicas quando explicitamente solicitado
3. O processo é simplificado para focar no fluxo direto com a main
4. PRs só devem ser criados em casos especiais quando explicitamente solicitado
5. Os comandos são mais diretos e focados no trabalho com a main