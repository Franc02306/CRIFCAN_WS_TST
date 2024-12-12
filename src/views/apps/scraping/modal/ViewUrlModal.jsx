'use client'

import React, { useCallback, useEffect, useState } from 'react'

import { Alert, IconButton, InputAdornment, Snackbar, Typography } from '@mui/material'

import Dialog from '@mui/material/Dialog'
import Button from '@mui/material/Button'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import TextField from '@mui/material/TextField'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import Select from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'
import Tabs from '@mui/material/Tabs'
import Tab from '@mui/material/Tab'
import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid'

import { Visibility, VisibilityOff } from '@mui/icons-material'

import { useTheme } from '@emotion/react'

import DialogCloseButton from '@components/dialogs/DialogCloseButton'

const ViewUrlModal = ({ url, open, onClose }) => {
  const [snackbarOpen, setSnackbarOpen] = useState(false)

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(url)
      setSnackbarOpen(true)
    } catch (error) {
      console.error('Error al copiar el enlace: ', error)
    }
  }

  const handleSnackbarClose = () => {
    setSnackbarOpen(false)
  }

  return (
    <>
      <Dialog
        fullWidth
        maxWidth='md'
        open={open}
        PaperProps={{ style: { overflow: 'visible' } }}
        onClose={(event, reason) => {
          if (reason !== 'backdropClick') {
            onClose()
          }
        }}
      >
        <DialogCloseButton onClick={onClose} disableRipple>
          <i className='tabler-x' />
        </DialogCloseButton>

        <DialogTitle sx={{ fontSize: '23px' }}>Enlace Web Completo</DialogTitle>

        <DialogContent dividers>
          <Box
            component={Grid}
            container
            sx={{
              width: '100%',
              display: 'flex',
              justifyContent: 'center', // Centrado vertical
              alignItems: 'center',
              height: '20vh' // ESTO AYUDA A POSICIONAR VERTICALMENTE CENTRALMENTE
            }}
          >
            <Typography sx={{ fontSize: '17px', wordBreak: 'break-all' }}>{url}</Typography>
          </Box>
        </DialogContent>

        {/* BOTÓN CANCELAR */}
        <DialogActions sx={{ marginTop: 5 }}>
          <Button onClick={onClose} color='error' variant='outlined'>
            Cerrar
          </Button>
          <Button onClick={handleCopyLink} variant='outlined'>
						Copiar Enlace
					</Button>
        </DialogActions>
      </Dialog>

      {/* SNACKBAR PARAA EL MENSAJE DE COPIA */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={handleSnackbarClose}
          severity='success'
          sx={{
            width: '100%',
            backgroundColor: 'rgba(100, 255, 165, 0.7)',
            color: '#000',
            fontWeight: '600',
            boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.9)'
          }}
        >
          Enlace copiado al portapapeles.
        </Alert>
      </Snackbar>
    </>
  )
}

export default ViewUrlModal
