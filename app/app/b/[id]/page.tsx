import { notFound } from 'next/navigation';
import { requireUser } from '@/lib/session';
import { access } from '@/lib/business';
import Workspace from '@/components/workspace/Workspace';

export const metadata = { title: 'Workspace' };
export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const id = Number((await params).id);
  const user = await requireUser('/app/b/' + id);
  const a = Number.isInteger(id) ? await access(user.id, id, 'viewer', !!user.is_admin) : null;
  if (!a) notFound();
  return <Workspace businessId={id} />;
}
