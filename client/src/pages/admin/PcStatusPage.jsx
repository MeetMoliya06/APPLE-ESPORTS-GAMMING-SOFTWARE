import PageHeader from '../../components/layout/PageHeader';
import { EmptyState } from '../../components/ui/LoadingStates';

export default function PcStatusPage() {
  return (
    <div>
      <PageHeader
        title="PC Status"
        subtitle="Full PC fleet overview — all branches, all states"
        icon="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
        badge="ADMIN ONLY"
      />
      <div className="card">
        <EmptyState
          icon="🖥️"
          title="PC Status Dashboard"
          message="Full PC grid with state monitoring, session times, earnings. Super Admin only. SOP §17 flow coming next."
        />
      </div>
    </div>
  );
}
