import { redirect } from 'next/navigation';

const AuthPage = () => {
  return redirect('/auth/login');
};

export default AuthPage;
