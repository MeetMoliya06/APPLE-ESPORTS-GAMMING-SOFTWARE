import PageHeader from '../../components/layout/PageHeader';
import { EmptyState } from '../../components/ui/LoadingStates';

export default function MembersPage() {
  return (
    <div>
      <PageHeader
        title="Members"
        subtitle="Member registration, wallet management, loyalty points"
        icon="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
      />
      <div className="card">
        <EmptyState
          icon="👥"
          title="Members Dashboard"
          message="Member CRM: registration, wallet recharge/deduction, loyalty points, visit history. SOP §14 flow coming next."
        />
      </div>
    </div>
  );
}
