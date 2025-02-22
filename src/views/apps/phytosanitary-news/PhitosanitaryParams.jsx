'use client'

import React, { useState, useEffect, useMemo } from 'react'

import {
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableRow,
	Paper,
	Typography,
	IconButton,
	TablePagination,
	Toolbar,
	Box,
	TableSortLabel,
	Button,
	Tooltip,
	MenuItem,
	Select,
	Grid,
	InputAdornment,
	TextField,
	Divider,
	CircularProgress,
	Snackbar,
	Alert,
	Autocomplete
} from '@mui/material'

import Swal from 'sweetalert2'

import { useTheme } from '@emotion/react'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import { DatePicker } from "@mui/x-date-pickers";

import PestControlIcon from '@mui/icons-material/PestControl'
import PublicIcon from '@mui/icons-material/Public';
import GrassTwoToneIcon from '@mui/icons-material/GrassTwoTone';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline'
import SaveIcon from '@mui/icons-material/Save'
import SearchIcon from '@mui/icons-material/Search';

// IMPORTACIÓN DE SERVICIOS
import { listSubscription } from '../../../service/phitsanitaryService'

const PhitosanitaryParams = ({ data }) => {
	const theme = useTheme();

	const [page, setPage] = useState(0)
	const [rowsPerPage, setRowsPerPage] = useState(10);
	const [selectedPlague, setSelectedPlague] = useState(null)
	const [selectedCountry, setSelectedCountry] = useState(null)
	const [selectedHospedant, setSelectedHospedant] = useState(null)
	const [filteredData, setFilteredData] = useState(data || [])
	const [savedSearches, setSavedSearches] = useState([])

	useEffect(() => {
		setFilteredData(data)
	}, [data])

	const handleSearch = () => {
		const filtered = data.filter(item => {
			const matchesPlague = !selectedPlague ||
				item.scientific_name?.toLowerCase().includes(selectedPlague.toLowerCase())

			const matchesCountry = !selectedCountry ||
				item.distribution?.toLowerCase().includes(selectedCountry.toLowerCase())

			const matchesHospedant = !selectedHospedant ||
				item.hosts?.toLowerCase().includes(selectedHospedant.toLowerCase())

			return matchesPlague && matchesCountry && matchesHospedant
		})

		setFilteredData(filtered)
		setPage(0)
	}

	const handleChangePage = (event, newPage) => {
		setPage(newPage);
	};

	const handleChangeRowsPerPage = (event) => {
		setRowsPerPage(parseInt(event.target.value, 10));
		setPage(0);
	};

	const handleSaveSearch = () => {
		if (!selectedPlague && !selectedCountry && !selectedHospedant) return

		const titleColor = theme.palette.mode === 'dark' ? '#FFFFFF' : '#000000'
		const backgroundColor = theme.palette.background.paper
		const confirmButtonColor = theme.palette.primary.main
		const cancelButtonColor = theme.palette.error.main

		Swal.fire({
			html: `
					<span style="font-family: Arial, sans-serif; font-size: 28px; color: ${titleColor};">
							¿Guardar esta búsqueda?
					</span>
					<br>
					<span style="display: block; margin-top: 15px; font-family: Arial, sans-serif; font-size: 16px; color: ${titleColor};">
							Podrás consultarla más tarde en la sección de 'Ajustes'.
					</span>
			`,
			input: "text",
			inputPlaceholder: "Ingrese un nombre para la búsqueda",
			icon: "question",
			showCancelButton: true,
			confirmButtonText: "Sí, Guardar",
			cancelButtonText: "Cancelar",
			confirmButtonColor: confirmButtonColor,
			cancelButtonColor: cancelButtonColor,
			background: backgroundColor,
			inputAttributes: {
				style: `color: ${titleColor}; font-size: 16px; font-family: Arial, sans-serif;`
			},
			preConfirm: (inputValue) => {
				return inputValue ? inputValue : "Búsqueda sin nombre";
			}
		}).then((result) => {
			if (result.isConfirmed) {
				const newSearch = {
					id: Date.now(),
					name: result.value, // Se almacena el nombre ingresado por el usuario
					plague: selectedPlague || "Guardado sin Nombre Científico",
					country: selectedCountry || "Guardado sin Distribución",
					hosts: selectedHospedant || "Guardado sin Hospedante"
				};

				setSavedSearches(prevSearches => {
					const updatedSearches = [...prevSearches, newSearch];

					localStorage.setItem("savedSearches", JSON.stringify(updatedSearches)); // Guardar en localStorage

					return updatedSearches;
				});

				Swal.fire({
					html: `
                    <span style="font-family: Arial, sans-serif; font-size: 28px; color: ${titleColor};">
                        Guardado con éxito
                    </span>
                    <br>
                    <span style="display: block; margin-top: 15px; font-family: Arial, sans-serif; font-size: 16px; color: ${titleColor};">
                        Tu búsqueda ha sido guardada correctamente.
                    </span>
                `,
					icon: "success",
					confirmButtonText: "Aceptar",
					confirmButtonColor: confirmButtonColor,
					background: backgroundColor
				});
			}
		})
	}

	// Esta variable verifica si hay filtros rellenados para habilitar el botón
	const isSaveDisabled = !selectedPlague && !selectedCountry && !selectedHospedant

	const handleClear = () => {
		setSelectedPlague(null)
		setSelectedCountry(null)
		setSelectedHospedant(null)
		setFilteredData(data)
	}

	return (
		<>
			<Paper sx={{ width: '100%', overflow: 'hidden', marginTop: 3 }}>
				<Box sx={{ padding: 5 }}>
					<Grid container spacing={1} alignItems='center' sx={{ marginBottom: 2 }}>
						{/* Filtro por plaga */}
						<Grid item xs={12} md>
							<Autocomplete
								size="small"
								options={[...new Set(data.map(item => item.scientific_name))]}
								value={selectedPlague}
								onChange={(_, newValue) => setSelectedPlague(newValue)}
								noOptionsText="Sin resultados"
								renderInput={(params) => (
									<TextField
										{...params}
										label="Buscar por Nombre Científico"
										InputProps={{
											...params.InputProps,
											startAdornment: (
												<InputAdornment position="start">
													<PestControlIcon />
												</InputAdornment>
											)
										}}
									/>
								)}
								style={{ marginRight: '5px', width: '300px' }}
							/>
						</Grid>

						{/* Selección de País */}
						<Grid item xs={12} md>
							<Autocomplete
								noOptionsText="Sin resultados"
								size="small"
								options={[...new Set(data.map(item => item.distribution))]}
								value={selectedCountry}
								onChange={(_, newValue) => setSelectedCountry(newValue)}
								renderInput={(params) => (
									<TextField
										{...params}
										label="Buscar por Distribución"
										InputProps={{
											...params.InputProps,
											startAdornment: (
												<InputAdornment position="start">
													<PublicIcon />
												</InputAdornment>
											)
										}}
									/>
								)}
								style={{ marginRight: '5px', width: '300px' }}
							/>
						</Grid>

						{/* Filtro por Hospedante */}
						<Grid item xs={12} md={6}>
							<Autocomplete
								noOptionsText="Sin resultados"
								size="small"
								options={[...new Set(data.map(item => item.hosts))]}
								value={selectedHospedant}
								onChange={(_, newValue) => setSelectedHospedant(newValue)}
								renderInput={(params) => (
									<TextField
										{...params}
										label="Buscar por Hospedante"
										InputProps={{
											...params.InputProps,
											startAdornment: (
												<InputAdornment position="start">
													<GrassTwoToneIcon />
												</InputAdornment>
											)
										}}
									/>
								)}
								style={{ marginRight: '5px', width: '300px' }}
							/>
						</Grid>

						{/* Botón de Buscar con espaciado adicional */}
						<Grid item xs={12} md="auto" sx={{ marginRight: 3 }}>
							<Button variant="contained" color="primary" onClick={handleSearch} startIcon={<SearchIcon />}>
								Buscar
							</Button>
						</Grid>

						{/* Botón de Guardar Búsqueda */}
						<Grid item sx={{ marginRight: 3 }}>
							<Button
								variant="contained"
								color="success"
								onClick={handleSaveSearch}
								startIcon={<SaveIcon />}
								disabled={isSaveDisabled}
							>
								Guardar Búsqueda
							</Button>
						</Grid>

						{/* Botón de Limpiar con icono y tooltip, con espaciado adicional */}
						<Grid item xs={12} md="auto">
							<Tooltip title="Limpiar filtros">
								<Button variant="outlined" color="error" onClick={handleClear} sx={{ minWidth: '50px' }}>
									<DeleteOutlineIcon />
								</Button>
							</Tooltip>
						</Grid>
					</Grid>
				</Box>

				<Box sx={{ padding: '0' }}>
					<Divider sx={{ width: '100%' }} />
				</Box>

				<Box sx={{ padding: 5 }}>
					<Grid container spacing={2} alignItems='center' sx={{ marginBottom: 2 }}>
						<Typography variant='h5' sx={{ fontWeight: 'bold', marginLeft: '12px', marginBottom: '10px' }}>
							Búsqueda Fitosanitaria
						</Typography>
					</Grid>

					<TableContainer
						sx={{
							marginTop: 2,
							borderRadius: 1.5,
							overflow: 'hidden',
							overflowX: 'auto'
						}}
					>
						<Table
							sx={{
								'& .MuiTableCell-root': {
									border: theme.palette.mode === 'light'
										? '1px solid rgba(0, 0, 0, 0.35)'
										: '1px solid rgba(255, 255, 255, 0.18)',
									fontSize: '0.9rem'
								}
							}}
						>
							<TableHead style={{ backgroundColor: theme.palette.primary.main }}>
								<TableRow>
									<TableCell align='center' sx={{ color: theme.palette.primary.contrastText }}>
										Nombre Científico
									</TableCell>
									<TableCell align='center' sx={{ color: theme.palette.primary.contrastText }}>
										Nombres Comunes
									</TableCell>
									<TableCell align='center' sx={{ color: theme.palette.primary.contrastText }}>
										Sinónimos
									</TableCell>
									<TableCell align='center' sx={{ color: theme.palette.primary.contrastText }}>
										Descripción Invasiva
									</TableCell>
									<TableCell align='center' sx={{ color: theme.palette.primary.contrastText }}>
										Distribución
									</TableCell>
									<TableCell align='center' sx={{ color: theme.palette.primary.contrastText }}>
										Impacto
									</TableCell>
									<TableCell align='center' sx={{ color: theme.palette.primary.contrastText }}>
										Hábitat
									</TableCell>
									<TableCell align='center' sx={{ color: theme.palette.primary.contrastText }}>
										Ciclo Vital
									</TableCell>
									<TableCell align='center' sx={{ color: theme.palette.primary.contrastText }}>
										Reproducción
									</TableCell>
									<TableCell align='center' sx={{ color: theme.palette.primary.contrastText }}>
										Hospedante
									</TableCell>
									<TableCell align='center' sx={{ color: theme.palette.primary.contrastText }}>
										Síntomas
									</TableCell>
									<TableCell align='center' sx={{ color: theme.palette.primary.contrastText }}>
										Órganos Afectados
									</TableCell>
									<TableCell align='center' sx={{ color: theme.palette.primary.contrastText }}>
										Condiciones Ambientales
									</TableCell>
									<TableCell align='center' sx={{ color: theme.palette.primary.contrastText }}>
										Control Preventivo
									</TableCell>
									<TableCell align='center' sx={{ color: theme.palette.primary.contrastText }}>
										Usos
									</TableCell>
									<TableCell align='center' sx={{ color: theme.palette.primary.contrastText }}>
										Url Fuente
									</TableCell>
									<TableCell align='center' sx={{ color: theme.palette.primary.contrastText }}>
										Fuente Scraper
									</TableCell>
								</TableRow>
							</TableHead>

							<TableBody>
								{filteredData && filteredData.length > 0 ? (
									filteredData
										.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
										.map((row, index) => (
											<TableRow key={index}>
												<TableCell align='center'>{row.scientific_name}</TableCell>
												<TableCell align='center'>{row.common_names}</TableCell>
												<TableCell align='center'>{row.synonyms}</TableCell>
												<TableCell align='center'>{row.invasiveness_description}</TableCell>
												<TableCell align='center'>{row.distribution}</TableCell>
												<TableCell align='center'>
													{row.impact && Object.entries(row.impact).map(([key, value]) => (
														<div key={key}>{`${key}: ${value}`}</div>
													))}
												</TableCell>
												<TableCell align='center'>{row.habitat}</TableCell>
												<TableCell align='center'>{row.life_cycle}</TableCell>
												<TableCell align='center'>{row.reproduction}</TableCell>
												<TableCell align='center'>{row.hosts}</TableCell>
												<TableCell align='center'>{row.symptoms}</TableCell>
												<TableCell align='center'>{row.affected_organs}</TableCell>
												<TableCell align='center'>{row.environmental_conditions}</TableCell>
												<TableCell align='center'>
													{row.prevention_control && Object.entries(row.prevention_control).map(([key, value]) => (
														<div key={key}>{`${key}: ${value}`}</div>
													))}
												</TableCell>
												<TableCell align='center'>{row.uses}</TableCell>
												<TableCell align='center'>
													<a href={row.source_url} target="_blank" rel="noreferrer">
														Enlace
													</a>
												</TableCell>
												<TableCell align='center'>{row.scraper_source}</TableCell>
											</TableRow>
										))
								) : (
									<TableRow>
										<TableCell colSpan={17} align="center">
											<Typography variant="body1" color="secondary">
												{data?.length === 0 ? 'No hay datos disponibles' : 'No se encontraron resultados'}
											</Typography>
										</TableCell>
									</TableRow>
								)}
							</TableBody>
						</Table>
					</TableContainer>
				</Box>

				{/* Paginación */}
				<Box sx={{ display: 'flex', justifyContent: 'flex-start', paddingLeft: 2 }}>
					<TablePagination
						rowsPerPageOptions={[5, 10, 25]}
						component='div'
						count={filteredData.length}
						rowsPerPage={rowsPerPage}
						page={page}
						onPageChange={handleChangePage}
						onRowsPerPageChange={handleChangeRowsPerPage}
						labelRowsPerPage='Registros por página'
						labelDisplayedRows={({ from, to, count }) => `${from}-${to} de ${count}`}
					/>
				</Box>
			</Paper>
		</>
	);
}

export default PhitosanitaryParams
