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

import { useTheme } from '@emotion/react'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import { DatePicker } from "@mui/x-date-pickers";

import PestControlIcon from '@mui/icons-material/PestControl'

const plagueOptions = ["Pulgón", "Gusano de la hoja", "Araña roja", "Langosta", "Trips", "Minador de hojas"];
const countryOptions = ["Bolivia", "Colombia", "Ecuador", "Perú"];

const PhitosanitaryParams = ({ }) => {
	const theme = useTheme();

	const [selectedPlague, setSelectedPlague] = useState(null);
	const [selectedDate, setSelectedDate] = useState(null);
	const [snackbarOpen, setSnackbarOpen] = useState(false);
	const [snackbarMessage, setSnackbarMessage] = useState('');
	const [selectedCountry, setSelectedCountry] = useState("");

	const handlePlagueChange = (event, newValue) => {
		setSelectedPlague(newValue);
	};

	const handleCloseSnackbar = () => {
		setSnackbarOpen(false);
	};

	const handleCountryChange = (event) => {
		setSelectedCountry(event.target.value);
	};

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
								onChange={handlePlagueChange}
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
								onChange={handleCountryChange}
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
									renderInput={(params) => (
										<TextField
											{...params}
											variant="outlined"
											size="small"
											fullWidth
											sx={{ height: 40, minHeight: 40 }} // 🔹 Altura uniforme
											InputProps={{
												...params.InputProps,
												sx: { height: 40, minHeight: 40, padding: "0 14px" } // 🔹 Ajuste interno
											}}
										/>
									)}
								/>
							</LocalizationProvider>
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
									<TableCell
										align='center'
										sx={{
											minWidth: '150px',
											maxWidth: '300px',
											wordBreak: 'break-word',
											whiteSpace: 'normal',
											color: theme.palette.primary.contrastText
										}}
									>
										Plaga
									</TableCell>
									<TableCell
										align='center'
										sx={{
											minWidth: '150px',
											maxWidth: '80vh',
											wordBreak: 'break-word',
											whiteSpace: 'normal',
											color: theme.palette.primary.contrastText
										}}
									>
										Descripción
									</TableCell>
									<TableCell align='center' sx={{ color: theme.palette.primary.contrastText }}>
										Fecha de Notificación
									</TableCell>
									<TableCell align='center' sx={{ color: theme.palette.primary.contrastText }}>
										Acciones
									</TableCell>
								</TableRow>
							</TableHead>

							<TableBody>
								<TableRow>
									<TableCell colSpan={4} align="center">
										<Typography variant="body1" color="secondary">
											No se encontraron registros.
										</Typography>
									</TableCell>
								</TableRow>
							</TableBody>
						</Table>
					</TableContainer>
				</Box>

				<Snackbar
					open={snackbarOpen}
					onClose={handleCloseSnackbar}
					anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
				>
					<Alert
						onClose={handleCloseSnackbar}
						severity='info'
						sx={{
							width: '100%',
							backgroundColor: 'rgba(100, 200, 255, 0.8)',
							color: '#000',
							fontWeight: '600',
							boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.9)'
						}}
					>
						{snackbarMessage}
					</Alert>
				</Snackbar>
			</Paper>
		</>
	);
}

export default PhitosanitaryParams
