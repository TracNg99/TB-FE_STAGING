'use client';

import { notifications } from '@mantine/notifications';
import { useParams, usePathname, useRouter } from 'next/navigation';
import {
  createContext,
  use,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import { useI18n } from '@/contexts/i18n-provider';
import { BusinessProfile } from '@/store/redux/slices/business/profile';
import {
  useLogOutMutation,
  useRefreshSessionMutation,
} from '@/store/redux/slices/user/auth';
import {
  Profile,
  useGetProfileAltQuery,
} from '@/store/redux/slices/user/profile';
import isAuthenticated from '@/utils/supabase/authorization';

export const PUBLIC_ROUTES = [
  '/auth/login',
  '/auth/register',
  '/auth/callbackv1',
  '/auth/forgot-password',
  '/auth/reset-password',
  '/experiences/',
  '/auth/register/business',
  '/auth/login/business',
  '/discoveries',
  // '/stories/',
];

export type AuthContextType = {
  user: (Profile & BusinessProfile) | null;
  isDefault: boolean;
  setIsDefault: (value: boolean) => void;
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
  const { changeLanguage } = useI18n();
  const [user, setUser] = useState<(Profile & BusinessProfile) | null>(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [roleTracker, setRoleTracker] = useState<string | null>();
  const isSessionExpired = useRef(false);
  const [logOut] = useLogOutMutation();
  const [refreshSession] = useRefreshSessionMutation();
  const [isDefault, setIsDefault] = useState(true);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('hash', window.location.hash);
    }
  }, []);

  const logout = useCallback(async () => {
    setRoleTracker(null);
    localStorage.clear();
    sessionStorage.clear();
    sessionStorage.setItem('currentPath', pathname);
    await logOut();
    if (!isSessionExpired.current) {
      router.replace('/auth/login');
    }
  }, [logOut, pathname, router]);

  useEffect(() => {
    const checkUserAuth = async () => {
      const jwt = localStorage.getItem('jwt') || '';
      const role = localStorage.getItem('role') || '';
      const isGuest = localStorage.getItem('isGuest') == 'true';
      try {
        const isValidJwt = await isAuthenticated(jwt);
        if (isGuest && pathname === '/') {
          setIsCheckingAuth(false);

          return;
        }

        // Redirect to role-based dashboard if on root path with valid JWT and role
        if (pathname === '/auth/login' && isValidJwt && role) {
          if (role === 'user') {
            router.replace(`/`);
          } else {
            router.replace(`/discoveries`);
          }
          return;
        }

        if (
          (pathname === '/auth/login/business' ||
            pathname === '/' ||
            pathname === '/business') &&
          isValidJwt &&
          role === 'business'
        ) {
          router.replace(`/discoveries`);
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
            pathname !== '/'
          ) {
            localStorage.clear();
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
        }

        if (
          pathname !== '/auth/login' &&
          pathname !== '/auth/register' &&
          pathname !== '/auth/register/business' &&
          pathname !== '/auth/login/business' &&
          pathname !== '/auth/reset-password' &&
          pathname !== '/auth/forgot-password' &&
          pathname !== '/auth/callbackv1'
        ) {
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
          pathname.includes(experienceId)
        ) {
          setIsCheckingAuth(false);
          return;
        }

        // If the role is 'user'
        if (
          role === 'user' &&
          (pathname.includes('business') ||
            (pathname.includes('experiences') && pathname.includes('edit')) ||
            (pathname.includes('experiences') && pathname.includes('create')) ||
            (pathname.includes('activities') && pathname.includes('create')))
        ) {
          router.replace('/auth/login/business'); // Redirect to a login
          return;
        }

        // Allow access to valid role-based or general routes
        const isRoleBasedPath = pathname.includes(role);
        const isGeneralPath =
          !pathname.includes('/business') && !pathname.includes('/user');

        if (isRoleBasedPath || isGeneralPath) {
          setIsCheckingAuth(false);
          return;
        }

        // Redirect to role-based dashboard if accessing invalid role-specific path
        if (!pathname.includes(role)) {
          router.replace(role === 'user' ? `/` : `/dashboard/business`);
        }
      } catch (error) {
        console.error('Error during authentication check:', error);
      } finally {
        setIsCheckingAuth(false);
      }
    };
    checkUserAuth();
  }, [pathname, router, setIsCheckingAuth, experienceId]);

  const {
    data: profile,
    error: profileErr,
    refetch,
  } = useGetProfileAltQuery(
    { role: roleTracker as string },
    { skip: !roleTracker, refetchOnMountOrArgChange: true },
  );

  useEffect(() => {
    const jwt = localStorage.getItem('jwt') || '';
    const role = localStorage.getItem('role') || '';
    const expiresAt = sessionStorage.getItem('expiresAt') || '';
    const refreshToken = sessionStorage.getItem('refreshToken') || '';
    if (role !== '') {
      setRoleTracker(role);
    }

    const checkExpirationAndRefresh = async () => {
      // const isValid = isAuthenticated(jwt);
      const expTime = expiresAt ? Number(expiresAt) * 1000 - 60 * 5 * 1000 : 0;
      const isExpired = expiresAt ? Date.now() > expTime : null;
      if (!isExpired) return;
      console.log('Session expired, refreshing...');
      try {
        const { access_token, refresh_token, expires_at, user_id } =
          await refreshSession({
            refreshToken,
          }).unwrap();

        if (access_token && refresh_token && expires_at && user_id) {
          setRoleTracker(role);
          setUser(null);
          // Will be wiped on session timeout
          localStorage.setItem('jwt', access_token);
          localStorage.setItem('userId', user_id);

          // Will not be wiped on session timeout
          sessionStorage.setItem('refreshToken', refresh_token);
          sessionStorage.setItem('expiresAt', expires_at);
          refetch();
        }
        return;
      } catch (error) {
        console.error('Error refreshing session:', error);
      }
    };

    checkExpirationAndRefresh();

    const checkAuthValid = async () => {
      const isValid = isAuthenticated(jwt);
      if (!isValid && !isSessionExpired.current) {
        notifications.show({
          title: 'Session Expired',
          message: 'Your session has expired! Please log in again!',
          color: 'yellow',
          position: 'top-center',
        });
        isSessionExpired.current = true;
        logout();
        router.push('/');
      }
    };

    if (jwt) {
      checkAuthValid();
      if (!profile && roleTracker) refetch();
    }

    if (profile && profile?.data && roleTracker) {
      const fetchedLanguage = profile?.data.language;
      const storedLanguage = sessionStorage.getItem('language');
      if (fetchedLanguage !== storedLanguage) {
        refetch();
      }
      setUser(profile?.data);
      sessionStorage.setItem(
        'companies',
        JSON.stringify(profile?.data.company_ids),
      );
      if (roleTracker === 'user') {
        sessionStorage.setItem('language', profile?.data?.language || 'en-US');
        changeLanguage(profile?.data?.language?.split('-')[0] || 'en');
      }
    }
  }, [
    profile,
    pathname,
    logout,
    profileErr,
    user,
    refetch,
    roleTracker,
    router,
    refreshSession,
  ]);

  const authCtxValues = useMemo(
    () => ({
      user,
      isDefault,
      setIsDefault,
      logout,
    }),
    [user, isDefault, setIsDefault, logout],
  );

  // Show a loading state while checking authentication
  if (isCheckingAuth) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full border-b-2 border-gray-900 h-5 w-5"></div>
      </div>
    );
  }

  return (
    <AuthContext value={authCtxValues}>
      {children}
      {/* <Suspense>
        <SearchParamsPH/>
      </Suspense> */}
    </AuthContext>
  );
};

export default AuthProvider;
