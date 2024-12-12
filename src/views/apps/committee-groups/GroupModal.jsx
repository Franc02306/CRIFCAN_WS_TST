'use client'

import React, { useState, useEffect, useMemo } from 'react'

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  FormControlLabel,
  Checkbox,
  Typography,
  Divider,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Snackbar,
  Alert,
  Pagination,
  Autocomplete,
  Tabs,
  Tab,
  CircularProgress,
  Box
} from '@mui/material'

import { useSession } from 'next-auth/react'
import Swal from 'sweetalert2'

import { useTheme } from '@emotion/react'

import CustomAvatar from '@/@core/components/mui/Avatar'
import { addCustomGroup, editGroup, editCustomGroup } from '../../../service/groupService'
import { getInstitutions } from '../../../service/institutionService'
import DialogCloseButton from '@/components/dialogs/DialogCloseButton'

const GroupModal = (
  {
    open,
    selectedGroup,
    isEditMode,
    onSubmitSuccess,
    handleModalClose,
    users,
    totalUsers,
    nextPageUser,
    previousPageUser,
    getUsersForGroupAllActive
  }
) => {
  const [groupName, setGroupName] = useState('')
  const [groupDescription, setGroupDescription] = useState('')
  const [groupAcronym, setGroupAcronym] = useState('')
  const [selectedUsers, setSelectedUsers] = useState([])
  const [error, setError] = useState(null)
  const { data: session } = useSession()
  const [searchName, setSearchName] = useState('')
  const [searchInstitution, setSearchInstitution] = useState(null)
  const [institutions, setInstitutions] = useState([])
  const [snackbarOpen, setSnackbarOpen] = useState(false)
  const [snackbarMessage, setSnackbarMessage] = useState('')
  const [snackbarSeverity, setSnackbarSeverity] = useState('success')
  const [openInfoSnackbar, setOpenInfoSnackbar] = useState(false)
  const [infoMessage, setInfoMessage] = useState('')
  const [openWarningSnackbar, setOpenWarningSnackbar] = useState(false)
  const [warningMessage, setWarningMessage] = useState('')
  const [loading, setLoading] = useState(true);
  const [filteredInstitutions, setFilteredInstitutions] = useState([]); // ESTADO PARA ALMACENAR INSTITUCIONES FILTRADAs

  const [activeTab, setActiveTab] = useState(0)

  const theme = useTheme()

  const titleColor = theme.palette.mode === 'dark' ? '#FFFFFF' : '#000000';
  const backgroundColor = theme.palette.background.paper;
  const confirmButtonColor = theme.palette.primary.main;

  const userId = session?.user?.id

  const [page, setPage] = useState(1);
  const usersPerPage = 10;

  const resetForm = () => {
    setGroupName('')
    setGroupDescription('')
    setGroupAcronym('')
    setSearchName('')
    setSearchInstitution(null)
    setSelectedUsers([])
    setActiveTab(0)
  }

  useEffect(() => {
    if (open) {
      setActiveTab(0)
      setPage(1)

      if (isEditMode && selectedGroup) {
        setGroupName(selectedGroup.group_info?.name || '')
        setGroupDescription(selectedGroup.description || '')
        setGroupAcronym(selectedGroup.siglas || '')

        const usersFromGroup = selectedGroup.users || []

        setSelectedUsers(usersFromGroup.map(user => user.id))
      } else {
        resetForm() // Si no está en modo edición, resetea el formulario
      }
    }
  }, [open, isEditMode, selectedGroup])


  const handleToggleUser = userId => {
    setSelectedUsers(prev =>
      prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]
    )
  }

  const handleCloseWarningSnackbar = () => {
    setOpenWarningSnackbar(false)
  }

  const handleCloseInfoSnackbar = () => {
    setOpenInfoSnackbar(false);
  }

  const closeDialog = () => {
    resetForm(); // Restablece el formulario en todos los casos
    handleModalClose(); // Cierra el modal
    setError(null);
    setSnackbarOpen(false);
  };

  const validateAndShowWarnings = () => {
    if (!groupName) {
      setWarningMessage('El nombre del Grupo de Trabajo es obligatorio')
      setOpenWarningSnackbar(true)

      return false;
    }

    if (!groupDescription) {
      setWarningMessage('La descripción del Grupo de Trabajo es obligatoria')
      setOpenWarningSnackbar(true)

      return false;
    }

    if (!groupAcronym) {
      setWarningMessage('Las siglas del Grupo de Trabajo son obligatorias')
      setOpenWarningSnackbar(true)

      return false;
    }

    return true;
  }

  const handleSubmit = async () => {
    if (!validateAndShowWarnings()) {

      return
    }

    const data = {
      name: groupName,
      description: groupDescription,
      siglas: groupAcronym,
      users: selectedUsers,
      creator_user: userId
    }

    try {
      let response

      if (isEditMode && selectedGroup?.group_info?.id) {
        response = await editCustomGroup(selectedGroup.group_info.id, data);
      } else if (!isEditMode) {
        response = await addCustomGroup(data);
      } else {
        throw new Error('No se puede editar: falta el ID del grupo de trabajo');
      }

      onSubmitSuccess(response.data, isEditMode);
      resetForm()
      setError(null)
      Swal.fire({
        icon: 'success',
        html: `<span style="font-family: Arial, sans-serif; font-size: 26px; color: ${titleColor};">
            ${isEditMode ? 'Grupo de Trabajo actualizado exitosamente' : 'Grupo de Trabajo creado exitosamente'}
                </span>`,
        confirmButtonColor: confirmButtonColor,
        confirmButtonText: 'Aceptar',
        background: backgroundColor,
        timer: 4000,
      }).then(() => {
        closeDialog()
      })
    } catch (error) {
      console.error('Error al procesar la solicitud:', error)
      setError('Error al procesar la solicitud')
      setSnackbarSeverity('error')
      setSnackbarMessage('Error al procesar la solicitud')
      setSnackbarOpen(true)
    }
  }

  const filteredUsers = useMemo(() => {
    if (!Array.isArray(users)) return [];

    const normalizedSearchName = searchName.trim().toLowerCase();

    return users.filter(user => {
      const fullName = `${user.username || ''} ${user.last_name || ''}`.trim().toLowerCase();

      // Excluir al usuario actual si no es modo de edición
      const shouldIncludeUser = isEditMode || user.id !== userId;

      return (
        shouldIncludeUser &&
        fullName.includes(normalizedSearchName) && // Verifica coincidencia en el nombre
        (!searchInstitution || // Si no hay institución seleccionada, pasa por defecto
          (user.institution?.name.toLowerCase() === searchInstitution.name.toLowerCase()))
      );
    });
  }, [users, searchName, searchInstitution, isEditMode, userId]);

  useEffect(() => {
    setPage(1)
  }, [searchName, searchInstitution])

  const paginatedUsers = useMemo(() => {
    const startIndex = (page - 1) * usersPerPage;
    const endIndex = startIndex + usersPerPage;

    return filteredUsers.slice(startIndex, endIndex);
  }, [filteredUsers, page, usersPerPage])

  const fetchInstitutions = async (url, allInstitutions = []) => {
    try {
      const { data } = await getInstitutions(url);
      const activeInstitutions = data.results.filter(inst => inst.is_active)
      const updatedInstitutions = [...allInstitutions, ...activeInstitutions];

      if (data.next) {
        return fetchInstitutions(data.next, updatedInstitutions);
      }

      return updatedInstitutions.sort((a, b) => a.name.localeCompare(b.name));

      // setInstitutions(response.data.results)

    } catch (error) {
      console.error('Error en la solicitud:', error)

      return allInstitutions
    }
  }

  useEffect(() => {
    const loadInstitutions = async () => {
      setLoading(true);
      const allInstitutions = await fetchInstitutions(`/api/models/institution/`);

      setInstitutions(allInstitutions);
      setFilteredInstitutions(allInstitutions);
      setLoading(false);
    };

    loadInstitutions();
  }, [])

  const handleChangePage = (event, value) => {
    setPage(value)
  }

  const handleSnackbarClose = () => {
    setSnackbarOpen(false)
  }

  const validateGroupTitle = (value) => {
    const maxLength = 400;

    if (value.length > maxLength) {
      setInfoMessage('Longitud máxima alcanzada: 400 caracteres en el campo Título');
      setOpenInfoSnackbar(true);

      return false;
    }

    return true;
  }

  const validateDescriptionGroup = (value) => {
    const maxLength = 1000;

    if (value.length > maxLength) {
      setInfoMessage('Longitud máxima alcanzada: 1000 caracteres en el campo Descripción');
      setOpenInfoSnackbar(true);

      return false;
    }

    return true;
  }

  const validateAcronymGroup = (value) => {
    const maxLength = 20;

    if (value.length > maxLength) {
      setInfoMessage('Longitud máxima alcanzada: 20 caraceteres en el campo Siglas');
      setOpenInfoSnackbar(true);

      return false;
    }

    return true;
  }

  const validateUserFilter = (value) => {
    const maxLength = 240;

    if (value.length > maxLength) {
      setInfoMessage('Longitud máxima alcanzada: 240 caracteres en el filtro de Usuario')
      setOpenInfoSnackbar(true);

      return false;
    }

    return true;
  }

  const handleTitleGroupChange = (e) => {
    const value = e.target.value;

    if (validateGroupTitle(value)) {
      setGroupName(value);
    }
  }

  const handleDescriptionGroupChange = (e) => {
    const value = e.target.value;

    if (validateDescriptionGroup(value)) {
      setGroupDescription(value);
    }
  }

  const handleAcronymGroupChange = (e) => {
    const value = e.target.value.toUpperCase();

    if (validateAcronymGroup(value)) {
      setGroupAcronym(value);
    }
  }

  const handleUserFilterChange = (e) => {
    const value = e.target.value;

    if (validateUserFilter(value)) {
      setSearchName(value);
    }
  }

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue)
  }

  const getInitials = name => {
    const words = name.split(' ')

    return words.length > 1 ? words[0][0] + words[1][0] : words[0][0]
  }

  return (
    <Dialog
      open={open}
      onClose={(event, reason) => {
        if (reason === 'backdropClick') return;
        handleModalClose();
      }}
      fullWidth
      maxWidth="LG"
      scroll='body'
      sx={{
        '& .MuiDialog-paper': {
          height: '90vh',       // Ajusta la altura al 80% de la pantalla
          maxHeight: '90vh',    // Define una altura máxima
          overflow: 'visible',
        },
      }}
    >
      <DialogCloseButton onClick={handleModalClose} disableRipple>
        <i className='tabler-x' />
      </DialogCloseButton>

      <DialogTitle variant='h4' className='flex gap-2 flex-col text-center'>
        {isEditMode ? 'Editar Grupo de Trabajo' : 'Crear Grupo de Trabajo'}
      </DialogTitle>

      <Tabs
        orientation='horizontal'
        value={activeTab}
        onChange={handleTabChange}
        aria-label='basic tabs example'
        variant='fullWidth'
      >
        <Tab label='Detalles del Grupo de Trabajo' />
        <Tab label='Asignar Usuarios' />
      </Tabs>

      <DialogContent dividers>
        {loading ? (
          <div className='flex justify-center items-center'>
            <CircularProgress />
          </div>
        ) : (
          <>
            {activeTab === 0 && (
              <Grid
                container
                spacing={{ xs: 2, sm: 3, md: 4, lg: 10 }}
                sx={{
                  width: '100%',
                  display: 'flex',
                  justifyContent: 'center', // Centrado vertical
                  height: '60vh', // ESTO AYUDA A POSICIONAR VERTICALMENTE CENTRALMENTE
                }}
              >
                <Grid item xs={12} sx={{ mt: 8 }}>
                  <TextField
                    autoFocus
                    margin="dense"
                    label="Título"
                    type="text"
                    autoComplete='off'
                    fullWidth
                    variant="outlined"
                    value={groupName}
                    onChange={handleTitleGroupChange}
                    inputProps={{ maxLength: 401 }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    margin="dense"
                    label="Descripción"
                    type="text"
                    autoComplete='off'
                    fullWidth
                    variant="outlined"
                    value={groupDescription}
                    onChange={handleDescriptionGroupChange}
                    inputProps={{ maxLength: 1001 }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    margin="dense"
                    label="Siglas"
                    type="text"
                    autoComplete='off'
                    fullWidth
                    variant="outlined"
                    value={groupAcronym}
                    onChange={handleAcronymGroupChange}
                    inputProps={{ maxLength: 21 }}
                  />
                </Grid>
              </Grid>
            )}

            {activeTab === 1 && (
              <Grid
                spacing={{ xs: 2, sm: 3, md: 4, lg: 10 }}
                sx={{
                  width: '100%',
                  justifyContent: 'center', // Centrado vertical
                  height: '60vh',
                }}
              >
                <Grid container item xs={12} spacing={3} sx={{ marginBottom: 2 }}>
                  <Grid item xs={6}>
                    <TextField
                      fullWidth
                      margin="dense"
                      label="Buscar Usuario"
                      autoComplete='off'
                      type="text"
                      size="normal"
                      variant="outlined"
                      value={searchName}
                      onChange={handleUserFilterChange}
                      inputProps={{ maxLength: 242 }}
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <Autocomplete
                      options={institutions}
                      getOptionLabel={(option) => option.name || ''}
                      value={searchInstitution}
                      onChange={(event, newValue) => setSearchInstitution(newValue)}
                      noOptionsText="Sin coincidencias"
                      renderOption={(props, option) => (
                        <li {...props} key={option.id}> {/* Utiliza option.id como key */}
                          {option.name}
                        </li>
                      )}
                      onInputChange={(event, newInputValue) => {
                        if (!newInputValue) {
                          setSearchInstitution(null);
                        }
                      }}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="Buscar Institución"
                          variant="outlined"
                          margin="dense" // Asegura la alineación con el otro campo
                          inputProps={{
                            ...params.inputProps,
                          }}
                          InputProps={{
                            ...params.InputProps,
                            endAdornment: null, // Elimina la flecha del Autocomplete
                          }}
                        />
                      )}
                      isOptionEqualToValue={(option, value) => option.id === value.id}
                      fullWidth
                      disableClearable // Evita mostrar el botón de limpiar para mayor consistencia
                    />
                  </Grid>
                </Grid>

                {paginatedUsers.length === 0 ? (
                  <Typography variant="body1" align="center" color="textSecondary" sx={{ mt: 2 }}>
                    No se encontraron usuarios que coincidan con la búsqueda
                  </Typography>
                ) : (
                  paginatedUsers.map(user => (
                    <ListItem key={user.id}>
                      <ListItemAvatar>
                        <CustomAvatar color='primary'>{getInitials(`${user.username} ${user.last_name}`)}</CustomAvatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={`${user.username} ${user.last_name}`}
                        secondary={user.institution?.name || 'Sin institución'}
                      />
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={selectedUsers.includes(user.id)}
                            onChange={() => handleToggleUser(user.id)}
                            color="primary"
                          />
                        }
                        label=""
                      />
                    </ListItem>
                  ))
                )}
              </Grid>
            )}
          </>
        )}
      </DialogContent>

      <Snackbar open={snackbarOpen} autoHideDuration={4000} onClose={handleSnackbarClose}>
        <Alert
          onClose={handleSnackbarClose}
          severity={snackbarSeverity}
          sx={{
            width: '100%',
            backgroundColor: 'rgba(255, 100, 100, 0.8)', // Color sólido para error
            color: '#000',
            fontWeight: '600',
            boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.9)',
          }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>

      <Snackbar open={openWarningSnackbar} autoHideDuration={4000} onClose={handleCloseWarningSnackbar}>
        <Alert
          onClose={handleCloseWarningSnackbar}
          severity='warning'
          sx={{
            width: '100%',
            backgroundColor: 'rgba(255, 165, 100, 0.7)', // Color sólido para warning
            color: '#000',
            fontWeight: '600',
            boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.9)',
          }}
        >
          {warningMessage}
        </Alert>
      </Snackbar>

      {/* Snackbar para mostrar la información de límite de caracteres */}
      <Snackbar open={openInfoSnackbar} autoHideDuration={4000} onClose={handleCloseInfoSnackbar}>
        <Alert
          onClose={handleCloseInfoSnackbar}
          severity='info'
          sx={{
            width: '100%',
            backgroundColor: 'rgba(100, 200, 255, 0.8)',
            color: '#000',
            fontWeight: '600',
            boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.9)',
          }}
        >
          {infoMessage}
        </Alert>
      </Snackbar>

      {/* BOTONES Y PAGINACIÓN */}
      <DialogActions>
        <Box sx={{ mt: 5, display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
          <Box sx={{ width: activeTab === 1 ? 'auto' : '82vh' }}>
            {activeTab === 1 && (
              <Pagination
                count={Math.ceil(filteredUsers.length / usersPerPage)}
                page={page}
                onChange={handleChangePage}
                sx={{ ml: '82vh' }} // Centrado horizontalmente
              />
            )}
          </Box>
          <Box>
            <Button onClick={handleModalClose} color='error' variant="outlined" sx={{ mr: 2 }}>
              Cerrar
            </Button>
            <Button onClick={handleSubmit} color="primary" variant="contained">
              {isEditMode ? 'Actualizar' : 'Agregar'}
            </Button>
          </Box>
        </Box>
      </DialogActions>
    </Dialog >
  )
}

export default GroupModal
