//All elements that should flash when "=" is clicked
const flashableElements = document.querySelectorAll("h1, .display");


// elements is a nodelist of elements to flash
function flashElements(elements){
    elements.forEach((element) => element.classList.toggle("pre-clicked"));
}

function handleClick(e) {
    this.classList.toggle("clicked");
    flashElements(flashableElements);
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


document.querySelectorAll("button").forEach(thisbutton => {
    thisbutton.addEventListener('click', handleClick);
    thisbutton.addEventListener('transitionend', endTransition);
});

flashableElements.forEach(element => {
    element.addEventListener('transitionend', endTransition);
});