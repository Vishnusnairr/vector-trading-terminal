import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import VectorDashboardClient from '@/components/dashboard/VectorDashboardClient';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const session = await auth();

  // Redirect to login if unauthenticated (backed up by edge middleware)
  if (!session?.user) {
    redirect('/login');
  }

  // Hydrate dashboard metrics from user session
  const userPayload = {
    id: session.user.id || 'demo',
    email: session.user.email || 'demo@vector.io',
    name: session.user.name || null,
    paperBalance: (session.user as any).paperBalance ?? 100000,
  };

  return <VectorDashboardClient user={userPayload} />;
}
