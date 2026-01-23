import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import { Role } from '@/types';
import Header from '@/components/layout/Header';
import Sidebar from '@/components/layout/Sidebar';

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  if (!session) {
    redirect('/login');
  }

  return (
    <div className="min-h-screen">
      <Header username={session.username} role={session.role as Role} />
      <Sidebar role={session.role as Role} />
      <main className="ml-[240px] mt-[56px] p-6">
        {children}
      </main>
    </div>
  );
}
