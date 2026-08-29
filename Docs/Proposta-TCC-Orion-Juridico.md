<!--
  Arquivo gerado de forma determinística a partir do DOCX. Não editar manualmente.
  source-docx-sha256: 7e5afb8b606d602196b8f25a175c99493061c2e86801348da10c0d5a7089d3d4
  extracted-structure-sha256: 0c65a6dbfea545b13d01b66a0aa005525223241bf81055f3f0a1f35c0f642417
  paragraphs: 597; headings: 98; lists: 398; tables: 7
-->

PROPOSTA DE TRABALHO DE CONCLUSÃO DE CURSO

Orion Jurídico: projeto e protótipo de uma plataforma cognitiva orientada por decisões para escritórios de advocacia

Identificação

| Campo | Informação |
| --- | --- |
| Autor(a) | [NOME DO(A) ALUNO(A)] |
| Curso | [NOME DO CURSO] |
| Instituição | [NOME DA INSTITUIÇÃO] |
| Orientador(a) | [NOME DO(A) ORIENTADOR(A)] |
| Cidade | [CIDADE — UF] |
| Ano | 2026 |
| Natureza do trabalho | Trabalho de Conclusão de Curso |
| Área temática | Engenharia de Software, Inteligência Artificial e Tecnologia Jurídica |

Observação: esta proposta delimita um projeto acadêmico executável. Ela não prevê a construção integral da plataforma comercial descrita no PRD do Orion Jurídico.

# 1. Título

Orion Jurídico: projeto e protótipo de uma plataforma cognitiva orientada por missões e decisões para apoio à gestão de escritórios de advocacia

# 2. Tema

Aplicação de engenharia de software, arquitetura SaaS multi-tenant, experiência do usuário e inteligência artificial generativa na organização de atividades, informações e decisões em escritórios de advocacia.

# 3. Delimitação do tema

O trabalho propõe projetar e avaliar um protótipo funcional de plataforma jurídica cognitiva capaz de:

- centralizar clientes, assuntos, processos, prazos, tarefas e documentos;
- identificar atividades que exigem atenção;
- apresentar o contexto necessário para uma decisão;
- utilizar inteligência artificial para resumir e recuperar informações autorizadas;
- manter supervisão humana em decisões críticas;
- aplicar isolamento de dados, controle de acesso e auditoria.
O protótipo será delimitado a três experiências principais:

1. Legal Mission Control: painel que prioriza atividades e explica por que cada uma requer atenção;
2. Client & Matter Cockpit: visão consolidada do cliente, assunto ou processo;
3. Legal Decision Workspace: ambiente contextual para revisar uma publicação ou um prazo e registrar a decisão humana.
Não fazem parte do escopo obrigatório do TCC:

- integração real com todos os tribunais brasileiros;
- protocolo automático de petições;
- desenvolvimento de aplicativo móvel nativo;
- módulo financeiro completo;
- marketplace de extensões;
- substituição da análise jurídica profissional;
- implantação comercial em larga escala;
- treinamento de um modelo fundacional próprio.
# 4. Contextualização

Escritórios de advocacia trabalham com informações distribuídas entre sistemas processuais, e-mails, aplicativos de mensagens, planilhas, calendários, plataformas de armazenamento e ferramentas financeiras. Essa fragmentação pode gerar retrabalho, dificuldade de localizar informações, perda de conhecimento institucional, baixa padronização e riscos no acompanhamento de prazos.

Softwares jurídicos tradicionais geralmente organizam a experiência por cadastros e módulos. Nesse modelo, o usuário precisa navegar entre diferentes telas para descobrir o que exige atenção, reunir o contexto e tomar uma decisão.

O Orion Jurídico propõe outra abordagem. Em vez de organizar o trabalho prioritariamente pelos módulos do sistema, a plataforma será orientada por:

missões → contexto → decisões → ações → auditoria → aprendizado.

A plataforma deverá apresentar ao profissional as atividades prioritárias, explicar os motivos, reunir as informações relevantes e oferecer apoio cognitivo. A decisão permanece sob responsabilidade humana.

# 5. Problema de pesquisa

Como uma plataforma jurídica cognitiva, orientada por missões e decisões, pode reduzir a fragmentação da informação e a carga cognitiva de profissionais de escritórios de advocacia, preservando segurança, rastreabilidade e controle humano?

## 5.1 Questões secundárias

4. Quais informações são indispensáveis para priorizar uma atividade jurídica?
5. Como apresentar contexto suficiente sem sobrecarregar a interface?
6. Como diferenciar fatos registrados, inferências algorítmicas e sugestões de IA?
7. Quais controles são necessários para impedir acesso indevido entre escritórios e casos?
8. Como avaliar utilidade, usabilidade, explicabilidade e segurança do protótipo?
# 6. Hipóteses

## 6.1 Hipótese principal

Uma interface orientada por missões e decisões, que reúna informações contextuais e explique suas prioridades, tende a reduzir o número de etapas necessárias para localizar dados e iniciar uma atividade jurídica, quando comparada a uma navegação organizada apenas por módulos e cadastros.

## 6.2 Hipóteses secundárias

- A apresentação explícita do motivo e da fonte de uma prioridade aumenta a compreensão e a confiança do usuário.
- A centralização contextual de prazos, documentos e histórico reduz trocas de tela durante uma tarefa.
- A pesquisa com recuperação de fontes autorizadas é mais adequada ao domínio jurídico do que respostas geradas sem fundamentação documental.
- O controle baseado em tenant, papel ativo e relacionamento com o caso reduz o risco de exposição indevida.
- A confirmação humana em ações críticas diminui os riscos associados à automação e à IA generativa.
# 7. Objetivos

## 7.1 Objetivo geral

Projetar, implementar e avaliar um protótipo de plataforma jurídica cognitiva orientada por missões e decisões, com apoio de inteligência artificial, isolamento multi-tenant, controle de acesso e auditoria.

## 7.2 Objetivos específicos

9. Analisar os problemas de fragmentação e carga cognitiva na operação de escritórios de advocacia.
10. Levantar requisitos funcionais, não funcionais e de segurança para o protótipo.
11. Modelar os principais conceitos do domínio jurídico.
12. Projetar uma arquitetura modular para uma aplicação SaaS multi-tenant.
13. Desenvolver o Legal Mission Control.
14. Desenvolver o Client & Matter Cockpit.
15. Desenvolver um Legal Decision Workspace para revisão de prazo ou publicação.
16. Implementar pesquisa contextual com recuperação de fontes autorizadas.
17. Implementar controle de acesso, segregação por tenant e auditoria sanitizada.
18. Avaliar o protótipo quanto a usabilidade, utilidade, desempenho, segurança e qualidade das respostas de IA.
19. Documentar limitações, riscos e possibilidades de evolução.
# 8. Justificativa

## 8.1 Relevância acadêmica

O trabalho integra diferentes áreas da formação tecnológica:

- engenharia de requisitos;
- arquitetura de software;
- modelagem e normalização de dados;
- desenvolvimento web;
- segurança da informação;
- experiência do usuário;
- testes de software;
- inteligência artificial generativa;
- governança e explicabilidade de sistemas automatizados.
O projeto permite estudar como essas disciplinas podem ser combinadas na construção de software para um domínio sensível.

## 8.2 Relevância tecnológica

A proposta explora uma mudança de paradigma: sair de sistemas centrados em menus e módulos para uma experiência centrada na atividade que requer atenção e na decisão que deve ser tomada.

Também investiga o uso de IA como camada transversal e controlada, com:

- recuperação de contexto autorizado;
- indicação de fontes;
- declaração de limitações;
- confirmação humana;
- rastreabilidade das interações.
## 8.3 Relevância social e profissional

Um sistema capaz de organizar prazos, documentos, responsabilidades e informações pode contribuir para operações jurídicas mais previsíveis. Entretanto, a proposta não pressupõe que IA possa substituir profissionais ou garantir resultados jurídicos.

## 8.4 Motivação pessoal

[DESCREVER A RELAÇÃO DO(A) ALUNO(A) COM O TEMA, EXPERIÊNCIA PROFISSIONAL, INTERESSE EM ENGENHARIA DE SOFTWARE, DIREITO OU INTELIGÊNCIA ARTIFICIAL.]

# 9. Fundamentação conceitual

## 9.1 Engenharia de software

O desenvolvimento seguirá princípios de modularidade, separação de responsabilidades, contratos explícitos, testes automatizados, observabilidade e evolução incremental.

Embora a visão comercial possa futuramente justificar microsserviços, o protótipo acadêmico adotará preferencialmente um monólito modular. Essa escolha reduz a complexidade de implantação e permite manter limites claros entre os domínios.

## 9.2 Software como serviço e multi-tenancy

O protótipo será concebido como SaaS multi-tenant. Cada escritório representará um tenant, e os dados deverão permanecer isolados em todas as operações.

O isolamento será aplicado em:

- autenticação;
- consultas;
- comandos;
- documentos;
- pesquisa;
- índices vetoriais;
- auditoria;
- telemetria.
## 9.3 Modelagem orientada ao domínio

O modelo será organizado em contextos delimitados:

- Identidade e Acesso;
- Relacionamento;
- Operação Jurídica;
- Prazos e Trabalho;
- Documentos e Conhecimento;
- Inteligência e Auditoria.
Entidades centrais:

- Tenant;
- Usuário;
- Papel;
- Equipe;
- Cliente;
- Assunto;
- Processo;
- Prazo;
- Tarefa;
- Documento;
- Versão;
- Missão;
- Decisão;
- Evento;
- Registro de Auditoria.
## 9.4 Normalização de dados

O banco transacional deverá seguir, como regra, a terceira forma normal:

- pessoas e organizações serão separadas dos papéis que exercem em processos;
- documentos serão separados de versões e arquivos;
- processos serão separados de partes e representações;
- tarefas serão separadas de responsáveis, estados e evidências;
- usuários serão separados de papéis, equipes e relacionamentos;
- identificadores externos terão origem e unicidade controladas;
- histórico não será sobrescrito por atualizações silenciosas.
Desnormalizações serão permitidas apenas em modelos de leitura, busca ou analytics, desde que possam ser reconstruídas a partir da fonte canônica.

## 9.5 Inteligência artificial generativa

A IA será utilizada para:

- resumir documentos;
- recuperar trechos relevantes;
- explicar prioridades;
- sugerir classificação;
- apoiar a revisão de informações;
- produzir rascunhos que dependem de aprovação humana.
O protótipo não deverá apresentar conteúdo gerado como fato confirmado. A interface distinguirá:

- informação registrada;
- conteúdo recuperado de fonte;
- inferência;
- previsão;
- recomendação;
- rascunho gerado.
## 9.6 Recuperação aumentada por geração

Será estudada uma arquitetura RAG — Retrieval-Augmented Generation — na qual a resposta é produzida a partir de documentos previamente autorizados.

Fluxo proposto:

20. autenticar o usuário;
21. identificar tenant, papel e relacionamento com o caso;
22. receber a pergunta;
23. recuperar trechos autorizados;
24. montar o contexto;
25. gerar a resposta;
26. apresentar fontes e limitações;
27. registrar métricas e feedback.
## 9.7 Experiência orientada por decisões

O protótipo será desenhado a partir do ciclo cognitivo:

28. perceber o que requer atenção;
29. compreender o motivo;
30. verificar as fontes;
31. analisar alternativas;
32. decidir;
33. executar uma ação autorizada;
34. confirmar o resultado;
35. atualizar o contexto.
A interface deverá reduzir trocas desnecessárias de tela e apresentar somente as informações relevantes para a atividade corrente.

## 9.8 Segurança e privacidade

O projeto considerará:

- segurança e privacidade por padrão;
- menor privilégio;
- segregação entre tenants;
- controle de acesso baseado em papéis;
- vínculo explícito entre usuário e caso;
- auditoria;
- criptografia;
- proteção de segredos;
- minimização de dados em logs;
- princípios aplicáveis da LGPD;
- proteção contra prompt injection e vazamento de contexto.
# 10. Proposta da solução

## 10.1 Visão geral

O protótipo permitirá que usuários de escritórios diferentes acessem um ambiente isolado. Após o login, o usuário verá suas missões prioritárias, poderá abrir o contexto consolidado de um assunto e acessar um workspace específico para tomar uma decisão.

## 10.2 Legal Mission Control

O painel deverá responder:

O que precisa da atenção deste usuário agora?

Cada missão poderá apresentar:

- título;
- cliente ou assunto;
- prioridade;
- motivo;
- prazo;
- responsável;
- fonte;
- impacto;
- nível de confiança, quando aplicável;
- próxima ação sugerida.
Possíveis missões:

- prazo próximo do vencimento;
- publicação aguardando análise;
- documento aguardando revisão;
- solicitação do cliente sem resposta;
- tarefa atrasada;
- decisão aguardando aprovação.
## 10.3 Client & Matter Cockpit

O cockpit reunirá:

- identificação do cliente;
- resumo do assunto;
- processo vinculado;
- partes;
- responsáveis;
- prazos;
- tarefas;
- documentos;
- mudanças recentes;
- riscos;
- histórico relevante;
- comandos autorizados.
O cockpit será uma projeção das fontes existentes, e não um novo cadastro paralelo.

## 10.4 Legal Decision Workspace

O workspace será montado para uma decisão específica. No cenário acadêmico, recomenda-se implementar:

Revisar publicação e confirmar encaminhamento

O workspace poderá conter:

- conteúdo da publicação;
- processo relacionado;
- prazo sugerido;
- documentos relacionados;
- histórico recente;
- resumo assistido;
- riscos;
- ação sugerida;
- campos para decisão humana;
- confirmação;
- evidência e auditoria.
## 10.5 Pesquisa cognitiva

O usuário poderá fazer uma pergunta sobre documentos autorizados. A resposta deverá:

- informar as fontes;
- separar citação de interpretação;
- indicar quando não houver evidência suficiente;
- respeitar tenant e permissões;
- não executar ações automaticamente.
# 11. Requisitos do protótipo

## 11.1 Requisitos funcionais

| Código | Requisito |
| --- | --- |
| RF-01 | Permitir autenticação de usuário |
| RF-02 | Isolar dados por tenant |
| RF-03 | Permitir cadastro de clientes, assuntos e processos |
| RF-04 | Permitir cadastro de tarefas e prazos |
| RF-05 | Exibir missões priorizadas |
| RF-06 | Explicar o motivo de cada prioridade |
| RF-07 | Exibir cockpit consolidado |
| RF-08 | Montar workspace para revisão de publicação ou prazo |
| RF-09 | Registrar decisão humana |
| RF-10 | Armazenar documentos e versões |
| RF-11 | Pesquisar conteúdo autorizado |
| RF-12 | Gerar resumo assistido com indicação de fontes |
| RF-13 | Aplicar permissões por papel e relacionamento |
| RF-14 | Registrar ações críticas em auditoria |
| RF-15 | Diferenciar vazio, parcial, negado e erro |
| RF-16 | Preservar o retorno à lista de missões |

## 11.2 Requisitos não funcionais

| Código | Requisito |
| --- | --- |
| RNF-01 | Interface responsiva |
| RNF-02 | Jornadas prioritárias compatíveis com WCAG 2.2 AA |
| RNF-03 | Criptografia em trânsito |
| RNF-04 | Senhas armazenadas por algoritmo seguro |
| RNF-05 | Consultas sempre filtradas pelo tenant |
| RNF-06 | Logs sem corpo de documentos ou prompts sensíveis |
| RNF-07 | Respostas comuns do backend com p95 definido e medido |
| RNF-08 | Testes automatizados de isolamento |
| RNF-09 | Auditoria com autor, ação, horário e correlação |
| RNF-10 | Componentes de IA substituíveis por adaptadores |

# 12. Arquitetura proposta

## 12.1 Visão lógica

Interface web
     ↓
API / camada de composição
     ↓
Módulos de domínio
     ├── Identidade e Acesso
     ├── Clientes e Assuntos
     ├── Processos, Prazos e Tarefas
     ├── Documentos
     ├── Missões e Decisões
     ├── Inteligência Artificial
     └── Auditoria
     ↓
Banco relacional + armazenamento de arquivos + índice de busca/vetorial

## 12.2 Princípios arquiteturais

- monólito modular;
- API-first;
- contratos versionados;
- validação no backend;
- fonte canônica por conceito;
- comandos e consultas separados logicamente;
- eventos de domínio para atividades relevantes;
- componentes externos encapsulados por adaptadores;
- projeções reconstruíveis;
- observabilidade desde o início.
## 12.3 Tecnologias candidatas

A escolha final dependerá das competências do autor e da infraestrutura disponível.

| Camada | Alternativas |
| --- | --- |
| Frontend | React/Next.js, Vue/Nuxt ou Angular |
| Backend | Node.js/NestJS, Java/Spring Boot, .NET ou Python/FastAPI |
| Banco relacional | PostgreSQL |
| Armazenamento | Serviço compatível com S3 ou armazenamento local controlado |
| Busca vetorial | pgvector ou mecanismo equivalente |
| Autenticação | Implementação acadêmica segura ou provedor OpenID Connect |
| IA | API de modelo compatível ou modelo local, encapsulado por adaptador |
| Testes | Framework da stack, Playwright/Cypress e testes de API |
| Implantação | Contêineres e ambiente de nuvem ou laboratório acadêmico |

# 13. Modelagem inicial

## 13.1 Relacionamentos principais

Tenant
 ├── Usuários
 ├── Equipes
 ├── Clientes
 │    └── Assuntos
 │         ├── Processos
 │         ├── Prazos
 │         ├── Tarefas
 │         ├── Documentos
 │         └── Decisões
 └── Auditoria

## 13.2 Legal Relationship

O acesso a um caso não será definido somente pelo papel geral do usuário. Será necessário um vínculo jurídico autorizado entre:

- usuário ou equipe;
- cliente, assunto ou processo;
- função;
- vigência;
- escopo;
- responsável pela concessão.
A decisão de acesso combinará:

tenant + identidade + papel ativo + permissão + relacionamento + ação.

## 13.3 Eventos principais

- ClienteCriado;
- AssuntoCriado;
- ProcessoVinculado;
- PrazoCriado;
- PrazoProximoDoVencimento;
- PublicacaoRecebida;
- MissaoGerada;
- DecisaoRegistrada;
- DocumentoVersionado;
- AcessoSensivelRealizado.
# 14. Metodologia

## 14.1 Natureza da pesquisa

O trabalho será uma pesquisa:

- aplicada, por buscar solução para um problema prático;
- exploratória, por investigar uma abordagem cognitiva no domínio jurídico;
- qualitativa e quantitativa, pela combinação de entrevistas, observação, métricas de uso e testes;
- baseada em Design Science Research, com construção e avaliação de um artefato tecnológico.
## 14.2 Etapas

### Etapa 1 — Revisão bibliográfica

Estudo de:

- engenharia de software;
- sistemas SaaS multi-tenant;
- arquitetura orientada ao domínio;
- interação humano-computador;
- carga cognitiva;
- IA generativa;
- RAG;
- segurança;
- privacidade e LGPD;
- tecnologia jurídica.
### Etapa 2 — Levantamento de requisitos

Serão realizadas entrevistas semiestruturadas ou aplicação de questionário com profissionais do Direito, quando possível.

Questões possíveis:

- quais tarefas consomem mais tempo;
- onde as informações ficam armazenadas;
- como prazos são acompanhados;
- como prioridades são definidas;
- quais erros ou retrabalhos são comuns;
- quais preocupações existem sobre IA;
- quais informações devem aparecer antes de uma decisão.
### Etapa 3 — Modelagem

- personas;
- jornadas;
- requisitos;
- casos de uso;
- modelo de domínio;
- modelo de dados;
- arquitetura;
- threat model;
- protótipos de interface.
### Etapa 4 — Implementação

Desenvolvimento incremental:

36. identidade e multi-tenancy;
37. clientes, assuntos, processos, tarefas e prazos;
38. documentos;
39. Mission Control;
40. Cockpit;
41. Decision Workspace;
42. pesquisa cognitiva;
43. auditoria;
44. instrumentação e testes.
### Etapa 5 — Avaliação

O protótipo será avaliado por:

- testes funcionais;
- testes de isolamento;
- testes de usabilidade;
- medição de tarefas;
- avaliação das respostas de IA;
- análise de acessibilidade;
- inspeção de segurança;
- questionário de percepção.
### Etapa 6 — Análise e redação

Os resultados serão comparados às hipóteses, registrando benefícios, limitações, riscos e possibilidades futuras.

# 15. Plano de avaliação

## 15.1 Cenários

### Cenário A — Localização de prioridade

O participante identifica qual atividade deve executar primeiro e explica o motivo.

### Cenário B — Compreensão do caso

O participante consulta o cockpit e responde perguntas sobre situação, prazo e documentos relacionados.

### Cenário C — Decisão assistida

O participante revisa uma publicação, consulta evidências, verifica a sugestão do sistema e registra uma decisão.

### Cenário D — Controle de acesso

Um usuário tenta consultar assunto sem relacionamento autorizado. O sistema deve negar sem expor conteúdo.

### Cenário E — Resposta sem evidência

O participante faz uma pergunta cuja resposta não existe nos documentos. A IA deve informar insuficiência de evidência.

## 15.2 Métricas

| Dimensão | Métrica |
| --- | --- |
| Eficiência | Tempo para iniciar e concluir a tarefa |
| Navegação | Número de telas, cliques ou mudanças de contexto |
| Eficácia | Percentual de tarefas concluídas corretamente |
| Usabilidade | Escala SUS ou instrumento aprovado pelo orientador |
| Compreensão | Acerto ao explicar motivo e fonte da prioridade |
| IA | Fidelidade às fontes, respostas não sustentadas e recusas corretas |
| Segurança | Tentativas indevidas corretamente bloqueadas |
| Desempenho | Latência p50, p95 e taxa de erros |
| Acessibilidade | Problemas encontrados por inspeção e ferramentas |

## 15.3 Critérios de sucesso sugeridos

Os valores definitivos deverão ser aprovados pelo orientador.

- todas as consultas protegidas aplicam filtro de tenant;
- nenhum teste de acesso cruzado entre tenants é aprovado indevidamente;
- todas as ações críticas registram auditoria;
- respostas cognitivas apresentam fontes quando existirem;
- ausência de fonte é informada sem invenção deliberada;
- participantes concluem as três jornadas principais;
- o protótipo apresenta redução de passos em comparação ao fluxo de referência;
- os resultados e limitações são documentados de forma reproduzível.
# 16. Segurança, ética e LGPD

## 16.1 Dados utilizados

O projeto deverá usar preferencialmente:

- dados fictícios;
- documentos sintéticos;
- processos públicos previamente anonimizados, se autorizados;
- dados fornecidos com consentimento e tratamento aprovado pela instituição.
Não deverão ser inseridos dados reais de clientes ou processos sigilosos em serviços externos de IA sem autorização formal, base legal, contrato e avaliação institucional.

## 16.2 Aspectos éticos

Caso a pesquisa envolva participantes, entrevistas ou testes com coleta de dados pessoais, o autor deverá verificar:

- regras da instituição;
- necessidade de termo de consentimento;
- submissão ao comitê de ética, quando aplicável;
- anonimização dos resultados;
- possibilidade de desistência;
- retenção e descarte dos dados coletados.
## 16.3 Controle humano

A IA não decidirá:

- estratégia jurídica;
- confirmação final de prazo;
- envio de comunicação externa;
- protocolo;
- acordo;
- cobrança;
- alteração de permissão.
Essas ações exigirão confirmação de usuário autorizado.

# 17. Testes

## 17.1 Testes de software

- unitários;
- integração;
- contratos de API;
- banco e migrations;
- end-to-end;
- isolamento multi-tenant;
- autorização;
- acessibilidade;
- desempenho;
- restauração;
- segurança básica.
## 17.2 Testes de IA

- fidelidade ao documento;
- correção das referências;
- comportamento quando não há evidência;
- resistência a instruções maliciosas presentes em documentos;
- tentativa de acessar conteúdo de outro tenant;
- consistência após mudança de prompt ou modelo;
- custo e latência.
## 17.3 Evidências

O trabalho manterá:

- relatório de testes;
- matriz de rastreabilidade;
- manifesto da versão avaliada;
- migrations executadas;
- resultados dos cenários;
- limitações conhecidas;
- riscos residuais;
- arquivo de evidências estruturado.
# 18. Cronograma sugerido

Cronograma adaptável ao calendário da instituição.

| Etapa | Mês 1 | Mês 2 | Mês 3 | Mês 4 | Mês 5 | Mês 6 | Mês 7 | Mês 8 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Definição e aprovação da proposta | X |  |  |  |  |  |  |  |
| Revisão bibliográfica | X | X |  |  |  |  |  |  |
| Entrevistas e requisitos |  | X | X |  |  |  |  |  |
| Modelagem e prototipação |  |  | X | X |  |  |  |  |
| Infraestrutura e segurança básica |  |  | X | X |  |  |  |  |
| Desenvolvimento do núcleo |  |  |  | X | X |  |  |  |
| Mission Control, Cockpit e Workspace |  |  |  |  | X | X |  |  |
| Pesquisa cognitiva |  |  |  |  | X | X |  |  |
| Testes e avaliação |  |  |  |  |  | X | X |  |
| Análise dos resultados |  |  |  |  |  |  | X |  |
| Redação e revisão | X | X | X | X | X | X | X | X |
| Preparação da apresentação |  |  |  |  |  |  |  | X |

# 19. Recursos necessários

## 19.1 Recursos de software

- computador para desenvolvimento;
- editor de código;
- sistema de versionamento;
- banco PostgreSQL;
- ferramentas de prototipação;
- framework web;
- ferramentas de teste;
- ambiente de implantação;
- acesso controlado a modelo de IA, se utilizado.
## 19.2 Recursos humanos

- aluno pesquisador;
- professor orientador;
- profissionais do Direito convidados para levantamento ou avaliação;
- apoio institucional em segurança, privacidade ou metodologia, quando disponível.
## 19.3 Custos possíveis

- hospedagem;
- domínio;
- armazenamento;
- consumo de API de IA;
- ferramenta de prototipação;
- transporte ou incentivos para participantes.
O projeto deverá priorizar recursos gratuitos, acadêmicos ou de código aberto.

# 20. Riscos

| Risco | Impacto | Mitigação |
| --- | --- | --- |
| Escopo excessivo | Não concluir o protótipo | Limitar a três experiências |
| Falta de participantes | Avaliação insuficiente | Planejar avaliação heurística alternativa |
| Custo da IA | Interrupção de testes | Limites, modelos econômicos ou execução local |
| Respostas incorretas | Perda de confiança | RAG, fontes, recusa e supervisão humana |
| Vazamento de dados | Dano ético e jurídico | Dados fictícios e testes de isolamento |
| Integração externa instável | Atraso | Simuladores e adaptadores |
| Curva de aprendizado | Redução do tempo de desenvolvimento | Escolher stack dominada pelo autor |
| Desempenho inadequado | Experiência ruim | Medição antecipada e escopo controlado |

# 21. Resultados esperados

Espera-se entregar:

45. revisão teórica sobre plataformas cognitivas e software jurídico;
46. levantamento de requisitos;
47. modelo de domínio e banco de dados normalizado;
48. arquitetura documentada;
49. protótipo web funcional;
50. Mission Control;
51. Cockpit;
52. Decision Workspace;
53. pesquisa cognitiva com fontes;
54. controle multi-tenant e auditoria;
55. suíte de testes;
56. avaliação de usabilidade, segurança e IA;
57. análise crítica dos resultados;
58. documentação de evolução futura.
# 22. Contribuições esperadas

## 22.1 Contribuição técnica

Uma arquitetura de referência acadêmica para plataformas jurídicas cognitivas, com separação entre fontes canônicas, composição de contexto, decisão humana e assistência de IA.

## 22.2 Contribuição de produto

Uma demonstração de experiência jurídica orientada por missões e decisões, em contraste com navegação exclusivamente modular.

## 22.3 Contribuição científica

Evidências iniciais sobre os efeitos da organização contextual e da explicabilidade na execução de tarefas jurídicas.

# 23. Limitações previstas

- amostra reduzida de participantes;
- dados predominantemente sintéticos;
- ausência de integração abrangente com tribunais;
- avaliação em ambiente controlado;
- cobertura limitada de áreas do Direito;
- dependência da qualidade do modelo de IA escolhido;
- impossibilidade de generalizar resultados para todos os escritórios;
- protótipo sem garantias de produção ou certificação.
# 24. Estrutura sugerida da monografia

## Capítulo 1 — Introdução

Contexto, problema, objetivos, justificativa e organização do trabalho.

## Capítulo 2 — Fundamentação teórica

Engenharia de software, SaaS, multi-tenancy, DDD, UX, carga cognitiva, IA generativa, RAG, segurança, LGPD e legaltech.

## Capítulo 3 — Metodologia

Classificação da pesquisa, Design Science Research, levantamento, construção e avaliação.

## Capítulo 4 — Análise e especificação

Personas, jornadas, requisitos, casos de uso, domínio, dados e segurança.

## Capítulo 5 — Projeto da solução

Arquitetura, interfaces, Mission Control, Cockpit, Decision Workspace e camada cognitiva.

## Capítulo 6 — Implementação

Tecnologias, decisões, componentes e principais desafios.

## Capítulo 7 — Avaliação e resultados

Testes, métricas, avaliação com usuários e análise das hipóteses.

## Capítulo 8 — Conclusão

Contribuições, limitações e trabalhos futuros.

# 25. Referencial bibliográfico inicial

As referências deverão ser revisadas, consultadas em suas versões oficiais e formatadas conforme o padrão exigido pela instituição.

Temas e fontes iniciais recomendados:

- legislação brasileira de proteção de dados pessoais;
- normas e orientações sobre segurança da informação;
- documentação do OWASP;
- WCAG 2.2;
- literatura sobre Domain-Driven Design;
- literatura sobre arquitetura de software;
- estudos sobre Design Science Research;
- estudos sobre interação humano-computador e carga cognitiva;
- artigos científicos sobre Retrieval-Augmented Generation;
- pesquisas sobre explicabilidade e avaliação de inteligência artificial;
- literatura sobre tecnologia jurídica e transformação digital no Direito.
## 25.1 Referências normativas e técnicas a verificar

- BRASIL. Lei nº 13.709, de 14 de agosto de 2018. Lei Geral de Proteção de Dados Pessoais.
- WORLD WIDE WEB CONSORTIUM. Web Content Accessibility Guidelines — WCAG 2.2.
- OWASP FOUNDATION. OWASP Application Security Verification Standard.
- OWASP FOUNDATION. OWASP Top 10.
- EVANS, Eric. Domain-Driven Design: Tackling Complexity in the Heart of Software.
- FOWLER, Martin. Patterns of Enterprise Application Architecture.
- SOMMERVILLE, Ian. Software Engineering.
As referências sobre IA, RAG, legaltech e metodologia deverão ser selecionadas após pesquisa bibliográfica em bases acadêmicas. Não se recomenda preencher a bibliografia com fontes não consultadas.

# 26. Trabalhos futuros

- integração com fontes processuais;
- automação avançada de workflows;
- gestão financeira;
- colaboração entre escritórios e correspondentes;
- inteligência longitudinal de assuntos;
- agentes especializados;
- aplicativos móveis;
- expansão para outros países;
- avaliação longitudinal em escritórios reais;
- comparação experimental com softwares jurídicos tradicionais.
# 27. Resumo da proposta

Este trabalho propõe o projeto, desenvolvimento e avaliação de um protótipo denominado Orion Jurídico. A solução será uma plataforma cognitiva para escritórios de advocacia, organizada por missões e decisões. O protótipo deverá priorizar atividades, explicar os motivos, consolidar o contexto de clientes e assuntos e apoiar decisões por meio de inteligência artificial baseada em fontes autorizadas. A arquitetura considerará SaaS multi-tenant, modelagem normalizada, controle de acesso por papel e relacionamento, auditoria e supervisão humana. A pesquisa seguirá abordagem aplicada e Design Science Research, combinando levantamento de requisitos, construção do artefato e avaliação de usabilidade, segurança, desempenho e qualidade da IA. Espera-se demonstrar que uma experiência orientada por decisões pode reduzir etapas de navegação e facilitar a compreensão do trabalho prioritário, sem transferir à inteligência artificial a responsabilidade pelas decisões jurídicas.

## Palavras-chave

Tecnologia jurídica. Inteligência artificial. Engenharia de software. SaaS multi-tenant. Experiência do usuário. Recuperação aumentada por geração. Segurança da informação.

# Anexo A — Escopo mínimo para aprovação

Caso o prazo acadêmico seja reduzido, o escopo mínimo será:

- autenticação;
- dois tenants;
- usuários e papéis;
- clientes e assuntos;
- tarefas e prazos;
- Legal Mission Control;
- Client & Matter Cockpit;
- um Decision Workspace;
- cinco documentos sintéticos;
- uma pergunta com fonte e uma pergunta sem evidência;
- auditoria;
- testes de isolamento;
- avaliação das três jornadas principais.
# Anexo B — Demonstração sugerida para a banca

59. Entrar como advogado do Escritório A.
60. Visualizar as missões priorizadas.
61. Abrir uma missão e explicar sua prioridade.
62. Acessar o cockpit do assunto.
63. Abrir o workspace de revisão.
64. Consultar documentos por IA com indicação de fontes.
65. Registrar uma decisão humana.
66. Verificar a auditoria.
67. Tentar acessar um caso do Escritório B.
68. Demonstrar a negação segura.
69. Voltar ao Mission Control e visualizar a próxima missão.
# Anexo C — Decisões que devem ser validadas com o orientador

- adequação do título ao curso;
- necessidade de submissão ética;
- quantidade de participantes;
- método de avaliação de usabilidade;
- obrigatoriedade de implementação versus prototipação;
- formato da documentação;
- padrão de referências;
- calendário;
- critérios mínimos para apresentação;
- possibilidade de usar serviços externos de IA.
