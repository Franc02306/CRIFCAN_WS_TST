'use client'

import React, { useEffect, useState } from 'react'

import {
	Dialog,
	DialogTitle,
	DialogContent,
	DialogActions,
	Button,
	List,
	ListItem,
	ListItemAvatar,
	Avatar,
	ListItemText,
	Typography,
	TextField,
	Pagination,
	Grid,
	Box
} from '@mui/material'

import CustomAvatar from '@/@core/components/mui/Avatar'
import DialogCloseButton from '@/components/dialogs/DialogCloseButton'

const MembersListModal = ({ open, setOpen, institution }) => {
	const [members, setMembers] = useState([]);
	const [searchTerm, setSearchTerm] = useState('')
	const [page, setPage] = useState(1)
	const usersPerPage = 10

	useEffect(() => {
		if (open) {
			setPage(1)
			setSearchTerm('')

			if (institution) {
				setMembers(institution.users_for_institution || []);
			}
		}
	}, [open, institution]);

	const getInitials = name => {
		const words = name.split(' ')

		return words.length > 1 ? words[0][0] + words[1][0] : words[0][0]
	}

	const handleSearchChange = event => {
		setSearchTerm(event.target.value)
		setPage(1)
	}

	const handlePageChange = (event, newPage) => {
		setPage(newPage);
	}

	const handleClose = () => setOpen(false);

	const filteredMembers = members.filter(user => {
		const fullName = `${user.username} ${user.last_name}`.toLowerCase()

		return fullName.includes(searchTerm.toLowerCase())
	})

	const paginatedMembers = filteredMembers.slice((page - 1) * usersPerPage, page * usersPerPage)

	return (
		<Dialog
			open={open}
			onClose={(event, reason) => {
				if (reason !== 'backdropClick') {
					handleClose();
				}
			}}
			fullWidth
			maxWidth='md'
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

			<DialogTitle sx={{ fontSize: '23px' }}>
				Usuarios de <strong>{institution?.name}</strong>
			</DialogTitle>
			<DialogContent dividers>
				<Grid
					spacing={{ xs: 2, sm: 3, md: 4, lg: 10 }}
					sx={{
						width: '100%',
						justifyContent: 'center', // Centrado vertical
						height: '58vh',
					}}
				>
					<Grid container item xs={12} spacing={3} sx={{ marginBottom: 3 }}>
						<Grid item xs={12}>
							<TextField
								margin='dense'
								label='Buscar Usuario'
								type='text'
								fullWidth
								variant='outlined'
								value={searchTerm}
								onChange={handleSearchChange}
							/>
						</Grid>
					</Grid>
					{paginatedMembers.length > 0 ? (
						<List>
							{paginatedMembers.map(user => (
								<ListItem key={user.id}>
									<ListItemAvatar>
										<CustomAvatar color="primary">{getInitials(`${user.username} ${user.last_name}`)}</CustomAvatar>
									</ListItemAvatar>
									<ListItemText
										primary={`${user?.username || 'Usuario desconocido'} ${user?.last_name || ''}`}
									/>
								</ListItem>
							))}
						</List>
					) : (
						<Typography align='center' sx={{ mt: 5 }} >
							No hay usuarios asignados a esta Institución.
						</Typography>
					)}
				</Grid>
			</DialogContent>

			{/* BOTON Y PAGINACION */}
			<DialogActions>
				<Box sx={{ mt: 5, display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
					<Box sx={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
						<Pagination
							count={Math.ceil(filteredMembers?.length / usersPerPage)}
							page={page}
							onChange={handlePageChange}
							sx={{ ml: '10vh' }}
						/>
					</Box>
					<Box>
						<Button onClick={handleClose} color="error" variant="outlined">
							Cerrar
						</Button>
					</Box>
				</Box>
			</DialogActions>
		</Dialog>
	)
}

export default MembersListModal
