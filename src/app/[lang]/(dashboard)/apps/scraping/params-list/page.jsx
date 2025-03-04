'use client'

import { useCallback, useEffect, useState } from 'react'

import { CircularProgress, Box, Typography } from '@mui/material'

import ParamsListIndex from '../../../../../../views/apps/scraping/params-list/index'

import { listUrls, getUrlByParams } from '../../../../../../service/scraperService'

const ParamsListApp = () => {
  const [webSites, setWebSites] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const [currentPage, setCurrentPage] = useState(1) // PAGINA ACTUAL
  const [nextPage, setNextPage] = useState(null)  // URL DE LA PAGINA SIGUIENTE DE LA API
  const [prevPage, setPrevPage] = useState(null)  // URL DE LA PAGINA ANTERIOR DE LA API
  const [totalRecords, setTotalRecords] = useState(0) // TOTAL DE REGISTROS

  const fetchWebSites = useCallback(async (page = 1) => {
    try {
      setIsLoading(true)

      const response = await listUrls(page)

      setWebSites(response.data.results); // Solo los registros
      setNextPage(response.data.next);  // Guardar la URL de la siguiente página
      setPrevPage(response.data.previous);  // Guardar la URL de la anterior página
      setTotalRecords(response.data.count); // Guardar total de registros
      setCurrentPage(page);  // Actualizar la página actual
    } catch (error) {
      console.error('Error al obtener los sitios de scraping: ', error)
      setError('Algo salió mal, intenta de nuevo más tarde')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchWebSites()
  }, [fetchWebSites])

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

  return (
    <ParamsListIndex
      webSites={webSites}
      fetchWebSites={fetchWebSites}
      currentPage={currentPage}
      nextPage={nextPage}
      prevPage={prevPage}
      totalRecords={totalRecords}
    />
  );
}

export default ParamsListApp
