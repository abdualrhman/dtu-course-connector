import cytoscape from "cytoscape";

export default function setupCy() {
  cytoscape.use(require("cytoscape-dagre"));
  cytoscape.use(require("cytoscape-klay"));
}
