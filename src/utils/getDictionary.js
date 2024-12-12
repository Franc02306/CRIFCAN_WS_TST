// Third-party Imports
import 'server-only'

const dictionaries = {
  en: () => import('@/data/dictionaries/en.json').then(module => module.default)
}

export const getDictionary = async (locale) => {
  console.log(locale); // Verifica que sea 'en' u otro idioma válido.
  
  return dictionaries[locale]();
};

