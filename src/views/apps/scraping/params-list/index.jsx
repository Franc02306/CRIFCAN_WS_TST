import { Grid } from '@mui/material'

import ScrapingParams from '../../../../views/apps/scraping/params-list/ScrapingParams'

const ParamsListIndex = ({ webSites, fetchWebSites, updateSingleWebsite }) => {
  return (
    <Grid container spacing={6}>
      <Grid item xs={12}>
        <ScrapingParams webSites={webSites} fetchWebSites={fetchWebSites} updateSingleWebsite={updateSingleWebsite} />
      </Grid>
    </Grid>
  )
}

export default ParamsListIndex
