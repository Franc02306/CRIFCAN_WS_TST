import { useEffect, useState } from 'react'

import Image from 'next/image'

import Grid from '@mui/material/Grid'
import Card from '@mui/material/Card'
import Typography from '@mui/material/Typography'
import CardContent from '@mui/material/CardContent'
import CardMedia from '@mui/material/CardMedia'
import { Box, Divider } from '@mui/material'

import { getUserById } from '../../../../service/userService'

const coverImg = '/images/pages/LogoSGCAN (horizontal).png'

const AboutOverview = ({ data }) => {
  const [userData, setUserData] = useState(null)

  const callUserById = async (userId) => {
    try {
      const response = await getUserById(userId)

      console.log("usuario: ", response.data)
      setUserData(response.data)
    } catch (error) {
      console.error("Error al invocar al usuario: ", error)
    }
  }

  useEffect(() => {
    if (data?.id) {
      callUserById(data.id)
    }
  }, [data])

  return (
    <Grid container spacing={6}>
      <Grid item xs={12}>
        <Card sx={{ borderRadius: 1, maxWidth: '100%', margin: '0 auto' }}>
          <CardMedia sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
            <Box
              sx={{
                width: '100%',
                maxWidth: 500,
                overflow: 'hidden'
              }}
            >
              <Image
                src={coverImg}
                alt='Profile Banner'
                layout='responsive'
                width={300}
                height={100}
                objectFit='contain'
              />
            </Box>
          </CardMedia>
          <Divider />
          <CardContent className='flex flex-col gap-6'>
            <div className='flex flex-col gap-4'>
              <Typography color='Active'>
                Nombre Completo: {userData?.username || ''} {userData?.last_name || ''}
              </Typography>
            </div>

            <div className='flex flex-col gap-4'>
              <Typography color='Active'>
                Correo Electrónico: {userData?.email || ''}
              </Typography>
            </div>

            <div className='flex flex-col gap-4'>
              <Typography color='Active'>
                Estado: {userData?.is_active ? 'Activo' : 'Inactivo'}
              </Typography>
            </div>

            <div className='flex flex-col gap-4'>
              <Typography color='Active'>
                Rol de Sistema: {userData?.system_role_description || ''}
              </Typography>
            </div>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  )
}

export default AboutOverview
