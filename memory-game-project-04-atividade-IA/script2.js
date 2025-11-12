const nCards = 8;
let cards = [];
const attemptsSpan = document.getElementById('attempts');
const board = document.getElementById("board")
let cardIDcounter = 0; // Usado no loop de criação

let hasFlippedCard = false;
let lockBoard = false;
let firstCard, secondCard;
let attempts = 0;
let matchedPairs = 0; 


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

    return memoryCard;
}

function salvarProgresso() {
    // Salva o estado completo, incluindo a ordem atual das cartas
    const gameState = {
        attempts: attempts,
        matchedPairs: matchedPairs,
        cardsState: cards.map(card => ({
            id: card.id,
            value: card.dataset.cardValue,
            isMatched: card.classList.contains('matched')
        }))
    };
    localStorage.setItem('memoryGameSave', JSON.stringify(gameState));
}

function carregarProgresso() {
    const savedGameJSON = localStorage.getItem('memoryGameSave');
    if (!savedGameJSON) {
        return false;
    }
    
    const savedState = JSON.parse(savedGameJSON);
    
    // 1. Limpa o DOM e o array 'cards'
    board.innerHTML = ''; 
    cards = [];

    // 2. Restaura contadores
    attempts = savedState.attempts || 0;
    matchedPairs = savedState.matchedPairs || 0;
    attemptsSpan.textContent = attempts;
    cardIDcounter = 0; // Resetamos para o loop de criação (embora não seja chamado aqui)

    // 3. Recria as cartas na ordem SALVA e aplica o estado
    savedState.cardsState.forEach(item => {
        const cardElement = createCard(item.value);
        cardElement.id = item.id; 
        
        if (item.isMatched) {
            cardElement.classList.add('matched', 'flip');
        }

        cards.push(cardElement);
        board.appendChild(cardElement); // Desenha na ordem salva
    });
    
    return true;
}

function iniciarNovoJogo() {
    // Limpa o tabuleiro visual e o array (necessário se o jogo for reiniciado)
    board.innerHTML = ''; 
    cards = [];
    
    // Reseta contadores e estado
    cardIDcounter = 0;
    attempts = 0;
    matchedPairs = 0;
    attemptsSpan.textContent = attempts;
    resetBoard(); // Reseta variáveis de jogada

    // Criação e População do array 'cards'
    for (let i = 0; i < nCards; i++) {
        const newCard1 = createCard(i);
        newCard1.id = `card-${cardIDcounter++}`; // cada carta recebe um id para gravar no json

        const newCard2 = createCard(i);
        newCard2.id = `card-${cardIDcounter++}`;

        cards.push(newCard1, newCard2);
    }
    
    // Embaralhamento e Desenho
    shuffle(); // Chama a função de embaralhamento
    cards.forEach(card => {
        board.appendChild(card);
    });

    // Adiciona os listeners
    cards.forEach(card => card.addEventListener('click', flipCard));
}


if (!carregarProgresso()) {
    // Se não carregou o save, executa a lógica de criação de um novo jogo
    iniciarNovoJogo();
} else {
    // Se carregou o save, as cartas já foram desenhadas na ordem salva, 
    // mas precisamos adicionar os listeners às cartas
    cards.forEach(card => card.addEventListener('click', flipCard));
}

function flipCard() {
    if (lockBoard) return;
    if (this === firstCard) return;
    if (this.classList.contains('matched')) return; 

    this.classList.add('flip');

    if (!hasFlippedCard) {
        hasFlippedCard = true;
        firstCard = this;
        return;
    }

    secondCard = this;
    hasFlippedCard = false; 

    checkForMatch();
}

function checkForMatch() {
    attempts++;
    attemptsSpan.textContent = attempts;

    let isMatch = firstCard.dataset.cardValue === secondCard.dataset.cardValue;

    if(isMatch){
        disableCards();
        salvarProgresso();
    }else{
        unflipCards();
    }
}

function disableCards() {
    firstCard.removeEventListener('click', flipCard);
    secondCard.removeEventListener('click', flipCard);

    // Adiciona a classe 'matched' para armazenamento no json e estilo
    firstCard.classList.add('matched');
    secondCard.classList.add('matched');

    matchedPairs++;
    
    if (matchedPairs === nCards) {
        setTimeout(endGame, 1000); // Chama a nova função endGame
    }

    resetBoard();
}

function unflipCards() {
    lockBoard = true; 

    setTimeout(() => {
        firstCard.classList.remove('flip');
        secondCard.classList.remove('flip');
        salvarProgresso();
        resetBoard();
    }, 1500);
}

function resetBoard() {
    [hasFlippedCard, lockBoard] = [false, false];
    [firstCard, secondCard] = [null, null];
}

function shuffle() {
    cards.forEach(card => {
        let randomPos = Math.floor(Math.random() * cards.length);
        card.style.order = randomPos;
        // Garante que o estado 'flip' e 'matched' não seja aplicado ao embaralhar
        card.classList.remove('flip', 'matched'); 
    });
}

function endGame() {
    lockBoard = true;
    localStorage.removeItem('memoryGameSave'); // Limpa o save após o jogo
    
    const playerName = prompt(`Parabéns! Você completou o jogo em ${attempts} tentativas.`);

    if (playerName) {
        // Exemplo: saveScoreByAjax(playerName);
    }
    
    // Inicia um novo jogo
    iniciarNovoJogo();
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

