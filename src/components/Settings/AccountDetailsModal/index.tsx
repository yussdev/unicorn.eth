import { Button, Input, Modal, Typography } from '@ensdomains/thorin'
import { useAtom } from 'jotai'
import { activeModalAtom } from '@/store'
import { ModalHeader } from '@/components/ModalHeader'
import * as yup from 'yup'
import { yupResolver } from '@hookform/resolvers/yup'
import Image from 'next/image'
import styled from 'styled-components'
import { useAuth } from '@/hooks/useAuth'
import { IconButton } from '@/components/Styled'
import { PenIcon } from '@/components/Icons/Pen'
import { ArrowRightIcon } from '@/components/Icons/ArrowRight'
import { MODAL_TYPE } from '@/utils/modals'

import { Controller, useForm } from 'react-hook-form'
import { useEnsResolver } from '@/hooks/useEnsResolver'
import useSWR from 'swr'
import { EnsRecordType, getSubnameMetadata } from '@/services/enService'
import { useEffect, useMemo, useRef, useState } from 'react'
import { convertImageToBase64 } from '@/utils/image'
import { UploadIcon } from '@/components/Icons/Upload'
import axios from 'axios'

const UserInfoBox = styled.div(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  borderRadius: '16px',
  gap: theme.space['4'],
  backgroundColor: theme.colors.backgroundSecondary,
  color: theme.colors.textSecondary,
  padding: '8px',
}))

const BuyEnsBox = styled.div(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  borderRadius: '16px',
  gap: theme.space['4'],
  backgroundColor: theme.colors.blueSurface,
  padding: '12px',
}))

const schema = yup.object({
  name: yup.string().required(),
  bio: yup.string().required(),
  website: yup.string().required(),
})
type FormData = yup.InferType<typeof schema>

export const AccountDetailsModal: React.FC<{
  open: boolean
  onDismiss: () => void
}> = ({ open, onDismiss }) => {
  const inputRef = useRef<HTMLInputElement>(null)
  const [accountDetails, setAccountDetails] = useState(null)
  const { username, userEmail, userProfilePicture, setUserProfilePicture } =
    useAuth()
  const [, setActiveModal] = useAtom(activeModalAtom)

  const {
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: yupResolver(schema),
    defaultValues: useMemo(
      () => accountDetails || { name: '', bio: '', website: '' },
      [accountDetails]
    ),
  })
  const onSubmit = (data: FormData) => {
    return axios.put('/api/subname/record', {
      label: username,
      key: EnsRecordType.ACCOUNT_INFO,
      text: encodeURIComponent(JSON.stringify(data)),
    })
  }

  useEffect(() => {
    if (open) {
      axios
        .get<{ record: string }>('/api/subname/record', {
          params: {
            label: username,
            key: EnsRecordType.ACCOUNT_INFO,
          },
        })
        .then((data) => {
          if (data.data?.record) {
            setAccountDetails(JSON.parse(data.data?.record))
          }
          return {}
        })
    }
  }, [open, username])

  useEffect(() => {
    if (accountDetails) reset(accountDetails)
  }, [accountDetails, reset])

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      const data = new FormData()
      data.set('file', file)
      axios
        .post('/api/files', data)
        .then((res) => {
          return axios.put(
            '/api/subname/data',
            {
              data: res.data.IpfsHash,
            },
            {
              params: {
                label: username,
                key: EnsRecordType.ACCOUNT_PROFILE_IMAGE_CID,
              },
            }
          )
        })
        .then(() => {
          convertImageToBase64(file, (base64) => {
            setUserProfilePicture(base64)
          })
        })
    }
  }

  return (
    <Modal open={open} onDismiss={onDismiss} mobileOnly>
      <div className="flex min-h-[40%] w-full flex-col gap-10 rounded-t-[32px] border-b bg-white p-5 pb-12 pt-4">
        <ModalHeader title="Account Details" />
        <UserInfoBox>
          <div className="flex gap-2 ">
            <div className="relative">
              <input
                className="absolute inset-0 opacity-0"
                type="file"
                ref={inputRef}
                onInput={handleFileChange}
              />
              <Image
                className="rounded-full"
                src={userProfilePicture || '/img/validator.eth.png'}
                alt={username || ''}
                width={60}
                height={60}
              />
              <div className="!absolute bottom-0 right-0 rounded-full bg-white p-1">
                <UploadIcon />
              </div>
            </div>
            <div className="flex flex-col justify-center gap-2">
              <Typography fontVariant="bodyBold">
                {username}.unicorn.eth
              </Typography>
              <Typography color="textSecondary">{userEmail}</Typography>
            </div>
          </div>
          <IconButton
            colorStyle="transparent"
            shape="square"
            height="20px"
            onClick={() => setActiveModal(MODAL_TYPE.SETTINGS_CHANGE_DOMIAN)}>
            <PenIcon />
          </IconButton>
        </UserInfoBox>
        <div>
          <BuyEnsBox
            onClick={() => setActiveModal(MODAL_TYPE.SETTINGS_BUY_ENS)}
            role="button">
            <div className="flex gap-2 ">
              <div className="relative">
                <Image
                  className="rounded-full"
                  src="/img/ens-mark.svg"
                  alt="ENS logo"
                  width={39}
                  height={44}
                />
              </div>
              <div className="flex flex-col justify-center gap-1">
                <Typography fontVariant="smallBold">ENS</Typography>
                <Typography color="bluePrimary">
                  Buy a new ENS domain
                </Typography>
              </div>
            </div>
            <IconButton colorStyle="transparent" shape="square" height="24px">
              <ArrowRightIcon />
            </IconButton>
          </BuyEnsBox>
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="mt-4 flex flex-col gap-4">
            <Controller
              name="name"
              control={control}
              rules={{ required: true }}
              render={({ field }) => (
                <Input
                  label="Name"
                  placeholder="Add a display name"
                  type="text"
                  error={errors.name?.message}
                  {...field}
                />
              )}
            />
            <Controller
              name="bio"
              control={control}
              rules={{ required: true }}
              render={({ field }) => (
                <Input
                  label="Bio"
                  placeholder="Add something about yourself"
                  type="text"
                  error={errors.bio?.message}
                  {...field}
                />
              )}
            />
            <Controller
              name="website"
              control={control}
              rules={{ required: true }}
              render={({ field }) => (
                <Input
                  label="Website"
                  placeholder="Add your website"
                  type="text"
                  error={errors.website?.message}
                  {...field}
                />
              )}
            />
            <Button className="mt-10" type="submit" loading={isSubmitting}>
              Update
            </Button>
          </form>
        </div>
      </div>
    </Modal>
  )
}
