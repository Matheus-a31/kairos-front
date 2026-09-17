# Kairós - Frontend

Este é o frontend da aplicação Kairós, construído utilizando **Angular 18** e **Angular Material**.

## Pré-requisitos

- **Node.js** (v18 ou superior recomendado)
- **NPM** ou **Yarn**
- **Angular CLI** (\`npm install -g @angular/cli\`)

## Configuração do Ambiente (.env)

O projeto suporta o uso de variáveis de ambiente usando um arquivo \`.env\`.
Para começar, crie um arquivo \`.env\` na raiz da pasta \`frontend/\` com o seguinte conteúdo:

\`\`\`env
API_URL=http://localhost:8080
\`\`\`

> **Aviso:** Antes de iniciar a aplicação (seja em modo de desenvolvimento ou build de produção), o script automático gerará o arquivo de configuração \`environment.ts\` e \`environment.prod.ts\` baseado nas variáveis contidas no \`.env\`. Não commite estes arquivos para o seu repositório remoto caso contenham chaves sensíveis!

## Como rodar o projeto localmente

1. Abra o terminal na pasta do frontend:
   \`cd frontend\`

2. Instale as dependências:
   \`npm install\`

3. Inicie o servidor de desenvolvimento:
   \`npm start\`

O Angular será executado em \`http://localhost:4200/\`. O projeto intercepta automaticamente todas as chamadas para a API (rotas iniciadas em \`/api\`) e as envia para o URL configurado no \`.env\`.

## Build para Produção

Para compilar a aplicação para o ambiente de produção:

\`\`\`bash
npm run build
\`\`\`

Os arquivos otimizados serão gerados dentro do diretório \`dist/frontend/browser\`.
Esses arquivos são estáticos e podem ser servidos através de Nginx, Apache, Vercel, Firebase Hosting, ou qualquer servidor web de sua preferência.

## Arquitetura

O frontend foi desenvolvido com uma arquitetura modular focada por recursos (*Feature-based architecture*):

- **core/**: Serviços globais, interceptores HTTP, guardas de rota (Auth Guard) e modelos de dados base.
- **features/**: Módulos específicos da aplicação.
  - **auth/**: Login, Registro, e gerenciamento de conta.
  - **projects/**: Listagem, Detalhes, Configurações de Projeto, e Convites.
  - **dashboard/**: Tela inicial do usuário logado.
- **shared/**: Componentes compartilhados genéricos (não ligados a um domínio específico).

## Licença

Este projeto está licenciado sob a [GNU General Public License v3.0] (LICENSE).
