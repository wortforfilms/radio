import {
  lipiCivilizationMatrix,
  lipiExamplePath,
  lipiExplorerPages,
  lipiKnowledgeGraphChain,
  lipiPhkdRule
} from "@shared/lipi-civilization-matrix";

export async function GET() {
  return Response.json({
    runtime: "Lipi Civilization Matrix",
    phkd: lipiPhkdRule,
    graphChain: lipiKnowledgeGraphChain,
    example: lipiExamplePath,
    explorers: lipiExplorerPages,
    civilizations: lipiCivilizationMatrix
  });
}
