import React, {
  useState,
  useEffect,
  useContext,
  createContext,
  ReactElement,
  PropsWithChildren,
} from 'react'
import nookies from 'nookies'
import { firebaseClient } from '../lib/firebaseClient'
import firebase from 'firebase/app'
import roles from '../lib/auth/roles'

export interface IFirebaseUser extends firebaseClient.User {
  role?: roles
}

const AuthContext = createContext<{ user: IFirebaseUser | null }>({
  user: null,
})

export function AuthProvider({
  children,
}: PropsWithChildren<Record<never, never>>): ReactElement {
  const [user, setUser] = useState<IFirebaseUser | null>(null)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      ;(window as any).nookies = nookies // eslint-disable-line
    }
    return firebaseClient.auth().onIdTokenChanged(async (userParam) => {
      if (!userParam) {
        setUser(null)
        nookies.destroy(null, 'token')
        nookies.set(null, 'token', '', { path: '/' })
        return
      }

      const token = await userParam.getIdToken()

      firebase
        .auth()
        .currentUser?.getIdTokenResult()
        .then((idTokenResult) => {
          const newUser: IFirebaseUser = userParam
          newUser.role = idTokenResult.claims.role
          setUser(newUser)
          nookies.destroy(null, 'token')
          nookies.set(null, 'token', token, { path: '/' })
        })
    })
  }, [])

  // force refresh the token every 10 minutes
  useEffect(() => {
    const handle = setInterval(async () => {
      const newUser = firebaseClient.auth().currentUser
      if (newUser) {
        await newUser.getIdToken(true)
      }
    }, 10 * 60 * 1000)
    return () => clearInterval(handle)
  }, [])

  return (
    <AuthContext.Provider value={{ user }}>{children}</AuthContext.Provider>
  )
}

export const useAuth = (): { user: IFirebaseUser | null } => {
  return useContext(AuthContext)
}
