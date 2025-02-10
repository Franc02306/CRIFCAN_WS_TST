import { Grid } from '@mui/material'

import PhitosanitaryParams from '../phytosanitary-news/PhitosanitaryParams'

const PhitosanitaryNewsIndex = ({ data }) => {
	return (
		<Grid container spacing={6}>
			<Grid item xs={12}>
				<PhitosanitaryParams data={data} />
			</Grid>
		</Grid>
	)
}

export default PhitosanitaryNewsIndex
