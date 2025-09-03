// ================== VARIABLES ==================
let runningCount = 0;
let cardsPlayed = 0;
let totalDecks = 6;

const ranks = ["2","3","4","5","6","7","8","9","10","J","Q","K","A"];
let playerCards = [];

const deckInput = document.getElementById("deckInput");
const cardPane = document.getElementById("cardPane");
const runningCountLabel = document.getElementById("runningCountLabel");
const trueCountLabel = document.getElementById("trueCountLabel");

const dealerCardBox = document.getElementById("dealerCardBox");
const playerCardPane = document.getElementById("playerCardPane");
const basicStrategyLabel = document.getElementById("basicStrategyLabel");
const adjustedStrategyLabel = document.getElementById("adjustedStrategyLabel");

const resetGameBtn = document.getElementById("resetGameBtn");
const resetHandBtn = document.getElementById("resetHandBtn");

// ================== INICIALIZACIÓN ==================
function init() {
    // Spinner mazos
    deckInput.addEventListener("change", () => {
        totalDecks = parseInt(deckInput.value);
        updateLabels();
    });

    // Botones de cartas para el conteo
    ranks.forEach(rank => {
        const btn = document.createElement("button");
        btn.textContent = rank;
        btn.addEventListener("click", () => cardClicked(rank));
        cardPane.appendChild(btn);
    });

    // Cartas del jugador
    ranks.forEach(rank => {
        const btn = document.createElement("button");
        btn.textContent = rank;
        btn.addEventListener("click", () => playerCardClicked(rank));
        playerCardPane.appendChild(btn);
    });

    // Opciones del crupier
    ranks.forEach(rank => {
        const opt = document.createElement("option");
        opt.value = rank;
        opt.textContent = rank;
        dealerCardBox.appendChild(opt);
    });

    // Botones
    resetGameBtn.addEventListener("click", resetGame);
    resetHandBtn.addEventListener("click", resetHand);

    updateLabels();
}

init();

// ================== FUNCIONES CONTADOR ==================
function cardClicked(rank) {
    runningCount += getCardValue(rank);
    cardsPlayed++;
    updateLabels();
}

function getCardValue(rank) {
    if (["2","3","4","5","6"].includes(rank)) return 1;
    if (["7","8","9"].includes(rank)) return 0;
    return -1;
}

function trueCount() {
    const decksRemaining = (totalDecks * 52 - cardsPlayed) / 52;
    return decksRemaining > 0 ? runningCount / decksRemaining : runningCount;
}

function updateLabels() {
    runningCountLabel.textContent = "Cuenta corriente: " + runningCount;
    trueCountLabel.textContent = "Cuenta verdadera: " + trueCount().toFixed(2);
}

function resetGame() {
    runningCount = 0;
    cardsPlayed = 0;
    updateLabels();
}

// ================== FUNCIONES ESTRATEGIA ==================
function playerCardClicked(rank) {
    playerCards.push(rank);
    updateStrategy();
}

function resetHand() {
    playerCards = [];
    dealerCardBox.value = "";
    basicStrategyLabel.textContent = "Estrategia básica: -";
    adjustedStrategyLabel.textContent = "Ajustada a la cuenta: -";
}

function calculateHandValue(hand) {
    let total = 0;
    let aces = 0;
    hand.forEach(card => {
        if (card === "A") { total += 11; aces++; }
        else if (["J","Q","K","10"].includes(card)) total += 10;
        else total += parseInt(card);
    });
    while (total > 21 && aces > 0) {
        total -= 10;
        aces--;
    }
    return total;
}

function isSoftHand(hand) {
    return hand.includes("A") && calculateHandValue(hand) <= 21;
}

function cardToValue(rank) {
    if (rank === "A") return 11;
    if (["J","Q","K","10"].includes(rank)) return 10;
    return parseInt(rank);
}

function getBasicStrategy(total, dealerValue, isSoft, isPair) {
    if (isPair) {
        if (total === 16) return "Separar"; // 8,8
        if (total === 20) return "Quedarse"; // 10,10
        if (total === 22) return "Separar"; // A,A
    }

    if (isSoft) {
        if (total <= 17) return "Pedir";
        if (total === 18) return dealerValue >= 9 ? "Pedir" : "Quedarse";
        return "Quedarse";
    }

    if (total <= 8) return "Pedir";
    if (total === 9) return (dealerValue >= 3 && dealerValue <= 6 ? "Doblar" : "Pedir");
    if (total === 10) return (dealerValue <= 9 ? "Doblar" : "Pedir");
    if (total === 11) return "Doblar";
    if (total === 12) return (dealerValue >= 4 && dealerValue <= 6 ? "Quedarse" : "Pedir");
    if (total >= 13 && total <= 16) return (dealerValue <= 6 ? "Quedarse" : "Pedir");
    return "Quedarse";
}

function adjustByTrueCount(basicMove) {
    const tc = trueCount();
    if (tc >= 3 && basicMove === "Pedir") return "Quedarse (ajustado por cuenta alta)";
    if (tc <= -2 && basicMove === "Quedarse") return "Pedir (ajustado por cuenta baja)";
    return basicMove + " (sin cambio)";
}

function updateStrategy() {
    const dealer = dealerCardBox.value;
    if (!dealer || playerCards.length === 0) return;

    const total = calculateHandValue(playerCards);
    const isSoft = isSoftHand(playerCards);
    const isPair = playerCards.length === 2 && playerCards[0] === playerCards[1];
    const dealerValue = cardToValue(dealer);

    const basicMove = getBasicStrategy(total, dealerValue, isSoft, isPair);
    const adjustedMove = adjustByTrueCount(basicMove);

    basicStrategyLabel.textContent = "Estrategia básica: " + basicMove;
    adjustedStrategyLabel.textContent = "Ajustada a la cuenta: " + adjustedMove;
}