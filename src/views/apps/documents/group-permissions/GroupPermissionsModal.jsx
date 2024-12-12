import React, { useState, useEffect } from 'react'

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Tabs,
  Tab,
  Avatar,
  Button,
  Grid,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Radio,
  FormControlLabel,
  ListSubheader,
  Collapse,
  Box,
  Pagination,
  TextField,
  Snackbar,
  Alert
} from '@mui/material'

import { useTheme } from '@emotion/react'

import { ExpandLess, ExpandMore } from '@mui/icons-material'

import CustomAvatar from '@/@core/components/mui/Avatar'

// IMPORTACIONES DOCUMENT SERVICE
import {
  listPermissions,
  listDocId,
  getRoles,
  assignRolesInDoc,
  editAssignRolesInDoc
} from '@/service/documentService'
import DialogCloseButton from '@/components/dialogs/DialogCloseButton'

const permissionsRolesMap = {
  1: [1, 4],
  2: [1, 2, 4, 5],
  3: [1, 2, 4, 5],
  4: [1, 2, 3, 4, 5]
}

const GroupPermissionsModal = ({ open, handleClose, selectedDocument, onUpdateDocument }) => {
  const [value, setValue] = useState(0)
  const [selectedUser, setSelectedUser] = useState(null)
  const [permissions, setPermissions] = useState([]) // Almacena los permisos
  const [roles, setRoles] = useState([]) // Almacena los roles
  const [openPermissions, setOpenPermissions] = useState(null) // Controlar permisos visibles
  const [group, setGroup] = useState(null) // VARIABLE DE GRUPOS
  const [selectedRoles, setSelectedRoles] = useState({}) // Rol seleccionado
  const [openErrorSnackbar, setOpenErrorSnackbar] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [openWarningSnackbar, setOpenWarningSnackbar] = useState(false)
  const [warningMessage, setWarningMessage] = useState('')
  const [openSuccessSnackbar, setOpenSuccessSnackbar] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  const [searchTerm, setSearchTerm] = useState('') // Término de búsqueda

  const theme = useTheme()
  const docId = selectedDocument?.id

  const [page, setPage] = useState(1);
  const usersPerPage = 10;

  useEffect(() => {
    if (open) {
      setValue(0)
      setSelectedUser(null)
      setPage(1)
    }
  }, [open])

  const filteredUsers = group?.users.filter(user => {
    const fullName = `${user.username} ${user.last_name}`.toLowerCase();

    return fullName.includes(searchTerm.toLowerCase());
  });

  const paginatedUsers = filteredUsers?.slice((page - 1) * usersPerPage, page * usersPerPage);

  useEffect(() => {
    if (selectedDocument) {
      const initialRoles = {}

      selectedDocument.assigned_users.forEach(user => {
        initialRoles[user.user_id] = user.roles[0]?.role_id || null
      })
      setSelectedRoles(initialRoles)
    }
  }, [selectedDocument])

  const handlePageChange = (event, newPage) => {
    setPage(newPage);
  };

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
    setPage(1);
  };

  const handleAssignClick = user => {
    setSelectedUser(user);
    setValue(1);
  }

  const getInitials = name => {
    const words = name.split(' ')

    return words.length > 1 ? words[0][0] + words[1][0] : words[0][0]
  }

  const fetchPermissions = async () => {
    try {
      const response = await listPermissions();

      setPermissions(response.data.results);
    } catch (error) {
      console.error('Error en la solicitud:', error);
    }
  };

  const fetchRoles = async () => {
    try {
      const response = await getRoles()

      setRoles(response.data.results);
    } catch (error) {
      console.error('Error en la solicitud: ', error)
    }
  }

  useEffect(() => {
    if (value === 1 && selectedUser) {
      fetchPermissions() // Solo obtiene permisos cuando está en la pestaña 1 y un usuario está seleccionado
      fetchRoles() // Solo obtiene roles cuando está en la pestaña 1 y un usuario está seleccionado
    }
  }, [value, selectedUser])

  const handleRoleChange = (userId, roleId) => {
    setSelectedRoles(prevState => ({
      ...prevState,
      [userId]: roleId
    }))
  }

  const togglePermissions = permissionId => {
    setOpenPermissions(openPermissions === permissionId ? null : permissionId)
  }

  const handleAssignRole = async event => {
    if (!selectedRoles[selectedUser?.id]) {
      setWarningMessage('Debe seleccionar un permiso antes de asignar');
      setOpenWarningSnackbar(true);

      return;
    }

    const formData = {
      document: docId,
      group: group?.group_info?.id,
      role: [selectedRoles[selectedUser.id]],
      user: selectedUser.id
    };

    try {
      await assignRolesInDoc(formData);
      setSuccessMessage(`Rol asignado exitosamente a ${selectedUser.username}`);
      setOpenSuccessSnackbar(true);

      const response = await listDocId(docId); // Obtener documento actualizado

      onUpdateDocument(response.data); // Llama a onUpdateDocument con el documento actualizado
    } catch (error) {
      setErrorMessage('Error en la asignación de rol');
      setOpenErrorSnackbar(true);
    }

    setValue(0);
  };

  const listDocById = async docId => {
    try {
      const response = await listDocId(docId);

      setGroup(response.data.custom_group);
    } catch (error) {
      console.error("Error en la solicitud: ", error);
    }
  };

  useEffect(() => {
    if (docId) {
      listDocById(docId)
    }
  }, [docId])

  return (
    <Dialog
      open={open}
      onClose={(event, reason) => {
        if (reason !== 'backdropClick' && value !== 1) {
          handleClose();
        }
      }}
      fullWidth
      maxWidth="xl"
      scroll='body'
      sx={{
        '& .MuiDialog-paper': {
          height: '90vh',       // Ajusta la altura al 80% de la pantalla
          maxHeight: '90vh',    // Define una altura máxima
          overflow: 'visible',
        },
      }}
    >
      <DialogCloseButton onClick={handleClose} disableRipple>
        <i className='tabler-x' />
      </DialogCloseButton>

      <DialogTitle sx={{ fontSize: '23px', textAlign: 'center' }}>
        Administración del Equipo de Trabajo <strong>{group?.group_info?.name}</strong>
      </DialogTitle>

      <Tabs
        textColor='primary'
        value={value}
        variant='fullWidth'
        sx={{
          '.MuiTab-root': { opacity: 0.5, transition: 'opacity 0.5s', pointerEvents: 'none' }, // Hace que las pestañas estén deshabilitadas
          '.Mui-selected': { opacity: 1, color: theme.palette.primary.main, pointerEvents: 'none' }, // La pestaña activa se muestra normal
        }}
      >
        <Tab label='Grupo de Trabajo' />
        <Tab label='Roles' disabled={!selectedUser} />
      </Tabs>

      <DialogContent dividers>
        <>
          {value === 0 && (
            <Grid
              spacing={{ xs: 2, sm: 3, md: 4, lg: 10 }}
              sx={{
                width: '100%',
                justifyContent: 'center', // Centrado vertical
                height: '60vh',
              }}
            >
              <Grid container item xs={12} spacing={3} sx={{ marginBottom: 2 }}>
                <Grid item xs={12}>
                  <TextField
                    label="Buscar usuario"
                    variant="outlined"
                    fullWidth
                    margin="dense"
                    value={searchTerm}
                    onChange={handleSearchChange}
                    placeholder="Nombre o apellido"
                    autoComplete='off'
                  />
                </Grid>
              </Grid>

              {paginatedUsers?.length === 0 ? (
                <Typography variant="body1" align="center" color="textSecondary" sx={{ mt: 2 }}>
                  No se encontraron usuarios que coincidan con la búsqueda
                </Typography>
              ) : (
                paginatedUsers?.map(user => (
                  <ListItem key={user.id}>
                    <ListItemAvatar>
                      <CustomAvatar color='primary'>{getInitials(`${user.username} ${user.last_name}`)}</CustomAvatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={`${user.username} ${user.last_name}`}
                      secondary={selectedDocument?.assigned_users?.find(assignedUser => assignedUser.user_id === user.id)?.roles[0]?.role_name || 'Sin rol asignado'}
                    />
                    <Button
                      variant='contained'
                      color='primary'
                      onClick={() => handleAssignClick(user)}
                    >
                      Añadir Rol
                    </Button>
                  </ListItem>
                ))
              )}
            </Grid>
          )}

          {value === 1 && selectedUser && (
            <Box>
              <Typography variant='h6'>
                Asignar roles a: <strong>{selectedUser?.username} {selectedUser.last_name}</strong>
              </Typography>
              <List>
                {permissions.map(permission => (
                  <div key={permission.id}>
                    <ListItem button onClick={() => togglePermissions(permission.id)}>
                      <FormControlLabel
                        control={
                          <Radio
                            checked={selectedRoles[selectedUser.id] === permission.id}
                            onChange={() => handleRoleChange(selectedUser.id, permission.id)}
                          />
                        }
                        label={permission.description}
                      />
                      {/* Alinea la flecha a la derecha */}
                      <Box sx={{ marginLeft: 'auto' }}>
                        {openPermissions === permission.id ? <ExpandLess /> : <ExpandMore />}
                      </Box>
                    </ListItem>

                    {/* Mostrar roles asociados con el permiso en un desplegable */}
                    <Collapse in={openPermissions === permission.id} timeout="auto" unmountOnExit>
                      <List component='div' disablePadding>
                        {roles.filter(role => permissionsRolesMap[permission.id].includes(role.id)).map(role => (
                          <ListItem key={role.id} sx={{ pl: 4 }}>
                            <ListItemText primary={role.description} />
                          </ListItem>
                        ))}
                      </List>
                    </Collapse>
                  </div>
                ))}
              </List>
            </Box>
          )}
        </>
      </DialogContent>

      <DialogActions>
        {value === 0 ? (
          <Box sx={{ mt: 5, display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
            <Box sx={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
              <Pagination
                count={Math.ceil(filteredUsers?.length / usersPerPage)}
                page={page}
                onChange={handlePageChange}
                sx={{ ml: '10vh' }}
              />
            </Box>
            <Box>
              <Button onClick={handleClose} color='error' variant='outlined'>
                Cerrar
              </Button>
            </Box>
          </Box>
        ) : (
          <>
            <Button
              variant='contained'
              color='primary'
              onClick={handleAssignRole}
            >
              Asignar
            </Button>
            <Button
              color='error'
              variant='outlined'
              onClick={() => setValue(0)} // Cambiar a "Grupo de Trabajo"
            >
              Volver
            </Button>
          </>
        )}
      </DialogActions>

      {/* Snackbar de éxito */}
      <Snackbar
        open={openSuccessSnackbar}
        autoHideDuration={4000}
        onClose={() => setOpenSuccessSnackbar(false)}
      >
        <Alert
          onClose={() => setOpenSuccessSnackbar(false)}
          severity="success"
          sx={{
            width: '100%',
            backgroundColor: 'rgba(100, 255, 165, 0.7)',
            color: '#000',
            fontWeight: '600',
            boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.9)',
          }}

        >
          {successMessage}
        </Alert>
      </Snackbar>

      {/* Snackbar de advertencia */}
      <Snackbar
        open={openWarningSnackbar}
        autoHideDuration={4000}
        onClose={() => setOpenWarningSnackbar(false)}
      >
        <Alert
          onClose={() => setOpenWarningSnackbar(false)}
          severity="warning"
          sx={{
            width: '100%',
            backgroundColor: 'rgba(255, 165, 100, 0.7)',
            color: '#000',
            fontWeight: '600',
            boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.9)',
          }}
        >
          {warningMessage}
        </Alert>
      </Snackbar>

      {/* Snackbar de error */}
      <Snackbar
        open={openErrorSnackbar}
        autoHideDuration={4000}
        onClose={() => setOpenErrorSnackbar(false)}
      >
        <Alert
          onClose={() => setOpenErrorSnackbar(false)}
          severity="error"
          sx={{
            width: '100%',
            backgroundColor: 'rgba(255, 100, 100, 0.8)',
            color: '#000',
            fontWeight: '600',
            boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.9)',
          }}
        >
          {errorMessage}
        </Alert>
      </Snackbar>
    </Dialog >
  )
}

export default GroupPermissionsModal
