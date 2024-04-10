'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { Button, Input, Typography } from '@ensdomains/thorin'
import { GoogleIcon } from '@/components/Icons/Google'
import { ArrowLeft } from '@/components/Icons/ArrowLeft'
import { SigningInPage } from '@/components/SigningInPage'
import { Copy } from '@/components/Icons/Copy'
import { SignUpButton } from '@/components/SignUp/inde'
import { useRouter } from 'next/navigation'
import { useSafeAuth } from '@/hooks/useSafeAuth'
import cn from 'classnames'
import { UserNameInput } from '@/components/Styled'
import { useEnsResolver } from '@/hooks/useEnsResolver'
import { USER_INFO_STORAGE_KEY } from '@/lib/safe-auth-provider'
// import { ConnectWallet } from '@thirdweb-dev/react'
import { activeChain, factoryAddress } from '@/lib/third-web/constants'
import { connect } from 'http2'
import { inAppWallet, smartWallet } from 'thirdweb/wallets'
import { client, smartWalletConfig } from '@/lib/third-web/provider'
// import { get } from "thirdweb/wallets/embedded";
import { useActiveAccount, useActiveWallet, useConnect, useDisconnect } from 'thirdweb/react'

export default function Login() {
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [isSigning, setIsSigning] = useState(false)
  const [error, setError] = useState('')

  const {connect} = useConnect()
  // const {} = use
  const {disconnect} = useDisconnect()
  // const {} = useUser()
  const wallet = useActiveWallet()
  const account = useActiveAccount()
  // const wallet = useActiveWallet()

  useEffect(() => {
    console.log("wallet:", wallet)
    console.log("acc:", wallet?.getAccount())
  }, [wallet])

  // const userInfo = useUser


  const {
    safeAuthPack,
    isAuthenticated,
    setIsAuthenticated,
    setUserInfo,
    userInfo,
    setSafeAuthSignInInfo,
    userName,
    setUserName,
  } = useSafeAuth()

  const {
    isRegistering,
    isNameAvailable,
    setIsNameAvailable,
    debouncedCheckUserName,
    createEnsSubname,
    getSubnameDataset,
  } = useEnsResolver()

  // useEffect(() => {
  //   if (!safeAuthPack || !isAuthenticated) return
  //   ;(async () => {
  //     const userInfo = await safeAuthPack.getUserInfo()
  //     setUserInfo(userInfo)
  //     setStep(1)
  //   })()
  // }, [isAuthenticated, safeAuthPack, setUserInfo])

  useEffect(() => {
    if (step === 1 && account?.address) {
      getSubnameDataset(account.address).then((res) => {
        if (res.data.length) {
          router.replace('/dashboard')
        }
      })
    }
  }, [getSubnameDataset, router, step, account?.address])

  const createSmartWallet = async () => {
    const socialEOA = inAppWallet();
    await socialEOA.connect({
      client,
      strategy: "google",
    });
    console.log("EOA", socialEOA.getAccount())
    const wallet = smartWallet(smartWalletConfig);
    const EoaAccount = socialEOA.getAccount()
    await wallet.connect({
      personalAccount: EoaAccount!,
      client,
    })

    return wallet
}

  const login = async () => {
    setIsSigning(true);
    try {
      const wallet = await connect(createSmartWallet)
      setStep(1)
    } finally {
      setIsSigning(false);
    }
  }

  const logout = async () => {
    if (wallet) disconnect(wallet)
  }

  // const login = async () => {
  //   setIsSigning(true)
  //   try {
  //     const signInInfo =
  //       (await safeAuthPack?.signIn({
  //         loginProvider: 'google',
  //       })) || null
  //     setSafeAuthSignInInfo(signInInfo)
  //     setIsAuthenticated(true)
  //     localStorage.setItem(
  //       USER_INFO_STORAGE_KEY,
  //       JSON.stringify({ time: Date.now(), userInfo })
  //     )
  //   } catch (err) {
  //   } finally {
  //     setIsSigning(false)
  //   }
  // }

  // const logout = async () => {
  //   if (isAuthenticated) {
  //     await safeAuthPack?.signOut({ reset: true })
  //     setSafeAuthSignInInfo(null)
  //     setIsAuthenticated(false)
  //     setUserInfo(null)
  //     localStorage.removeItem(USER_INFO_STORAGE_KEY)
  //   }
  // }

  const handleBack = () => {
    if (step === 1) {
      logout()
    }
    setStep(Math.max(step - 1, 0))
  }

  return (
    <>
      {isSigning && <SigningInPage />}
      <div className="relative h-full w-full grow">
        <div className="absolute mb-28 flex h-4/5 w-full">
          {isAuthenticated && userInfo && (
            <ArrowLeft
              className="absolute left-5 top-10 z-10"
              onClick={handleBack}
            />
          )}
          <Image src="/img/login-bg.png" alt="Unicorn" fill />
        </div>
        <div className="absolute inset-x-0 bottom-0 rounded-t-[32px] border-b bg-white px-4 py-12">
          <div className="flex flex-col gap-10">
            <Image
              src="/img/logo.svg"
              alt="Unicorn"
              width={170}
              height={48}
              className={cn('mx-auto object-cover', {
                'mt-[57px]': step === 0,
              })}
            />
            <div className="flex flex-col gap-6">
              {step === 0 && (
                <>
                  <SignUpButton onClick={login}>
                    <GoogleIcon />
                    <Typography fontVariant="body">
                      Sign in with Google
                    </Typography>
                    {/* <ConnectWallet btnTitle='Sign in with Google'/> */}
                  </SignUpButton>
                </>
              )}
              {step === 1 && (
                <>
                  <Typography fontVariant="extraLarge">
                    Choose your wallet domain.
                  </Typography>
                  <UserNameInput
                    varient={
                      isNameAvailable === false
                        ? 'error'
                        : isNameAvailable === true
                          ? 'success'
                          : undefined
                    }>
                    <Input
                      description={
                        userName && isNameAvailable
                          ? 'Great choice! That’s available.'
                          : 'Hide'
                      }
                      value={userName}
                      onChange={(e) => {
                        setUserName(e.target.value)
                        setIsNameAvailable(null)
                        debouncedCheckUserName(e)
                      }}
                      label=""
                      name="username"
                      placeholder="username"
                      suffix=".account.eth"
                      size="large"
                      error={
                        isNameAvailable === false && "Oops! That's unavailable."
                      }
                    />
                  </UserNameInput>

                  <Button
                    loading={isRegistering}
                    // disabled={!userName || !Boolean(isNameAvailable)}
                    onClick={() => {
                      createEnsSubname(userName).then(() => {
                        setStep(2)
                      })
                    }}>
                    Next
                  </Button>
                </>
              )}
              {step === 2 && (
                <>
                  <Typography fontVariant="extraLarge">
                    Welcome to the web3
                  </Typography>
                  <div className="flex flex-col items-center justify-center gap-2 rounded-[40px] bg-background-secondary p-2">
                    {userInfo && (
                      <Image
                        className="rounded-full"
                        src={userInfo.profileImage}
                        alt={userInfo.name}
                        width={72}
                        height={72}
                      />
                    )}
                    <Typography className="flex items-center gap-1 lowercase ">
                      {userName}.unicorn.eth <Copy />
                    </Typography>
                    <Typography className="text-text-secondary">
                      {userInfo?.email}
                    </Typography>
                  </div>
                  <Button onClick={() => router.push('/dashboard')}>
                    Go to wallet
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
