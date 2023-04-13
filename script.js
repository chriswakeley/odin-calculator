function handleClick(e){
    this.classList.toggle("clicked")
    let header = document.querySelector("h1");
    header.classList.toggle("pre-clicked");
    //document.querySelector("#header").classList.toggle("pre-clicked");
    
}
function endTransition(e){
    /*if(this.classList.contains('pre-clicked') && !(this.classList.contains('clicked'))){
        this.classList.toggle('clicked');
        return;
    }
    if(!(this.classList.contains('clicked'))) return;
    this.classList.toggle("clicked");
    if(this.classList.contains("pre-clicked")){
        this.classList.toggle("pre-clicked");
    }*/
    if(e.propertyName !== "color") return;
    if(e.elapsedTime <= 0.05 && this.classList.contains('pre-clicked') ){
        this.classList.toggle("clicked");
        return;
    }
    if(e.elapsedTime <= 0.1 && this.classList.contains('clicked')){
        this.classList.toggle("clicked");
        if(this.classList.contains('pre-clicked')){
            this.classList.toggle("pre-clicked");
        }
    }
}
document.querySelectorAll("button").forEach(thisbutton => {
    thisbutton.addEventListener('click', handleClick);
});

document.querySelectorAll("*").forEach(element => {
    element.addEventListener('transitionend', endTransition);
});