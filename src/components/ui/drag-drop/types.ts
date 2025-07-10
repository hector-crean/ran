export interface Item {
  id: string;
  name: string;
  x: number;
  y: number;
  height: number;
  width: number;
  data?: unknown; // Additional data for the item
}

export interface GridConfig {
  rows: number;
  cols: number;
  cellSize: number;
  gap: number;
}

export interface GridDropZone {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  accepts: (item: Item) => boolean;
  canDrop: (item: Item, gridX: number, gridY: number) => boolean;
}

export interface DragState {
  item: Item;
  originalPosition: Point;
  currentPosition: Point;
  gridPosition: Point;
  isValid: boolean;
}

export type Point = { x: number; y: number };

export type Cells = string[][];

export interface GridState {
  items: Item[];
  cells: Cells;
  dragState: DragState | null;
  config: GridConfig;
}
