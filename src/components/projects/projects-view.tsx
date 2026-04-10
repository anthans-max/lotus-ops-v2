"use client";

import { useState, useTransition } from "react";
import { ProjectsTable } from "./projects-table";
import { ProjectsCards } from "./projects-cards";
import { ProjectForm, type ClientOption } from "./project-form";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { deleteProject, type Project } from "@/app/actions/projects";
import { PageHeader } from "@/components/ui/page-header";

export type ProjectWithClient = Project & {
  clientName: string | null;
};

export function ProjectsView({
  projects,
  clients,
}: {
  projects: ProjectWithClient[];
  clients: ClientOption[];
}) {
  const [addOpen, setAddOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<ProjectWithClient | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ProjectWithClient | null>(
    null
  );
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [isDeleting, startDeleteTransition] = useTransition();

  const handleDeleteConfirm = () => {
    if (!deleteTarget) return;
    setDeleteError(null);
    startDeleteTransition(async () => {
      const result = await deleteProject(deleteTarget.id);
      if (result.success) {
        setDeleteTarget(null);
      } else {
        setDeleteTarget(null);
        setDeleteError(result.error);
      }
    });
  };

  return (
    <div>
      <PageHeader
        title="Projects"
        actions={
          <button
            onClick={() => setAddOpen(true)}
            disabled={clients.length === 0}
            title={clients.length === 0 ? "Add a client first" : undefined}
            style={{
              background: "var(--green)",
              color: "var(--bg)",
              border: "none",
              borderRadius: 100,
              padding: "10px 20px",
              minHeight: 44,
              fontSize: "0.72rem",
              fontFamily: "var(--font-jost)",
              fontWeight: 500,
              letterSpacing: "0.08em",
              cursor: clients.length === 0 ? "not-allowed" : "pointer",
              opacity: clients.length === 0 ? 0.5 : 1,
            }}
          >
            + Add Project
          </button>
        }
      />

      {deleteError && (
        <div
          style={{
            background: "var(--red-pale)",
            border: "1px solid var(--red)",
            borderRadius: 8,
            padding: "12px 16px",
            marginBottom: 16,
            fontFamily: "var(--font-jost)",
            fontSize: 13,
            color: "var(--red)",
          }}
        >
          {deleteError}
        </div>
      )}

      {/* Empty state */}
      {projects.length === 0 && (
        <div style={{ padding: "60px 0", textAlign: "center" }}>
          <p
            style={{
              fontFamily: "var(--font-cormorant)",
              fontSize: "1.3rem",
              fontWeight: 600,
              color: "var(--text)",
              marginBottom: 8,
            }}
          >
            No projects yet
          </p>
          <p
            style={{
              fontFamily: "var(--font-jost)",
              fontSize: 13,
              color: "var(--text-muted)",
              marginBottom: 24,
            }}
          >
            {clients.length === 0
              ? "Add a client first, then create a project."
              : "Add your first project to get started."}
          </p>
          {clients.length > 0 && (
            <button
              onClick={() => setAddOpen(true)}
              style={{
                background: "var(--green)",
                color: "var(--bg)",
                border: "none",
                borderRadius: 100,
                padding: "10px 24px",
                minHeight: 44,
                fontSize: "0.72rem",
                fontFamily: "var(--font-jost)",
                fontWeight: 500,
                letterSpacing: "0.08em",
                cursor: "pointer",
              }}
            >
              Add Project
            </button>
          )}
        </div>
      )}

      <ProjectsTable
        projects={projects}
        onEdit={setEditTarget}
        onDelete={setDeleteTarget}
      />

      <ProjectsCards
        projects={projects}
        onEdit={setEditTarget}
        onDelete={setDeleteTarget}
      />

      {/* Dialogs */}
      <ProjectForm
        open={addOpen}
        onClose={() => setAddOpen(false)}
        project={null}
        clients={clients}
      />

      <ProjectForm
        open={editTarget !== null}
        onClose={() => setEditTarget(null)}
        project={editTarget}
        clients={clients}
      />

      <ConfirmDialog
        open={deleteTarget !== null}
        onClose={() => {
          setDeleteTarget(null);
          setDeleteError(null);
        }}
        onConfirm={handleDeleteConfirm}
        title="Delete Project"
        message={`Delete "${deleteTarget?.name}"? This cannot be undone.`}
        loading={isDeleting}
      />
    </div>
  );
}
