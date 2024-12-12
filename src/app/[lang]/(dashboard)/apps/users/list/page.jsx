'use client'

import { useEffect, useState } from 'react'

import { Box, CircularProgress, Typography } from '@mui/material'

import UserListIndex from '@views/apps/users/list'

// IMPORTACIONES DE SERVICIO
import { listUser, deleteUser } from '../../../../../../service/userService'
import { getInstitutions } from '../../../../../../service/institutionService'


const UserListApp = () => {
	const [users, setUsers] = useState([])
	const [institutions, setInstitutions] = useState([])
	const [isLoading, setIsLoading] = useState(true)
	const [error, setError] = useState(null)
	const [nextPage, setNextPage] = useState(null);
	const [previousPage, setPreviousPage] = useState(null);
	const [totalUsers, setTotalUsers] = useState(0);
	const [page, setPage] = useState(0);

	// FILTRO PARA LOS ESTADOS DE UN USUARIO
	const [userStatusFilter, setUserStatusFilter] = useState('Activos');

	const resetPage = () => setPage(0)

	const fetchUsers = async (url = '/api/users/', allUsers = []) => {
		try {
			const { data } = await listUser(url);

			const filteredUsers = data.results.filter(user =>
				userStatusFilter === 'Activos' ? user.is_active : !user.is_active
			);

			const updatedUsers = [...allUsers, ...filteredUsers]; // Acumular usuarios activos

			if (data.next) {
				return fetchUsers(data.next, updatedUsers); // Llamada recursiva si hay más páginas
			}

			return updatedUsers.sort((a, b) => a.username.localeCompare(b.username));
		} catch (error) {
			console.error('Error en la solicitud:', error);
			throw error;
		}
	};

	const fetchAllActiveInstitutions = async (url = '/api/models/institution/', allInstitutions = []) => {
		try {
			const { data } = await getInstitutions(url);
			const activeInstitutions = data.results.filter(inst => inst.is_active);
			const updatedInstitutions = [...allInstitutions, ...activeInstitutions];

			if (data.next) {
				return fetchAllActiveInstitutions(data.next, updatedInstitutions)
			}

			return updatedInstitutions.sort((a, b) => a.name.localeCompare(b.name));
		} catch (error) {
			console.error('Error al obtener las instituciones:', error);

			return allInstitutions;
		}
	}

	useEffect(() => {
		const loadData = async () => {
			setIsLoading(true);

			try {
				const [allUsers, allInstitutions] = await Promise.all([
					fetchUsers(),
					fetchAllActiveInstitutions()
				]);

				setUsers(allUsers);
				setInstitutions(allInstitutions);
				setTotalUsers(allUsers.length);
			} catch (error) {
				setError(error);
			} finally {
				setIsLoading(false);
			}
		};

		loadData();
	}, [userStatusFilter]);

	const handleUserAdded = async () => {
		try {
			const updatedUsers = await fetchUsers(); // Cargar la lista completa de usuarios activos

			setUsers(updatedUsers); // Actualiza el estado con los nuevos usuarios
			setTotalUsers(updatedUsers.length); // Ajusta el total de usuarios
		} catch (error) {
			console.error('Error al actualizar la lista de usuarios:', error);
		}
	};

	const handleUserUpdated = async () => {
		const updatedUsers = await fetchUsers(); // Cargar la lista actualizada de usuarios activos

		setUsers(updatedUsers); // Actualiza el estado con la lista nueva
		setTotalUsers(updatedUsers.length); // Ajusta el total
	};

	const handleUserDeleted = async () => {
		try {
			const updatedUsers = await fetchUsers();

			setUsers(updatedUsers);
			setTotalUsers(updatedUsers.length);
		} catch (error) {
			console.error('Error al eliminar el usuario:', error);
		}
	};

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
					{error.message} {/* Mostrando el mensaje de error personalizado */}
				</Typography>
			</Box>
		)
	}

	return (
		<UserListIndex
			users={users}
			institutions={institutions}
			handleUserAdded={handleUserAdded}
			totalUsers={totalUsers}
			nextPage={nextPage}
			previousPage={previousPage}
			fetchUsers={fetchUsers}
			handleUserDeleted={handleUserDeleted}
			handleUserUpdated={handleUserUpdated}
			page={page}
			setPage={setPage}
			resetPage={resetPage}
			userStatusFilter={userStatusFilter}
			setUserStatusFilter={setUserStatusFilter}
		/>
	);
}

export default UserListApp
