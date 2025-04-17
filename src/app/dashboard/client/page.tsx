import { ClientInvoices } from '@/components/ClientInvoices';
import { Card } from '@/components/ui/card';

export default function ClientDashboard() {
  return (
    <div className="space-y-6">
      <Card>
        <ClientInvoices />
      </Card>
    </div>
  );
} 