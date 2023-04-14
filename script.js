const calcState = {
    default: 0,
    enteringOp1: 1,
    enteringOp2: 2,
    error: 3,
}

const calcModel = {
    op1: "",
    op2: "",
    operator: null,
    result: "",
    state: calcState.default,
}

const soundMap = {};
function makeSoundMap(){
    let numSounds = document.querySelectorAll(".operator-sound");
    numSounds.forEach((sound) => sound.volume = 0.3);
    let hoverSounds = document.querySelectorAll(".hover-sound");
    hoverSounds.forEach((sound) => sound.volume = 0.3);
    let numButtons = document.querySelectorAll(".num-button");
    numButtons.forEach((button, i) => {
        soundMap[button.textContent + "click"] = numSounds[i%numSounds.length];
        soundMap[button.textContent + "mouseover"] = hoverSounds[i%hoverSounds.length];
    });
}

function playSound(soundKey){
    soundMap[soundKey].currentTime = 0;
    soundMap[soundKey].play();
}

//All elements that should flash when "=" is clicked
const flashableElements = document.querySelectorAll("h1, .display");


// elements is a nodelist of elements to flash
function flashElements(elements) {
    elements.forEach((element) => element.classList.toggle("pre-clicked"));
}

function updateDisplay(input){
    
    let display = document.querySelector(".display-text");
    display.textContent += "\n" + input.split("").join("\n");
}

//returns new operand based on current operand and input
function updateOperand(currentOp, input){
    if(input === "." &&
    calcModel[currentOp].includes(".")){
            return;
    }
    calcModel[currentOp] += input;
    updateDisplay(input);
}

function handleNumClick(numButton) {
    if (calcModel.state === calcState.default ||
        calcModel.state === calcState.error) {

        calcModel.state = calcState.enteringOp1;
        let newInput = numButton.id === 'decimal' ? "0." : numButton.textContent;
        updateOperand("op1", newInput);
    }
    else if(calcModel.state === calcState.enteringOp1 ||
        calcModel.state === calcState.enteringOp2 ){
        let op = calcModel.state === calcState.enteringOp1 ? "op1" : "op2";
        updateOperand(op, numButton.textContent);
    }
}

function handleOpClick(opButton) {

}

function handleMiscClick(miscButton) {
    if (miscButton.id === "operate") {
        flashElements(flashableElements);
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

function handleMouseOver(e){
    playSound(this.textContent + "mouseover");
}

document.querySelectorAll("button").forEach(thisbutton => {
    thisbutton.addEventListener('click', handleClick);
    thisbutton.addEventListener('transitionend', endTransition);
    thisbutton.addEventListener('mouseover', handleMouseOver);
});

flashableElements.forEach(element => {
    element.addEventListener('transitionend', endTransition);
});

makeSoundMap();