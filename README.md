# MPaFlow

Para abrir localmente:

```bash
npm install
npm run dev
```

Depois acesse o endereco mostrado no terminal, normalmente `http://localhost:8080/`.

Nao abra `index.html` ou `dist/index.html` com duplo clique. Apps Vite/React precisam ser servidos por HTTP; abrir por `file://` faz o navegador bloquear os scripts e a pagina fica vazia.

# MPaFlow

Sistema inteligente para rastreio de concretagem, controle tecnológico do concreto e análise de desempenho em obras.

---

# 📌 Sobre o Projeto

O **MPaFlow** é uma plataforma desenvolvida para gerenciamento e rastreabilidade completa da concretagem em obras, permitindo controle operacional, tecnológico e financeiro do concreto desde a chegada do caminhão até os resultados finais dos corpos de prova.

O sistema foi projetado para auxiliar engenheiros, calculistas e equipes de obra na tomada de decisão através de métricas, alertas automáticos e análises preditivas.

---

# 🚀 Principais Funcionalidades

## 🧱 Controle de Concretagem

* Cadastro de pavimentos e peças estruturais
* Controle por lote de concretagem
* Cadastro completo de caminhões
* Identificação por nota fiscal
* Controle de fornecedores (concreteiras)

---

## 🚚 Controle Operacional

* Horário de saída da central
* Horário de chegada na obra
* Início e fim do descarregamento
* Horário de saída da obra
* Controle de tempo de descarga
* Observações operacionais

---

## 🧪 Controle Tecnológico

* MPa esperado (FCK)
* Slump test / Flow
* Quantidade de água adicionada na obra
* Controle de corpos de prova
* Resultados por idade:

  * 12 horas
  * 7 dias
  * 28 dias

---

## 📊 Dashboard Inteligente

* Volume total concretado
* Percentual de conformidade
* Volume em risco
* Prejuízo estimado
* Ranking de fornecedores
* Performance por pavimento
* Evolução do MPa ao longo do tempo

---

## 🔮 Previsão de Falha

O sistema realiza previsão da resistência final com base nos resultados de 7 dias.

### Fórmula utilizada:

```text
MPa previsto aos 28 dias = MPa 7 dias / 0.7
```

### Classificação:

* 🔴 Alto risco
* 🟡 Médio risco
* 🟢 Baixo risco

---

## 🔔 Central de Notificações

* Resultado de 7 dias não cadastrado
* Resistência abaixo de 70%
* Resistência abaixo do esperado aos 28 dias
* Slump fora do padrão
* Concreto com alto risco de falha

---

# 🏢 Controle por Fornecedor

O sistema permite acompanhar:

* Taxa de conformidade
* Média de resistência
* Volume fornecido
* Índice de reprovação
* Ranking de desempenho

---

# 🧠 Diferenciais do Sistema

* Análise preditiva de falhas
* Controle técnico + financeiro
* Gestão por lote
* Interface moderna e responsiva
* Rastreabilidade completa
* Alertas inteligentes
* Centralização das informações da concretagem

---

# 🛠️ Tecnologias

## Frontend

* React
* TypeScript
* TailwindCSS
* Shadcn/UI

## Backend

* Supabase
* PostgreSQL

---

# 📈 Objetivo

Garantir controle total da qualidade do concreto, reduzir falhas, melhorar a rastreabilidade da concretagem e fornecer dados estratégicos para tomada de decisão técnica e operacional na obra.

---

# 📄 Licença

Projeto privado desenvolvido para gestão inteligente de concretagem e controle tecnológico em obras.

---

# 👨‍💻 Autor

Desenvolvido por:
**Angelo Gabriel**
