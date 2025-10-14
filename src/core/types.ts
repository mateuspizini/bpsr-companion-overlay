export type HitType = 'damage' | 'heal';
export interface Hit {
  t: number;
  sourceId: string;
  targetId: string;
  amount: number;
  type: HitType;
  sourceName?: string;
  targetName?: string;
  party?: boolean;
  isBossTarget?: boolean;
}
