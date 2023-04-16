const calcState = {
    default: 0,
    enteringOp1: 1,
    enteringOp2: 2,
    operandEntered: 3,
    displayingResult: 4,
    error: 5,
}

const calcModel = {
    op1: "",
    op2: "",
    operator: null,
    result: "",
    state: calcState.default,
}

const calcDisplay = {
    result: document.querySelector(".result"),
    op1: document.querySelector(".op1"),
    op2: document.querySelector(".op2"),
    op: document.querySelector(".op"),
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

function updateDisplayOp(op) {
    let newDigit = calcModel[op] === "0." && calcDisplay[op].childElementCount === 0 ?
        "0." : calcModel[op].charAt(calcModel[op].length - 1);
    [...newDigit].forEach((digit, i) => {
        calcDisplay[op].appendChild(makeNewDigitElement(digit));
        requestAnimationFrame(() => [...calcDisplay[op].children][calcDisplay[op].childElementCount - (i + 1)].classList.toggle("settled-digit"));
    });
}

function updateDisplay() {

    switch (calcModel.state) {

        case calcState.default:
            setEmptyAndShrink(calcDisplay.result);
            setEmptyAndShrink(calcDisplay.op);
            setEmptyAndGrow(calcDisplay.op1);
            setEmptyAndShrink(calcDisplay.op2);
            break;

        case calcState.enteringOp1:

            if (calcDisplay.result.childElementCount > 0) {
                setEmptyAndShrink(result);
            }
            updateDisplayOp("op1");
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
    updateDisplay();
}

function handleNumClick(numButton) {
    if (calcModel.state === calcState.default ||
        calcModel.state === calcState.error) {

        calcModel.state = calcState.enteringOp1;
        let newInput = numButton.id === 'decimal' ? "0." : numButton.textContent;
        updateOperand("op1", newInput);
    }
    else if (calcModel.state === calcState.enteringOp1 ||
        calcModel.state === calcState.enteringOp2) {
        let op = calcModel.state === calcState.enteringOp1 ? "op1" : "op2";
        updateOperand(op, numButton.textContent);
    }
}

function handleOpClick(opButton) {
    flashElements(flashOnOp);
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