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
import { List, ListItem, ListItemAvatar, ListItemText, Avatar, InputAdornment, IconButton, Checkbox, Snackbar, Alert, TablePagination, Autocomplete } from '@mui/material'
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import { Visibility, VisibilityOff } from '@mui/icons-material';

import Swal from 'sweetalert2'

import { useTheme } from '@emotion/react'

import DialogCloseButton from '@components/dialogs/DialogCloseButton'

import { getCountry } from '@/service/userService'
import { addInstitution, editInstitutionById, getInstitutionById } from '../../../../service/institutionService'

const initialData = {
	name: '',
	country: '',
	acronym: ''
}

const InstitutionModal = ({ institution, open, setOpen, mode, id, handleInstitutionAdded }) => {
	const [error, setError] = useState(null)
	const [openSnackbar, setOpenSnackbar] = useState(false)
	const [formData, setFormData] = useState(initialData)
	const [countries, setCountries] = useState([]) // LISTA DE LOS VALORES DE PAISES
	const [infoMessage, setInfoMessage] = useState('')
	const [openInfoSnackbar, setOpenInfoSnackbar] = useState(false)
	const [snackbarMessage, setSnackbarMessage] = useState(''); // Estado para el mensaje del Snackbar
	const [snackbarSeverity, setSnackbarSeverity] = useState('info'); // Estado para la severidad ('success', 'error', 'info', 'warning')

	const [institutionData, setInstitutionData] = useState(institution)

	// ALERTAS DE ERROR
	const [errorInstitutionName, setErrorInstitutionName] = useState(false);
	const [errorInstitutionCountry, setErrorInstitutionCountry] = useState(false);
	const [errorInstitutionAcronym, setErrorInstitutionAcronym] = useState(false);

	const theme = useTheme()

	const updateInstitution = useCallback(async () => {
		if (id) {
			const response = await getInstitutionById(id)

			setInstitutionData(response.data)
		}
	}, [id])

	useEffect(() => {
		if (id) {
			updateInstitution()
		}
	}, [id, updateInstitution])

	const getCountries = async () => {
		try {
			const response = await getCountry();

			setCountries(response.data.results);
		} catch (error) {
			console.error('Error en la solicitud:', error);
		}
	};

	useEffect(() => {
		getCountries()
	}, [])

	useEffect(() => {
		if (open && mode === 'edit' && institutionData) {
			setFormData({
				name: institutionData?.name || '',
				country: institutionData?.country.id || '',
				acronym: institutionData?.acronym || ''
			});
		} else if (open && mode !== 'edit') {
			setFormData(initialData)
		}
	}, [open, mode, institutionData])

	const handleSubmit = async (event) => {
		event.preventDefault();

		const titleColor = theme.palette.mode === 'dark' ? '#FFFFFF' : '#000000'
		const backgroundColor = theme.palette.background.paper
		const confirmButtonColor = theme.palette.primary.main

		// Reiniciar todos los errores
		setErrorInstitutionName(false);
		setErrorInstitutionCountry(false);
		setErrorInstitutionAcronym(false);

		if (!formData.name) {
			setErrorInstitutionName(true);

			return;
		}

		if (!formData.acronym) {
			setErrorInstitutionAcronym(true);

			return;
		}

		if (!formData.country) {
			setErrorInstitutionCountry(true);

			return;
		}

		try {
			let updatedInstitution;

			if (mode === 'edit') {
				updatedInstitution = await editInstitutionById(id, formData);
			} else {
				updatedInstitution = await addInstitution(formData);
			}

			setOpen(false);

			await Swal.fire({
				html: `<span style="font-family: Arial, sans-serif; font-size: 28px; color: ${titleColor};">Institución ${mode === 'edit' ? 'actualizada' : 'creada'} exitosamente</span>`,
				icon: 'success',
				confirmButtonText: 'Aceptar',
				confirmButtonColor: confirmButtonColor,
				background: backgroundColor,
				timer: 4000,
			});

			handleInstitutionAdded(updatedInstitution.data);

			setFormData(initialData);
		} catch (error) {
			console.error('Error al procesar solicitud: ', error)
			setError('Error al procesar la solicitud')
			setSnackbarSeverity('error')
			setSnackbarMessage('Error al procesar la solicitud')
			setOpenSnackbar(true)
		}
	}

	const handleCloseSnackbar = () => {
		setOpenSnackbar(false);
	}

	const validateInstitutionName = (value) => {
		const maxLength = 400;

		if (value.length > maxLength) {
			setInfoMessage('Longitud máxima alcanzada: 400 caracteres en el campo Nombre');
			setOpenInfoSnackbar(true);

			return false;
		}

		return true;
	};

	const validateInstitutionAcronym = (value) => {
		const maxLength = 20;

		if (value.length > maxLength) {
			setInfoMessage('Longitud máxima alcanzada: 20 caracteres en el campo Siglas')
			setOpenInfoSnackbar(true);

			return false;
		}

		return true;
	}

	const handleInstitutionNameChange = (e) => {
		const value = e.target.value;

		if (validateInstitutionName(value)) {
			setFormData({ ...formData, name: value });
		}
	};

	const handleInstitutionAcronymChange = (e) => {
		const value = e.target.value;

		if (validateInstitutionAcronym(value)) {
			setFormData({ ...formData, acronym: value });
		}
	};

	const handleCloseInfoSnackbar = () => {
		setOpenInfoSnackbar(false);
	}

	const handleClose = () => {
		if (mode === 'edit' && institutionData) {
			setFormData({
				name: institutionData?.name || '',
				country: institutionData?.country.description || ''
			});
		} else {
			setFormData(initialData);
		}

		setOpen(false);
	};

	useEffect(() => {
		if (open && mode === 'edit' && id) {
			updateInstitution();
		}
	}, [open, mode, id])

	return (
		<Dialog
			fullWidth
			open={open}
			onClose={(event, reason) => {
				if (reason !== 'backdropClick') {
					setOpen(false);
				}
			}}
			maxWidth="LG"
			scroll="body"
			sx={{
				'& .MuiDialog-paper': {
					height: '80vh',       // Ajusta la altura al 80% de la pantalla
					maxHeight: '80vh',    // Define una altura máxima
					overflow: 'visible',
				},
			}}
		>
			<DialogCloseButton onClick={() => setOpen(false)} disableRipple>
				<i className='tabler-x' />
			</DialogCloseButton>

			{/* TITULO SEGUN DEL MODAL EL MODO */}
			<DialogTitle
				variant='h4'
				className='flex gap-2 flex-col text-center'
				sx={{ marginBottom: '0.5px' }}
			>
				{mode === 'edit' ? 'Editar Institucíon' : 'Agregar Institución'}
			</DialogTitle>

			<Grid container spacing={2}>
				<Grid item xs={12}>
					<form onSubmit={handleSubmit}>
						<DialogContent dividers>
							<Grid
								container
								spacing={{ xs: 2, sm: 3, md: 4, lg: 5 }}
								sx={{
									width: '100%',
									display: 'flex',
									justifyContent: 'center', // Centrado vertical
									height: '55vh', // ESTO AYUDA A POSICIONAR VERTICALMENTE CENTRALMENTE
								}}
							>
								<Grid item xs={12} sx={{ mt: 10 }}>
									<FormControl fullWidth variant='outlined'>
										<TextField
											label='Nombre'
											value={formData.name}
											onChange={handleInstitutionNameChange}
											inputProps={{ maxLength: 401 }}
											autoComplete='off'
										/>
									</FormControl>
								</Grid>
								<Grid item xs={12}>
									<FormControl fullWidth variant='outlined'>
										<TextField
											label='Siglas'
											value={formData.acronym}
											onChange={handleInstitutionAcronymChange}
											inputProps={{ maxLength: 21 }}
											autoComplete='off'
										/>
									</FormControl>
								</Grid>
								<Grid item xs={12}>
									<FormControl fullWidth variant='outlined'>
										<InputLabel>País</InputLabel>
										<Select
											value={formData.country}
											onChange={(e) => setFormData({ ...formData, country: e.target.value })}
											label="País"
										>
											{countries.map((country) => (
												<MenuItem key={country.id} value={country.id}>
													{country.description}
												</MenuItem>
											))}
										</Select>
									</FormControl>
								</Grid>
							</Grid>
						</DialogContent>
					</form>
				</Grid>
			</Grid>

			{/* Snackbar para mostrar campos faltantes */}
			<Snackbar
				open={errorInstitutionName}
				autoHideDuration={4000}
				onClose={() => setErrorInstitutionName(false)}
			>
				<Alert
					onClose={() => setErrorInstitutionName(false)}
					severity='warning'
					sx={{
						width: '100%',
						backgroundColor: 'rgba(255, 165, 100, 0.7)', // Color sólido para warning
						color: '#000',
						fontWeight: '600',
						boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.9)',
					}}
				>
					El campo Nombre es obligatorio.
				</Alert>
			</Snackbar>

			{/* Snackbar para mostrar campos faltantes */}
			<Snackbar
				open={errorInstitutionAcronym}
				autoHideDuration={4000}
				onClose={() => setErrorInstitutionAcronym(false)}
			>
				<Alert
					onClose={() => setErrorInstitutionAcronym(false)}
					severity='warning'
					sx={{
						width: '100%',
						backgroundColor: 'rgba(255, 165, 100, 0.7)', // Color sólido para warning
						color: '#000',
						fontWeight: '600',
						boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.9)',
					}}
				>
					El campo Siglas es obligatorio.
				</Alert>
			</Snackbar>

			{/* Snackbar para mostrar campos faltantes */}
			<Snackbar
				open={errorInstitutionCountry}
				autoHideDuration={4000}
				onClose={() => setErrorInstitutionCountry(false)}
			>
				<Alert
					onClose={() => setErrorInstitutionCountry(false)}
					severity='warning'
					sx={{
						width: '100%',
						backgroundColor: 'rgba(255, 165, 100, 0.7)', // Color sólido para warning
						color: '#000',
						fontWeight: '600',
						boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.9)',
					}}
				>
					El campo País es obligatorio.
				</Alert>
			</Snackbar>

			{/* Snackbar para mostrar la información de límite de caracteres */}
			<Snackbar
				open={openSnackbar}
				autoHideDuration={4000}
				onClose={handleCloseSnackbar}
			>
				<Alert onClose={handleCloseSnackbar} severity={snackbarSeverity} sx={{ width: '100%' }}>
					{snackbarMessage}
				</Alert>
			</Snackbar>

			<Snackbar
				open={openInfoSnackbar}
				autoHideDuration={4000}
				onClose={handleCloseInfoSnackbar}
			>
				<Alert
					onClose={handleCloseInfoSnackbar}
					severity='info'
					sx={{
						width: '100%',
						backgroundColor: 'rgba(100, 200, 255, 0.8)',
						color: '#000',
						fontWeight: '600',
						boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.9)',
					}}
				>
					{infoMessage}
				</Alert>
			</Snackbar>

			{/* BOTONES */}
			<DialogActions>
				<Button onClick={handleClose} color='error' variant="outlined">
					Cerrar
				</Button>
				<Button onClick={handleSubmit} variant='contained' color='primary'>
					{mode === 'edit' ? 'Actualizar' : 'Agregar'}
				</Button>
			</DialogActions>
		</Dialog>
	)
}

export default InstitutionModal
