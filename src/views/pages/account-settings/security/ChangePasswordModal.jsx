'use client'

import React, { useCallback, useEffect, useState } from 'react'

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
import { Alert, IconButton, InputAdornment, Snackbar } from '@mui/material'
import { Visibility, VisibilityOff } from '@mui/icons-material'
import Swal from 'sweetalert2'

import { updateUserByIdPatch } from '../../../../service/userService'

const ChangePasswordModal = ({ open, handleClose, userId }) => {
	const [password, setPassword] = useState('')
	const [confirmPassword, setConfirmPassword] = useState('')
	const [error, setError] = useState(null);
	const [openSnackbar, setOpenSnackbar] = useState(false)
	const [showPassword, setShowPassword] = useState(false)
	const [showConfirmPassword, setShowConfirmPassword] = useState(false)

	const handleClickShowPassword = () => setShowPassword((show) => !show)
	const handleClickShowConfirmPassword = () => setShowConfirmPassword((show) => !show)

	const handleCloseSnackbar = () => setOpenSnackbar(false)

	const handleSubmitPassword = async () => {
		if (password !== confirmPassword) {
			setError('Las contraseñas no coinciden');
			setOpenSnackbar(true);

			return;
		}

		try {
			const body = { password: password }

			await updateUserByIdPatch(userId, body)

			Swal.fire({
				title: 'Contraseña cambiada exitosamente',
				icon: 'success',
				confirmButtonText: 'Aceptar',
				timer: 4000
			})

			handleClose()
		} catch (error) {
			setError('Error al cambiar la contraseña')
			setOpenSnackbar(true)
		}
	}

	return (
		<Dialog
			open={open}
			onClose={handleClose}
			fullWidth maxWidth="xs"
			sx={{
				'& .MuiDialog-paper': {
					height: '310px'
				}
			}}
		>
			<DialogTitle>Cambiar Contraseña</DialogTitle>
			<DialogContent>
				<TextField
					fullWidth
					margin="dense"
					label="Nueva contraseña"
					type={showPassword ? 'text' : 'password'}
					value={password}
					onChange={e => setPassword(e.target.value)}
					InputProps={{
						endAdornment: (
							<InputAdornment position="end">
								<IconButton onClick={handleClickShowPassword} edge="end">
									{showPassword ? <VisibilityOff /> : <Visibility />}
								</IconButton>
							</InputAdornment>
						)
					}}
				/>
				<TextField
					fullWidth
					margin="dense"
					label="Confirmar Contraseña"
					type={showConfirmPassword ? 'text' : 'password'}
					value={confirmPassword}
					onChange={e => setConfirmPassword(e.target.value)}
					InputProps={{
						endAdornment: (
							<InputAdornment position="end">
								<IconButton onClick={handleClickShowConfirmPassword} edge="end">
									{showConfirmPassword ? <VisibilityOff /> : <Visibility />}
								</IconButton>
							</InputAdornment>
						)
					}}
				/>
			</DialogContent>
			<DialogActions>
				<Button onClick={handleClose} color='secondary'>
					Cerrar
				</Button>
				<Button onClick={handleSubmitPassword} variant='contained' color='primary'>
					Confirmar
				</Button>
			</DialogActions>

			{/* Snackbar para errores */}
			<Snackbar open={openSnackbar} autoHideDuration={4000} onClose={handleCloseSnackbar}>
				<Alert onClose={handleCloseSnackbar} severity="error" sx={{ width: '100%' }}>
					{error}
				</Alert>
			</Snackbar>
		</Dialog>
	)
}

export default ChangePasswordModal
