'use client'

import React, { useCallback, useEffect, useState } from 'react'

import { CircularProgress, Alert, IconButton, InputAdornment, List, ListItem, ListItemText, Snackbar, Typography } from '@mui/material'

import Dialog from '@mui/material/Dialog'
import Button from '@mui/material/Button'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import TextField from '@mui/material/TextField'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import Select from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'
import Tabs from '@mui/material/Tabs'
import Tab from '@mui/material/Tab'
import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid'
import { useTheme } from '@emotion/react'

import DialogCloseButton from '@components/dialogs/DialogCloseButton'

// IMPORTACIÓN DE SERVICIOS
import { getReportUrl } from '../../../../service/scraperService'

const ReportUrlModal = ({ reportId, open, onClose }) => {
	const [reportData, setReportData] = useState(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);

	const fetchReportData = useCallback(async () => {
		if (!reportId) return;

		setLoading(true);
		setError(null);

		try {
			const response = await getReportUrl(reportId);

			setReportData(response);
		} catch (err) {
			setError('No se encontró comparación ni reporte para esta URL');
		} finally {
			setLoading(false);
		}
	}, [reportId]);

	useEffect(() => {
		if (open) {
			fetchReportData();
		}
	}, [open, fetchReportData]);

	return (
		<>
			<Dialog
				fullWidth
				maxWidth="md"
				open={open}
				PaperProps={{ style: { overflow: 'visible' } }}
				onClose={(event, reason) => {
					if (reason !== 'backdropClick') {
						onClose()
					}
				}}
			>
				<DialogCloseButton onClick={onClose} disableRipple>
					<i className='tabler-x' />
				</DialogCloseButton>

				<DialogTitle sx={{ fontSize: '23px' }}>Reporte de URL</DialogTitle>

				<DialogContent dividers sx={{ maxHeight: '50vh', overflowY: 'auto' }}>
					<Box
						component={Grid}
						container
						sx={{
							width: '100%',
							display: 'flex',
							justifyContent: 'center', // Centrado vertical
							alignItems: 'center',
							height: '20vh' // ESTO AYUDA A POSICIONAR VERTICALMENTE CENTRALMENTE
						}}
					>
						{loading ? (
							<CircularProgress size={50} />
						) : error ? (
							<Typography color="error">{error}</Typography>
						) : (
							<>
								<Typography variant="body1" gutterBottom>
									{reportData?.message}
								</Typography>

								<Typography variant="body2">
									URLs agregadas: {reportData?.info_agregada?.length || 0}
								</Typography>

								{reportData?.info_agregada?.length > 0 && (
									<List sx={{ width: '100%', maxHeight: '35vh', overflowY: 'auto' }}>
										{reportData.info_agregada.map((url, index) => (
											<ListItem key={index}>
												<ListItemText primary={url} />
											</ListItem>
										))}
									</List>
								)}
							</>
						)}
					</Box>
				</DialogContent>

				<DialogActions sx={{ marginTop: 5 }}>
					<Button onClick={onClose} color='error' variant='outlined'>
						Cerrar
					</Button>
				</DialogActions>
			</Dialog>
		</>
	)
}

export default ReportUrlModal
