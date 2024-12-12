'use client'

import { Grid } from '@mui/material'

import { useSession } from 'next-auth/react'

import CommitteGroups from './GroupList'


const GroupListIndex = () => {
  return (
    <Grid container spacing={6}>
      <Grid item xs={12}>
        <CommitteGroups />
      </Grid>
    </Grid>
  )
}

export default GroupListIndex
