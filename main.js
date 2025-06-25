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
    gridCheckbox: document.getElementById('show-grid'),
};

// ... 以降、index.htmlの<script type="module"> ... </script>の全コードをそのまま貼り付け ...
// ただし、Worker生成部分は下記のように修正
// appState.conversionWorker = new Worker('worker.js');

// 例:
// appState.conversionWorker = new Worker('worker.js');

// ...（残りのコードはindex.htmlの該当部分をそのまま移植）... 

// グリッド線の描画関数
function drawGrid(ctx, width, height, cellSize, lineWidth) {
    ctx.save();
    ctx.strokeStyle = '#222';
    ctx.lineWidth = lineWidth;
    // 縦線
    for (let x = 0; x <= width; x += cellSize) {
        ctx.beginPath();
        ctx.moveTo(x + 0.5, 0);
        ctx.lineTo(x + 0.5, height);
        ctx.stroke();
    }
    // 横線
    for (let y = 0; y <= height; y += cellSize) {
        ctx.beginPath();
        ctx.moveTo(0, y + 0.5);
        ctx.lineTo(width, y + 0.5);
        ctx.stroke();
    }
    ctx.restore();
}

// drawFilteredResultを拡張
function drawFilteredResult() {
    if (!appState.resultImageData || !appState.resultWidth || !appState.resultHeight) return;
    const cellSize = 10;
    const canvas = dom.resultCanvas;
    const ctx = canvas.getContext('2d');
    // 拡大表示用にcanvasサイズを変更
    canvas.width = appState.resultWidth * cellSize;
    canvas.height = appState.resultHeight * cellSize;
    // 一時キャンバスで元画像を作成
    const temp = document.createElement('canvas');
    temp.width = appState.resultWidth;
    temp.height = appState.resultHeight;
    temp.getContext('2d').putImageData(appState.resultImageData, 0, 0);
    // 拡大描画
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(temp, 0, 0, canvas.width, canvas.height);
    // グリッド線表示
    if (dom.gridCheckbox && dom.gridCheckbox.checked) {
        drawGrid(ctx, canvas.width, canvas.height, cellSize, 1);
    }
}

// グリッド表示切り替えイベント
if (dom.gridCheckbox) {
    dom.gridCheckbox.addEventListener('change', drawFilteredResult);
} 
