import { memory } from "nes-wasm/nes_wasm_bg";
import { Nes } from "nes-wasm";
import './styles.scss';

const nes = Nes.new();
const SCREEN_WIDTH = 256;
const SCREEN_HEIGHT = 240;
let isRunning = false;

const canvas = document.getElementById("nes-canvas");
canvas.width = SCREEN_WIDTH;
canvas.height = SCREEN_HEIGHT;
const ctx = canvas.getContext('2d');

// User Input
const KEYS = [81, 87, 69, 82, 38, 40, 37, 39];

document.addEventListener('keydown', event => {
  let index = KEYS.indexOf(event.keyCode);
  if (index !== -1) {
    console.log("PRESSED " + index);
    nes.press_button(0, index);
    nes.press_button(1, index);
  }
});

document.addEventListener('keyup', event => {
  let index = KEYS.indexOf(event.keyCode);
  if (index !== -1) {
    nes.release_button(0, index);
    nes.release_button(1, index);
  }
});

// User Interface
const startButton = document.getElementById("start-button");
const stopButton = document.getElementById("stop-button");
const loadButton = document.getElementById("load-button");
const romInput = document.getElementById("rom-input");
startButton.disabled = true;
stopButton.disabled = true;

const start = () => {
  startButton.disabled = true;
  stopButton.disabled = false;
  isRunning = true;
  render();
};

const stop = () => {
  stopButton.disabled = true;
  startButton.disabled = false;
  isRunning = false;
};

const load = () => {
  stop();
  const rom = romInput.files[0];
  let fileReader = new FileReader();
  fileReader.readAsArrayBuffer(rom);
  fileReader.onload = function(event) {
    nes.load_rom(new Uint8Array(this.result));
  };
};

startButton.addEventListener("click", start);
stopButton.addEventListener("click", stop);
loadButton.addEventListener("click", load);

const updateScreen = () => {
  const imageBufferPtr = nes.image_buffer();
  const imageBuffer = new Uint8Array(memory.buffer, imageBufferPtr, SCREEN_WIDTH * SCREEN_HEIGHT * 3);
  const imgData = ctx.getImageData(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);

  for (let i = 0; i < SCREEN_WIDTH * SCREEN_HEIGHT; i++) {
    imgData.data[i * 4] = imageBuffer[i * 3];
    imgData.data[i * 4 + 1] = imageBuffer[i * 3 + 1];
    imgData.data[i * 4 + 2] = imageBuffer[i * 3 + 2];
    imgData.data[i * 4 + 3] = 255;
  }

  ctx.putImageData(imgData, 0, 0);
};

const render = () => {
  if (isRunning) {
    nes.step_frame();
    updateScreen();
    window.requestAnimationFrame(render);
  }
}
