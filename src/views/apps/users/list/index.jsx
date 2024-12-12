import { useState, useEffect } from 'react'

import Grid from '@mui/material/Grid'
import Paper from '@mui/material/Paper'
import Box from '@mui/material/Box'
import { Divider } from '@mui/material'


import UserList from './UserList'
import FormList from './FormList'

const UserListIndex = (
  {
    users,
    institutions,
    totalUsers,
    handleUserAdded,
    nextPage,
    previousPage,
    fetchUsers,
    handleUserDeleted,
    handleUserUpdated,
    page,
    setPage,
    resetPage,
    userStatusFilter,
    setUserStatusFilter
  }) => {
  const [filteredUsers, setFilteredUsers] = useState(users)

  useEffect(() => {
    setFilteredUsers(users)
  }, [users])

  const handleSearch = (emailFilter, institutionFilter, countryFilter) => {
    // Aplicamos el filtro y llamamos a resetPage
    resetPage();

    // Filtrar usuarios como antes
    const validUsers = Array.isArray(users) ? users : [];

    const filtered = validUsers.filter(user => {
      const matchesEmail = emailFilter ? user.email?.toLowerCase().includes(emailFilter.toLowerCase()) : true;
      const matchesInstitution = institutionFilter ? user.institution?.id === institutionFilter.id : true;
      const matchesCountry = countryFilter ? user.country?.description?.toLowerCase().includes(countryFilter.toLowerCase()) : true;

      return matchesEmail && matchesInstitution && matchesCountry;
    });

    setFilteredUsers(filtered); // Establece los usuarios filtrados en el estado
  };

  const handleDelete = async () => {
    await handleUserDeleted(); // Usa la función pasada como prop handleUserDeleted
  };

  const handleUpdate = async () => {
    await handleUserUpdated(); // Llamada para actualizar la lista en tiempo real
  };

  return (
    <Paper elevation={3}>
      <Box p={3}>
        <FormList
          onSearch={handleSearch}
          users={users}
          handleUserAdded={handleUserAdded}
          resetPage={resetPage}
        />
      </Box>
      <Divider />
      <Box p={3}>
        <UserList
          initialUsers={filteredUsers}
          institutions={institutions}
          handleUserAdded={handleUserAdded}
          onDelete={handleDelete}
          onUpdate={handleUpdate}
          totalUsers={totalUsers}
          nextPage={nextPage}
          previousPage={previousPage}
          fetchUsers={fetchUsers}
          page={page}
          setPage={setPage}
          userStatusFilter={userStatusFilter}
          setUserStatusFilter={setUserStatusFilter}
        />
      </Box>
    </Paper>
  )
}

export default UserListIndex
