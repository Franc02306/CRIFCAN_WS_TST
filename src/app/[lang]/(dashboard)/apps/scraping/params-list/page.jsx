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

      const updatedWebSites = await filterRecentUrls(response.data)

      setWebSites(updatedWebSites)
    } catch (error) {
      console.error('Error al obtener los sitios de scraping: ', error)
      setError('Algo salió mal, intenta de nuevo más tarde')
    } finally {
      setIsLoading(false)
    }
  }, [])

  const filterRecentUrls = async urls => {
    // Mapeo de URLs de listUrls y comparación con getUrlByParams para mantener la más reciente
    const updatedUrls = await Promise.all(
      urls.map(async urlItem => {
        try {
          // Llamo a getUrlByParams pasando el valor del parámetro 'url' directamente
          const { data } = await getUrlByParams(urlItem.url)

          if (data.scraped_data && data.scraped_data.length > 0) {
            // Ordeno las entradas de scraped_data por fecha y mantengo la más reciente
            const sortedData = data.scraped_data.sort((a, b) => new Date(b.Fecha_scrapper) - new Date(a.Fecha_scrapper))
            const recentData = sortedData[0]

            // Devuelvo el objeto actualizado con la fecha más reciente
            return {
              ...urlItem,
              url: recentData.Url,
              updated_at: recentData.Fecha_scrapper
            }
          }
        } catch (error) {
          console.error(`Error al obtener datos de scraping para URL ${urlItem.url}:`, error)
        }

        return urlItem
      })
    )

    return updatedUrls
  }

  const updateSingleWebsite = (siteId, updatedData) => {
    setWebSites(prevWebSites =>
      prevWebSites.map(site =>
        site.id === siteId
          ? { ...site, ...updatedData }
          : site
      )
    )
  }

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

  return <ParamsListIndex webSites={webSites} fetchWebSites={fetchWebSites} updateSingleWebsite={updateSingleWebsite} />
}

export default ParamsListApp
