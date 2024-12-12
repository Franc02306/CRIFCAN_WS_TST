import { Grid } from '@mui/material'

import UserDetail from './UserDetail'

const DetailView = ({ id, user }) => {
  return (
    <Grid container spacing={6}>
      <Grid item xs={12}>
        <UserDetail user={user} id={id} />
      </Grid>
    </Grid>
  )
}

export default DetailView
