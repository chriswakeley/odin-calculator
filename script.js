//Disable hover effects when using touch
function watchForHover() {
    // lastTouchTime is used for ignoring emulated mousemove events
    let lastTouchTime = 0

    function enableHover() {
        if (new Date() - lastTouchTime < 500) return
        document.body.classList.add('hasHover')
    }

    function disableHover() {
        document.body.classList.remove('hasHover')
    }

    function updateLastTouchTime() {
        lastTouchTime = new Date()
    }

    document.addEventListener('touchstart', updateLastTouchTime, true)
    document.addEventListener('touchstart', disableHover, true)
    document.addEventListener('mousemove', enableHover, true)

    enableHover()
}

watchForHover()

//Web audio api for music mode
var actx = null;
var audioSrc = "samples/full-loop.mp3";
var audioData;
var srcNode;
function makeNewAudioContext() {
    if (actx === null) {
        actx = new (AudioContext || webkitAudioContext)(),
            audioSrc = "samples/full-loop.mp3",
            audioData, srcNode;
        fetch(audioSrc, { mode: "cors" }).then(function (resp) { return resp.arrayBuffer() }).then(decode);
    }
}



// Decode the audio file, then start the show
function decode(buffer) {
    actx.decodeAudioData(buffer, playLoop);
}

// Sets up a new source node as needed as stopping will render current invalid
function playLoop(abuffer) {
    if (!audioData) audioData = abuffer;  // create a reference for control buttons
    srcNode = actx.createBufferSource();  // create audio source
    srcNode.buffer = abuffer;             // use decoded buffer
    srcNode.connect(actx.destination);    // create output
    srcNode.loop = true;                  // takes care of perfect looping
    srcNode.start();                      // play...
}


const calcState = {
    default: 0,
    enteringOp1: 1,
    enteringOp2: 2,
    operandEntered: 3,
    displayingResult: 4,
    error: 5,
}

function addOperator(op1, op2) {
    return `${Math.round(((op1 + op2) + Number.EPSILON) * 1000000) / 1000000}`;
}
function subtractOperator(op1, op2) {
    return `${Math.round(((op1 - op2) + Number.EPSILON) * 1000000) / 1000000}`;
}
function multiplyOperator(op1, op2) {
    return `${Math.round(((op1 * op2) + Number.EPSILON) * 1000000) / 1000000}`;
}
function divideOperator(op1, op2) {
    if (+op2 === 0) {
        return "error";
    }
    return `${Math.round(((op1 / op2) + Number.EPSILON) * 1000000) / 1000000}`;
}

const operators = {
    "+": addOperator,
    "-": subtractOperator,
    "*": multiplyOperator,
    "÷": divideOperator,
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
    elements.forEach((element) => {
        /*
        if(!(element.classList.contains("pre-clicked")) || !(element.classList.contains("clicked"))){
            element.classList.add("pre-clicked");
        }
        */
        element.classList.add("pre-clicked");
    });

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
    element.classList.add("shrunk");
    [...element.children].forEach((child) => child.classList.add("shrunk"));
}

function setEmptyAndGrow(element) {
    element.replaceChildren();
    element.style.flex = "1";
    element.classList.remove("shrunk");
    [...element.children].forEach((child) => child.classList.remove("shrunk"));
}

function setGrow(element) {
    element.style.flex = "1";
    element.classList.remove("shrunk");
    [...element.children].forEach((child) => child.classList.remove("shrunk"));

}

function setShrink(element) {
    element.style.flex = "0 1 auto";
    element.classList.add("shrunk");
    [...element.children].forEach((child) => child.classList.add("shrunk"));
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
        newChars = manualEntry;
    }

    [...newChars].forEach((digit, i) => {
        calcDisplay[displayProperty].appendChild(makeNewDigitElement(digit));
        requestAnimationFrame(() => [...calcDisplay[displayProperty].children][calcDisplay[displayProperty].childElementCount - (i + 1)].classList.toggle("settled-digit"));
    });
}

function deleteOpDigits(op) {
    [...calcDisplay[op].children].forEach((child, i) => {
        if (i > (calcModel[op].length - 1)) {
            clearDisplayElements(child);
        }

    });
    [...calcDisplay[op].children].forEach((child, i) => {
        if (i > (calcModel[op].length - 1)) {
            child.remove();
        }

    });

}

function clearDisplayElements(elements) {
    let elementsCopy = elements.cloneNode(true);
    elementsCopy.addEventListener('transitionend', endTransition);
    elementsCopy.classList.toggle("pre-clear");
    let pos = elements.getBoundingClientRect();
    elementsCopy.style.position = "fixed";
    elementsCopy.style.left = `${pos.left}px`;
    elementsCopy.style.top = `${pos.top}px`;
    document.querySelector("body").appendChild(elementsCopy);
    requestAnimationFrame(() => document.querySelectorAll(".pre-clear").forEach((toClear) => toClear.classList.add("to-clear")));
}

function updateDisplay() {
    switch (calcModel.state) {

        case calcState.default:
            clearDisplayElements(calcDisplay.result);
            clearDisplayElements(calcDisplay.operator);
            clearDisplayElements(calcDisplay.op1);
            clearDisplayElements(calcDisplay.op2);
            setEmptyAndShrink(calcDisplay.result);
            setEmptyAndShrink(calcDisplay.operator);
            setEmptyAndGrow(calcDisplay.op1);
            setEmptyAndShrink(calcDisplay.op2);
            break;

        case calcState.enteringOp1:
            if (calcDisplay.op1.childElementCount > calcModel.op1.length) {
                deleteOpDigits("op1");
            }
            else {
                if (calcDisplay.result.childElementCount > 0) {
                    clearDisplayElements(calcDisplay.result);
                    setEmptyAndShrink(calcDisplay.result);
                    setGrow(calcDisplay.op1);
                }

                addDisplayElements("op1");
            }
            break;


        case calcState.operandEntered:
            if (calcDisplay.result.childElementCount > 0) {
                calcDisplay.op1.remove();
                calcDisplay.op1 = calcDisplay.result.cloneNode(true);
                calcDisplay.op1.classList.remove("result");
                calcDisplay.op1.classList.add("op1");
                calcDisplay.result.before(calcDisplay.op1);
                addDisplayElements("operator");
                setEmptyAndGrow(calcDisplay.op2);
                setEmptyAndShrink(calcDisplay.result);
                setShrink(calcDisplay.op1);
            }
            else if (calcDisplay.op2.childElementCount > 0) {
                clearDisplayElements(calcDisplay.operator);
                clearDisplayElements(calcDisplay.op1);
                clearDisplayElements(calcDisplay.op2);
                setEmptyAndShrink(calcDisplay.op1);
                setEmptyAndShrink(calcDisplay.operator);
                setEmptyAndGrow(calcDisplay.op2);
                addDisplayElements("op1", calcModel.op1);
                addDisplayElements("operator");
            }
            else {
                setShrink(calcDisplay.op1);
                addDisplayElements("operator");
                setGrow(calcDisplay.op2);
            }
            break;

        case calcState.enteringOp2: {
            if (calcDisplay.op2.childElementCount > calcModel.op2.length) {
                deleteOpDigits("op2");
            }
            else {
                addDisplayElements("op2");
            }
            break;
        }

        case calcState.displayingResult:
            clearDisplayElements(calcDisplay.op1);
            clearDisplayElements(calcDisplay.op2);
            clearDisplayElements(calcDisplay.operator);
            setEmptyAndShrink(calcDisplay.op1);
            setEmptyAndShrink(calcDisplay.op2);
            setEmptyAndShrink(calcDisplay.operator);
            setGrow(calcDisplay.result);
            addDisplayElements("result");
            break;

        case calcState.error:
            clearDisplayElements(calcDisplay.result);
            clearDisplayElements(calcDisplay.operator);
            clearDisplayElements(calcDisplay.op1);
            clearDisplayElements(calcDisplay.op2);
            setEmptyAndShrink(calcDisplay.result);
            setEmptyAndShrink(calcDisplay.operator);
            setEmptyAndGrow(calcDisplay.op1);
            setEmptyAndShrink(calcDisplay.op2);
            break;
    }
}

//returns true if changed
function updateOperand(currentOp, input) {
    if (input === "backspace") {
        if (calcModel[currentOp].length === 0) {
            return false;
        }
        else if (calcModel[currentOp].length === 1) {
            calcModel[currentOp] = "";
            return true;
        }
        else {
            calcModel[currentOp] = calcModel[currentOp].substring(0, calcModel[currentOp].length - 1);
            if (calcModel[currentOp] === "0") {
                calcModel[currentOp] = "";
            }
            return true;
        }
    }
    else {
        if (input === "." &&
            calcModel[currentOp].includes(".")) {
            return false;
        }
        calcModel[currentOp] += input;
        return true;
    }
}

function handleNumClick(numButton) {
    let newInput;
    switch (calcModel.state) {
        case calcState.default:
        case calcState.displayingResult:
        case calcState.enteringOp1:
            calcModel.state = calcState.enteringOp1;
            if (numButton.id === 'decimal') {
                if (calcModel.op1 === "") {
                    newInput = "0.";
                }
                else {
                    newInput = ".";
                }
            }
            else {
                newInput = numButton.textContent;
            }
            if (updateOperand("op1", newInput)) {
                updateDisplay();
            }
            break;

        case calcState.operandEntered:
        case calcState.enteringOp2:
            calcModel.state = calcState.enteringOp2;
            if (numButton.id === 'decimal') {
                if (calcModel.op2 === "") {
                    newInput = "0.";
                }
                else {
                    newInput = ".";
                }
            }
            else {
                newInput = numButton.textContent;
            }
            if (updateOperand("op2", newInput)) {
                updateDisplay();
            }
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

        case calcState.enteringOp2:
            calcModel.op1 = operators[calcModel.operator](+(calcModel.op1), +(calcModel.op2));
            if (calcModel.op1 === "error") {
                calcModel.op1 = "";
                calcModel.op2 = "";
                calcModel.operator = "";
                calcModel.result = "";
                calcModel.state = calcState.error;
                makeNewAudioContext()
                playLoop(audioData);
                flashElements(flashOnEquals);
                flashElements(flashOnOp);
                updateDisplay();
            }
            else {
                calcModel.op2 = ""
                calcModel.operator = opButton.textContent;
                calcModel.state = calcState.operandEntered;
                updateDisplay();
            }
            break;
    }
}

function handleMiscClick(miscButton) {
    if (miscButton.id === "operate") {
        flashElements(flashOnEquals);
        flashElements(flashOnOp);
        switch (calcModel.state) {
            case calcState.enteringOp2:
                calcModel.result = operators[calcModel.operator](+(calcModel.op1), +(calcModel.op2));
                if (calcModel.result === "error") {
                    calcModel.op1 = "";
                    calcModel.op2 = "";
                    calcModel.operator = "";
                    calcModel.result = "";
                    calcModel.state = calcState.error;
                    makeNewAudioContext()
                    playLoop(audioData);
                    updateDisplay();
                }
                else {
                    calcModel.op1 = "";
                    calcModel.operator = "";
                    calcModel.op2 = "";
                    calcModel.state = calcState.displayingResult;
                    updateDisplay();
                }
                break;
        }
    }
    if (miscButton.id === "backspace") {
        switch (calcModel.state) {
            case calcState.enteringOp1:
                updateOperand("op1", "backspace");
                updateDisplay();
                break;
            case calcState.enteringOp2:
                updateOperand("op2", "backspace");
                updateDisplay();
                break;
        }
    }
    if (miscButton.id === "clear") {
        calcModel.op1 = "";
        calcModel.op2 = "";
        calcModel.operator = "";
        calcModel.result = "";
        calcModel.state = calcState.default;
        if (srcNode) {
            srcNode.stop();
            srcNode = null;
        }
        updateDisplay();
    }
}

function handleClick(e) {
    //this.classList.toggle("clicked");
    flashElements([this]);
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

    /*
    //handle flashable elements in pre-clicked state
    if (this.classList.contains('pre-clicked')) {
        this.classList.toggle('pre-clicked');
        this.classList.toggle('clicked');
        return;
    }

    //handle buttons and flashable elements when in 'clicked' state
    if (this.classList.contains('clicked')) {
        this.classList.toggle('clicked');
        if (calcModel.state === calcState.error) {
            flashElements(flashOnEquals);
        flashElements(flashOnOp);
        }
        return;
    }
    */

    if (this.classList.contains('pre-clicked') && !(this.classList.contains('clicked'))) {
        this.classList.remove('pre-clicked');
        this.classList.add('clicked');
        return;
    }

    //handle buttons and flashable elements when in 'clicked' state
    if (this.classList.contains('clicked')) {
        this.classList.remove('clicked');
        this.classList.remove('pre-clicked');
        if (calcModel.state === calcState.error) {
            /*requestAnimationFrame(()=>{
                this.classList.add('pre-clicked');
            });*/
            //this.classList.add('pre-clicked');
            flashElements(flashOnEquals);
            flashElements(flashOnOp);

        }
        return;
    }

    //handle elements to be cleared
    if (this.classList.contains('to-clear')) {
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