const BEADS_CSV_URL = 'https://raw.githubusercontent.com/shirobea/Beadschanger.github.io/main/BeadsColors%20-%20BeadsColors.csv';

const appState = {
    beadPalette: [],
    beadPaletteMap: {},
    originalImage: null,
    originalAspectRatio: 1,
    conversionWorker: null,
    isConverting: false,
    resultImageData: null,
    resultWidth: 0,
    resultHeight: 0,
    filterColorNos: [],
    // 並び順状態
    sortType: 'count-desc', // 初期値は「使用個数 降順」
};

const dom = {
    version: document.getElementById('app-version'),
    uploadArea: document.getElementById('upload-area'),
    fileInput: document.getElementById('file-input'),
    settingsPanel: document.getElementById('settings-panel'),
    paletteFilter: document.getElementById('palette-filter'),
    conversionMode: document.getElementById('conversion-mode'),
    ditheringContainer: document.getElementById('dithering-strength-container'),
    ditheringSlider: document.getElementById('dithering-strength'),
    widthInput: document.getElementById('width-input'),
    heightInput: document.getElementById('height-input'),
    resetSizeBtn: document.getElementById('reset-size-btn'),
    convertBtn: document.getElementById('convert-btn'),
    progressBar: document.getElementById('progress-bar'),
    progressText: document.getElementById('progress-text'),
    originalCanvas: document.getElementById('original-canvas'),
    resultCanvas: document.getElementById('result-canvas'),
    resultContainer: document.getElementById('result-container'),
    downloadBtn: document.getElementById('download-btn'),
    usedColorsSection: document.getElementById('used-colors-section'),
    colorListBody: document.getElementById('color-list-body'),
    modal: document.getElementById('modal'),
    modalCanvas: document.getElementById('modal-canvas'),
    modalCloseBtn: document.getElementById('close-modal-btn'),
    aspectLock: document.getElementById('aspect-lock'),
    clearFilterBtn: document.getElementById('clear-filter-btn'),
};

// ... 以降、index.htmlの<script type="module"> ... </script>の全コードをそのまま貼り付け ...
// ただし、Worker生成部分は下記のように修正
// appState.conversionWorker = new Worker('worker.js');

// 例:
// appState.conversionWorker = new Worker('worker.js');

// ...（残りのコードはindex.htmlの該当部分をそのまま移植）... 