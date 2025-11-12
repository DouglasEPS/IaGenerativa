const nCards = 8;
let cards = [];
const attemptsSpan = document.getElementById('attempts');
const board = document.getElementById("board")
let cardIDcounter = 0;

function createCard(value) {
  const memoryCard = document.createElement("div");
  memoryCard.classList.add("memory-card");
  memoryCard.dataset.cardValue = value;

  const frontFace = document.createElement("div")
  frontFace.classList.add("front-face");
  const backFace = document.createElement("div")
  backFace.classList.add("back-face");

  const frontParagraph = document.createElement("p");
  const backParagraph = document.createElement("p");

  frontParagraph.textContent = value;
  backParagraph.textContent = "?";

  frontFace.appendChild(frontParagraph);
  backFace.appendChild(backParagraph);
  memoryCard.appendChild(frontFace);
  memoryCard.appendChild(backFace);

  return (memoryCard);
}
carregarProgresso();

for (let i = 0; i < nCards; i++) {
  const newCard1 = createCard(i);
  newCard1.id = `card-${cardIDcounter}`;
  cardIDcounter++;

  const newCard2 = createCard(i);
  newCard2.id = `card-${cardIDcounter}`;
  cardIDcounter++;
  //Removi a aplicação imediata no DOM pois a minha lógica está indo para outro caminho
  cards.push(newCard1);
  cards.push(newCard2);

  
}
shuffle(cards);

cards.forEach(card => {
    board.appendChild(card);
});

let hasFlippedCard = false;
let lockBoard = false; // Bloqueia o tabuleiro para evitar cliques rápidos
let firstCard, secondCard;
let attempts = 0;
let matchedPairs = 0; // Contador de pares encontrados

function flipCard() {
  // Se o tabuleiro estiver bloqueado ou a carta clicada for a mesma, ignora o clique
  if (lockBoard) return;
  if (this === firstCard) return;

  this.classList.add('flip'); // Adiciona a classe 'flip' à carta clicada

  if (!hasFlippedCard) {
    // Primeiro clique
    hasFlippedCard = true;
    firstCard = this;
    return;
  }

  // Segundo clique
  secondCard = this;
  hasFlippedCard = false; // Reseta para o próximo turno

  checkForMatch();
}

function checkForMatch() {
  // Incrementa o contador de tentativas
  attempts++;
  attemptsSpan.textContent = attempts;

  // Verifica se os data-attributes das duas cartas são iguais
  let isMatch = firstCard.dataset.cardValue === secondCard.dataset.cardValue;

  // Se for um par, desabilita as cartas. Se não, vira-as de volta.
  if(isMatch){
    disableCards();
    salvarProgresso();
  }else{
    unflipCards();
  }
  
}

function disableCards() {
  // Remove o ouvinte de evento para que as cartas não possam mais ser clicadas
  firstCard.removeEventListener('click', flipCard);
  secondCard.removeEventListener('click', flipCard);

  // Incrementa o contador de pares
  matchedPairs++;
  // Verifica se o jogo terminou (todos os pares encontrados)
  if (matchedPairs === nCards) {
    // Atraso para o jogador ver a última carta virar
    setTimeout(endGame, 1000);
  }

  resetBoard();
}

function unflipCards() {
  lockBoard = true; // Bloqueia o tabuleiro

  // Após 1.5 segundos, remove a classe 'flip' para virar as cartas de volta
  setTimeout(() => {
    firstCard.classList.remove('flip');
    secondCard.classList.remove('flip');

    resetBoard();
  }, 1500);
}

function resetBoard() {
  // Reseta as variáveis de estado do jogo
  [hasFlippedCard, lockBoard] = [false, false];
  [firstCard, secondCard] = [null, null];
}

function shuffle() {
    cards.forEach(card => {
        let randomPos = Math.floor(Math.random() * cards.length);
        card.style.order = randomPos;
    });
}

function salvarProgresso() {
    // Percorre o array 'cards' (que está na ordem embaralhada)
    const gameState = cards.map(card => ({
        // 1. ID: Essencial para identificar a carta, independente da posição.
        id: card.id, 
        // 2. VALUE: Essencial para recriar a carta na função createCard().
        value: card.dataset.cardValue, 
        // 3. ESTADO: Indica se o par já foi combinado.
        isMatched: card.classList.contains('matched')
    }));

    // Armazena a lista na ordem atual (que é a ordem do tabuleiro)
    localStorage.setItem('memoryGameSave', JSON.stringify(gameState));
    console.log('Jogo salvo com a ordem embaralhada e estado.');
}

function carregarProgresso() {
    const savedGameJSON = localStorage.getItem('memoryGameSave');
    if (!savedGameJSON) {
        // Se não houver save, inicia um novo jogo embaralhado
        resetBoard(); 
        return false;
    }
    
    const savedState = JSON.parse(savedGameJSON);
    
    // 1. Limpa o tabuleiro visual e o array de cartas
    board.innerHTML = ''; 
    cards = [];

    savedState.forEach(item => {
        // 2. Recria o elemento HTML com o valor salvo.
        // O valor do ID ('0', '1', etc.) é extraído do ID completo para passar como cardId, 
        // se a sua createCard() precisar disso. Se não, simplifique.
        
        // Assumindo que sua createCard precisa apenas do valor:
        const cardElement = createCard(item.value);
        cardElement.id = item.id; // Garante o ID único correto
        
        // 3. Aplica o estado salvo (isMatched)
        if (item.isMatched) {
            cardElement.classList.add('matched', 'flipped');
            // Desativar clique nesta carta (depende da sua lógica de clique)
        }

        // 4. Monta o tabuleiro na ordem salva
        cards.push(cardElement);
        board.appendChild(cardElement);
    });
    
    // 5. Inicia o jogo a partir do estado carregado
    // setupListeners(); // Exemplo: Reativa os eventos de clique

    console.log('Jogo carregado na ordem salva.');
    return true;
}

// Adiciona o evento de clique a cada uma das cartas
cards.forEach(card => card.addEventListener('click', flipCard));


// ===================================================================
// NOVO: FUNÇÕES DE FIM DE JOGO E SALVAMENTO
// ===================================================================

function endGame() {
  // Desabilita o tabuleiro
  lockBoard = true;
  localStorage.removeItem('memoryGameSave');

  const playerName = prompt(`Parabéns! Você completou o jogo em ${attempts} tentativas.\n\nDigite seu nome para salvar:`);

  if (playerName && playerName.trim() !== "") {
    // Chama o método de salvamento
    saveScoreByAjax(playerName);
    // Para testar o método 2 (formulário), descomente a linha abaixo:
    // saveScoreByForm(playerName);
  } else {
    // Se o usuário cancelar
    alert("Pontuação não salva. Reiniciando o jogo.");
    // MODIFICADO: Redireciona para a página de jogar
    window.location.href = 'index.php?page=jogar';
  }
}

/**
 * MÉTODO 1: Salvar pontuação usando AJAX (Fetch API)
 */
function saveScoreByAjax(playerName) {
  const formData = new FormData();
  formData.append('nome', playerName);
  formData.append('tentativas', attempts);

  console.log("Enviando (AJAX):", playerName, attempts);

  fetch('salvar_pontuacao.php', {
    method: 'POST',
    body: formData,
    headers: {
      'X-Requested-With': 'XMLHttpRequest'
    }
  })
    .then(response => {
      if (!response.ok) {
        throw new Error(`Erro do servidor: ${response.status}`);
      }
      return response.json();
    })
    .then(data => {
      console.log('Resposta do servidor (AJAX):', data.message);

      // MODIFICADO: Redireciona para a página de placar após salvar
      alert("Pontuação salva! Redirecionando para o placar.");
      window.location.href = 'index.php?page=placar';
    })
    .catch(error => {
      console.error('Falha ao salvar pontuação via AJAX:', error);
      alert('Houve um erro ao salvar sua pontuação. Verifique o console.');
      // MODIFICADO: Redireciona de volta para o jogo em caso de erro
      window.location.href = 'index.php?page=jogar';
    });
}


/**
 * MÉTODO 2: Salvar pontuação usando envio de Formulário Oculto (Comentado)
 */
/*
function saveScoreByForm(playerName) {
  console.log("Enviando (Formulário Oculto):", playerName, attempts);

  // Preenche os campos ocultos
  document.getElementById('hiddenName').value = playerName;
  document.getElementById('hiddenAttempts').value = attempts;
  
  // Submete o formulário.
  // O 'salvar_pontuacao.php' foi atualizado para redirecionar
  // para 'index.php?page=placar' após a submissão.
  document.getElementById('scoreForm').submit();
}
*/
