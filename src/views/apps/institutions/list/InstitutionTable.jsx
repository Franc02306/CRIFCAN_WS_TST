'use client'

import React, { useState, useEffect, useMemo } from 'react'

import Link from 'next/link'
import { useParams } from 'next/navigation'

import {
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableRow,
	Typography,
	Button,
	IconButton,
	Tooltip,
	Menu,
	MenuItem,
	CircularProgress,
	Paper,
	Divider,
	TablePagination,
	TextField,
	InputAdornment, // Para agregar un icono al buscador
	FormControl,
	InputLabel,
	Select,
	Box,
	Grid,
	TableSortLabel,
	Toolbar,
	Autocomplete
} from '@mui/material'

import Swal from 'sweetalert2'

import VisibilityIcon from '@mui/icons-material/Visibility'

import AddIcon from '@mui/icons-material/Add'
import SearchIcon from '@mui/icons-material/Search'
import GroupIcon from '@mui/icons-material/Group';
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import RestoreFromTrashIcon from '@mui/icons-material/RestoreFromTrash';
import { useTheme } from '@mui/material/styles'

// IMPORTACION DE SERVCIOS
import { getInstitutions, getInstitutionById, editInstitutionById, deleteInstitution } from '../../../../service/institutionService'
import { getCountry } from '../../../../service/userService'

// IMPORTACION DE MODALES
import InstitutionModal from '../create/InstitutionModal'
import MembersListModal from '../list/MembersListModal'


const InstitutionTable = () => {
	const theme = useTheme();

	const [totalInstitutions, setTotalInstitutions] = useState(0); // Nuevo estado
	const [institutions, setInstitutions] = useState([]);
	const [filteredInstitutions, setFilteredInstitutions] = useState([]);
	const [countries, setCountries] = useState([]);
	const [searchTerm, setSearchTerm] = useState('');
	const [selectedCountry, setSelectedCountry] = useState('');
	const [order, setOrder] = useState('asc');
	const [orderBy, setOrderBy] = useState('name');
	const [loading, setLoading] = useState(true);
	const [page, setPage] = useState(0);
	const [rowsPerPage, setRowsPerPage] = useState(10);
	const [nextPage, setNextPage] = useState(null);
	const [previousPage, setPreviousPage] = useState(null);
	const [selectedInstitution, setSelectedInstitution] = useState(null);
	const [openModal, setOpenModal] = useState(false);
	const [mode, setMode] = useState('create');
	const [openMembersModal, setOpenMembersModal] = useState(false);
	const [selectedInstitutionForMembers, setSelectedInstitutionForMembers] = useState(null);
	const [autocompleteValue, setAutocompleteValue] = useState(null);
	const [searchInputValue, setSearchInputValue] = useState('');

	const [institutionStatusFilter, setInstitutionStatusFilter] = useState('Activas')

	// VARIABLES DE USETHEME
	const titleColor = theme.palette.mode === 'dark' ? '#FFFFFF' : '#000000'
	const backgroundColor = theme.palette.background.paper
	const confirmButtonColor = theme.palette.primary.main
	const cancelButtonColor = theme.palette.error.main

	const fetchInstitutions = async (url, allInstitutions = []) => {
		try {
			const { data } = await getInstitutions(url);

			const filteredInstitutions = data.results.filter(inst =>
				institutionStatusFilter === 'Activas' ? inst.is_active : !inst.is_active
			)

			const updatedInstitutions = [...allInstitutions, ...filteredInstitutions];

			if (data.next) {
				return fetchInstitutions(data.next, updatedInstitutions);
			}

			// Ordenamos alfabéticamente por nombre
			return updatedInstitutions.sort((a, b) => a.name.localeCompare(b.name));
		} catch (error) {
			console.error('Error al obtener las instituciones:', error);

			return allInstitutions;
		}
	};

	useEffect(() => {
		const loadInstitutions = async () => {
			setLoading(true);
			const allInstitutions = await fetchInstitutions(`/api/models/institution/`);

			setInstitutions(allInstitutions);
			setFilteredInstitutions(allInstitutions);
			setTotalInstitutions(allInstitutions.length); // Actualiza el total en la paginación
			setLoading(false);
		};

		loadInstitutions();
		fetchCountries();
	}, [institutionStatusFilter]);

	useEffect(() => {
		setPage(0);
	}, [searchTerm, selectedCountry, autocompleteValue]);

	// Función para obtener los países
	const fetchCountries = async () => {
		try {
			const { data } = await getCountry();

			setCountries(data.results);
		} catch (error) {
			console.error('Error al obtener países:', error);
		}
	};

	const handleRequestSort = (property) => {
		const isAsc = orderBy === property && order === 'asc';

		setOrder(isAsc ? 'desc' : 'asc');
		setOrderBy(property);
	};

	const sortedInstitutions = useMemo(() => {
		return [...filteredInstitutions].sort((a, b) => {
			const valueA = a[orderBy]?.toLowerCase() || '';
			const valueB = b[orderBy]?.toLowerCase() || '';

			if (valueA < valueB) return order === 'asc' ? -1 : 1;
			if (valueA > valueB) return order === 'asc' ? 1 : -1;

			return 0;
		});
	}, [filteredInstitutions, order, orderBy]);

	// Aplicamos paginación sobre las instituciones ya ordenadas
	const paginatedInstitutions = useMemo(() => {
		return sortedInstitutions.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
	}, [sortedInstitutions, page, rowsPerPage]);

	const handleCountryChange = (e) => {
		const countryId = e.target.value;

		setSelectedCountry(countryId);

		if (countryId === "") {
			// Si se selecciona "Todos", mostrar todas las instituciones
			setFilteredInstitutions(institutions);
		} else {
			// Filtrar por país si se selecciona uno específico
			const filtered = institutions.filter(inst => inst.country.id === countryId);

			setFilteredInstitutions(filtered);
		}
	};

	// Manejo de paginación
	const handleChangePage = async (event, newPage) => {
		setPage(newPage);

		if (newPage > page && nextPage) {
			await fetchInstitutions(nextPage);
		} else if (newPage < page && previousPage) {
			await fetchInstitutions(previousPage);
		}
	};

	const handleChangeRowsPerPage = (event) => {
		setRowsPerPage(parseInt(event.target.value, 10));
		setPage(0);
	};

	// Función para eliminar instituciones
	const handleDelete = async (id) => {
		const result = await Swal.fire({
			html: `<span style="font-family: Arial, sans-serif; font-size: 28px; color: ${titleColor};">¿Está seguro que desea eliminar esta institución?</span>`,
			icon: 'warning',
			showCancelButton: true,
			confirmButtonText: 'Sí, eliminar',
			cancelButtonText: 'Cancelar',
			cancelButtonColor: cancelButtonColor,
			confirmButtonColor: confirmButtonColor,
			background: backgroundColor,
		});

		if (result.isConfirmed) {
			try {
				await deleteInstitution(id);

				// Filtrar la institución eliminada del estado localmente
				const updatedInstitutions = institutions.filter(inst => inst.id !== id);

				setInstitutions(updatedInstitutions);
				setFilteredInstitutions(updatedInstitutions);

				// Disminuir el total en 1
				setTotalInstitutions(prevTotal => prevTotal - 1);

				await Swal.fire({
					html: `<span style="font-family: Arial, sans-serif; font-size: 28px; color: ${titleColor};">Institución eliminada exitosamente</span>`,
					icon: 'success',
					confirmButtonText: 'Aceptar',
					confirmButtonColor: confirmButtonColor,
					background: backgroundColor,
					timer: 4000,
				});
			} catch (error) {
				console.error('Error al eliminar institución:', error);
				await Swal.fire({
					html: `<span style="font-family: Arial, sans-serif; font-size: 28px; color: ${titleColor};">Error al eliminar la institución</span>`,
					icon: 'error',
					confirmButtonText: 'Aceptar',
					confirmButtonColor: confirmButtonColor,
					background: backgroundColor,
				});
			}
		}
	};

	const handleRestore = async (id) => {
		const result = await Swal.fire({
			html: `<span style="font-family: Arial, sans-serif; font-size: 28px; color: ${titleColor};">¿Está seguro que desea restaurar esta institución?</span>`,
			icon: 'warning',
			showCancelButton: true,
			confirmButtonText: 'Sí, restaurar',
			cancelButtonText: 'Cancelar',
			cancelButtonColor: cancelButtonColor,
			confirmButtonColor: confirmButtonColor,
			background: backgroundColor,
		});

		if (result.isConfirmed) {
			try {
				await editInstitutionById(id, { is_active: true });

				const updatedInstitutions = institutions.map(inst =>
					inst.id === id ? { ...inst, is_active: true } : inst
				);

				setInstitutions(updatedInstitutions);

				const updatedFilteredInstitutions = institutionStatusFilter === 'Activas'
					? updatedInstitutions.filter(inst => inst.is_active)
					: updatedInstitutions.filter(inst => !inst.is_active);

				setFilteredInstitutions(updatedFilteredInstitutions);

				setTotalInstitutions(updatedFilteredInstitutions.length);

				await Swal.fire({
					html: `<span style="font-family: Arial, sans-serif; font-size: 28px; color: ${titleColor};">Institución restaurada exitosamente</span>`,
					icon: 'success',
					confirmButtonText: 'Aceptar',
					confirmButtonColor: confirmButtonColor,
					background: backgroundColor,
					timer: 4000,
				});
			} catch (error) {
				console.error('Error al restaurar la institución:', error);
				await Swal.fire({
					html: `<span style="font-family: Arial, sans-serif; font-size: 28px; color: ${titleColor};">Error al restaurar la institución</span>`,
					icon: 'error',
					confirmButtonText: 'Aceptar',
					confirmButtonColor: confirmButtonColor,
					background: backgroundColor,
				});
			}
		}
	}

	const handleInstitutionChange = (event, value) => {
		setSelectedInstitution(value);

		if (value) {
			setFilteredInstitutions([value]);
		} else {
			setFilteredInstitutions(institutions);
		}
	};

	const handleOpenModal = (institution = null) => {
		if (institution) {
			setMode('edit');
			setSelectedInstitution(institution);
		} else {
			setMode('create');
			setSelectedInstitution(null);
		}

		setAutocompleteValue(null); // Limpia el Autocomplete
		setSearchInputValue(''); // Limpia el texto ingresado
		setOpenModal(true);
	};

	const handleInstitutionAdded = async (updatedInstitution) => {
		const countryObject = countries.find(c => c.id === updatedInstitution.country);

		const institutionWithCountry = {
			...updatedInstitution,
			country: countryObject || updatedInstitution.country, // Asignar el objeto o mantener el ID si no se encuentra
			is_active: true
		};

		const institutionWithUsers = await getInstitutionById(updatedInstitution.id);

		if (mode === 'edit') {
			const updatedInstitutions = institutions.map(inst =>
				inst.id === institutionWithCountry.id ? institutionWithUsers.data : inst
			);

			setInstitutions(updatedInstitutions);
			setFilteredInstitutions(updatedInstitutions);
		} else {
			const newInstitutions = [...institutions, institutionWithCountry];

			setInstitutions(newInstitutions);
			setFilteredInstitutions(newInstitutions);
			setTotalInstitutions(prevTotal => prevTotal + 1);
		}
	};

	const handleOpenMembersModal = (institution) => {
		setSelectedInstitutionForMembers(institution);
		setOpenMembersModal(true);
	};

	// Mostrar un loader mientras se cargan los datos
	if (loading) {
		return (
			<Box
				sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}
			>
				<CircularProgress />
			</Box>
		);
	}

	return (
		<Paper sx={{ width: '100%', overflow: 'hidden' }}>
			<Box sx={{ padding: 6 }}>
				<Grid container spacing={2} alignItems="center" sx={{ marginBottom: 2 }}>
					<Grid item xs={12} md>
						<Autocomplete
							options={institutions.filter(inst =>
								institutionStatusFilter === 'Activas' ? inst.is_active : !inst.is_active
							)}
							noOptionsText="Sin coincidencias"
							getOptionLabel={(option) => option.name || ''}
							value={autocompleteValue}
							onChange={(event, newValue) => {
								setAutocompleteValue(newValue);

								// Si no hay selección en el autocompletable, aplicar el filtro según el estado de instituciones (Activas/Inactivas)
								if (!newValue) {
									const filtered = institutions.filter(inst =>
										institutionStatusFilter === 'Activas' ? inst.is_active : !inst.is_active
									);
									
									setFilteredInstitutions(filtered);
								} else {
									// Si hay selección, mostrar solo la institución seleccionada
									setFilteredInstitutions([newValue]);
								}
							}}
							inputValue={searchInputValue}
							onInputChange={(event, newInputValue) => {
								setSearchInputValue(newInputValue);
								setSearchTerm(newInputValue);

								// Filtra instituciones en base al texto ingresado
								const filtered = institutions.filter(inst =>
									inst.name.toLowerCase().includes(newInputValue.toLowerCase()) &&
									(institutionStatusFilter === 'Activas' ? inst.is_active : !inst.is_active)
								);

								setFilteredInstitutions(filtered);
							}}
							renderOption={(props, option) => (
								<li {...props} key={option.id}> {/* Asigna un key único aquí */}
									{option.name}
								</li>
							)}
							renderInput={(params) => (
								<TextField
									{...params}
									label="Buscar Institución"
									variant="outlined"
									size="small"
									InputProps={{
										...params.InputProps,
										startAdornment: (
											<InputAdornment position="start" style={{ paddingLeft: '8.5px', marginRight: '-1px' }}>
												<SearchIcon />
											</InputAdornment>
										),
									}}
									style={{ width: '300px' }}
								/>
							)}
						/>
					</Grid>
					<Grid item xs={12} md>
						<FormControl variant="outlined" size="small" style={{ width: '300px' }}>
							<InputLabel>Filtrar por País</InputLabel>
							<Select
								value={selectedCountry}
								onChange={handleCountryChange}
								label="Filtrar por País"
							>
								<MenuItem value="">
									<em>Todos los Países</em>
								</MenuItem>
								{countries.map((country) => (
									<MenuItem key={country.id} value={country.id}>
										{country.description}
									</MenuItem>
								))}
							</Select>
						</FormControl>
					</Grid>
					<Grid item xs={12} md='auto'>
						<Button
							variant="contained"
							color="primary"
							startIcon={<AddIcon />}
							onClick={() => handleOpenModal()}
						>
							Agregar Institución
						</Button>
					</Grid>
				</Grid>
			</Box>

			<Box sx={{ padding: '0' }}>
				<Divider sx={{ width: '100%' }} />
			</Box>

			<Box sx={{ padding: 6 }}>
				<Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
					<Typography variant='h5' sx={{ fontWeight: 'bold', marginLeft: 0.5, marginBottom: 5 }}>
						Lista de Instituciones
					</Typography>

					<FormControl sx={{ minWidth: 230, marginBottom: 2 }} size="small">
						<InputLabel>Filtrar por Estado</InputLabel>
						<Select
							value={institutionStatusFilter}
							onChange={(e) => setInstitutionStatusFilter(e.target.value)}
							label="Filtrar por Estado"
						>
							<MenuItem value="Activas">Activas</MenuItem>
							<MenuItem value="Inactivas">Inactivas</MenuItem>
						</Select>
					</FormControl>
				</Box>

				{/* Tabla para los documentos */}
				<TableContainer component={Paper}>
					<Table
						sx={{
							'& .MuiTableCell-root': {
								border: theme.palette.mode === 'light'
									? '1px solid rgba(0, 0, 0, 0.35)'  // Borde negro translúcido en tema claro
									: '1px solid rgba(255, 255, 255, 0.12)',  // Borde blanco translúcido en tema oscuro
							},
						}}
					>
						<TableHead style={{ backgroundColor: theme.palette.primary.main }}>
							<TableRow>
								<TableCell
									align='center'
									sx={{
										color: theme.palette.primary.contrastText,
										width: '120px'
									}}>
									<TableSortLabel
										active={orderBy === 'name'}
										direction={orderBy === 'name' ? order : 'asc'}
										onClick={() => handleRequestSort('name')}
										sx={{
											color: theme.palette.primary.contrastText + " !important",
											'& .MuiTableSortLabel-icon': {
												color: theme.palette.primary.contrastText + " !important"
											},
											'&.Mui-active': {
												color: theme.palette.primary.contrastText + " !important",
												'& .MuiTableSortLabel-icon': {
													color: theme.palette.primary.contrastText + " !important"
												}
											}
										}}
									>
										Nombre
									</TableSortLabel>
								</TableCell>
								<TableCell
									align='center'
									sx={{
										color: theme.palette.primary.contrastText,
										width: '120px'
									}}
								>
									Siglas
								</TableCell>
								<TableCell
									align='center'
									sx={{
										color: theme.palette.primary.contrastText,
										width: '120px'
									}}
								>
									País
								</TableCell>
								<TableCell
									align='center'
									sx={{
										color: theme.palette.primary.contrastText,
										width: '60px'
									}}
								>
									Acciones
								</TableCell>
							</TableRow>
						</TableHead>
						<TableBody>
							{paginatedInstitutions.length > 0 ? (
								paginatedInstitutions.map((institution) => (
									<TableRow key={institution.id}>
										<TableCell align="center" sx={{ padding: '5px 8px', height: '36px' }}>
											{institution?.name}
										</TableCell>
										<TableCell align="center" sx={{ padding: '5px 8px', height: '36px' }}>
											{institution?.acronym}
										</TableCell>
										<TableCell align="center" sx={{ padding: '5px 8px', height: '36px' }}>
											{institution?.country?.description}
										</TableCell>
										<TableCell align="center" sx={{ padding: '5px 8px', height: '36px' }}>
											<Tooltip title="Ver Usuarios">
												<IconButton onClick={() => handleOpenMembersModal(institution)}>
													<GroupIcon />
												</IconButton>
											</Tooltip>
											<Tooltip title="Editar">
												<IconButton onClick={() => handleOpenModal(institution)}>
													<EditIcon />
												</IconButton>
											</Tooltip>
											{institution.is_active ? (
												<Tooltip title="Eliminar">
													<IconButton onClick={() => handleDelete(institution.id)}>
														<DeleteIcon />
													</IconButton>
												</Tooltip>
											) : (
												<Tooltip title="Restaurar">
													<IconButton onClick={() => handleRestore(institution.id)}>
														<RestoreFromTrashIcon />
													</IconButton>
												</Tooltip>
											)}
										</TableCell>
									</TableRow>
								))
							) : (
								<TableRow>
									<TableCell colSpan={4} align="center" sx={{ padding: '20px' }}>
										<Typography variant="h6" color="textSecondary">
											No hay instituciones {institutionStatusFilter.toLowerCase()}.
										</Typography>
									</TableCell>
								</TableRow>
							)}
						</TableBody>
					</Table>
				</TableContainer>
			</Box>

			<TablePagination
				component="div"
				count={searchTerm || selectedCountry ? filteredInstitutions.length : totalInstitutions}
				page={page}
				onPageChange={handleChangePage}
				rowsPerPage={rowsPerPage}
				onRowsPerPageChange={handleChangeRowsPerPage}
				labelRowsPerPage="Instituciones por página"
				slotProps={{
					actions: {
						nextButton: {
							disabled: page >= Math.ceil(filteredInstitutions.length / rowsPerPage) - 1
						},
						previousButton: {
							disabled: page === 0
						}
					}
				}}
			/>

			{ /* PASAR PROPS A COMPONENTES MODAL */}
			<InstitutionModal
				open={openModal}
				setOpen={setOpenModal}
				mode={mode}
				institution={selectedInstitution}
				id={selectedInstitution?.id || null}
				handleInstitutionAdded={handleInstitutionAdded}
			/>

			<MembersListModal
				open={openMembersModal}
				setOpen={setOpenMembersModal}
				institution={selectedInstitutionForMembers}
			/>
		</Paper>
	);
};

export default InstitutionTable;
