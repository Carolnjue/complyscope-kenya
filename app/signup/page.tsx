import { redirect } from 'next/navigation';
import Link from 'next/link';
import { currentUser } from '@/lib/auth';
import SignupForm from './SignupForm';
export const dynamic = 'force-dynamic';

export const metadata = { title: 'Add your business' };
export default async function Page() {
  if (await currentUser()) redirect('/app');
  return <SignupForm />;
}
