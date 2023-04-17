const calcState = {
    default: 0,
    enteringOp1: 1,
    enteringOp2: 2,
    operandEntered: 3,
    displayingResult: 4,
    error: 5,
}

function addOperator() {

}
function subtractOperator() {

}
function multiplyOperator() {

}
function divideOperator() {

}

const operators = {
    "+": addOperator,
    "-": subtractOperator,
    "*": multiplyOperator,
    "/": divideOperator,
}
const calcModel = {
    op1: "",
    op2: "",
    operator: "",
    result: "",
    state: calcState.default,

}

const calcDisplay = {
    result: document.querySelector(".result"),
    op1: document.querySelector(".op1"),
    op2: document.querySelector(".op2"),
    operator: document.querySelector(".op"),
}

//All elements that should flash when "=" is clicked
const flashOnEquals = document.querySelectorAll("h1, .display");
const flashOnOp = document.querySelectorAll("#calc-background>.border");

const soundMap = {};
function makeSoundMap() {
    let numSounds = document.querySelectorAll(".click-sound");
    numSounds.forEach((sound) => sound.volume = 0.2);
    let hoverSounds = document.querySelectorAll(".hover-sound");
    hoverSounds.forEach((sound) => sound.volume = 0.2);
    let miscSounds = document.querySelectorAll(".operator-sound");
    miscSounds.forEach((sound) => sound.volume = (sound.src.includes("samples/finish2.mp3")) ? 0.7 : 0.5);

    let numButtons = document.querySelectorAll(".num-button");
    numButtons.forEach((button, i) => {
        soundMap[button.textContent + "click"] = numSounds[i % numSounds.length];
        soundMap[button.textContent + "mouseover"] = hoverSounds[i % hoverSounds.length];
    });

    let miscButtons = document.querySelectorAll(".op-button, .misc-button");
    miscButtons.forEach((button, i) => {
        soundMap[button.textContent + "click"] = miscSounds[i % miscSounds.length];
        soundMap[button.textContent + "mouseover"] = hoverSounds[i % hoverSounds.length];
    });
}

function playSound(soundKey) {
    soundMap[soundKey].currentTime = 0;
    soundMap[soundKey].play();
}

// elements is a nodelist of elements to flash
function flashElements(elements) {
    elements.forEach((element) => element.classList.toggle("pre-clicked"));
}

function makeNewDigitElement(text) {
    const newDigit = document.createElement('div');
    newDigit.textContent = text;

    newDigit.classList.add("new-digit");
    return newDigit;
}

function setEmptyAndShrink(element) {
    element.replaceChildren();
    element.style.flex = "0 1 auto";
}

function setEmptyAndGrow(element) {
    element.replaceChildren();
    element.style.flex = "1";
}

function setGrow(element){
    element.style.flex = "1";
}

function setShrink(element){
    element.style.flex = "0 1 auto";
}

function addDisplayElements(displayProperty, manualEntry) {
    let newChars;
    if (arguments.length < 2) {
        switch (displayProperty) {
            case "op1":
            case "op2":
                newChars = calcModel[displayProperty] === "0." && calcDisplay[displayProperty].childElementCount === 0 ?
                    "0." : calcModel[displayProperty].charAt(calcModel[displayProperty].length - 1);

                break;

            case "operator":
                newChars = calcModel.operator;
                break;

            case "result":
                newChars = calcModel.result;
        }
    }
    else {
        newChars = manualDigits;
    }

    [...newChars].forEach((digit, i) => {
        calcDisplay[displayProperty].appendChild(makeNewDigitElement(digit));
        requestAnimationFrame(() => [...calcDisplay[displayProperty].children][calcDisplay[displayProperty].childElementCount - (i + 1)].classList.toggle("settled-digit"));
    });
}

function clearDisplayElements(elements) {
    elementsCopy = elements.cloneNode(true);
    elementsCopy.addEventListener('transitionend', endTransition);
    elementsCopy.classList.toggle("to-clear");
    elementsCopy.style.color = "black";
    elementsCopy.forEach((element) => {
        element.addEventListener('transitionend', endTransition);
        element.classList.toggle("to-clear");
    });
}

function updateDisplay() {

    switch (calcModel.state) {

        case calcState.default:
            setEmptyAndShrink(calcDisplay.result);
            setEmptyAndShrink(calcDisplay.operator);
            setEmptyAndGrow(calcDisplay.op1);
            setEmptyAndShrink(calcDisplay.op2);
            break;

        case calcState.enteringOp1:

            if (calcDisplay.result.childElementCount > 0) {
                clearDisplayElements(calcDisplay.result);
                setEmptyAndShrink(result);
            }
            addDisplayElements("op1");
            break;

        case calcState.operandEntered:
            if (calcDisplay.result.childElementCount > 0) {
                clearDisplayElements(calcDisplay.result);
                addDisplayElements("op1", calcModel.result);
                addDisplayElements("operator");
                setEmptyAndGrow(calcDisplay.op2);
                setEmptyAndShrink(result);
            }
            else{
                setShrink(calcDisplay.op1);
                addDisplayElements("operator");
                setGrow(calcDisplay.op2);
            }

        case calcState.enteringOp2:{
            addDisplayElements("op2");
            break;
        }
    }


    /*let display = document.querySelector(".display-text");
    display.textContent += "\n" + input.split("").join("\n");*/
}

//returns new operand based on current operand and input
function updateOperand(currentOp, input) {
    if (input === "." &&
        calcModel[currentOp].includes(".")) {
        return;
    }
    calcModel[currentOp] += input;
}

function handleNumClick(numButton) {
    let newInput;
    switch (calcModel.state) {
        case calcState.default:
        case calcState.error:
        case calcState.displayingResult:
        case calcState.enteringOp1:
            calcModel.state = calcState.enteringOp1;
            newInput = numButton.id === 'decimal' ? "0." : numButton.textContent;
            updateOperand("op1", newInput);
            updateDisplay();
            break;

        case calcState.operandEntered:
        case calcState.enteringOp2:
            calcModel.state = calcState.enteringOp2;
            newInput = numButton.id === 'decimal' ? "0." : numButton.textContent;
            updateOperand("op2", newInput);
            updateDisplay();
            break;
    }


}

function handleOpClick(opButton) {
    flashElements(flashOnOp);
    switch (calcModel.state) {
        case calcState.enteringOp1:
            calcModel.state = calcState.operandEntered;
            calcModel.operator = opButton.textContent;
            updateDisplay();
            break;

        case calcState.displayingResult:
            calcModel.op1 = calcModel.result;
            calcModel.result = "";
            calcModel.operator = opButton.textContent;
            calcModel.state = calcState.operandEntered;
            updateDisplay();
            break;
    }

}

function handleMiscClick(miscButton) {
    if (miscButton.id === "operate") {
        flashElements(flashOnEquals);
        flashElements(flashOnOp);
    }
}

function handleClick(e) {
    this.classList.toggle("clicked");
    playSound(this.textContent + "click");
    if (this.classList.contains('num-button')) {
        handleNumClick(this);
    }
    else if (this.classList.contains('op-button')) {
        handleOpClick(this);
    }
    else if (this.classList.contains('misc-button')) {
        handleMiscClick(this);
    }
}

function endTransition(e) {
    //ignore all but color to limit one call per transition
    if (e.propertyName !== "color") return;

    //handle flashable elements in pre-clicked state
    if (this.classList.contains('pre-clicked')) {
        this.classList.toggle('pre-clicked');
        this.classList.toggle('clicked');
        return;
    }

    //handle buttons and flashable elements when in 'clicked' state
    if (this.classList.contains('clicked')) {
        this.classList.toggle('clicked');
        return;
    }

    //handle elements to be cleared
    if(this.classList.contains('to-clear')){
        this.remove();
        return;
    }
}

function handleMouseOver(e) {
    playSound(this.textContent + "mouseover");
}

document.querySelectorAll("button").forEach(thisbutton => {
    thisbutton.addEventListener('click', handleClick);
    thisbutton.addEventListener('transitionend', endTransition);
    thisbutton.addEventListener('mouseover', handleMouseOver);
});

flashOnEquals.forEach(element => {
    element.addEventListener('transitionend', endTransition);
});

flashOnOp.forEach(element => {
    element.addEventListener('transitionend', endTransition);
});

makeSoundMap();
updateDisplay("");