'use client';

import { notifications } from '@mantine/notifications';
import {
  useParams,
  usePathname,
  useRouter,
  // useSearchParams
} from 'next/navigation';
import { createContext, use, useEffect, useRef, useState } from 'react';

import { BusinessProfile } from '@/store/redux/slices/business/profile';
// import { jwtDecode } from "jwt-decode";
import { useLogOutMutation } from '@/store/redux/slices/user/auth';
import { Profile } from '@/store/redux/slices/user/profile';
import { useGetProfileAltQuery } from '@/store/redux/slices/user/profile';
import isAuthenticated from '@/utils/supabase/authorization';

export const PUBLIC_ROUTES = [
  '/auth/login',
  '/auth/register',
  '/auth/callbackv1',
  '/auth/forgot-password',
  '/experiences/',
  '/auth/register/business',
  '/auth/login/business',
  '/discoveries',
];

export type AuthContextType = {
  user: (Profile & BusinessProfile) | null;
  logout: () => void;
};

export const AuthContext = createContext<AuthContextType | null>(null);

export const authKey = 'buddy-user';

export const useAuth = () => {
  const context = use(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// const SearchParamsPH = () => {
//   const queryParams = useSearchParams()
//   const reporterId = queryParams.get("reporterId");
//   useEffect(() => {
//     if (typeof window !== 'undefined' && reporterId) {
//         localStorage.setItem('reporterId', reporterId as string);
//     }
//   }, [])

//   return(<></>)
// };

const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname();
  const params = useParams<{ experienceId: string }>();
  const experienceId = params?.experienceId;
  const router = useRouter();
  const [user, setUser] = useState<(Profile & BusinessProfile) | null>(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [roleTracker, setRoleTracker] = useState<string>();
  const channelChecker = useRef(false);
  const [logOut] = useLogOutMutation();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('hash', window.location.hash);
    }
  }, []);

  const logout = async () => {
    localStorage.clear();
    sessionStorage.clear();
    await logOut();
    router.replace('/auth/login');
    return;
  };

  useEffect(() => {
    const checkUserAuth = async () => {
      const jwt = localStorage.getItem('jwt') || '';
      const role = localStorage.getItem('role') || '';
      try {
        const isValidJwt = await isAuthenticated(jwt);

        // Redirect to role-based dashboard if on root path with valid JWT and role
        if (pathname === '/auth/login' && isValidJwt && role) {
          if (role === 'user') {
            router.replace(`/`);
          } else {
            router.replace(`/business`);
          }
          return;
        }

        // Redirect to login if no JWT OR if JWT is invalid
        if (!isValidJwt) {
          if (pathname === '/auth/register/business') {
            return;
          } else if (
            pathname?.includes('business') &&
            pathname !== '/auth/register/business'
          ) {
            router.replace('/auth/login/business');
            return;
          } else if (
            !PUBLIC_ROUTES.find((route) => pathname.includes(route)) &&
            !(pathname === '/')
          ) {
            localStorage.clear();
            sessionStorage.clear();
            notifications.show({
              title: 'Feature for logged in users only',
              message: 'Please log in to access this feature',
              color: 'yellow',
              position: 'top-center',
            });
            sessionStorage.setItem('currentPath', pathname);
            router.replace('/auth/login');
            return;
          }
        } else {
          const currentPath = sessionStorage.getItem('currentPath') || '';
          if (currentPath) {
            router.replace(currentPath);
            sessionStorage.removeItem('currentPath');
            return;
          }
        }

        // Allow access to public routes
        if (
          (PUBLIC_ROUTES.find((route) => pathname?.includes(route)) &&
            pathname !== '/') ||
          pathname!.includes(experienceId as string)
        ) {
          setIsCheckingAuth(false);
          return;
        }

        // If the role is 'user'
        if (
          role === 'user' &&
          (pathname!.includes('business') ||
            (pathname!.includes('experiences') && pathname!.includes('edit')) ||
            (pathname!.includes('experiences') &&
              pathname!.includes('create')) ||
            (pathname!.includes('activities') && pathname!.includes('create')))
        ) {
          router.replace('/auth/login/business'); // Redirect to a login
          return;
        }

        // Allow access to valid role-based or general routes
        const isRoleBasedPath = pathname!.includes(role);
        const isGeneralPath =
          !pathname!.includes('/business') && !pathname!.includes('/user');

        if (isRoleBasedPath || isGeneralPath) {
          setIsCheckingAuth(false);
          return;
        }

        // Redirect to role-based dashboard if accessing invalid role-specific path
        if (!pathname!.includes(role)) {
          router.replace(role === 'user' ? `/` : `/dashboard/business`);
        }
      } catch (error) {
        console.error('Error during authentication check:', error);
      } finally {
        setIsCheckingAuth(false);
      }
    };

    checkUserAuth();
  }, [pathname]);

  const {
    data: profile,
    error: profileErr,
    refetch,
  } = useGetProfileAltQuery(
    { role: roleTracker as string },
    { skip: !roleTracker },
  );

  useEffect(() => {
    const jwt = localStorage.getItem('jwt') || '';
    const role = localStorage.getItem('role') || '';
    setRoleTracker(role);

    if (jwt) {
      if (!profile && roleTracker) refetch();
    }

    if (profile && profile?.data) {
      setUser(profile?.data);
    }
  }, [profile, pathname, logout, profileErr, user, channelChecker.current]);

  // Show a loading state while checking authentication
  if (isCheckingAuth) {
    return null; // Optionally, replace with a loader component
  }

  return (
    <AuthContext
      value={{
        user,
        logout,
      }}
    >
      {children}
      {/* <Suspense>
        <SearchParamsPH/>
      </Suspense> */}
    </AuthContext>
  );
};

export default AuthProvider;
