
import type { BingoCardData, BingoNumber, CompletedLines } from '../types';

// Generates a single bingo card
export const generateBingoCard = (id: number, size: number): BingoCardData => {
    const grid: (BingoNumber | null)[][] = Array(size).fill(null).map(() => Array(size).fill(null));
    const usedNumbers: Set<number> = new Set();

    for (let col = 0; col < size; col++) {
        const min = col * 15 + 1;
        const max = (col + 1) * 15;
        const columnNumbers: number[] = [];
        while (columnNumbers.length < size) {
            const num = Math.floor(Math.random() * (max - min + 1)) + min;
            if (!usedNumbers.has(num)) {
                usedNumbers.add(num);
                columnNumbers.push(num);
            }
        }
        
        // Ordena os números dentro da coluna para garantir que o modelo de dados e a exibição sejam consistentes.
        columnNumbers.sort((a, b) => a - b);
        
        for (let row = 0; row < size; row++) {
            grid[row][col] = { value: columnNumbers[row], marked: false };
        }
    }

    if (size % 2 !== 0) {
        const center = Math.floor(size / 2);
        grid[center][center] = null; // Free space
    }

    return {
        id: id,
        grid,
        isClaimed: false,
        completedLines: { horizontal: 0, vertical: 0, diagonal: 0 },
        hasBingo: false,
    };
};


// Checks for wins (lines and bingo) on a card
export const checkWins = (grid: (BingoNumber | null)[][]): { lines: CompletedLines; isBingo: boolean } => {
    const size = grid.length;
    if (size === 0) {
        return { lines: { horizontal: 0, vertical: 0, diagonal: 0 }, isBingo: false };
    }
    
    const lines: CompletedLines = { horizontal: 0, vertical: 0, diagonal: 0 };

    // Check rows for horizontal lines
    for (let i = 0; i < size; i++) {
        if (grid[i].every(cell => cell === null || cell.marked)) {
            lines.horizontal++;
        }
    }

    // Check columns for vertical lines
    for (let c = 0; c < size; c++) {
        let colComplete = true;
        for (let r = 0; r < size; r++) {
            const cell = grid[r][c];
            if (cell !== null && !cell.marked) {
                colComplete = false;
                break;
            }
        }
        if (colComplete) {
            lines.vertical++;
        }
    }

    // Check main diagonal (top-left to bottom-right)
    let diag1Complete = true;
    for (let i = 0; i < size; i++) {
        const cell = grid[i][i];
        if (cell !== null && !cell.marked) {
            diag1Complete = false;
            break;
        }
    }
    if (diag1Complete) {
        lines.diagonal++;
    }

    // Check anti-diagonal (top-right to bottom-left)
    let diag2Complete = true;
    for (let i = 0; i < size; i++) {
        const cell = grid[i][size - 1 - i];
        if (cell !== null && !cell.marked) {
            diag2Complete = false;
            break;
        }
    }
    if (diag2Complete) {
        lines.diagonal++;
    }
    
    const isBingo = grid.flat().every(cell => cell === null || cell.marked);

    return { lines, isBingo };
};