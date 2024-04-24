let mysteryWords = new Array();
let correctlyGuessedNumbers = {};
let letterAndNumberHashset = {};

// https://www.youtube.com/watch?v=oKM2nQdQkIU
function drawBox(container, row, col, lettersNumbers, word) {
    const box = document.createElement('div');
    box.className = 'box';
    let IdLetterNumericalValue = lettersNumbers[word[col]];
    box.id = `box:${row}:${col}:${IdLetterNumericalValue}`;
    box.textContent = '?';

    container.appendChild(box);
    drawNumbers(container, row, col, lettersNumbers, word);
}

function drawAutoFilledSpace(container, row, col, lettersNumbers, sentence) {
    const box = document.createElement('div');
    box.className = 'filledSpace';

    let IdLetterNumericalValue = lettersNumbers[sentence[col]];
    box.id = `filledSpace:${row}:${col}:${IdLetterNumericalValue}`;
    box.textContent = sentence[col];

    if (box.textContent === "-") {
        box.style.width = "25px";
    }

    container.appendChild(box);
    return box;
}

function drawDefinitions(container, word, definition) {
    const def = document.createElement('h2');
    def.className = 'h2';
    def.textContent = definition;
    container.appendChild(def);
    //console.log(word, def);
}

function drawNumbers(grid, row, col, lettersNumbers, word) {
    const numbers = document.createElement('h3');
    numbers.className = 'h3';
    numbers.textContent = lettersNumbers[word[col]];
    numbers.id = `h3:${row}:${col}`;
    grid.appendChild(numbers);
}

function uniqueLettersAndNumbers() {
    const eesti_tähed = ["A","B","C","D","E","F","G","H","I","J","K","L","M","N","O","P","Q","R","S","Š","Z","Ž","T","U","V","W","Õ","Ä","Ö","Ü","X","Y"];

    let unique_numbers = Array.from({length: 32}, (_, i) => i + 1);
    unique_numbers.sort(() => Math.random() - 0.5);

    let hashset = {};
    eesti_tähed.forEach((letter, i) => {
        hashset[letter] = unique_numbers[i];
    });
    
    //console.log(hashset);
    return hashset;
}

function chooseRandomWordDef(wordDefDictionary, chosenWordDefPairs) {
    const keys = Object.keys(wordDefDictionary);
    const randomKey = getRandomItem(keys);
    const randomResult = wordDefDictionary[randomKey];
    // if word has been used before, run this function again till it finds a suitable word
    if (chosenWordDefPairs.includes(randomResult)) {
        return chooseRandomWordDef(wordDefDictionary, chosenWordDefPairs);
    }
    return randomResult;
}

function chooseSuitableWordDef(allResults, wordDefDictionary, wordSorted, chosenWordDefPairs, originalSentenceWord, chosenResult = "") {
    // enter if there were suitable candidates for words to be chosen from
    if (allResults.length > 0) {
        const randomIndex = Math.floor(Math.random() * allResults.length);
        chosenResult = allResults[randomIndex];
        // check if this word has has been used before
        if (chosenWordDefPairs.includes(chosenResult) || chosenResult.split("::")[0] === originalSentenceWord) {
            allResults.splice(randomIndex, 1);
            return chooseSuitableWordDef(allResults, wordDefDictionary, wordSorted, chosenWordDefPairs, originalSentenceWord);
        }
    }
    // generate new possible candidates
    else {
        // remove the first letter, first letter tends to be more common in estonian (don't need as much as latter letters)
        if (wordSorted.length > 1) {
            const shortenWordSorted = wordSorted.substring(1);
            allResults = findAllWordResults(shortenWordSorted, wordDefDictionary, originalSentenceWord);
            return chooseSuitableWordDef(allResults, wordDefDictionary, shortenWordSorted, chosenWordDefPairs, originalSentenceWord);
        }
        // no suitable candidates found. Choose randomly
        else {
            return chooseRandomWordDef(wordDefDictionary, chosenWordDefPairs);
        }
    }
    
    return chosenResult;
}

// finds all suitable candidates for substring
function findAllWordResults(wordSorted, wordDefDictionary, originalSentenceWord) {
    let allResults = new Array();
    for (let key in wordDefDictionary) {
        if (wordSorted.split('').every(letter => key.includes(letter)) && key !== originalSentenceWord) {
            allResults.push(wordDefDictionary[key]);
        }
    }
    return allResults;
}

function findChosenWordDefPairs(sentenceSolution, wordDefDictionary, chosenWordDefPairs) {
    const splittedSentence = sentenceSolution.split(" ");

    // order words by [shortest -> longest]. min. 2 characters per word
    const reorderedSentence = splittedSentence.filter(word => word.length > 1);
    reorderedSentence.sort((a, b) => a.length - b.length);

    //console.log(reorderedSentence);

    for (let i = 0; i < reorderedSentence.length; i++) {
        const wordSorted = reorderedSentence[i].split("").filter((value, index, self) => self.indexOf(value) === index).sort().join("");
        const allResults = findAllWordResults(wordSorted, wordDefDictionary, reorderedSentence[i]);
        //console.log(allResults);
        const chosenWordDef = chooseSuitableWordDef(allResults, wordDefDictionary, wordSorted, chosenWordDefPairs, reorderedSentence[i]);
        chosenWordDefPairs.push(chosenWordDef);
    }
}

function topTaskbarCreate(container) {
    const topBar = document.createElement('div');
    topBar.className = "flex-box";

    const keySent = document.createElement('h1');
    keySent.className = 'h1';
    keySent.textContent = 'VÕTMELAUSE';
    //keySent.style.padding = "10px 200px 10px 200px";
    topBar.appendChild(keySent);

    const replayButton = document.createElement('button');
    replayButton.style.backgroundImage = 'url("img/replay2.webp")';
    replayButton.style.backgroundSize = '88%';
    replayButton.style.backgroundPosition = 'center';
    replayButton.id = 'replayButton';
    replayButton.className = 'replayBtn';
    replayButton.title = 'Uus mäng';
    replayButton.setAttribute("hidden", "hidden");
    topBar.appendChild(replayButton);

    const helpButton = document.createElement('button');
    helpButton.style.backgroundImage = 'url("img/help1.png")';
    helpButton.style.backgroundSize = 'cover';
    helpButton.style.backgroundPosition = 'center';
    helpButton.id = 'helpButton';
    helpButton.className = 'helpBtn';
    helpButton.title = 'Õpetus';
    topBar.appendChild(helpButton);

    container.appendChild(topBar);
}

function drawSentenceGrid(container, sentenceSolution, lettersNumbers) {
    let sentence = sentenceSolution.toUpperCase();
    mysteryWords.push(sentence);

    const topCompartment = document.createElement('div');
    topCompartment.className = 'topCompartment';
    topTaskbarCreate(topCompartment);

    const grid = document.createElement('div');
    grid.className = 'grid';

    const columns = sentence.length;
    
    let flexItem = document.createElement('div'); // Create a flex container
    flexItem.className = 'flex-item';

    for (let j = 0; j < columns; j++) {

        // check if current character is letter
        if (/[a-zõüöäA-ZÕÜÖÄ]/.test(sentence[j])) {
            drawBox(flexItem, 0, j, lettersNumbers, sentence);
        } 
        // character is -
        else if (/-/.test(sentence[j])) {
            drawAutoFilledSpace(flexItem, 0, j, lettersNumbers, sentence);
        }
        // character is whitespace
        else {
            drawAutoFilledSpace(flexItem, 0, j, lettersNumbers, sentence);
            // add flex-item container to the grid container and create new flex-item container
            if (flexItem.children.length > 0) {
                grid.appendChild(flexItem);
                flexItem = document.createElement('div');
                flexItem.className = 'flex-item';
            }
        }
    }

    // add the last flex-item container to the grid container
    if (flexItem.children.length > 0) {
        grid.appendChild(flexItem);
    }
    
    topCompartment.appendChild(grid);
    container.appendChild(topCompartment);
}

function drawWordsDefsGrid(container, chosenWordDefPairs, lettersNumbers) {
    for (let i = 0; i < chosenWordDefPairs.length; i++) {
        const word = chosenWordDefPairs[i].split("::")[0].toUpperCase();
        const definition = chosenWordDefPairs[i].split("::")[1];
        mysteryWords.push(word);
        drawDefinitions(container, word, definition);

        const grid = document.createElement('div');
        grid.className = 'grid';

        const columns = word.length;

        let flexItem = document.createElement('div'); // Create a flex container
        flexItem.className = 'flex-item';

        for (let j = 0; j < columns; j++) {
            drawBox(flexItem, i+1, j, lettersNumbers, word);
        }

        // add flex-item container to the grid container
        if (flexItem.children.length > 0) {
            grid.appendChild(flexItem);
        }
        container.appendChild(grid);
    }
}

function drawGrid(container, sentenceSolution, wordDefDictionary, lettersNumbers) {
    //let lettersNumbers = uniqueLettersAndNumbers();
    drawSentenceGrid(container, sentenceSolution, lettersNumbers);
    
    let chosenWordDefPairs = new Array();
    findChosenWordDefPairs(sentenceSolution, wordDefDictionary, chosenWordDefPairs);

    const minimumRequiredWordDefPairs = 8;
    if (chosenWordDefPairs.length < minimumRequiredWordDefPairs) {
        const cycles = minimumRequiredWordDefPairs - chosenWordDefPairs.length;
        for (let i = 0; i < cycles; i++) {
            chosenWordDefPairs.push(chooseRandomWordDef(wordDefDictionary, chosenWordDefPairs));
        }
    }
    //console.log(chosenWordDefPairs);
    
    drawWordsDefsGrid(container, chosenWordDefPairs, lettersNumbers);
}

function getRandomItem(array) {
    return array[Math.floor(Math.random() * array.length)];
}

// chatgpt abiga
async function readWordDefFileObsolete() {
    try {
        const response = await fetch('definitions.txt');
        const lines = (await response.text()).split('\n');

        // Select 5 random lines
        const selectedLines = [];
        const reformattedLines = [];
        while (selectedLines.length < 5) {
            const randomLine = getRandomItem(lines);
            if (!selectedLines.includes(randomLine)) {
            selectedLines.push(randomLine);
            reformattedLines.push(randomLine.split('_'));
            }
        }
        //console.log(reformattedLines);
        return reformattedLines;
    }
    catch (error) {
        console.error('Error reading the file:', error);
        throw error;
    }
}

async function readWordDefFile() {
    try {
        const response = await fetch('definitions.json');
        const dataString = await response.text();
        const data = JSON.parse(dataString);

        const dict = {};

        Object.entries(data).forEach(([key, value]) => {
            dict[key] = value;
        });

        return dict;
    }
    catch (error) {
        console.error('Error reading the file:', error);
        throw error;
    }
}

async function readSentenceFile() {
    try {
        const response = await fetch('sentences.txt');
        const lines = (await response.text()).split('\n');
        const randomSentence = getRandomItem(lines);
        const chosenSentence = randomSentence.replace(/\r+$/, '');
        const lowerCaseChosenSentence = chosenSentence.toLowerCase();

        return lowerCaseChosenSentence;
    }
    catch (error) {
        console.error('Error reading the file:', error);
        throw error;
    }
}

async function startup() {
    const game = document.getElementById('game');
    const sentenceSolution = await readSentenceFile();
    const wordDefDictionary = await readWordDefFile();
    letterAndNumberHashset = uniqueLettersAndNumbers();
    scoreCount(true);
    drawGrid(game, sentenceSolution, wordDefDictionary, letterAndNumberHashset);
    //console.log(mysteryWords);
    const cells = document.querySelectorAll(".box");
    cells.forEach(cell => {
        cell.addEventListener("click", cellClicked);
        cell.addEventListener("input", cellWrite);
        cell.addEventListener("keydown", handleKeyPress);
    });
    document.getElementById('replayButton').addEventListener('click', function() {
        window.location.reload();
    });
    document.getElementById('helpButton').addEventListener('click', function() {
        helpModal();
    });
}

let lastCharacter = '';

function handleKeyPress(event) {
    // Get the key code of the pressed key
    let cell = event.target;
    
    const keyCode = event.keyCode || event.which;
    const key = String.fromCharCode(keyCode);

    // 13 is for 'enter'
    if (event.keyCode === 13) {
        findAllCellGridBoxContents(cell);
    }

    // 8 === 'backspace' || 46 === 'delete'
    if (event.keyCode === 8 || event.keyCode === 46) {
        backspaceOrDeletePressed(cell);
    }
    else {
        if (!/^[a-zA-Z]*$/.test(key) && !/^[õüöäÕÜÖÄ]*$/.test(event.key)) {
            event.preventDefault();
        } 
        else {
            lastCharacter = event.key.toUpperCase();
        }
    }
}

var eachWordEnteredLettersDictionary = {};

function cellWrite(event) {
    let cell = event.target;
    /*
    let cellRowNr = cell.id.split(':')[1];

    if (cell.textContent.length > 1) {
        var index = eachWordEnteredLettersDictionary[cellRowNr].indexOf(cell.textContent[0]);
        eachWordEnteredLettersDictionary[cellRowNr].splice(index, 1);
    }

    let numberValue = cell.nextElementSibling.textContent;
    const wholeDocumentCells = document.getElementById('game').querySelectorAll('.box');
    wholeDocumentCells.forEach(singleDocumentCell => {
        let cellIdNumericalValue = singleDocumentCell.id.split(':')[3];
        if (numberValue === cellIdNumericalValue) {
            singleDocumentCell.textContent = lastCharacter;
            if (singleDocumentCell.classList.contains('mistake') || singleDocumentCell.classList.contains('wrong')) {
                singleDocumentCell.classList.remove('mistake');
                singleDocumentCell.classList.remove('wrong');
            } 
        }
    })   

    if (cellRowNr in eachWordEnteredLettersDictionary) {
        if (!eachWordEnteredLettersDictionary[cellRowNr].includes(lastCharacter)) {
            eachWordEnteredLettersDictionary[cellRowNr].push(lastCharacter);
        }
    } else {
        eachWordEnteredLettersDictionary[cellRowNr] = [lastCharacter];
    }
    */

    if (cell.textContent.length > 1) {
        cell.textContent = lastCharacter;
        if (cell.classList.contains('mistake') || cell.classList.contains('wrong')) {
            cell.classList.remove('mistake');
            cell.classList.remove('wrong');
        } 
    }

    // Check if the current cell already has a letter
    if (cell.textContent.length === 1) {
        let nextCell = cell.nextElementSibling;

        /*
        console.log(eachWordEnteredLettersDictionary);
         || eachWordEnteredLettersDictionary[cellRowNr].includes(nextCell.textContent)
        */
        while (nextCell && ((nextCell.classList.contains('correct') || nextCell.classList.contains('filledSpace') || nextCell.classList.contains('h3')))) {
            if (nextCell.nextElementSibling == null) {
                nextCell = nextCell.parentNode;
                nextCell = nextCell.nextElementSibling;
                if (nextCell == null) {
                    return;
                }
                nextCell = nextCell.firstElementChild;
            }
            else {
                nextCell = nextCell.nextElementSibling;
            }
        }

        if (nextCell) {
            nextCell.contentEditable = true;
            nextCell.focus();

            // Clear '?' character from the next cell, if present
            if (nextCell.textContent === '?') {
                nextCell.textContent = '';
            }
        }
    }

}

function cellClicked(event) {
    let cell = event.target;

    if (cell.classList.contains('correct') || cell.getAttribute('id').includes('tutorialBox')) {
        return;
    }

    cell.contentEditable = true;
    if (cell.textContent === '?') {
        cell.textContent = '';
    }
    cell.focus();
    //cell.classList.add('selected');
}

function backspaceOrDeletePressed(cell) {
    if (cell.textContent !== '') {
        cell.textContent = '';
    }

    if (cell.classList.contains('mistake') || cell.classList.contains('wrong')) {
        cell.classList.remove('mistake');
        cell.classList.remove('wrong');
    }

    let prevCell = cell;
    if (cell.previousElementSibling == null) {
        prevCell = cell.parentNode;
        prevCell = prevCell.previousElementSibling;
        if (prevCell == null) {
            return;
        }
        prevCell = prevCell.lastElementChild;
    } else {
        prevCell = cell.previousElementSibling;
    }

    while (prevCell && (prevCell.classList.contains('correct') || prevCell.classList.contains('filledSpace') || prevCell.classList.contains('h3'))) {
        if (prevCell.previousElementSibling == null) {
            prevCell = prevCell.parentNode;
            prevCell = prevCell.previousElementSibling;
            if (prevCell == null) {
                return;
            }
            prevCell = prevCell.lastElementChild;
        }
        else {
            prevCell = prevCell.previousElementSibling;
        }
    }

    if (prevCell) {
        prevCell.contentEditable = true;
        prevCell.focus();

        // Clear '?' character from the next cell, if present
        if (prevCell.textContent === '?') {
            prevCell.textContent = '';
        }
    }
}

function findAllCellGridBoxContents(cell) {
    const cellId = cell.id;

    const cellWordIndex = cellId.split(':')[1];
    const grid = cell.closest('.grid');
    const allCells = grid.querySelectorAll('.box, .filledSpace');

    let guessedWord = '';
    allCells.forEach(singleCell => {
        guessedWord = guessedWord + singleCell.textContent.toUpperCase();
    })
    //console.log(guessedWord);
    
    checkWordCorrection(guessedWord, cellWordIndex, allCells, cell);
}

let inputsAmount = 0;
let incorrectInputsAmount = 0;

function checkWordCorrection(guessedWord, cellWordIndex, allCells, cell) {
    if (guessedWord.length === mysteryWords[cellWordIndex].length && !guessedWord.includes('?')) {
        const wholeDocumentCells = document.getElementById('game').querySelectorAll('.box');
        // check if current word is correct
        if (mysteryWords[cellWordIndex] === guessedWord) {
            //console.log("you guessed " + mysteryWords[cellWordIndex] + " correctly!");
            let index = 0;
            // add all current word correctly guessed letters to hashset type object
            allCells.forEach(singleCell => {
                correctlyGuessedNumbers[singleCell.id.split(':')[3]] = mysteryWords[cellWordIndex][index];
                index += 1;
            })
        } 
        else {
            //console.log("incorrect guess! :(");
            eachWordEnteredLettersDictionary[cellWordIndex] = [];
            let index = 0;
            allCells.forEach(singleCell => {
                // add all current word correctly guessed letters to hashset type object
                if (mysteryWords[cellWordIndex][index] === singleCell.textContent.toUpperCase()) {
                    correctlyGuessedNumbers[singleCell.id.split(':')[3]] = mysteryWords[cellWordIndex][index];
                }
                // if letter hasn't been guessed before. Paint red
                else {
                    singleCell.classList.add('wrong');
                }
                index += 1;
            })
            incorrectInputsAmount += 1;
            allCells.forEach(singleCell => { 
                // if letter has been entered somewhere else correctly already. Meaning - human error was made, paint yellow not red
                if (singleCell.classList.contains('wrong') && correctlyGuessedNumbers[singleCell.id.split(':')[3]] !== undefined) {
                    singleCell.classList.remove('wrong');
                    singleCell.classList.add('mistake');
                }
            })
        }
        inputsAmount += 1;

        // fills ALL cells that contain found out letters
        fillAllOccurrences(wholeDocumentCells, correctlyGuessedNumbers);
        scoreCount(false);

        cell.contentEditable = false;
        cell.blur;

        // check if 'key sentence' has been filled correctly
        checkAnswerCells(mysteryWords);
    } 
    else {
        console.log("word not completed");
    }
}

var gameWon = false;

function checkAnswerCells(mysteryWords) {
    let answerWord = '';
    var answerGrid = document.getElementsByClassName("grid")[0];
    var answerCells = answerGrid.querySelectorAll('.box, .filledSpace');
    answerCells.forEach(answerCell => {
        answerWord = answerWord + answerCell.textContent.toUpperCase();
    })

    // if 'key sentence' has been filled correctly
    if (mysteryWords[0] === answerWord && !gameWon) {
        gameWin(answerWord);
    }
}

function scoreCount(initial) {
    if (initial) {
        const scoreDiv = document.getElementById("score");
        var inputsMessage = document.createElement("p");
        inputsMessage.id = "inputsScore";
        inputsMessage.className = "score1";
        inputsMessage.innerHTML = "Sisestusi: " + inputsAmount;
        scoreDiv.appendChild(inputsMessage);

        var incorrectInputsMessage = document.createElement("p");
        incorrectInputsMessage.id = "incorrectInputsScore";
        incorrectInputsMessage.className = "score2";
        incorrectInputsMessage.innerHTML = "Vigaseid sisestusi: " + incorrectInputsAmount;
        scoreDiv.appendChild(incorrectInputsMessage);
    }
    else {
        const inputsMessageId = document.getElementById("inputsScore");
        inputsMessageId.innerHTML = "Sisestusi: " + inputsAmount;

        const incorrectInputsMessageId = document.getElementById("incorrectInputsScore");
        incorrectInputsMessageId.innerHTML = "Vigaseid sisestusi: " + incorrectInputsAmount;
    }
}

function fillAllOccurrences(wholeDocumentCells, correctlyGuessedNumbers) {
    wholeDocumentCells.forEach(singleDocumentCell => {
        let cellIdNumericalValue = singleDocumentCell.id.split(':')[3];
        // check if letter is in the 'correctly guessed letters' hashset. Don't enter if it's player's mistake
        if (correctlyGuessedNumbers.hasOwnProperty(cellIdNumericalValue) && !singleDocumentCell.classList.contains('mistake')) {
            singleDocumentCell.classList.add('correct');
            singleDocumentCell.classList.remove('wrong');
            singleDocumentCell.contentEditable = false;
            singleDocumentCell.textContent = correctlyGuessedNumbers[cellIdNumericalValue];
        }
    })
}

function gameWin(answerWord) {
    const modal = document.getElementById("modalWin");
    var span = document.getElementById("modalWinClose");
    modal.style.display = "block";

    var answerWordLower = mysteryWords[0].toLowerCase()
    var winMessage = answerWordLower.charAt(0).toUpperCase() + answerWordLower.slice(1);
    
    var answerMessage = document.getElementById("answerSlot");
    var inputsMessage = document.getElementById("inputsAmount");
    var incorrectInputsMessage = document.getElementById("incorrectInputsAmount");

    answerMessage.innerHTML = "Võtmevastus: <span style='font-weight: bold;'>" + winMessage + "</span>";
    inputsMessage.innerHTML = "Sisestusi: " + inputsAmount;
    incorrectInputsMessage.innerHTML = "Vigaseid sisestusi: " + incorrectInputsAmount;

    gameWon = true;

    // When the user clicks on <span> (x), close the modal
    span.onclick = function() {
        modal.style.display = "none";
        showButton();
    }

    // When the user clicks anywhere outside of the modal, close it
    window.onclick = function(event) {
    if (event.target == modal) {
        modal.style.display = "none";
        showButton();
    }
    }
}

function showButton() {
    let element = document.getElementById("replayButton");
    let hidden = element.getAttribute("hidden");

    if (hidden) {
       element.removeAttribute("hidden");
    }
}

function helpModal() {
    const modal = document.getElementById("modalHelp");
    modal.style.display = "block";
    var span = document.getElementById("modalHelpClose");

    // When the user clicks on <span> (x), close the modal
    span.onclick = function() {
        modal.style.display = "none";
    }

    // When the user clicks anywhere outside of the modal, close it
    window.onclick = function(event) {
    if (event.target == modal) {
        modal.style.display = "none";
    }
    }
}

startup();