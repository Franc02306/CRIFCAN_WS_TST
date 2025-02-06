import { Grid } from '@mui/material'

import NewsParams from '../../apps/phytosanitary-news/NewsParams'

const PhitosanitaryNewsIndex = ({ }) => {
	return (
		<Grid container spacing={6}>
			<Grid item xs={12}>
				<NewsParams />
			</Grid>
		</Grid>
	)
}

export default PhitosanitaryNewsIndex
