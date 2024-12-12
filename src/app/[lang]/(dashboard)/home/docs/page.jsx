'use client'

import { useEffect } from 'react';

import { useRouter } from 'next/navigation';

import { useSession } from 'next-auth/react';
import { Box, Typography } from '@mui/material';

const Page = () => {
  const { data: session, status } = useSession();
  const router = useRouter();

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
          Bienvenido al Portal Colaborativo
        </Typography>
        <Typography variant='h5' align='center' sx={{ mt: 6, fontWeight: 200 }}>
          ¡Descubre todo lo que el Portal Colaborativo tiene para ofrecer!
        </Typography>
      </Box>
    </div>
  );
}

export default Page;
