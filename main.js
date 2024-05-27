const performActionButton = document.getElementById('performAction');
const actionChoiceDropdown = document.getElementById('actionChoice');
let pawnElement = document.createElement('div');

class Pawn {
    
    constructor(type) {
        this.type = type; // 'player' or 'enemy'
        this.id =
        this.movementDiceSides = 6;
        this.attackDiceSides = 6;
        this.defenseDiceSides = 6;
        this.actionsDiceSides = 6;
        this.healthDiceSides = 6;
        this.movementDiceAmount = 6;
        this.attackDiceAmount = 1;
        this.defenseDiceAmount = 1;
        this.actionsDiceAmount = 1;
        this.healthDiceAmount = 1;
        this.points = 100;
        this.actions = 1;
        this.health = 1;

        this.upgradeCosts = {
            movement: 10,
            attack: 10,
            defense: 10,
            actions: 10,
            health: 10
        };

        this.position = { x: 0, y: 0 }; // Starting position
    }
    

    upgrade(stat) {
        if (this.points < this.upgradeCosts[stat]) return;

        this.points -= this.upgradeCosts[stat];
        this.upgradeCosts[stat] += 10; // Increase the cost for next upgrade

        switch(stat) {
            case 'movement':
                this.movementDiceSides = this.upgradeDiceSides(this.movementDiceSides);
                break;
            case 'attack':
                this.attackDiceSides = this.upgradeDiceSides(this.attackDiceSides);
                break;
            case 'defense':
                this.defenseDiceSides = this.upgradeDiceSides(this.defenseDiceSides);
                break;
            case 'actions':
                this.actions++;
                break;
            case 'health':
                this.health++;
                break;
        }
    }
    

    upgradeDiceSides(diceSides) {
        return diceSides + 2; // Upgrade dice sides (d6 -> d8 -> d10 ...)
    }

    rollDice(diceSides) {
        return Math.floor(Math.random() * diceSides) + 1;
    }
}


let initialPlacementDone = false;


const BOARD_SIZE = 20; // Change this for different board sizes
const board = document.getElementById('board');
board.style.gridTemplateColumns = `repeat(${BOARD_SIZE}, 1fr)`;

for (let i = 0; i < BOARD_SIZE * BOARD_SIZE; i++) {
    const cell = document.createElement('div');
    cell.className = 'cell';
    cell.dataset.index = i; // Add index for easy identification
    board.appendChild(cell);
}

const player = new Pawn('player');
const enemies = [new Pawn('enemy'), new Pawn('enemy')]; // Add more enemies as needed
updateActionOptions();

// Place pawns on the board
initialPlacePawn(player, 0, 0); // Player starts at top-left
placePawn(enemies[0], BOARD_SIZE - 1, BOARD_SIZE - 1); // Enemy 1 starts at bottom-right
placePawn(enemies[1], BOARD_SIZE - 1, 0); // Enemy 2 starts at bottom-left



function initialPlacePawn(pawn, x, y) {
    console.log(`Placing ${pawn.type} at (${x}, ${y})`);
    const index = x + y * BOARD_SIZE;
    const cell = board.children[index];
    pawnElement = document.createElement('div');
    pawnElement.className = 'pawn';
    if (pawn.type === 'enemy') pawnElement.classList.add('enemy');
    cell.appendChild(pawnElement);
    pawn.position = { x, y }; // Update pawn's position
    initialPlacementDone = true;
}

function placePawn(pawn, x, y) {
    if (initialPlacementDone) {
        clearPawn(pawn); // Clear previous position after initial placement
    }
    const index = x + y * BOARD_SIZE;
    const cell = board.children[index];
    const pawnElement = document.createElement('div');
    pawnElement.className = 'pawn';
    if (pawn.type === 'enemy') pawnElement.classList.add('enemy');
    cell.appendChild(pawnElement);
    pawn.position = { x, y }; // Update pawn's position
}

function clearPawn(pawn) {
    const { x, y } = pawn.position;
    const index = x + y * BOARD_SIZE;
    const cell = board.children[index];
    if (cell) {
        cell.innerHTML = ''; // Remove any existing pawn from this cell
    }
}

// Handle upgrade button click
const upgradeButton = document.getElementById('upgradeButton');
const upgradeChoice = document.getElementById('upgradeChoice');
const pointsDisplay = document.getElementById('points');

upgradeButton.addEventListener('click', () => {
    const stat = upgradeChoice.value;
    player.upgrade(stat);
    pointsDisplay.textContent = `Points: ${player.points}`;
});

// Handle movement roll and click to move
document.addEventListener('keydown', handleKeyMovement);

let movementRange = 0;

function handleKeyMovement(event) {
    const key = event.key;
    let newX = player.position.x;
    let newY = player.position.y;

    switch(key) {
        case 'ArrowUp':
            newY -= 1;
            break;
        case 'ArrowDown':
            newY += 1;
            break;
        case 'ArrowLeft':
            newX -= 1;
            break;
        case 'ArrowRight':
            newX += 1;
            break;
        case 'Enter':
            if (isWithinRange(newX, newY, movementRange)) {
                movePawn(player, newX, newY);
            }
            return;
    }

    highlightCell(newX, newY);
}

function highlightCell(x, y) {
    const index = x + y * BOARD_SIZE;
    if (index < 0 || index >= BOARD_SIZE * BOARD_SIZE) return; // Out of bounds
    document.querySelectorAll('.highlight').forEach(cell => cell.classList.remove('highlight'));
    const cell = board.children[index];
    cell.classList.add('highlight');
}

function isWithinRange(x, y, range) {
    const dx = Math.abs(player.position.x - x);
    const dy = Math.abs(player.position.y - y);
    return Math.max(dx, dy) <= range; // Allow diagonal movement
}

function movePawn(pawn, x, y) {
    if (!isOccupied(x, y)) {
        placePawn(pawn, x, y);
        updateActionOptions();
    } else {
        console.log("Collision detected! Can't move to occupied position.");
    }
}

// Example of rolling a die
movementRange = player.rollDice(player.movementDiceSides);
console.log('Player movement roll:', movementRange);

board.addEventListener('click', (event) => {
    const cell = event.target.closest('.cell');
    if (!cell) return;
    const index = Number(cell.dataset.index);
    const x = index % BOARD_SIZE;
    const y = Math.floor(index / BOARD_SIZE);

    if (isWithinRange(x, y, movementRange)) {
        movePawn(player, x, y);
    }
});

function isOccupied(x, y) {
    // Check if the position (x, y) is occupied by any pawn (player or enemy)
    return enemies.some(enemy => enemy.position.x === x && enemy.position.y === y) || 
           (player.position.x === x && player.position.y === y);
}

// Define the function to be called onclick
function performAction() {
    const selectedAction = actionChoiceDropdown.value;
    switch(selectedAction) {
        case 'movement':
            handleMovementAction();
            break;
        case 'attack':
            handleAttackAction();
            break;
        case 'giveDice':
            handleGiveDiceAction();
            break;
        default:
            console.error('Invalid action selected');
    }
}

function updateActionOptions() {
    const adjacentPawns = getAdjacentPawns(player.position.x, player.position.y);
    const actionChoice = document.getElementById('actionChoice');
    
    // Reset the options
    actionChoice.innerHTML = '';

    // Add default options
    const defaultOptions = ['Movement'];
    if (adjacentPawns.length > 0) {
        defaultOptions.push('Attack', 'Give Dice');
    }
    defaultOptions.forEach(option => {
        const optionElement = document.createElement('option');
        optionElement.value = option.toLowerCase();
        optionElement.textContent = option;
        actionChoice.appendChild(optionElement);
    });
}

function getAdjacentPawns(x, y) {
    const adjacentPositions = [
        { x: x - 1, y: y },
        { x: x + 1, y: y },
        { x: x, y: y - 1 },
        { x: x, y: y + 1 },
        { x: x - 1, y: y - 1 },
        { x: x - 1, y: y + 1 },
        { x: x + 1, y: y - 1 },
        { x: x + 1, y: y + 1 }
    ];
    
    return adjacentPositions.filter(pos => {
        return isOccupied(pos.x, pos.y);
    });
}

function showPawnInfo(pawn) {
    console.log("Pawn Variable Type:", typeof pawn); // Log the type of the pawn variable
    console.log("Pawn Object:", pawn); // Log the entire pawn object
    console.log("Movement Dice Amount:", pawn.movementDiceAmount);
    console.log("Movement Dice Sides:", pawn.movementDiceSides);
    const pawnInfo = document.createElement('div');
    pawnInfo.className = 'pawn-info';
    const stats = `
        Type: ${pawn.type}<br>
        Movement Dice: ${pawn.movementDiceAmount}d${pawn.movementDiceSides}<br>
        Attack Dice: ${pawn.attackDiceAmount}d${pawn.attackDiceSides}<br>
        Defense Dice: ${pawn.defenseDiceAmount}d${pawn.defenseDiceSides}<br>
        Actions Dice: ${pawn.actionsDiceAmount}d${pawn.actionsDiceSides}<br>
        Health Dice: ${pawn.healthDiceAmount}d${pawn.healthDiceSides}<br>
        Points: ${pawn.points}<br>
        Actions: ${pawn.actions}<br>
        Health: ${pawn.health}<br>
    `;
    pawnInfo.innerHTML = stats;
    pawnElement.appendChild(pawnInfo); //TODO: I'm having trouble here, the game thinks this is a function for some reason. It seems to be because pawn is a string and not a dom. I want it to apend to the cirle.
}

function hidePawnInfo(pawn) {
    const pawnInfo = pawnElement.querySelector('.pawn-info');
    if (pawnInfo) {
        pawnInfo.remove();
    }
}

// Add event listeners for hover events on pawns
board.addEventListener('mouseover', (event) => {
    const cell = event.target.closest('.cell');
    if (!cell) return;
    const pawn = cell.querySelector('.pawn');
    if (pawn) {
        const pawnType = pawn.classList.contains('enemy') ? 'enemy' : 'player';
        const index = Number(cell.dataset.index);
        const x = index % BOARD_SIZE;
        const y = Math.floor(index / BOARD_SIZE);
        const currentPawn = pawnType === 'enemy' ? enemies.find(enemy => enemy.position.x === x && enemy.position.y === y) : player;
        showPawnInfo(currentPawn);
    }
});

board.addEventListener('mouseout', (event) => {
    const cell = event.target.closest('.cell');
    if (!cell) return;
    const pawn = cell.querySelector('.pawn');
    if (pawn) {
        const pawnType = pawn.classList.contains('enemy') ? 'enemy' : 'player';
        const index = Number(cell.dataset.index);
        const x = index % BOARD_SIZE;
        const y = Math.floor(index / BOARD_SIZE);
        const currentPawn = pawnType === 'enemy' ? enemies.find(enemy => enemy.position.x === x && enemy.position.y === y) : player;
        hidePawnInfo(currentPawn);
    }
});