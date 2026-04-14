// ui.js — Start-menu wiring

import { Game } from './game.js';

export function initUI() {
    const canvas    = document.getElementById('gameCanvas');
    const startMenu = document.getElementById('startMenu');
    const startBtn  = document.getElementById('startBtn');

    const game = new Game(canvas);

    startBtn.addEventListener('click', () => {
        startMenu.style.display = 'none';
        game.start();
    });
}
