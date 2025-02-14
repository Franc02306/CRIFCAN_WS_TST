'use client'

import { useEffect, useState } from "react"

import { CircularProgress, Box, Typography } from "@mui/material"

import { listData } from '../../../../../service/phitsanitaryService'

import PhitosanitaryNewsIndex from '../../../../../views/apps/phytosanitary-news/index'

const PhitosanitaryNewsApp = () => {
	const [phitsanitarySpecies, setPhitsanitarySpecies] = useState([])
	const [isLoading, setIsLoading] = useState(false)
	const [error, setError] = useState(null)

	const fetchPhytosanitaryData = async () => {
		setIsLoading(true)
		try {
			console.log('Iniciando carga de datos fitosanitarios...')
			const response = await listData()
			console.log('Datos recibidos de la API:', response.data)
			setPhitsanitarySpecies(response.data)
		} catch (err) {
			console.error('Error al obtener datos:', err)
			setError('Error al cargar datos fitosanitarios. Por favor intente nuevamente más tarde.')
		} finally {
			console.log('Finalizado el proceso de carga')
			setIsLoading(false)
		}
	}

	useEffect(() => {
		fetchPhytosanitaryData()
	}, [])

	if (isLoading) {
		return (
			<Box
				sx={{
					display: 'flex',
					justifyContent: 'center',
					alignItems: 'center',
					height: '100vh'
				}}
			>
				<CircularProgress />
			</Box>
		)
	}

	if (error) {
		return (
			<Box
				sx={{
					display: 'flex',
					justifyContent: 'center',
					alignItems: 'center',
					height: '100vh',
					flexDirection: 'column'
				}}
			>
				<Typography variant='h6' color='error'>
					{error} {/* Mostrando el mensaje de error personalizado */}
				</Typography>
			</Box>
		)
	}

	return <PhitosanitaryNewsIndex data={phitsanitarySpecies} />
}

export default PhitosanitaryNewsApp
