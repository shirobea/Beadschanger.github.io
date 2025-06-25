let isCancelled = false;
let beadPaletteMap = {};

function findClosestColor(pixel, palette) {
    if (palette.length === 0) return null;
    let closestColor = palette[0];
    let minDistance = (pixel.r - closestColor.r) ** 2 + (pixel.g - closestColor.g) ** 2 + (pixel.b - closestColor.b) ** 2;
    for (let i = 1; i < palette.length; i++) {
        const color = palette[i];
        const distance = (pixel.r - color.r) ** 2 + (pixel.g - color.g) ** 2 + (pixel.b - color.b) ** 2;
        if (distance < minDistance) {
            minDistance = distance;
            closestColor = color;
        }
    }
    return closestColor;
}

function doDitheringPass(originalData, width, height, palette, ditheringStrength) {
    const dataCopy = new Float32Array(originalData);
    const pixelMap = new Array(width * height);
    const counts = {};

    for (let y = 0; y < height; y++) {
        if (isCancelled) return { pixelMap: null, counts: null };
        for (let x = 0; x < width; x++) {
            const i = (y * width + x);
            const i4 = i * 4;
            const oldPixel = { r: dataCopy[i4], g: dataCopy[i4 + 1], b: dataCopy[i4 + 2] };
            const newPixel = findClosestColor(oldPixel, palette);
            if (!newPixel) continue;

            pixelMap[i] = newPixel.no;
            counts[newPixel.no] = (counts[newPixel.no] || 0) + 1;
            
            let errR = (oldPixel.r - newPixel.r) * ditheringStrength;
            let errG = (oldPixel.g - newPixel.g) * ditheringStrength;
            let errB = (oldPixel.b - newPixel.b) * ditheringStrength;
            
            if (x + 1 < width) {
                const idx = i4 + 4;
                dataCopy[idx] += errR * 7/16; dataCopy[idx+1] += errG * 7/16; dataCopy[idx+2] += errB * 7/16;
            }
            if (y + 1 < height) {
                if (x > 0) {
                    const idx = i4 + (width - 1) * 4;
                    dataCopy[idx] += errR * 3/16; dataCopy[idx+1] += errG * 3/16; dataCopy[idx+2] += errB * 3/16;
                }
                const idx = i4 + width * 4;
                dataCopy[idx] += errR * 5/16; dataCopy[idx+1] += errG * 5/16; dataCopy[idx+2] += errB * 5/16;
                if (x + 1 < width) {
                    const idx = i4 + (width + 1) * 4;
                    dataCopy[idx] += errR * 1/16; dataCopy[idx+1] += errG * 1/16; dataCopy[idx+2] += errB * 1/16;
                }
            }
        }
        if(y % 5 === 0 || y === height - 1){
            self.postMessage({ type: 'progress', current: y + 1, total: height, phase: 'dithering' });
        }
    }
    return { pixelMap, counts };
}

self.onmessage = (e) => {
    const { type, payload } = e.data;

    if (type === 'start') {
        isCancelled = false;
        try {
            const { imageData, width, height, mode, activePalette, map, ditheringStrength } = payload;
            beadPaletteMap = map;
            const data = new Uint8ClampedArray(imageData);
            let resultBuffer, resultCounts;

            if (mode === 'normal') {
                const convertedImageData = new Uint8ClampedArray(width * height * 4);
                const counts = {};
                for (let y = 0; y < height; y++) {
                     if (isCancelled) { self.postMessage({ type: 'cancelled' }); return; }
                     for (let x = 0; x < width; x++) {
                        const i = (y * width + x) * 4;
                        const pixel = { r: data[i], g: data[i+1], b: data[i+2] };
                        const closestColor = findClosestColor(pixel, activePalette);
                        if (closestColor) {
                            convertedImageData[i] = closestColor.r;
                            convertedImageData[i+1] = closestColor.g;
                            convertedImageData[i+2] = closestColor.b;
                            convertedImageData[i+3] = 255;
                            counts[closestColor.no] = (counts[closestColor.no] || 0) + 1;
                        }
                     }
                     if(y % 5 === 0 || y === height - 1){
                        self.postMessage({ type: 'progress', current: y + 1, total: height });
                     }
                }
                resultBuffer = convertedImageData.buffer;
                resultCounts = counts;
            } else { // dithering
                const { pixelMap, counts: initialCounts } = doDitheringPass(data, width, height, activePalette, ditheringStrength);
                if (isCancelled) { self.postMessage({ type: 'cancelled' }); return; }

                const totalPixels = width * height;
                const RARE_THRESHOLD = totalPixels * 0.001;
                const finalCounts = { ...initialCounts };
                
                const rareColorNos = Object.keys(finalCounts).filter(no => finalCounts[no] < RARE_THRESHOLD);
                const commonColors = activePalette.filter(c => !rareColorNos.includes(c.no));
                const replacementMap = {};

                if (commonColors.length > 0 && commonColors.length < activePalette.length) {
                    rareColorNos.forEach(rareNo => {
                        const rareColor = beadPaletteMap[rareNo];
                        if (!rareColor) return;
                        const replacementColor = findClosestColor(rareColor, commonColors);
                        if (replacementColor) {
                            replacementMap[rareNo] = replacementColor.no;
                            finalCounts[replacementColor.no] = (finalCounts[replacementColor.no] || 0) + finalCounts[rareNo];
                            delete finalCounts[rareNo];
                        }
                    });
                }
                
                const convertedImageData = new Uint8ClampedArray(width * height * 4);
                for(let i=0; i < pixelMap.length; i++) {
                    const originalColorNo = pixelMap[i];
                    const finalColorNo = replacementMap[originalColorNo] || originalColorNo;
                    const finalColor = beadPaletteMap[finalColorNo];
                    if (finalColor) {
                        convertedImageData[i * 4] = finalColor.r;
                        convertedImageData[i * 4 + 1] = finalColor.g;
                        convertedImageData[i * 4 + 2] = finalColor.b;
                        convertedImageData[i * 4 + 3] = 255;
                    }
                }
                resultBuffer = convertedImageData.buffer;
                resultCounts = finalCounts;
            }
            self.postMessage({ type: 'complete', result: { buffer: resultBuffer, counts: resultCounts } }, [resultBuffer]);
        } catch (err) {
            self.postMessage({ type: 'error', message: err.message });
        }
    } else if (type === 'cancel') {
        isCancelled = true;
    }
}; 