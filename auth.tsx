import React, { useState, useEffect, useContext, createContext } from 'react'
import nookies from 'nookies'
import { firebaseClient } from './firebaseClient'
import firebase from 'firebase'
import roles from './lib/auth/roles'

export interface IFirebaseUser extends firebaseClient.User {
  role: roles
}

const AuthContext = createContext<{ user: IFirebaseUser | null }>({
  user: null,
})

export function AuthProvider({ children }: any) {
  const [user, setUser] = useState<IFirebaseUser | null>(null)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      ;(window as any).nookies = nookies
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
          setUser({
            ...userParam,
            role: idTokenResult.claims.role ?? roles.Public,
          })
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
