import { PageEditorView } from "@/features/admin/cms-pages/components"

export default async function CmsPageEditor({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  return <PageEditorView pageId={id} />
}
