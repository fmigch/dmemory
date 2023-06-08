class SplashScreen {
    constructor(title) {
        this.waitTillStartSeconds = 1;
        this.fadeSeconds = 1;
        this.visibleSplashSeconds = 2;
        this.splashContainer = document.querySelector('.splash-container');
        this.splashTitleContainer = document.querySelector('.splash-header');
        this.splashTitleContainer.textContent = title;
    }

    showAndHide() {
        return new Promise((resolve) => {
            this.show();

            setTimeout(() => {
                this.hide();
            }, (this.waitTillStartSeconds * 1000) + (this.visibleSplashSeconds * 1000) + (this.fadeSeconds * 1000) - (this.fadeSeconds * 1000));

            setTimeout(() => {
                resolve();
            }, (this.waitTillStartSeconds * 1000) + (this.visibleSplashSeconds * 1000) + (this.fadeSeconds * 1000));
        });
    }

    show() {
        this.splashContainer.classList.remove('hidden');
        setTimeout(() => {
            this.splashContainer.style.opacity = 1;
        }, this.waitTillStartSeconds * 1000);
    }

    hide() {
        this.splashContainer.style.opacity = 0;

        setTimeout(() => {
            this.splashContainer.classList.add('hidden');
        }, this.fadeSeconds * 1000);
    }
}

class Modal {
    constructor(title, btnLabel = false, btnActionClass = false, btnActionFunc = false, btnActionArg = false) {
        this.modalContainer = document.querySelector(".popup-message");
        this.modalContentContainer = this.modalContainer.querySelector(".popup-message-content");
        this.modalContentTitleContainer = this.modalContentContainer.querySelector(".popup-message-text");
        this.modalContentTitleContainer.textContent = title;

        if(document.contains(document.getElementById("modalBtn"))) {
            document.getElementById("modalBtn").remove();
        } 

        if(btnLabel) {
            this.modalButton = document.createElement('button');
            this.modalButton.setAttribute('id', 'modalBtn');
            this.modalButton.classList.add('popup-button');
            this.modalButton.textContent = btnLabel;
            this.modalButton.addEventListener('click', () => {
                this.hide();
                btnActionClass[btnActionFunc]();
            });
    
            this.modalContentContainer.appendChild(this.modalButton);
        }
    }

    show() { 
        this.modalContainer.classList.add("show-popup-message");
    }

    hide() {
        this.modalContainer.classList.remove("show-popup-message");
    }
}

class GameData {
    constructor() {
        this.Data = {
            'pickedCards': [],
            'flippedCards': [],
            'currentPlayerId': 1,
            'currentPlayerType': 'player',
            'playerFlipAllowed': false,
            'points': []
        }
    }

    getData() {
        return this.Data;
    }

    addPointData(players) {
        players.forEach(player => {
            const playerData = {
                'roundsWon': 0,
                'currentRoundPoints': 0
            };
            this.Data.points.push(playerData);
        });
    }
}

class Game {
    constructor() {
        this.gameContainer = document.querySelector('.game-container');
        this.boardContainer = document.getElementById('board'); 

        // reset from previous rounds
        this.cleanup();

        // get cards
        this.cardCollection = new CardCollection();

        // players for this game
        this.players = new PlayerCollection(
            [
                {
                    name: 'You'
                },
                {
                    name: 'Computer',
                    type: 'pc'
                }
            ]
        );
    }

    getCardData() {
        return this.cardCollection.getData();
    }

    getGameData() {
        const gameData = new GameData();
        const players = this.players.getPlayers();
        gameData.addPointData(players);
        return gameData.getData();
    }

    cleanup() {
        // clear cards html
        this.removeChilds(this.boardContainer);

        // clear player html
        this.removeChilds(this.gameContainer.querySelectorAll('.game-header')[0]);

        this.gameContainer.classList.remove('fadein');
    }

    removeChilds(parent) {
        while(parent.firstChild) {
            parent.removeChild(parent.firstChild);
        }
    }

    start() {
        const cardData = this.getCardData();
        const gameData = this.getGameData();
        const round = new Round(this.players, gameData, cardData, this.cardCollection, this.boardContainer);

        this.gameContainer.classList.remove('hidden');
    
        setTimeout(() => {
            this.gameContainer.classList.add('fadein');
            round.start();
        }, 500)
    }
}

class CardCollection {
    constructor() {
        this.fademilliseconds = 400;

        this.items = [
            {
                image: "dragons/dragon1.png"
            },
            {
                image: "dragons/dragon2.png"
            },
            {
                image: "dragons/dragon3.png"
            },
            {
                image: "dragons/dragon4.png"
            }
        ];
    }

    getData() {
        return this.shuffle(this.modify(this.items));
    }

    modify(cards) {
        let cardId = 1;
        let groupId = 1;
        cards.forEach(card => {
            // update current item
            card.id = cardId;
            card.groupId = groupId;
            card.flipped = false;
            card.picked = false;
            card.seen = false;
            cardId++;
    
            // add the duplicate item
            let nCard =
            {
                id: cardId,
                groupId: groupId,
                image: card.image,
                title: card.title,
                flipped: false,
                picked: false,
                seen: false
            };
    
            cards.push(nCard);
            cardId++;
            groupId++;
        });

        return cards;
    }

    shuffle(cards) {
        return cards.sort(() => Math.random() - 0.5);
    }

    show(cards, container, turn, gameData) {
        return new Promise((resolve) => {
            cards.forEach((card, i) => {
                setTimeout(() => {
                    new Card(card, container, turn, gameData);
                    if(cards.length == i + 1) {
                        setTimeout(() => {
                            resolve();
                        }, this.fademilliseconds);
                    }
                }, i * this.fademilliseconds);
            });
        });
    }
}

class Card {
    constructor(card, parentElement, turn, gameData) {
        this.turn = turn;

        const bluePrint = [
            {
                'class': 'card-container',
                'id': 'card-' + card.id
            },
            {
                'class': 'card-base',
                'eventClick': 'click',
            },
            {
                'class': 'card-inner'
            },
            {
                'class': [
                    'card-face',
                    'card-front'
                ]
            },
            {
                'type': 'img',
                'src': 'images/cardback.png',
                'class': 'card-front-image'
            },
            {
                'parent': 3,
                'type': 'span',
                'content': '?',
                'class': 'card-front-text'
            },
            {
                'parent': 2,
                'class': [
                    'card-face',
                    'card-back'
                ]
            },
            {
                'type': 'img',
                'src': 'images/' + card.image,
                'class': 'card-image'
            },
        ];

        new HtmlGenerator(bluePrint, parentElement, this, card);
        this.gameData = gameData;
    }

    click(card) {
        if(this.gameData.playerFlipAllowed) {
            if(this.turn.isFlipAllowed(card)) this.turn.flipCard(card);
            if(this.turn.isDone()) this.turn.end();
        }
    }
}

class Round {
    constructor(players, gameData, cardData, cardCollection, boardContainer) {
        this.players = players;
        this.gameData = gameData;
        this.cardData = cardData;
        this.cardCollection = cardCollection;
        this.boardContainer = boardContainer;
    }

    start() {
        const turn = new Turn(this, this.players, this.gameData, this.cardData);
        this.showCards(turn);
        this.players.show();
    }

    end() {
        // calculate who has won the round
        const points = [];
        this.gameData.points.forEach((point) => {
            points.push(point.currentRoundPoints);
        });
        

        if(points.every((val, i, arr) => val === arr[0])) {
            // draw
            const successMessage = new Modal("Draw", 'Try again', new Game(), 'start');
            successMessage.show();
        } else {
            const playerWonIdex = points.indexOf(Math.max(...points));
            const players = this.players.getPlayers();

             // show win message
            const successMessage = new Modal(players[playerWonIdex].name + " won!", 'Try again', new Game(), 'start');
            successMessage.show();
        }
    }

    async showCards(turn) {
        await this.cardCollection.show(this.cardData, this.boardContainer, turn, this.gameData);

        // start turn
        turn.start();
    }
}

class Turn {
    constructor(round, players, gameData, cards) {
        this.round = round;
        this.players = players;
        this.gameData = gameData;
        this.cards = cards;
    }

    start(playerId = null) {
        setTimeout(() => {
            if(playerId) {
                this.setActivePlayer(playerId);
            } else {
                this.setActivePlayer(this.gameData.currentPlayerId);
            }

            // if pc turn, pick 2 cards
            if(this.gameData.currentPlayerType == 'pc') {
                this.pcPick();

                // disable flips from player
                this.gameData.playerFlipAllowed = false;
            } else {
                this.gameData.playerFlipAllowed = true;
            }
        }, 500);
    }

    change() {
        this.start(this.players.getNextPlayerId(this.gameData.currentPlayerId));
    }

    setActivePlayer(playerId) {
        // update current player in game data
        this.gameData.currentPlayerId = playerId;

        // update current player type in game data
        const currentPlayerType = this.players.getCurrentPlayerType(playerId);
        if(currentPlayerType === undefined) {
            this.gameData.currentPlayerType = 'player';
        } else {
            this.gameData.currentPlayerType = currentPlayerType;
        }

        // update header on board
        this.players.setActive(playerId);
    }
    
    end() {
        // compare cards
        if(this.gameData.flippedCards[0].groupId == this.gameData.flippedCards[1].groupId) {
            setTimeout(() => {
                this.markAsPicked();
            }, 1500);   
        } else {
            setTimeout(() => {
                this.reset();
            }, 1500);    
        }

        setTimeout(() => {
            this.gameData.flippedCards = [];
            this.gameData.isAllFlipped = false;
        }, 1500);    
    }

    reset() {
        // flip cards back
        this.cards.forEach((card) => {
            if(card.flipped && !card.picked) {
                card.flipped = false;
                card.seen = true;
            }
        });

        const flippedDivs = document.querySelectorAll('.flip');
        for(let i = 0, n = flippedDivs.length; i < n; ++i) {
            if(!flippedDivs[i].parentNode.classList.contains('success')) flippedDivs[i].classList.remove('flip');
        }

        // reset debug
        this.pcResetDebug();

        // change turn
        this.change();
    }

    markAsPicked() {
        // mark the cards as correct
        this.cards.forEach((card) => {
            if(card.flipped && !card.picked) card.picked = true;
        });

        // add points
        this.addPoints();

        // add class to show they're already picked
        const flippedDivs = document.querySelectorAll('.flip');
        for(let i = 0, n = flippedDivs.length; i < n; ++i) {
            flippedDivs[i].parentNode.classList.add('success');
        }

        // reset debug
        this.pcResetDebug();

        // if all cards are picked, end round
        if(document.querySelectorAll('.success').length == this.cards.length) {
            this.success();
        } else {
            // if current player is pc, pick again
            if(this.gameData.currentPlayerType == 'pc') this.pcPick();
        }
    }

    success() {
        this.round.end();
    }

    addPoints() {
        // update game data
        const index = this.players.getCurrentPlayerIndex(this.gameData.currentPlayerId);
        const points = this.gameData.points[index].currentRoundPoints + 1;
        this.gameData.points[index].currentRoundPoints = points;

        // update header
        const playerPoints = document.querySelectorAll('#playerid-' + this.gameData.currentPlayerId + '-container' + ' > div.player-points > span');
        playerPoints[0].textContent = points;
    }

    isFlipAllowed(card) {
        let flippedCards = this.gameData.flippedCards.length + 1;
        if(flippedCards <= 2 && !card.picked && this.gameData.flippedCards.indexOf(card) != 0) {
            this.gameData.flippedCards.push(card);
            card.flipped = true;
            return true;
        } else {
            return false;
        }
    }

    isDone() {
        if(this.gameData.flippedCards.length == 2) {
            return true;
        } else {
            return false;
        }
    }

    pcPick() {
        // are there pairs which we've seen?
        const seenPairs = this.pcGetSeenPair();

        // add some delay to make it more realistic and pick 2 cards
        setTimeout(() => {
            for(let i = 0; i < 2; i++) {
                setTimeout(() => {
                    // find out possible cards to turn=
                    let possibleCards = [];

                    if(seenPairs.length == 2) {
                        // if there's a pair we've seen add the cards one by one
                        possibleCards.push(seenPairs[i]);
                    } else {
                        // if not: first pick something you've seen. Second pick random.
                        this.cards.forEach((card) => {
                            // 
                            if(i == 0) {
                                if(!card.flipped && !card.picked && card.seen) possibleCards.push(card);
                            } else {
                                if(!card.flipped && !card.picked) possibleCards.push(card);
                            }
                        });
                    }

                    // if still no possible cards, pick 2 random cards
                    if(possibleCards.length == 0) {
                        this.cards.forEach((card) => {
                            if(!card.flipped && !card.picked) possibleCards.push(card);
                        });
                    }

                    // highlight the possible cards
                    this.pcDebug(possibleCards, i);

                    // randomize possibilities
                    possibleCards = possibleCards.sort(() => Math.random() - 0.5);

                    setTimeout(() => {
                        this.pcClick(possibleCards[0].id);
                    }, 1000 * i);
                }, 1000 * i);
            }
        }, 1000);
    }

    pcGetSeenPair() {
        let pairedGroupIds = this.pcGetSeenGroupIds();
        pairedGroupIds = pairedGroupIds.sort(() => Math.random() - 0.5);

        return this.pcGetCards(pairedGroupIds[0]);
    }

    pcGetSeenGroupIds() {
        const groupIds = [];
        const pairedGroupIds = [];
        this.cards.forEach((card) => {
            if(!card.flipped && !card.picked && card.seen) {
                if(groupIds.includes(card.groupId)) {
                    pairedGroupIds.push(card.groupId);
                } else {
                    groupIds.push(card.groupId);
                }
            }
        });

        return pairedGroupIds;
    }

    pcGetCards(groupId) {
        const cards = [];
        this.cards.forEach((card) => {
            if(card.groupId == groupId) cards.push(card);
        });

        return cards;
    }

    pcDebug(cards, i) {
        cards.forEach((card) => {
            const selectedCards = document.querySelectorAll('#card-' + card.id + ' > div.card-base > div.card-inner > div.card-front');
            if(i == 0) {
                selectedCards[0].style.backgroundColor = "green";
            } else {
                selectedCards[0].style.backgroundColor = "green";
            }
        });
    }

    pcResetDebug(){
        this.cards.forEach((card) => {
            const selectedCards = document.querySelectorAll('#card-' + card.id + ' > div.card-base > div.card-inner > div.card-front');
            selectedCards[0].style.backgroundColor = "red";
        });
    }

    pcClick(cardId) {
        // find card index
        let cardIndex = 0;
        this.cards.forEach((card, i) => {
            if(card.id == cardId) cardIndex = i;
        });

        // flip logic
        if(this.isFlipAllowed(this.cards[cardIndex])) this.flipCard(this.cards[cardIndex]);
        if(this.isDone()) this.end();
    }
    
    flipCard(card) {
        const selectedCard = document.querySelectorAll('#card-' + card.id + ' > div.card-base > div.card-inner');
        selectedCard[0].classList.add('flip');
    }
}

class PlayerCollection {
    constructor(players) {
        this.players = players;
    }

    show() {
        this.players.forEach(function callback(player, index) {
            const bluePrint = [
                {
                    'class': 'player-container',
                    'id': 'playerid-' + (index + 1) + '-container'
                },
                {
                    'class': 'game-header-player',
                    'id': 'playerid-' + (index + 1)
                },
                {
                    'type': 'span',
                    'content': player.name
                },
                {
                    'type': 'div',
                    'class': 'player-points',
                    'parent': 0
                },
                {
                    'type': 'span',
                    'content': "0",
                },
            ];
    
            new HtmlGenerator(bluePrint, document.querySelector(".game-header"));
        });
    }

    setActive(playerId) {
         // remove all active classes
        const playerDivs = document.querySelectorAll(".game-header-player");
        playerDivs.forEach(playerDiv => {
            playerDiv.classList.remove('active');

        });

        // set new
        const newPlayerDiv = document.getElementById('playerid-' + playerId);
        newPlayerDiv.classList.add('active');   
    }

    getCurrentPlayerIndex(currentPlayerId) {
        return currentPlayerId -= 1;
    }

    getCurrentPlayerType(currentPlayerId) {
        return this.players[this.getCurrentPlayerIndex(currentPlayerId)].type;
    }

    getNextPlayerId(currentPlayerId) {
        if(currentPlayerId < this.players.length) {
            return currentPlayerId += 1;
        } else {
            return currentPlayerId -= 1;
        }
    }

    getPlayers() {
        return this.players;
    }
}

class HtmlGenerator {
    constructor(bluePrint, parentElement, clickObject = null, clickData = null) {
        this.bluePrint = bluePrint;
        this.parentElement = parentElement;
        if(clickObject) this.clickObject = clickObject;
        if(clickData) this.clickData = clickData;
        this.createHtml(bluePrint);
    }

    getHtml(bpElement) {
        // if type is not set then default is div
        if(!bpElement.hasOwnProperty('type')) bpElement.type = 'div';

        // create
        const newElement = document.createElement(bpElement.type);

        // support for id's
        if(bpElement.hasOwnProperty('id')) newElement.setAttribute('id', bpElement.id);

        // support for multiple classes
        if(Array.isArray(bpElement.class)) {
            bpElement.class.forEach((cardDivclass) => {
                newElement.classList.add(cardDivclass);
            });
        } else {
            if(bpElement.hasOwnProperty('class')) newElement.classList.add(bpElement.class);
        }

        // img src
        if(bpElement.type == 'img') newElement.src = bpElement.src;

        // span content
        if(bpElement.type == 'span') newElement.textContent += bpElement.content;

        return newElement;
    }

    getParentIndex(bpElement, i) {
        let parentIndex = i - 1;
        if(bpElement.hasOwnProperty('parent')) parentIndex = bpElement.parent;
        return parentIndex;
    }

    createHtml(bluePrint) {
        bluePrint.forEach((bpElement, i) => {
            let newElement = this.getHtml(bpElement);

            // add click event
            if(bpElement.hasOwnProperty('eventClick')) {
                newElement.addEventListener('click', () => {
                    this.clickObject.click(this.clickData);
                });
            }

            // determine parent
            let parentIndex = this.getParentIndex(bpElement, i);
  
            // append first element to parent
            if(i == 0) {
                this.parentElement.appendChild(newElement);
            } else {
                // append to blueprint parent
                bluePrint[parentIndex].object.appendChild(newElement);
            }

            // save previous
            bpElement.object = newElement;

            // last one so fade in
            if(i == (bluePrint.length - 1)) {
                setTimeout(() => {
                    bluePrint[0].object.classList.add('fadein');
                }, 250); 
            }
        });
    }
}

const splash = new SplashScreen('Dragon Memory');
const startMenu = new Modal('New game', 'Start', new Game(), 'start');

async function runApp() {
    await splash.showAndHide();
    startMenu.show();
}
runApp();