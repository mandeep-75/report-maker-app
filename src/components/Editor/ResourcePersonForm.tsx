import { useReportStore } from '../../store/reportStore'
import { Input } from '../UI/Input'
import { Button } from '../UI/Button'
import { Badge } from '../UI/Badge'
import { useImageUpload } from '../../hooks/useImageUpload'
import { Upload, Trash2, UserPlus } from 'lucide-react'

export function ResourcePersonForm() {
  const resourcePersons = useReportStore((s) => s.report.resourcePersons)
  const addResourcePerson = useReportStore((s) => s.addResourcePerson)
  const updateResourcePerson = useReportStore((s) => s.updateResourcePerson)
  const removeResourcePerson = useReportStore((s) => s.removeResourcePerson)
  const { pick } = useImageUpload()

  return (
    <div className="flex flex-col gap-4">
      {resourcePersons.length === 0 && (
        <p className="text-xs text-text-muted">No resource persons added yet.</p>
      )}
      {resourcePersons.map((p, i) => (
        <div key={p.id} className="rounded-lg border border-border bg-surface-alt p-3">
          <div className="mb-2 flex items-center justify-between">
            <Badge>Person {i + 1}</Badge>
            <button
              onClick={() => removeResourcePerson(p.id)}
              className="text-danger hover:text-danger-hover cursor-pointer"
              title="Remove"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
          <div className="flex flex-col gap-2">
            <div className="flex gap-3">
              <div className="flex flex-col items-center gap-1">
                {p.photo ? (
                  <img
                    src={p.photo}
                    alt=""
                    className="h-16 w-16 rounded-full object-cover border border-border"
                  />
                ) : (
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-surface border border-border text-text-muted">
                    <UserPlus className="h-6 w-6" />
                  </div>
                )}
                <button
                  onClick={() => pick((url) => updateResourcePerson(p.id, { photo: url }))}
                  className="flex items-center gap-1 text-[10px] text-primary hover:underline cursor-pointer"
                >
                  <Upload className="h-3 w-3" /> Photo
                </button>
              </div>
              <div className="flex-1">
                <Input
                  label="Name"
                  value={p.name}
                  onChange={(e) => updateResourcePerson(p.id, { name: e.target.value })}
                  placeholder="Full name"
                />
              </div>
            </div>
            <Input
              label="Designation"
              value={p.designation}
              onChange={(e) => updateResourcePerson(p.id, { designation: e.target.value })}
              placeholder="e.g. Professor"
            />
            <div className="grid grid-cols-2 gap-2">
              <Input
                label="Department"
                value={p.department}
                onChange={(e) => updateResourcePerson(p.id, { department: e.target.value })}
              />
              <Input
                label="Institution"
                value={p.institution}
                onChange={(e) => updateResourcePerson(p.id, { institution: e.target.value })}
              />
            </div>
            <Input
              label="Location"
              value={p.location}
              onChange={(e) => updateResourcePerson(p.id, { location: e.target.value })}
              placeholder="City / Country"
            />
          </div>
        </div>
      ))}
      <Button variant="outline" size="sm" onClick={addResourcePerson}>
        <UserPlus className="h-4 w-4" /> Add another person
      </Button>
    </div>
  )
}
