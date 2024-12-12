import { Grid } from '@mui/material'

import Dashboard from './Dashboard';

const DashboardIndex = () => {
	return(
		<Grid container spacing={6}>
      <Grid item xs={12}>
				<Dashboard />
			</Grid>
    </Grid>
	)
}

export default DashboardIndex;