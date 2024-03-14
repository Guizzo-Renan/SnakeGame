import React, {useEffect, useState} from 'react';

import {
  randomIntFromInterval,
  reverseLinkedList,
  useInterval,
} from '../../lib/utils';

import './Tabuleiro.css';

class No{
  constructor(value){
    //this.Anterior = value;
    this.value = value;
    this.Proximo = null
  }
}

class ListaLigada{
  constructor(value){
    const node = new No(value);
    this.Cabeca = node;
    this.Corpo = node;
    
  }
}

class Celula {
  constructor(linha, coluna, value){
    this.linha = linha;
    this.coluna = coluna;
    this.value = value;
  }
}




const Direcao = {
  UP: 'UP',
  RIGHT: 'RIGHT',
  DOWN: 'DOWN',
  LEFT: 'LEFT',
}



const getStartingSnakeLLValue = tabuleiro => {
  const rowSize = tabuleiro.length;
  const colSize = tabuleiro[0].length;
  const startingRow = Math.round(rowSize / 3);
  const startingCol = Math.round(colSize / 3);
  const startingCell = tabuleiro[startingRow][startingCol];
  return {
    linha: startingRow,
    coluna: startingCol,
    celula: startingCell,
  };
};


const PROBABILITY_OF_REVERSAL_FOOD = 0.3;

const TAMANHO = 10;

const Tabuleiro = () => {
  /*
  const [tabuleiro, setTabuleiro] = useState(
    new Array(TAMANHO).fill(0).map(linha => new Array(TAMANHO).fill(0) )
  )
  */
  const [tabuleiro, setTabuleiro] = useState(criarTabuleiro(TAMANHO));

  const [cobra, setCobra] = useState(new ListaLigada(getStartingSnakeLLValue(tabuleiro)));
 
  const [cobraCelulas, setCobraCelulas] = useState(new Set([cobra.Cabeca.value.celula]));
  const [score, setScore] = useState(0);
   const [foodCell, setFoodCell] = useState(cobra.Cabeca.value.celula + 5);
//const [cobraCelulas, setCobraCelulas] = useState(new Set([44]));
//const [cobra, setCobra] = useState(new ListaLigada(new Celula(4,3,44)));
  const [direcao, setDirecao] = useState(Direcao.RIGHT);
  const [foodShouldReverseDirection, setFoodShouldReverseDirection] = useState(
    false,
  );





/*
  useEffect(() => {
    setInterval(() => {




    },1000);
  */

    useEffect(() => {
      window.addEventListener('keydown', e => {
        handleKeydown(e);
      });
    }, []);
  
    // `useInterval` is needed; you can't naively do `setInterval` in the
    // `useEffect` above. See the article linked above the `useInterval`
    // definition for details.
    useInterval(() => {
      moverCobra();
    }, 150);
  

/*
  window.addEventListener('keydown', e => {

    const novaDirecao = getDirecao(e.key);
    const direcaoValida = novaDirecao !== '';
    if(direcaoValida) setDirecao(novaDirecao);

      });
  }, []);
*/

const handleKeydown = e => {
  const novaDirecao = getDirecao(e.key);
  const direcaoValida = novaDirecao !== '';
  if (!direcaoValida) return;
  const snakeWillRunIntoItself =
    getOppositeDirection(novaDirecao) === direcao && cobraCelulas.tamanho > 1;
  // Note: this functionality is currently broken, for the same reason that
  // `useInterval` is needed. Specifically, the `direction` and `snakeCells`
  // will currently never reflect their "latest version" when `handleKeydown`
  // is called. I leave it as an exercise to the viewer to fix this :P
  if (snakeWillRunIntoItself) return;
  setDirecao(novaDirecao);
};






  function moverCobra() {

    const principaisCordenadas = {
      linha: cobra.Cabeca.value.linha,
      coluna: cobra.Cabeca.value.coluna,
    };

  const proximasCordenadas = getProximasCordenadas(principaisCordenadas, direcao);
  if(isOutOfBounds(proximasCordenadas, tabuleiro)){handleGameOver(); return;} 

  const proximosValores = tabuleiro[proximasCordenadas.linha][proximasCordenadas.coluna]
  if( proximosValores === foodCell) handleFoodConsumption();
  
  const novaCordenada = No(
      //new Celula(proximasCordenadas.linha, proximasCordenadas.coluna, proximosValores),
    {
      linha: proximasCordenadas.linha,
      coluna: proximasCordenadas.coluna,
      celula: proximosValores,
    }
  );
  console.log(cobra.Corpo.value.celula)

  const currentHead = cobra.Cabeca;
  cobra.Cabeca = novaCordenada;
  currentHead.Proximo = novaCordenada;


  const novaCobraCelula = new Set(cobraCelulas);
  novaCobraCelula.delete(cobra.Corpo.value.value);
  novaCobraCelula.add(proximosValores);

 // cobra.Cabeca = novaCordenada;
 
  cobra.Corpo = cobra.Corpo.Proximo;
  if (cobra.Corpo === null) cobra.Corpo = cobra.Cabeca;


  const foodConsumed = proximosValores === foodCell;
  if (foodConsumed) {
    // This function mutates newSnakeCells.
    growSnake(novaCobraCelula);
    if (foodShouldReverseDirection) reverseSnake();
    handleFoodConsumption(novaCobraCelula);
  }




    setCobraCelulas(novaCobraCelula)

  }
/*

  const getProximasCordenadas = (principaisCordenadas,direcao) => {

    if(direcao === Direcao.UP){
      return {
        linha: principaisCordenadas.linha -1,
        coluna: principaisCordenadas.coluna,
      };
    }

    if(direcao === Direcao.RIGHT){
      return {
        linha: principaisCordenadas.linha,
        coluna: principaisCordenadas.coluna + 1,
      };
    }


    if(direcao === Direcao.DOWN){
      return {
        linha: principaisCordenadas.linha +1,
        coluna: principaisCordenadas.coluna
      };
    }


    if(direcao === Direcao.LEFT){
      return {
        linha: principaisCordenadas.linha ,
        coluna: principaisCordenadas.coluna -1
      };
    }
  };

  */

  const growSnake = novaCobraCelula => {
    const growthNodeCoords = getGrowthNodeCoords(cobra.Corpo, direcao);
    if (isOutOfBounds(growthNodeCoords, tabuleiro)) {
      // Snake is positioned such that it can't grow; don't do anything.
      return;
    }
    const newTailCell = tabuleiro[growthNodeCoords.row][growthNodeCoords.col];
    const newTail = new No({
      linha: growthNodeCoords.linha,
      coluna: growthNodeCoords.coluna,
      celula: newTailCell,
    });
    const currentTail = cobra.Corpo;
    cobra.Corpo = newTail;
    cobra.Corpo.Proximo = currentTail;

    novaCobraCelula.add(newTailCell);
  };

  const reverseSnake = () => {
    const tailNextNodeDirection = getNextNodeDirection(cobra.Corpo, direcao);
    const newDirection = getOppositeDirection(tailNextNodeDirection);
    setDirecao(newDirection);

    // The tail of the snake is really the head of the linked list, which
    // is why we have to pass the snake's tail to `reverseLinkedList`.
    reverseLinkedList(cobra.Corpo);
    const snakeHead = cobra.Cabeca;
    cobra.Cabeca = cobra.Corpo;
    cobra.Corpo = snakeHead;
  };

  const handleFoodConsumption = () => {
    const maxPossibleCellValue = TAMANHO * TAMANHO;
    let nextFoodCell;
    while (true) {
      nextFoodCell = randomIntFromInterval(1, maxPossibleCellValue);
        if(cobraCelulas.has(nextFoodCell) || foodCell === nextFoodCell) continue;
        break;
    }

    const nextFoodShouldReverseDirection =
    Math.random() < PROBABILITY_OF_REVERSAL_FOOD;


    setFoodCell(nextFoodCell);
    setFoodShouldReverseDirection(nextFoodShouldReverseDirection);
    setScore(score + 1);


  }












 const handleGameOver = () => {
  setScore(0);
  const snakeLLStartingValue = getStartingSnakeLLValue(tabuleiro);
  setCobra(new ListaLigada(snakeLLStartingValue)) 
 // setFoodCell(FOOD_CELL);
//  setCobraCelulas(new Set([STARTING_SNAKE_CELL]))

  setFoodCell(snakeLLStartingValue.celula + 5);
  setCobraCelulas(new Set([snakeLLStartingValue.celula]));
  setDirecao(Direcao.RIGHT);

}








  return (
    <>
    <h1>Score: {score}</h1>
    <button onClick={() => moverCobra()}>Mover</button>
    <div className='tabuleiro'>
      {tabuleiro.map((linha, linhaId) => (
          <div key={linhaId} className='linha'> 
          {linha.map((celulaValor,celulaId) => (
              <div key={celulaId} 
                className={`celula ${
                cobraCelulas.has(celulaValor) ? 'cobra-celula' : ''
                }`}>
              </div>
            )) 
          }
          </div>
        ))
      }
    </div>
    </>
  );
};






const criarTabuleiro = TAMANHO => {
  let contador = 1;
  const tabuleiro = [];
  for (let linha = 0; linha < TAMANHO; linha++){
    const linhaAtual = [];
    for (let coluna = 0; coluna < TAMANHO; coluna++){
      linhaAtual.push(contador++);
    } 
    tabuleiro.push(linhaAtual);
  }
  return tabuleiro;
};



const getProximasCordenadas = (coords, direcao) => {
  if (direcao === Direcao.UP) {
    return {
      linha: coords.linha - 1,
      coluna: coords.coluna,
    };
  }
  if (direcao === Direcao.RIGHT) {
    return {
      linha: coords.linha,
      coluna: coords.coluna + 1,
    };
  }
  if (direcao === Direcao.DOWN) {
    return {
      linha: coords.linha + 1,
      coluna: coords.coluna,
    };
  }
  if (direcao === Direcao.LEFT) {
    return {
      linha: coords.linha,
      coluna: coords.coluna - 1,
    };
  }
};





const isOutOfBounds = (coordenadas, tabuleiro) =>
{
  const {linha, coluna} = coordenadas;
  if(linha <0 || coluna || 0) return true;
  if(linha >= tabuleiro.length || coluna >= tabuleiro[0].length) return true;
  return false;
}




const getDirecao = key => {
  if(key === 'ArrowUp') return Direcao.UP;
  if(key === 'ArrowRight') return Direcao.RIGHT;
  if(key === 'ArrowDown') return Direcao.DOWN;
  if(key === 'ArrowLeft') return Direcao.LEFT;
  return '';
};



const getNextNodeDirection = (node, currentDirection) => {
  if (node.Proximo === null) return currentDirection;
  const {linha: currentRow, coluna: currentCol} = node.value;
  const {linha: nextRow, coluna: nextCol} = node.Proximo.value;
  if (nextRow === currentRow && nextCol === currentCol + 1) {
    return Direcao.RIGHT;
  }
  if (nextRow === currentRow && nextCol === currentCol - 1) {
    return Direcao.LEFT;
  }
  if (nextCol === currentCol && nextRow === currentRow + 1) {
    return Direcao.DOWN;
  }
  if (nextCol === currentCol && nextRow === currentRow - 1) {
    return Direcao.UP;
  }
  return '';
};







/*
const getNextNodeDirection = (node, currentDirection) => {
  if(node.Proximo === null) return currentDirection;
  const {linha: currentRow, coluna: currentCol} = node
  const {linha: nextRow, coluna: nextCol} = node.Proximo;
  if( nextRow === currentRow && nextCol === currentCol + 1){
    return Direcao.RIGHT
  }
  if( nextRow === currentRow && nextCol === currentCol + 1){
    return Direcao.RIGHT
  }

};
*/

//const getGrowthDirection = (direcao, tabuleiro) => {};


const getGrowthNodeCoords = (snakeTail, currentDirection) => {
  const tailNextNodeDirection = getNextNodeDirection(
    snakeTail,
    currentDirection,
  );
  const growthDirection = getOppositeDirection(tailNextNodeDirection);
  const currentTailCoords = {
    linha: snakeTail.value.linha,
    coluna: snakeTail.value.coluna,
  };
  const growthNodeCoords = getProximasCordenadas(
    currentTailCoords,
    growthDirection,
  );
  return growthNodeCoords;
};






const getOppositeDirection = direcao => {
  if(direcao === Direcao.UP) return Direcao.DOWN
  if(direcao === Direcao.RIGHT) return Direcao.LEFT
  if(direcao === Direcao.DOWN) return Direcao.UP
  if(direcao === Direcao.LEFT) return Direcao.RIGHT

}




const getCellClassName = (
  cellValue,
  foodCell,
  foodShouldReverseDirection,
  cobraCelulas,
) => {
  let className = 'cell';
  if (cellValue === foodCell) {
    if (foodShouldReverseDirection) {
      className = 'cell cell-purple';
    } else {
      className = 'cell cell-red';
    }
  }
  if (cobraCelulas.has(cellValue)) className = 'cell cell-green';

  return className;
};





export default Tabuleiro;