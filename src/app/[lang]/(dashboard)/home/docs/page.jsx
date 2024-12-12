'use client'

import { useEffect } from 'react'

import { useRouter } from 'next/navigation'

import { useSession } from 'next-auth/react'
import Swal from 'sweetalert2'
import { Box, Typography } from '@mui/material'

const Page = () => {
  // const { data: session, status } = useSession();
  // const router = useRouter();

  // useEffect(() => {
  //   console.log(status)
  //   console.log(session)

  //   if (status === 'unauthenticated') {
  //     Swal.fire({
  //       title: 'Sesión Expirada',
  //       text: 'Tu sesión ha expirado, por favor inicia sesión nuevamente.',
  //       icon: 'warning',
  //       confirmButtonText: 'Iniciar sesión'
  //     }).then(() => {
  //       router.push('/login');
  //     });
  //   }
  // }, [status, router]);

  return (
    <div>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '80vh',
          flexDirection: 'column'
        }}
      >
        <Typography variant='h4' align='center'>
          Bienvenido al portal Web Scraper
          </Typography>
        <Typography variant='h5' align='center' sx={{ mt: 6, fontWeight: 200 }}>
          ¡Comienza tu búsqueda ahora y descubre todo lo que el portal Web Scraper tiene para ofrecer!
        </Typography>
      </Box>
    </div>
  )
}

export default Page
