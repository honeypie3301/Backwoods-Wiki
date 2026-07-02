export interface ManifestItem {
  slug: string;
  filename: string;
  title: string;
  category: string;
  order: number;
}

export type WikiArticle = ManifestItem;

export interface Article extends ManifestItem {
  content: string;
}

export interface Achievement {
  title: string;
  description: string;
  requirement: string;
  completed: boolean;
}

export interface DimensionNode {
  id: string;
  name: string;
  description: string;
  requirements?: string;
  biomes?: string[];
  color: string;
  borderColor: string;
}

export interface EntityModel {
  id: string;
  name: string;
  objFile: string;
  mtlFile: string;
  skinFile: string;
  description: string;
  stats: {
    health: string;
    behavior: string;
    spawning: string;
  };
}
