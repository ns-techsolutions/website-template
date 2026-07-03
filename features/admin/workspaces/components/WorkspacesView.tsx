"use client"

import { useMemo, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { PlusIcon, SearchIcon } from "lucide-react"

import { PageHeader } from "@/components/admin/page-header"
import { StatusBadge } from "@/components/admin/status-badge"
import { RowActions } from "@/components/admin/row-actions"
import { useWorkspace } from "@/components/admin/workspace-context"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import type { Workspace, WorkspacePlan } from "@/lib/admin/types"
import { formatDate } from "@/lib/admin/format"
import { ApiClientError } from "@/lib/api/client"
import { useAdminAuthStore } from "@/features/admin/auth/store/admin-auth.store"
import { useCreateWorkspace, useUpdateWorkspace, useUpdateWorkspaceDatabaseUrl } from "../hooks/mutations"
import {
  createWorkspaceFormSchema,
  updateDatabaseUrlSchema,
  updateWorkspaceSchema,
  type CreateWorkspaceFormInput,
  type UpdateDatabaseUrlInput,
  type UpdateWorkspaceInput,
} from "../validations/workspace.schema"

const PLANS: WorkspacePlan[] = ["starter", "pro", "enterprise"]

const planVariant: Record<WorkspacePlan, "secondary" | "info" | "default"> = {
  starter: "secondary",
  pro: "info",
  enterprise: "default",
}

const blankForm: CreateWorkspaceFormInput = {
  name: "",
  slug: "",
  domain: "",
  databaseUrl: "",
  plan: "starter",
  accent: "#2d3b64",
  adminName: "",
  adminEmail: "",
  adminPassword: "",
}

// Excludes visually-ambiguous characters (0/O, 1/I/L) so the code is easy to retype.
const CONFIRM_CODE_CHARS = "ABCDEFGHJKMNPQRSTUVWXYZ23456789"
function randomConfirmCode(length = 6) {
  let out = ""
  for (let i = 0; i < length; i++) {
    out += CONFIRM_CODE_CHARS[Math.floor(Math.random() * CONFIRM_CODE_CHARS.length)]
  }
  return out
}

function Mark({ name, color, className }: { name: string; color: string; className?: string }) {
  return (
    <span
      className={`flex shrink-0 items-center justify-center rounded-md font-heading font-semibold text-white ${className ?? ""}`}
      style={{ backgroundColor: color }}
    >
      {name.charAt(0) || "?"}
    </span>
  )
}

export function WorkspacesView() {
  const { workspaces, active } = useWorkspace()
  const createWorkspace = useCreateWorkspace()
  const updateWorkspace = useUpdateWorkspace()
  const updateDatabaseUrl = useUpdateWorkspaceDatabaseUrl()
  const isMaster = useAdminAuthStore((s) => s.user?.role) === "master"

  const [query, setQuery] = useState("")
  const [open, setOpen] = useState(false)
  const [detail, setDetail] = useState<Workspace | null>(null)
  const [error, setError] = useState<string | null>(null)

  const form = useForm<CreateWorkspaceFormInput>({
    resolver: zodResolver(createWorkspaceFormSchema),
    defaultValues: blankForm,
  })

  const [editError, setEditError] = useState<string | null>(null)
  const editForm = useForm<UpdateWorkspaceInput>({
    resolver: zodResolver(updateWorkspaceSchema),
    defaultValues: { slug: "", domain: "", plan: "starter" },
  })

  const [dbUrlTarget, setDbUrlTarget] = useState<Workspace | null>(null)
  const [confirmCode, setConfirmCode] = useState("")
  const [confirmInput, setConfirmInput] = useState("")
  const [dbUrlError, setDbUrlError] = useState<string | null>(null)
  const dbUrlForm = useForm<UpdateDatabaseUrlInput>({
    resolver: zodResolver(updateDatabaseUrlSchema),
    defaultValues: { databaseUrl: "" },
  })

  const filtered = useMemo(
    () =>
      workspaces.filter((w) => {
        const q = query.toLowerCase()
        return w.name.toLowerCase().includes(q) || w.domain.toLowerCase().includes(q)
      }),
    [workspaces, query]
  )

  function openCreate() {
    setError(null)
    form.reset(blankForm)
    setOpen(true)
  }

  async function onCreate(values: CreateWorkspaceFormInput) {
    setError(null)
    try {
      await createWorkspace.mutateAsync({
        ...values,
        slug: values.slug || values.name.toLowerCase().replace(/\s+/g, "-"),
      })
      form.reset(blankForm)
      setOpen(false)
    } catch (e) {
      setError(
        e instanceof ApiClientError ? e.message : "Failed to create workspace.",
      )
    }
  }

  function openDetail(w: Workspace) {
    setEditError(null)
    editForm.reset({ slug: w.slug, domain: w.domain, plan: w.plan })
    setDetail(w)
  }

  async function onSaveDetailEdits(values: UpdateWorkspaceInput) {
    if (!detail) return
    setEditError(null)
    const patch: { slug?: string; domain?: string; plan?: WorkspacePlan } = {}
    if (values.slug !== detail.slug) patch.slug = values.slug
    if (values.domain !== detail.domain) patch.domain = values.domain
    if (values.plan !== detail.plan) patch.plan = values.plan
    if (Object.keys(patch).length === 0) return
    try {
      const updated = await updateWorkspace.mutateAsync({ id: detail.id, ...patch })
      setDetail(updated)
    } catch (e) {
      setEditError(
        e instanceof ApiClientError ? e.message : "Failed to update workspace.",
      )
    }
  }

  function openDbUrlEdit(w: Workspace) {
    setDbUrlError(null)
    dbUrlForm.reset({ databaseUrl: "" })
    setConfirmInput("")
    setConfirmCode(randomConfirmCode())
    setDbUrlTarget(w)
  }

  async function onSubmitDbUrlChange(values: UpdateDatabaseUrlInput) {
    if (!dbUrlTarget) return
    setDbUrlError(null)
    if (confirmInput.trim().toUpperCase() !== confirmCode) {
      setDbUrlError("That code doesn't match. Re-check and try again.")
      return
    }
    try {
      await updateDatabaseUrl.mutateAsync({
        id: dbUrlTarget.id,
        databaseUrl: values.databaseUrl,
      })
      setDbUrlTarget(null)
    } catch (e) {
      setDbUrlError(
        e instanceof ApiClientError ? e.message : "Failed to update database URL.",
      )
    }
  }

  return (
    <>
      <PageHeader
        title="Workspaces"
        description="Manage the salon businesses (tenants) on the platform."
      >
        {isMaster && (
          <Button onClick={openCreate}>
            <PlusIcon />
            Add workspace
          </Button>
        )}
      </PageHeader>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Tile label="Total workspaces" value={String(workspaces.length)} />
        <Tile label="Active" value={String(workspaces.filter((w) => w.status === "active").length)} />
        <Tile label="On trial" value={String(workspaces.filter((w) => w.status === "trial").length)} />
        <Tile label="Total members" value={String(workspaces.reduce((s, w) => s + w.members, 0))} />
      </div>

      <Card className="gap-0 overflow-hidden py-0">
        <div className="border-b border-border p-4">
          <div className="relative max-w-md">
            <SearchIcon className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search workspaces…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="h-10 pl-9"
            />
          </div>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="pl-4">Workspace</TableHead>
              <TableHead>Domain</TableHead>
              <TableHead>Plan</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Members</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="w-12" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((w) => (
              <TableRow key={w.id}>
                <TableCell className="pl-4">
                  <div className="flex items-center gap-3">
                    <Mark name={w.name} color={w.accent} className="size-9 text-base" />
                    <div>
                      <div className="flex items-center gap-2 font-medium text-foreground">
                        {w.name}
                        {w.id === active?.id && (
                          <Badge variant="success" className="h-5">
                            Current
                          </Badge>
                        )}
                      </div>
                      <div className="text-xs text-muted-foreground">{w.owner}</div>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="text-muted-foreground">{w.domain}</TableCell>
                <TableCell>
                  <Badge variant={planVariant[w.plan]} className="capitalize">
                    {w.plan}
                  </Badge>
                </TableCell>
                <TableCell>
                  <StatusBadge status={w.status} />
                </TableCell>
                <TableCell>{w.members}</TableCell>
                <TableCell className="text-muted-foreground">
                  {formatDate(w.createdAt)}
                </TableCell>
                <TableCell>
                  <RowActions onView={() => openDetail(w)} />
                </TableCell>
              </TableRow>
            ))}
            {filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="py-10 text-center text-muted-foreground">
                  No workspaces found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>

      {/* Create workspace + tenant admin */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Add workspace</DialogTitle>
            <DialogDescription>
              Creates an independent tenant with its own site, data and admin login.
            </DialogDescription>
          </DialogHeader>

          {error && (
            <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {error}
            </p>
          )}

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onCreate)}>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem className="sm:col-span-2">
                      <FormLabel>Business name</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. Glow & Co" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="slug"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Slug</FormLabel>
                      <FormControl>
                        <Input placeholder="glow-co" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="domain"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Custom domain</FormLabel>
                      <FormControl>
                        <Input placeholder="example.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="plan"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Plan</FormLabel>
                      <Select
                        value={field.value}
                        onValueChange={(v) => field.onChange(v as WorkspacePlan)}
                      >
                        <FormControl>
                          <SelectTrigger className="w-full capitalize">
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {PLANS.map((p) => (
                            <SelectItem key={p} value={p} className="capitalize">
                              {p}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="accent"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Brand colour</FormLabel>
                      <FormControl>
                        <div className="flex items-center gap-2">
                          <input
                            type="color"
                            value={field.value}
                            onChange={field.onChange}
                            className="size-9 shrink-0 cursor-pointer rounded-md border border-input bg-transparent"
                          />
                          <Input {...field} />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="sm:col-span-2 mt-1 border-t border-border pt-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Private database
                </div>
                <FormField
                  control={form.control}
                  name="databaseUrl"
                  render={({ field }) => (
                    <FormItem className="sm:col-span-2">
                      <FormLabel>Database URL</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="postgresql://user:pass@host/dbname?sslmode=require"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Create an empty database, push the tenant schema to it, then
                        paste its connection string here. Stored encrypted.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="sm:col-span-2 mt-1 border-t border-border pt-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Tenant admin
                </div>
                <FormField
                  control={form.control}
                  name="adminName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Admin name</FormLabel>
                      <FormControl>
                        <Input placeholder="Full name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="adminEmail"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Admin email</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="admin@example.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="adminPassword"
                  render={({ field }) => (
                    <FormItem className="sm:col-span-2">
                      <FormLabel>Admin password</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="At least 6 characters" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <DialogFooter className="mt-6">
                <DialogClose asChild>
                  <Button variant="outline" type="button">Cancel</Button>
                </DialogClose>
                <Button type="submit" disabled={createWorkspace.isPending}>
                  {createWorkspace.isPending ? "Creating…" : "Create workspace"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Detail */}
      <Dialog open={detail !== null} onOpenChange={(o) => !o && setDetail(null)}>
        <DialogContent className="sm:max-w-xl">
          {detail && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-3">
                  <Mark name={detail.name} color={detail.accent} className="size-11 text-lg" />
                  <div>
                    <DialogTitle>{detail.name}</DialogTitle>
                    <DialogDescription>{detail.domain}</DialogDescription>
                  </div>
                </div>
              </DialogHeader>
              {editError && (
                <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
                  {editError}
                </p>
              )}
              <Form {...editForm}>
                <form onSubmit={editForm.handleSubmit(onSaveDetailEdits)}>
                  <Tabs defaultValue="general">
                    <TabsList className="w-full">
                      <TabsTrigger value="general">General</TabsTrigger>
                      <TabsTrigger value="domain">Domain</TabsTrigger>
                      <TabsTrigger value="billing">Plan &amp; Billing</TabsTrigger>
                    </TabsList>
                    <TabsContent value="general" className="space-y-3 pt-4 text-sm">
                      <Row label="Owner" value={detail.owner} />
                      <Row label="Status" value={<StatusBadge status={detail.status} />} />
                      <Row label="Created" value={formatDate(detail.createdAt)} />
                      {isMaster ? (
                        <FormField
                          control={editForm.control}
                          name="slug"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Slug</FormLabel>
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      ) : (
                        <Row label="Slug" value={detail.slug} />
                      )}
                      {isMaster && (
                        <div className="border-t border-border pt-3">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => openDbUrlEdit(detail)}
                          >
                            Change database URL
                          </Button>
                        </div>
                      )}
                    </TabsContent>
                    <TabsContent value="domain" className="space-y-3 pt-4 text-sm">
                      {isMaster ? (
                        <FormField
                          control={editForm.control}
                          name="domain"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Custom domain</FormLabel>
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                              <FormDescription>
                                The request host that routes to this salon. Changing it
                                takes effect immediately — make sure the new host is
                                wired up before saving.
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      ) : (
                        <Row label="Primary domain" value={detail.domain || "—"} />
                      )}
                    </TabsContent>
                    <TabsContent value="billing" className="space-y-3 pt-4 text-sm">
                      {isMaster ? (
                        <FormField
                          control={editForm.control}
                          name="plan"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Plan</FormLabel>
                              <Select
                                value={field.value}
                                onValueChange={(v) => field.onChange(v as WorkspacePlan)}
                              >
                                <FormControl>
                                  <SelectTrigger className="w-full capitalize">
                                    <SelectValue />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {PLANS.map((p) => (
                                    <SelectItem key={p} value={p} className="capitalize">
                                      {p}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      ) : (
                        <Row label="Plan" value={<Badge variant={planVariant[detail.plan]} className="capitalize">{detail.plan}</Badge>} />
                      )}
                      <Row label="Members" value={`${detail.members} members`} />
                    </TabsContent>
                  </Tabs>
                  {isMaster && (
                    <DialogFooter className="mt-4">
                      <Button type="submit" disabled={updateWorkspace.isPending}>
                        {updateWorkspace.isPending ? "Saving…" : "Save changes"}
                      </Button>
                    </DialogFooter>
                  )}
                </form>
              </Form>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Change database URL — requires typing a freshly-generated code to confirm */}
      <Dialog open={dbUrlTarget !== null} onOpenChange={(o) => !o && setDbUrlTarget(null)}>
        <DialogContent className="sm:max-w-lg">
          {dbUrlTarget && (
            <>
              <DialogHeader>
                <DialogTitle>Change database URL — {dbUrlTarget.name}</DialogTitle>
                <DialogDescription>
                  This repoints the salon at a different Postgres database. Get this
                  wrong and the salon&apos;s site will break or show another salon&apos;s
                  data. The target database must already have the tenant schema pushed
                  to it.
                </DialogDescription>
              </DialogHeader>

              {dbUrlError && (
                <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
                  {dbUrlError}
                </p>
              )}

              <Form {...dbUrlForm}>
                <form onSubmit={dbUrlForm.handleSubmit(onSubmitDbUrlChange)}>
                  <FormField
                    control={dbUrlForm.control}
                    name="databaseUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>New database URL</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="postgresql://user:pass@host/dbname?sslmode=require"
                            autoComplete="off"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="mt-4 rounded-lg border border-border bg-muted/40 p-3">
                    <p className="text-sm text-muted-foreground">
                      To confirm, type this code below:
                    </p>
                    <p className="mt-1 select-none font-mono text-lg font-semibold tracking-[0.3em] text-foreground">
                      {confirmCode}
                    </p>
                  </div>
                  <FormItem className="mt-4">
                    <FormLabel>Confirmation code</FormLabel>
                    <FormControl>
                      <Input
                        value={confirmInput}
                        onChange={(e) => setConfirmInput(e.target.value)}
                        placeholder="Type the code above"
                        autoComplete="off"
                      />
                    </FormControl>
                  </FormItem>

                  <DialogFooter className="mt-4">
                    <DialogClose asChild>
                      <Button variant="outline" type="button">Cancel</Button>
                    </DialogClose>
                    <Button
                      type="submit"
                      className="bg-destructive text-white hover:bg-destructive/90"
                      disabled={
                        updateDatabaseUrl.isPending ||
                        confirmInput.trim().toUpperCase() !== confirmCode
                      }
                    >
                      {updateDatabaseUrl.isPending ? "Updating…" : "Change database URL"}
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}

function Tile({ label, value }: { label: string; value: string }) {
  return (
    <Card className="gap-1 p-4">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="font-heading text-2xl font-semibold text-foreground">{value}</p>
    </Card>
  )
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium text-foreground">{value}</span>
    </div>
  )
}
