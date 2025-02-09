'use client'

import { useEffect, useState } from "react"

import { CircularProgress, Box, Typography } from "@mui/material"

import PhitosanitaryNewsIndex from '../../../../../views/apps/phytosanitary-news/index'

const PhitosanitaryNewsApp = () => {
	const [isLoading, setIsLoading] = useState(false)
	const [error, setError] = useState(null)

	const staticData = [
		{ country: "Perú", plague: "Pulgón", description: "Insecto que se alimenta de la savia de las plantas.", date: "2024-02-09" },
		{ country: "Colombia", plague: "Gusano de la hoja", description: "Larva que se alimenta de hojas y tallos tiernos.", date: "2024-02-08" },
		{ country: "Ecuador", plague: "Araña roja", description: "Ácaro que daña las hojas al extraer su jugo.", date: "2024-02-07" },
		{ country: "Bolivia", plague: "Langosta", description: "Insecto que causa daño severo a los cultivos en grandes grupos.", date: "2024-02-06" },
		{ country: "Colombia", plague: "Trips", description: "Pequeños insectos que dañan las hojas al succionar su contenido.", date: "2024-02-05" },
		{ country: "Bolivia", plague: "Minador de hojas", description: "Larvas que crean galerías dentro de las hojas.", date: "2024-02-04" },
		{ country: "Perú", plague: "Pulgón", description: "Plaga común en cultivos agrícolas y ornamentales.", date: "2024-02-03" },
		{ country: "Ecuador", plague: "Gusano de la hoja", description: "Provoca defoliación en árboles y arbustos.", date: "2024-02-02" },
		{ country: "Ecuador", plague: "Araña roja", description: "Causa debilitamiento de la planta y caída prematura de hojas.", date: "2024-02-01" },
		{ country: "Perú", plague: "Langosta", description: "Forma enjambres devastadores para la agricultura.", date: "2024-01-31" },
		{ country: "Colombia", plague: "Trips", description: "Dañan los tejidos vegetales provocando manchas en hojas y frutos.", date: "2024-01-30" },
		{ country: "Bolivia", plague: "Minador de hojas", description: "Suele atacar cítricos y otras plantas ornamentales.", date: "2024-01-29" },
	]

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

	return <PhitosanitaryNewsIndex data={staticData} />
}

export default PhitosanitaryNewsApp
