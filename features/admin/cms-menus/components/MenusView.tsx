"use client"

import { useEffect } from "react"
import { useFieldArray, useForm, useWatch, type Control } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import {
  ArrowDownIcon,
  ArrowUpIcon,
  GripVerticalIcon,
  PlusIcon,
  SeparatorVerticalIcon,
  Trash2Icon,
} from "lucide-react"

import { PageHeader } from "@/components/admin/page-header"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { SocialIcon } from "@/components/common/social-icons"
import {
  SOCIAL_PLATFORMS,
  SOCIAL_PLATFORM_LABELS,
  normalizeSocialPlatform,
} from "@/lib/social/platforms"
import { DEFAULT_SETTINGS } from "@/features/admin/cms-appearance/types/settings.dto"
import { useSettings } from "@/features/admin/cms-appearance/hooks/queries"
import { useUpdateSettings } from "@/features/admin/cms-appearance/hooks/mutations"
import {
  menusFormSchema,
  type MenusFormInput,
} from "@/features/admin/cms-appearance/validations/settings.schema"

const uid = () => `lnk-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`

const blank: MenusFormInput = {
  header: DEFAULT_SETTINGS.headerMenu.links,
  buttons: DEFAULT_SETTINGS.headerMenu.buttons,
  columns: DEFAULT_SETTINGS.footerColumns.columns,
  social: DEFAULT_SETTINGS.socialLinks,
  copyright: DEFAULT_SETTINGS.footerColumns.copyright,
  legal: DEFAULT_SETTINGS.footerColumns.legalLinks,
}

const BUTTON_TYPE_LABELS: Record<MenusFormInput["buttons"][number]["type"], string> = {
  link: "Link",
  signin: "Sign In dialog",
  signup: "Sign Up dialog",
}

function FooterColumnLinks({
  control,
  columnIndex,
}: {
  control: Control<MenusFormInput>
  columnIndex: number
}) {
  const { fields, append, remove } = useFieldArray({
    control,
    name: `columns.${columnIndex}.links`,
  })

  return (
    <>
      {fields.map((link, i) => (
        <div key={link.id} className="flex items-center gap-2">
          <FormField
            control={control}
            name={`columns.${columnIndex}.links.${i}.label`}
            render={({ field }) => (
              <FormItem className="flex-1">
                <FormControl>
                  <Input placeholder="Label" className="h-9" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name={`columns.${columnIndex}.links.${i}.url`}
            render={({ field }) => (
              <FormItem className="flex-1">
                <FormControl>
                  <Input placeholder="/url" className="h-9 font-mono text-xs" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button
            type="button"
            size="icon-sm"
            variant="ghost"
            aria-label="Delete"
            onClick={() => remove(i)}
          >
            <Trash2Icon className="text-destructive" />
          </Button>
        </div>
      ))}
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => append({ id: uid(), label: "New link", url: "/" })}
      >
        <PlusIcon />
        Add link
      </Button>
    </>
  )
}

function HeaderButtonRow({
  control,
  index,
  onMoveUp,
  onMoveDown,
  onRemove,
}: {
  control: Control<MenusFormInput>
  index: number
  onMoveUp: () => void
  onMoveDown: () => void
  onRemove: () => void
}) {
  // The URL field only applies to link buttons; auth buttons open a dialog.
  const type = useWatch({ control, name: `buttons.${index}.type` })

  return (
    <div className="flex items-start gap-2">
      <GripVerticalIcon className="mt-2.5 size-4 shrink-0 text-muted-foreground" />
      <FormField
        control={control}
        name={`buttons.${index}.label`}
        render={({ field }) => (
          <FormItem className="flex-1">
            <FormControl>
              <Input placeholder="Label" className="h-9" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={control}
        name={`buttons.${index}.type`}
        render={({ field }) => (
          <FormItem className="w-44 shrink-0">
            <Select value={field.value} onValueChange={field.onChange}>
              <FormControl>
                <SelectTrigger className="h-9 w-full">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="link">{BUTTON_TYPE_LABELS.link}</SelectItem>
                <SelectItem value="signin">{BUTTON_TYPE_LABELS.signin}</SelectItem>
                <SelectItem value="signup">{BUTTON_TYPE_LABELS.signup}</SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={control}
        name={`buttons.${index}.url`}
        render={({ field }) => (
          <FormItem className="flex-1">
            <FormControl>
              <Input
                placeholder="/url"
                className="h-9 font-mono text-xs"
                disabled={type !== "link"}
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={control}
        name={`buttons.${index}.dividerBefore`}
        render={({ field }) => (
          <Button
            type="button"
            size="icon-sm"
            variant="ghost"
            aria-pressed={field.value}
            aria-label="Toggle divider before this button"
            title="Show a divider before this button"
            onClick={() => field.onChange(!field.value)}
            className={field.value ? "text-primary" : "text-muted-foreground"}
          >
            <SeparatorVerticalIcon />
          </Button>
        )}
      />
      <Button type="button" size="icon-sm" variant="ghost" onClick={onMoveUp} aria-label="Move up">
        <ArrowUpIcon />
      </Button>
      <Button type="button" size="icon-sm" variant="ghost" onClick={onMoveDown} aria-label="Move down">
        <ArrowDownIcon />
      </Button>
      <Button type="button" size="icon-sm" variant="ghost" onClick={onRemove} aria-label="Delete">
        <Trash2Icon className="text-destructive" />
      </Button>
    </div>
  )
}

export function MenusView() {
  const { data: settings } = useSettings()
  const updateSettings = useUpdateSettings()

  const form = useForm<MenusFormInput>({
    resolver: zodResolver(menusFormSchema),
    defaultValues: blank,
  })
  const { control } = form

  const headerArray = useFieldArray({ control, name: "header" })
  const buttonsArray = useFieldArray({ control, name: "buttons" })
  const columnsArray = useFieldArray({ control, name: "columns" })
  const socialArray = useFieldArray({ control, name: "social" })
  const legalArray = useFieldArray({ control, name: "legal" })

  useEffect(() => {
    if (!settings) return
    form.reset({
      header: settings.headerMenu.links,
      buttons: settings.headerMenu.buttons,
      columns: settings.footerColumns.columns,
      social: settings.socialLinks.map((s) => ({
        ...s,
        platform: normalizeSocialPlatform(s.platform) ?? "facebook",
      })),
      copyright: settings.footerColumns.copyright,
      legal: settings.footerColumns.legalLinks,
    })
  }, [settings, form])

  function onSubmit(values: MenusFormInput) {
    updateSettings.mutate({
      headerMenu: { links: values.header, buttons: values.buttons },
      footerColumns: {
        columns: values.columns,
        copyright: values.copyright,
        legalLinks: values.legal,
      },
      socialLinks: values.social,
    })
  }

  function moveHeader(i: number, dir: -1 | 1) {
    const to = i + dir
    if (to < 0 || to >= headerArray.fields.length) return
    headerArray.swap(i, to)
  }

  function moveButton(i: number, dir: -1 | 1) {
    const to = i + dir
    if (to < 0 || to >= buttonsArray.fields.length) return
    buttonsArray.swap(i, to)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <PageHeader title="Menus" description="Manage the website header navigation and footer.">
          <Button type="submit" disabled={updateSettings.isPending}>
            {updateSettings.isPending ? "Saving…" : "Save changes"}
          </Button>
        </PageHeader>

        <Tabs defaultValue="header" className="gap-6">
          <TabsList className="w-full max-w-xs">
            <TabsTrigger value="header">Header</TabsTrigger>
            <TabsTrigger value="footer">Footer</TabsTrigger>
          </TabsList>

          {/* Header */}
          <TabsContent value="header" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Navigation links</CardTitle>
                <CardDescription>Links shown in the site header.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                {headerArray.fields.map((link, i) => (
                  <div key={link.id} className="flex items-center gap-2">
                    <GripVerticalIcon className="size-4 shrink-0 text-muted-foreground" />
                    <FormField
                      control={control}
                      name={`header.${i}.label`}
                      render={({ field }) => (
                        <FormItem className="flex-1">
                          <FormControl>
                            <Input placeholder="Label" className="h-9" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={control}
                      name={`header.${i}.url`}
                      render={({ field }) => (
                        <FormItem className="flex-1">
                          <FormControl>
                            <Input placeholder="/url" className="h-9 font-mono text-xs" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button type="button" size="icon-sm" variant="ghost" onClick={() => moveHeader(i, -1)} aria-label="Move up">
                      <ArrowUpIcon />
                    </Button>
                    <Button type="button" size="icon-sm" variant="ghost" onClick={() => moveHeader(i, 1)} aria-label="Move down">
                      <ArrowDownIcon />
                    </Button>
                    <Button
                      type="button"
                      size="icon-sm"
                      variant="ghost"
                      onClick={() => headerArray.remove(i)}
                      aria-label="Delete"
                    >
                      <Trash2Icon className="text-destructive" />
                    </Button>
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => headerArray.append({ id: uid(), label: "New link", url: "/" })}
                >
                  <PlusIcon />
                  Add link
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Header buttons</CardTitle>
                <CardDescription>
                  Call-to-action buttons shown in the header. Each can link to a
                  page or open the sign in / sign up dialog. Auth buttons are
                  hidden automatically once a visitor is signed in.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                {buttonsArray.fields.map((btn, i) => (
                  <HeaderButtonRow
                    key={btn.id}
                    control={control}
                    index={i}
                    onMoveUp={() => moveButton(i, -1)}
                    onMoveDown={() => moveButton(i, 1)}
                    onRemove={() => buttonsArray.remove(i)}
                  />
                ))}
                <Button
                  type="button"
                  variant="outline"
                  onClick={() =>
                    buttonsArray.append({
                      id: uid(),
                      label: "New button",
                      type: "link",
                      url: "/",
                      dividerBefore: false,
                    })
                  }
                >
                  <PlusIcon />
                  Add button
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Footer */}
          <TabsContent value="footer" className="space-y-6">
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              {columnsArray.fields.map((col, ci) => (
                <Card key={col.id}>
                  <CardHeader>
                    <FormField
                      control={control}
                      name={`columns.${ci}.title`}
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Input className="h-9 font-heading font-semibold" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <FooterColumnLinks control={control} columnIndex={ci} />
                  </CardContent>
                </Card>
              ))}
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Social links</CardTitle>
                <CardDescription>Shown in the footer and across the site.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                {socialArray.fields.map((s, si) => (
                  <div key={s.id} className="flex items-center gap-2">
                    <FormField
                      control={control}
                      name={`social.${si}.platform`}
                      render={({ field }) => (
                        <FormItem className="w-40 shrink-0">
                          <Select value={field.value} onValueChange={field.onChange}>
                            <FormControl>
                              <SelectTrigger className="h-9 w-full">
                                <SelectValue placeholder="Platform" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {SOCIAL_PLATFORMS.map((platform) => (
                                <SelectItem key={platform} value={platform}>
                                  <SocialIcon platform={platform} className="size-4" />
                                  {SOCIAL_PLATFORM_LABELS[platform]}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={control}
                      name={`social.${si}.url`}
                      render={({ field }) => (
                        <FormItem className="flex-1">
                          <FormControl>
                            <Input placeholder="https://…" className="h-9 font-mono text-xs" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button
                      type="button"
                      size="icon-sm"
                      variant="ghost"
                      aria-label="Delete"
                      onClick={() => socialArray.remove(si)}
                    >
                      <Trash2Icon className="text-destructive" />
                    </Button>
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => socialArray.append({ id: uid(), platform: "facebook", url: "https://" })}
                >
                  <PlusIcon />
                  Add social link
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Copyright</CardTitle>
                <CardDescription>Use {"{year}"} to insert the current year.</CardDescription>
              </CardHeader>
              <CardContent>
                <FormField
                  control={control}
                  name="copyright"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Legal links</CardTitle>
                <CardDescription>
                  Small-print links shown at the bottom-right of the footer (e.g. Privacy
                  Policy, Terms).
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                {legalArray.fields.map((link, i) => (
                  <div key={link.id} className="flex items-center gap-2">
                    <FormField
                      control={control}
                      name={`legal.${i}.label`}
                      render={({ field }) => (
                        <FormItem className="flex-1">
                          <FormControl>
                            <Input placeholder="Label" className="h-9" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={control}
                      name={`legal.${i}.url`}
                      render={({ field }) => (
                        <FormItem className="flex-1">
                          <FormControl>
                            <Input placeholder="/url" className="h-9 font-mono text-xs" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button
                      type="button"
                      size="icon-sm"
                      variant="ghost"
                      aria-label="Delete"
                      onClick={() => legalArray.remove(i)}
                    >
                      <Trash2Icon className="text-destructive" />
                    </Button>
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => legalArray.append({ id: uid(), label: "New link", url: "/" })}
                >
                  <PlusIcon />
                  Add link
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </form>
    </Form>
  )
}
