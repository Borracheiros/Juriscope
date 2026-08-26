import { Module } from "@nestjs/common";

const NAMES = [
  "workflow",
  "files",
  "search",
  "notifications",
  "feature-flags",
  "model-gateway",
  "data-governance",
  "client-party-registry",
  "legal-intake",
  "conflict-check",
  "matter-case-management",
  "deadlines-docketing",
  "tasks-workflows",
  "documents",
  "evidence-chain-of-custody",
  "legal-research",
  "legal-knowledge",
  "contracts",
  "timekeeping",
  "billing",
  "client-portal",
  "ai-work-product",
] as const;

@Module({})
export class ModuleSkeletonsModule {
  static names(): readonly string[] {
    return NAMES;
  }
}
