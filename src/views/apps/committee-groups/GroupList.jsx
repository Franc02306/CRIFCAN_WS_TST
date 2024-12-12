'use client'

import { useEffect, useState, useMemo } from 'react'

import { useParams } from 'next/navigation'

import ReactPaginate from 'react-paginate'

import {
  Box,
  Button,
  Typography,
  CircularProgress,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  IconButton,
  Menu,
  MenuItem,
  Divider,
  ListItemIcon,
  TextField,
  InputAdornment,
  CardActionArea,
  CardMedia,
  Tooltip,
  Paper,
  TableSortLabel,
  FormControl,
  InputLabel,
  Select
} from '@mui/material'
import { useSession } from 'next-auth/react'
import LinkIcon from '@mui/icons-material/Link'
import MoreVertIcon from '@mui/icons-material/MoreVert'
import Swal from 'sweetalert2'

import SearchIcon from '@mui/icons-material/Search'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import GroupIcon from '@mui/icons-material/Group';

import { useTheme } from '@emotion/react'

import GroupModal from './GroupModal'
import UserListModal from './UserListModal'

// IMPORTACIONES SERVICE
import { deleteCustomGroup, getCustomGroups, getGroupsByUserCreatorLogged, getGroupsByUserAssignedLogged } from '../../../service/groupService'
import { listUser } from '../../../service/userService'

const GroupList = () => {
  const [openCreateGroup, setOpenCreateGroup] = useState(false)
  const [openUserList, setOpenUserList] = useState(false)
  const [groups, setGroups] = useState([])
  const [filteredGroups, setFilteredGroups] = useState([]) // Grupo de Trabajo filtrados
  const [users, setUsers] = useState([])
  const [selectedGroup, setSelectedGroup] = useState(null)
  const [anchorEl, setAnchorEl] = useState(null)
  const [isEditMode, setIsEditMode] = useState(false)
  const [activeGroupId, setActiveGroupId] = useState(null)
  const [searchTerm, setSearchTerm] = useState('') // Término de búsqueda
  const [tabIndex, setTabIndex] = useState(0);
  const [order, setOrder] = useState('asc');
  const [orderBy, setOrderBy] = useState('name');
  const [isLoading, setIsLoading] = useState(false);

  // VARIABLE PARA MANEJAR EL ERROR
  const [error, setError] = useState(false);

  // ESTADOS DE PAGINACION
  const [totalGroups, setTotalGroups] = useState(0)
  const [nextPage, setNextPage] = useState(null);
  const [previousPage, setPreviousPage] = useState(null);
  const [page, setPage] = useState(0) // Página actual
  const [rowsPerPage, setRowsPerPage] = useState(10) // Grupo de Trabajo por página

  // ESTADOS DE PAGINACION USUARIOS
  const [totalUsers, setTotalUsers] = useState(0)
  const [nextPageUser, setNextPageUser] = useState(null)
  const [previousPageUser, setPreviousPageUser] = useState(null)
  const [pageUser, setPageUser] = useState(0)
  const [rowsPerPageUser, setRowsPerPageUser] = useState(10)

  const [groupFilter, setGroupFilter] = useState('Todos');
  const groupOptions = ['Todos', 'Creados', 'Asignados']; // Opciones del select

  const [groupStatusFilter, setGroupStatusFilter] = useState('Activos')

  const { data: session } = useSession()
  const idRolSystemUser = session?.user?.system_role?.id
  const { lang: locale } = useParams()
  const theme = useTheme()

  useEffect(() => {
    setPage(0);
  }, [searchTerm, groupFilter]);

  useEffect(() => {
    const loadGroupsByRole = async () => {
      setIsLoading(true);
      setError(null);

      try {
        if (idRolSystemUser === 1) {
          // Si el rol es Admin, carga todos los grupos
          const allGroups = await fetchAllActiveGroups(`/api/models/custom-groups/`);

          setGroups(allGroups);
          setFilteredGroups(allGroups);
          setTotalGroups(allGroups.length);
        } else {
          // Si no es Admin, carga grupos combinados (creados y asignados)
          const combinedGroups = await getCombinedGroupsForUser();

          setGroups(combinedGroups);
          setFilteredGroups(combinedGroups);
          setTotalGroups(combinedGroups.length);
        }
      } catch (error) {
        console.error('Error al cargar grupos: ', error);
        setError(error);
      } finally {
        setIsLoading(false);
      }
    };

    if (session) {
      loadGroupsByRole();
    }
  }, [session, idRolSystemUser]);


  const fetchAllActiveGroups = async (url, allGroups = []) => {
    try {
      const { data } = await getCustomGroups(url);
      const updatedGroups = [...allGroups, ...data.results];

      if (data.next) {
        return fetchAllActiveGroups(data.next, updatedGroups)
      }

      return updatedGroups.sort((a, b) => a.group_info?.name.localeCompare(b.group_info?.name));
    } catch (error) {
      console.error('Error al obtener los grupos: ', error)
      throw error;
    }
  }

  const handleRequestSort = (property) => {
    const isAsc = orderBy === property && order === 'asc';

    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const sortedGroups = useMemo(() => {
    if (!Array.isArray(filteredGroups)) return [];

    return [...filteredGroups].sort((a, b) => {
      const valueA = a.group_info?.[orderBy]?.toLowerCase() || '';
      const valueB = b.group_info?.[orderBy]?.toLowerCase() || '';

      if (valueA < valueB) return order === 'asc' ? -1 : 1;
      if (valueA > valueB) return order === 'asc' ? 1 : -1;

      return 0;
    });
  }, [filteredGroups, order, orderBy]);

  const paginatedGroups = useMemo(() => {
    return sortedGroups.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
  }, [sortedGroups, page, rowsPerPage])

  const handleCreateGroup = () => {
    setSelectedGroup(null)
    setOpenCreateGroup(true)
    setIsEditMode(false)
    setTabIndex(0)
  }

  const handleMenuClose = () => {
    setAnchorEl(null)
    setActiveGroupId(null)
  }

  const getCombinedGroupsForUser = async () => {
    try {
      const [createdGroupsResponse, assignedGroupsResponse] = await Promise.all([
        getGroupsByUserCreatorLogged(),
        getGroupsByUserAssignedLogged()
      ]);

      const createdGroups = (createdGroupsResponse.data || []).map(group => ({
        ...group,
        assigned: false // No es asignado
      }));

      const assignedGroups = (assignedGroupsResponse.data || []).map(group => ({
        ...group,
        assigned: true // Marcamos como asignado
      }));

      // Evitamos duplicados por ID del grupo
      const combinedGroups = [...createdGroups, ...assignedGroups].reduce((acc, group) => {
        if (!acc.some(g => g.group_info?.id === group.group_info?.id)) {
          acc.push(group);
        }

        return acc;
      }, []);

      return combinedGroups;
    } catch (error) {
      console.error("Error al obtener los grupos combinados:", error);
      throw error;
    }
  };

  const handleFilterChange = async (selectedValue) => {
    setGroupFilter(selectedValue); // Actualiza el filtro seleccionado

    try {
      setIsLoading(true); // Mostrar un indicador de carga

      let groupsData = [];

      if (selectedValue === 'Asignados') {
        const response = await getGroupsByUserAssignedLogged();

        groupsData = response?.data || [];
      } else if (selectedValue === 'Todos') {
        if (session?.user?.system_role?.id === 1) {
          groupsData = await fetchAllActiveGroups(`/api/models/custom-groups/`);
        } else {
          groupsData = await getCombinedGroupsForUser();
        }
      } else if (selectedValue === 'Creados') {
        const response = await getGroupsByUserCreatorLogged();

        groupsData = response?.data || [];
      }

      // Validación para asegurar que siempre se asignen arreglos
      setGroups(groupsData);
      setFilteredGroups(groupsData);
    } catch (error) {
      console.error("Error al cambiar filtro:", error);
      setGroups([]); // Asignar arreglo vacío en caso de error
      setFilteredGroups([]);
    } finally {
      setIsLoading(false); // Oculta el indicador de carga
    }
  };

  const getUsersForGroupAllActive = async (url = `/api/users/`, allUsers = []) => {
    try {
      const { data } = await listUser(url);
      const activeUsers = data.results.filter(user => user.is_active);

      const updatedUsers = [...allUsers, ...activeUsers]

      if (data.next) {
        return getUsersForGroupAllActive(data.next, updatedUsers)
      }

      return updatedUsers;
    } catch (error) {
      console.error('Error al obtener los usuarios:', error);
    }
  }

  useEffect(() => {
    const loadUsers = async () => {
      setIsLoading(true);
      const allUsers = await getUsersForGroupAllActive(`/api/users/`)

      setUsers(allUsers);
      setTotalUsers(allUsers.length)
      setIsLoading(false);
    };

    loadUsers();
  }, [])

  const handleEditGroup = group => {
    setSelectedGroup(group);
    setIsEditMode(true);
    setOpenCreateGroup(true);
    handleMenuClose();
  }

  const handleViewUsers = group => {
    setSelectedGroup(group)
    setOpenUserList(true)
    handleMenuClose()
  }

  const handleGroupSubmitSuccess = async (newGroup, isEditMode = false) => {
    try {
      setIsLoading(true); // Mostrar el indicador de carga

      let updatedGroups = [];

      if (isEditMode) {
        // Obtener grupos actualizados según el filtro actual
        if (groupFilter === 'Todos') {
          updatedGroups = await (session?.user?.system_role?.id === 1
            ? getCustomGroups()
            : getCombinedGroupsForUser());
        } else if (groupFilter === 'Asignados') {
          const response = await getGroupsByUserAssignedLogged();

          updatedGroups = response?.data || [];
        } else if (groupFilter === 'Creados') {
          const response = await getGroupsByUserCreatorLogged();

          updatedGroups = response?.data || [];
        }
      } else {
        updatedGroups = await (session?.user?.system_role?.id === 1
          ? getCustomGroups()
          : getCombinedGroupsForUser());
        setTotalGroups((prevTotal) => prevTotal + 1);
      }

      setGroups(updatedGroups); // Actualizar los grupos
      setFilteredGroups(updatedGroups); // Actualizar los grupos filtrados

      await handleFilterChange(groupFilter);

      setOpenCreateGroup(false); // Cerrar el modal
      setPage(0); // Volver a la primera página
    } catch (error) {
      console.error('Error actualizando el grupo:', error);
    } finally {
      setIsLoading(false); // Ocultar el indicador de carga
    }
  };

  useEffect(() => {
    if (session && !groups.length) {
      handleFilterChange('Todos'); // Carga inicial basada en el filtro "Todos"
      getUsersForGroupAllActive();
    }
  }, [session]);

  const showAlertDeleteQuestion = async groupId => {
    const titleColor = theme.palette.mode === 'dark' ? '#FFFFFF' : '#000000'
    const backgroundColor = theme.palette.background.paper
    const confirmButtonColor = theme.palette.primary.main
    const cancelButtonColor = theme.palette.error.main

    const result = await Swal.fire({
      html: `<span style="font-family: Arial, sans-serif; font-size: 28px; color: ${titleColor};">¿Está seguro que desea eliminar este Grupo de Trabajo?</span>`,
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
      await deleteGroupById(groupId)
    }
  }

  const deleteGroupById = async groupId => {
    try {
      await deleteCustomGroup(groupId);

      // Dependiendo del filtro actual, actualizamos la lista de grupos
      if (groupFilter === 'Todos') {
        const updatedGroups = await (session?.user?.system_role?.id === 1
          ? getCustomGroups()
          : getCombinedGroupsForUser());

        setGroups(updatedGroups);
        setFilteredGroups(updatedGroups);
      } else if (groupFilter === 'Asignados') {
        const response = await getGroupsByUserAssignedLogged();

        setGroups(response.data || []);
        setFilteredGroups(response.data || []);
      } else if (groupFilter === 'Creados') {
        const response = await getGroupsByUserCreatorLogged();

        setGroups(response.data || []);
        setFilteredGroups(response.data || []);
      }

      setTotalGroups((prevTotal) => Math.max(prevTotal - 1, 0));

      await handleFilterChange(groupFilter);

      const titleColor = theme.palette.mode === 'dark' ? '#FFFFFF' : '#000000'

      Swal.fire({
        icon: 'success',
        html: `<span style="font-family: Arial, sans-serif; font-size: 28px; color: ${titleColor};">Grupo de trabajo eliminado</span>`,
        confirmButtonColor: theme.palette.primary.main,
        background: theme.palette.background.paper
      })
    } catch (err) {
      console.error('Error eliminando el Grupo de Trabajo:', err)
    }
  }

  const handleSearchChange = (event) => {
    const searchValue = event.target.value.toLowerCase();

    setSearchTerm(searchValue);
    setFilteredGroups(
      groups.filter(group =>
        group.group_info?.name.toLowerCase().includes(searchValue)
      )
    );
  }

  const handleChangePage = async (event, newPage) => {
    setPage(newPage);

    if (newPage > page && nextPage) {
      await fetchAllActiveGroups(nextPage);
    } else if (newPage < page && previousPage) {
      await fetchAllActiveGroups(previousPage);
    }
  }

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10))
    setPage(0)
  }

  if (isLoading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
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
          {error.message}
        </Typography>
      </Box>
    );
  }

  return (
    <Paper sx={{ width: '100%', overflow: 'hidden' }}>
      <Box sx={{ padding: 6 }}>
        <Grid container spacing={2} alignItems='center' sx={{ marginBottom: 2 }}>
          <Grid item xs={12} md>
            <TextField
              label='Buscar Grupo de Trabajo'
              autoComplete='off'
              variant='outlined'
              fullWidth
              size='small'
              value={searchTerm}
              onChange={handleSearchChange}
              InputProps={{
                startAdornment: (
                  <InputAdornment position='start'>
                    <SearchIcon />
                  </InputAdornment>
                )
              }}
              style={{ marginRight: '5px', width: '300px' }} // Ajustamos el tamaño del buscador
            />
          </Grid>
          <Grid item xs={12} md='auto'>
            <Button
              variant='contained'
              color='primary'
              onClick={handleCreateGroup}
              startIcon={<i className='tabler-plus' />}
              disabled={idRolSystemUser === 4}
            >
              Agregar Grupo de Trabajo
            </Button>
          </Grid>
        </Grid>
      </Box>

      <Box sx={{ padding: '0' }}>
        <Divider sx={{ width: '100%' }} />
      </Box>

      <Box sx={{ padding: 6 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 }}>
          <Typography variant='h5' sx={{ fontWeight: 'bold' }}>
            Lista de Grupos de Trabajo
          </Typography>

          <Box sx={{ display: 'flex', gap: 2 }}>
            <FormControl sx={{ minWidth: 230 }} size="small">
              <InputLabel>Filtrar Grupos</InputLabel>
              <Select
                value={groupFilter}
                onChange={(e) => handleFilterChange(e.target.value)}
                label="Filtrar Grupos"
              >
                {groupOptions.map((option) => (
                  <MenuItem key={option} value={option}>
                    {option}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl sx={{ minWidth: 230 }} size="small">
              <InputLabel>Filtrar por Estado</InputLabel>
              <Select
                value={groupStatusFilter}
                label="Filtrar por Estado"
              >
                <MenuItem value="Activos">Activos</MenuItem>
                <MenuItem value="Inactivos">Inactivos</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </Box>

        <TableContainer component={Paper}>
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
                <TableCell align='center' style={{ color: theme.palette.primary.contrastText }}>
                  <TableSortLabel
                    active={orderBy === 'name'}
                    direction={orderBy === 'name' ? order : 'asc'}
                    onClick={() => handleRequestSort('name')}
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
                    Nombre
                  </TableSortLabel>
                </TableCell>
                <TableCell align='center' style={{ color: theme.palette.primary.contrastText }}>Descripción</TableCell>
                <TableCell align='center' style={{ color: theme.palette.primary.contrastText }}>Siglas</TableCell>

                {/* Mostrar columna "Creador" solo si el filtro es "Asignados" */}
                {groupFilter === 'Asignados' && (
                  <TableCell align='center' style={{ color: theme.palette.primary.contrastText }}>Creador</TableCell>
                )}

                {/* Mostrar columna "Acciones" solo si el filtro NO es "Asignados" */}
                {groupFilter !== 'Asignados' && (
                  <TableCell align='center' style={{ color: theme.palette.primary.contrastText }}>Acciones</TableCell>
                )}
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedGroups.length ? (
                paginatedGroups.map((group) => (
                  <TableRow
                    key={group?.group_info?.id}
                    sx={{
                      '&:hover': { backgroundColor: theme.palette.action.hover },
                      backgroundColor: theme.palette.background.paper,
                    }}
                  >
                    <TableCell align="center">{group.group_info?.name || 'Sin nombre'}</TableCell>
                    <TableCell align="center">{group.description || 'Sin descripción'}</TableCell>
                    <TableCell align="center">{group.siglas || 'Sin siglas'}</TableCell>

                    {/* Mostrar "Creador" solo si es Asignados */}
                    {groupFilter === 'Asignados' && (
                      <TableCell align="center">
                        {group.creator_user
                          ? `${group.creator_user.username} ${group.creator_user.last_name} (${group.creator_user.institution?.name || 'Sin institución'})`
                          : 'Sin creador asignado'}
                      </TableCell>
                    )}

                    {/* Mostrar columna de acciones solo si el filtro no es "Asignados" */}
                    {groupFilter !== 'Asignados' && (
                      <TableCell align="center">
                        {groupFilter === 'Todos' && group.assigned ? (
                          <Typography color="textSecondary">Sin acciones a realizar</Typography>
                        ) : (
                          <>
                            <Tooltip title="Ver Usuarios">
                              <IconButton onClick={() => handleViewUsers(group)}>
                                <GroupIcon />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Editar">
                              <IconButton onClick={() => handleEditGroup(group)}>
                                <EditIcon />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Eliminar">
                              <IconButton onClick={() => showAlertDeleteQuestion(group.group_info?.id)}>
                                <DeleteIcon />
                              </IconButton>
                            </Tooltip>
                          </>
                        )}
                      </TableCell>
                    )}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    <Typography align="center" color="textSecondary">
                      No hay grupos de trabajo existentes
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Paginación */}
        <TablePagination
          component='div'
          count={searchTerm || groupFilter !== 'Todos' ? filteredGroups.length : totalGroups} // Si hay un filtro activo, usa el total de los grupos filtrados
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          labelRowsPerPage="Grupos de Trabajo por página"
          labelDisplayedRows={({ from, to, count }) => `${from}-${to} de ${count}`}
          slotProps={{
            actions: {
              nextButton: {
                disabled: page >= Math.ceil(filteredGroups.length / rowsPerPage) - 1
              },
              previousButton: {
                disabled: page === 0
              }
            }
          }}
        />

        {/* Formularios y Modales */}
        <GroupModal
          open={openCreateGroup}
          handleModalClose={() => setOpenCreateGroup(false)}
          selectedGroup={selectedGroup}
          isEditMode={isEditMode}
          onSubmitSuccess={handleGroupSubmitSuccess}
          users={users}
          totalUsers={totalUsers}
          nextPageUser={nextPageUser}
          previousPageUser={previousPageUser}
          getUsersForGroupAllActive={getUsersForGroupAllActive}
        />

        <UserListModal
          open={openUserList}
          handleModalClose={() => setOpenUserList(false)}
          group={selectedGroup}
        />
      </Box>
    </Paper >
  )
}

export default GroupList
