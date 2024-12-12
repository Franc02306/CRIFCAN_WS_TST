'use client'

import React, { useState, useEffect, useMemo } from 'react'

import Link from 'next/link'
import { useParams } from 'next/navigation'

import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  IconButton,
  TablePagination,
  Toolbar,
  Box,
  TableSortLabel,
  Button,
  Tooltip,
  Grid,
  TextField,
  InputAdornment,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material'

import { useTheme } from '@emotion/react'
import Swal from 'sweetalert2'

// ICONS
import VisibilityIcon from '@mui/icons-material/Visibility'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import RestoreFromTrashIcon from '@mui/icons-material/RestoreFromTrash'
import AddIcon from '@mui/icons-material/Add'
import SearchIcon from '@mui/icons-material/Search'

import UserModal from '../modal/UserModal'
import { getLocalizedUrl } from '@/utils/i18n'

import { deleteUser, updateUserById } from '../../../../service/userService'

const UserList = ({ users, onUserAdded, getListUsers, statusFilter }) => {
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [order, setOrder] = useState('asc')
  const [orderBy, setOrderBy] = useState('username')
  const [selectedUser, setSelectedUser] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [emailFilter, setEmailFilter] = useState('')
  const [roleFilter, setRoleFilter] = useState('')
  const [modalMode, setModalMode] = useState('create')

  const { lang: locale } = useParams()
  const theme = useTheme()

  // VARIABLES PARA EL TEMA SWAL
  const titleColor = theme.palette.mode === 'dark' ? '#FFFFFF' : '#000000'
  const backgroundColor = theme.palette.background.paper
  const confirmButtonColor = theme.palette.primary.main
  const cancelButtonColor = theme.palette.error.main

  const handleStatusChange = event => {
    const newStatus = event.target.value

    getListUsers(newStatus) // Llama a `getListUsers` para cambiar el filtro
  }

  const handleRequestSort = property => {
    const isAsc = orderBy === property && order === 'asc'

    setOrder(isAsc ? 'desc' : 'asc')
    setOrderBy(property)
  }

  const filteredUsers = useMemo(() => {
    return users.filter(
      user =>
        user.email.toLowerCase().includes(emailFilter.toLowerCase()) &&
        user.system_role_description.toLowerCase().includes(roleFilter.toLowerCase())
    )
  }, [users, emailFilter, roleFilter])

  const sortedUsers = useMemo(() => {
    return [...filteredUsers].sort((a, b) => {
      const valueA = a[orderBy]?.toLowerCase() || ''
      const valueB = b[orderBy]?.toLowerCase() || ''

      return order === 'asc' ? valueA.localeCompare(valueB) : valueB.localeCompare(valueA)
    })
  }, [filteredUsers, order, orderBy])

  const handleDeleteUser = async id => {
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
        await deleteUser(id)

        Swal.fire({
          icon: 'success',
          html: `<span style="font-family: Arial, sans-serif; font-size: 26px; color: ${titleColor};">El usuario ha sido eliminado exitosamente</span>`,
          confirmButtonColor: confirmButtonColor,
          background: backgroundColor,
          timer: 4000
        })

        onUserAdded()
      } catch (error) {
        console.error('Error eliminando usuario:', error)
        Swal.fire({
          icon: 'error',
          html: `<span style="font-family: Arial, sans-serif; font-size: 26px; color: ${titleColor};">Error al restaurar Usuario</span>`,
          confirmButtonColor: confirmButtonColor,
          background: backgroundColor
        })
      }
    }
  }

  const handleRestoreUser = async id => {
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
        await updateUserById(id, { is_active: true })

        Swal.fire({
          icon: 'success',
          html: `<span style="font-family: Arial, sans-serif; font-size: 26px; color: ${titleColor};">El usuario ha sido restaurado exitosamente</span>`,
          confirmButtonColor: confirmButtonColor,
          background: backgroundColor,
          timer: 4000
        })

        onUserAdded()
      } catch (error) {
        console.error('Error eliminando usuario:', error)
        Swal.fire({
          icon: 'error',
          html: `<span style="font-family: Arial, sans-serif; font-size: 26px; color: ${titleColor};">Error al restaurar Usuario</span>`,
          confirmButtonColor: confirmButtonColor,
          background: backgroundColor
        })
      }
    }
  }

  const handleChangePage = (event, newPage) => setPage(newPage)

  const handleChangeRowsPerPage = event => {
    setRowsPerPage(parseInt(event.target.value, 10))
    setPage(0)
  }

  const handleOpenModal = (user = null) => {
    setSelectedUser(user)
    setModalMode(user ? 'edit' : 'create')
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setSelectedUser(null)
    setIsModalOpen(false)
    setModalMode('create')
  }

  return (
    <Paper sx={{ width: '100%', overflow: 'hidden', marginTop: 3 }}>
      <Box sx={{ padding: 5 }}>
        <Grid container spacing={2} alignItems='center' sx={{ marginBottom: 2 }}>
          {/* Filtro por correo electrónico */}
          <Grid item xs={12} md>
            <TextField
              label='Buscar por Email'
              type='text'
              size='small'
              value={emailFilter}
              onChange={e => setEmailFilter(e.target.value)}
              autoComplete='off'
              InputProps={{
                startAdornment: (
                  <InputAdornment position='start'>
                    <SearchIcon />
                  </InputAdornment>
                )
              }}
              style={{ marginRight: '5px', width: '300px' }}
            />
          </Grid>

          {/* Filtro por Rol */}
          <Grid item xs={12} md>
            <FormControl fullWidth size='small'>
              <InputLabel>Filtrar por Rol</InputLabel>
              <Select
                value={roleFilter}
                onChange={e => setRoleFilter(e.target.value)}
                label='Filtrar por Rol'
                style={{ marginRight: '5px', width: '300px' }}
              >
                <MenuItem value=''>Todos</MenuItem> {/* Opción para limpiar el filtro */}
                <MenuItem value='Administrador del sistema'>Administrador del sistema</MenuItem>
                <MenuItem value='Funcionario'>Funcionario</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md='auto'>
            <Button variant='contained' color='primary' startIcon={<AddIcon />} onClick={() => handleOpenModal()}>
              Agregar Usuario
            </Button>
          </Grid>
        </Grid>
      </Box>

      <Box sx={{ padding: '0' }}>
        <Divider sx={{ width: '100%' }} />
      </Box>

      <Box sx={{ padding: 5 }}>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 3
          }}
        >
          <Typography variant='h5' sx={{ fontWeight: 'bold', marginLeft: '2px', marginBottom: '10px' }}>
            Lista de Usuarios
          </Typography>

          <FormControl sx={{ minWidth: 230 }} size='small'>
            <InputLabel>Filtrar por Estado</InputLabel>
            <Select
              value={statusFilter} // Usamos `statusFilter` como el valor actual
              onChange={handleStatusChange}
              label='Filtrar por Estado'
            >
              <MenuItem value='Activos'>Activos</MenuItem>
              <MenuItem value='Inactivos'>Inactivos</MenuItem>
            </Select>
          </FormControl>
        </Box>

        <TableContainer
          component={Paper}
          sx={{
            marginTop: 2,
            overflow: 'hidden' // Para que la tabla no sobresalga del borde curvo
          }}
        >
          <Table
            sx={{
              '& .MuiTableCell-root': {
                border:
                  theme.palette.mode === 'light'
                    ? '1px solid rgba(0, 0, 0, 0.35)'
                    : '1px solid rgba(255, 255, 255, 0.18)',
                fontSize: '0.9rem'
              }
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
                      color: theme.palette.primary.contrastText + ' !important',
                      '& .MuiTableSortLabel-icon': {
                        color: theme.palette.primary.contrastText + ' !important'
                      },
                      '&.Mui-active': {
                        color: theme.palette.primary.contrastText + ' !important',
                        '& .MuiTableSortLabel-icon': {
                          color: theme.palette.primary.contrastText + ' !important'
                        }
                      }
                    }}
                  >
                    Nombres
                  </TableSortLabel>
                </TableCell>
                <TableCell align='center' sx={{ color: theme.palette.primary.contrastText }}>
                  Apellidos
                </TableCell>
                <TableCell align='center' sx={{ color: theme.palette.primary.contrastText }}>
                  Correo Electrónico
                </TableCell>
                <TableCell align='center' sx={{ color: theme.palette.primary.contrastText }}>
                  Rol
                </TableCell>
                <TableCell align='center' sx={{ color: theme.palette.primary.contrastText }}>
                  Acciones
                </TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {sortedUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align='center'>
                    <Typography vaariant='body1' color='secondary'>
                      Usuario no encontrado
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                sortedUsers.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map(user => (
                  <TableRow
                    key={user.id}
                    sx={{
                      '&:hover': { backgroundColor: theme.palette.action.hover }
                    }}
                  >
                    <TableCell align='center'>{user.username}</TableCell>
                    <TableCell align='center'>{user.last_name}</TableCell>
                    <TableCell align='center'>{user.email}</TableCell>
                    <TableCell align='center'>{user.system_role_description}</TableCell>
                    <TableCell align='center'>
                      <Tooltip title='Ver'>
                        <IconButton>
                          <Link href={getLocalizedUrl(`apps/users/list/view/${user.id}`, locale)} className='flex'>
                            <VisibilityIcon />
                          </Link>
                        </IconButton>
                      </Tooltip>
                      <Tooltip title='Editar'>
                        <IconButton color='info' onClick={() => handleOpenModal(user)}>
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                      {user.is_active ? (
                        <Tooltip title='Eliminar'>
                          <IconButton color='error' onClick={() => handleDeleteUser(user.id)}>
                            <DeleteIcon />
                          </IconButton>
                        </Tooltip>
                      ) : (
                        <Tooltip title='Restaurar'>
                          <IconButton color='success' onClick={() => handleRestoreUser(user.id)}>
                            <RestoreFromTrashIcon />
                          </IconButton>
                        </Tooltip>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>

      <Box sx={{ display: 'flex', justifyContent: 'flex-start', paddingLeft: 2 }}>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component='div'
          count={filteredUsers.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          labelRowsPerPage='Usuarios por página'
        />
      </Box>

      <UserModal
        open={isModalOpen}
        setIsModalOpen={setIsModalOpen}
        onClose={handleCloseModal}
        onUserAdded={onUserAdded}
        user={selectedUser}
        mode={modalMode}
      />
    </Paper>
  )
}

export default UserList
