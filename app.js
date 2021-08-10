const colorDivs = document.querySelectorAll(".color");
const generateBtn = document.querySelector(".generate");
const sliders = document.querySelectorAll('input[type="range"]');
const currentHexes = document.querySelectorAll(".color h2");
const popup = document.querySelector(".copy-container");
const adjustButtons = document.querySelectorAll(".adjust");
const lockButtons = document.querySelectorAll(".lock");
const closeAdjustButtons = document.querySelectorAll(
  ".sliders .close-adjustment"
);

let initialColors;
const savedPalettes = [];

sliders.forEach((slider) => {
  slider.addEventListener("input", hslControls);
});
colorDivs.forEach((div, index) => {
  div.addEventListener("change", () => {
    updateTextUI(index);
  });
});
lockButtons.forEach((btn, index) => {
  btn.addEventListener("click", () => {
    btn.firstChild.classList.toggle("fa-lock-open");
    btn.firstChild.classList.toggle("fa-lock");
    colorDivs[index].classList.toggle("locked");
  });
});
function hslControls(e) {
  //   console.log(e);
  const index =
    e.target.getAttribute("data-bright") ||
    e.target.getAttribute("data-sat") ||
    e.target.getAttribute("data-hue");
  let sliders = e.target.parentElement.querySelectorAll('input[type="range"]');
  const hue = sliders[0];
  const brightness = sliders[1];
  const saturation = sliders[2];
  //   const bgColor = colorDivs[index].querySelector("h2").innerText;
  const bgColor = initialColors[index];
  let color = chroma(bgColor)
    .set("hsl.s", saturation.value)
    .set("hsl.l", brightness.value)
    .set("hsl.h", hue.value);
  colorDivs[index].style.backgroundColor = color;
  colorizeSliders(color, hue, brightness, saturation);
}

function generateHex() {
  return chroma.random();
}
// console.log(generateHex());
// generateBtn.addEventListener("click", function () {
//   console.log(this);
// });
function randomColors(originColors = []) {
  console.log(originColors);
  initialColors = [];
  colorDivs.forEach((div, index) => {
    const hexText = div.children[0];
    let randomColor;

    console.log(originColors[index]);
    if (div.classList.contains("locked")) {
      initialColors.push(hexText.innerText);
      return;
    } else if (originColors[index]) {
      randomColor = chroma(originColors[index]);
      initialColors.push(originColors[index]);
    } else {
      randomColor = generateHex();
      initialColors.push(randomColor.hex());
    }

    div.style.backgroundColor = randomColor;
    hexText.innerText = randomColor;
    checkTextContrast(randomColor, hexText);
    const color = chroma(randomColor);
    const sliders = div.querySelectorAll(".sliders input");
    const hue = sliders[0];
    const brightness = sliders[1];
    const saturation = sliders[2];
    colorizeSliders(color, hue, brightness, saturation);
  });
  resetInputs();
  adjustButtons.forEach((btn, index) => {
    checkTextContrast(initialColors[index], btn);
    checkTextContrast(initialColors[index], lockButtons[index]);
  });
}
function colorizeSliders(color, hue, brightness, saturation) {
  const noSat = color.set("hsl.s", 0);
  const fullSat = color.set("hsl.s", 1);
  const scaleSat = chroma.scale([noSat, color, fullSat]);
  const midBright = color.set("hsl.l", 0.5);
  const scaleBright = chroma.scale(["black", midBright, "white"]);

  saturation.style.backgroundImage = `linear-gradient(to right,${scaleSat(
    0
  )},${scaleSat(1)})`;
  brightness.style.backgroundImage = `linear-gradient(to right,${scaleBright(
    0
  )},${scaleBright(0.5)},${scaleBright(1)})`;
  hue.style.backgroundImage = `linear-gradient(to right,rgb(204,75,75),rgb(204,204,75),rgb(75,204,75),rgb(75,204,204),rgb(75,75,204),rgb(204,75,204),rgb(204,75,75))`;
  //   hue.style.backgroundImage = `linear-gradient(to right,rgb(204,75,75),rgb(204,204,75),rgb(75,204,75),rgb(75,204,204),rgb(75,75,204),rgb(204,75,204),rgb(204,75,75))`;
}

function checkTextContrast(color, text) {
  const luminance = chroma(color).luminance();
  if (luminance > 0.5) {
    text.style.color = "black";
  } else {
    text.style.color = "white";
  }
}

function updateTextUI(index) {
  const activeDiv = colorDivs[index];
  const color = chroma(activeDiv.style.backgroundColor);
  const textHex = activeDiv.querySelector("h2");
  const icons = activeDiv.querySelectorAll(".controls button");
  textHex.innerText = color.hex();
  checkTextContrast(color, textHex);
  for (icon of icons) {
    checkTextContrast(color, icon);
  }
  console.log(color);
}

function resetInputs() {
  const sliders = document.querySelectorAll(".sliders input");
  sliders.forEach((slider) => {
    if (slider.name === "hue") {
      const hueColor = initialColors[slider.getAttribute("data-hue")];
      const hueValue = chroma(hueColor).hsl()[0];
      slider.value = Math.floor(hueValue);
      //   console.log(hueValue);
    }
    if (slider.name === "brightness") {
      const brightColor = initialColors[slider.getAttribute("data-bright")];
      const brightValue = chroma(brightColor).hsl()[2];
      slider.value = Math.floor(brightValue * 100) / 100;
      //   console.log(Math.floor(brightValue * 100) / 100);
    }
    if (slider.name === "saturation") {
      const satColor = initialColors[slider.getAttribute("data-sat")];
      const satValue = chroma(satColor).hsl()[1];
      slider.value = Math.floor(satValue * 100) / 100;
      //   console.log(Math.floor(satValue * 100) / 100);
    }
  });
}
currentHexes.forEach((hex) => {
  hex.addEventListener("click", () => {
    copyToClipboard(hex);
  });
});
function copyToClipboard(hex) {
  const el = document.createElement("textarea");
  el.value = hex.innerText;
  document.body.appendChild(el);
  el.select();
  document.execCommand("copy");
  document.body.removeChild(el);
  const popupBox = popup.children[0];
  popup.classList.add("active");
  popupBox.classList.add("active");
}
popup.addEventListener("transitionend", () => {
  const popupBox = popup.children[0];

  popup.classList.remove("active");
  popupBox.classList.remove("active");
});
adjustButtons.forEach((btn) =>
  btn.addEventListener("click", (e) => {
    // console.log(e.target.parentElement.parentElement);
    // console.log(e);
    const sliders =
      e.target.parentElement.parentElement.querySelector(".sliders");
    sliders.classList.toggle("active");
  })
);
closeAdjustButtons.forEach((btn) =>
  btn.addEventListener("click", (e) => {
    e.target.parentElement.classList.remove("active");
  })
);
generateBtn.addEventListener("click", () => {
  randomColors();
});

const saveBtn = document.querySelector(".save");
const submitSave = document.querySelector(".submit-save");
const closeSave = document.querySelector(".close-save");
const saveContainer = document.querySelector(".save-container");
const saveInput = document.querySelector(".save-container input");
const libraryContainer = document.querySelector(".library-container");
const libraryBtn = document.querySelector(".library");
const closeLibraryBtn = document.querySelector(".close-library");

saveBtn.addEventListener("click", openPalette);
function openPalette(e) {
  const popup = saveContainer.children[0];
  saveContainer.classList.add("active");
  popup.classList.add("active");
}
closeSave.addEventListener("click", closePalette);
function closePalette(e) {
  const popup = saveContainer.children[0];
  saveContainer.classList.remove("active");
  popup.classList.remove("active");
}
submitSave.addEventListener("click", savePalette);
function savePalette(e) {
  const name = saveInput.value;
  console.log(name.length);
  if (name.length >= 5) {
    saveContainer.classList.remove("active");
    popup.classList.remove("active");
    const name = saveInput.value;
    const colors = [];
    currentHexes.forEach((hex) => {
      colors.push(hex.innerText);
    });
    let paletterNr = savedPalettes.length;
    const paletteObj = { name, colors, nr: paletterNr };
    savedPalettes.push(paletteObj);
    savetoLocal(paletteObj);
    saveInput.value = "";
    createPalette(paletteObj);
  }
  //   console.log(savedPalettes);
}
function createPalette(paletteObj) {
  const palette = document.createElement("div");
  palette.classList.add("custom-palette");
  const title = document.createElement("h4");
  title.innerText = paletteObj.name;
  const preview = document.createElement("div");
  preview.classList.add("small-preview");
  paletteObj.colors.forEach((smallColor) => {
    const smallDiv = document.createElement("div");
    smallDiv.style.backgroundColor = smallColor;
    preview.appendChild(smallDiv);
  });
  const paleteBtn = document.createElement("button");
  paleteBtn.classList.add("pick-palette-btn");
  paleteBtn.classList.add(paletteObj.nr);
  paleteBtn.innerText = "Select";
  paleteBtn.addEventListener("click", (e) => {
    closeLibrary(e);
    const paletteIndex = e.target.classList[1];
    randomColors(savedPalettes[paletteIndex].colors);

    //   console.log(savedPalettes[paletteIndex]);
    //   initialColors = [...savedPalettes[paletteIndex].colors];
    //   console.log(initialColors);
  });
  palette.appendChild(title);
  palette.appendChild(preview);
  palette.appendChild(paleteBtn);
  libraryContainer.children[0].appendChild(palette);
}
function savetoLocal(paletteObj) {
  let localPalettes;
  if (localStorage.getItem("palettes") === null) {
    localPalettes = [];
  } else {
    localPalettes = JSON.parse(localStorage.getItem("palettes"));
  }
  localPalettes.push(paletteObj);
  localStorage.setItem("palettes", JSON.stringify(localPalettes));
}

libraryBtn.addEventListener("click", openLibrary);
function openLibrary(e) {
  const popup = libraryContainer.children[0];
  libraryContainer.classList.add("active");
  popup.classList.add("active");
}
closeLibraryBtn.addEventListener("click", closeLibrary);
function closeLibrary(e) {
  const popup = libraryContainer.children[0];
  libraryContainer.classList.remove("active");
  popup.classList.remove("active");
}
function getLocal() {
  const paletteObjects =
    localStorage.getItem("palettes") === null
      ? []
      : JSON.parse(localStorage.getItem("palettes"));
  savedPalettes;
  paletteObjects.forEach((paletteObject) => {
    savedPalettes.push(paletteObject);
    createPalette(paletteObject);
  });
}
getLocal();
randomColors();
