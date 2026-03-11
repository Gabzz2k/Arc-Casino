export type CoinResult = 'heads' | 'tails';

export interface RouletteResult {
  number: number;
  color: 'red' | 'black' | 'green';
  isEven: boolean;
}

export type SlotSymbol = '🍒' | '🍋' | '🔔' | '💎' | '7️⃣';

export const SLOT_SYMBOLS: SlotSymbol[] = ['🍒', '🍋', '🔔', '💎', '7️⃣'];

