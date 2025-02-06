const horizontalMenuData = (dictionary, params, session) => [
  // This is how you will normally render submenu
  // MENU PRINCIPAL
  {
    label: dictionary['navigation'].home,
    icon: 'tabler-smart-home',
    href: `/en/home/docs`,
    permission: () => true
  },

  // GESTIÓN SOLO PRA ADMINISTRADORES
  {
    label: dictionary['navigation'].gestion,
    isSection: true,
    icon: 'tabler-tools',
    permission: () => session?.user?.system_role === 1,
    children: [
      {
        label: dictionary['navigation'].usuarios,
        icon: 'tabler-users',
        href: `/en/apps/users/list`
      },
      {
        label: dictionary['navigation'].scraping,
        icon: 'tabler-settings',
        href: `/en/apps/scraping/params-list`
      }
    ]
  },

  // MÓDULOS PARA USUARIOS NO ADMINISTRADORES
  {
    label: dictionary['navigation'].modulos,
    isSection: true,
    icon:'tabler-grid-dots',
    children: [
      {
        label: dictionary['navigation'].cangpt,
        icon: 'tabler-robot',
        href: `/en/apps/can-gpt/chat`
      },
      {
        label: dictionary['navigation'].dashboard,
        icon: 'tabler-chart-bar',
        href: `/en/apps/dashboard/report`
      },
      {
        label:  dictionary['navigation'].phitosanitaryNews,
        icon: 'tabler-spider',
        href: `/en/apps/phytosanitary-news`
      }
    ]
  }
]

export default horizontalMenuData
