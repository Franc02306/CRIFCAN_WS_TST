'use client'

'use client'

import React, { useState, useEffect, useMemo } from 'react'

import Link from 'next/link'
import { useParams } from 'next/navigation'

import {
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableRow,
	Typography,
	Button,
	IconButton,
	Tooltip,
	Menu,
	MenuItem,
	CircularProgress,
	Paper,
	Divider,
	TablePagination,
	TextField,
	InputAdornment, // Para agregar un icono al buscador
	FormControl,
	InputLabel,
	Select,
	Box,
	Grid,
	TableSortLabel
} from '@mui/material'

import Swal from 'sweetalert2'

import VisibilityIcon from '@mui/icons-material/Visibility'
import MoreVertIcon from '@mui/icons-material/MoreVert'
import ShareIcon from '@mui/icons-material/Share'
import AddIcon from '@mui/icons-material/Add'
import SearchIcon from '@mui/icons-material/Search' // Importa el icono de búsqueda

import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import GroupIcon from '@mui/icons-material/Group';

import { useTheme } from '@mui/material/styles'
import { useSession } from 'next-auth/react'

import { getLocalizedUrl } from '@/utils/i18n'
import DocumentModal from '../create/DocumentModal'
import GroupPermissionsModal from '../group-permissions/GroupPermissionsModal'

// IMPORTACIONS SERVICES
import {
	listDoc,
	listDocsByUserCreatorLogged,
	listDocsByUserAssignedLogged,
	deleteDoc,
	listDocType
} from '../../../../service/documentService'

import {
	getCustomGroups,
	getGroupsByUserCreatorLogged
} from '../../../../service/groupService'

const DocumentList = () => {
	const [openCreateDocument, setOpenCreateDocument] = useState(false)
	const [documents, setDocuments] = useState([])
	const [filteredDocuments, setFilteredDocuments] = useState([])
	const [selectedDocument, setSelectedDocument] = useState(null)
	const [anchorEl, setAnchorEl] = useState(null)
	const [isEditMode, setIsEditMode] = useState(false)
	const [activeDocumentId, setActiveDocumentId] = useState(null)
	const [searchTerm, setSearchTerm] = useState('')
	const [tabIndex, setTabIndex] = useState(0);
	const [order, setOrder] = useState('asc');
	const [orderBy, setOrderBy] = useState('title');
	const [isLoading, setIsLoading] = useState(false);
	const [openGroupPermissions, setOpenGroupPermissions] = useState(false)
	const [groups, setGroups] = useState([])

	// ESTADOS DE PAGINACION
	const [totalDocuments, setTotalDocuments] = useState(0)
	const [nextPage, setNextPage] = useState(null);
	const [previousPage, setPreviousPage] = useState(null);
	const [page, setPage] = useState(0) // Página actual
	const [rowsPerPage, setRowsPerPage] = useState(10) // Grupo de Trabajo por página

	// ESTADOS DE PAGINACION GRUPOS
	const [totalGroups, setTotalGroups] = useState(0)
	const [nextPageGroups, setNextPageGroups] = useState(null)
	const [previousPageGroups, setPreviousPageGroups] = useState(null)
	const [pageGroups, setPageGroups] = useState(0)
	const [rowsPerPageGroups, setRowsPerPageGroups] = useState(10)

	// VARIABLE PARA MANEJAR EL ERROR
	const [error, setError] = useState(null)

	const [documentFilter, setDocumentFilter] = useState('Todos');
	const documentOptions = ['Todos', 'Creados', 'Asignados']; // Opciones del select

	const [documentStatusFilter, setDocumentStatusFilter] = useState('Activos')

	const { data: session } = useSession()
	const idRolSystemUser = session?.user?.system_role?.id
	const { lang: locale } = useParams()
	const theme = useTheme()

	useEffect(() => {
		setPage(0);
	}, [searchTerm, documentFilter]);

	useEffect(() => {
		const loadDocumentsByRole = async () => {
			setIsLoading(true);
			setError(null);

			try {
				if (idRolSystemUser === 1) {
					// Si el rol es Admin, carga todos los documentos
					const allDocuments = await fetchAllActiveDocuments(`/api/models/documents/`);

					setDocuments(allDocuments);
					setFilteredDocuments(allDocuments);
					setTotalDocuments(allDocuments.length);
				} else {
					// Si no es Admin, carga documentos combinados (creados y asignados)
					const combinedDocuments = await getCombinedDocumentsForUser();

					setDocuments(combinedDocuments);
					setFilteredDocuments(combinedDocuments);
					setTotalDocuments(combinedDocuments.length);
				}
			} catch (error) {
				console.error('Error al cargar documentos: ', error);
				setError(error);
			} finally {
				setIsLoading(false);
			}
		};

		if (session) {
			loadDocumentsByRole();
		}
	}, [session, idRolSystemUser]);

	const fetchAllActiveDocuments = async (url, allDocuments = []) => {
		try {
			const { data } = await listDoc(url);
			const updatedDocuments = [...allDocuments, ...data.results];

			if (data.next) {
				return fetchAllActiveDocuments(data.next, updatedDocuments)
			}

			return updatedDocuments.sort((a, b) => a.title.localeCompare(b.title));
		} catch (error) {
			console.error('Error al obtener los documentos: ', error)
			throw error
		}
	}

	const handleRequestSort = (property) => {
		const isAsc = orderBy === property && order === 'asc';

		setOrder(isAsc ? 'desc' : 'asc');
		setOrderBy(property);
	};

	const sortedDocuments = useMemo(() => {
		if (!Array.isArray(filteredDocuments)) return [];

		return [...filteredDocuments].sort((a, b) => {
			const valueA = a[orderBy]?.toLowerCase() || '';
			const valueB = b[orderBy]?.toLowerCase() || '';

			if (valueA < valueB) return order === 'asc' ? -1 : 1;
			if (valueA > valueB) return order === 'asc' ? 1 : -1;

			return 0;
		})
	}, [filteredDocuments, order, orderBy]);

	const paginatedDocuments = useMemo(() => {
		return sortedDocuments.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
	}, [sortedDocuments, page, rowsPerPage])

	const handleMenuClose = () => {
		setAnchorEl(null)
		setActiveDocumentId(null)
	}

	const handleCreateDocument = () => {
		setSelectedDocument(null);
		setOpenCreateDocument(true);
		setIsEditMode(false)
		setTabIndex(0)
	}

	const handleEditDocument = document => {
		setSelectedDocument(document);
		setIsEditMode(true);
		setOpenCreateDocument(true);
		handleMenuClose();
	}

	const handleOpenGroupPermissions = document => {
		setSelectedDocument(document)
		setOpenGroupPermissions(true)
	}

	const handleCloseGroupPermissions = () => {
		setOpenGroupPermissions(false)
	}

	const handleDocumentUpdate = (updatedDocument) => {
		setSelectedDocument(updatedDocument);

		const updatedDocuments = documents.map(doc =>
			doc.id === updatedDocument.id ? updatedDocument : doc
		);

		setDocuments(updatedDocuments);
		setFilteredDocuments(updatedDocuments);
	};

	const getCombinedDocumentsForUser = async () => {
		try {
			const [createdDocumentsResponse, assignedDocumentsResponse] = await Promise.all([
				listDocsByUserCreatorLogged(),
				listDocsByUserAssignedLogged()
			]);

			const createdDocuments = (createdDocumentsResponse.data || []).map(document => ({
				...document,
				assigned: false
			}));

			const assignedDocuments = (assignedDocumentsResponse.data || []).map(document => ({
				...document,
				assigned: true
			}));

			const combinedDocuments = [...createdDocuments, ...assignedDocuments].reduce((acc, document) => {
				if (!acc.some(d => d.id === d.id)) {
					acc.push(document);
				}

				return acc;
			}, []);

			return combinedDocuments;
		} catch (error) {
			console.error("Error al obtener los grupos documentos: ", error);
			throw error;
		}
	};

	const handleFilterChange = async (selectedValue) => {
		setDocumentFilter(selectedValue);

		try {
			setIsLoading(true);

			let documentsData = [];

			if (selectedValue === 'Asignados') {
				const response = await listDocsByUserAssignedLogged();

				documentsData = response?.data || [];
			} else if (selectedValue === 'Todos') {
				if (session?.user?.system_role?.id === 1) {
					documentsData = await fetchAllActiveDocuments(`/api/models/documents/`);
				} else {
					documentsData = await getCombinedDocumentsForUser();
				}
			} else if (selectedValue === 'Creados') {
				const response = await listDocsByUserCreatorLogged();

				documentsData = response?.data || [];
			}

			setDocuments(documentsData);
			setFilteredDocuments(documentsData);
		} catch (error) {
			console.error("Error al cambiar filtros: ", error);
			setDocuments([]);
			setFilteredDocuments([]);
		} finally {
			setIsLoading(false);
		}
	};

	const getGroupsForDocumentAllActive = async (url = `/api/models/custom-groups/`, allGroups = []) => {
		try {
			const { data } = await getCustomGroups(url);
			const updatedGroups = [...allGroups, ...data.results];

			if (data.next) {
				return getGroupsForDocumentAllActive(data.next, updatedGroups)
			}

			return updatedGroups;
		} catch (error) {
			console.error('Error al obtener los grupos:', error);
		}
	}

	useEffect(() => {
		const loadGroups = async () => {
			setIsLoading(true);
			const allGroups = await getGroupsForDocumentAllActive(`/api/models/custom-groups/`)

			setGroups(allGroups);
			setTotalGroups(allGroups.length);
			setIsLoading(false);
		};

		loadGroups();
	}, [])

	const handleDocumentSubmitSuccess = async (newDocument, isEditMode = false) => {
		try {
			setIsLoading(true);

			let updatedDocuments = [];

			if (isEditMode) {
				if (documentFilter === 'Todos') {
					updatedDocuments = await (session?.user?.system_role?.id === 1
						? listDoc()
						: getCombinedDocumentsForUser());
				} else if (documentFilter === 'Asignados') {
					const response = await listDocsByUserAssignedLogged();

					updatedDocuments = response?.data || [];
				} else if (documentFilter === 'Creados') {
					const response = await listDocsByUserCreatorLogged();

					updatedDocuments = response?.data || [];
				}
			} else {
				updatedDocuments = await (session?.user?.system_role?.id === 1
					? listDoc()
					: getCombinedDocumentsForUser());
				setTotalDocuments((prevTotal) => prevTotal + 1);
			}

			setDocuments(updatedDocuments);
			setFilteredDocuments(updatedDocuments);

			await handleFilterChange(documentFilter);

			setOpenCreateDocument(false);
			setPage(0);
		} catch (error) {
			console.error('Error actualizando el documento: ', error);
		} finally {
			setIsLoading(false);
		}
	}

	useEffect(() => {
		if (session && !documents.length) {
			handleFilterChange('Todos');
		}
	}, [session]);

	const showAlertDeleteQuestion = async documentId => {
		const titleColor = theme.palette.mode === 'dark' ? '#FFFFFF' : '#000000'
		const backgroundColor = theme.palette.background.paper
		const confirmButtonColor = theme.palette.primary.main
		const cancelButtonColor = theme.palette.error.main

		const result = await Swal.fire({
			html: `<span style="font-family: Arial, sans-serif; font-size: 28px; color: ${titleColor};">¿Está seguro que desea eliminar este Documento?</span>`,
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
			await deleteDocById(documentId)
		}
	}

	const deleteDocById = async documentId => {
		try {
			await deleteDoc(documentId)

			if (documentFilter === 'Todos') {
				const updatedDocuments = await (session?.user?.system_role?.id === 1
					? listDoc()
					: getCombinedDocumentsForUser());

				setDocuments(updatedDocuments);
				setFilteredDocuments(updatedDocuments);
			} else if (documentFilter === 'Asignados') {
				const response = await listDocsByUserAssignedLogged();

				setDocuments(response.data || []);
				setFilteredDocuments(response.data || []);
			} else if (documentFilter === 'Creados') {
				const response = await listDocsByUserCreatorLogged();

				setDocuments(response.data || []);
				setFilteredDocuments(response.data || []);
			}

			setTotalDocuments((prevTotal) => Math.max(prevTotal - 1, 0))

			await handleFilterChange(documentFilter);

			const titleColor = theme.palette.mode === 'dark' ? '#FFFFFF' : '#000000'

			Swal.fire({
				icon: 'success',
				html: `<span style="font-family: Arial, sans-serif; font-size: 28px; color: ${titleColor};">Documento eliminado</span>`,
				confirmButtonColor: theme.palette.primary.main,
				background: theme.palette.background.paper
			})
		} catch (error) {
			console.error('Errro eliminando el documento: ', error);
		}
	}

	const handleSearchChange = (event) => {
		const searchValue = event.target.value;

		setSearchTerm(searchValue);
		setFilteredDocuments(
			documents.filter(document =>
				document.title.toLowerCase().includes(searchValue.toLowerCase())
			)
		);
	}

	const handleChangePage = async (event, newPage) => {
		setPage(newPage);

		if (newPage > page && nextPage) {
			await fetchAllActiveDocuments(nextPage);
		} else if (newPage < page && previousPage) {
			await fetchAllActiveDocuments(previousPage);
		}
	}

	const handleChangeRowsPerPage = (event) => {
		setRowsPerPage(parseInt(event.target.value, 10))
		setPage(0)
	}

	const formatToLocalTime = (dateString, emptyMesagge) => {
		if (!dateString) return emptyMesagge;
		const date = new Date(dateString);

		return date.toLocaleString('es-ES', {
			hour12: true,
			year: 'numeric',
			month: '2-digit',
			day: '2-digit',
			hour: '2-digit',
			minute: '2-digit'
		});
	};

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
							label='Buscar Documento'
							variant='outlined'
							fullWidth
							size='small'
							value={searchTerm}
							onChange={handleSearchChange}
							autoComplete='off'
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
							onClick={handleCreateDocument}
							startIcon={<i className='tabler-plus' />}
							disabled={idRolSystemUser === 4}
						>
							Agregar Documento
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
						Lista de Documentos
					</Typography>

					<Box sx={{ display: 'flex', gap: 2 }}>
						<FormControl sx={{ minWidth: 230 }} size="small">
							<InputLabel>Filtrar Documentos</InputLabel>
							<Select
								value={documentFilter}
								onChange={(e) => handleFilterChange(e.target.value)}
								label="Filtrar Grupos"
							>
								{documentOptions.map((option) => (
									<MenuItem key={option} value={option}>
										{option}
									</MenuItem>
								))}
							</Select>
						</FormControl>

						<FormControl sx={{ minWidth: 230 }} size="small">
							<InputLabel>Filtrar por Estado</InputLabel>
							<Select
								value={documentStatusFilter}
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
										active={orderBy === 'title'}
										direction={orderBy === 'title' ? order : 'asc'}
										onClick={() => handleRequestSort('title')}
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
										Título
									</TableSortLabel>
								</TableCell>
								<TableCell align='center' style={{ color: theme.palette.primary.contrastText }}>Descripción</TableCell>
								<TableCell align='center' style={{ color: theme.palette.primary.contrastText }}>Tipo de Documento</TableCell>
								<TableCell align='center' style={{ color: theme.palette.primary.contrastText }}>Estado</TableCell>
								<TableCell align='center' style={{ color: theme.palette.primary.contrastText }}>Fecha Inicial</TableCell>
								<TableCell align='center' style={{ color: theme.palette.primary.contrastText }}>Fecha Final</TableCell>

								{/* Mostrar columna "Creador" solo si el filtro es "Asignados" */}
								{documentFilter === 'Asignados' && (
									<TableCell align='center' style={{ color: theme.palette.primary.contrastText }}>Creador</TableCell>
								)}

								{/* Mostrar columna "Acciones" solo si el filtro NO es "Asignados" */}
								{documentFilter !== 'Asignados' && (
									<TableCell align='center' style={{ color: theme.palette.primary.contrastText }}>Acciones</TableCell>
								)}
							</TableRow>
						</TableHead>
						<TableBody>
							{paginatedDocuments.length ? (
								paginatedDocuments.map((document) => (
									<TableRow
										key={document.id}
										sx={{
											'&:hover': { backgroundColor: theme.palette.action.hover },
											backgroundColor: theme.palette.background.paper,
										}}
									>
										<TableCell align="center">{document.title || 'Sin Título'}</TableCell>
										<TableCell align="center">{document.description || 'Sin descripción'}</TableCell>
										<TableCell align="center">{document.doctype?.description || 'Sin Tipo'}</TableCell>
										<TableCell align="center">{document.docstate?.description || 'Sin Estado'}</TableCell>
										<TableCell align="center">{formatToLocalTime(document.initial_review_date, 'Sin Fecha Inicial')}</TableCell>
										<TableCell align="center">{formatToLocalTime(document.final_review_date, 'Sin Fecha Final')}</TableCell>

										{/* Mostrar "Creador" solo si es Asignados */}
										{documentFilter === 'Asignados' && (
											<TableCell align="center">
												{document.creator_user
													? `${document.creator_user.username} ${document.creator_user.last_name} (${document.creator_user.institution?.name || 'Sin institución'})`
													: 'Sin creador asignado'}
											</TableCell>
										)}

										{/* Mostrar columna de acciones solo si el filtro no es "Asignados" */}
										{documentFilter !== 'Asignados' && (
											<TableCell align="center">
												{documentFilter === 'Todos' && document.assigned ? (
													<Typography color="textSecondary">Sin acciones a realizar</Typography>
												) : (
													<>
														<Tooltip title="Ver Documento">
															<IconButton>
																<Link href={getLocalizedUrl(`apps/documents/view/${document.id}`, locale)}>
																	<VisibilityIcon />
																</Link>
															</IconButton>
														</Tooltip>
														<Tooltip title="Administrar Grupo de Trabajo">
															<IconButton onClick={() => handleOpenGroupPermissions(document)}>
																<GroupIcon />
															</IconButton>
														</Tooltip>
														<Tooltip title="Editar">
															<IconButton onClick={() => handleEditDocument(document)}>
																<EditIcon />
															</IconButton>
														</Tooltip>
														<Tooltip title="Eliminar">
															<IconButton onClick={() => showAlertDeleteQuestion(document.id)}>
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
											No hay documentos existentes
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
					count={searchTerm || documentFilter !== 'Todos' ? filteredDocuments.length : totalDocuments} // Si hay un filtro activo, usa el total de los documentos filtrados
					page={page}
					onPageChange={handleChangePage}
					rowsPerPage={rowsPerPage}
					onRowsPerPageChange={handleChangeRowsPerPage}
					labelRowsPerPage="Documentos por página"
					labelDisplayedRows={({ from, to, count }) => `${from}-${to} de ${count}`}
					slotProps={{
						actions: {
							nextButton: {
								disabled: page >= Math.ceil(filteredDocuments.length / rowsPerPage) - 1
							},
							previousButton: {
								disabled: page === 0
							}
						}
					}}
				/>

				{/* Modal Documento */}
				<DocumentModal
					open={openCreateDocument}
					handleModalClose={() => setOpenCreateDocument(false)}
					selectedDocument={selectedDocument}
					isEditMode={isEditMode}
					onSubmitSuccess={handleDocumentSubmitSuccess}
					groups={groups}
					totalGroups={totalGroups}
					nextPageGroups={nextPageGroups}
					previousPageGroups={previousPageGroups}
					getGroupsForDocumentAllActive={getGroupsForDocumentAllActive}
				/>

				{/* Modal Permisos de Grupo */}
				<GroupPermissionsModal
					selectedDocument={selectedDocument}
					onUpdateDocument={handleDocumentUpdate}
					open={openGroupPermissions}
					handleClose={handleCloseGroupPermissions}
				/>
			</Box>
		</Paper>
	)
}

export default DocumentList;
