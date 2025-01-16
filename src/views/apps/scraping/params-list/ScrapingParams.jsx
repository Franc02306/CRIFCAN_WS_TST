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
  Alert
} from '@mui/material'

import Swal from 'sweetalert2'
import { useTheme } from '@emotion/react'

import AddIcon from '@mui/icons-material/Add'
import UpdateIcon from '@mui/icons-material/Update'
import EditIcon from '@mui/icons-material/Edit'
import SearchIcon from '@mui/icons-material/Search'
import DescriptionIcon from '@mui/icons-material/Description'

// IMPORTACIÓN VENTANA MODAL
import ParamsModal from '../modal/ParamsModal'
import ViewUrlModal from '../modal/ViewUrlModal'

// IMPORTACIÓN DE SERVICIOS
import { scrapUrl, updateUrl } from '../../../../service/scraperService'

// OPCIONES DE FRECUENCIA DE SCPAPEO
const frequencyOptions = [
  { id: 1, label: 'Mensual' },
  { id: 2, label: 'Trimestral' },
  { id: 3, label: 'Semestral' }
]

const ScrapingParams = ({ webSites, fetchWebSites, updateSingleWebsite }) => {
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [order, setOrder] = useState('asc')
  const [orderBy, setOrderBy] = useState('sobrenombre')
  const [selectedWeb, setSelectedWeb] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState('create')
  const [isUrlModalOpen, setIsUrlModalOpen] = useState(false)
  const [selectedUrl, setSelectedUrl] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [loadingSite, setLoadingSite] = useState(null)
  const [snackbarOpen, setSnackbarOpen] = useState(false)
  const [snackbarMessage, setSnackbarMessage] = useState('')

  const theme = useTheme()

  // VARIABLES PARA EL TEMA SWAL
  const titleColor = theme.palette.mode === 'dark' ? '#FFFFFF' : '#000000'
  const backgroundColor = theme.palette.background.paper
  const confirmButtonColor = theme.palette.primary.main
  const cancelButtonColor = theme.palette.error.main

  const handleRequestSort = property => {
    const isAsc = orderBy === property && order === 'asc'

    setOrder(isAsc ? 'desc' : 'asc')
    setOrderBy(property)
  }

  const filteredWebSites = useMemo(() => {
    return (webSites || []).filter(site => site.sobrenombre?.toLowerCase().includes(searchTerm.toLowerCase()))
  }, [webSites, searchTerm])

  const sortedWebSites = useMemo(() => {
    return [...filteredWebSites].sort((a, b) => {
      const valueA = a[orderBy]?.toLowerCase() || ''
      const valueB = b[orderBy]?.toLowerCase() || ''

      // Si uno de los valores es vacío o nulo, lo coloca al final
      if (!valueA && valueB) return 1 // `a` vacío, va después
      if (!valueB && valueA) return -1 // `b` vacío, va después

      return order === 'asc' ? valueA.localeCompare(valueB) : valueB.localeCompare(valueA)
    })
  }, [filteredWebSites, order, orderBy])

  const handleSearchChange = event => {
    setSearchTerm(event.target.value)
    setPage(0)
  }

  const handleChangePage = (event, newPage) => setPage(newPage)

  const handleChangeRowsPerPage = event => {
    setRowsPerPage(parseInt(event.target.value, 10))
    setPage(0)
  }

  const handleOpenModal = (web = null) => {
    setSelectedWeb(web)
    setModalMode(web ? 'edit' : 'create')
    setIsModalOpen(true)
  }

  const handleOpenUrlModal = url => {
    setSelectedUrl(url)
    setIsUrlModalOpen(true)
  }

  const handleCloseModal = () => {
    setSelectedWeb(null)
    setIsModalOpen(false)
    setModalMode('create')
  }

  const handleCloseUrlModal = () => {
    setSelectedUrl('')
    setIsUrlModalOpen(false)
  }

  const handleFrequencyChange = async (event, site) => {
    const newFrequency = event.target.value

    const payload = {
      url: site.url,
      sobrenombre: site.sobrenombre,
      time_choices: newFrequency
    }

    try {
      await updateUrl(site.id, payload)
      Swal.fire({
        html: `<span style="font-family: Arial, sans-serif; font-size: 28px; color: ${titleColor};">Frecuencia de Scrapeo actualizada con éxito</span>`,
        icon: 'success',
        confirmButtonText: 'Aceptar',
        confirmButtonColor: theme.palette.primary.main,
        background: theme.palette.background.paper,
        timer: 4000
      })
      fetchWebSites()
    } catch (error) {
      console.error('Error actualizando la frecuencia:', error)
      Swal.fire({
        icon: 'error',
        html: `<span style="font-family: Arial, sans-serif; font-size: 26px; color: ${titleColor};">Error al actualizar Frecuencia de Scrapeo</span>`,
        confirmButtonColor: theme.palette.error.main,
        background: theme.palette.background.paper
      })
    }
  }

  const handleScrapSite = async site => {
    const result = await Swal.fire({
      html: `<span style="font-family: Arial, sans-serif; font-size: 28px; color: ${titleColor};">¿Quieres ejecutar el Scrapeo para esta URL?</span>`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, ejecutar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: confirmButtonColor,
      cancelButtonColor: cancelButtonColor,
      background: backgroundColor
    })

    if (result.isConfirmed) {
      try {
        setLoadingSite(site.id)
        const response = await scrapUrl({ url: site.url, tipo: site.type_file })

        setSnackbarMessage(response.data.Mensaje || 'Los datos han sido scrapeados correctamente.')
        setSnackbarOpen(true)

        updateSingleWebsite(site.id, {
          updated_at: new Date().toISOString(), // Fecha de última actualización
          // status: 'completado' // Ejemplo de estado que puede cambiar
        })

        // fetchWebSites() // Actualización en tiempo real

      } catch (error) {
        console.error('Error ejecutando el scraping:', error)
        setSnackbarMessage('Hubo un error ejecutando el Scrapeo')
        setSnackbarOpen(true)
      } finally {
        setLoadingSite(null)
      }
    } else {
      setLoadingSite(null)
    }
  }

  const handleCloseSnackbar = () => setSnackbarOpen(false)

  return (
    <>
      <Paper sx={{ width: '100%', overflow: 'hidden', marginTop: 3 }}>
        <Box sx={{ padding: 5 }}>
          <Grid container spacing={2} alignItems='center' sx={{ marginBottom: 2 }}>
            {/* Filtro por fuente web */}
            <Grid item xs={12} md>
              <TextField
                label='Buscar por Fuente Web'
                type='text'
                size='small'
                autoComplete='off'
                onChange={handleSearchChange}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position='start'>
                      <SearchIcon />
                    </InputAdornment>
                  )
                }}
                style={{ marginRight: '5px', width: '300px' }}
              />
            </Grid>

            {/* <Grid item xs={12} md='auto'>
            <Button variant='contained' color='primary' startIcon={<AddIcon />} onClick={() => handleOpenModal()}>
              Agregar Fuente Web
            </Button>
          </Grid> */}
          </Grid>
        </Box>

        <Box sx={{ padding: '0' }}>
          <Divider sx={{ width: '100%' }} />
        </Box>

        <Box sx={{ padding: 5 }}>
          <Grid container spacing={2} alignItems='center' sx={{ marginBottom: 2 }}>
            <Typography variant='h5' sx={{ fontWeight: 'bold', marginLeft: '12px', marginBottom: '10px' }}>
              Parámetros de Scrapeo
            </Typography>
          </Grid>

          <TableContainer
            sx={{
              marginTop: 2,
              borderRadius: 1.5, // Curva los bordes del contenedor
              overflow: 'hidden', // Evita que los elementos se desborden
              overflowX: 'auto'
            }}
          >
            <Table
              sx={{
                '& .MuiTableCell-root': {
                  border:
                    theme.palette.mode === 'light'
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
                      minWidth: '150px', // Establece un ancho mínimo
                      maxWidth: '300px',
                      wordBreak: 'break-word',
                      whiteSpace: 'normal',
                      color: theme.palette.primary.contrastText
                    }}
                  >
                    <TableSortLabel
                      active={orderBy === 'sobrenombre'}
                      direction={orderBy === 'sobrenombre' ? order : 'asc'}
                      onClick={() => handleRequestSort('sobrenombre')}
                      sx={{
                        color: theme.palette.primary.contrastText + ' !important',
                        '& .MuiTableSortLabel-icon': {
                          color: theme.palette.primary.contrastText + ' !important'
                        },
                        '&.Mui-active': {
                          color: theme.palette.primary.contrastText + ' !important',
                          '& .MuiTableSortLabel-icon': {
                            color: theme.palette.primary.contrastText + ' !important'
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
                      minWidth: '150px', // Establece un ancho mínimo
                      maxWidth: '80vh',
                      wordBreak: 'break-word',
                      whiteSpace: 'normal',
                      color: theme.palette.primary.contrastText
                    }}
                  >
                    Enlace Web
                  </TableCell>
                  <TableCell align='center' sx={{ color: theme.palette.primary.contrastText }}>
                    Frecuencia de Scrapeo
                  </TableCell>
                  <TableCell align='center' sx={{ color: theme.palette.primary.contrastText }}>
                    Fecha de Creación
                  </TableCell>
                  <TableCell align='center' sx={{ color: theme.palette.primary.contrastText }}>
                    Última Fecha de Scrapeo
                  </TableCell>
                  <TableCell align='center' sx={{ color: theme.palette.primary.contrastText }}>
                    Acciones
                  </TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {sortedWebSites.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center">
                      <Typography variant="body1" color="secondary">
                        No se encontraron registros de fuentes web.
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  sortedWebSites.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map(site => (
                    <TableRow key={site.id} sx={{ '&:hover': { backgroundColor: theme.palette.action.hover } }}>
                      <TableCell
                        align="center"
                        sx={{
                          minWidth: '150px', // Establece un ancho mínimo
                          maxWidth: '300px',
                          wordBreak: 'break-word',
                          whiteSpace: 'normal',
                        }}
                      >
                        {site.sobrenombre}
                      </TableCell>
                      <TableCell
                        align="center"
                        sx={{
                          minWidth: '150px', // Establece un ancho mínimo
                          maxWidth: '80vh',
                          wordBreak: 'break-word',
                          whiteSpace: 'normal',
                          color: theme.palette.primary.contrastText,
                        }}
                      >
                        <span
                          onClick={() => handleOpenUrlModal(site.url)}
                          style={{
                            cursor: 'pointer',
                            fontWeight: 'bold',
                            textDecoration: 'underline',
                            color: theme.palette.mode === 'dark' ? 'white' : 'black',
                            '&:hover': { color: theme.palette.mode === 'dark' ? 'lightgray' : 'secondary.main' },
                          }}
                        >
                          {site.url.length > 100 ? `${site.url.slice(0, 100)}...` : site.url}
                        </span>
                      </TableCell>
                      <TableCell align="center">
                        <Select
                          value={site.time_choices} // El valor inicial de la frecuencia
                          onChange={e => handleFrequencyChange(e, site)} // Maneja el cambio de frecuencia
                          fullWidth
                          size="small"
                        >
                          {frequencyOptions.map(option => (
                            <MenuItem key={option.id} value={option.id}>
                              {option.label}
                            </MenuItem>
                          ))}
                        </Select>
                      </TableCell>
                      <TableCell align="center">{new Date(site.created_at).toLocaleDateString()}</TableCell>
                      <TableCell align="center">
                        {site.fecha_scraper && !isNaN(new Date(site.fecha_scraper))
                          ? new Date(site.fecha_scraper).toLocaleDateString()
                          : "No scrapeado hasta la fecha"}
                      </TableCell>
                      <TableCell align="center">
                        {loadingSite === site.id ? (
                          <Box display="flex" alignItems="center" justifyContent="center" gap={1}>
                            <Typography variant="body2">Scrapeando...</Typography> {/* Texto "Scrapeando..." */}
                            <CircularProgress size={20} /> {/* Spinner */}
                          </Box>
                        ) : (
                          <>
                            <Tooltip title="Editar">
                              <IconButton color="info" onClick={() => handleOpenModal(site)}>
                                <EditIcon />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Scrapear">
                              <IconButton color="success" onClick={() => handleScrapSite(site)}>
                                <UpdateIcon />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Registro de Actividad">
                              <IconButton>
                                <DescriptionIcon />
                              </IconButton>
                            </Tooltip>
                          </>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'flex-start', paddingLeft: 2 }}>
          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component='div'
            count={sortedWebSites.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            labelRowsPerPage='Sitios por página'
          />
        </Box>

        <ParamsModal
          open={isModalOpen}
          setIsModalOpen={setIsModalOpen}
          onClose={handleCloseModal}
          web={selectedWeb}
          mode={modalMode}
          fetchWebSites={fetchWebSites}
        />
        <ViewUrlModal url={selectedUrl} open={isUrlModalOpen} onClose={handleCloseUrlModal} />
      </Paper>

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
    </>
  )
}

export default ScrapingParams
