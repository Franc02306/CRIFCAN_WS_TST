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
			const response = await listData()

			const cleanedData = response.data.map(item => {
				const cleanedItem = {};

				Object.keys(item).forEach(key => {
					if (typeof item[key] === "string") {
						cleanedItem[key] = item[key].replace(/^\[\"?|\]\"?$/g, ""); // Elimina los corchetes
					} else {
						cleanedItem[key] = item[key]; // Mantiene otros tipos de datos sin cambios
					}
				});

				return cleanedItem;
			});

			setPhitsanitarySpecies(cleanedData);
		} catch (err) {
			setError('Error al cargar datos fitosanitarios. Por favor intente nuevamente más tarde.')
		} finally {
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
