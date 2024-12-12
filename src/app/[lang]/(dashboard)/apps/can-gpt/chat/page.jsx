'use client'

import { useEffect, useState } from 'react'

import { CircularProgress, Box, Typography } from '@mui/material'

import CanGptIndex from '../../../../../../views/apps/can-gpt/chat/index'

const CanChatGptPage = () => {
  const [isLoading] = useState(false)
  const [error] = useState(null)

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

  return <CanGptIndex />
}

export default CanChatGptPage
