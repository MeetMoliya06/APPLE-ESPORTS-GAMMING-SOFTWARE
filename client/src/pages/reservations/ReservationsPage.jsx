import PageHeader from '../../components/layout/PageHeader';
import { EmptyState } from '../../components/ui/LoadingStates';

export default function ReservationsPage() {
  return (
    <div>
      <PageHeader
        title="Reservations"
        subtitle="Reserve PCs in advance with grace period and auto-expiry"
        icon="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
      />
      <div className="card">
        <EmptyState
          icon="📅"
          title="Reservations Dashboard"
          message="Create, manage, and track PC reservations with 15-min grace period. SOP §8 flow coming next phase."
        />
      </div>
    </div>
  );
}
