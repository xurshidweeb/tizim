import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';

export default async function HomePage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/login');
  }

  switch (user.role) {
    case 'SUPER_ADMIN':
      redirect('/super-admin');
    case 'BRANCH_HEAD':
      redirect('/branch-head');
    case 'ADMIN':
      redirect('/admin');
    case 'TEACHER':
      redirect('/teacher');
    case 'STUDENT':
      redirect('/student');
    default:
      redirect('/login');
  }
}
