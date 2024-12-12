'use client'
import { useEffect, useState, useCallback } from 'react'

import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { Box, Button, Card, CardContent, Chip, CircularProgress, Divider, Typography } from '@mui/material'

import Swal from 'sweetalert2'

import { useTheme } from '@emotion/react'

import CustomAvatar from '@/@core/components/mui/Avatar'
import { getUserById, deleteUser, updateUserById } from '../../../../../service/userService'


export function UserDetail({ id, user }) {
  const [addUserOpen, setAddUserOpen] = useState(false)
  const [editUserOpen, setEditUserOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [userData, setUserData] = useState(user)
  const theme = useTheme()

  const updateUser = useCallback(async () => {
    if (id) {
      setIsLoading(true)
      const response = await getUserById(id)

      console.log("respuesta completa de user: ", response)

      setUserData(response.data)

      // Agrega el console.log para ver lo que trae userData
      console.log("Datos del usuario:", response.data)

      setIsLoading(false)
    }
  }, [id])

  const handleToggleUserStatus = async () => {
    const newStatus = !userData?.is_active;
    const action = newStatus ? 'activar' : 'inactivar';
    const messageConfirmation = newStatus ? 'activado' : 'inactivado';

    const titleColor = theme.palette.mode === 'dark' ? '#FFFFFF' : '#000000';
    const backgroundColor = theme.palette.background.paper;
    const confirmButtonColor = theme.palette.primary.main;
    const cancelButtonColor = theme.palette.error.main;

    Swal.fire({
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Aceptar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: confirmButtonColor,
      cancelButtonColor: cancelButtonColor,
      background: backgroundColor,
      html: `<span style="color:${titleColor}; font-size: 26px;">¿Seguro que deseas ${action} este usuario?</span>`
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          if (newStatus) {
            // Activar usuario: Usar API de edición
            await updateUserById(id, { is_active: true });
          } else {
            // Inactivar usuario: Usar API de eliminación
            await deleteUser(id);
          }

          setUserData(prevData => ({ ...prevData, is_active: newStatus }));
          Swal.fire({
            icon: 'success',
            confirmButtonColor: confirmButtonColor,
            background: backgroundColor,
            html: `<span style="color:${titleColor}; font-size: 26px;">El usuario ha sido ${messageConfirmation}</span>`
          });
        } catch (error) {
          console.error('Error en la solicitud: ', error);
          Swal.fire({
            icon: 'error',
            confirmButtonColor: confirmButtonColor,
            background: backgroundColor,
            html: `<span style="color:${titleColor}; font-size: 26px;">Hubo un error al actualizar el estado del usuario</span>`
          });
        }
      }
    });
  };

  useEffect(() => {
    if (id) {
      updateUser()
    }
  }, [id, updateUser])

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

  return (
    <>
      <Card>
        {
          <CardContent className='flex flex-col pbs-12 gap-6'>
            <div className='flex flex-col gap-6'>
              <div className='flex items-center justify-center flex-col gap-4'>
                <div className='flex flex-col items-center gap-4'>
                  <CustomAvatar alt='user-profile' src='' variant='rounded' size={120} />
                  <Typography variant='h5'>
                    {userData?.username} {userData?.last_name}
                  </Typography>
                </div>
              </div>
            </div>
            <div>
              <Typography variant='h5' align='center'>Detalles de Usuario</Typography>
              <Divider className='mlb-4' />
              <div className='flex flex-col gap-2'>
                {/* <div className='flex items-center flex-wrap gap-x-1.5'>
                  <Typography className='font-medium' color='text.primary'>
                    Tipo de Identificación:
                  </Typography>
                  <Typography>{userData?.identification_type?.description || 'Sin Tipo de Identificación'}</Typography>
                </div>
                <div className='flex items-center flex-wrap gap-x-1.5'>
                  <Typography className='font-medium' color='text.primary'>
                    Numero de Identificación:
                  </Typography>
                  <Typography>{userData?.number_identification || 'Sin Número de Identificación'}</Typography>
                </div> */}

                <div className='flex items-center flex-wrap gap-x-1.5'>
                  <Typography className='font-medium' color='text.primary' sx={{ mt: 2 }}>
                    Correo:
                  </Typography>
                  <Typography sx={{ mt: 2 }}>{userData?.email || 'Sin Correo'}</Typography>
                </div>
                <div className='flex items-center flex-wrap gap-x-1.5'>
                  <Typography className='font-medium' color='text.primary' sx={{ mt: 2 }}>
                    Estado:
                  </Typography>
                  <Typography sx={{ mt: 2 }}>{userData?.is_active ? 'Activo' : 'Inactivo'}</Typography>
                </div>
								<div className='flex items-center flex-wrap gap-x-1.5'>
                  <Typography className='font-medium' color='text.primary' sx={{ mt: 2 }}>
                    Rol de Sistema:
                  </Typography>
                  <Typography sx={{ mt: 2 }}>{userData?.system_role_description || 'Sin Rol de Sistema'}</Typography>
                </div>
                <div className='flex items-center flex-wrap gap-x-1.5'>
                  <Typography className='font-medium' color='text.primary' sx={{ mt: 2 }}>
                    Fecha de Creación:
                  </Typography>
                  <Typography sx={{ mt: 2 }}>
                    {userData?.date_joined
                      ? format(new Date(userData?.date_joined), 'dd/MM/yyyy', { locale: es })
                      : 'Fecha no disponible'}
                  </Typography>
                </div>
                <div className='flex justify-center mt4'>
                  <Button
                    variant="contained"
                    color={userData?.is_active ? "error" : "success"}
                    onClick={handleToggleUserStatus}
										sx={{ mt: 5 }}
                  >
                    {userData?.is_active ? 'Inactivar' : 'Activar'}
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        }
      </Card>
    </>
  )
}

export default UserDetail
