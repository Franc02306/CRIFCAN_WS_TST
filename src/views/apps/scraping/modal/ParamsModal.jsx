'use client'

import React, { useCallback, useEffect, useState } from 'react'

import { Alert, IconButton, InputAdornment, Snackbar } from '@mui/material'

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

import Swal from 'sweetalert2'

import { useTheme } from '@emotion/react'

import DialogCloseButton from '@components/dialogs/DialogCloseButton'

// IMPORTACION DE SERVICIOS API
import { addUrl, updateUrl } from '../../../../service/scraperService'

const initialData = {
  url: '',
  time_choices: '',
  sobrenombre: ''
}

const ParamsModal = ({ open, setIsModalOpen, onClose, web, mode, fetchWebSites }) => {
  const [formData, setFormData] = useState(initialData)
  const [warnMessage, setWarnMessage] = useState('')
  const [infoMessage, setInfoMessage] = useState('')
  const [openInfoSnackbar, setOpenInfoSnackbar] = useState(false)
  const [openWarnSnackbar, setOpenWarnSnackbar] = useState(false)
  const [error, setError] = useState(null)
  const [openErrorSnackbar, setOpenErrorSnackbar] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const isEditMode = mode === 'edit'

  // TEMAS
  const theme = useTheme()
  const titleColor = theme.palette.mode === 'dark' ? '#FFFFFF' : '#000000'
  const backgroundColor = theme.palette.background.paper
  const confirmButtonColor = theme.palette.primary.main

  const resetForm = () => {
    setFormData(initialData)
  }

  useEffect(() => {
    if (open && isEditMode && web) {
      setFormData(web) // Carga los datos del usuario solo si el modal está abierto y es edición
    } else if (open && !isEditMode) {
      resetForm() // Limpia el formulario en modo creación
    }
  }, [open, web, isEditMode])

  const handleCloseModal = () => {
    resetForm()
    setIsModalOpen(false)
  }

  const validateAndShowWarnings = () => {
    if (!formData.url) {
      setWarnMessage('El campo Enlace Web es obligatorio.')
      setOpenWarnSnackbar(true)

      return false
    }

    if (!formData.sobrenombre) {
      setWarnMessage('El campo Sobrenombre es obligatorio.')
      setOpenWarnSnackbar(true)

      return false
    }

    if (!formData.time_choices) {
      setWarnMessage('El campo Frecuencia de Scrapeo es obligatorio.')
      setOpenWarnSnackbar(true)

      return false
    }

    return true
  }

  const handleCloseWarningSnackbar = () => {
    setOpenWarnSnackbar(false)
  }

  const handleCloseInfoSnackbar = () => {
    setOpenInfoSnackbar(false)
  }

  const handleCloseErrorSnackbar = () => {
    setOpenErrorSnackbar(false)
  }

  const handleSubmit = async () => {
    if (isSubmitting) return

    setIsSubmitting(true)

    if (!validateAndShowWarnings()) {
      setIsSubmitting(false)

      return
    }

    const payload = {
      ...formData
    }

    try {
      if (isEditMode) {
        await updateUrl(web.id, payload)

        Swal.fire({
          icon: 'success',
          html: `<span style="font-family: Arial, sans-serif; font-size: 26px; color: ${titleColor};">Enlace Web actualizado correctamente</span>`,
          confirmButtonColor: confirmButtonColor,
          confirmButtonText: 'Aceptar',
          background: backgroundColor,
          timer: 4000
        })
      } else {
        await addUrl(payload)

        Swal.fire({
          icon: 'success',
          html: `<span style="font-family: Arial, sans-serif; font-size: 26px; color: ${titleColor};">Enlace Web creado correctamente</span>`,
          confirmButtonColor: confirmButtonColor,
          confirmButtonText: 'Aceptar',
          background: backgroundColor,
          timer: 4000
        })
      }

      fetchWebSites()
      handleCloseModal()
    } catch (error) {
      console.error('Error en la solicitud: ', error)
      setError(error)
      setOpenErrorSnackbar(true)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSobrenombreChange = (e) => {
    let value = e.target.value;

    value = value.replace(/ /g, '_');

    const validRegex = /^[A-Za-z0-9_]*$/;

    if (!validRegex.test(value)) {
      setInfoMessage('El campo Sobrenombre solo puede contener letras, números y guiones bajos.');
      setOpenInfoSnackbar(true);

      return;
    }

    if (value.length > 30) {
      setInfoMessage('Longitud máxima alcanzada: 30 caracteres en el campo Sobrenombre.');
      setOpenInfoSnackbar(true);

      return;
    }

    setFormData({ ...formData, sobrenombre: value });
  };

  return (
    <>
      <Dialog
        open={open}
        onClose={(event, reason) => {
          if (reason !== 'backdropClick') {
            handleCloseModal()
          }
        }}
        fullWidth
        maxWidth='xl'
        sx={{
          '& .MuiDialog-paper': {
            height: '90vh', // Ajusta la altura al 80% de la pantalla
            maxHeight: '90vh', // Define una altura máxima
            overflow: 'visible'
          }
        }}
        PaperProps={{ style: { overflow: 'visible' } }}
      >
        <DialogCloseButton onClick={handleCloseModal} disableRipple>
          <i className='tabler-x' />
        </DialogCloseButton>

        {/* TITULO SEGUN DEL MODAL EL MODO */}
        <DialogTitle variant='h4' className='flex gap-2 flex-col text-center'>
          {isEditMode ? 'Editar Fuente Web' : 'Agregar Fuente Web'}
        </DialogTitle>

        <DialogContent dividers>
          <Box
            component={Grid}
            container
            spacing={{ xs: 2, sm: 3, md: 4, lg: 10 }}
            sx={{
              width: '100%',
              display: 'flex',
              justifyContent: 'center', // Centrado vertical
              height: '67vh' // ESTO AYUDA A POSICIONAR VERTICALMENTE CENTRALMENTE
            }}
          >
            <Grid item xs={12} sx={{ mt: 10 }}>
              <TextField
                autoComplete='off'
                margin='dense'
                variant='outlined'
                label='Enlace Web'
                type='text'
                name='url'
                value={formData.url}
                onChange={e => setFormData({ ...formData, url: e.target.value })}
                fullWidth
                disabled
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                autoComplete='off'
                margin='dense'
                variant='outlined'
                label='Sobrenombre'
                type='text'
                name='sobrenombre'
                value={formData.sobrenombre}
                onChange={handleSobrenombreChange}
                fullWidth
              />
            </Grid>
            <Grid item xs={12} sx={{ marginTop: '5px', marginBottom: '5px' }}>
              <FormControl fullWidth>
                <InputLabel>Frecuencia de Scrapeo</InputLabel>
                <Select
                  value={formData.time_choices}
                  onChange={e => setFormData({ ...formData, time_choices: e.target.value })}
                  label='Frecuencia de Scrapeo'
                >
                  <MenuItem value={1}>Mensual</MenuItem>
                  <MenuItem value={2}>Trimestral</MenuItem>
                  <MenuItem value={3}>Semestral</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Box>
        </DialogContent>

        <DialogActions sx={{ marginTop: 5 }}>
          <Button onClick={handleCloseModal} color='error' variant='outlined'>
            Cerrar
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting} color='primary' variant='contained'>
            {isSubmitting ? (isEditMode ? 'Actualizando...' : 'Creando...') : isEditMode ? 'Actualizar' : 'Crear'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar para mostrar campos obligatorios */}
      <Snackbar
        open={openWarnSnackbar}
        autoHideDuration={3000}
        onClose={handleCloseWarningSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={handleCloseWarningSnackbar}
          severity='warning'
          sx={{
            width: '100%',
            backgroundColor: 'rgba(255, 165, 100, 0.7)',
            color: '#000',
            fontWeight: '600',
            boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.9)'
          }}
        >
          {warnMessage}
        </Alert>
      </Snackbar>

      {/* Snackbar para mostrar info */}
      <Snackbar
        open={openInfoSnackbar}
        autoHideDuration={3000}
        onClose={handleCloseInfoSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={handleCloseInfoSnackbar}
          severity='info'
          sx={{
            width: '100%',
            backgroundColor: 'rgba(100, 200, 255, 0.8)',
            color: '#000',
            fontWeight: '600',
            boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.9)'
          }}
        >
          {infoMessage}
        </Alert>
      </Snackbar>

      {/* Snackbar para mostrar errores */}
      <Snackbar
        open={openErrorSnackbar}
        autoHideDuration={3000}
        onClose={handleCloseErrorSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={handleCloseErrorSnackbar}
          severity='error'
          sx={{
            width: '100%',
            backgroundColor: 'rgba(255, 100, 100, 0.8)',
            color: '#000',
            fontWeight: '600',
            boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.9)'
          }}
        >
          {error}
        </Alert>
      </Snackbar>
    </>
  )
}

export default ParamsModal
