# Relatório de Uso de Inteligência Artificial Generativa

Este documento registra todas as interações significativas com ferramentas de IA generativa (como Gemini, ChatGPT, Copilot, etc.) durante o desenvolvimento deste projeto. O objetivo é promover o uso ético e transparente da IA como ferramenta de apoio, e não como substituta para a compreensão dos conceitos fundamentais.

## Política de Uso
O uso de IA foi permitido para as seguintes finalidades:
- Geração de ideias e brainstorming de algoritmos.
- Explicação de conceitos complexos.
- Geração de código boilerplate (ex: estrutura de classes, leitura de arquivos).
- Sugestões de refatoração e otimização de código.
- Debugging e identificação de causas de erros.
- Geração de casos de teste.

É proibido submeter código gerado por IA sem compreendê-lo completamente e sem adaptá-lo ao projeto. Todo trecho de código influenciado pela IA deve ser referenciado neste log.

---

## Registro de Interações

*Copie e preencha o template abaixo para cada interação relevante.*

### Interação 1

- **Data:** 12/11/2025
- **Etapa do Projeto:** 1 - Armazenamento em JS e funções
- **Ferramenta de IA Utilizada:** Gemini 
- **Objetivo da Consulta:** Não sabia como armazenar dados com JS e precisava de um norte, com sintaxe e estruturas.

- **Prompt(s) Utilizado(s):**
  1. "Como posso armazenar dados utilziando JS? Me dê exemplos da esturtura e sintaxes para a aplicação."
  2. "Se eu colocar dessa menira o código pode dar algum erro crítico?"

- **Resumo da Resposta da IA:**
    A IA menciou a ideia de cookies, mas que a aplicação pura em JS seria mais eficiente. Deu exemplos de código e estruturação.

- **Análise e Aplicação:**
  A resposta da IA foi satisfatória e fundamental para a aplicação da função.

- **Referência no Código:**
  A lógica inspirada por esta interação foi implementada no arquivo `script2.js`.
  let cardIDcounter = 0; // Contador global para garantir IDs únicos


function createCard(value) {
    const memoryCard = document.createElement("div");
    memoryCard.classList.add("memory-card");
    memoryCard.dataset.cardValue = value;
    // ... (restante da lógica de criação das faces) ...
    return memoryCard;
}

for (let i = 0; i < nCards; i++) { // nCards = número de pares
    // Carta 1
    const newCard1 = createCard(i);
    newCard1.id = `card-${cardIDcounter}`;
    cardIDcounter++;

    // Carta 2 (o par)
    const newCard2 = createCard(i);
    newCard2.id = `card-${cardIDcounter}`;
    cardIDcounter++;

    cards.push(newCard1);
    cards.push(newCard2);
}
// Posteriormente: shuffle(cards);
// cards.forEach(card => board.appendChild(card));

---

function salvarProgresso() {
    // 1. Coleta o estado completo
    const gameState = {
        attempts: attempts,          // Salva as tentativas
        matchedPairs: matchedPairs,  // Salva os pares encontrados
        cardsState: cards.map(card => ({
            id: card.id,             // Chave para a restauração da ordem
            value: card.dataset.cardValue, // Chave para a recriação da carta
            isMatched: card.classList.contains('matched') // Estado da carta
        }))
    };

    // 2. Converte para string e salva
    localStorage.setItem('memoryGameSave', JSON.stringify(gameState));
}

function carregarProgresso() {
    const savedGameJSON = localStorage.getItem('memoryGameSave');
    if (!savedGameJSON) {
        return false; // Não há jogo salvo, iniciar um novo
    }
    
    const savedState = JSON.parse(savedGameJSON);
    
    // 1. Limpa o tabuleiro e o array atual
    board.innerHTML = ''; 
    cards = [];

    // 2. Restaura contadores
    attempts = savedState.attempts || 0;
    matchedPairs = savedState.matchedPairs || 0;
    // Atualiza o display: attemptsSpan.textContent = attempts;

    // 3. Recria as cartas na ordem SALVA
    savedState.cardsState.forEach(item => {
        const cardElement = createCard(item.value); // Recria o elemento
        cardElement.id = item.id; // Restaura o ID original
        
        if (item.isMatched) {
            // Aplica o estado de combinada
            cardElement.classList.add('matched', 'flip');
        }

        cards.push(cardElement);
        board.appendChild(cardElement); // Desenha na ordem salva
    });
    
    // É necessário re-adicionar os listeners após a recriação:
    // cards.forEach(card => card.addEventListener('click', flipCard));
    
    return true; // Jogo carregado com sucesso
}

---
### Interação 2

- **Data:** 12/11/25
- **Etapa do Projeto:** 2 - Otimização de funções e alterações
- **Ferramenta de IA Utilizada:** Gemini
- **Objetivo da Consulta:** Descobrir a melhor forma de estruturar o código + correção de funções alteradas
- **Prompt(s) Utilizado(s):** Poderia estruturar as funções já feitas em ordem de aplicação + alterá-las para função de inicio e fim de jogo.
                              Se ouver erros de sintaxe, corrija por favor.
- **Resumo da Resposta da IA:** A IA deu um passo a passo de como poderia ser feita a automação e corrijiu erros de sintaxe.
- **Análise e Aplicação:** Segui a instrução e ficou otimizado. Com funçõess de inicio e fim que adiantam alguns processos.
- **Referência no Código:** Função "IniciarJogo", "EndGame". `script2.js`.


function shuffle() {
    cards.forEach(card => {
        let randomPos = Math.floor(Math.random() * cards.length);
        // Otimização: Apenas altera uma propriedade CSS, não a estrutura do DOM.
        card.style.order = randomPos; 
    });
}

function disableCards() {
    // Otimização: Remove listeners para que o navegador não precise processar 
    // cliques em cartas que não mudarão de estado.
    firstCard.removeEventListener('click', flipCard);
    secondCard.removeEventListener('click', flipCard);
    // ...
}

---


### Interação 3

- **Data:** 12/11/25
- **Etapa do Projeto:** 3 - Debbug geral, correções e feedback.
- **Ferramenta de IA Utilizada:** Gemini
- **Objetivo da Consulta:** Corrigir o código se houver erros, dar feedback de melhorias e ajudar na lógica como um todo.
- **Prompt(s) Utilizado(s):** Avalie o código e me retorne um feedback completo em tabela
- **Resumo da Resposta da IA:** Fez exatamente o uqe pedi.
- **Análise e Aplicação:** Poderia ter mudanças, mas muitas alterações já foram feitas e optei por não alterar. Código funcional e mantendo a estrutura original e lógica.
- **Referência no Código:** todo ele. `script2.js`

function disableCards() {
    firstCard.classList.add('matched'); // Adiciona classe para destaque visual (ex: borda verde)
    secondCard.classList.add('matched');
    
}

function endGame() {
    // Feedback: Alerta o jogador com seu resultado final
    const playerName = prompt(`Parabéns! Você completou o jogo em ${attempts} tentativas.`);
    // ... (Lógica de salvamento) ...
    iniciarNovoJogo();
}
---

