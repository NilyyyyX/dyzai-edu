export interface PointsLedger {
  id: number;
  student_id: number;
  amount: number;
  reason: string;
  reference_type: string;
  reference_id: number;
  created_at: string;
}

export interface StickerInventory {
  id: number;
  student_id: number;
  sticker_type: string;
  acquired_at: string;
  equipped: boolean;
}
