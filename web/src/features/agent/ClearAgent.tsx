import DeleteIcon from '@mui/icons-material/Delete'
import { Alert, Box, Button, IconButton, Modal, Stack, Typography } from '@mui/material'
import { useAtom } from 'jotai'
import { useState } from 'react'
import { tokenAtom } from '../../data'

export const ClearAgent = () => {
  const [, persistToken] = useAtom(tokenAtom)
  const [open, setOpen] = useState(false)
  const handleClose = () => setOpen(false)

  return (
    <>
      <IconButton aria-label="delete token" onClick={() => setOpen(true)} edge="end">
        <DeleteIcon />
      </IconButton>
      <Modal
        sx={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Alert severity="warning" sx={{ p: 3, maxWidth: 400 }}>
          <Stack spacing={3}>
            <Typography>Clearing your token will remove it from storage and disconnect this app from the spacetraders api.</Typography>

            <Box sx={{ display: 'flex', alignItems: 'end', justifyContent: 'end', width: '100%', gap: 2 }}>
              <Button
                variant="contained"
                onClick={() => {
                  setOpen(false)
                  persistToken('')
                }}
              >
                Clear
              </Button>
              <Button onClick={() => setOpen(false)} variant="outlined">
                Cancel
              </Button>
            </Box>
          </Stack>
        </Alert>
      </Modal>
    </>
  )
}
