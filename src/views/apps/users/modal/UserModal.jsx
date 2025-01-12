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
import { addUser, updateUserById } from '../../../../service/userService'

const initialData = {
  password: '',
  username: '',
  last_name: '',
  email: '',
  system_role: '',
  is_active: true
}

const UserModal = ({ open, setIsModalOpen, onClose, onUserAdded, user, mode }) => {
  const [formData, setFormData] = useState(initialData)
  const [warnMessage, setWarnMessage] = useState('')
  const [openWarnSnackbar, setOpenWarnSnackbar] = useState(false)
  const [infoMessage, setInfoMessage] = useState('')
  const [openInfoSnackbar, setOpenInfoSnackbar] = useState(false)
  const [errorMessage, setErrorMessage] = useState(null)
  const [openErrorSnackbar, setOpenErrorSnackbar] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
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

  const handleClickShowPassword = () => setShowPassword(show => !show)
  const handleClickShowConfirmPassword = () => setShowConfirmPassword(show => !show)

  useEffect(() => {
    if (open && isEditMode && user) {
      setFormData(user) // Carga los datos del usuario solo si el modal está abierto y es edición
    } else if (open && !isEditMode) {
      resetForm() // Limpia el formulario en modo creación
    }
  }, [open, user, isEditMode])

  const handleCloseModal = () => {
    resetForm()
    setIsModalOpen(false)
  }

  const validateAndShowWarnings = () => {
    if (!formData.username) {
      setWarnMessage('El campo Nombres es obligatorio.')
      setOpenWarnSnackbar(true)

      return false
    }

    if (!formData.last_name) {
      setWarnMessage('El campo Apellidos es obligatorio.')
      setOpenWarnSnackbar(true)

      return false
    }

    if (!formData.email) {
      setWarnMessage('El campo Correo Electrónico es obligatorio.')
      setOpenWarnSnackbar(true)

      return false
    }

    if (!formData.system_role) {
      setWarnMessage('El campo Rol de Sistema es obligatorio.')
      setOpenWarnSnackbar(true)

      return false
    }

    if (!isEditMode && !formData.password) {
      setWarnMessage('El campo Contraseña es obligatorio.')
      setOpenWarnSnackbar(true)

      return false
    }

    return true
  }

  const handleCloseInfoSnackbar = () => {
    setOpenInfoSnackbar(false)
  }

  const handleCloseWarningSnackbar = () => {
    setOpenWarnSnackbar(false)
  }

  const handleCloseErrorSnackbar = () => {
    setOpenErrorSnackbar(false)
  }

  const validateEmail = value => {
    const maxLength = 200

    if (value.length > maxLength) {
      setInfoMessage('Longitud máxima alcanzada: 200 caracteres en el campo Correo Electrónico.')
      setOpenInfoSnackbar(true)

      return false
    }

    return true
  }

  const validatePassword = (password) => {
    const errors = [];

    if (!password) {
      errors.push("El campo Contraseña es obligatorio.");
    } else {
      if (!/[A-Z]/.test(password)) {
        errors.push("La contraseña debe contener al menos una letra mayúscula.");
      }

      if (!/[a-z]/.test(password)) {
        errors.push("La contraseña debe contener al menos una letra minúscula.");
      }

      if (!/[0-9]/.test(password)) {
        errors.push("La contraseña debe contener al menos un número.");
      }

      if (!/[@$!%*?&#_]/.test(password)) {
        errors.push("La contraseña debe contener al menos un carácter especial (ej. @$!%*?&_).");
      }

      if (/[^A-Za-z0-9@$!%*?&#_]/.test(password)) {
        errors.push("La contraseña contiene caracteres no permitidos.");
      }

      if (password.length < 6) {
        errors.push("La contraseña debe tener al menos 6 caracteres.");
      }

      if (password.length > 100) {
        errors.push("La contraseña no debe exceder los 100 caracteres.");
      }
    }

    return errors;
  };

  const handleUsernameChange = (e) => {
    const value = e.target.value;
    const regex = /^[a-zA-ZÀ-ÿ\u00f1\u00d1\s]*$/;
    const maxLength = 100;

    if (value.length > maxLength) {
      setInfoMessage(`Longitud máxima alcanzada: ${maxLength} caracteres en el campo Nombres.`);
      setOpenInfoSnackbar(true);

      return;
    }

    if (!regex.test(value)) {
      setInfoMessage("El campo Nombres solo puede contener letras.");
      setOpenInfoSnackbar(true);

      return;
    }

    setFormData({ ...formData, username: value });
  };

  const handleLastNameChange = (e) => {
    const value = e.target.value;
    const regex = /^[a-zA-ZÀ-ÿ\u00f1\u00d1\s]*$/;
    const maxLength = 100;

    if (value.length > maxLength) {
      setInfoMessage(`Longitud máxima alcanzada: ${maxLength} caracteres en el campo Apellidos.`);
      setOpenInfoSnackbar(true);

      return;
    }

    if (!regex.test(value)) {
      setInfoMessage("El campo Apellidos solo puede contener letras.");
      setOpenInfoSnackbar(true);

      return;
    }

    setFormData({ ...formData, last_name: value });
  };

  const handleEmailChange = e => {
    const value = e.target.value

    if (validateEmail(value)) {
      setFormData({ ...formData, email: value })
    }
  }

  const validateEmailOnSubmit = (email) => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.(com|org|net|edu|gov|mil|co|io|ai)$/;

    return emailRegex.test(email);
  };

  const handleSubmit = async () => {
    if (isSubmitting) return

    setIsSubmitting(true)

    if (!validateAndShowWarnings()) {
      setIsSubmitting(false)

      return
    }

    if (!validateEmailOnSubmit(formData.email)) {
      setWarnMessage('El correo electrónico tiene un formato inválido.');
      setOpenWarnSnackbar(true);
      setIsSubmitting(false);

      return;
    }

    const passwordErrors = isEditMode && !formData.password ? [] : validatePassword(formData.password);

    if (passwordErrors.length > 0) {
      setWarnMessage(passwordErrors.join(" "));
      setOpenWarnSnackbar(true);
      setIsSubmitting(false);

      return;
    }

    const payload = {
      ...formData,
      system_role: parseInt(formData.system_role)
    }

    if (isEditMode && !formData.password) {
      delete payload.password
    }

    try {
      if (isEditMode) {
        await updateUserById(user.id, payload)

        Swal.fire({
          icon: 'success',
          html: `<span style="font-family: Arial, sans-serif; font-size: 26px; color: ${titleColor};">Usuario actualizado correctamente</span>`,
          confirmButtonColor: confirmButtonColor,
          confirmButtonText: 'Aceptar',
          background: backgroundColor,
          timer: 4000
        })
      } else {
        await addUser(payload)

        Swal.fire({
          icon: 'success',
          html: `<span style="font-family: Arial, sans-serif; font-size: 26px; color: ${titleColor};">Usuario creado correctamente</span>`,
          confirmButtonColor: confirmButtonColor,
          confirmButtonText: 'Aceptar',
          background: backgroundColor,
          timer: 4000
        })
      }

      onUserAdded() // Refrescar lista de usuarios
      handleCloseModal() // Cerrar el modal
    } catch (error) {
      console.error('Error en la solicitud: ', error)

      // Dividir los mensajes por '|', obteniendo el último mensaje
      const errorMessages = error.split('|').map(msg => msg.trim())

      // Obtener el último mensaje de error
      const lastErrorMessage = errorMessages[errorMessages.length - 1]

      // Mostrar el último mensaje en el Snackbar de errores
      setErrorMessage(lastErrorMessage)
      setOpenErrorSnackbar(true)
    } finally {
      setIsSubmitting(false) // Desbloquear botón al terminar la solicitud
    }
  }

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
          {isEditMode ? 'Editar Usuario' : 'Agregar Usuario'}
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
              height: '65vh' // ESTO AYUDA A POSICIONAR VERTICALMENTE CENTRALMENTE
            }}
          >
            <Grid item xs={12} sx={{ mt: 3 }}>
              <TextField
                autoFocus
                autoComplete='off'
                margin='dense'
                variant='outlined'
                label='Nombres'
                type='text'
                name='username'
                value={formData.username}
                onChange={handleUsernameChange}
                inputProps={{ maxLength: 101 }}
                fullWidth
                disabled={isSubmitting}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                autoComplete='off'
                margin='dense'
                variant='outlined'
                label='Apellidos'
                type='text'
                name='last_name'
                value={formData.last_name}
                onChange={handleLastNameChange}
                inputProps={{ maxLength: 101 }}
                fullWidth
                disabled={isSubmitting}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                autoComplete='off'
                margin='dense'
                variant='outlined'
                label='Correo Electrónico'
                name='email'
                value={formData.email}
                onChange={handleEmailChange}
                type='email'
                inputProps={{ maxLength: 201 }}
                fullWidth
                disabled={isSubmitting}
              />
            </Grid>
            <Grid item xs={12} sx={{ marginTop: '5px', marginBottom: '5px' }}>
              <FormControl fullWidth>
                <InputLabel>Rol del Sistema</InputLabel>
                <Select
                  value={formData.system_role}
                  onChange={e => setFormData({ ...formData, system_role: e.target.value })}
                  label='Rol de Sistema'
                  disabled={isSubmitting}
                >
                  <MenuItem value={1}>Administrador del sistema</MenuItem>
                  <MenuItem value={2}>Funcionario</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sx={{ mb: 3 }}>
              <FormControl fullWidth variant='outlined'>
                <TextField
                  label='Contraseña'
                  value={formData.password}
                  onChange={e => setFormData({ ...formData, password: e.target.value })}
                  type={showPassword ? 'text' : 'password'}
                  autoComplete='new-password'
                  disabled={isSubmitting}
                  InputProps={{
                    endAdornment: (
                      <IconButton onClick={handleClickShowPassword}>
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    )
                  }}
                />
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
          {errorMessage} {/* Mostrar el mensaje de error */}
        </Alert>
      </Snackbar>

      {/* Snackbar para mostrar la información de límite de caracteres */}
      <Snackbar
        open={openInfoSnackbar}
        autoHideDuration={4000}
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
    </>
  )
}

export default UserModal
