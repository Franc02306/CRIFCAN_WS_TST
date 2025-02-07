'use client'

// React Imports
import { useState, useRef } from 'react'

// MUI Imports
import Badge from '@mui/material/Badge'
import IconButton from '@mui/material/IconButton'
import Popper from '@mui/material/Popper'
import Fade from '@mui/material/Fade'
import Paper from '@mui/material/Paper'
import ClickAwayListener from '@mui/material/ClickAwayListener'
import MenuList from '@mui/material/MenuList'
import MenuItem from '@mui/material/MenuItem'
import Typography from '@mui/material/Typography'
import Divider from '@mui/material/Divider'
import Tooltip from '@mui/material/Tooltip'

// Icon Imports
import NotificationsIcon from '@mui/icons-material/Notifications'

// Hook Imports
import { useSettings } from '@core/hooks/useSettings'

const NotificationsDropdown = ({ notifications = [] }) => { // 🔹 Se agrega valor por defecto
	// Estados
	const [open, setOpen] = useState(false)
	const [tooltipOpen, setTooltipOpen] = useState(false)

	// Referencias
	const anchorRef = useRef(null)

	// Funciones para manejar el menú
	const handleClose = () => {
		setOpen(false)
		setTooltipOpen(false)
	}

	const handleToggle = () => {
		setOpen(prevOpen => !prevOpen)
	}

	return (
		<>
			<Tooltip
				title="Notificaciones"
				onOpen={() => setTooltipOpen(true)}
				onClose={() => setTooltipOpen(false)}
				open={open ? false : tooltipOpen ? true : false}
			>
				<IconButton ref={anchorRef} onClick={handleToggle} className='text-textPrimary'>
					<Badge badgeContent={notifications?.length || 0} color="error"> {/* 🔹 Evita el error */}
						<i className="tabler-bell text-[22px]" />
					</Badge>
				</IconButton>
			</Tooltip>
			<Popper
				open={open}
				transition
				disablePortal
				placement='bottom-start'
				anchorEl={anchorRef.current}
				className='min-w-[250px] !mbs-3 z-[1]'
			>
				{({ TransitionProps, placement }) => (
					<Fade {...TransitionProps} style={{ transformOrigin: placement === 'bottom-start' ? 'left top' : 'right top' }}>
						<Paper className='shadow-lg'>
							<ClickAwayListener onClickAway={handleClose}>
								<MenuList onKeyDown={handleClose}>
									<Typography variant="h6" className="px-4 py-2">Notificaciones</Typography>
									<Divider />
									{notifications.length > 0 ? (
										notifications.map((notification, index) => (
											<MenuItem key={index} className='gap-3' onClick={handleClose}>
												<Typography variant="body2">{notification.title}</Typography>
											</MenuItem>
										))
									) : (
										<MenuItem disabled>
											<Typography variant="body2">No hay notificaciones</Typography>
										</MenuItem>
									)}
								</MenuList>
							</ClickAwayListener>
						</Paper>
					</Fade>
				)}
			</Popper>
		</>
	)
}

export default NotificationsDropdown
