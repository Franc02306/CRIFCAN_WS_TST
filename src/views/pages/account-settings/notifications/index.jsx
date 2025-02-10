'use client'

// MUI Imports
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Checkbox from '@mui/material/Checkbox'
import MenuItem from '@mui/material/MenuItem'
import Grid from '@mui/material/Grid'
import Button from '@mui/material/Button'

// Component Imports
import Link from '@components/Link'
import Form from '@components/Form'
import CustomTextField from '@core/components/mui/TextField'

// Style Imports
import tableStyles from '@core/styles/table.module.css'

// Vars
const tableData = [
  {
    email: true,
    browser: false,
    type: 'Plaga'
  },
  {
    email: false,
    browser: true,
    type: 'Descubrimiento'
  },
  {
    email: false,
    browser: false,
    type: 'Ambiente'
  }
]

const Notifications = () => {
  return (
    <Card>
      <CardHeader
        title='Configuración de Notificaciones'
        subheader={
          <>
            Personaliza tus notificaciones aquí
            {/* <Link className='text-primary'> Request Permission</Link> */}
          </>
        }
      />
      <Form>
        <div className='overflow-x-auto'>
          <table className={tableStyles.table}>
            <thead>
              <tr>
                <th>Tipo</th>
                <th>Correo</th>
                <th>Navegador</th>
              </tr>
            </thead>
            <tbody className='border-be'>
              {tableData.map((data, index) => (
                <tr key={index}>
                  <td>
                    <Typography color='text.primary'>{data.type}</Typography>
                  </td>
                  <td>
                    <Checkbox defaultChecked={data.email} />
                  </td>
                  <td>
                    <Checkbox defaultChecked={data.browser} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <CardContent>
          {/* <Typography className='mbe-6 font-medium'>When should we send you notifications?</Typography> */}
          <Grid container spacing={6}>
            {/* <Grid item xs={12} sm={6} md={4}>
              <CustomTextField select fullWidth defaultValue='online'>
                <MenuItem value='online'>Only when I&#39;m online</MenuItem>
                <MenuItem value='anytime'>Anytime</MenuItem>
              </CustomTextField>
            </Grid> */}
            <Grid item xs={12} className='flex gap-4 flex-wrap'>
              <Button variant='contained' type='submit'>
                Guardar
              </Button>
              <Button variant='outlined' color='error' type='reset'>
                Descartar
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Form>
    </Card>
  )
}

export default Notifications
