'use client'

import { useEffect, useState } from 'react'

import { CircularProgress, Box, Typography } from '@mui/material'

import { listUser } from '../../../../../../service/userService'

import UsersListIndex from '../../../../../../views/apps/users/list/index'

const UserListApp = () => {
  const [users, setUsers] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)

  //FILTRO PARA LOS ESTADOS DE USUARIO
  const [statusFilter, setStatusFilter] = useState('Activos')

  const getListUsers = async filter => {
    try {
      setIsLoading(true)
      const response = await listUser()

      const filteredUsers = response.data.filter(user => (filter === 'Activos' ? user.is_active : !user.is_active))

      setUsers(filteredUsers)
    } catch (error) {
      console.error('Error en la solicitud:', error)
      setError('Algo salió mal, intenta de nuevo más tarde.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleStatusFilterChange = newFilter => {
    setStatusFilter(newFilter) // Actualiza el estado `statusFilter`
    getListUsers(newFilter) // Llama a `getListUsers` con el nuevo filtro
  }

  const handleUserAdded = async () => {
    await getListUsers(statusFilter)
  }

  useEffect(() => {
    getListUsers(statusFilter)
  }, [statusFilter])

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

  return (
    <UsersListIndex
      users={users}
      onUserAdded={handleUserAdded}
      getListUsers={handleStatusFilterChange}
      statusFilter={statusFilter}
    />
  )
}

export default UserListApp
