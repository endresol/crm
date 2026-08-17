import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth/session";
import { getSop } from "@/features/sops/service";
import { Topbar } from "@/components/layout/Topbar";
import { Card } from "@/components/ui/Card";
import { SopEditor } from "@/features/sops/components/SopEditor";
import { DeleteSopButton } from "@/features/sops/components/DeleteSopButton";
import styles from "@/components/layout/AdminShell.module.css";

export default async function SopDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const { id } = await params;
  const sop = await getSop(user.workspaceId, id);
  if (!sop) notFound();

  return (
    <>
      <Topbar title={sop.title} subtitle="SOP" actions={<DeleteSopButton sopId={sop.id} />} />
      <div className={styles.content}>
        <div style={{ marginBottom: "var(--space-6)" }}>
          <Link
            href="/admin/sops"
            style={{ fontSize: "var(--text-sm)", color: "var(--color-text-muted)" }}
          >
            ← Back to SOPs
          </Link>
        </div>

        <Card>
          <SopEditor sop={sop} />
        </Card>
      </div>
    </>
  );
}
