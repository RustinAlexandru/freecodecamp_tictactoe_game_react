import React from 'react';
import ReactDOM from 'react-dom';

$(window).resize(() => {
  $(".square").fitText(0.2);
  console.log("works")
});

var globalTestGameState = {
  activePlayer: {
    name: "computer",
    characterPlayed: "X"
  },
  gameEnded: false,
  // board: ["O", null, "X", "X", null, null, "X", "O", "O"]  // ending game test
  board: ["O", null, null, null, null, null, null, null, null] // starting game test
}

function test() {
    let board = new Board()
    board.props = { computerIsPlaying: true, players: [{name: "computer", characterPlayed: "X"}, {name: "player", characterPlayed: "O"}]}
    board.state = globalTestGameState
    board.minimax(globalTestGameState)
}


class Player {
    constructor(name, _character) {
    this.name = name;
    this.characterPlayed = _character;
    }
}

var bestChoice;


function Square(props) {
    return (<div className="square" onClick={props.onClick}>
            {props.value}
            </div>
            );
}

function ChoosePlayersMenu(props) {
    return ( <div className="players-menu">
                <h3>How do you want to play?</h3>
                <div className="player-buttons">
                <button className="btn btn-secondary" onClick={() => props.setPlayers(1)}> 1 vs computer </button>
                <button className="btn btn-secondary" onClick={() => props.setPlayers(2)}> 2 players </button>
                </div>
            </div>
            );
}

function ChooseCharacterMenu(props) {
    return ( <div className="character-menu">
                <h3>Would you like to be X or O?</h3>
                <div className="player-characters-buttons">
                <button className="btn btn-secondary" onClick={() => props.setPlayersCharacters('O')}> O </button>
                <button className="btn btn-secondary" onClick={() => props.setPlayersCharacters('X')}> X </button>
                </div>
            </div>
            );
}

function GameMenu(props) {
    return (<div>
                <button> Reset game </button>
                <ChoosePlayersMenu setPlayers={props.setPlayers} />
            </div>
            );
}

function DisplayWinning(props) {
    return (
    <div className="winning-display">
    <h1> {props.winner.characterPlayed} has won! </h1>
    <button className="btn btn-success" onClick={() => props.resetGame()}>Play again!</button>
    </div>
    );
}

function DisplayDraw(props) {
    return (
    <div className="draw-display">
    <h1> Game is a draw! Try harder ;) </h1>
    <button className="btn btn-success" onClick={() => props.resetGame()}>Play again!</button>
    </div>
    );
}



class Board extends React.Component {
    state = {
        board: Array(9).fill(null),
        activePlayer: null,
        gameEnded: false,
    };

    constructor(props) {
    super(props);
    this.handleClick = this.handleClick.bind(this);

    }
  
    componentWillReceiveProps(nextProps) {
    if (JSON.stringify(this.props) !== JSON.stringify(nextProps)){      
        this.setState({
        activePlayer : nextProps.players[0] 
        });
    }
    }


    componentDidUpdate(prevProps, prevState) {
        const { activePlayer, board } = this.state;
        const { isComputerPlaying, players } = this.props;


        if (isComputerPlaying) {
            if (activePlayer.name === "computer") {
                let statecopy = JSON.parse(JSON.stringify(this.state))
                this.minimax(statecopy); // sets global variable bestChoice as the best choice for the AI to make
                // let randomSquare = Math.floor(Math.random() * 8) + 0  // AI move
                // while (squares[randomSquare]) {
                //   randomSquare = Math.floor(Math.random() * 8) + 0  // AI move
                // } 
                // let randomSquare = bestChoice;
                const _board = board.slice(); // imutability
                if (board[bestChoice] || this.state.gameEnded)  return; // if square is filled already / game ended, return
                _board[bestChoice] = activePlayer.characterPlayed;
                
                this.setState({
                board: _board,
                activePlayer: activePlayer.characterPlayed === players[0].characterPlayed ? players[1] : players[0]
                },
                () => this.checkIfGameEnd(_board)
                );
            } 
        } 
    }

    findAndSetWinner(players, winningCharacter, _board) {
        const player = players.find(x => x.characterPlayed === winningCharacter);
        this.props.setWinner(player);
        this.setState({
            board: _board,
            gameEnded: true
        });
    }


    score(gameState) {
        const { board, activePlayer, winner, isDraw } = gameState ;

        if (isDraw) {
            return 0;
        }
        if (winner.characterPlayed  === "X") { // if currentPlayer is winner     
            return 10;
        }
        else if (winner.characterPlayed === "O") { // if oponnent is winner        
            return -10;
        }
        else {      
            return 0;
        }
    }

    minimax(newGameState) {
        const gameState = JSON.parse(JSON.stringify(newGameState));
        const { gameEnded, board, activePlayer, isDraw} = gameState;
        const { players } = this.props;


        const winningCharacter = calculateWinner(board); // check if move ended game and find winner
        if (winningCharacter) {
            const player = players.find(x => x.characterPlayed === winningCharacter);
            gameState.winner = player;
            gameState.gameEnded = true;     
        }
        else {
            gameState.gameEnded = false;
        }

        if (board.every(x => x != null) && !gameState.winner) {   // if all squares are filled and no winner 
            // no winner, draw, game ended
            gameState.gameEnded = true;
            gameState.isDraw = true;
        } 
                                    
        if (gameState.gameEnded || isDraw) {
            return this.score(gameState);
        }

        gameState.activePlayer = activePlayer.characterPlayed === players[0].characterPlayed ? players[1] : players[0];                            

        const scores = [];
        const moves = [];

        const availableMoves = board.map((value, index) => value === null ? index : null)
                                    .filter(x => x !== null);

        for (let square of availableMoves) {
            const _boardCopy = board.slice(); // immutability
            _boardCopy[square] = gameState.activePlayer.characterPlayed === players[0].characterPlayed ? players[1].characterPlayed: players[0].characterPlayed;
            gameState.board = _boardCopy;
            scores.push(this.minimax(gameState));
            moves.push(square);
        }
            
        if (gameState.activePlayer.characterPlayed === "O") {
            const maxScoreIndex = scores.indexOf(Math.max(...scores));
            bestChoice = moves[maxScoreIndex];
            return scores[maxScoreIndex];
        }
        else {
            const minScoreIndex = scores.indexOf(Math.min(...scores));
            bestChoice = moves[minScoreIndex];
            return scores[minScoreIndex];
        }
    }
  

    checkIfGameEnd(board) { 
        const { computerIsPlaying, players } = this.props;

        const winningCharacter = calculateWinner(board); // check if move ended game and find winner
        if (winningCharacter) {
            this.findAndSetWinner(players, winningCharacter, board);        
            return true;  
        }

        if (board.every(x => x != null) && !winningCharacter) {   // if all squares are filled and no winner 
            this.props.setIsDraw(true);
            this.setState({
            gameEnded: true,
            isDraw: true
            });
            return true;
        } 
        return false;      
    }


    handleClick(num) {
        const board = this.state.board.slice(); // imutability
        const { computerIsPlaying, players } = this.props;

        if (board[num] || this.state.gameEnded)  return; // if square is filled already / game ended, return
        const { activePlayer } = this.state;

        board[num] = activePlayer.characterPlayed;

        this.setState({
        board: board,
        activePlayer: activePlayer.characterPlayed === players[0].characterPlayed ? players[1] : players[0],
        }, 
        () => this.checkIfGameEnd(board)
        );
    }
  

    renderSquare(num) {
        return <Square value={this.state.board[num]} 
                    onClick={() => this.handleClick(num)} />
    }
  
    render() {
    const board = (<div className="board-container">
                <div className="board-row">
                {this.renderSquare(0)}
                {this.renderSquare(1)}
                {this.renderSquare(2)}
                </div>
                <div className="board-row">
                {this.renderSquare(3)}
                {this.renderSquare(4)}
                {this.renderSquare(5)}
                </div>
                <div className="board-row">
                {this.renderSquare(6)}
                {this.renderSquare(7)}
                {this.renderSquare(8)}
                </div>
            </div>);
    return board;
    }
    }

class TicTacToeGame extends React.Component {
    state = {
        players: [],
        winner: null,
        isComputerPlaying: false,
        displayChoosePlayersMenu: true,
        displayChooseCharacterMenu: false,
    };

    constructor(props) {
        super(props);

        this.setPlayers = this.setPlayers.bind(this);
        this.setPlayersCharacters = this.setPlayersCharacters.bind(this);
        this.setWinner = this.setWinner.bind(this);
        this.setIsDraw = this.setIsDraw.bind(this);
        this.resetGame = this.resetGame.bind(this);

    }


    setPlayers(_numberOfPlayers) {
    const _players = this.state.players.slice(); // immutability
        if (_numberOfPlayers === 2) {
            const player1 = new Player("player1");
            const player2 = new Player("player2");
            _players.push(player1, player2);
            this.setState({
            players: _players,
            displayChoosePlayersMenu: false,
            displayChooseCharacterMenu: true
            });
        } else if (_numberOfPlayers === 1) {
            const player = new Player("player");
            const computer = new Player("computer");
            _players.push(player, computer);
            this.setState({
            players: _players,
            isComputerPlaying: true,
            displayChoosePlayersMenu: false,
            displayChooseCharacterMenu: true
            });
        }
    }


    setPlayersCharacters(character) {
        const _players = this.state.players.slice(); // immutability
        _players[0].characterPlayed = character; // set player 1 character
        _players[1].characterPlayed = character === 'X' ? 'O' : 'X' // player 2 gets the other charcter
        this.setState({
            players: _players,
            displayChooseCharacterMenu: false
        });
    }


    setWinner(_winner) {
    this.setState({
        winner: _winner
    });
    }


    setIsDraw(bool) {
        this.setState({
            isDraw: bool
        });
    }


    resetGame() {
        this.setState({
        players: [],
        winner: null,
        isComputerPlaying: false,
        isDraw: false,
        displayChoosePlayersMenu: true,
        displayChooseCharacterMenu: false,
        });
    }

    render() {
    const { players, isComputerPlaying, winner, isDraw } = this.state;

    return ( 
        <div className="game-container">
            { this.state.displayChoosePlayersMenu ? <ChoosePlayersMenu setPlayers={this.setPlayers}/> : null }
            { this.state.displayChooseCharacterMenu ? <ChooseCharacterMenu setPlayersCharacters={this.setPlayersCharacters}/> : null }
            { !winner && !isDraw ? <Board players={players} isComputerPlaying={isComputerPlaying} 
                    setWinner={this.setWinner} setIsDraw={this.setIsDraw} resetGame={this.resetGame}/> : 
                    isDraw? <DisplayDraw resetGame={this.resetGame}/> :
                            <DisplayWinning winner={this.state.winner} resetGame={this.resetGame}/> }
        </div>
            ); 
    }
}


function calculateWinner(board) {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];
  for (let i = 0; i < lines.length; i++) {
    const [a, b, c] = lines[i];
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return board[a];
    }
  }
  return null;
}


function printBoard(board) {
    let output = "";
    for (let i = 0; i < board.length; i++) {
      if ((i+1) % 3 === 0) {
        output += board[i] + " " + "\n";
      }
      else {
        output += board[i] + " ";
      }
    }
    return output;
}


ReactDOM.render(<TicTacToeGame/>, document.getElementById("app"));
