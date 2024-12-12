'use client'

// React Imports
import { useEffect, useState } from 'react'

// MUI Imports
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import Grid from '@mui/material/Grid'
import InputAdornment from '@mui/material/InputAdornment'
import IconButton from '@mui/material/IconButton'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import { Snackbar, Alert } from '@mui/material'

import { useSession } from 'next-auth/react'

import ChangePasswordModal from '../security/ChangePasswordModal'

import { login } from '@/service/authService'

//Component Imports
import CustomTextField from '@core/components/mui/TextField'

const ChangePasswordCard = () => {
  const { data: session, status } = useSession()
  const [userData, setUserData] = useState(null)
  const [isCurrentPasswordShown, setIsCurrentPasswordShown] = useState(false)
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isPasswordChangeEnabled, setIsPasswordChangeEnabled] = useState(false);
  const [message, setMessage] = useState('');
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarSeverity, setSnackbarSeverity] = useState('error');
  const [isValidateButtonDisabled, setIsValidateButtonDisabled] = useState(false);
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (session) {
      setUserData(session.user)
    }
  }, [session])

  const handleOpen = () => {
    setOpen(true);
  }

  const handleClose = () => {
    setOpen(false);
  }

  const handleClickShowCurrentPassword = () => {
    setIsCurrentPasswordShown(!isCurrentPasswordShown)
  }

  const handleCloseSnackbar = () => {
    setOpenSnackbar(false);
  }

  const handleValidatePassword = async (e) => {
    e.preventDefault();

    if (!session?.user?.email) {
      setMessage('No se puede obtener el email del usuario');
      setOpenSnackbar(true);

      return;
    }

    try {
      await login({
        email: session.user.email,
        password: currentPassword
      });

      setMessage('Contraseña actual válida. Puedes cambiar la contraseña.');
      setSnackbarSeverity('success')
      setIsPasswordChangeEnabled(true);
      setIsValidateButtonDisabled(true);
    } catch (error) {
      setMessage('Contraseña actual incorrecta.');
      setSnackbarSeverity('error');
      setIsPasswordChangeEnabled(false);
    } finally {
      setOpenSnackbar(true);
    }
  };

  return (
    <Card>
      <CardHeader title='Actualización de Contraseña' />
      <CardContent>
        <form onSubmit={handleValidatePassword} >
          <Grid container spacing={6}>
            <Grid item xs={12} sm={6}>
              <CustomTextField
                fullWidth
                label='Contraseña Actual'
                type={isCurrentPasswordShown ? 'text' : 'password'}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position='end'>
                      <IconButton
                        edge='end'
                        onClick={handleClickShowCurrentPassword}
                        onMouseDown={e => e.preventDefault()}
                      >
                        <i className={isCurrentPasswordShown ? 'tabler-eye-off' : 'tabler-eye'} />
                      </IconButton>
                    </InputAdornment>
                  )
                }}
              />
            </Grid>
          </Grid>
          <Grid container className='mbs-0' spacing={6}>
            <Grid item xs={12} className='flex gap-4'>
              <Button
                variant='contained'
                type='submit'
                disabled={isValidateButtonDisabled}
              >
                Validar
              </Button>

              {isPasswordChangeEnabled && (
                <Button
                  variant="contained"
                  onClick={handleOpen}
                  style={{ marginLeft: '8px' }}
                >
                  Cambiar Contraseña
                </Button>
              )}
            </Grid>
          </Grid>
        </form>
      </CardContent>

      <Snackbar open={openSnackbar} autoHideDuration={4000} onClose={handleCloseSnackbar}>
        <Alert onClose={handleCloseSnackbar} severity={snackbarSeverity} sx={{ width: '100%' }}>
          {message}
        </Alert>
      </Snackbar>

      <ChangePasswordModal
        open={open}
        handleClose={handleClose}
        userId={userData?.id}
      />
    </Card>
  )
}

export default ChangePasswordCard
