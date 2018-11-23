import { memory } from 'neso/neso_bg';
import { Nes } from 'neso';
import './styles.scss';

const SCREEN_WIDTH = 256;
const SCREEN_HEIGHT = 240;
const SAMPLE_FREQ = 44100;
const nes = Nes.new(SAMPLE_FREQ);
let isRunning = false;
let powerOn = false;

const canvas = document.getElementById('neso-canvas');
canvas.width = SCREEN_WIDTH * 2;
canvas.height = SCREEN_HEIGHT * 2;
const canvasContext = canvas.getContext('2d');
const audioContext = new AudioContext();

// User Input
const KEYS = [80, 79, 16, 13, 87, 83, 65, 68];

document.addEventListener('keydown', (event) => {
  const index = KEYS.indexOf(event.keyCode);
  if (index !== -1) {
    nes.press_button(0, index);
    nes.press_button(1, index);
  }
});

document.addEventListener('keyup', (event) => {
  const index = KEYS.indexOf(event.keyCode);
  if (index !== -1) {
    nes.release_button(0, index);
    nes.release_button(1, index);
  }
});

// User Interface
const updateScreen = () => {
  const imageBufferPtr = nes.image_buffer();
  const imageBuffer = new Uint8ClampedArray(
    memory.buffer,
    imageBufferPtr,
    SCREEN_WIDTH * SCREEN_HEIGHT * 4,
  );
  const imageData = new ImageData(imageBuffer, SCREEN_WIDTH, SCREEN_HEIGHT);
  canvasContext.putImageData(imageData, 0, 0);
  canvasContext.drawImage(
    canvas,
    0,
    0,
    SCREEN_WIDTH,
    SCREEN_HEIGHT,
    0,
    0,
    SCREEN_WIDTH * 2,
    SCREEN_HEIGHT * 2,
  );
};

const updateAudio = () => {
  const audioBufferPtr = nes.audio_buffer();
  const audioBuffer = new Float32Array(memory.buffer, audioBufferPtr, nes.audio_buffer_len());
  const buffer = audioContext.createBuffer(1, nes.audio_buffer_len(), 44100);
  const bsn = audioContext.createBufferSource();

  buffer.copyToChannel(audioBuffer, 0, 0);
  bsn.connect(audioContext.destination);
  bsn.buffer = buffer;
  bsn.start();
};

const render = () => {
  if (isRunning) {
    nes.step_frame();
    updateScreen();
    updateAudio();
    window.requestAnimationFrame(render);
  }
};

const startButton = document.getElementById('start-button');
const stopButton = document.getElementById('stop-button');
const loadButton = document.getElementById('load-button');
const romInput = document.getElementById('rom-input');
const romLabel = document.getElementById('select-rom-button');
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
  if (romInput.files.length === 0) {
    alert('No ROM selected.');
    return;
  }

  stop();
  const rom = romInput.files[0];
  const fileReader = new FileReader();
  fileReader.readAsArrayBuffer(rom);
  fileReader.onload = () => {
    nes.load_rom(new Uint8Array(fileReader.result));
    if (powerOn) {
      nes.reset();
    }
    powerOn = true;
  };
};

const onRomChange = (event) => {
  const fileName = event.target.value.split('\\').pop();
  if (fileName) {
    romLabel.innerHTML = fileName;
  } else {
    romLabel.innerHTML = 'Select Rom';
  }
};

startButton.addEventListener('click', start);
stopButton.addEventListener('click', stop);
loadButton.addEventListener('click', load);
romInput.addEventListener('change', onRomChange);
