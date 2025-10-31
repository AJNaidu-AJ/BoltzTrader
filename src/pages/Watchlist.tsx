import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Plus, Star, GripVertical, Trash2, Bell, BellOff } from "lucide-react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface WatchlistItem {
  id: number;
  name: string;
  count: number;
  alertsEnabled: boolean;
}

const SortableWatchlistItem = ({ item }: { item: WatchlistItem }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: item.id });

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1 }}
      className="flex items-center justify-between p-4 bg-card rounded-lg border hover:border-primary/50 transition-colors"
    >
      <div className="flex items-center gap-3">
        <button className="cursor-grab active:cursor-grabbing touch-none" {...attributes} {...listeners}>
          <GripVertical className="h-5 w-5 text-muted-foreground" />
        </button>
        <div>
          <h3 className="font-medium">{item.name}</h3>
          <p className="text-sm text-muted-foreground">{item.count} symbols</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Badge variant={item.alertsEnabled ? "default" : "secondary"}>
          {item.alertsEnabled ? <Bell className="h-3 w-3 mr-1" /> : <BellOff className="h-3 w-3 mr-1" />}
          {item.alertsEnabled ? "On" : "Off"}
        </Badge>
        <Button variant="ghost" size="icon"><Trash2 className="h-4 w-4" /></Button>
      </div>
    </div>
  );
};

export default function Watchlist() {
  const [newSymbol, setNewSymbol] = useState("");
  const [watchlists, setWatchlists] = useState<WatchlistItem[]>([
    { id: 1, name: "Tech Stocks", count: 12, alertsEnabled: true },
    { id: 2, name: "Energy Sector", count: 8, alertsEnabled: false },
    { id: 3, name: "High Confidence", count: 15, alertsEnabled: true },
  ]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setWatchlists((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">My Watchlists</h1>
          <p className="text-muted-foreground">Drag to reorder your watchlists</p>
        </div>
        <Button><Plus className="h-4 w-4 mr-2" />New List</Button>
      </div>

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={watchlists.map((list) => list.id)} strategy={verticalListSortingStrategy}>
          <div className="space-y-3">
            {watchlists.map((list) => <SortableWatchlistItem key={list.id} item={list} />)}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
}
