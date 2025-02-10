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
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline'
import SaveIcon from '@mui/icons-material/Save'
import SearchIcon from '@mui/icons-material/Search';

const plagueOptions = ["Pulgón", "Gusano de la hoja", "Araña roja", "Langosta", "Trips", "Minador de hojas"];
const countryOptions = ["Bolivia", "Colombia", "Ecuador", "Perú"];

const PhitosanitaryParams = ({ data }) => {
	const theme = useTheme();

	const [selectedPlague, setSelectedPlague] = useState(null)
	const [selectedDate, setSelectedDate] = useState(null)
	const [selectedCountry, setSelectedCountry] = useState("")
	const [filteredData, setFilteredData] = useState([])
	const [savedSearches, setSavedSearches] = useState([])

	useEffect(() => {
		const storedSearches = JSON.parse(localStorage.getItem("savedSearches")) || []

		setSavedSearches(storedSearches)
	}, [])

	const handleSearch = () => {
		const filtered = data.filter(item =>
			(!selectedPlague || item.plague === selectedPlague) &&
			(!selectedCountry || item.country === selectedCountry) &&
			(!selectedDate || item.date === selectedDate.format('YYYY-MM-DD'))
		)

		setFilteredData(filtered)
	}

	const handleSaveSearch = () => {
		if (!selectedPlague && !selectedCountry && !selectedDate) return

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
				if (!inputValue) {
					return "Búsqueda sin nombre";
				}
				
				return inputValue;
			}
		}).then((result) => {
			if (result.isConfirmed) {
				const newSearch = {
					id: Date.now(),
					plague: selectedPlague || "Guardado sin Plaga",
					country: selectedCountry || "Guardado sin País",
					date: selectedDate ? selectedDate.format('YYYY-MM-DD') : "Guardado sin Fecha"
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
	const isSaveDisabled = !selectedPlague && !selectedCountry && !selectedDate

	const handleClear = () => {
		setSelectedPlague(null)
		setSelectedDate(null)
		setSelectedCountry("")
		setFilteredData([])
	}

	return (
		<>
			<Paper sx={{ width: '100%', overflow: 'hidden', marginTop: 3 }}>
				<Box sx={{ padding: 5 }}>
					<Grid container spacing={1} alignItems='center' sx={{ marginBottom: 2 }}>
						{/* Filtro por plaga */}
						<Grid item xs={12} md>
							<Autocomplete
								options={plagueOptions}
								value={selectedPlague}
								onChange={(event, newValue) => setSelectedPlague(newValue)}
								renderInput={(params) => (
									<TextField
										{...params}
										label="Buscar por Plaga"
										variant="outlined"
										size="small"
										autoComplete="off"
										InputProps={{
											...params.InputProps,
											startAdornment: (
												<InputAdornment position="start">
													<PestControlIcon />
												</InputAdornment>
											),
										}}
										style={{ marginRight: '5px', width: '300px' }}
									/>
								)}
							/>
						</Grid>

						{/* Selección de País */}
						<Grid item xs={12} md>
							<TextField
								select
								label="Seleccionar País"
								value={selectedCountry}
								onChange={(event) => setSelectedCountry(event.target.value)}
								variant="outlined"
								size="small"
								fullWidth
								sx={{ width: '300px' }}
							>
								{countryOptions.map((country) => (
									<MenuItem key={country} value={country}>
										{country}
									</MenuItem>
								))}
							</TextField>
						</Grid>

						{/* Filtro por fecha */}
						<Grid item xs={12} md={6}>
							<LocalizationProvider dateAdapter={AdapterDayjs}>
								<DatePicker
									label="Fecha de Notificación"
									value={selectedDate}
									onChange={(newValue) => setSelectedDate(newValue)}
									sx={{ width: '300px' }}
									renderInput={(params) => <TextField {...params} variant="outlined" size="small" fullWidth />}
								/>
							</LocalizationProvider>
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
							Parámetros Fitosanitarios
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
										Plaga
									</TableCell>
									<TableCell align='center' sx={{ color: theme.palette.primary.contrastText }}>
										País
									</TableCell>
									<TableCell align='center' sx={{ color: theme.palette.primary.contrastText }}>
										Descripción
									</TableCell>
									<TableCell align='center' sx={{ color: theme.palette.primary.contrastText }}>
										Fecha de Notificación
									</TableCell>
								</TableRow>
							</TableHead>

							<TableBody>
								{filteredData.length > 0 ? (
									filteredData.map((row, index) => (
										<TableRow key={index}>
											<TableCell align='center'>{row.plague}</TableCell>
											<TableCell align='center'>{row.country}</TableCell>
											<TableCell align='center'>{row.description}</TableCell>
											<TableCell align='center'>{row.date}</TableCell>
										</TableRow>
									))
								) : (
									<TableRow>
										<TableCell colSpan={4} align="center">
											<Typography variant="body1" color="secondary">
												Utilice los filtros disponibles para precisar su búsqueda
											</Typography>
										</TableCell>
									</TableRow>
								)}
							</TableBody>
						</Table>
					</TableContainer>
				</Box>
			</Paper>
		</>
	);
}

export default PhitosanitaryParams
