import { useAuth } from '@/hooks/useAuth'
import { useIsAutoConnecting } from '@/lib/third-web/AutoConnect'
import { useRouter } from 'next/navigation'
import React, { PropsWithChildren, useEffect } from 'react'
import { useActiveWallet } from 'thirdweb/react'

export const AuthGuard: React.FC<PropsWithChildren> = ({ children }) => {
  const { replace } = useRouter()
  const wallet = useActiveWallet()
  const { username } = useAuth()
  const { isAutoConnecting } = useIsAutoConnecting()

  useEffect(() => {
    if (!wallet && isAutoConnecting === false) {
      replace('/login')
    }
  }, [replace, wallet, isAutoConnecting])

  if (!wallet || !username) return <></>

  return <>{children}</>
}
