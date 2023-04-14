function handleClick(e){
    this.classList.toggle("clicked")
    let header = document.querySelector("h1");
    header.classList.toggle("pre-clicked");
    document.querySelector(".display").classList.toggle("pre-clicked");
    //document.querySelector("#header").classList.toggle("pre-clicked");
    
}
function endTransition(e){
    if(e.propertyName !== "color") return;
    if(this.classList.contains('pre-clicked')){
        this.classList.toggle('pre-clicked');
        this.classList.toggle('clicked');
        return;
    }
    if(this.classList.contains('clicked')){
        this.classList.toggle('clicked');
    }

}
document.querySelectorAll("button").forEach(thisbutton => {
    thisbutton.addEventListener('click', handleClick);
});

document.querySelectorAll("h1, .display, button").forEach(element => {
    element.addEventListener('transitionend', endTransition);
});