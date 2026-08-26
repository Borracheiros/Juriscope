# Modelo de domínio jurídico (fundação)

Agregados de plataforma: Tenant, Organization/Office/Team (Office/Team no Sprint 3), User, AccessProfile.

Partes: Person, OrganizationParty, Client, OpposingParty, RelatedParty, Counsel, Court, Authority.

Trabalho jurídico: LegalMatter, Case, Engagement, Representation, Jurisdiction, Venue, PracticeArea.

Conflito: ConflictCheck, ConflictCandidate, ConflictDecision, ConflictWaiver.

Documentos: LegalDocument, DocumentVersion, EvidenceItem, EvidenceCustodyEvent, LegalHold, DocumentReview.

Operação: Deadline, CourtEvent, Hearing, Task, Workflow, Approval.

Financeiro: TimeEntry, Expense, FeeAgreement, Invoice, PaymentAllocation.

Conhecimento: ResearchSession, LegalSource, Citation, KnowledgeItem.

IA: AIRequest, AIRetrievalContext, AIArtifact, AIReview, AIApproval, AIPublication.

Máquinas de estado e invariantes: `packages/domain`. Persistência dos agregados de negócio começa nos sprints 1–8; Sprint 0 persiste identidade, auditoria, idempotência e outbox.
