import { formatCurrency } from "@/lib/format";
import { DEAL_STAGES, DEAL_STAGE_COLORS, DEAL_STAGE_LABELS } from "../constants";
import styles from "./DealBoard.module.css";
import type { Deal } from "@/generated/prisma/client";

type DealWithRelations = Deal & {
  client: { id: string; name: string };
  contact: { id: string; fullName: string } | null;
};

export function DealBoard({
  deals,
  onDealClick,
}: {
  deals: DealWithRelations[];
  onDealClick: (deal: DealWithRelations) => void;
}) {
  const byStage = DEAL_STAGES.map((stage) => ({
    stage,
    deals: deals.filter((deal) => deal.stage === stage),
  }));

  return (
    <div className={styles.board}>
      {byStage.map(({ stage, deals: columnDeals }) => (
        <div key={stage} className={styles.column}>
          <div className={styles.columnHeader}>
            <span className={styles.dot} style={{ background: DEAL_STAGE_COLORS[stage] }} />
            {DEAL_STAGE_LABELS[stage]}
            <span className={styles.count}>{columnDeals.length}</span>
          </div>
          <div className={styles.cards}>
            {columnDeals.length === 0 ? (
              <div className={styles.empty}>No deals in this stage</div>
            ) : (
              columnDeals.map((deal) => (
                <button
                  key={deal.id}
                  type="button"
                  className={styles.card}
                  onClick={() => onDealClick(deal)}
                >
                  <div className={styles.cardTitle}>{deal.name}</div>
                  <div className={styles.cardAmount}>
                    {formatCurrency(deal.amount, deal.currency)}
                  </div>
                  <div className={styles.cardClient}>{deal.client.name}</div>
                </button>
              ))
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
