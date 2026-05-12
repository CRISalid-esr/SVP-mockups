import { NextRequest, NextResponse } from 'next/server'
import { ResearchStructureService } from '@/lib/services/ResearchStructureService'

const researchStructureService = new ResearchStructureService()

export const GET = async (req: NextRequest) => {
  const urlParams = req.nextUrl.searchParams
  const searchTerm = urlParams.get('searchTerm') || ''
  const page = urlParams.get('page') || '1'
  const pageNumber = parseInt(page, 10) || 1
  const itemsPerPage = 10

  if (process.env.NEXT_PUBLIC_USE_MOCK === 'true') {
    return NextResponse.json({
      researchStructures: [
        {
          uid: 'lab-1',
          acronym: 'LIP6',
          names: [
            { language: 'fr', value: "Laboratoire d'Informatique de Paris 6" },
            { language: 'en', value: 'Laboratory of Informatics of Paris 6' }
          ],
          description: 'A major computer science research laboratory.',
          slug: 'research-structure:lip6'
        }
      ],
      total: 1,
      hasMore: false,
    })
  }

  try {
    const { researchStructures, total } =
      await researchStructureService.getResearchStructures({
        searchTerm,
        pageNumber,
        itemsPerPage,
      })

    return NextResponse.json({
      researchStructures,
      total,
      hasMore: total > pageNumber * itemsPerPage,
    })
  } catch (error) {
    console.error('Error fetching research structures:', error)
    return NextResponse.json({ error: 'An error occurred' }, { status: 500 })
  }
}
