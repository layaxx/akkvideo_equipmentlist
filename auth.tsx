import React, { useState, useEffect, useContext, createContext } from 'react'
import nookies from 'nookies'
import { firebaseClient } from './firebaseClient'

const AuthContext = createContext<{ user: firebaseClient.User | null }>({
  user: null,
})

export function AuthProvider({ children }: any) {
  const [user, setUser] = useState<firebaseClient.User | null>(null)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      (window as any).nookies = nookies
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
      setUser(userParam)
      nookies.destroy(null, 'token')
      nookies.set(null, 'token', token, { path: '/' })
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