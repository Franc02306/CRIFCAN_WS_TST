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
                    <Typography color='text.primary'>{search.plague}</Typography>
                  </td>
                  <td>
                    <Typography color='text.primary'>{search.country}</Typography>
                  </td>
                  <td>
                    <Typography color='text.primary'>{search.date}</Typography>
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
