export type Node = {
  data: { id: string; parent?: string };
};

export type Edge = {
  data: { id: string; source: string; target: string };
};

export type Graph = {
  elements: {
    nodes: Node[];
    edges: Edge[];
  };
};
