import { requireUser } from '@/lib/session';
import Workspace from '@/components/workspace/Workspace';
export const metadata = { title: 'Add your business' };
export default async function Page() { await requireUser('/app/new'); return <Workspace businessId={null} />; }
