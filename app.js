// Global selections and variables
const colorDivs = document.querySelectorAll('.color');
const generateBtn = document.querySelector('.generate');
const sliders = document.querySelectorAll('input[type="range"]');
const currentHexes = document.querySelectorAll('.color h2');

// add event listeners
sliders.forEach(slider => {
    slider.addEventListener('input', hslControls)
})
colorDivs.forEach((slider, index) => {
    slider.addEventListener("change", () => {
        updateTextUI(index);
    })
})

let initialColors;
// Functions

// Color Generator
function generateHex() {
   const hexColor = chroma.random();
   return hexColor;
}
let randomHex = generateHex();

function randomColors() {
    //
    initialColors = [];

    colorDivs.forEach((div, index) => {
        const hexText = div.children[0];
        const randomColor = generateHex();

        initialColors.push(chroma(randomColor).hex());
        // add color for bg
        div.style.backgroundColor = randomColor;
        hexText.innerText = randomColor;

        // check contrast
        checkTextContrast(randomColor, hexText);

        // initial colorize sliders
        const color = chroma(randomColor);
        const sliders = div.querySelectorAll('.sliders input');
        const hue = sliders[0];
        const brightness = sliders[1];
        const saturation = sliders[2];

        colorizeSliders(color, hue, brightness, saturation);
    })
}

function checkTextContrast(color, text) {
    const luminance = chroma(color).luminance();
    if (luminance > 0.5) {
        text.style.color = 'rgb(51,51,51)';
    } else {
        text.style.color = 'white';
    }
}

function colorizeSliders(color, hue, brightness, saturation) {
    // scale saturation
    const noSat = color.set('hsl.s', 0);
    const fullSat = color.set('hsl.s', 1);
    const scaleSat = chroma.scale([noSat, color, fullSat]);

    //scale brightness
    const midBright = color.set('hsl.l', 0.5);
    const scaleBright = chroma.scale(['black', midBright, 'white']);

    // update input colors
    saturation.style.backgroundImage = `linear-gradient(to right, ${scaleSat(0)}, ${scaleSat(1)}`;
    brightness.style.backgroundImage = `linear-gradient(to right, ${scaleBright(0)}, ${scaleBright(0.5)}, ${scaleBright(1)}`;
    hue.style.backgroundImage = `linear-gradient(to right, rgb(204, 75, 75), rgb(204, 204, 75), rgb(75, 204, 75), rgb(75, 204, 204), rgb(75, 75, 204), rgb(204, 75, 204), rgb(204, 75, 75))`;
}

function hslControls(event) {
    const index = event.target.getAttribute('data-bright') || event.target.getAttribute('data-sat') || event.target.getAttribute('data-hue');
    let sliders = event.target.parentElement.querySelectorAll('input[type="range"]');
    const hue = sliders[0];
    const brightness = sliders[1];
    const saturation = sliders[2];
    const bgColor = initialColors[index];

    let color = chroma(bgColor)
        .set('hsl.s', saturation.value)
        .set('hsl.l', brightness.value)
        .set('hsl.h', hue.value);
    
    colorDivs[index].style.backgroundColor = color;
}

function updateTextUI(index) {
    const activeDiv = colorDivs[index];
    const color = chroma(activeDiv.style.backgroundColor);
    const textHex = activeDiv.querySelector('h2');
    const icons = activeDiv.querySelectorAll('.controls button');
    textHex.innerText = color.hex();
    // check contras 
    checkTextContrast(color, textHex)
    for(let icon of icons) {
        checkTextContrast(color, icon);
    }
}

randomColors();