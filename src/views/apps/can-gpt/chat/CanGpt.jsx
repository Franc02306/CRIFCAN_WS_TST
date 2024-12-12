'use client'

import React, { useState, useEffect, useMemo } from 'react'

const CanGpt = () => {
  return (
    <div className='App'>
      <div>
        <iframe
          style={{
            position: 'absolute',
            width: '80%',
            height: '80%',
            border: 0
          }}
          src='http://100.29.24.209:8080/'
          title='GeeksforGeeks'
          allow='accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture'
          allowFullScreen
        ></iframe>
      </div>
    </div>
  )
}

export default CanGpt
