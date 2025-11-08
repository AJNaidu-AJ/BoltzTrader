import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { TradeTimeline } from './components/TradeTimeline'

export default function JournalEntryPage() {
  const { entryId } = useParams()
  const [entry, setEntry] = useState(null)
  const [annotations, setAnnotations] = useState([])
  const [newAnnotation, setNewAnnotation] = useState('')

  useEffect(() => {
    if (entryId) {
      fetchEntry(entryId)
      fetchAnnotations(entryId)
    }
  }, [entryId])

  const fetchEntry = async (id: string) => {
    // TODO: Fetch entry from API
  }

  const fetchAnnotations = async (id: string) => {
    // TODO: Fetch annotations from API
  }

  const addAnnotation = async () => {
    if (!newAnnotation.trim()) return
    // TODO: Add annotation via API
    setNewAnnotation('')
  }

  if (!entry) {
    return <div className="container mx-auto p-6">Loading...</div>
  }

  return (
    <div className="container mx-auto p-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Trade Summary */}
          <div className="bg-card p-6 rounded-lg border">
            <h1 className="text-2xl font-bold mb-4">{entry.symbol} Trade</h1>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Side</p>
                <p className="font-semibold">{entry.side}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Size</p>
                <p className="font-semibold">{entry.size}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Price</p>
                <p className="font-semibold">${entry.price}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">P&L</p>
                <p className={`font-semibold ${entry.pnl >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  ${entry.pnl}
                </p>
              </div>
            </div>
          </div>

          {/* Timeline */}
          <div className="bg-card p-6 rounded-lg border">
            <h2 className="text-lg font-semibold mb-4">Trade Timeline</h2>
            <TradeTimeline entry={entry} />
          </div>

          {/* Notes */}
          <div className="bg-card p-6 rounded-lg border">
            <h2 className="text-lg font-semibold mb-4">Notes</h2>
            <p className="text-muted-foreground">{entry.notes || 'No notes added'}</p>
          </div>

          {/* XAI Reasoning */}
          {entry.xai_id && (
            <div className="bg-card p-6 rounded-lg border">
              <h2 className="text-lg font-semibold mb-4">AI Reasoning</h2>
              <p className="text-muted-foreground">AI explanation would be displayed here</p>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Tags */}
          <div className="bg-card p-4 rounded-lg border">
            <h3 className="font-semibold mb-2">Tags</h3>
            <div className="flex flex-wrap gap-2">
              {entry.tags?.map((tag, idx) => (
                <span key={idx} className="px-2 py-1 bg-muted rounded text-sm">
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* Annotations */}
          <div className="bg-card p-4 rounded-lg border">
            <h3 className="font-semibold mb-4">Annotations</h3>
            
            {/* Add Annotation */}
            <div className="mb-4">
              <textarea
                className="w-full p-2 border rounded-md text-sm"
                placeholder="Add annotation..."
                value={newAnnotation}
                onChange={(e) => setNewAnnotation(e.target.value)}
                rows={3}
              />
              <button
                onClick={addAnnotation}
                className="mt-2 px-3 py-1 bg-primary text-primary-foreground rounded text-sm"
              >
                Add
              </button>
            </div>

            {/* Annotations List */}
            <div className="space-y-3">
              {annotations.map((annotation) => (
                <div key={annotation.id} className="border-l-2 border-muted pl-3">
                  <p className="text-sm">{annotation.comment}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {new Date(annotation.created_at).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}