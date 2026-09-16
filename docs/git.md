# Guia Prático de Git e Workflow de Desenvolvimento

Este guia foi elaborado para padronizar o uso do **Git** na equipe, garantindo um histórico limpo, um fluxo de trabalho organizado e um processo de colaboração eficiente.

---

## 📌 Sumário
1. [Fluxo de Branches e Criação de Tarefas](#1-fluxo-de-branches-e-criação-de-tarefas)
2. [Adicionando e Commitando Alterações (`git add` e `git commit`)](#2-adicionando-e-commitando-alterações-git-add-e-git-commit)
3. [Buscando e Atualizando Código (`git fetch` vs `git pull`)](#3-buscando-e-atualizando-código-git-fetch-vs-git-pull)
4. [Entendendo os Tipos de `git pull` (Merge vs Rebase)](#4-entendendo-os-tipos-de-git-pull-merge-vs-rebase)
5. [Passo a Passo do Workflow Recomendado](#5-passo-a-passo-do-workflow-recomendado)
6. [Abrindo um Pull Request (PR) na branch `development`](#6-abrindo-um-pull-request-pr-na-branch-development)
7. [Resumo de Comandos Úteis (Cheat Sheet)](#7-resumo-de-comandos-úteis-cheat-sheet)

---

## 1. Fluxo de Branches e Criação de Tarefas

### ⚠️ Regra de Ouro: NUNCA desenvolva diretamente na `development` ou `main`.
A branch `development` é a nossa branch principal de integração. Todo desenvolvimento deve ocorrer em **branches secundárias (feature branches)** criadas a partir do estado mais recente da `development`.

### Padronização de Nomes de Branch
Utilize prefixos para identificar o tipo de trabalho:
- `feature/nome-da-funcionalidade` (ex: `feature/login-google`)
- `fix/descricao-do-bug` (ex: `fix/erro-calculo-frete`)
- `refactor/descricao` (ex: `refactor/autenticacao-jwt`)
- `docs/nome-do-doc` (ex: `docs/atualiza-readme`)

### Como Criar uma Nova Branch
Certifique-se de estar na `development` atualizada e crie sua branch:

```bash
# 1. Garanta que está na branch development
git checkout development

# 2. Baixe as últimas atualizações
git pull origin development

# 3. Crie e mude para a sua nova branch (usando checkout ou switch)
git checkout -b feature/minha-nova-feature
# OU
git switch -c feature/minha-nova-feature
```

---

## 2. Adicionando e Commitando Alterações (`git add` e `git commit`)

Após fazer alterações no código, você precisa salvá-las no histórico do Git em duas etapas: **Staging Area** e **Commit**.

### A. Verificando o Status (`git status`)
Antes de qualquer ação, veja o status dos seus arquivos modificados e não rastreados:
```bash
git status
```

### B. Adicionando Arquivos (`git add`)
O comando `git add` envia as modificações para a *Staging Area* (preparação para o commit).

- **Adicionar um arquivo específico:**
  ```bash
  git add caminho/do/arquivo.js
  ```
- **Adicionar todos os arquivos alterados do diretório atual:**
  ```bash
  git add .
  ```

> 💡 **Dica:** Evite usar `git add .` sem conferir o `git status` antes. Certifique-se de que não está adicionando arquivos temporários, senhas ou configurações locais.

### C. Criando o Commit (`git commit`)
O commit salva o snapshot das alterações preparadas com uma mensagem explicativa.

```bash
git commit -m "tipo: descrição clara e sucinta da alteração"
```

#### Boas Práticas de Mensagens de Commit (Conventional Commits)
Recomendamos o uso de prefixos padronizados nas mensagens:
- `feat:` Nova funcionalidade (`feat: adiciona botão de exportação para PDF`)
- `fix:` Correção de bug (`fix: corrige validação no campo de e-mail`)
- `docs:` Alterações na documentação (`docs: atualiza guia do Git`)
- `style:` Formatação de código sem alteração de regra de negócio (`style: ajusta identação`)
- `refactor:` Refatoração de código sem mudar comportamento (`refactor: simplifica lógica da API`)
- `test:` Adição ou ajuste de testes (`test: adiciona teste unitário no login`)

---

## 3. Buscando e Atualizando Código (`git fetch` vs `git pull`)

Compreender a diferença entre `git fetch` e `git pull` é fundamental para evitar conflitos desnecessários.

```
                  +-----------------------+
                  |  Repositório Remoto   |
                  +-----------------------+
                    /                   \
        git fetch  /                     \ git pull
                  v                       v
      +-----------------------+   +-----------------------+
      |  Referências Remotas  |   | Código Local Atualizado|
      |  (origin/development) |   | (Merge automático)     |
      +-----------------------+   +-----------------------+
                  |
      git merge   v
      +-----------------------+
      |  Working Directory    |
      +-----------------------+
```

### `git fetch`
- **O que faz:** Baixa todos os commits, arquivos e referências do repositório remoto para o seu Git local, **sem alterar nada** nos seus arquivos de trabalho atuais.
- **Quando usar:** Quando você quer verificar o que mudou no servidor remoto sem arriscar bagunçar seu código local.
- **Comando:**
  ```bash
  git fetch origin
  ```

### `git pull`
- **O que faz:** Faz um `git fetch` e, em seguida, executa automaticamente a integração (por padrão, um `git merge`) das alterações remotas na sua branch atual.
- **Quando usar:** Quando você quer sincronizar rapidamente sua branch com o servidor.
- **Comando:**
  ```bash
  git pull origin development
  ```

---

## 4. Entendendo os Tipos de `git pull` (Merge vs Rebase)

Ao executar um `git pull`, o Git precisa integrar as novidades remotas com os commits que você fez localmente. Existem duas abordagens principais:

### 1. `git pull` Padrão (Merge Strategy)
- **Como funciona:** Junta o histórico remoto e o local criando um **commit de merge** (`Merge branch 'development' of...`).
- **Resultado:** Mantém a estrutura exata do que aconteceu, mas gera diversos "commits de merge" no histórico, tornando o gráfico do repositório ramificado e poluído.
- **Comando:**
  ```bash
  git pull origin development
  ```

### 2. `git pull --rebase` (Rebase Strategy) — *Recomendado para Branches de Feature*
- **Como funciona:** O Git "desconecta" temporariamente os seus commits locais, aplica as novidades vindas do repositório remoto no topo da branch e, em seguida, reaplica os seus commits um a um por cima.
- **Resultado:** Gera um **histórico 100% linear, limpo e legível**, sem commits desnecessários de merge.
- **Comando:**
  ```bash
  git pull --rebase origin development
  ```

#### Comparativo Visual:
```text
Com MERGE (Histórico ramificado):
A --- B --- C (development remoto)
 \         \
  D --- E --- F (Sua branch + Commit de Merge)

Com REBASE (Histórico linear e limpo):
A --- B --- C (development remoto) --- D' --- E' (Seus commits reaplicados)
```

> ⚠️ **Configuração Global Útil:** Para definir o `rebase` como comportamento padrão do `git pull`:
> ```bash
> git config --global pull.rebase true
> ```

---

## 5. Passo a Passo do Workflow Recomendado

Siga este fluxo diário no seu trabalho de desenvolvimento:

1. **Início do dia / Início da tarefa:**
   ```bash
   git checkout development
   git pull origin development
   git checkout -b feature/nome-da-sua-tarefa
   ```

2. **Durante o desenvolvimento:**
   ```bash
   # Verifique o status
   git status

   # Adicione as alterações
   git add .

   # Faça o commit
   git commit -m "feat: implementa tela de cadastro"
   ```

3. **Antes de enviar seu código (Sincronização com a `development`):**
   ```bash
   # Baixe as alterações mais recentes da development remota
   git fetch origin

   # Aplique seus commits no topo da development atualizada
   git rebase origin/development
   ```
   *(Caso ocorram conflitos durante o rebase, resolva-os nos arquivos, execute `git add .` e continue com `git rebase --continue`).*

4. **Enviar para o repositório remoto:**
   ```bash
   git push origin feature/nome-da-sua-tarefa
   ```

---

## 6. Abrindo um Pull Request (PR) na branch `development`

Depois de subir sua branch com `git push`:

1. **Acesse a plataforma de Git** (GitHub, GitLab, Bitbucket ou Azure DevOps).
2. **Localize o aviso de nova branch** ou vá até a aba de **Pull Requests** e clique em **New Pull Request**.
3. **Configure as Branches:**
   - **Base branch (Destino):** `development`
   - **Compare branch (Origem):** `feature/nome-da-sua-tarefa`
4. **Preencha o Título e a Descrição do PR:**
   - **Título:** Claro e conciso (ex: `[feat] Implementação da autenticação JWT`).
   - **Descrição:**
     - O que foi feito nesta tarefa?
     - Como testar?
     - Screenshots ou GIFs demonstrando a funcionalidade (se aplicável).
     - ID do card/tarefa no Jira/Trello/ClickUp.
5. **Solicite Revisão (Code Review):**
   - Marque pelo menos **1 ou 2 colegas de equipe** para revisarem o código.
   - Aguarde as aprovações antes de realizar o Merge (que geralmente é feito após aprovação da pipeline de CI/CD).

---

## 7. Resumo de Comandos Úteis (Cheat Sheet)

| Ação | Comando |
| :--- | :--- |
| **Trocar de branch** | `git checkout <nome-da-branch>` ou `git switch <nome-da-branch>` |
| **Criar e entrar na nova branch** | `git checkout -b <nome>` ou `git switch -c <nome>` |
| **Verificar estado das alterações** | `git status` |
| **Adicionar alterações para staging** | `git add <arquivo>` ou `git add .` |
| **Criar um commit** | `git commit -m "tipo: mensagem"` |
| **Buscar referências remotas sem alterar arquivos** | `git fetch origin` |
| **Atualizar branch com rebase (histórico limpo)** | `git pull --rebase origin development` |
| **Enviar branch para o servidor** | `git push origin <nome-da-branch>` |
| **Ver histórico de commits** | `git log --oneline --graph` |
| **Desfazer alterações locais num arquivo** | `git checkout -- <arquivo>` ou `git restore <arquivo>` |