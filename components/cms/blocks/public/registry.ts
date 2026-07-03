import type { ComponentType } from "react"

import type { BlockType } from "@/lib/admin/types"
import type { PublicBlockProps } from "./types"

import { AccountBlock } from "./account"
import { BookAppointmentBlock } from "./book-appointment"
import { BookingBlock } from "./booking"
import { BookingCancelledBlock } from "./booking-cancelled"
import { BookingSuccessBlock } from "./booking-success"
import { BookingsBlock } from "./bookings"
import { CardsBlock } from "./cards"
import { ContactSplitBlock } from "./contact-split"
import { CtaBlock } from "./cta"
import { CustomerReviewsBlock } from "./customer-reviews"
import { FormBlock } from "./form"
import { GalleryBlock } from "./gallery"
import { HeroBlock } from "./hero"
import { ImageBlock } from "./image"
import { ImageTextBlock } from "./image-text"
import { InstagramBlock } from "./instagram"
import { IntroBlock } from "./intro"
import { LegalDocBlock } from "./legal-doc"
import { LocationsBlock } from "./locations"
import { NewsletterBlock } from "./newsletter"
import { OfferBlock } from "./offer"
import { PriceMenuBlock } from "./price-menu"
import { RichTextBlock } from "./rich-text"
import { SigninBlock } from "./signin"
import { SignupBlock } from "./signup"
import { SpacerBlock } from "./spacer"
import { StatsBlock } from "./stats"
import { StoryBlock } from "./story"
import { TeamBlock } from "./team"
import { TestimonialsBlock } from "./testimonials"
import { WorkingHoursBlock } from "./working-hours"

/**
 * Maps each block type to its full-fidelity public-site component. A type
 * absent from this map renders nothing (preserves the old `default: return
 * null` behaviour).
 */
export const publicBlockRegistry: Partial<
  Record<BlockType, ComponentType<PublicBlockProps>>
> = {
  hero: HeroBlock,
  richText: RichTextBlock,
  image: ImageBlock,
  gallery: GalleryBlock,
  cards: CardsBlock,
  cta: CtaBlock,
  testimonials: TestimonialsBlock,
  stats: StatsBlock,
  form: FormBlock,
  spacer: SpacerBlock,
  intro: IntroBlock,
  workingHours: WorkingHoursBlock,
  priceMenu: PriceMenuBlock,
  offer: OfferBlock,
  imageText: ImageTextBlock,
  story: StoryBlock,
  locations: LocationsBlock,
  newsletter: NewsletterBlock,
  instagram: InstagramBlock,
  team: TeamBlock,
  customerReviews: CustomerReviewsBlock,
  contactSplit: ContactSplitBlock,
  booking: BookingBlock,
  bookAppointment: BookAppointmentBlock,
  bookings: BookingsBlock,
  bookingSuccess: BookingSuccessBlock,
  bookingCancelled: BookingCancelledBlock,
  legalDoc: LegalDocBlock,
  signin: SigninBlock,
  signup: SignupBlock,
  account: AccountBlock,
}
