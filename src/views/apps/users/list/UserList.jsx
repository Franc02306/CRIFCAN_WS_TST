'use client'

import { useEffect, useMemo, useState } from 'react'

import Link from 'next/link'
import { useParams } from 'next/navigation'

import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import Paper from '@mui/material/Paper'
import Typography from '@mui/material/Typography'
import Chip from '@mui/material/Chip'
import TablePagination from '@mui/material/TablePagination'
import Toolbar from '@mui/material/Toolbar'
import Box from '@mui/material/Box'
import { Divider, FormControl, IconButton, InputLabel, MenuItem, Select, TableSortLabel, Tooltip } from '@mui/material'
import { useTheme } from '@emotion/react'
import Swal from 'sweetalert2'

import VisibilityIcon from '@mui/icons-material/Visibility'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import RestoreFromTrashIcon from '@mui/icons-material/RestoreFromTrash';

import UserModal from '../create/UserModal'
import { getLocalizedUrl } from '@/utils/i18n'

// IMPORTACIONES DE SERVICIOS
import { deleteUser, updateUserById } from '../../../../service/userService'
import { getCustomGroups } from '../../../../service/groupService'

const UserList = (
  {
    initialUsers,
    institutions,
    onDelete,
    onUpdate,
    totalUsers,
    handleUserAdded,
    nextPage,
    previousPage,
    fetchUsers,
    page,
    setPage,
    userStatusFilter,
    setUserStatusFilter
  }
) => {
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [editUserOpen, setEditUserOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState(null)
  const [order, setOrder] = useState('asc');
  const [orderBy, setOrderBy] = useState('username');
  const [isLoading, setIsLoading] = useState(false);

  const { lang: locale } = useParams()
  const theme = useTheme()

  // VARIABLES DE USETHEME
  const titleColor = theme.palette.mode === 'dark' ? '#FFFFFF' : '#000000'
  const backgroundColor = theme.palette.background.paper
  const confirmButtonColor = theme.palette.primary.main
  const cancelButtonColor = theme.palette.error.main

  const columns = useMemo(
    () => [
      { id: 'username', label: 'Nombres' },
      { id: 'last_name', label: 'Apellidos' },
      { id: 'email', label: 'Correo Electrónico' },
      { id: 'system_role', label: 'Rol de Sistema' },
      { id: 'identification', label: 'Identificación', width: 130 },
      { id: 'numero_identification', label: 'Número Identificación', width: 130 },
      { id: 'institution', label: 'Institución', width: 130 },
      { id: 'country', label: 'Nacionalidad', width: 130 },
      { id: 'status', label: 'Estados', width: 130 },
      { id: 'Fecha de Creacion', label: 'Fecha de Creación', width: 130 },
      { id: 'Acciones', label: 'Acciones', width: 130 }
    ],
    []
  )

  const handleRequestSort = (property) => {
    const isAsc = orderBy === property && order === 'asc';

    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const sortedUsers = useMemo(() => {
    return [...initialUsers]
      .sort((a, b) => {
        const valueA = a[orderBy]?.toLowerCase() || '';
        const valueB = b[orderBy]?.toLowerCase() || '';

        if (valueA < valueB) return order === 'asc' ? -1 : 1;
        if (valueA > valueB) return order === 'asc' ? 1 : -1;

        return 0;
      });
  }, [initialUsers, order, orderBy]);

  const handleChangePage = async (event, newPage) => {
    setPage(newPage);

    if (newPage > page && nextPage) {
      await fetchUsers(nextPage);  // Cargar la siguiente página
    } else if (newPage < page && previousPage) {
      await fetchUsers(previousPage);  // Cargar la página anterior
    }
  };

  const handleChangeRowsPerPage = (event) => {
    const newRowsPerPage = parseInt(event.target.value, 10);

    setRowsPerPage(newRowsPerPage);  // Cambiar filas por página
    setPage(0);  // Reiniciar a la primera página
  };

  const paginatedUsers = useMemo(() => {
    const usersWithInstitutions = sortedUsers.map(user => {
      const institution = institutions.find(inst => inst.id === user.institution?.id);
      const institutionName = institution ? (institution.is_active ? institution.name : 'Sin institución') : 'Sin institución';

      return { ...user, institutionName };
    });

    // Aplicar la lógica de paginación
    return usersWithInstitutions.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
  }, [sortedUsers, institutions, page, rowsPerPage]);

  const showAlertDeleteQuestion = async id => {
    const result = await Swal.fire({
      html: `<span style="font-family: Arial, sans-serif; font-size: 28px; color: ${titleColor};">¿Está seguro que desea eliminar este usuario?</span>`,
      icon: 'warning',
      showCancelButton: true,
      showConfirmButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: confirmButtonColor,
      cancelButtonColor: cancelButtonColor,
      background: backgroundColor
    })

    if (result.isConfirmed) {
      try {
        await deleteUser(id);

        // Actualizar la lista filtrando los usuarios activos
        const updatedUsers = initialUsers.filter(user => user.id !== id && user.is_active);

        onDelete(); // Llamar al callback con la lista actualizada

        await Swal.fire({
          html: `<span style="font-family: Arial, sans-serif; font-size: 28px; color: ${titleColor};">Usuario eliminado exitosamente</span>`,
          icon: 'success',
          confirmButtonText: 'Aceptar',
          confirmButtonColor: confirmButtonColor,
          background: backgroundColor,
          timer: 4000,
        });
      } catch (error) {
        console.error('Error al eliminar el usuario:', error);
        await Swal.fire({
          html: `<span style="font-family: Arial, sans-serif; font-size: 28px; color: ${titleColor};">Error al eliminar el usuario</span>`,
          icon: 'error',
          confirmButtonColor: confirmButtonColor,
          background: backgroundColor,
        });
      }
    }
  };

  const showAlertRestoreQuestion = async id => {
    const result = await Swal.fire({
      html: `<span style="font-family: Arial, sans-serif; font-size: 28px; color: ${titleColor};">¿Está seguro que desea restaurar este usuario?</span>`,
      icon: 'warning',
      showCancelButton: true,
      showConfirmButton: true,
      confirmButtonText: 'Sí, restaurar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: confirmButtonColor,
      cancelButtonColor: cancelButtonColor,
      background: backgroundColor
    })

    if (result.isConfirmed) {
      try {
        await updateUserById(id, { is_active: true, deleted_at: null })

        await onUpdate();

        await Swal.fire({
          html: `<span style="font-family: Arial, sans-serif; font-size: 28px; color: ${titleColor};">Usuario restaurado exitosamente</span>`,
          icon: 'success',
          confirmButtonText: 'Aceptar',
          confirmButtonColor: confirmButtonColor,
          background: backgroundColor,
          timer: 4000,
        });
      } catch (error) {
        console.error('Error al eliminar el usuario:', error);
        await Swal.fire({
          html: `<span style="font-family: Arial, sans-serif; font-size: 28px; color: ${titleColor};">Error al restaurar el usuario</span>`,
          icon: 'error',
          confirmButtonColor: confirmButtonColor,
          background: backgroundColor,
        });
      }
    }
  }

  const handleEditClick = user => {
    setSelectedUser(user)
    setEditUserOpen(true)
  }

  const handleUserUpdated = async () => {
    await onUpdate(); // Se actualiza la lista de usuarios
  };

  return (
    <>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 3, marginTop: 2.5, marginLeft: 3 }}>
        <Typography variant='h5' sx={{ fontWeight: 'bold', marginLeft: '2px', marginBottom: '10px' }}>
          Lista de Usuarios
        </Typography>

        <FormControl sx={{ minWidth: 230, marginRight: 3 }} size="small">
          <InputLabel>Filtrar por Estado</InputLabel>
          <Select
            value={userStatusFilter}
            onChange={(e) => setUserStatusFilter(e.target.value)}
            label="Filtrar por Estado"
          >
            <MenuItem value="Activos">Activos</MenuItem>
            <MenuItem value="Inactivos">Inactivos</MenuItem>
          </Select>
        </FormControl>
      </Box>
      <Box sx={{ padding: '0 10px' }}>
        <TableContainer sx={{ borderRadius: '8px' }}>
          <Table
            sx={{
              '& .MuiTableCell-root': {
                border: theme.palette.mode === 'light'
                  ? '1px solid rgba(0, 0, 0, 0.35)'  // Borde negro translúcido en tema claro
                  : '1px solid rgba(255, 255, 255, 0.12)',  // Borde blanco translúcido en tema oscuro
              },
            }}
          >
            <TableHead style={{ backgroundColor: theme.palette.primary.main }}>
              <TableRow>
                <TableCell align='center' sx={{ color: theme.palette.primary.contrastText }}>
                  <TableSortLabel
                    active={orderBy === 'username'}
                    direction={orderBy === 'username' ? order : 'asc'}
                    onClick={() => handleRequestSort('username')}
                    sx={{
                      color: theme.palette.primary.contrastText + " !important",
                      '& .MuiTableSortLabel-icon': {
                        color: theme.palette.primary.contrastText + " !important"
                      },
                      '&.Mui-active': {
                        color: theme.palette.primary.contrastText + " !important",
                        '& .MuiTableSortLabel-icon': {
                          color: theme.palette.primary.contrastText + " !important"
                        }
                      }
                    }}
                  >
                    Nombres
                  </TableSortLabel>
                </TableCell>
                <TableCell align='center' sx={{ color: theme.palette.primary.contrastText }}>Apellidos</TableCell>
                <TableCell align='center' sx={{ color: theme.palette.primary.contrastText }}>Correo Electrónico</TableCell>
                <TableCell align='center' sx={{ color: theme.palette.primary.contrastText }}>Rol de Sistema</TableCell>
                <TableCell align='center' sx={{ color: theme.palette.primary.contrastText }}>Identificación</TableCell>
                <TableCell align='center' sx={{ color: theme.palette.primary.contrastText }}>Número de Identificación</TableCell>
                <TableCell align='center' sx={{ color: theme.palette.primary.contrastText }}>Institución</TableCell>
                <TableCell align='center' sx={{ color: theme.palette.primary.contrastText }}>País</TableCell>
                <TableCell align='center' sx={{ color: theme.palette.primary.contrastText }}>Fecha de Creación</TableCell>
                <TableCell align='center' sx={{ color: theme.palette.primary.contrastText }}>Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {initialUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={columns.length} align='center'>
                    <Typography>No hay usuarios {userStatusFilter.toLowerCase()}.</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                paginatedUsers.map(user => (
                  <TableRow
                    key={user.id}
                    sx={{
                      '&:hover': {
                        backgroundColor: theme.palette.action.hover, // Usar el color de hover del tema
                      },
                      backgroundColor: theme.palette.background.paper, // Fondo según el tema
                    }}
                  >
                    <TableCell align='center'>{user.username || 'Sin Nombres'}</TableCell>
                    <TableCell align='center'>{user.last_name || 'Sin Apellidos'}</TableCell>
                    <TableCell align='center'>{user.email || 'Sin Correo Electrónico'}</TableCell>
                    <TableCell align='center'>{user.system_role?.description || 'Sin Rol de Sistema'}</TableCell>
                    <TableCell align='center'>{user.identification_type?.description || 'Sin Identificación'}</TableCell>
                    <TableCell align='center'>{user.number_identification || 'Sin Número de Identificación'}</TableCell>
                    <TableCell align='center'>{user.institutionName}</TableCell>
                    <TableCell align='center'>{user.country?.description || 'Sin País'}</TableCell>
                    <TableCell align='center'>
                      <Typography variant='body2'>{new Date(user.date_joined).toLocaleDateString()}</Typography>
                    </TableCell>
                    <TableCell>
                      <div className='flex items-center'>
                        <Tooltip title="Ver Usuario">
                          <IconButton>
                            <Link href={getLocalizedUrl(`apps/users/list/view/${user.id}`, locale)} className='flex'>
                              <VisibilityIcon />
                            </Link>
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Editar">
                          <IconButton onClick={() => handleEditClick(user)}>
                            <EditIcon />
                          </IconButton>
                        </Tooltip>
                        {user.is_active ? (
                          <Tooltip title="Eliminar">
                            <IconButton onClick={() => showAlertDeleteQuestion(user.id)}>
                              <DeleteIcon />
                            </IconButton>
                          </Tooltip>
                        ) : (
                          <Tooltip title="Restaurar">
                            <IconButton onClick={() => showAlertRestoreQuestion(user.id)}>
                              <RestoreFromTrashIcon />
                            </IconButton>
                          </Tooltip>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
      <Toolbar>
        <Box sx={{ flexGrow: 1 }} />
        <TablePagination
          component="div"
          count={initialUsers.length}  // Total de usuarios acumulados
          page={page}  // Página actual del estado
          rowsPerPage={rowsPerPage}  // Filas por página
          onPageChange={handleChangePage}  // Manejar cambio de página
          onRowsPerPageChange={handleChangeRowsPerPage}  // Cambiar filas por página
          rowsPerPageOptions={[10, 25, 50]}
          labelRowsPerPage="Usuarios por página"
          labelDisplayedRows={({ from, to, count }) => `${from}-${to} de ${count}`}
          slotProps={{
            actions: {
              nextButton: {
                disabled: page >= Math.ceil(initialUsers.length / rowsPerPage) - 1
              },
              previousButton: {
                disabled: page === 0
              }
            }
          }}
        />

        <UserModal
          usuario={selectedUser}
          open={editUserOpen}
          setOpen={setEditUserOpen}
          mode='edit'
          id={selectedUser ? selectedUser.id : null}
          handleUserAdded={handleUserUpdated}
        />
      </Toolbar>
    </>
  )
}

export default UserList
