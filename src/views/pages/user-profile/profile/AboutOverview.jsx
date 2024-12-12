import Image from 'next/image'

import Grid from '@mui/material/Grid'
import Card from '@mui/material/Card'
import Typography from '@mui/material/Typography'
import CardContent from '@mui/material/CardContent'
import CardMedia from '@mui/material/CardMedia'
import { Box, Divider } from '@mui/material'

const coverImg = '/images/pages/LogoSGCAN (horizontal).png'

const AboutOverview = ({ data }) => {

  return (
    <Grid container spacing={6}>
      <Grid item xs={12}>
        <Card sx={{ borderRadius: 1 }}>
          <CardMedia sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
            <Box
              sx={{
                width: '100%',
                maxWidth: 500,

                // border: '1px solid #ddd',
                // backgroundColor: 'rgba(245, 245, 245, 0.2)',

                // borderRadius: 1,
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
                Nombres completo: {data?.name} {data?.apellidos}
              </Typography>
            </div>

            <div className='flex flex-col gap-4'>
              <Typography color='Active'>
                Email: {data?.email}
              </Typography>
            </div>

            <div className='flex flex-col gap-4'>
              <Typography color='Active'>
                Estado: {data?.is_active ? 'Activo' : 'Desativado'}
              </Typography>
            </div>

            <div className='flex flex-col gap-4'>
              <Typography color='Active'>
                Rol de Sistema: {data?.system_role_description}
              </Typography>
            </div>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  )
}

export default AboutOverview
