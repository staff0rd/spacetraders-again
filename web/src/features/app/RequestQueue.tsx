import CloudDoneIcon from '@mui/icons-material/CloudDone'
import CloudDownloadIcon from '@mui/icons-material/CloudDownload'
import { Chip } from '@mui/material'
import { orange } from '@mui/material/colors'
import { useAtomValue } from 'jotai'
import { useEffect, useState } from 'react'
import { limiterAtom } from '../../data'

export const RequestQueue = () => {
  const [queueCount, setQueueCount] = useState(0)
  const limiter = useAtomValue(limiterAtom)
  useEffect(() => {
    const timer = setInterval(() => {
      const count = limiter?.counts().QUEUED ?? 0
      setQueueCount(count)
    }, 100)
    return () => clearInterval(timer)
  }, [limiter, setQueueCount])

  return (
    <Chip
      icon={queueCount ? <CloudDownloadIcon color="inherit" /> : <CloudDoneIcon color="inherit" />}
      label={queueCount}
      sx={{
        color: queueCount ? orange[600] : 'white',
        borderColor: queueCount ? orange[600] : 'white',
        paddingX: 1,
        '& .MuiChip-label': {
          paddingLeft: 2,
        },
      }}
    />
  )
}
