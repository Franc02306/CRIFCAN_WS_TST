'use client'

// Next Imports
import { useEffect, useState } from 'react'

import dynamic from 'next/dynamic'

// MUI Imports
import Grid from '@mui/material/Grid'

import DetailView from '../../../../../../../../views/apps/users/view/detail-view/index'

import { getUserById } from '../../../../../../../../service/userService'

const VerPage = ({ params }) => {
  // Vars
  const { id } = params

  console.log('id', id)

  // eslint-disable-next-line react-hooks/rules-of-hooks
  const [user, setUser] = useState()

  const getUserId = async id => {
    try {
      const response = await getUserById(id)

      setUser(response.data)
    } catch (error) {
      console.error('Error en la solicitud:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // useEffect(() => {
  //   getUserId(id)
  // }, [id])

  return (
    <Grid container spacing={6}>
      <Grid item xs={12} lg={4} md={5}>
        <DetailView user={user} id={id}></DetailView>
      </Grid>
    </Grid>
  )
}

export default VerPage
