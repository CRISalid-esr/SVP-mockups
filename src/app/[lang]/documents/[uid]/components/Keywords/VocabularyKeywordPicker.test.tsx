import '@testing-library/jest-dom'
import { fireEvent, render, screen } from '@testing-library/react'
import VocabularyKeywordPicker from './VocabularyKeywordPicker'

const setup = () => {
  const onAdd = jest.fn()
  render(<VocabularyKeywordPicker existingLabels={[]} onAdd={onAdd} />)
  return { onAdd, input: screen.getByRole('combobox', { name: 'Chercher un mot-clé' }) }
}

describe('VocabularyKeywordPicker', () => {
  it('restreint la recherche aux vocabulaires cochés', () => {
    const { input } = setup()

    fireEvent.change(input, { target: { value: 'robot' } })
    const groups = screen.getByRole('listbox').querySelectorAll('.MuiAutocomplete-groupLabel')
    expect(Array.from(groups).map((group) => group.textContent)).toEqual(
      expect.arrayContaining(['Computing Classification System', 'European Science Vocabulary']),
    )

    fireEvent.click(screen.getByRole('checkbox', { name: 'Art & Architecture Thesaurus' }))
    expect(input).toHaveAttribute('placeholder', 'Chercher dans AAT')
    fireEvent.change(input, { target: { value: 'robo' } })
    expect(screen.getAllByRole('option').map((option) => option.textContent)).toEqual([
      expect.stringContaining('robotique'),
      'Ajouter « robo » comme mot-clé libre',
    ])
  })

  it('ajoute un terme du vocabulaire ou un mot-clé libre', () => {
    const { onAdd, input } = setup()

    fireEvent.change(input, { target: { value: 'climatologie' } })
    fireEvent.click(screen.getByRole('option', { name: /climatologie/ }))
    expect(onAdd).toHaveBeenLastCalledWith(expect.objectContaining({ label: 'climatologie', vocab: 'euroscivoc' }))

    fireEvent.change(input, { target: { value: 'main sous-actionnée' } })
    fireEvent.click(screen.getByRole('button', { name: 'Ajouter' }))
    expect(onAdd).toHaveBeenLastCalledWith(expect.objectContaining({ label: 'main sous-actionnée', vocab: null }))
  })
})
