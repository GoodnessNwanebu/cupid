export const COLLAGE_CONFIGS = {
    GRID: {
        GUTTER: 0.03, // 3% of area
        MARGIN: 0.02, // 2% padding
    },
    SCRAPBOOK: {
        layouts: {
            2: [
                { w: 0.62, h: 0.48, x: 0.05, y: 0.1, rotation: -4 },
                { w: 0.62, h: 0.48, x: 0.32, y: 0.4, rotation: 6 },
            ],
            3: [
                { w: 0.52, h: 0.4, x: 0.22, y: 0.05, rotation: -3 },
                { w: 0.52, h: 0.4, x: 0.05, y: 0.48, rotation: 4 },
                { w: 0.52, h: 0.4, x: 0.42, y: 0.52, rotation: 2 },
            ],
            4: [
                { w: 0.42, h: 0.36, x: 0.08, y: 0.1, rotation: -5 },
                { w: 0.42, h: 0.36, x: 0.48, y: 0.06, rotation: 4 },
                { w: 0.42, h: 0.36, x: 0.06, y: 0.52, rotation: -3 },
                { w: 0.42, h: 0.36, x: 0.5, y: 0.56, rotation: 6 },
            ],
        }
    }
};
