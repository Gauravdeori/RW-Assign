import type { CardVariant, Density } from '../../../types';

/**
 * Fixed card heights: the results page works out how many cards fit the screen from them.
 * Compact rows and tiles are the same height, so five rows fit on a 1440x900 screen in either view.
 */
export const CARD_H: Record<CardVariant, Record<Density, number>> = {
  row: { compact: 104, comfortable: 122 },
  tile: { compact: 104, comfortable: 122 },
};
