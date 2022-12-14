// Global selections and variables
const colorDivs = document.querySelectorAll('.color');
const generateBtn = document.querySelector('.generate');
const sliders = document.querySelectorAll('input[type="range"]');
const currentHexes = document.querySelectorAll('.color h2');
const popup = document.querySelector('.copy-container');
const adjustBtn = document.querySelectorAll('.adjust');
const lockBtn = document.querySelectorAll('.lock');
const closeAdjustments = document.querySelectorAll('.close-adjustments');
const sliderContainers = document.querySelectorAll('.sliders');

let initialColors;
// this is for local storage
let savedPalettes = [];

// add event listeners
generateBtn.addEventListener('click', randomColors);
lockBtn.forEach((button, index) => {
    button.addEventListener('click', (event) => {
        lockLayer(event, index);
    })
})
sliders.forEach(slider => {
    slider.addEventListener('input', hslControls)
});
colorDivs.forEach((slider, index) => {
    slider.addEventListener("change", () => {
        updateTextUI(index);
    });
});
currentHexes.forEach(hex => {
    hex.addEventListener('click', async () => {
        await copyToClipboard(hex);
    })
});
popup.addEventListener('transitionend', () => {
    const popupBox = popup.children[0];
    popup.classList.remove('active');
    popupBox.classList.remove('active');
});
adjustBtn.forEach((button, index) => {
    button.addEventListener('click', () => {
        openAdjustmentPanel(index);
    });
});
closeAdjustments.forEach((button, index) => {
    button.addEventListener('click', () => {
        closeAdjustmentPanel(index);
    })
})

// Functions

// Color Generator
function generateHex() {
   const hexColor = chroma.random();
   return hexColor;
}
let randomHex = generateHex();

function randomColors() {
    initialColors = [];

    colorDivs.forEach((div, index) => {
        const hexText = div.children[0];
        const randomColor = generateHex();

        if(div.classList.contains('locked')) {
            initialColors.push(hexText.innerText);
            return;
        } else {
            initialColors.push(chroma(randomColor).hex());
        }

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

    //reset inputs
    resetInputs();

    // check for btn contrast
    adjustBtn.forEach((button, index) => {
        checkTextContrast(initialColors[index], button);
        checkTextContrast(initialColors[index], lockBtn[index]);
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

    // colirize sliders
    colorizeSliders(color, hue, brightness, saturation);
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

function resetInputs() {
    const sliders = document.querySelectorAll('.sliders input');
    sliders.forEach(slider => {
        if(slider.name == 'hue') {
            const hueColor = initialColors[slider.getAttribute('data-hue')];
            const hueValue = chroma(hueColor).hsl()[0];
            slider.value = Math.floor(hueValue);
        }
        if (slider.name == 'brightness') {
            const brightColor = initialColors[slider.getAttribute('data-bright')];
            const brightValue = chroma(brightColor).hsl()[1];
            slider.value = Math.floor(brightValue * 100) / 100;
        }
        if (slider.name == 'saturation') {
            const satColor = initialColors[slider.getAttribute('data-sat')];
            const satValue = chroma(satColor).hsl()[2];
            slider.value = Math.floor(satValue * 100) / 100;
        }
    })
}

async function copyToClipboard(hex) {
    try {
        await navigator.clipboard.writeText(hex.innerText);
        console.log('copied')
        // popup animation
        const popupBox = popup.children[0];
        popup.classList.add('active');
        popupBox.classList.add('active'); 
    } catch(err) {
        console.error(err);
    }
}

function openAdjustmentPanel(index) {
    // check if its mobile or not
    if (window.innerWidth <= 880) {
        console.log('mobile')
        colorDivs[index].classList.toggle('mobile-adjustments-panel-open');
    }
    sliderContainers[index].classList.toggle('active');
}

function closeAdjustmentPanel(index) {
    if (window.innerWidth <= 880) {
        colorDivs[index].classList.toggle('mobile-adjustments-panel-open');
    }
    sliderContainers[index].classList.remove('active');
}

function lockLayer(event, index) {
    const lockSVG = event.target.children[0];
    const activeBg = colorDivs[index];
    activeBg.classList.toggle("locked");
  
    if (lockSVG.classList.contains("fa-lock-open")) {
        event.target.innerHTML = '<i class="fas fa-lock"></i>';
    } else {
        event.target.innerHTML = '<i class="fas fa-lock-open"></i>';
    }
}

// implement save to palette and LOCAL STORAGE staff
const saveBtn = document.querySelector('.save');
const submitSave = document.querySelector('.submit-save');
const closeSave = document.querySelector('.close-save');
const saveContainer = document.querySelector('.save-container');
const saveInput = document.querySelector('.save-container input');
const libraryContainer = document.querySelector('.library-container');
const libraryBtn = document.querySelector('.library');
const closeLibraryBtn = document.querySelector('.close-library');

// event listeners
saveBtn.addEventListener('click', openPalette);
closeSave.addEventListener('click', closePalette);
submitSave.addEventListener('click', savePalette);
libraryBtn.addEventListener('click', openLibrary);
closeLibraryBtn.addEventListener('click', closeLibrary);

function openPalette(event) {
    const popup = saveContainer.children[0];
    saveContainer.classList.add('active');
    popup.classList.add('active');
}

function closePalette(event) {
    const popup = saveContainer.children[0];
    saveContainer.classList.remove('active');
    popup.classList.remove('active');
}

function savePalette(event) {
    saveContainer.classList.remove('active');
    popup.classList.remove('active');
    const name = saveInput.value;
    const colors = [];
    currentHexes.forEach(hex => {
        colors.push(hex.innerText);
    });
    // generate object
    let paletteNr;
    const paletteObjects = JSON.parse(localStorage.getItem('palettes'));
    if (paletteObjects) {
        paletteNr = paletteObjects.length;
    } else {
        paletteNr = savedPalettes.length;
    }


    const paletteObj = {name, colors, nr: paletteNr};
    savedPalettes.push(paletteObj);
    // save to locla storage
    saveToLocal(paletteObj);
    saveInput.value = '';
    // generate the palette for library
    const palette = document.createElement('div');
    palette.classList.add('custom-palette');
    const title = document.createElement('h4');
    title.innerText = paletteObj.name;
    const preview = document.createElement('div');
    preview.classList.add('small-preview');
    paletteObj.colors.forEach(smallColor => {
        const smallDiv = document.createElement('div');
        smallDiv.style.backgroundColor = smallColor;
        preview.appendChild(smallDiv);
    });
    const paletteBtn = document.createElement('button');
    paletteBtn.classList.add('pick-palette-btn');
    paletteBtn.classList.add(paletteObj.nr);
    paletteBtn.innerText = "Select";

    // attach event to the btn
    paletteBtn.addEventListener('click', event => {
        closeLibrary();
        const paletteIndex = event.target.classList[1];
        initialColors = [];
        savedPalettes[paletteIndex].colors.forEach((color, index) => {
            initialColors.push(color);
            colorDivs[index].style.backgroundColor = color;
            const text = colorDivs[index].children[0];
            checkTextContrast(color, text);
            updateTextUI(index);
        });
       resetInputs();
    });

    //append to library
    palette.appendChild(title);
    palette.appendChild(preview);
    palette.appendChild(paletteBtn);
    libraryContainer.children[0].appendChild(palette);
}

function saveToLocal(obj) {
    let localPalettes;
    if(localStorage.getItem('palettes')) {
        localPalettes = JSON.parse(localStorage.getItem('palettes'));
    } else {
        localPalettes = [];
    }
    localPalettes.push(obj);
    localStorage.setItem('palettes', JSON.stringify(localPalettes));

}

function openLibrary(event) {
    const popup = libraryContainer.children[0];
    libraryContainer.classList.add('active');
    popup.classList.add('active');
}

function closeLibrary(event) {
    const popup = libraryContainer.children[0];
    libraryContainer.classList.remove('active');
    popup.classList.remove('active');
}

function getLocal() {
    if (localStorage.getItem('palettes')) {
        const paletteObjs = JSON.parse(localStorage.getItem('palettes'));
        savedPalettes = [...paletteObjs];
        paletteObjs.forEach(paletteObj => {
                // generate the palette for library
            const palette = document.createElement('div');
            palette.classList.add('custom-palette');
            const title = document.createElement('h4');
            title.innerText = paletteObj.name;
            const preview = document.createElement('div');
            preview.classList.add('small-preview');
            paletteObj.colors.forEach(smallColor => {
                const smallDiv = document.createElement('div');
                smallDiv.style.backgroundColor = smallColor;
                preview.appendChild(smallDiv);
            });
            const paletteBtn = document.createElement('button');
            paletteBtn.classList.add('pick-palette-btn');
            paletteBtn.classList.add(paletteObj.nr);
            paletteBtn.innerText = "Select";

            // attach event to the btn
            paletteBtn.addEventListener('click', event => {
                closeLibrary();
                const paletteIndex = event.target.classList[1];
                initialColors = [];
                paletteObjs[paletteIndex].colors.forEach((color, index) => {
                    initialColors.push(color);
                    colorDivs[index].style.backgroundColor = color;
                    const text = colorDivs[index].children[0];
                    checkTextContrast(color, text);
                    updateTextUI(index);
                });
            resetInputs();
            });

            //append to library
            palette.appendChild(title);
            palette.appendChild(preview);
            palette.appendChild(paletteBtn);
            libraryContainer.children[0].appendChild(palette);
        })
    } else {
        localPalettes = [];
    }
}

getLocal();
randomColors();