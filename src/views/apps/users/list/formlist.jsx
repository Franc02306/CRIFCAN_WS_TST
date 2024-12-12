'use client'

import { useState, useEffect, useMemo } from 'react'

import { TextField, Button, Toolbar, Box, Grid, Select, MenuItem, FormControl, InputLabel, InputAdornment, Autocomplete } from '@mui/material'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import dayjs from 'dayjs'

import SearchIcon from '@mui/icons-material/Search' // Importa el icono de búsqueda

import AppReactDatepicker from '@/libs/styles/AppReactDatepicker';
import UserModal from '../create/UserModal'

import { getInstitutions } from '../../../../service/institutionService'
import { getCountry } from '@/service/userService';

dayjs.locale('es')

const FormList = ({ onSearch, users, handleUserAdded, resetPage }) => {
  const [emailFilter, setEmailFilter] = useState('')
  const [addUserOpen, setAddUserOpen] = useState(false)
  const [institutionFilter, setInstitutionFilter] = useState(null)
  const [institutions, setInstitutions] = useState([])
  const [countryFilter, setCountryFilter] = useState('')
  const [countries, setCountries] = useState([])

  // **Función recursiva para traer todas las instituciones activas de la API**
  const fetchAllActiveInstitutions = async (url, allInstitutions = []) => {
    try {
      const { data } = await getInstitutions(url);
      const activeInstitutions = data.results.filter(inst => inst.is_active);
      const updatedInstitutions = [...allInstitutions, ...activeInstitutions];

      if (data.next) {
        return fetchAllActiveInstitutions(data.next, updatedInstitutions);
      }

      return updatedInstitutions.sort((a, b) => a.name.localeCompare(b.name));
    } catch (error) {
      console.error('Error al obtener instituciones:', error);

      return allInstitutions; // Retornar las instituciones obtenidas hasta el momento
    }
  };

  const loadInstitutions = async () => {
    const allActiveInstitutions = await fetchAllActiveInstitutions('/api/models/institution/');

    setInstitutions(allActiveInstitutions); // Actualizar estado del Autocomplete
  };

  const fetchCountries = async () => {
    try {
      const response = await getCountry();

      setCountries(response.data.results);
    } catch (error) {
      console.error("Error al obtener los paises: ", error);
    }
  }

  useEffect(() => {
    loadInstitutions();
    fetchCountries();
  }, []);

  useEffect(() => {
    onSearch(emailFilter, institutionFilter, countryFilter);
    resetPage();
  }, [emailFilter, institutionFilter, countryFilter]);

  return (
    <Toolbar>
      <Box display='flex' alignItems='center' gap={2} sx={{ flexGrow: 1 }}>
        <Grid container spacing={2}>
          {/* Filtro por correo electrónico */}
          <Grid item xs={12} md={4}>
            <TextField
              label='Buscar por Email'
              type='text'
              size='small'
              value={emailFilter}
              onChange={e => setEmailFilter(e.target.value)}
              fullWidth
              autoComplete='off'
              InputProps={{
                startAdornment: (
                  <InputAdornment position='start'>
                    <SearchIcon />
                  </InputAdornment>
                )
              }}
            />
          </Grid>

          {/* Filtro por institución */}
          <Grid item xs={12} md={4}>
            <Autocomplete
              options={institutions}
              getOptionLabel={(option) => option.name || ''}
              value={institutionFilter}
              onChange={(event, newValue) => setInstitutionFilter(newValue)}
              renderOption={(props, option) => (
                <li {...props} key={option.id}> {/* Utiliza option.id como key */}
                  {option.name}
                </li>
              )}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Buscar por Institución"
                  size="small"
                  InputProps={{
                    ...params.InputProps,
                    startAdornment: (
                      <InputAdornment position="start" style={{ paddingLeft: '8.5px', marginRight: '-1px' }}>
                        <SearchIcon />
                      </InputAdornment>
                    ),
                  }}
                />
              )}
              isOptionEqualToValue={(option, value) => option.id === value?.id}
              noOptionsText="Sin coincidencias"
              fullWidth
            />
          </Grid>

          {/* Filtro por país */}
          <Grid item xs={12} md={4}>
            <FormControl fullWidth size='small'>
              <InputLabel>Buscar por País</InputLabel>
              <Select
                value={countryFilter}
                onChange={(e) => setCountryFilter(e.target.value)}
                label='Buscar por País'
              >
                <MenuItem value=''>
                  <em>Todos los Países</em>
                </MenuItem>
                {countries.map((country) => (
                  <MenuItem key={country.id} value={country.description}>
                    {country.description}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Box>

      <Box sx={{ ml: 2 }}>
        <Button
          variant='contained'
          startIcon={<i className='tabler-plus' />}
          onClick={() => setAddUserOpen(true)}
          color='primary'
        >
          Agregar Usuario
        </Button>
      </Box>
      <UserModal
        open={addUserOpen}
        setOpen={setAddUserOpen}
        handleUserAdded={handleUserAdded}
      />
    </Toolbar>
  )
}

export default FormList
