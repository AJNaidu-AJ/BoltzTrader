export const mockSupabase = {
  inserted: [] as any[],
  from: (table: string) => ({
    insert: (data: any[]) => {
      mockSupabase.inserted.push(...data)
      return Promise.resolve({ data, error: null })
    }
  }),
  clear: () => {
    mockSupabase.inserted = []
  }
}