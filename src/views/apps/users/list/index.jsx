import { Grid } from '@mui/material'

import UserList from './UserList'

const UsersListIndex = ({ users, onUserAdded, getListUsers, statusFilter }) => {
  return (
    <Grid container spacing={6}>
      <Grid item xs={12}>
        <UserList users={users} onUserAdded={onUserAdded} getListUsers={getListUsers} statusFilter={statusFilter} />
      </Grid>
    </Grid>
  )
}

export default UsersListIndex
