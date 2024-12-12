'use client'

// MUI Imports
import { useEffect, useState } from 'react'

import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardActions from '@mui/material/CardActions'
import Typography from '@mui/material/Typography'
import Checkbox from '@mui/material/Checkbox'
import Button from '@mui/material/Button'

// Style Imports
import tableStyles from '@core/styles/table.module.css'

// Vars
const UserPermission = ({ id, user }) => {
  const [permissions, setPermissions] = useState([])
  const [allPermissions, setAllPermissions] = useState([])
  const [scenery, setScenery] = useState([])

  // Obtener el ID del rol del usuario
  const idRol = user?.role?.id

  const isPermissionActive = (permissionId, scenarioId) => {
    return permissions.some(
      rolePerm => rolePerm.permission_id.id === permissionId && rolePerm.escenario_id.id === scenarioId
    )
  }

  return (
    <Card>
      <CardHeader title='Permisos Asignados' subheader='' />
      <div className='overflow-x-auto'>
        <table className={tableStyles.table}>
          <thead>
            <tr>
              <th>Permisos</th>
              {scenery.map(scenario => (
                <th key={scenario.id}>{scenario.description}</th>
              ))}
            </tr>
          </thead>
          <tbody className='border-be'>
            {allPermissions.map((permiso, index) => (
              <tr key={index}>
                <td>
                  <Typography color='text.primary'>{permiso.description}</Typography>
                </td>
                {scenery.map(scenario => (
                  <td key={scenario.id}>
                    <Checkbox checked={isPermissionActive(permiso.id, scenario.id)} readOnly />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {/* <CardActions className='flex items-center gap-2'>
        <Button variant='contained' type='submit'>
          Guardar permisos
        </Button>
        <Button variant='tonal' color='secondary' type='reset'>
          Cancelar
        </Button>
      </CardActions> */}
    </Card>
  )
}

export default UserPermission
