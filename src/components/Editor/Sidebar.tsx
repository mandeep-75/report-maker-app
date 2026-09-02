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
import { GripVertical, Eye, EyeOff, Trash2, FileText } from 'lucide-react'
import { useReportStore } from '../../store/reportStore'
import { Section } from '../../data/reportSchema'
import { sortedSections } from '../../utils/sectionOrder'

function SectionRow({
  section,
  active,
  onSelect,
  onToggleVisibility,
  onDelete,
}: {
  section: Section
  active: boolean
  onSelect: () => void
  onToggleVisibility: () => void
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
      className={`group flex items-center gap-1.5 rounded-lg px-2 py-2 cursor-pointer transition-colors duration-150 ${
        active
          ? 'bg-primary-soft ring-1 ring-primary/30'
          : 'hover:bg-surface-alt/70'
      }`}
      onClick={onSelect}
    >
      <button
        {...attributes}
        {...listeners}
        className="cursor-grab text-text-muted opacity-60 transition-opacity hover:text-text hover:opacity-100 active:cursor-grabbing group-hover:opacity-100"
        onClick={(e) => e.stopPropagation()}
        title="Drag to reorder"
      >
        <GripVertical className="h-4 w-4" />
      </button>
      <FileText
        className={`h-3.5 w-3.5 ${
          active ? 'text-primary' : 'text-text-muted'
        }`}
      />
      <span
        className={`flex-1 truncate text-sm ${
          active ? 'font-medium text-text' : 'text-text'
        }`}
      >
        {section.label}
      </span>
      <button
        onClick={(e) => {
          e.stopPropagation()
          onToggleVisibility()
        }}
        className="rounded p-0.5 text-text-muted transition-colors hover:text-text cursor-pointer"
        title={section.visible ? 'Hide' : 'Show'}
      >
        {section.visible ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
      </button>
      <button
        onClick={(e) => {
          e.stopPropagation()
          onDelete()
        }}
        className="rounded p-0.5 text-text-muted transition-colors hover:text-danger cursor-pointer"
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
  const removeSection = useReportStore((s) => s.removeSection)
  const reorderSections = useReportStore((s) => s.reorderSections)
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }))
  const sections = sortedSections(report.sections)

  const onDragEnd = (e: DragEndEvent) => {
    const { active, over } = e
    if (!over || active.id === over.id) return
    const from = sections.findIndex((s) => s.id === active.id)
    const to = sections.findIndex((s) => s.id === over.id)
    if (from !== -1 && to !== -1) reorderSections(from, to)
  }

  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-border px-3 py-2.5">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-text-muted">
          Report Sections
        </span>
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
                onDelete={() => removeSection(section.id)}
              />
            ))}
          </SortableContext>
        </DndContext>
      </div>
    </div>
  )
}
