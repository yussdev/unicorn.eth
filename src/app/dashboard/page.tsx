'use client'

import Image from 'next/image'
import { Typography } from '@ensdomains/thorin'
import { useTheme } from 'styled-components'
import { ScanIcon } from '@/components/Icons/Scan'
import { useState } from 'react'
import { TokenItem } from '@/components/TokenItem'
import { useAuth } from '@/hooks/useAuth'
import { BalanceBox, UserInfo } from '@/components/Styled'
import { useAtom } from 'jotai'
import {
  activeModalAtom,
  selectedCollectibleAtom,
  selectedTokenAtom,
} from '@/store'
import { MODAL_TYPE } from './layout'
import { priceFormatter } from '@/utils/price'
import useSWR from 'swr'
import { PromotionBox } from '@/components/Dashboard/PromotionBox'
import { createCryptoTokenObject, fetchTokenPrices } from './utils/tokens'

import { NftImage } from '@/components/Dashboard/NftImage'
import { usePOAP } from '@/hooks/usePOAP'
import { useActiveAccount } from 'thirdweb/react'
import { shortenEthereumAddress } from '@/utils/strings'
import { useBalance } from '@/hooks/useBalance'

const TABS = ['Tokens', 'Collectibles']

export default function Dashboard() {
  const theme = useTheme()
  const { canMintPOAP } = usePOAP()
  const { username, userProfilePicture, userAddress } = useAuth()
  const [activeTab, setActiveTab] = useState('Tokens')
  const [, setSelectedCollectible] = useAtom(selectedCollectibleAtom)
  const [, setSelectedToken] = useAtom(selectedTokenAtom)
  const [, setActiveModal] = useAtom(activeModalAtom)
  const [showPromotionBox, setShowPromotionBox] = useState(true)
  const account = useActiveAccount()

  // User shouldn't be in the dashboard if they don't have an account
  const walletAddress = account?.address!

  const { tokenBalance, nfts, errors } = useBalance(userAddress)

  const { data: tokenPrices, error } = useSWR<Record<string, number>>(
    'token-prices',
    fetchTokenPrices
  )

  // TODO: Better error handling
  if (errors.tokensError || errors.nftsError || error) return
  // Probably use some spinner to indicate the loading time
  if (!tokenPrices || !tokenBalance || !nfts) return

  const estimatedTotalValue = createCryptoTokenObject(
    tokenBalance,
    tokenPrices
  ).reduce((acc, curr) => (acc += (curr.price || 0) * curr.value), 0)

  return (
    <>
      <header className="flex  items-center justify-between">
        <UserInfo>
          <Image
            className="rounded-full"
            src={userProfilePicture || '/img/validator.eth.png'}
            alt={username || ''}
            width={40}
            height={40}
          />
          <Typography fontVariant="bodyBold">
            {username}.{process.env.NEXT_PUBLIC_OFFCHIAN_ENS_DOMAIN}
          </Typography>
        </UserInfo>
        <div
          onClick={() => setActiveModal(MODAL_TYPE.SCAN)}
          className="flex  items-center gap-2">
          <ScanIcon color={theme.colors.grey} />
        </div>
      </header>
      <BalanceBox>
        <Typography color="inherit" fontVariant="small">
          {`Estimated Value for: ${
            account?.address ? shortenEthereumAddress(account.address) : ''
          }`}
        </Typography>
        <Typography color="text" fontVariant="extraLarge">
          {priceFormatter.format(estimatedTotalValue)}
        </Typography>
      </BalanceBox>
      {showPromotionBox && canMintPOAP && (
        <PromotionBox
          title="Claim your digital collectible"
          subtitle="Welcome to your web3 wallet."
          onClose={() => {
            setShowPromotionBox(false)
          }}
        />
      )}
      <nav className="flex gap-4">
        {TABS.map((tab, idx) => (
          <Typography
            role="button"
            tabIndex={idx}
            onClick={() => setActiveTab(tab)}
            key={tab}
            fontVariant="large"
            weight="bold"
            color={tab === activeTab ? undefined : 'grey'}>
            {tab}
          </Typography>
        ))}
      </nav>
      <div className="flex flex-col gap-4">
        {activeTab === 'Tokens' &&
          createCryptoTokenObject(tokenBalance, tokenPrices).map(
            (token, idx) => (
              <div
                key={idx}
                onClick={() => {
                  setSelectedToken(token)
                  setActiveModal(MODAL_TYPE.TOKEN_DETAIL)
                }}
                role="button">
                <TokenItem token={token} />
              </div>
            )
          )}
        {activeTab === TABS[1] && (
          <div className="grid grid-cols-2 gap-4 gap-x-2 ">
            {nfts.map((collectible, id) => (
              <div
                key={id}
                onClick={() => {
                  setSelectedCollectible(collectible)
                  setActiveModal(MODAL_TYPE.COLLECTIBLE_DETAIL)
                }}
                role="button">
                <NftImage
                  src={collectible?.img || '/img/login-bg.png'}
                  placeholder={'/img/login-bg.png'}
                  name={collectible.name}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  )
}
