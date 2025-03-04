'use client'

import { useCallback, useEffect, useState } from 'react'

import { CircularProgress, Box, Typography } from '@mui/material'

import ParamsListIndex from '../../../../../../views/apps/scraping/params-list/index'

import { listUrls, getUrlByParams } from '../../../../../../service/scraperService'

const ParamsListApp = () => {
  const [webSites, setWebSites] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)

  const fetchWebSites = useCallback(async () => {
    try {
      setIsLoading(true)
      const response = await listUrls()
      
      setWebSites(response.data) // Ahora `response.data` tiene **todos** los registros
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

  return <ParamsListIndex webSites={webSites} fetchWebSites={fetchWebSites} />
}

export default ParamsListApp
