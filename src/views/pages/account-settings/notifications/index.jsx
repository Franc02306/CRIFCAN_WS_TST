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

import Link from '@components/Link'
import Form from '@components/Form'
import CustomTextField from '@core/components/mui/TextField'

import tableStyles from '@core/styles/table.module.css'

const Notifications = () => {
  const [savedSearches, setSavedSearches] = useState([])

  useEffect(() => {
    const storedSearches = JSON.parse(localStorage.getItem("savedSearches")) || []

    setSavedSearches(storedSearches)
  }, [])

  const handleDelete = (id) => {
    const updatedSearches = savedSearches.filter((search) => search.id !== id)

    setSavedSearches(updatedSearches)
    localStorage.setItem("savedSearches", JSON.stringify(updatedSearches))
  }

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
              <th>Plaga</th>
              <th>País</th>
              <th>Fecha</th>
            </tr>
          </thead>
          <tbody className='border-be'>
            {savedSearches.length > 0 ? (
              savedSearches.map((search, index) => (
                <tr key={search.id}>
                  <td>
                    <Typography color='text.primary'>{search.name}</Typography>
                  </td>
                  <td>
                    <Typography color='text.primary'>{search.plague}</Typography>
                  </td>
                  <td>
                    <Typography color='text.primary'>{search.country}</Typography>
                  </td>
                  <td>
                    <Typography color='text.primary'>{search.date}</Typography>
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
                <td colSpan={4} style={{ textAlign: 'center', padding: '10px' }}>
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
          <Grid item xs={12} className='flex gap-4 flex-wrap'>
            <Button variant='contained' type='submit'>
              Guardar Cambios
            </Button>
            <Button variant='outlined' color='error' type='reset'>
              Descartar
            </Button>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  )
}

export default Notifications
