import { BibliographicPlatform as DbBibliographicPlatform } from '@prisma/client'
import { publicPath } from '@/utils/publicPath'

export enum BibliographicPlatform {
  HAL = 'hal',
  SCANR = 'scanr',
  IDREF = 'idref',
  OPENALEX = 'openalex',
  SCOPUS = 'scopus',
}

export const BibliographicPlatformMetadata: Record<
  BibliographicPlatform,
  { name: string; icon: string }
> = {
  [BibliographicPlatform.HAL]: { name: 'HAL', icon: publicPath('/icons/hal.png') },
  [BibliographicPlatform.SCANR]: { name: 'ScanR', icon: publicPath('/icons/scanr.png') },
  [BibliographicPlatform.IDREF]: { name: 'IdRef', icon: publicPath('/icons/idref.png') },
  [BibliographicPlatform.OPENALEX]: {
    name: 'OpenAlex',
    icon: publicPath('/icons/openalex.png'),
  },
  [BibliographicPlatform.SCOPUS]: { name: 'Scopus', icon: publicPath('/icons/scopus.png') },
}

export const getBibliographicPlatformByNameIgnoreCase = (
  name: string,
): BibliographicPlatform | null => {
  const lowerName = name.toLowerCase()
  return (
    Object.values(BibliographicPlatform).find(
      (platform) => platform.toLowerCase() === lowerName,
    ) || null
  )
}

export const getBibliographicPlatformDbValue = (
  platform: BibliographicPlatform,
): keyof typeof DbBibliographicPlatform =>
  platform as keyof typeof DbBibliographicPlatform

export const getBibliographicPlatformFromDbValue = (
  value: keyof typeof DbBibliographicPlatform,
): BibliographicPlatform => value as BibliographicPlatform
