import { Grid } from '@mui/material'

import CanGpt from '../../../../views/apps/can-gpt/chat/CanGpt'

const CanGptIndex = () => {
	return (
    <Grid container spacing={6}>
      <Grid item xs={12}>
				<CanGpt />
			</Grid>
    </Grid>
  )
}

export default CanGptIndex;
