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
  Avatar,
  Tabs,
  Tab,
  CircularProgress,
  Box
} from '@mui/material'

import { useSession } from 'next-auth/react'
import Swal from 'sweetalert2'

import { useTheme } from '@emotion/react'

import { addDays, subDays, setHours, setMinutes } from 'date-fns'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'

import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked'

import AppReactDatepicker from '@/libs/styles/AppReactDatepicker';

import CustomAvatar from '@/@core/components/mui/Avatar'

import DialogCloseButton from '@/components/dialogs/DialogCloseButton'

// IMPORTACIONES SERVICE
import { createDocs, listDocType, listDocId, editDocById, editDocByIdPatch, listDocState } from '@/service/documentService'
import CustomTextField from '@/@core/components/mui/TextField'

const DocumentModal = (
  {
    open,
    handleModalClose,
    selectedDocument,
    isEditMode,
    onSubmitSuccess,
    groups
  }
) => {
  const [docTitle, setDocTitle] = useState('')
  const [docDescription, setDocDescription] = useState('')
  const [docInitialReviewDate, setDocInitialReviewDate] = useState('')
  const [docFinalReviewDate, setDocFinalReviewDate] = useState('')
  const [docTypeList, setDocTypeList] = useState('')
  const [selectedDocType, setSelectedDocType] = useState('')
  const [docStateList, setDocStateList] = useState([])
  const [selectedDocState, setSelectedDocState] = useState('')
  const [selectedGroup, setSelectedGroup] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [activeTab, setActiveTab] = useState(0)
  const [searchTerm, setSearchTerm] = useState('')
  const [snackbarOpen, setSnackbarOpen] = useState(false)
  const [snackbarSeverity, setSnackbarSeverity] = useState('success')
  const [snackbarMessage, setSnackbarMessage] = useState('')
  const [openInfoSnackbar, setOpenInfoSnackbar] = useState(false)
  const [infoMessage, setInfoMessage] = useState('')
  const [openWarningSnackbar, setOpenWarningSnackbar] = useState(false)
  const [warningMessage, setWarningMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const { data: session } = useSession()
  const iduser = session?.user?.id

  const theme = useTheme()

  const titleColor = theme.palette.mode === 'dark' ? '#FFFFFF' : '#000000';
  const backgroundColor = theme.palette.background.paper;
  const confirmButtonColor = theme.palette.primary.main;

  const [page, setPage] = useState(1);
  const groupsPerPage = 10;

  const filteredGroups = useMemo(() => {
    if (!Array.isArray(groups)) return [];

    const normalizedSearchTerm = searchTerm.trim().toLowerCase();

    return groups.filter(group => {
      const groupName = (group.group_info?.name || '').toLowerCase();
      const groupAcronym = (group.siglas || '').toLowerCase();

      return (
        groupName.includes(normalizedSearchTerm) ||
        groupAcronym.includes(normalizedSearchTerm)
      );
    });
  }, [groups, searchTerm]);

  useEffect(() => {
    setPage(1)
  }, [searchTerm])

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const paginatedGroups = useMemo(() => {
    const startIndex = (page - 1) * groupsPerPage;
    const endIndex = startIndex + groupsPerPage;

    // Aplicar paginación sobre el resultado de `filteredGroups`
    return filteredGroups.slice(startIndex, endIndex);
  }, [filteredGroups, page, groupsPerPage]);

  const handleChangePage = (event, value) => {
    setPage(value)
  }

  const getStatesDoc = async () => {
    try {
      const response = await listDocState();

      const states = response.data.results || [];

      if (isEditMode) {
        setDocStateList(states.filter(state => state.description !== 'Nuevo Documento/Borrador'));
      } else {
        setDocStateList(states);
      }
    } catch (error) {
      setError('Error al obtener los estados del documento');
      setSnackbarOpen(true);
    }
  }

  const getTypeDoc = async () => {
    try {
      const response = await listDocType();

      setDocTypeList(response.data.results);
    } catch (error) {
      console.error('Error en la solicitud:', error);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        await Promise.all([getStatesDoc(), getTypeDoc()]);
      } catch (error) {
        console.error('Error al obtener los datos del documento:', error);
        setError('Error al cargar los datos iniciales');
        setSnackbarOpen(true);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);


  const resetForm = () => {
    setDocTitle('')
    setDocDescription('')
    setDocInitialReviewDate('')
    setDocFinalReviewDate('')
    setSelectedDocType('')
    setSelectedDocState('')
    setSelectedGroup(null)
    setSearchTerm('')
    setActiveTab(0)
  };

  useEffect(() => {
    if (open) {
      setActiveTab(0);

      if (isEditMode && selectedDocument) {
        setDocTitle(selectedDocument.title || '')
        setDocDescription(selectedDocument.description || '')
        setDocInitialReviewDate(selectedDocument.initial_review_date ? new Date(selectedDocument.initial_review_date) : null);
        setDocFinalReviewDate(selectedDocument.final_review_date ? new Date(selectedDocument.final_review_date) : null);
        setSelectedDocType(selectedDocument.doctype?.id || '');
        setSelectedDocState(selectedDocument.docstate?.id || '');
        setSelectedGroup(selectedDocument.custom_group?.group_info?.id || '');
      } else {
        resetForm() // Si no está en modo edición, resetea el formulario
      }
    }
  }, [open, isEditMode, selectedDocument])

  const handleCloseWarningSnackbar = () => {
    setOpenWarningSnackbar(false)
  }

  const handleCloseInfoSnackbar = () => {
    setOpenInfoSnackbar(false);
  }

  const closeDialog = () => {
    resetForm();
    handleModalClose();
    setError(null);
    setSnackbarOpen(false);
  }

  const validateAndShowWarnings = () => {
    if (!docTitle) {
      setWarningMessage('El campo Título es obligatorio');
      setOpenWarningSnackbar(true);

      return false;
    }

    if (!docDescription) {
      setWarningMessage('El campo Descripción es obligatorio');
      setOpenWarningSnackbar(true);

      return false;
    }

    if (!selectedDocType) {
      setWarningMessage('El campo Tipo de Documento es obligatorio');
      setOpenWarningSnackbar(true);

      return false;
    }

    if (!selectedGroup) {
      setWarningMessage('Debes de seleccionar un Grupo de Trabajo');
      setOpenWarningSnackbar(true);

      return false;
    }

    return true
  }

  const handleSubmit = async () => {
    if (isSubmitting) return;

    setIsSubmitting(true);

    if (!validateAndShowWarnings()) {
      setIsSubmitting(false);

      return;
    }

    let formattedInitialDate = null;
    let formattedFinalDate = null;

    if (docInitialReviewDate) {
      const initialDate = new Date(docInitialReviewDate);

      // if (initialDate < new Date()) {
      //   setError('La fecha de revisión inicial no puede ser anterior a la fecha actual');
      //   setSnackbarOpen(true);
      //   setIsSubmitting(false);

      //   return;
      // }

      formattedInitialDate = initialDate.toISOString();
    }

    if (docFinalReviewDate) {
      const finalDate = new Date(docFinalReviewDate);

      if (formattedInitialDate && finalDate < new Date(formattedInitialDate)) {
        setError('La fecha de revisión final no puede ser anterior a la fecha de revisión inicial');
        setSnackbarOpen(true);
        setIsSubmitting(false);

        return;
      }

      formattedFinalDate = finalDate.toISOString();
    }

    const data = {
      title: docTitle,
      description: docDescription,
      doctype: selectedDocType,
      docstate: selectedDocState,
      custom_group: selectedGroup,
      creator_user: iduser
    };

    if (formattedInitialDate) {
      data.initial_review_date = formattedInitialDate;
    }

    if (formattedFinalDate) {
      data.final_review_date = formattedFinalDate;
    }

    try {
      let response

      if (isEditMode && selectedDocument?.id) {
        response = await editDocById(selectedDocument?.id, data);
      } else if (!isEditMode) {
        response = await createDocs(data);
      } else {
        throw new Error('No se puede editar: falta el ID del documento')
      }

      onSubmitSuccess(response.data, isEditMode)
      resetForm()
      setError(null)
      Swal.fire({
        icon: 'success',
        html: `<span style="font-family: Arial, sans-serif; font-size: 26px; color: ${titleColor};">
            ${isEditMode ? 'Documento actualizado exitosamente' : 'Documento creado exitosamente'}
                </span>`,
        confirmButtonColor: confirmButtonColor,
        confirmButtonText: 'Aceptar',
        background: backgroundColor,
        timer: 4000,
      }).then(() => {
        closeDialog()
      })
    } catch (error) {
      console.error('Error al procesar la solicitud: ', error)
      setError('Error al procesar la solicitud')
      setSnackbarSeverity('error')
      setSnackbarMessage('Error al procesar la solicitud')
      setSnackbarOpen(true)
    }
  }

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue)
  }

  const handleSnackbarClose = () => {
    setSnackbarOpen(false)
  }

  const validateDocTitle = (value) => {
    const maxLength = 400;

    if (value.length > maxLength) {
      setInfoMessage('Longitud máxima alcanzada: 400 caracteres en el campo Título');
      setOpenInfoSnackbar(true);

      return false;
    }

    return true;
  }

  const validateDocDescription = (value) => {
    const maxLength = 1000;

    if (value.length > maxLength) {
      setInfoMessage('Longitud máxima alcanzada: 1000 caracteres en el campo Descripción');
      setOpenInfoSnackbar(true);

      return false;
    }

    return true;
  }

  const handleDocTitleChange = (e) => {
    const value = e.target.value;

    if (validateDocTitle(value)) {
      setDocTitle(value);
    }
  };

  const handleDocDescriptionChange = (e) => {
    const value = e.target.value;

    if (validateDocDescription(value)) {
      setDocDescription(value);
    }
  };

  const AvatarRectangular = ({ acronym }) => (
    <Avatar
      sx={{
        width: 250,
        height: 40,
        border: '3px dotted',
        borderColor: 'primary.main',
        fontWeight: 'bold',
        fontSize: 15,
        borderRadius: 1,
        boxShadow: 2,
        backgroundColor: 'transparent',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {acronym}
    </Avatar>
  );

  return (
    <>
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
          {isEditMode ? 'Editar Documento' : 'Crear Documento'}
        </DialogTitle>

        <Tabs
          orientation='horizontal'
          value={activeTab}
          onChange={handleTabChange}
          aria-label='basic tabs example'
          variant='fullWidth'
        >
          <Tab label='Detalles del Documento' />
          <Tab label='Asignar Grupo de Trabajo' />
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
                  <Grid item xs={12}>
                    <TextField
                      autoFocus
                      margin="dense"
                      label="Título"
                      type="text"
                      fullWidth
                      variant="outlined"
                      value={docTitle}
                      onChange={handleDocTitleChange}
                      inputProps={{ maxLength: 401 }}
                      autoComplete='off'
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      margin="dense"
                      label="Descripción"
                      type="text"
                      fullWidth
                      variant="outlined"
                      value={docDescription}
                      onChange={handleDocDescriptionChange}
                      inputProps={{ maxLength: 1001 }}
                      autoComplete='off'
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <AppReactDatepicker
                      selected={docInitialReviewDate}
                      id='initial-revision-date'
                      onChange={(date) => setDocInitialReviewDate(date)}
                      customInput={
                        <TextField
                          label='Fecha Revisión Inicial'
                          fullWidth
                          sx={{ height: '56px', marginTop: '8px' }}
                        />
                      }
                      popperProps={{
                        modifiers: [
                          {
                            name: "preventOverflow",
                            options: {
                              boundary: "viewport",
                            },
                          },
                        ],
                      }}
                      popperContainer={({ children }) => (
                        <div style={{ zIndex: 1300 }}>{children}</div>
                      )}
                      excludeDates={[subDays(new Date(), 1), subDays(new Date(), 2)]}
                      showTimeSelect
                      dateFormat="MM/dd/yyyy h:mm aa"
                      autoComplete='off'
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <AppReactDatepicker
                      selected={docFinalReviewDate}
                      id='final-revision-date'
                      onChange={(date) => setDocFinalReviewDate(date)}
                      customInput={
                        <TextField
                          label='Fecha Revisión Final'
                          fullWidth
                          sx={{ height: '56px', marginTop: '10px' }}
                        />
                      }
                      popperProps={{
                        modifiers: [
                          {
                            name: "preventOverflow",
                            options: {
                              boundary: "viewport",
                            },
                          },
                        ],
                      }}
                      popperContainer={({ children }) => (
                        <div style={{ zIndex: 1300 }}>{children}</div>
                      )}
                      excludeDates={[subDays(new Date(), 1), subDays(new Date(), 2)]}
                      showTimeSelect
                      dateFormat="MM/dd/yyyy h:mm aa"
                      autoComplete='off'
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <FormControl fullWidth margin='dense' variant='outlined'>
                      <InputLabel id='doctype-label'>Tipo de Documento</InputLabel>
                      <Select
                        labelId='doctype-label'
                        value={selectedDocType}
                        onChange={e => setSelectedDocType(e.target.value)}
                        label='Tipo de Documento'
                      >
                        {docTypeList.map(type => (
                          <MenuItem key={type.id} value={type.id}>
                            {type.description}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  {isEditMode && (
                    <Grid item xs={12}>
                      <FormControl fullWidth margin='dense' variant='outlined'>
                        <InputLabel id='docstate-label'>Estado del Documento</InputLabel>
                        <Select
                          labelId='docstate-label'
                          value={selectedDocState}
                          onChange={e => setSelectedDocState(e.target.value)}
                          label='Estado del Documento'
                        >
                          {docStateList.map(state => (
                            <MenuItem key={state.id} value={state.id}>
                              {state.description}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                  )}
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
                  <Grid container item xs={12} spacing={3} sx={{ marginBottom: 3 }}>
                    <Grid item xs={12}>
                      <TextField
                        margin='dense'
                        label='Buscar Grupo de Trabajo'
                        type='text'
                        fullWidth
                        variant='outlined'
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        autoComplete='off'
                      />
                    </Grid>
                  </Grid>

                  {paginatedGroups.length === 0 ? (
                    <Typography variant="body1" align="center" color="textSecondary" sx={{ mt: 2 }}>
                      No se encontraron grupos de trabajo que coincidan con la búsqueda
                    </Typography>
                  ) : (
                    paginatedGroups.map((group) => (
                      <ListItem key={group.group_info?.id}>
                        <AvatarRectangular acronym={group.siglas} />
                        <Typography sx={{ marginLeft: 2 }}>
                          {group.group_info?.name}
                        </Typography>

                        <Button
                          onClick={() => setSelectedGroup(group.group_info?.id)}
                          variant={selectedGroup === group.group_info?.id ? 'contained' : 'outlined'}
                          sx={{ marginLeft: 'auto' }}
                        >
                          {selectedGroup === group.group_info?.id ? (
                            <CheckCircleIcon sx={{ color: 'green' }} />
                          ) : (
                            <RadioButtonUncheckedIcon sx={{ color: 'black' }} />
                          )}
                        </Button>
                      </ListItem>
                    ))
                  )}
                </Grid>
              )}
            </>
          )}
        </DialogContent>

        {/* Snackbar para mostrar errores */}
        <Snackbar open={snackbarOpen} autoHideDuration={4000} onClose={handleSnackbarClose}>
          <Alert
            onClose={handleSnackbarClose}
            severity="error"
            sx={{
              width: '100%',
              backgroundColor: 'rgba(255, 100, 100, 0.8)',
              color: '#000',
              fontWeight: '600',
              boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.9)',
            }}
          >
            {error}
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
            }}>
            {infoMessage}
          </Alert>
        </Snackbar>

        {/* Snackbar para mostrar campos obligatorios */}
        <Snackbar open={openWarningSnackbar} autoHideDuration={3000} onClose={handleCloseWarningSnackbar}>
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

        {/* BOTONES Y PAGINACIÓN */}
        <DialogActions>
          <Box sx={{ mt: 5, display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
            <Box sx={{ width: activeTab === 1 ? 'auto' : '82vh' }}>
              {activeTab === 1 && (
                <Pagination
                  count={Math.ceil(filteredGroups.length / groupsPerPage)}
                  page={page}
                  onChange={handleChangePage}
                  sx={{ ml: '82vh' }}
                />
              )}
            </Box>
            <Box>
              <Button onClick={handleModalClose} color='error' variant="outlined">
                Cerrar
              </Button>
              <Button onClick={handleSubmit} color="primary" variant="contained">
                {isEditMode ? 'Actualizar' : 'Agregar'}
              </Button>
            </Box>
          </Box>
        </DialogActions>
      </Dialog >
    </>
  )
}

export default DocumentModal
