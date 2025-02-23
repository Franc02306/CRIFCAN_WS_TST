'use client'

import { useEffect, useState } from 'react'

import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Checkbox from '@mui/material/Checkbox'
import MenuItem from '@mui/material/MenuItem'
import Grid from '@mui/material/Grid'
import Button from '@mui/material/Button'
import IconButton from '@mui/material/IconButton'
import Tooltip from '@mui/material/Tooltip'
import DeleteIcon from '@mui/icons-material/Delete'
import Swal from 'sweetalert2'
import { useTheme } from '@emotion/react'

import Link from '@components/Link'
import Form from '@components/Form'
import CustomTextField from '@core/components/mui/TextField'

import tableStyles from '@core/styles/table.module.css'


// IMPORTACION DE SERVICIOS
import { listSubscription, deleteSubscription } from '../../../../service/phitsanitaryService'

const Notifications = () => {
  const theme = useTheme();
  const [savedSearches, setSavedSearches] = useState([])

  const fetchSearches = async () => {
    try {
      const response = await listSubscription()

      if (response && response.data) {
        setSavedSearches(response.data)
      } else {
        setSavedSearches([])
      }
    } catch (error) {
      console.error("Error al obtener las busquedas: ", error)
      setSavedSearches([])
    }
  }

  useEffect(() => {
    fetchSearches()
  }, [])

  const handleDelete = async (id) => {
    const titleColor = theme.palette.mode === 'dark' ? '#FFFFFF' : '#000000';
    const backgroundColor = theme.palette.background.paper;
    const confirmButtonColor = theme.palette.primary.main;
    const cancelButtonColor = theme.palette.error.main;

    const confirmDelete = await Swal.fire({
      html: `
            <span style="font-family: Arial, sans-serif; font-size: 28px; color: ${titleColor};">
                ¿Estás seguro de eliminar esta búsqueda?
            </span>
        `,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
      confirmButtonColor: confirmButtonColor,
      cancelButtonColor: cancelButtonColor,
      background: backgroundColor
    });

    if (confirmDelete.isConfirmed) {
      try {
        await deleteSubscription(id);
        setSavedSearches((prevSearches) => prevSearches.filter((search) => search.id !== id));

        Swal.fire({
          html: `
                <span style="font-family: Arial, sans-serif; font-size: 28px; color: ${titleColor};">
                    Búsqueda eliminada con éxito
                </span>
                `,
          icon: "success",
          confirmButtonText: "Aceptar",
          confirmButtonColor: confirmButtonColor,
          background: backgroundColor
        });
      } catch (error) {
        console.error("Error al borrar la búsqueda: ", error);
        Swal.fire({
          html: `
                <span style="font-family: Arial, sans-serif; font-size: 28px; color: ${titleColor};">
                    Error al eliminar
                </span>
                `,
          icon: "error",
          confirmButtonText: "Aceptar",
          confirmButtonColor: confirmButtonColor,
          background: backgroundColor
        });
      }
    }
  };

  return (
    <Card>
      <CardHeader
        title='Búsquedas Guardadas'
        subheader='Aquí puedes ver las búsquedas que has guardado recientemente'
      />

      <div className='overflow-x-auto'>
        <table className={tableStyles.table}>
          <thead>
            <tr>
              <th>Nombre de la Búsqueda</th>
              <th>Nombre Científico</th>
              <th>Distribución</th>
              <th>Hospedante</th>
            </tr>
          </thead>
          <tbody className='border-be'>
            {savedSearches.length > 0 ? (
              savedSearches.map((search) => (
                <tr key={search.id}>
                  <td>
                    <Typography color='text.primary'>{search.name_subscription}</Typography>
                  </td>
                  <td>
                    <Typography color='text.primary'>{search.scientific_name}</Typography>
                  </td>
                  <td>
                    <Typography color='text.primary'>{search.distribution}</Typography>
                  </td>
                  <td>
                    <Typography color='text.primary'>{search.hosts}</Typography>
                  </td>
                  <td>
                    <Tooltip title='Borrar Búsqueda' arrow>
                      <Button variant='outlined' color='error' onClick={() => handleDelete(search.id)}>
                        <DeleteIcon />
                      </Button>
                    </Tooltip>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} style={{ textAlign: 'center', padding: '10px' }}>
                  <Typography variant='body1' color='text.secondary'>
                    No hay búsquedas guardadas.
                  </Typography>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <CardContent>
        <Grid container spacing={6}>
        </Grid>
      </CardContent>
    </Card>
  )
}

export default Notifications
