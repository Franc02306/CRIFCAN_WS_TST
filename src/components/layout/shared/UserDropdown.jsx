'use client'

// React Imports
import { useEffect, useRef, useState } from 'react'

// Next Imports
import { useParams, useRouter } from 'next/navigation'

// MUI Imports
import { styled } from '@mui/material/styles'
import Badge from '@mui/material/Badge'
import Avatar from '@mui/material/Avatar'
import Popper from '@mui/material/Popper'
import Fade from '@mui/material/Fade'
import Paper from '@mui/material/Paper'
import ClickAwayListener from '@mui/material/ClickAwayListener'
import MenuList from '@mui/material/MenuList'
import Typography from '@mui/material/Typography'
import Divider from '@mui/material/Divider'
import MenuItem from '@mui/material/MenuItem'
import Button from '@mui/material/Button'

// Third-party Imports
import { signOut, useSession } from 'next-auth/react'

// Hook Imports
import { useSettings } from '@core/hooks/useSettings'

// Util Imports
import { getLocalizedUrl } from '@/utils/i18n'
import { getUserById } from '../../../service/userService'

// Styled component for badge content
const BadgeContentSpan = styled('span')({
  width: 8,
  height: 8,
  borderRadius: '50%',
  cursor: 'pointer',
  backgroundColor: 'var(--mui-palette-success-main)',
  boxShadow: '0 0 0 2px var(--mui-palette-background-paper)'
})

const UserDropdown = () => {
  // States
  const [open, setOpen] = useState(false)

  // Refs
  const anchorRef = useRef(null)

  // Hooks
  const router = useRouter()
  const { data: session } = useSession()
  const { settings } = useSettings()
  const { lang: locale } = useParams()
  const [userData, setUserData] = useState(null) // ESTADO PARA ALMACENAR DATOS DEL USUARIO
  const [loading, setLoading] = useState(false) // ESTADO DE CARGA

  const fetchUserData = async () => {
    if (session?.user?.id && session?.accessToken) {
      setLoading(true);

      try {
        const response = await getUserById(session.user.id);

        setUserData(response.data);
      } catch (error) {
        console.error('Error obteniendo los datos del usuario:', error);
      } finally {
        setLoading(false);
      }
    } else {
      console.log('No se encontró el ID del usuario o el token en la sesión');
    }
  }

  const countryCodes = {
    Bolivia: 'BO',
    Colombia: 'CO',
    Ecuador: 'EC',
    Perú: 'PE'
  }

  const getCountryCode = (description) => {
    return countryCodes[description] || '';
  };

  const handleDropdownOpen = () => {
    !open ? setOpen(true) : setOpen(false)

    if (!userData && !loading) {
      fetchUserData();
    }
  }

  const handleDropdownClose = (event, url) => {
    if (url) {
      router.push(getLocalizedUrl(url, locale))
    }

    if (anchorRef.current && anchorRef.current.contains(event?.target)) {
      return
    }

    setOpen(false)
  }

  const handleUserLogout = async () => {
    try {
      // Sign out from the app
      await signOut({ redirect: false })

      // Redirect to login page
      router.push(getLocalizedUrl('/login', locale))
    } catch (error) {
      console.error(error)

      // Show above error in a toast like following
      // toastService.error((err as Error).message)
    }
  }

  const getInitials = (name) => {
    const names = name.split(' ');

    if (names.length === 1) {
      return names[0].charAt(0).toUpperCase();
    }

    return names[0].charAt(0).toUpperCase() + names[1].charAt(0).toUpperCase();
  };

  const UserAvatar = ({ name }) => {
    const initials = getInitials(name);

    return (
      <Avatar>
        <Typography variant="body2">{initials}</Typography>
      </Avatar>
    )
  }

  return (
    <>
      <Badge
        ref={anchorRef}
        overlap='circular'
        badgeContent={<BadgeContentSpan onClick={handleDropdownOpen} />}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        className='mis-2'
      >
        <Avatar
          ref={anchorRef}
          alt={session?.user?.name || ''}
          src={session?.user?.image || ''}
          onClick={handleDropdownOpen}
          className='cursor-pointer bs-[38px] is-[38px]'
        >
          <UserAvatar name={session?.user?.name || ' '} />
        </Avatar>
      </Badge>
      <Popper
        open={open}
        transition
        disablePortal
        placement='bottom-end'
        anchorEl={anchorRef.current}
        className='min-is-[240px] !mbs-3 z-[1]'
      >
        {({ TransitionProps, placement }) => (
          <Fade
            {...TransitionProps}
            style={{
              transformOrigin: placement === 'bottom-end' ? 'right top' : 'left top'
            }}
          >
            <Paper className={settings.skin === 'bordered' ? 'border shadow-none' : 'shadow-lg'}>
              <ClickAwayListener onClickAway={e => handleDropdownClose(e)}>
                <MenuList>
                  <div className='flex items-center plb-2 pli-6 gap-2' tabIndex={-1}>
                    <Avatar
                      alt={session?.user?.name || ''}
                      src={session?.user?.image || ''}
                      sx={{
                        color: 'white'
                      }}
                    >
                      {!session?.user?.image && getInitials(session?.user?.name || '')}
                    </Avatar>
                    <div className='flex items-start flex-col'>
                      <Typography className='font-medium' color='text.primary'>
                        {session?.user?.name || ''}
                        {userData?.country || userData?.institution ? (
                          <span>
                            {' '}
                            (
                            {userData?.country ? getCountryCode(userData.country.description) : ''}
                            {userData?.country && userData?.institution ? ' - ' : ''}
                            {userData?.institution?.name || ''}
                            )
                          </span>
                        ) : null}
                      </Typography>
                      <Typography variant='caption'>{session?.user?.email || ''}</Typography>
                    </div>
                  </div>
                  <Divider className='mlb-1' />
                  <MenuItem className='mli-2 gap-3' onClick={e => handleDropdownClose(e, '/pages/user-profile')}>
                    <i className='tabler-user text-[22px]' />
                    <Typography color='text.primary'>Mi Perfil</Typography>
                  </MenuItem>
                  <MenuItem className='mli-2 gap-3' onClick={e => handleDropdownClose(e, '/pages/account-settings')}>
                    <i className='tabler-settings text-[22px]' />
                    <Typography color='text.primary'>Ajustes</Typography>
                  </MenuItem>
                  {/* <MenuItem className='mli-2 gap-3' onClick={e => handleDropdownClose(e, '/pages/account-settings')}>
                    <i className='tabler-settings text-[22px]' />
                    <Typography color='text.primary'>Ajustes</Typography>
                  </MenuItem> */}
                  {/* <MenuItem className='mli-2 gap-3' onClick={e => handleDropdownClose(e, '/pages/pricing')}>
                    <i className='tabler-currency-dollar text-[22px]' />
                    <Typography color='text.primary'>Pricing</Typography>
                  </MenuItem>
                  <MenuItem className='mli-2 gap-3' onClick={e => handleDropdownClose(e, '/pages/faq')}>
                    <i className='tabler-help-circle text-[22px]' />
                    <Typography color='text.primary'>FAQ</Typography>
                  </MenuItem> */}
                  <div className='flex items-center plb-2 pli-3'>
                    <Button
                      fullWidth
                      variant='contained'
                      color='error'
                      size='small'
                      endIcon={<i className='tabler-logout' />}
                      onClick={handleUserLogout}
                      sx={{ '& .MuiButton-endIcon': { marginInlineStart: 1.5 } }}
                    >
                      Cerrar Sesión
                    </Button>
                  </div>
                </MenuList>
              </ClickAwayListener>
            </Paper>
          </Fade>
        )}
      </Popper>
    </>
  )
}

export default UserDropdown
