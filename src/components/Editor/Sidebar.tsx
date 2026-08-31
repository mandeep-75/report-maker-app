import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical, Eye, EyeOff, Trash2, Plus, FileText, Heading2 } from 'lucide-react'
import { useReportStore } from '../../store/reportStore'
import { Section } from '../../data/reportSchema'
import { sortedSections } from '../../utils/sectionOrder'
import { CUSTOM_SECTION_TYPES } from './addSectionOptions'
import { Dialog } from '../UI/Dialog'
import { Input } from '../UI/Input'
import { Select } from '../UI/Select'
import { Button } from '../UI/Button'
import { useState } from 'react'

function SectionRow({
  section,
  active,
  onSelect,
  onToggleVisibility,
  onToggleHeading,
  onDelete,
}: {
  section: Section
  active: boolean
  onSelect: () => void
  onToggleVisibility: () => void
  onToggleHeading: () => void
  onDelete: () => void
}) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
    id: section.id,
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group flex items-center gap-1 rounded px-1.5 py-1.5 cursor-pointer ${
        active ? 'bg-surface-alt ring-1 ring-primary' : 'hover:bg-surface-alt'
      }`}
      onClick={onSelect}
    >
      <button
        {...attributes}
        {...listeners}
        className="cursor-grab text-text-muted hover:text-text active:cursor-grabbing"
        onClick={(e) => e.stopPropagation()}
        title="Drag to reorder"
      >
        <GripVertical className="h-4 w-4" />
      </button>
      <FileText className="h-3.5 w-3.5 text-text-muted" />
      <span className="flex-1 truncate text-sm text-text">{section.label}</span>
      <button
        onClick={(e) => {
          e.stopPropagation()
          onToggleHeading()
        }}
        className={section.showHeading ? 'text-primary hover:text-primary' : 'text-text-muted hover:text-text'}
        title={section.showHeading ? 'Hide heading' : 'Show heading'}
      >
        <Heading2 className="h-3.5 w-3.5" />
      </button>
      <button
        onClick={(e) => {
          e.stopPropagation()
          onToggleVisibility()
        }}
        className="text-text-muted hover:text-text cursor-pointer"
        title={section.visible ? 'Hide' : 'Show'}
      >
        {section.visible ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
      </button>
      <button
        onClick={(e) => {
          e.stopPropagation()
          onDelete()
        }}
        className="text-text-muted hover:text-danger cursor-pointer"
        title="Delete"
      >
        <Trash2 className="h-3.5 w-3.5" />
      </button>
    </div>
  )
}

export function Sidebar() {
  const report = useReportStore((s) => s.report)
  const activeSectionId = useReportStore((s) => s.activeSectionId)
  const setActiveSection = useReportStore((s) => s.setActiveSection)
  const toggleSectionVisibility = useReportStore((s) => s.toggleSectionVisibility)
  const toggleSectionHeading = useReportStore((s) => s.toggleSectionHeading)
  const removeSection = useReportStore((s) => s.removeSection)
  const reorderSections = useReportStore((s) => s.reorderSections)
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }))
  const sections = sortedSections(report.sections)

  const [addOpen, setAddOpen] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [newType, setNewType] = useState('text')

  const onDragEnd = (e: DragEndEvent) => {
    const { active, over } = e
    if (!over || active.id === over.id) return
    const from = sections.findIndex((s) => s.id === active.id)
    const to = sections.findIndex((s) => s.id === over.id)
    if (from !== -1 && to !== -1) reorderSections(from, to)
  }

  const handleAdd = () => {
    const { addCustomSection } = useReportStore.getState()
    const title = newTitle.trim() || 'Custom Section'
    addCustomSection(title, newType as 'text' | 'gallery' | 'photo' | 'list' | 'quote' | 'table')
    setNewTitle('')
    setAddOpen(false)
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b border-border px-3 py-2">
        <span className="text-xs font-semibold uppercase tracking-wide text-text-muted">
          Report Sections
        </span>
        <button
          onClick={() => setAddOpen(true)}
          className="flex items-center gap-1 rounded px-1.5 py-1 text-primary hover:bg-surface-alt cursor-pointer"
          title="Add section"
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>
      <div className="flex-1 overflow-y-auto p-1.5">
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
          <SortableContext items={sections.map((s) => s.id)} strategy={verticalListSortingStrategy}>
            {sections.map((section) => (
              <SectionRow
                key={section.id}
                section={section}
                active={section.id === activeSectionId}
                onSelect={() => setActiveSection(section.id)}
                onToggleVisibility={() => toggleSectionVisibility(section.id)}
                onToggleHeading={() => toggleSectionHeading(section.id)}
                onDelete={() => removeSection(section.id)}
              />
            ))}
          </SortableContext>
        </DndContext>
      </div>

      <Dialog open={addOpen} onClose={() => setAddOpen(false)} title="Add Custom Section">
        <div className="flex flex-col gap-3">
          <Input
            label="Section Title"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder="e.g. Additional Activities"
          />
          <Select
            label="Content Type"
            value={newType}
            onChange={(e) => setNewType(e.target.value)}
            options={CUSTOM_SECTION_TYPES}
          />
          <div className="flex justify-end gap-2">
            <Button variant="ghost" size="sm" onClick={() => setAddOpen(false)}>
              Cancel
            </Button>
            <Button size="sm" onClick={handleAdd}>
              Add
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  )
}
