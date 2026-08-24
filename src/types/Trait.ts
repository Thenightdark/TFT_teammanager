export interface TraitBreakpoint {
  minimum: number;
  label: string;
}

export interface Trait {
  id: string;
  apiName?: string;
  name: string;
  description: string;
  breakpoints: TraitBreakpoint[];
  image?: string;
}
