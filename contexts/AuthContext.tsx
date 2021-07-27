import {createContext, ReactNode, useContext, useEffect, useState} from "react";
import {api} from "../services/api";
import Router from "next/router";
import {destroyCookie, parseCookies, setCookie} from "nookies";

type User = {
  email: string;
  permissions: string[];
  roles: string[];
}

type SignInCredentials = {
  email: string;
  password: string;
}

type AuthContextData = {
  signIn: (credentials: SignInCredentials) => Promise<void>;
  signOut: () => void;
  isAuthenticated: boolean;
  user: User
};

type AuthProviderProps = {
  children: ReactNode
}

let authChannel: BroadcastChannel;


export function signOut () {
  destroyCookie(undefined, 'nextauth.token');
  destroyCookie(undefined, 'nextauth.refreshToken');
  authChannel.postMessage('signOut');
  Router.push('/');
}


const AuthContext = createContext({} as AuthContextData);

export function AuthProvider ({children}: AuthProviderProps) {
  const [user, setUser] = useState<User>();
  const isAuthenticated = !!user;

  useEffect(() => {
    authChannel = new BroadcastChannel('auth');
    authChannel.onmessage = async (message) => {
      switch (message.data) {
        case 'signOut':
          signOut();
          break;
        default:
          break;
      }

    }
  }, [])

  useEffect(
    () => {
      const {'nextauth.token': token} = parseCookies();
      if (token) {
        api.get('/me')
          .then(response => {
              const {email, permissions, roles} = response.data;
              setUser({email, permissions, roles});
            }
          ).catch(() => signOut());
      }
    },
    []
  );

  async function signIn ({email, password}: SignInCredentials) {
    try {
      const response = await api.post(
        'sessions',
        {email, password}
      );
      const {token, refreshToken, permissions, roles} = response.data;

      setCookie(
        undefined,
        'nextauth.token',
        token,
        {
          maxAge: 60 * 60 * 24 * 30, // 30 days
          path: '/'
        }
      );

      setCookie(
        undefined,
        'nextauth.refreshToken',
        refreshToken,
        {
          maxAge: 60 * 60 * 24 * 30, // 30 days
          path: '/'
        }
      );

      setUser(
        {email, roles, permissions}
      );

      api.defaults.headers['Authorization'] = `Bearer ${token}`;

      await Router.push('/dashboard');

    } catch (err) {
      console.log(err);
    }
  }

  return (
    <AuthContext.Provider value={{signIn, signOut, isAuthenticated, user}}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext);