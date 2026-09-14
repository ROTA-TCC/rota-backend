# Rota - Backend API

Este é o repositório do serviço de backend do projeto Rota, desenvolvido com NestJS e Prisma para atender ao sistema de mobilidade urbana (TCC).

## 1. Execução Local

Esta seção descreve como configurar o projeto diretamente em sua máquina.

### Pré-requisitos
*   **Node.js:** Versão 22 ou superior.
*   **Gerenciador de pacotes:** pnpm (recomendado).
*   **Banco de Dados:** PostgreSQL (conforme definido na URL de conexão do Prisma).

### Passo a passo
1.  **Configuração do Ambiente:**
    Certifique-se de configurar o arquivo `.env`.
    
2.  **Instalação de dependências:**
    Na raiz do projeto, execute:
    ```bash
    pnpm install
    ```

3.  **Geração do Prisma Client:**
    ```bash
    pnpm prisma generate
    ```

4.  **Iniciar em modo de desenvolvimento:**
    ```bash
    pnpm run start:dev
    ```

---

## 2. Execução com Docker

O projeto inclui um arquivo `Dockerfile` otimizado para produção, utilizando multi-stage build para reduzir o tamanho da imagem final.

### Pré-requisitos
*   **Docker:** Certifique-se de ter o Docker Desktop ou o motor do Docker instalado em sua máquina.

### Passo a passo
1.  **Construção da imagem:**
    No diretório raiz (onde está o Dockerfile), execute o comando para construir a imagem:
    ```bash
    docker build -t rota-backend .
    ```

2.  **Execução do container:**
    Após a construção, você pode rodar o container expondo a porta 3000:
    ```bash
    docker run -p 3000:3000 --env-file .env rota-backend
    ```

> **Nota:** Certifique-se de ter o arquivo ".env" correto no momento da execução.

---

## Estrutura do Projeto e Tecnologias
*   **Framework:** NestJS
*   **ORM:** Prisma
*   **Gerenciamento de pacotes:** pnpm
*   **Monitoramento:** Sentry
*   **Filas:** BullMQ (com Redis)
*   **Validação:** class-validator e class-transformer

## Scripts Disponíveis
*   `pnpm run build`: Compila o projeto para a pasta `dist`.
*   `pnpm run start:dev`: Inicia a aplicação em modo de observação (watch).
*   `pnpm run test`: Executa a suíte de testes com Jest.
*   `pnpm run lint`: Verifica a qualidade do código com ESLint.
