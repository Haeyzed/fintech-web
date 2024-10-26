import 'server-only'
import { Locale, dictionaries, Dictionary } from '@/i18n.config'

export const getDictionary = async (locale: Locale): Promise<Dictionary> => {
  return dictionaries[locale]()
}
