"use client"

import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"

import { PageHeader } from "@/components/admin/page-header"
import { ImagePickerField } from "@/components/admin/media-picker"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { DEFAULT_SETTINGS } from "../types/settings.dto"
import { useSettings } from "../hooks/queries"
import { useUpdateSettings } from "../hooks/mutations"
import {
  appearanceFormSchema,
  type AppearanceFormInput,
} from "../validations/settings.schema"

const FONTS = ["Open Sans", "Inter", "Poppins", "Playfair Display", "Lato"]

export function AppearanceView() {
  const { data: settings } = useSettings()
  const updateSettings = useUpdateSettings()

  const form = useForm<AppearanceFormInput>({
    resolver: zodResolver(appearanceFormSchema),
    defaultValues: DEFAULT_SETTINGS.appearance,
  })

  useEffect(() => {
    if (settings) form.reset(settings.appearance)
  }, [settings, form])

  const primaryColor = form.watch("primaryColor")
  const accentColor = form.watch("accentColor")
  const fontFamily = form.watch("fontFamily")

  function onSubmit(values: AppearanceFormInput) {
    updateSettings.mutate({ appearance: values })
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <PageHeader
          title="Appearance"
          description="Control your site branding, theme and default SEO."
        >
          <Button type="submit" disabled={updateSettings.isPending}>
            {updateSettings.isPending ? "Saving…" : "Save changes"}
          </Button>
        </PageHeader>

        <Tabs defaultValue="branding" className="gap-6">
          <TabsList className="w-full max-w-md">
            <TabsTrigger value="branding">Branding</TabsTrigger>
            <TabsTrigger value="theme">Theme</TabsTrigger>
            <TabsTrigger value="seo">SEO</TabsTrigger>
          </TabsList>

          <TabsContent value="branding">
            <Card>
              <CardHeader>
                <CardTitle>Branding</CardTitle>
                <CardDescription>Your logo and brand identity.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                <FormField
                  control={form.control}
                  name="brandName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Brand name</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="logoLight"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Logo (light)</FormLabel>
                        <FormControl>
                          <ImagePickerField value={field.value ?? ""} onChange={field.onChange} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="logoDark"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Logo (dark)</FormLabel>
                        <FormControl>
                          <ImagePickerField value={field.value ?? ""} onChange={field.onChange} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name="favicon"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Favicon</FormLabel>
                      <FormControl>
                        <ImagePickerField value={field.value ?? ""} onChange={field.onChange} />
                      </FormControl>
                      <FormDescription>
                        A square image (32×32px or larger). PNG or SVG recommended.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="theme">
            <Card>
              <CardHeader>
                <CardTitle>Theme</CardTitle>
                <CardDescription>Colours and typography for the public site.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="primaryColor"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Primary colour</FormLabel>
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
                  <FormField
                    control={form.control}
                    name="accentColor"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Accent colour</FormLabel>
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
                </div>
                <FormField
                  control={form.control}
                  name="fontFamily"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Font family</FormLabel>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <FormControl>
                          <SelectTrigger className="w-full sm:w-64">
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {FONTS.map((f) => (
                            <SelectItem key={f} value={f}>
                              {f}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="flex flex-wrap items-center gap-3 rounded-lg border border-border p-4">
                  <span className="text-sm text-muted-foreground">Preview:</span>
                  <span
                    className="rounded-full px-4 py-1.5 text-sm font-semibold text-white"
                    style={{ backgroundColor: primaryColor }}
                  >
                    Primary
                  </span>
                  <span
                    className="rounded-full px-4 py-1.5 text-sm font-semibold text-white"
                    style={{ backgroundColor: accentColor }}
                  >
                    Accent
                  </span>
                  <span style={{ fontFamily }} className="text-sm">
                    {fontFamily} sample text
                  </span>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="seo">
            <Card>
              <CardHeader>
                <CardTitle>Default SEO</CardTitle>
                <CardDescription>Fallback metadata used across pages.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                <FormField
                  control={form.control}
                  name="seoTitleTemplate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title template</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormDescription>Use %s for the page title</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="seoDescription"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Meta description</FormLabel>
                      <FormControl>
                        <Textarea {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="ogImage"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Default share image (OG)</FormLabel>
                      <FormControl>
                        <ImagePickerField value={field.value ?? ""} onChange={field.onChange} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </form>
    </Form>
  )
}
