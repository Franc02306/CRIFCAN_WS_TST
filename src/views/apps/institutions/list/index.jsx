// MUI Imports
import Grid from '@mui/material/Grid'

import InstitutionTable from './InstitutionTable'

const InstitutionList = () => {
	return (
		<Grid container spacing={6}>
			<Grid item xs={12}>
				<InstitutionTable />
			</Grid>
		</Grid>
	)
}

export default InstitutionList
