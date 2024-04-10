import { ClientProviders } from '@/lib/client-providers'
import './globals.css'
import { Inter } from 'next/font/google'
import { SafeAuthProvider } from '@/lib/safe-auth-provider'
import { GetServerSideProps } from 'next'
import { headers } from 'next/headers'
import { activeChain, factoryAddress } from '@/lib/third-web/constants'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Unicorn.eth',
  description:
    'Mobile View of Unicorn.eth Account Abstacrion Wallet generated by GM-Wallets',
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const UA = headers().get('user-agent') || ''
  const isMobile = Boolean(
    UA.match(
      /Android|BlackBerry|iPhone|iPad|iPod|Opera Mini|IEMobile|WPDesktop/i
    )
  )
  return (
    <ClientProviders>
      <SafeAuthProvider>
          <html lang="en">
            <body className={inter.className}>
              <main className="m-auto flex min-h-screen max-w-[430px] flex-col items-center justify-center bg-white">
                {!isMobile
                  ? 'This app can only be viewed on mobile.'
                  : children}
              </main>
            </body>
          </html>
      </SafeAuthProvider>
    </ClientProviders>
  )
}
