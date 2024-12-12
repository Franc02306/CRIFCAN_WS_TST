// MUI Imports
import Grid from '@mui/material/Grid'

// Component Imports

import DocumentList from './DocumentList'



const PublicationsList = () => {
    return (
        <Grid container spacing={6}>
            <Grid item xs={12}>

                <DocumentList />
            </Grid>
        </Grid>
    )
}

export default PublicationsList
