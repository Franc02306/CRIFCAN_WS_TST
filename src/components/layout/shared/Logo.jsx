'use client'

// React Imports
import { useEffect, useRef } from 'react'

// Next Imports
import Link from 'next/link'
import { useParams } from 'next/navigation'

// Third-party Imports
import Image from 'next/image'

import styled from '@emotion/styled'

// Importar los logos
import logoFull from '../../../../public/images/illustrations/auth/LogoSGCAN (horizontal).png' // Logo grande cuando el menú está expandido
import logoCollapsed from '../../../../public/images/illustrations/auth/LogoSGCANV.png' // Logo pequeño cuando el menú está colapsado

// Config Imports
import themeConfig from '@configs/themeConfig'

// Util Imports
import { getLocalizedUrl } from '@/utils/i18n'

// Hook Imports
import useVerticalNav from '@menu/hooks/useVerticalNav'
import { useSettings } from '@core/hooks/useSettings'

const LogoText = styled.span`
  font-size: 1.375rem;
  line-height: 1.09091;
  font-weight: 700;
  letter-spacing: 0.25px;
  color: var(--mui-palette-text-primary);
  transition: ${({ transitionDuration }) =>
    `margin-inline-start ${transitionDuration}ms ease-in-out, opacity ${transitionDuration}ms ease-in-out`};

  ${({ isHovered, isCollapsed }) =>
    isCollapsed && !isHovered ? 'opacity: 0; margin-inline-start: 0;' : 'opacity: 1; margin-inline-start: 12px;'};
`

const Logo = () => {
  // Refs
  const logoTextRef = useRef(null)

  // Hooks
  const { isHovered, transitionDuration } = useVerticalNav()
  const { settings } = useSettings()
  const { lang: locale } = useParams()

  // Vars
  const { layout } = settings

  useEffect(() => {
    if (layout !== 'collapsed') {
      return
    }

    if (logoTextRef && logoTextRef.current) {
      if (layout === 'collapsed' && !isHovered) {
        logoTextRef.current?.classList.add('hidden')
      } else {
        logoTextRef.current.classList.remove('hidden')
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isHovered, layout])

  // Cambia el logo según si el layout está colapsado o expandido
  const logoSrc = layout === 'collapsed' ? logoCollapsed : logoFull

  return (
    <Link href={getLocalizedUrl('/', locale)} className='flex items-center'>
      <Image
        src={logoSrc}
        width={layout === 'collapsed' ? 50 : 200}
        height={layout === 'collapsed' ? 50 : 50}
        alt='logo'
      />
      {/* LogoText solo se mostrará si el menú está expandido */}
      {layout !== 'collapsed' && (
        <LogoText
          ref={logoTextRef}
          isHovered={isHovered}
          isCollapsed={layout === 'collapsed'}
          transitionDuration={transitionDuration}
        >
          {/* {themeConfig.templateName} */}
        </LogoText>
      )}
    </Link>
  )
}

export default Logo
