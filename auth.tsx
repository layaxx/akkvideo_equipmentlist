import React, {
  useState,
  useEffect,
  useContext,
  createContext,
  ReactElement,
  PropsWithChildren,
} from 'react'
import nookies from 'nookies'
import { firebaseClient } from './firebaseClient'
import firebase from 'firebase/app'
import roles from './lib/auth/roles'

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
      // console.log(`token changed!`)
      if (!userParam) {
        console.log(`no token found...`)
        setUser(null)
        nookies.destroy(null, 'token')
        nookies.set(null, 'token', '', { path: '/' })
        return
      }

      // console.log(`updating token...`)
      const token = await userParam.getIdToken()

      firebase
        .auth()
        .currentUser?.getIdTokenResult()
        .then((idTokenResult) => {
          const user: IFirebaseUser = userParam
          user.role = idTokenResult.claims.role
          setUser(userParam)
          nookies.destroy(null, 'token')
          nookies.set(null, 'token', token, { path: '/' })
        })
    })
  }, [])

  // force refresh the token every 10 minutes
  useEffect(() => {
    const handle = setInterval(async () => {
      // console.log(`refreshing token...`)
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

export const useAuth = () => {
  return useContext(AuthContext)
}
