export interface Augment {
  id: string;
  apiName: string;
  name: string;
  description?: string;
}

export interface RecommendedAugment {
  augmentId: string;
  reason: string;
}
