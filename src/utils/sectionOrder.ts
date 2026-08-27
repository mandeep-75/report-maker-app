import { Section, SectionType } from '../data/reportSchema'

export function sortedSections(sections: Section[]): Section[] {
  return [...sections].sort((a, b) => a.order - b.order)
}

export function getSectionByType(sections: Section[], type: SectionType): Section | undefined {
  return sections.find((s) => s.type === type)
}
