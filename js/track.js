// track.js — Procedural track generation

export const SEG_LEN   = 100;    // Length of a single track segment
export const ROAD_WIDTH = 1400;  // Width of the track
export const DRAW_DIST  = 150;   // How many segments forward to draw

/**
 * Returns the horizontal (X) centre of the road at segment index i.
 * Mixes two sine waves to create weaving curves.
 */
export function getTrackX(i) {
    if (i < 20) return 0;
    const t = i - 20;
    return Math.sin(t * 0.015) * 4000 + Math.sin(t * 0.005) * 8000;
}

/**
 * Returns the vertical (Y / elevation) of the road at segment index i.
 * Produces rolling hills via overlapping sine waves.
 */
export function getTrackY(i) {
    if (i < 50) return 0;
    const t = i - 50;
    return Math.sin(t * 0.02) * 1200 + Math.sin(t * 0.01) * 2500;
}

/**
 * Returns the colour set for segment i.
 * Alternates every 3 segments to give the illusion of speed.
 */
export function getColors(i) {
    const n = Math.floor(i / 3) % 2;
    return {
        road:   n ? '#555'     : '#444',
        rumble: n ? '#FFF'     : '#E00',
        grass:  n ? '#228B22'  : '#1e7b1e',
    };
}
