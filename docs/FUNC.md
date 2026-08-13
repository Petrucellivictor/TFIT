# TFIT — Catálogo de Funcionalidades

Documento de referência para redesign visual: lista **todas as funcionalidades já implementadas** no app (mobile), no painel admin e no backend, organizadas por tela/fluxo. O objetivo é dar uma visão completa do que existe hoje — o que é mostrado, quais ações o usuário pode tomar e quais estados cada tela precisa suportar — para orientar decisões de design sem precisar ler código.

Não é um documento de arquitetura técnica (isso já existe em `docs/ARCHITECTURE.md`, `docs/API.md`, `docs/DATABASE.md`) — aqui o foco é só o que aparece na tela e o que o usuário consegue fazer.

---

## 1. Visão geral do produto

TFIT (App Fit) é um app de personal trainer com IA, acompanhamento de evolução física, gamificação e rede social voltada para fitness. Público: pessoas que treinam (sozinhas ou com personal) e querem acompanhar progresso, manter consistência e se conectar com outras pessoas/profissionais da área.

**Apps que compõem o sistema:**
- **App mobile** (React Native/Expo) — o produto principal, usado pelo usuário final.
- **Painel admin** (web, Next.js) — uso interno, só para moderação de denúncias.
- **Backend/API** — não tem interface própria (serve os dois acima).

---

## 2. Arquitetura de navegação (app mobile)

**Barra de abas inferior** (5 abas + botão flutuante):
1. **Home** — dashboard/resumo
2. **Treinos** — plano de treino ativo e modo treino
3. **Personal** — diretório de personal trainers
4. **Feed** — rede social
5. **Perfil** — perfil próprio e configurações

**Botão flutuante (+)**, sobreposto à barra, abre um menu de ações rápidas: Iniciar treino, Check-in do dia, Postar.

**Telas fora das abas** (acessadas por navegação, empilhadas por cima): onboarding, evolução, conquistas, desafios, check-in, sessão de treino, criação/edição de post, detalhe de post, perfil público de outro usuário, notificações, solicitações de seguidor, usuários bloqueados, cadastro/edição de perfil profissional, cardápio de serviços.

**Fluxo de entrada:** tela de carregamento → não autenticado vai para login/cadastro → autenticado mas sem onboarding completo vai para onboarding → autenticado e completo vai para as abas.

---

## 3. Autenticação

- **Login** e **Cadastro** (e-mail/senha via Clerk).
- Sessão persistida com segurança (token seguro no dispositivo).
- **Sair da conta** (disponível no Perfil).

---

## 4. Onboarding (avaliação inicial)

Formulário em **7 etapas**, com barra de progresso no topo e navegação Voltar/Continuar:

1. **Dados físicos**: peso (kg), altura (cm), idade — campos numéricos.
2. **Objetivo** (escolha única, via chips): Emagrecer, Ganhar massa muscular, Ganhar força, Melhorar condicionamento, Saúde e qualidade de vida, Outro.
3. **Saúde** (múltipla escolha, via chips + texto livre): Problemas cardíacos, Pressão alta, Diabetes, Problemas articulares, Problemas na coluna, Lesões/cirurgias recentes, Problemas respiratórios, Dor durante exercícios, campo livre "Outra limitação". Texto de aviso: essas perguntas informam segurança do treino, não substituem avaliação médica.
4. **Frequência**: dias por semana (1 a 7), via chips.
5. **Tempo por sessão**: 15/30/45/60/90 minutos, via chips.
6. **Experiência**: Nunca treinei, Menos de 6 meses, 6 meses a 1 ano, 1 a 2 anos, Mais de 2 anos, Treino atualmente.
7. **Preferência de equipamento**: Máquinas, Pesos livres, Equilibrado, Não sei.

Ao concluir, os dados alimentam a geração de treino por IA.

---

## 5. Home (dashboard)

- **Cabeçalho de saudação** ("Bom dia/Boa tarde/Boa noite, {nome}").
- **Card de gamificação**: nível atual, nome do nível, gauge circular de progresso de XP até o próximo nível, sequência de dias ativa (streak, com emoji de fogo) — toque abre Conquistas.
- **Card do treino de hoje**: nome do treino do dia (baseado no dia da semana) e quantidade de exercícios — toque abre o treino. Três estados possíveis: (a) nenhum plano gerado ainda → CTA para ir à aba Treinos, (b) tem plano mas não há treino hoje → mensagem de descanso, (c) tem treino hoje → card clicável.

---

## 6. Treinos

### 6.1 Lista de treinos (plano ativo)
- Nome do split (ex: "ABC"), botão "Meus planos".
- Texto "Por que esse treino?" expansível — mostra o raciocínio da IA por trás do plano.
- Lista de treinos do plano: nome, dia da semana, quantidade de exercícios, grupos musculares trabalhados.
- **Estado vazio** (sem plano): tela de boas-vindas com duas opções — "Gerar meu treino" (IA, com indicador de carregamento "pode levar cerca de um minuto") ou "Criar treino manualmente".

### 6.2 Detalhe de um treino
- Lista de exercícios: nome, séries × repetições (mín-máx), descanso entre séries, músculo principal.
- Botão para iniciar o treino (modo sessão).

### 6.3 Modo treino (sessão)
Fluxo linear, série por série:
- Tela de **registro de série**: nome do exercício, "Série X de Y", alvo de repetições, campos para repetições feitas e peso (kg, opcional), seletor "Como foi?" (Fácil/Adequado/Difícil/Muito difícil).
- Ao concluir uma série: se houver XP ganho, recorde pessoal batido ou conquista desbloqueada, aparece um **modal de celebração** (com badges animados, "+XP").
- Tela de **descanso**: timer com anel circular animado (contagem regressiva visual), botão "Pular descanso".
- Tela de **resumo/conclusão**: total de séries feitas, botão "Concluir" → tela final "Treino concluído!" com resultado de gamificação.

### 6.4 Criar treino manualmente (builder)
- Campo nome do plano.
- Um ou mais "dias" (até 7): nome do dia, seletor do dia da semana (chips Seg-Dom).
- Por dia: lista de exercícios adicionados, cada um com campos editáveis (séries, reps mín, reps máx, descanso em segundos) e botão remover.
- Modal de **seleção de exercício** da biblioteca (com filtro por músculo).
- Botões "+ Adicionar exercício", "+ Adicionar dia", "Salvar treino".

### 6.5 Meus planos
- Lista de todos os planos do usuário (ativo e arquivados).
- Ações por plano: **Ativar**, **Duplicar**, **Compartilhar** (enviar cópia para outro usuário via @handle, modal de compartilhamento).

---

## 7. Evolução

- **Sequência de check-in** (card com fogo + contador de dias), se houver.
- **FIT Score**: gauge circular grande (0-100) + 5 barras de sub-pontuação com gradiente (Consistência, Treinamento, Evolução, Hábitos, Recuperação). Texto de aviso: é indicador de consistência, não diagnóstico de saúde.
- **Peso**: peso mais recente + gráfico de tendência (sparkline) dos últimos registros; botão "Registrar peso e medidas".
- **Metas**: lista de metas ativas (título, tipo, data-alvo opcional); botão "Nova meta".
- **Recordes recentes**: lista dos recordes pessoais dos últimos 90 dias (exercício, peso × repetições).

### 7.1 Check-in do dia
- 4 escalas de 1 a 5 (seletor visual): Energia, Qualidade do sono, Disposição, Sensação de recuperação.
- Pergunta sim/não: "Sentiu alguma dor?" — se sim, campo de texto livre "Onde?".
- Ao salvar, se houver ganho de XP/conquista, mostra celebração antes de voltar.

### 7.2 Registrar peso e medidas
- Peso (kg), % de gordura (opcional).
- Medidas corporais (todas opcionais): cintura, peito, quadril, braço, coxa, panturrilha, ombro (cm).

### 7.3 Nova meta
- Título, tipo (peso-alvo / medida-alvo / recorde de exercício / personalizada), valor-alvo, exercício (se aplicável), data-alvo opcional.

---

## 8. Gamificação

### 8.1 Conquistas (badges)
- Grade de badges (2 colunas), cada um com ícone, nome, descrição.
- **Desbloqueado**: ícone colorido dentro de anel com gradiente (verde-elétrico → azul), fundo preenchido.
- **Bloqueado**: ícone acinzentado, apenas contorno.
- Contador "X de Y desbloqueadas" no topo.
- Toque em qualquer badge abre **modal de detalhe**: ícone grande, nome, descrição completa, data de desbloqueio (ou "Ainda não desbloqueada").
- Animação de entrada (badges aparecem em cascata).

### 8.2 Desafios
- Lista de desafios públicos ativos: título, descrição, período (semanal/mensal/por tempo limitado).
- Se já participando: barra de progresso (valor atual / meta) + ícone de concluído quando aplicável.
- Se não participando: botão "Participar".

### 8.3 Sistema de XP/nível (transversal)
- Ganho de XP aparece em modais de celebração após: completar série (com recorde), completar treino, fazer check-in — sempre que há XP ou conquista nova.
- Sequência (streak) com mecanismo de "congelar" (proteção) exibido no perfil de gamificação.

---

## 9. Personal trainers (diretório profissional)

### 9.1 Diretório
- Campo de busca (nome ou especialidade).
- Lista de profissionais: foto/avatar, nome, especialidade, cidade.
- Banner "É profissional? Cadastre-se aqui".
- Aviso fixo: "a TFIT não verifica credenciais dos profissionais listados".

### 9.2 Perfil de um profissional (visão de quem busca)
- Nome, especialidade, cidade, bio.
- **Cardápio de serviços** (se houver): lista de itens com título, preço (texto livre, ex: "R$150" ou "A combinar"), descrição opcional.
- Botões de contato direto: WhatsApp, Ligar, Instagram, E-mail (só aparecem os que o profissional preencheu) — abrem o app correspondente, não há chat interno.
- Aviso: "a TFIT não verifica credenciais nem processa pagamentos".

### 9.3 Cadastro/edição do próprio perfil profissional
- Especialidade, "Sobre você" (bio), cidade (opcional).
- Contatos: WhatsApp, telefone, Instagram, e-mail (pelo menos um obrigatório).
- Botões "Editar meu cardápio" e "Remover do diretório" (se já tem perfil salvo).

### 9.4 Meu cardápio (gestão de serviços)
- Lista dos itens cadastrados (inclusive ocultos, com opacidade reduzida).
- Por item: título, preço, descrição, setas para reordenar (mover para cima/baixo), ação "Ocultar"/"Reativar", ação "Remover".
- Formulário "+ Adicionar item": nome, preço (opcional), descrição (opcional).

---

## 10. Social (Feed)

### 10.1 Feed
- Lista cronológica reversa de posts (próprios + de quem o usuário segue), rolagem infinita.
- Ícone de sino no topo com contador de notificações não lidas.
- **Cartão de post**: avatar + nome + @handle + tempo relativo do autor (toque abre perfil dele), menu "•••" (toque abre ações), rótulo opcional do tipo de post (Treino concluído / Nova conquista / Novo recorde pessoal / Sequência em dia), legenda, foto (se houver, toque abre detalhe), botões de curtir (coração, com animação de "pulso" ao tocar) e comentar (com contadores).
- Estado vazio: "Nenhum post ainda. Siga outras pessoas ou publique algo para começar."

### 10.2 Criar post
- Seleção de foto (opcional, da galeria) ou apenas texto.
- Campo de legenda (multilinha).
- Seletor de visibilidade (chips): Público, Seguidores, Amigos, Privado.
- Botão "Publicar".

### 10.3 Detalhe de post
- Post completo no topo (mesmo cartão do feed) + lista de comentários (autor, tempo, texto).
- Campo de novo comentário + botão enviar, fixo embaixo.
- Menu "•••": se for post próprio, opção "Excluir post"; se for de outra pessoa, "Denunciar" e "Bloquear usuário".

### 10.4 Denunciar conteúdo
- Modal com motivos pré-definidos (chips: Spam, Conteúdo impróprio, Assédio ou bullying, Informação falsa, Outro) + campo de detalhes opcional.
- Disponível para posts e para perfis de usuário.

### 10.5 Perfil público de outro usuário
- Avatar, nome, @handle, indicador "Amigos" (se seguem um ao outro), bio.
- Contadores de seguidores/seguindo (toque abre lista).
- Botão de seguir com 3 estados: "Seguir" / "Solicitação enviada" (conta privada, pendente) / "Seguindo" (toque para deixar de seguir).
- Grade de posts do usuário (3 colunas, miniaturas — texto sem foto mostra a legenda).
- Menu "•••" com Denunciar/Bloquear.
- Se a conta for privada e o usuário não seguir: mensagem "Esta conta é privada. Siga para ver os posts." no lugar da grade.

### 10.6 Seguidores / Seguindo
- Alternância por chips (Seguidores / Seguindo).
- Lista de usuários (avatar, nome, @handle), toque abre perfil.

### 10.7 Solicitações de seguidor
- Lista de pedidos pendentes (para contas privadas): avatar, nome, botões "Aceitar" e "Recusar".

### 10.8 Notificações
- Lista de notificações: novo seguidor, pedido de seguir, comentário, curtida, conquista desbloqueada.
- Não lidas com destaque visual (fundo diferenciado + indicador).
- Botão "Marcar tudo como lido".
- Toque em cada notificação leva ao post, perfil ou tela de conquistas relacionada.

### 10.9 Usuários bloqueados
- Lista de quem o usuário bloqueou, com botão "Desbloquear" por linha.

---

## 11. Perfil (próprio)

- Avatar (ou inicial do nome), nome, @handle.
- Links de navegação: Ver evolução, Conquistas, Desafios, Notificações, Solicitações de seguidor, Usuários bloqueados, Ver meu perfil público.
- Botão "Sair da conta".

---

## 12. Ações rápidas (botão flutuante)

Menu (modal deslizando de baixo) com 3 opções: **Iniciar treino**, **Check-in do dia**, **Postar**.

---

## 13. Painel administrativo (web, uso interno)

- Login via conta Clerk, restrito a e-mails autorizados (sem essa permissão, tela "Acesso restrito").
- **Fila de denúncias**: abas de filtro (Pendentes / Revisadas / Arquivadas / Todas). Cada denúncia mostra: motivo, status, data, quem denunciou, o alvo (post/comentário/usuário, com um resumo do conteúdo ou aviso se já foi removido), detalhes do denunciante. Ações "Marcar como revisado" / "Arquivar" (só em pendentes).
- Interface simples, HTML/CSS puro (não usa o design system do app mobile) — é a maior oportunidade de melhoria visual se quiser um painel mais robusto.

---

## 14. Sistema visual atual (resumo para referência de design)

- **Identidade**: "Performance Tech" — visual escuro como principal (quase preto), inspirado em wearables de saúde (Whoop/Oura), com gradiente de destaque verde-elétrico → azul usado em botões, barras de progresso, gauges e badges.
- **Cores** (`packages/ui/src/tokens/colors.ts`): tokens semânticos com versão clara e escura — fundo (base/elevado/rebaixado), texto (primário/secundário/inverso/desabilitado), bordas, cor de destaque (primária + secundária, usadas juntas em gradiente), feedback (sucesso/aviso/erro).
- **Tipografia**: escala com 7 variantes (display, title, headline, body, bodyStrong, caption, label).
- **Espaçamento**: escala de 4px (xxs a xxl).
- **Cantos**: 3 raios (sharp/soft/pill).
- **Componentes-base reutilizados em todo o app**: `Button` (com gradiente na variante primária + brilho), `Surface` (cartão, com opções de borda e brilho), `TextField`, `Stack`/`Text`.
- **Componentes de dado visual**: `RadialGauge` (anel de progresso circular com gradiente, usado no nível e no FIT Score), `ScoreBar` (barra horizontal com gradiente), `CircularTimer` (anel do temporizador de descanso).
- **Microinterações**: animações de toque em botões, curtidas, badges; tudo respeita "reduzir movimento" do sistema.
- **Acessibilidade**: rótulos de leitor de tela em todos os ícones sem texto visível.

---

## 15. Padrão de estados de tela (vale para praticamente toda tela com dados)

Toda tela que busca dados segue o mesmo padrão, relevante para prever os estados no redesign:
- **Carregando**: indicador de atividade centralizado.
- **Erro**: mensagem amigável + sugestão de puxar para atualizar.
- **Vazio**: ilustração/ícone + texto explicativo + call-to-action quando aplicável.
- **Sucesso**: conteúdo normal.

---

## 16. Fora do escopo atual (não desenhar como se existisse)

Para não gastar esforço de design em telas que não existem hoje:
- **Sem pagamento/checkout em lugar nenhum do app** — nem no diretório de personal (contato é sempre externo, WhatsApp/telefone/e-mail/Instagram).
- **Sem verificação de credenciais de profissionais** (é autodeclarado).
- **Sem demonstrações em vídeo/3D de exercícios** — hoje é só texto (nome, descrição, instruções).
- **Sem chat interno** entre usuários ou com profissionais.
- **Sem notificações push** — só notificações dentro do app.
- **Sem feed "algorítmico"** — é só cronológico (mais recente primeiro).
- **Painel admin só tem a fila de denúncias** — não tem gestão de usuários, conteúdo ou métricas ainda.
