import { Button, Modal, Typography } from '@ensdomains/thorin'
import { Scanner } from '@yudiel/react-qr-scanner'
import CopyWrapper from '../ReceiveModal/CopyWrapper'
import { CopyWhite } from '../Icons/CopyWhite'
import { Exit } from '../Icons/Exit'
import { QRScan } from '../Icons/QRScan'
import { useAtom } from 'jotai'
import { activeModalAtom } from '@/store'
import { MODAL_TYPE } from '@/utils/modals'

import { QR } from '../Icons/QR'
import { isAddress } from 'thirdweb'
import { useEnsResolver } from '@/hooks/useEnsResolver'
import { useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'

export const ScanModal: React.FC<{
  open: boolean
  onDismiss: () => void
  setCurrentScan: (value: string) => void
}> = ({ open, onDismiss, setCurrentScan }) => {
  const { username } = useAuth()
  const [, setActiveModal] = useAtom(activeModalAtom)
  const { getENSAddress } = useEnsResolver()

  const handleScan = async (result: string) => {
    //TODO: HANDLE SCAN TO REDIRECT PROPERLY
    // Cases: eth.limo, regular addresses, ens names and dapps
    let address = result
    const isEns = await getENSAddress(result)
    isEns && (address = isEns)
    if (isAddress(address)) {
      console.log('Address Detected')
      await onDismiss()
      setCurrentScan(address)
      setActiveModal(MODAL_TYPE.SEND)
    }
  }

  useEffect(() => {
    onDismiss()
  }, [])

  return (
    <Modal open={open} onDismiss={onDismiss} mobileOnly>
      <div className="flex relative justify-between min-h-[80vh] h-full w-full flex-col gap-2 rounded-t-[32px] border-b bg-black pt-6">
        <div className="flex flex-col gap-2 items-center justify-center text-center mx-5 z-10">
          <div className="w-full relative flex flex-row justify-between bg-red z-10">
            <div onClick={() => onDismiss()}>
              <Exit />
            </div>
            {username && (
              <CopyWrapper textToCopy={username + '.account.eth.limo'} absolute>
                <CopyWhite />
              </CopyWrapper>
            )}
          </div>
        </div>
        <div className="qr-scanner-container">
          <Scanner
            components={{
              tracker: false,
            }}
            styles={{
              video: {
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                zIndex: 0, // set 0 to show  border
              },
              container: {
                position: 'absolute',
                height: '100%',
                borderTopLeftRadius: '32px',
                borderTopRightRadius: '32px',
                top: 0,
              },
            }}
            onResult={(text: string) => handleScan(text)}
          />
        </div>

        <div className="flex flex-col w-[100%] justify-center align-center items-center z-10 ">
          <QRScan />
          <Typography
            className="w-[255px] text-center"
            color="background"
            fontVariant="body">
            Send crypto or connect to dapps by scanning a QR code
          </Typography>
        </div>
        <div className="flex justify-center align-center min-h-[162px] z-10 bg-neutral-800 rounded-t-xl pt-[24px] pb-[48px] px-[16px] ">
          <Button
            style={{
              maxWidth: '200px',
              backgroundColor: 'rgba(128, 128, 128, 0.3)',
              borderRadius: '200px',
            }}
            onClick={() => setActiveModal(MODAL_TYPE.RECEIVE)}>
            <div className="flex flex-row items-center gap-2">
              <QR />
              Show my QR code
            </div>
          </Button>
        </div>
      </div>
    </Modal>
  )
}
