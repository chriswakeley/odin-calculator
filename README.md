# odin-calculator

Final Project for foundations

A calculator that also functions as a music box with numbers corresponding to a lead instrument, and operators corresponding to chords.

Supports touch, mouse, and keyboard input, and CSS should scale to fit most window sizes.

Supports chaining operators, e.g. 5 + 3 * 2 - 1 = 15

The page is implemented with HTML/CSS/JS.  Looping audio when in the easter-egg/divide-by-zero mode uses the Web Audio API.

The most challenging aspects were:
- implementing multi-stage color transitions by listening for transitionend events and toggling classes in a sequence
- implementing the animation system for the digit display which required the use of requestAnimationFrame, carefully setting flex properties, and handling many possible states with unique animation logic. 
- keeping the display code independent of the control and model code - if I could, I would reimplement this differently. 
- Styling the site only using units relative to vh or vmin such that it scales to most window sizes. 

Things I learned:
 - CSS only updates when the JS call stack is empty, so if you want to create a new DOM element, and immediately have its CSS transition, you need to use requestAnimationFrame.
 - Display/view code is probably easier to implement if it takes changes to a model, instead of having to figure out what changed based on only the current model state, and the fact that something changed.
 - Touch inputs don't play nicely with hover
 - How to switch and element to fixed positioning by using getBoundingClientRect()
  