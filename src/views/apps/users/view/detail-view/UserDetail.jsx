'use client'
import { useEffect, useState, useCallback } from 'react'

import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { Button, Card, CardContent, Chip, Divider, Typography } from '@mui/material'

import Swal from 'sweetalert2'

import { useTheme } from '@emotion/react'

import CustomAvatar from '@/@core/components/mui/Avatar'
import UserModal from '../../create/UserModal'
import { getUserById, deleteUser, updateUserById } from '../../../../../service/userService'


export function UserDetail({ id, user }) {
  const [addUserOpen, setAddUserOpen] = useState(false)
  const [editUserOpen, setEditUserOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [userData, setUserData] = useState(user)
  const theme = useTheme()

  const updateUser = useCallback(async () => {
    if (id) {
      setLoading(true)
      const response = await getUserById(id)

      setUserData(response.data)

      setLoading(false)
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

  if (loading || !userData) {
    return <div>Cargando...</div>
  }

  const buttonProps = (children, color, variant) => ({
    children,
    color,
    variant
  })

  // Filtra los cargos para eliminar duplicados por id
  const uniqueCargos = userData?.system_role ? [userData.system_role] : [];

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

                {/* Mostrar los cargos únicos del usuario en forma de lista */}
                <div className='flex flex-wrap gap-2'>
                  {uniqueCargos?.map((system_role, index) => (
                    <Chip key={index} label={system_role.description || 'Sin Rol de Sistema'} color='secondary' size='small' variant='tonal' />
                  ))}
                </div>
              </div>
            </div>
            <div>
              <Typography variant='h5' align='center'>Detalles de Usuario</Typography>
              <Divider className='mlb-4' />
              <div className='flex flex-col gap-2'>
                <div className='flex items-center flex-wrap gap-x-1.5'>
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
                </div>

                <div className='flex items-center flex-wrap gap-x-1.5'>
                  <Typography className='font-medium' color='text.primary'>
                    Email:
                  </Typography>
                  <Typography>{userData?.email || 'Sin Email'}</Typography>
                </div>
                <div className='flex items-center flex-wrap gap-x-1.5'>
                  <Typography className='font-medium' color='text.primary'>
                    Estado:
                  </Typography>
                  <Typography>{userData?.is_active ? 'Activo' : 'Inactivo'}</Typography>
                </div>
                <div className='flex items-center flex-wrap gap-x-1.5'>
                  <Typography className='font-medium' color='text.primary'>
                    Fecha de Creación:
                  </Typography>
                  <Typography>
                    {userData?.date_joined
                      ? format(new Date(userData?.date_joined), 'dd/MM/yyyy', { locale: es })
                      : 'Fecha no disponible'}
                  </Typography>
                </div>
                <div className='flex items-center flex-wrap gap-x-1.5'>
                  <Typography className='font-medium' color='text.primary'>
                    Institución:
                  </Typography>
                  <Typography>{userData?.institution?.name || 'Sin Institución'}</Typography>
                </div>
                <div className='flex justify-center mt4'>
                  <Button
                    variant="contained"
                    color={userData?.is_active ? "error" : "success"}
                    onClick={handleToggleUserStatus}
                  >
                    {userData?.is_active ? 'Inactivar' : 'Activar'}
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        }
      </Card>

      <UserModal open={addUserOpen} setOpen={setAddUserOpen} />
    </>
  )
}

export default UserDetail
