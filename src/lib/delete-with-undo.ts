import { toast } from "@/hooks/use-toast"

interface DeleteWithUndoOptions<T> {
  item: T
  itemName: string
  onDelete: (item: T) => Promise<void> | void
  onUndo: (item: T) => Promise<void> | void
}

export async function deleteWithUndo<T>({
  item,
  itemName,
  onDelete,
  onUndo,
}: DeleteWithUndoOptions<T>) {
  let undone = false

  // Show toast with undo button
  toast({
    title: `${itemName} deleted`,
    description: "The item has been deleted.",
    variant: "destructive",
    undo: {
      label: "Undo",
      onClick: async () => {
        undone = true
        try {
          await onUndo(item)
          toast({
            title: `${itemName} restored`,
            description: "The item has been restored successfully.",
          })
        } catch (error) {
          console.error("Error restoring item:", error)
          toast({
            title: "Error",
            description: "Failed to restore the item. Please try again.",
            variant: "destructive",
          })
        }
      },
    },
  })

  // Wait a bit to allow for undo
  await new Promise(resolve => setTimeout(resolve, 1000))

  // If not undone, proceed with deletion
  if (!undone) {
    try {
      await onDelete(item)
    } catch (error) {
      console.error("Error deleting item:", error)
      toast({
        title: "Error",
        description: "Failed to delete the item. Please try again.",
        variant: "destructive",
      })
    }
  }
} 