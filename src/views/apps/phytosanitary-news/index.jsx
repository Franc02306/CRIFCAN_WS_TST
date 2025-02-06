import { Grid } from '@mui/material'

import PhitosanitaryParams from '../phytosanitary-news/PhitosanitaryParams'

const PhitosanitaryNewsIndex = ({ }) => {
	return (
		<Grid container spacing={6}>
			<Grid item xs={12}>
				<PhitosanitaryParams />
			</Grid>
		</Grid>
	)
}

export default PhitosanitaryNewsIndex
