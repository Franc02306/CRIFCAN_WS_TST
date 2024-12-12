import React, { useCallback, useEffect, useMemo, useState } from 'react'

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
import {
	CircularProgress,
	List,
	ListItem,
	ListItemAvatar,
	ListItemText,
	Avatar,
	InputAdornment,
	IconButton,
	Checkbox,
	Snackbar,
	Alert,
	TablePagination,
	Autocomplete,
	ListItemButton,
	Pagination,
	Typography
} from '@mui/material'
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import { Visibility, VisibilityOff } from '@mui/icons-material';

import Swal from 'sweetalert2'

import { UserPlus } from 'tabler-icons-react'

import { useTheme } from '@emotion/react'

import DialogCloseButton from '@components/dialogs/DialogCloseButton'

import {
	addUser,
	getIdentification,
	getSystemRoles,
	getCountry,
	updateUserById,
	getUserById,
	updateUserByIdPatch
} from '../../../../service/userService'

import { getInstitutions } from '../../../../service/institutionService'

import { getCustomGroups } from '../../../../service/groupService'
import CustomAvatar from '@/@core/components/mui/Avatar'

const TabPanel = ({ children, value, index }) => {
	return (
		<div
			role='tabpanel'
			hidden={value !== index}
		>
			{value === index && <Box p={3}>{children}</Box>}
		</div>
	)
}

const AvatarRectangular = ({ acronym }) => (
	<Avatar
		sx={{
			width: 250,
			height: 40,
			border: '3px dotted', // Borde de 2px
			borderColor: 'primary.main', // Color del borde desde el tema
			fontWeight: 'bold',
			fontSize: 15,
			borderRadius: 1, // Redondeo leve en las esquinas
			boxShadow: 2, // Sombra para dar un efecto más atractivo
			backgroundColor: 'transparent', // Fondo transparente
			display: 'flex', // Centrado del contenido
			alignItems: 'center',
			justifyContent: 'center',
		}}
	>
		{acronym}
	</Avatar>
);

// ESTA DATA TIENE QUE ESTAR CONFORME CON LO QUE ESPERA EL JSON DE LA API POST
const initialData = {
	groups: [],
	system_role: '',
	password: '',
	username: '',
	last_name: '',
	email: '',
	number_identification: '',
	is_active: true,
	identification_type: '',
	country: '',
	institution: ''
}

const countryInstitutionMap = {
	14: [1, 5], // Bolivia (SGCAN, SENASA)
	15: [2, 6], // Colombia (SENASAG, MINCETUR)
	16: [3, 7], // Ecuador (ICA, VCEeL)
	17: [4, 8]  // Perú (AGROCALIDA, MINCIT)
};

const UserModal = (
	{
		open,
		setOpen,
		handleUserAdded,
		id,
		user,
		mode
	}
) => {
	const [error, setError] = useState(null)
	const [openSnackbar, setOpenSnackbar] = useState(false)
	const [identifications, setIdentifications] = useState([])
	const [institutions, setInstitutions] = useState([]) // LISTA DE LOS VALORES DE INSTITUCION
	const [filteredInstitutions, setFilteredInstitutions] = useState([]); // ESTADO PARA ALMACENAR INSTITUCIONES FILTRADAs
	const [countries, setCountries] = useState([]) // LISTA DE LOS VALORES DE PAISES
	const [formData, setFormData] = useState(initialData)
	const [filteredIdentifications, setFilteredIdentifications] = useState([])
	const [maxDocLength, setMaxDocLength] = useState(Infinity)
	const [tabIndex, setTabIndex] = useState(0) // Estado para manejar la pestaña activa
	const [options, setOptions] = useState([])
	const [rowsPerPage, setRowsPerPage] = useState(5)
	const [infoMessage, setInfoMessage] = useState('')
	const [openInfoSnackbar, setOpenInfoSnackbar] = useState(false)

	// ESTADOS DE CARGANDO
	const [loading, setLoading] = useState(true);
	const [isSubmitting, setIsSubmitting] = useState(false);

	const [userData, setUserData] = useState(user) // DATOS DE USUARIO

	// ROLES DE SISTEMA
	const [roles, setRoles] = useState([]);
	const [selectedRole, setSelectedRole] = useState('');

	// PAGINADO DE GRUPOS
	const [groups, setGroups] = useState([])
	const [searchTerm, setSearchTerm] = useState('')
	const [selectedGroup, setSelectedGroup] = useState(null)
	const [page, setPage] = useState(1)
	const groupsPerPage = 10;

	//  ESTADOS PARA CONTROLAR LA VISIBILIDAD DE LA CONTRASEÑA
	const [showPassword, setShowPassword] = useState(false)
	const [showConfirmPassword, setShowConfirmPassword] = useState(false)

	// ALERTAS SNACKBAR
	const [errorUsername, setErrorUsername] = useState(false);
	const [errorLastName, setErrorLastName] = useState(false);
	const [errorEmail, setErrorEmail] = useState(false);
	const [errorCountry, setErrorCountry] = useState(false);
	const [errorInstitution, setErrorInstitution] = useState(false);

	const theme = useTheme()

	const handleClickShowPassword = () => setShowPassword((show) => !show)
	const handleClickShowConfirmPassword = () => setShowConfirmPassword((show) => !show)

	const updateUser = useCallback(async () => {
		if (id) {
			try {
				setLoading(true);

				const response = await getUserById(id)

				setUserData(response.data)
			} catch (error) {
				console.error('Error al obtener los datos del usuario: ', error)
			} finally {
				setLoading(false);
			}
		}
	}, [id])

	useEffect(() => {
		if (open) {
			setTabIndex(0);
			setShowPassword(false);
			setShowConfirmPassword(false);
		}
	}, [open])

	useEffect(() => {
		if (id) {
			updateUser()
		}
	}, [id, updateUser])

	const handleChangeRowsPerPage = (event) => {
		setRowsPerPage(parseInt(event.target.value, 5))
		setPage(0)
	}

	const handleTabChange = (event, newValue) => {
		setTabIndex(newValue)
	}

	const handleGroupSelection = (groupId) => {
		setFormData((prevFormData) => ({
			...prevFormData,

			// Aquí asegúrate de que solo se asignan los IDs de los grupos
			groups: prevFormData.groups.includes(groupId)
				? prevFormData.groups.filter((id) => id !== groupId)
				: [...prevFormData.groups, groupId]
		}));
	};

	const getIdentifications = async () => {
		try {
			setLoading(true);

			const response = await getIdentification();

			setIdentifications(response.data.results);
		} catch (error) {
			console.error('Error en la solicitud:', error);
		} finally {
			setLoading(false);
		}
	};

	const fetchAllActiveGroups = async (url = `/api/models/custom-groups/`, allGroups = []) => {
		try {
			setLoading(true);

			const { data } = await getCustomGroups(url);
			const updatedGroups = [...allGroups, ...data.results];

			if (data.next) {
				return fetchAllActiveGroups(data.next, updatedGroups)
			}

			return updatedGroups;
		} catch (error) {
			console.error('Error al obtener los grupos:', error);
		}
	}

	const fetchAllActiveInstitutions = async (url, allInstitutions = []) => {
		try {
			setLoading(true);

			const { data } = await getInstitutions(url);
			const activeInstitutions = data.results.filter(inst => inst.is_active)
			const updatedInstitutions = [...allInstitutions, ...activeInstitutions];

			if (data.next) {
				return fetchAllActiveInstitutions(data.next, updatedInstitutions);
			}

			return updatedInstitutions.sort((a, b) => a.name.localeCompare(b.name));

			// setInstitutions(response.data.results)

		} catch (error) {
			console.error('Error en la solicitud:', error)

			return allInstitutions
		} finally {
			setLoading(false);
		}
	}

	useEffect(() => {
		const loadGroups = async () => {
			setLoading(true);
			const allGroups = await fetchAllActiveGroups(`/api/models/custom-groups/`);

			setGroups(allGroups);
			setLoading(false);
		};

		loadGroups();
	}, [])

	const filteredGroups = useMemo(() => {
		if (!Array.isArray(groups)) return [];

		const normalizedSearchTerm = searchTerm.trim().toLowerCase();

		return groups.filter(group => {
			const groupName = (group.group_info?.name || '').toLowerCase();
			const groupAcronym = (group.siglas || '').toLowerCase();

			return (
				groupName.includes(normalizedSearchTerm) ||
				groupAcronym.includes(normalizedSearchTerm)
			);
		});
	}, [groups, searchTerm]);

	const paginatedGroups = useMemo(() => {
		const startIndex = (page - 1) * groupsPerPage;
		const endIndex = startIndex + groupsPerPage;

		return filteredGroups.slice(startIndex, endIndex);
	}, [filteredGroups, page, groupsPerPage]);

	const handleChangePage = (event, value) => {
		setPage(value);
	};

	useEffect(() => {
		setPage(1)
	}, [searchTerm])

	useEffect(() => {
		const loadInstitutions = async () => {
			setLoading(true);
			const allInstitutions = await fetchAllActiveInstitutions(`/api/models/institution/`);

			setInstitutions(allInstitutions);
			setFilteredInstitutions(allInstitutions);
			setLoading(false);
		};

		loadInstitutions();
	}, [])

	const getCountries = async () => {
		try {
			setLoading(true);
			const response = await getCountry();

			setCountries(response.data.results);
		} catch (error) {
			console.error('Error en la solicitud:', error);
		} finally {
			setLoading(false);
		}
	};

	const fetchRoles = async () => {
		try {
			setLoading(true);

			const response = await getSystemRoles()

			setRoles(response.data.results)
		} catch (error) {
			console.error('Error al obtener los roles:', error)
		} finally {
			setLoading(false);
		}
	}

	useEffect(() => {
		getIdentifications()
		fetchAllActiveInstitutions()
		getCountries()
		fetchRoles()
	}, [])

	useEffect(() => {
		if (formData.country) {
			const filtered = identifications.filter(ident => {
				return [26, 27].includes(ident.id);  // Aplica la lógica de filtrado para todos
			});

			setFilteredIdentifications(filtered);
		}
	}, [formData.country, identifications]);

	useEffect(() => {
		if (formData.country) {
			const filtered = institutions.filter(
				(inst) => inst.country.id === formData.country // Comparar correctamente con `country.id`
			);

			setFilteredInstitutions(filtered);
		} else {
			setFilteredInstitutions(institutions); // Mostrar todas las instituciones si no hay país seleccionado
		}
	}, [formData.country, institutions]);

	useEffect(() => {
		if (open && mode === 'edit' && userData) {
			setFormData({
				username: userData?.username || '',
				last_name: userData?.last_name || '',
				email: userData?.email || '',
				password: '',
				number_identification: userData?.number_identification || '',
				identification_type: userData?.identification_type?.id || '',
				institution: userData?.institution?.id || '',
				country: userData?.country?.id || '',
				system_role: userData?.system_role?.id || '',
				groups: userData?.assigned_group?.map(group_info => group_info.group_id) || []
			})
			setSelectedRole(userData?.system_role?.id || '')
		} else if (open && mode !== 'edit') {
			setFormData(initialData)
			setSelectedRole('')
		}
	}, [open, mode, userData])

	const capitalizeWords = (text) => {
		return text
			.toLowerCase()
			.split(' ')
			.map(word => word.charAt(0).toUpperCase() + word.slice(1))
			.join(' ');
	};

	const handleSubmit = async (event) => {
		if (isSubmitting) return;

		setIsSubmitting(true);
		event.preventDefault();

		const titleColor = theme.palette.mode === 'dark' ? '#FFFFFF' : '#000000'
		const backgroundColor = theme.palette.background.paper
		const confirmButtonColor = theme.palette.primary.main

		// Reiniciar todos los errores
		setErrorUsername(false);
		setErrorLastName(false);
		setErrorEmail(false);
		setErrorCountry(false);
		setErrorInstitution(false);

		// Validar campos requeridos y mostrar mensajes específicos
		if (!formData.username) {
			setErrorUsername(true);
			setIsSubmitting(false);

			return;
		}

		if (!formData.last_name) {
			setErrorLastName(true);
			setIsSubmitting(false);

			return;
		}

		if (!formData.country) {
			setErrorCountry(true);
			setIsSubmitting(false);

			return;
		}

		if (!formData.institution) {
			setErrorInstitution(true);
			setIsSubmitting(false);

			return;
		}

		if (!formData.email) {
			setErrorEmail(true);
			setIsSubmitting(false);

			return;
		}

		if (!selectedRole) {
			setError('Debe seleccionar un rol del sistema');
			setOpenSnackbar(true);
			setIsSubmitting(false);

			return;
		}

		if (mode === 'edit' && formData.password && formData.password !== formData.confirmPassword) {
			setError('Las contraseñas no coinciden');
			setOpenSnackbar(true);

			return;
		}

		try {
			const updatedFormData = {
				...formData,
				system_role: selectedRole
			}

			if (formData.groups.length > 0) {
				updatedFormData.groups = formData.groups;
			}

			if (formData.password.trim()) {
				updatedFormData.password = formData.password;
			} else if (mode === 'edit') {
				delete updatedFormData.password;  // Eliminar campo solo si está en modo edición
			}

			if (mode === 'edit') {
				await updateUserById(id, updatedFormData);
			} else {
				await addUser(updatedFormData);
				simulateEmailSend(formData.email)
			}

			setOpen(false);

			await Swal.fire({
				html: `<span style="font-family: Arial, sans-serif; font-size: 28px; color: ${titleColor};">Usuario ${mode === 'edit' ? 'actualizado' : 'creado'} exitosamente</span>`,
				icon: 'success',
				confirmButtonText: 'Aceptar',
				confirmButtonColor: confirmButtonColor,
				background: backgroundColor,
				timer: 4000,
			}).then(async () => {
				await handleUserAdded();
			});

			handleUserAdded();
			setFormData(initialData);
		} catch (error) {
			if (error.response && error.response.data.email) {
				const emailErrors = error.response.data.email;

				if (emailErrors.includes("Enter a valid email address.")) {
					setError('Ingrese un correo electrónico válido.');
					setOpenSnackbar(true);
				}

				if (emailErrors.includes("user with this email already exists.")) {
					setError('El correo electrónico ya está en uso.');
					setOpenSnackbar(true);
				}
			} else if (error.response && error.response.data.password) {
				const passwordErrors = error.response.data.password;

				if (passwordErrors.includes("This password is too short. It must contain at least 8 characters.")) {
					setError('La contraseña es demasiado corta. Debe tener al menos 8 caracteres.');
					setOpenSnackbar(true);
				}

				if (passwordErrors.includes("This password is too common.")) {
					setTimeout(() => {
						setError('La contraseña es demasiado común. Elige una contraseña más segura.');
						setOpenSnackbar(true);
					}, 3500);
				}

				if (passwordErrors.includes("The password is too similar to the username.") || passwordErrors.includes("La contraseña es demasiado similar a la de username.")) {
					setError('La contraseña es demasiado similar al campo Nombres.');
					setOpenSnackbar(true);
				}

				if (passwordErrors.includes("The password is too similar to the last name.")) {
					setError('La contraseña es demasiado similar al campo Apellidos.');
					setOpenSnackbar(true);
				}

				if (passwordErrors.includes("This field may not be blank.")) {
					setError('El campo Contraseña es obligatorio.');
					setOpenSnackbar(true);
				}

				if (passwordErrors.includes("This password is entirely numeric.")) {
					setError('La contraseña no puede ser completamente numérica.');
					setOpenSnackbar(true);
				}

			} else {
				setError('Error en la solicitud');
				setOpenSnackbar(true);
			}
		} finally {
			setIsSubmitting(false);
		}
	};

	const simulateEmailSend = (email) => {
		new Promise((resolve) => {

			// Simulación de tarea asíncrona en segundo plano
			setTimeout(() => {
				resolve();
			}, 0); // Ejecuta sin bloquear el flujo
		}).catch((error) => {
			console.error('Error al enviar el correo:', error);
		});
	};

	const handleRoleChange = (event) => {
		setSelectedRole(event.target.value)
	}

	const handleCloseSnackbar = () => {
		setOpenSnackbar(false);
	}

	const validateUsername = (value) => {
		const maxLength = 100;

		if (value.length > maxLength) {
			setInfoMessage('Longitud máxima alcanzada: 100 caracteres en el campo Nombres.');
			setOpenInfoSnackbar(true);

			return false;
		}

		return true;
	};

	const validateLastName = (value) => {
		const maxLength = 100;

		if (value.length > maxLength) {
			setInfoMessage('Longitud máxima alcanzada: 100 caracteres en el campo Apellidos.');
			setOpenInfoSnackbar(true);

			return false;
		}

		return true;
	};

	const validateIdentification = (value) => {
		const maxLength = 12;

		if (value.length > maxLength) {
			setInfoMessage('Longitud máxima alcanzada: 12 caracteres en el campo Número de Identificación.');
			setOpenInfoSnackbar(true);

			return false;
		}

		return true;
	};

	const validateEmail = (value) => {
		const maxLength = 100;

		if (value.length > maxLength) {
			setInfoMessage('Longitud máxima alcanzada: 100 caracteres en el campo Correo Electrónico.');
			setOpenInfoSnackbar(true);

			return false;
		}

		return true;
	}

	const handleUsernameChange = (e) => {
		const value = capitalizeWords(e.target.value);

		if (/^[a-zA-ZñÑ\s]*$/.test(value) && validateUsername(value)) {
			setFormData({ ...formData, username: value });
		}
	};

	const handleLastNameChange = (e) => {
		const value = capitalizeWords(e.target.value);

		if (/^[a-zA-ZñÑ\s]*$/.test(value) && validateLastName(value)) {
			setFormData({ ...formData, last_name: value });
		}
	};

	const handleIdentificationChange = (e) => {
		const value = e.target.value;

		if (/^\d*$/.test(value) && validateIdentification(value)) {
			setFormData({ ...formData, number_identification: value });
		}
	};

	const handleEmailChange = (e) => {
		const value = e.target.value;

		if (validateEmail(value)) {
			setFormData({ ...formData, email: value });
		}
	};

	const handleCloseInfoSnackbar = () => {
		setOpenInfoSnackbar(false);
	}

	const handleClose = () => {
		if (mode === 'edit' && userData) {
			setFormData({
				username: userData?.username || '',
				last_name: userData?.last_name || '',
				email: userData?.email || '',
				password: '',
				number_identification: userData?.number_identification || '',
				identification_type: userData?.identification_type?.id || '',
				institution: userData?.institution?.id || '',
				country: userData?.country?.id || '',
				system_role: userData?.system_role?.id || '',
				groups: userData?.groups?.map(group_info => group_info.id) || []
			});
			setSelectedRole(userData?.system_role?.id || '');
		} else {
			setFormData(initialData);
			setSelectedRole('');
		}

		setOpen(false);
	};


	useEffect(() => {
		if (open && mode === 'edit' && id) {
			updateUser(); // Esto obtiene los datos más recientes del usuario
		}
	}, [open, mode, id]);

	return (
		<>
			<Dialog
				fullWidth
				open={open}
				maxWidth='xl'
				onClose={(event, reason) => {
					if (reason !== 'backdropClick') {
						setOpen(false);
					}
				}}
				sx={{
					'& .MuiDialog-paper': {
						height: '90vh', // Ajusta la altura al 80% de la pantalla
						maxHeight: '90vh', // Define una altura máxima
						overflow: 'visible'
					}
				}}
				PaperProps={{ style: { overflow: 'visible' } }}
			>
				<DialogCloseButton onClick={() => setOpen(false)} disableRipple>
					<i className='tabler-x' />
				</DialogCloseButton>

				{/* TITULO SEGUN DEL MODAL EL MODO */}
				<DialogTitle variant='h4' className='flex gap-2 flex-col text-center'>
					{mode === 'edit' ? 'Editar Usuario' : 'Agregar Usuario'}
				</DialogTitle>

				<Tabs
					orientation='horizontal'
					value={tabIndex}
					onChange={handleTabChange}
					aria-label='basic tabs example'
					variant='fullWidth'
				>
					<Tab label={mode === 'edit' ? 'Editar Datos' : 'Agregar Usuario'} disabled={isSubmitting} />
					<Tab label={mode === 'edit' ? 'Editar Rol del Sistema' : 'Asignar Rol del Sistema '} disabled={isSubmitting} />
					<Tab label={mode === 'edit' ? 'Editar Grupo de Trabajo' : 'Asignar Grupo de Trabajo'} disabled={isSubmitting} />
				</Tabs>

				<DialogContent dividers>
					<>
						{tabIndex === 0 && (
							<Box
								component={Grid}
								container
								spacing={{ xs: 2, sm: 3, md: 4, lg: 10 }}
								sx={{
									width: '100%',
									display: 'flex',
									justifyContent: 'center', // Centrado vertical
									height: '65vh', // ESTO AYUDA A POSICIONAR VERTICALMENTE CENTRALMENTE
								}}
							>
								<Grid item xs={12}>
									<TextField
										label='Nombres'
										value={formData.username}
										onChange={handleUsernameChange}
										inputProps={{ maxLength: 101 }}
										disabled={isSubmitting}
										margin='dense'
										autoComplete='off'
										variant='outlined'
										type='text'
										autoFocus
										fullWidth
									/>
								</Grid>
								<Grid item xs={12}>
									<TextField
										label='Apellidos'
										value={formData.last_name}
										onChange={handleLastNameChange}
										inputProps={{ maxLength: 101 }}
										disabled={isSubmitting}
										margin='dense'
										autoComplete='off'
										variant='outlined'
										type='text'
										fullWidth
									/>
								</Grid>
								<Grid item xs={12}>
									<TextField
										label='Correo Electrónico'
										value={formData.email}
										onChange={handleEmailChange}
										inputProps={{ maxLength: 101 }}
										disabled={isSubmitting}
										type='email'
										margin='dense'
										autoComplete='off'
										variant='outlined'
										fullWidth
									/>
								</Grid>
								<Grid item xs={12}>
									<FormControl fullWidth variant='outlined'>
										<TextField
											label="Contraseña"
											value={formData.password}
											onChange={e => setFormData({ ...formData, password: e.target.value })}
											type={showPassword ? 'text' : 'password'}
											autoComplete='new-password'
											disabled={isSubmitting}
											InputProps={{
												endAdornment: (
													<InputAdornment position="end">
														<IconButton
															onClick={handleClickShowPassword}
															edge="end"
															disabled={isSubmitting}
														>
															{showPassword ? <VisibilityOff /> : <Visibility />}
														</IconButton>
													</InputAdornment>
												)
											}}
										/>
									</FormControl>
								</Grid>
								<Grid item xs={12} sm={6}>
									<FormControl fullWidth variant='outlined'>
										<InputLabel>País</InputLabel>
										<Select
											value={formData.country}
											onChange={e => setFormData({ ...formData, country: e.target.value })}
											label='País'
											disabled={isSubmitting}
										>
											{countries.map(country => (
												<MenuItem key={country.id} value={country.id}>
													{country.description}
												</MenuItem>
											))}
										</Select>
									</FormControl>
								</Grid>
								<Grid item xs={12} sm={6}>
									<Autocomplete
										options={filteredInstitutions}
										getOptionLabel={(option) => option.name || ''}
										value={filteredInstitutions.find(inst => inst.id === formData.institution) || null}
										onChange={(event, newValue) => {
											setFormData({ ...formData, institution: newValue ? newValue.id : '' });
										}}
										renderOption={(props, option) => (
											<li {...props} key={option.id}> {/* Utiliza option.id como key */}
												{option.name}
											</li>
										)}
										renderInput={(params) => (
											<TextField
												{...params}
												label="Institución"
												variant="outlined"
												disabled={isSubmitting}
											/>
										)}
										isOptionEqualToValue={(option, value) => option.id === value.id}
										noOptionsText="Sin coincidencias"
										fullWidth
										disabled={isSubmitting}
									/>
								</Grid>
								<Grid item xs={12} sm={6}>
									<FormControl fullWidth variant="outlined">
										<InputLabel>Identificación</InputLabel>
										<Select
											value={formData.identification_type}
											disabled={!formData.country || isSubmitting}
											onChange={e =>
												setFormData({ ...formData, identification_type: e.target.value })
											}
											label="Identificación"
										>
											{identifications.map(ident => (
												<MenuItem key={ident.id} value={ident.id}>
													{ident.description}
												</MenuItem>
											))}
										</Select>
									</FormControl>
								</Grid>
								<Grid item xs={12} sm={6}>
									<FormControl fullWidth variant='outlined'>
										<TextField
											label='Número de Identificación'
											value={formData.number_identification}
											onChange={handleIdentificationChange}
											disabled={!formData.identification_type || isSubmitting}
											inputProps={{ inputMode: 'numeric', maxLength: 13 }}
										/>
									</FormControl>
								</Grid>
							</Box>
						)}

						{tabIndex === 1 && (
							<Box
								component={Grid}
								container
								spacing={{ xs: 2, sm: 3, md: 4, lg: 10 }}
								sx={{
									width: '100%',
									display: 'flex',
									justifyContent: 'center', // Centrado vertical
									height: '65vh', // ESTO AYUDA A POSICIONAR VERTICALMENTE CENTRALMENTE
								}}
							>
								{roles.map((role) =>
									<ListItem
										key={role.id}
									>
										<ListItemButton
											onClick={() => setSelectedRole(role.id)}
											disabled={isSubmitting} // Deshabilita el botón si isSubmitting es true
										>
											<ListItemAvatar>
												<CustomAvatar color="primary">{role.description.charAt(0)}</CustomAvatar> {/* Primera letra del rol */}
											</ListItemAvatar>
											<ListItemText
												primary={role.description}
											/>
											<IconButton disabled={isSubmitting}>
												{selectedRole === role.id ? (
													<CheckCircleIcon
														style={{
															color: theme.palette.mode === 'dark' ? 'lightgreen' : 'green'  // Cambia el color según el tema
														}}
													/>
												) : (
													<RadioButtonUncheckedIcon />
												)}
											</IconButton>
										</ListItemButton>
									</ListItem>
								)}
							</Box>
						)}

						{tabIndex === 2 && (
							<Box
								component={Grid}
								container
								spacing={{ xs: 2, sm: 3, md: 4, lg: 10 }}
								sx={{
									width: '100%',
									display: 'flex',
									justifyContent: 'center', // Centrado vertical
									height: '65vh', // ESTO AYUDA A POSICIONAR VERTICALMENTE CENTRALMENTE
								}}
							>
								<Grid item xs={12}>
									<TextField
										margin='dense'
										label='Buscar Grupo de Trabajo'
										type='text'
										fullWidth
										variant='outlined'
										value={searchTerm}
										onChange={(e) => setSearchTerm(e.target.value)}
										autoComplete='off'
										autoFocus
									/>
								</Grid>

								{paginatedGroups.length === 0 ? (
									<Typography variant="body1" align="center" color="textSecondary" sx={{ mt: 2 }}>
										No se encontraron grupos de trabajo que coincidan con la búsqueda
									</Typography>
								) : (
									paginatedGroups.map((group) => (
										<ListItem key={group.group_info?.id}>
											<AvatarRectangular acronym={group.siglas} />
											<Typography sx={{ marginLeft: 2 }}>
												{group.group_info?.name}
											</Typography>

											<Button
												onClick={() => setSelectedGroup(group.group_info?.id)}
												variant={selectedGroup === group.group_info?.id ? 'contained' : 'outlined'}
												sx={{ marginLeft: 'auto' }}
											>
												{selectedGroup === group.group_info?.id ? (
													<CheckCircleIcon sx={{ color: 'green' }} />
												) : (
													<RadioButtonUncheckedIcon sx={{ color: 'black' }} />
												)}
											</Button>
										</ListItem>
									))
								)}
							</Box>
						)}
					</>
				</DialogContent>

				{/* BOTONES Y PAGINACION */}
				<DialogActions sx={{ marginTop: 5 }}>
					<Button
						onClick={handleClose}
						color='error'
						variant="outlined"
						disabled={isSubmitting}
					>
						Cerrar
					</Button>
					<Button
						onClick={handleSubmit}
						variant='contained'
						color='primary'
						disabled={isSubmitting}
					>
						{isSubmitting ? mode === 'edit' ? 'Actualizando...' : 'Agregando...' : mode === 'edit' ? 'Actualizar' : 'Agregar'}
					</Button>
				</DialogActions>
			</Dialog>

			{/* Snackbar para mostrar campos faltantes */}
			<Snackbar open={errorUsername} autoHideDuration={4000} onClose={() => setErrorUsername(false)}>
				<Alert
					onClose={() => setErrorUsername(false)}
					severity="warning"
					sx={{
						width: '100%',
						backgroundColor: 'rgba(255, 165, 100, 0.7)', // Color sólido para warning
						color: '#000',
						fontWeight: '600',
						boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.9)',
					}}
				>
					El campo Nombres es obligatorio.
				</Alert>
			</Snackbar>

			<Snackbar open={errorLastName} autoHideDuration={4000} onClose={() => setErrorLastName(false)}>
				<Alert
					onClose={() => setErrorLastName(false)}
					severity="warning"
					sx={{
						width: '100%',
						backgroundColor: 'rgba(255, 165, 100, 0.7)', // Color sólido para warning
						color: '#000',
						fontWeight: '600',
						boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.9)',
					}}
				>
					El campo Apellidos es obligatorio.
				</Alert>
			</Snackbar>

			<Snackbar open={errorEmail} autoHideDuration={4000} onClose={() => setErrorEmail(false)}>
				<Alert
					onClose={() => setErrorEmail(false)}
					severity="warning"
					sx={{
						width: '100%',
						backgroundColor: 'rgba(255, 165, 100, 0.7)', // Color sólido para warning
						color: '#000',
						fontWeight: '600',
						boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.9)',
					}}
				>
					El campo Correo Electrónico es obligatorio.
				</Alert>
			</Snackbar>

			<Snackbar open={errorCountry} autoHideDuration={4000} onClose={() => setErrorCountry(false)}>
				<Alert
					onClose={() => setErrorCountry(false)}
					severity="warning"
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

			<Snackbar open={errorInstitution} autoHideDuration={4000} onClose={() => setErrorInstitution(false)}>
				<Alert
					onClose={() => setErrorInstitution(false)}
					severity="warning"
					sx={{
						width: '100%',
						backgroundColor: 'rgba(255, 165, 100, 0.7)', // Color sólido para warning
						color: '#000',
						fontWeight: '600',
						boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.9)',
					}}
				>
					El campo Institución es obligatorio.
				</Alert>
			</Snackbar>

			{/* Snackbar para mostrar el error cuando las contraseñas no coinciden */}
			<Snackbar open={openSnackbar} autoHideDuration={4000} onClose={handleCloseSnackbar}>
				<Alert
					onClose={handleCloseSnackbar}
					severity="error"
					sx={{
						width: '100%',
						backgroundColor: 'rgba(255, 100, 100, 0.8)', // Color sólido para warning
						color: '#000',
						fontWeight: '600',
						boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.9)',
					}}
				>
					{error}
				</Alert>
			</Snackbar>

			{/* Snackbar para mostrar la información de límite de caracteres */}
			<Snackbar open={openInfoSnackbar} autoHideDuration={4000} onClose={handleCloseInfoSnackbar}>
				<Alert
					onClose={handleCloseInfoSnackbar}
					severity="info"
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
		</>
	)
}

export default UserModal
