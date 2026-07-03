import type {
  CmsPage,
  FooterColumn,
  MediaAsset,
  MenuLink,
  NavButton,
  SiteAppearance,
  SocialLink,
  Workspace
} from "./types";

// ---------------------------------------------------------------------------
// UI-only seed data for the multi-tenant CMS. No persistence.
// ---------------------------------------------------------------------------

export const workspaces: Workspace[] = [
  {
    id: "ws-1",
    name: "Reine Mayfair",
    slug: "reine-mayfair",
    domain: "reine-mayfair.com",
    plan: "enterprise",
    status: "active",
    owner: "Olivia Bennett",
    members: 12,
    createdAt: "2021-03-15",
    accent: "#2d3b64"
  },
  {
    id: "ws-2",
    name: "Glow & Co",
    slug: "glow-and-co",
    domain: "glowandco.co.uk",
    plan: "pro",
    status: "active",
    owner: "Marcus Hale",
    members: 7,
    createdAt: "2022-07-02",
    accent: "#9a6f4e"
  },
  {
    id: "ws-3",
    name: "Bella Studio",
    slug: "bella-studio",
    domain: "bellastudio.io",
    plan: "starter",
    status: "trial",
    owner: "Sofia Romano",
    members: 3,
    createdAt: "2024-01-20",
    accent: "#7d5a86"
  },
  {
    id: "ws-4",
    name: "Lumière Spa",
    slug: "lumiere-spa",
    domain: "lumierespa.fr",
    plan: "pro",
    status: "active",
    owner: "Camille Dubois",
    members: 9,
    createdAt: "2023-05-11",
    accent: "#3f7d6e"
  },
  {
    id: "ws-5",
    name: "Aura Beauty",
    slug: "aura-beauty",
    domain: "aurabeauty.com",
    plan: "starter",
    status: "suspended",
    owner: "Priya Nair",
    members: 4,
    createdAt: "2023-11-08",
    accent: "#b1503f"
  }
];

// ---- CMS pages (generic blocks) -------------------------------------------

const img = (p: string) => `/images/reine/${p}`;

// Each page recreates the live public design block-by-block, with the real
// copy and images used by the components under features/(home|about|...)

const loremCard =
  "Sagittis congue augue egestas integer diam purus magna and egestas magna suscipit";

// Transactional pages every tenant DB must have for the booking/payment flow.
// Seeded for new salons in tenant-provision, backfilled into existing ones via
// scripts/backfill-system-pages, and also included in the demo `cmsPages` below.
const bookingSuccessPage: CmsPage = {
  id: "page-booking-success",
  title: "Booking Confirmed",
  slug: "/booking/success",
  status: "published",
  updatedAt: "2026-06-13",
  seo: {
    title: "Booking Confirmed — Reine",
    description: "Your appointment is confirmed.",
    ogImage: ""
  },
  blocks: [
    {
      id: "b-bs1",
      type: "bookingSuccess",
      visible: true,
      data: {
        heading: "Payment confirmed!",
        message:
          "Your deposit has been received and your appointment is now confirmed."
      }
    }
  ]
};

const bookingCancelledPage: CmsPage = {
  id: "page-booking-cancelled",
  title: "Payment Cancelled",
  slug: "/booking/cancelled",
  status: "published",
  updatedAt: "2026-06-25",
  seo: {
    title: "Payment Cancelled — Reine",
    description: "Your payment was not completed.",
    ogImage: ""
  },
  blocks: [
    {
      id: "b-bc1",
      type: "bookingCancelled",
      visible: true,
      data: {
        heading: "Payment not completed",
        message:
          "Your payment was cancelled, so your appointment isn't confirmed yet. You can try again from your account."
      }
    }
  ]
};

export const systemCmsPages: CmsPage[] = [bookingSuccessPage, bookingCancelledPage];

export const cmsPages: CmsPage[] = [
  {
    id: "page-home",
    title: "Home",
    slug: "/",
    status: "published",
    updatedAt: "2026-06-10",
    seo: {
      title: "Reine — Luxury Salon & Spa",
      description: "Where beauty meets serenity.",
      ogImage: img("slide-1.jpg")
    },
    blocks: [
      {
        id: "b-h1",
        type: "hero",
        visible: true,
        data: {
          size: "full",
          eyebrow: "",
          title: "WELCOME TO REINE STUDIO",
          subtitle: "YOUR ONE STOP BEAUTY SHOP",
          image: img("slide-1.jpg"),
          buttonLabel: "Discover More",
          buttonUrl: "#intro"
        }
      },
      {
        id: "b-h2",
        type: "intro",
        visible: true,
        data: {
          eyebrow: "MIND, BODY AND SOUL",
          heading: "Luxury salon where you will feel unique",
          body: "Sagittis congue augue egestas integer velna purus purus magna libero suscipit and egestas magna aliquam ipsum vitae purus justo lacus ligula ipsum primis cubilia donec undo augue luctus vitae egestas a molestie donec libero sapien dapibus congue tempor undo quisque and fusce cursus neque blandit fusce aliquam nulla lacinia",
          buttonLabel: "Discover More",
          buttonUrl: "#gallery",
          images: [
            img("woman_02.jpg"),
            img("woman_01.jpg"),
            img("woman_05.jpg")
          ]
        }
      },
      {
        id: "b-h3",
        type: "cards",
        visible: true,
        data: {
          eyebrow: "INDULGE YOURSELF",
          heading: "Your Secret Place of Beauty",
          subheading:
            "Congue augue sagittis egestas integer velna purus purus magna nec suscipit and egestas magna aliquam ipsum vitae purus justo lacus ligula and ipsum lacinia primis cubilia",
          items: [
            { title: "Facials", text: loremCard, icon: "Sparkles" },
            { title: "Waxing", text: loremCard, icon: "Scissors" },
            { title: "Make-Up", text: loremCard, icon: "Brush" },
            { title: "Nails", text: loremCard, icon: "HandHeart" }
          ]
        }
      },
      {
        id: "b-h4",
        type: "workingHours",
        visible: true,
        data: {
          eyebrow: "TIME SCHEDULE",
          heading: "Working Hours",
          body: "Nemo ipsam egestas volute turpis varius ipsum egestas purus diam ligula sapien ultrice sapien tempor aliquam tortor ipsum and augue turpis quaerat aliquet congue and molestie magna in congue undo aliquet congue ultrices quaerat",
          rows: [
            { label: "Mon - Wed", value: "10:00 AM - 9:00 PM" },
            { label: "Thursday", value: "10:00 AM - 7:30 PM" },
            { label: "Friday", value: "10:00 AM - 9:00 PM" },
            { label: "Sat - Sun", value: "10:00 AM - 5:00 PM" }
          ]
        }
      },
      {
        id: "b-h5",
        type: "priceMenu",
        visible: true,
        data: {
          eyebrow: "FOCUS ON BEAUTY",
          heading: "Our Service Menu",
          buttonLabel: "View All Prices",
          items: [
            {
              name: "Oxygen Blast Facial",
              price: "$240",
              duration: "Service length 60 minutes"
            },
            {
              name: "Eyebrow Shaping",
              price: "$50 - $97",
              duration: "Service length 1,5 hours"
            },
            {
              name: "Four Layer Facial",
              price: "$140",
              duration: "Service length 1,5 hours"
            },
            {
              name: "Lash Application",
              price: "$45",
              duration: "Service length 50 minutes"
            },
            {
              name: "Organic Facial",
              price: "$185",
              duration: "Service length 1,5 hours"
            }
          ]
        }
      },
      {
        id: "b-h6",
        type: "cta",
        visible: true,
        data: {
          eyebrow: "COME, RELAX AND ENJOY",
          heading: "Place where you will feel peaceful",
          body: "Sagittis congue augue egestas integer velna purus purus magna blandit suscipit egestas magna diam ipsum aliquam vitae purus justo lacus ligula ipsum congue tempor undo quisque fusce cursus neque",
          buttonLabel: "Book an Appointment",
          buttonUrl: "/book-appointment",
          background: "#f1efec"
        }
      },
      {
        id: "b-h7",
        type: "gallery",
        visible: true,
        data: {
          eyebrow: "BE A MORE PERFECT",
          heading: "Redefine Your Beauty",
          images: [
            img("gallery/img-02-400x500.jpg"),
            img("gallery/hair_07-400x500.jpg"),
            img("gallery/hair_01-400x500.jpg"),
            img("gallery/hair_02-400x500.jpg"),
            img("gallery/hair_04-400x500.jpg")
          ]
        }
      },
      {
        id: "b-h8",
        type: "offer",
        visible: true,
        data: {
          eyebrow: "THIS WEEK ONLY",
          heading: "Get 30% OFF",
          subheading: "Quick Face Makeup",
          buttonLabel: "Book an Appointment",
          buttonUrl: "/book-appointment"
        }
      },
      {
        id: "b-h9",
        type: "testimonials",
        visible: true,
        data: {
          eyebrow: "TESTIMONIALS",
          heading: "Comments & Reviews",
          items: [
            {
              quote:
                "Sagittis congue augue ligula molestie egestas magna ipsum vitae purus ipsum and primis cubilia laoreet augue egestas a luctus donec.",
              author: "Nicole Byer",
              meta: "15 days ago"
            },
            {
              quote:
                "Mauris gestas magnis sapien molestie etiam sapien congue augue and egestas ultrice ipsum vitae purus primis aliquam undo.",
              author: "Laura Merino",
              meta: "10 days ago"
            },
            {
              quote:
                "Sagittis congue augue ligula molestie egestas magna ipsum vitae purus ipsum and primis cubilia laoreet augue egestas a luctus donec.",
              author: "Carmen M. Garcia",
              meta: "18 days ago"
            },
            {
              quote:
                "Mauris gestas magnis sapien molestie etiam sapien congue augue and egestas ultrice ipsum vitae purus primis aliquam undo.",
              author: "Rachel A.",
              meta: "3 days ago"
            }
          ]
        }
      },
      {
        id: "b-h10",
        type: "imageText",
        visible: true,
        data: {
          eyebrow: "YOU ARE BEAUTIFUL",
          heading: "Unleash your inner beauty with Reine",
          image: img("woman_03.jpg"),
          buttonLabel: "Salon Menu",
          buttonUrl: "#",
          bullets: [
            {
              text: "Aliquam vitae molestie quisque sapien diam purus egestas quaerat an aliquet molestie ipsum"
            },
            {
              text: "Sagittis congue augue magna volutpat porta mauris purus and egestas ipsum suscipit quaerat augue"
            }
          ]
        }
      },
      {
        id: "b-h11",
        type: "locations",
        visible: true,
        data: {
          eyebrow: "OUR LOCATIONS",
          heading: "Welcome to Reine",
          items: [
            {
              name: "Visit Reine Wilshire",
              address: "8721 Central Ave, Los Angeles, CA 90036",
              established: "est. 2018",
              image: img("salon_02.jpg")
            },
            {
              name: "Visit Reine Westwood",
              address: "8721 Central Ave, Los Angeles, CA 90036",
              established: "est. 2018",
              image: img("salon_03.jpg")
            }
          ]
        }
      },
      {
        id: "b-h12",
        type: "newsletter",
        visible: true,
        data: {
          heading: "Join Our Newsletter",
          subheading:
            "Receive beauty and wellness insights, events and latest offers!",
          placeholder: "Enter your email here",
          buttonLabel: "Subscribe"
        }
      },
      {
        id: "b-h13",
        type: "instagram",
        visible: true,
        data: {
          heading: "Follow:",
          handle: "@reine_studio",
          images: [
            img("instagram/post-1.jpg"),
            img("instagram/post-2.jpg"),
            img("instagram/post-3.jpg"),
            img("instagram/post-4.jpg"),
            img("instagram/post-5.jpg"),
            img("instagram/post-6.jpg")
          ]
        }
      }
    ]
  },
  {
    id: "page-about",
    title: "About",
    slug: "/about",
    status: "published",
    updatedAt: "2026-06-08",
    seo: {
      title: "About Reine",
      description: "The art of beauty since 2010.",
      ogImage: ""
    },
    blocks: [
      {
        id: "b-a1",
        type: "hero",
        visible: true,
        data: {
          size: "compact",
          eyebrow: "Our Story",
          title: "About Reine",
          subtitle: "",
          image:
            "https://images.unsplash.com/photo-1560066984-138dadb4c035?q=80&w=2000&auto=format&fit=crop",
          buttonLabel: "",
          buttonUrl: ""
        }
      },
      {
        id: "b-a2",
        type: "story",
        visible: true,
        data: {
          eyebrow: "THE ART OF BEAUTY",
          heading: "Elevating standard for premium beauty services.",
          body: "Founded in 2010, Reine Studio has established a standard for premium beauty services in the heart of the city. We believe in subtle, empowering transformations that enhance your natural beauty.\n\nOur team of master stylists and colorists undergo continuous training in the latest techniques and trends, ensuring you receive the highest level of expertise and care during every visit.",
          image:
            "https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?q=80&w=1500&auto=format&fit=crop",
          stats: [
            { value: "14+", label: "Years Experience" },
            { value: "3", label: "Locations" }
          ]
        }
      },
      {
        id: "b-a3",
        type: "team",
        visible: true,
        data: {
          eyebrow: "OUR TEAM",
          heading: "Meet the Artisans",
          members: [
            {
              name: "Elena Rossi",
              role: "Master Stylist",
              image:
                "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=800"
            },
            {
              name: "Marcus Chen",
              role: "Color Specialist",
              image:
                "https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=800"
            },
            {
              name: "Sarah Jenkins",
              role: "Esthetician",
              image:
                "https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=800"
            }
          ]
        }
      }
    ]
  },
  {
    id: "page-services",
    title: "Services",
    slug: "/services",
    status: "published",
    updatedAt: "2026-06-06",
    seo: {
      title: "Service Menu — Reine",
      description: "Explore our full service menu.",
      ogImage: ""
    },
    blocks: [
      {
        id: "b-s1",
        type: "hero",
        visible: true,
        data: {
          size: "compact",
          eyebrow: "Our Offerings",
          title: "Service Menu",
          subtitle: "",
          image:
            "https://images.unsplash.com/photo-1522337660859-02fbefca4702?q=80&w=2000&auto=format&fit=crop",
          buttonLabel: "",
          buttonUrl: ""
        }
      },
      {
        id: "b-s2",
        type: "priceMenu",
        visible: true,
        data: {
          eyebrow: "",
          heading: "Hair Cuts & Styling",
          buttonLabel: "",
          items: [
            { name: "Women's Haircut", price: "$85+", duration: "60 min" },
            { name: "Men's Haircut", price: "$55+", duration: "45 min" },
            { name: "Blowout", price: "$50+", duration: "45 min" },
            {
              name: "Special Occasion Styling",
              price: "$120+",
              duration: "90 min"
            }
          ]
        }
      },
      {
        id: "b-s3",
        type: "priceMenu",
        visible: true,
        data: {
          eyebrow: "",
          heading: "Coloring",
          buttonLabel: "",
          items: [
            {
              name: "Single Process Color",
              price: "$110+",
              duration: "90 min"
            },
            { name: "Partial Highlights", price: "$150+", duration: "120 min" },
            { name: "Full Highlights", price: "$200+", duration: "150 min" },
            { name: "Balayage", price: "$250+", duration: "180 min" }
          ]
        }
      },
      {
        id: "b-s4",
        type: "priceMenu",
        visible: true,
        data: {
          eyebrow: "",
          heading: "Treatments",
          buttonLabel: "",
          items: [
            { name: "Deep Conditioning", price: "$40+", duration: "30 min" },
            { name: "Keratin Treatment", price: "$300+", duration: "180 min" },
            { name: "Scalp Treatment", price: "$60+", duration: "45 min" },
            { name: "Olaplex Bonding", price: "$50+", duration: "30 min" }
          ]
        }
      },
      {
        id: "b-s5",
        type: "priceMenu",
        visible: true,
        data: {
          eyebrow: "",
          heading: "Spa & Grooming",
          buttonLabel: "",
          items: [
            { name: "Signature Facial", price: "$120+", duration: "60 min" },
            { name: "Anti-Aging Facial", price: "$150+", duration: "75 min" },
            { name: "Brow Shaping", price: "$35+", duration: "20 min" },
            { name: "Classic Manicure", price: "$40+", duration: "45 min" }
          ]
        }
      },
      {
        id: "b-s6",
        type: "cta",
        visible: true,
        data: {
          eyebrow: "",
          heading: "Not sure what you need?",
          body: "Book a complimentary 15-minute consultation with one of our master stylists to discuss your hair goals and create a custom plan.",
          buttonLabel: "Book Consultation",
          buttonUrl: "/book-appointment",
          background: "#f5f5f5"
        }
      }
    ]
  },
  {
    id: "page-contact",
    title: "Contact",
    slug: "/contact",
    status: "published",
    updatedAt: "2026-06-11",
    seo: {
      title: "Contact Reine",
      description: "Get in touch with our team.",
      ogImage: ""
    },
    blocks: [
      {
        id: "b-c1",
        type: "hero",
        visible: true,
        data: {
          size: "compact",
          eyebrow: "Get in touch",
          title: "Contact Us",
          subtitle: "",
          image:
            "https://images.unsplash.com/photo-1516975080661-4682a20bd0d2?q=80&w=2000&auto=format&fit=crop",
          buttonLabel: "",
          buttonUrl: ""
        }
      },
      {
        id: "b-c2",
        type: "contactSplit",
        visible: true,
        data: {
          eyebrow: "CONTACT INFO",
          heading: "We'd love to hear from you.",
          address: "8721 Central Ave\nLos Angeles, CA 90036",
          phones:
            "Appointments: +1 (555) 123-4567\nGeneral Inquiries: +1 (555) 987-6543",
          hours:
            "Mon - Wed: 10:00 AM - 9:00 PM\nThursday: 10:00 AM - 7:30 PM\nFriday: 10:00 AM - 9:00 PM\nSat - Sun: 10:00 AM - 5:00 PM",
          formHeading: "Send us a message",
          buttonLabel: "Send Message"
        }
      }
    ]
  },
  {
    id: "page-book",
    title: "Book Appointment",
    slug: "/book-appointment",
    status: "published",
    updatedAt: "2026-06-05",
    seo: {
      title: "Book an Appointment — Reine",
      description: "Reserve your visit online.",
      ogImage: ""
    },
    blocks: [
      {
        id: "b-b1",
        type: "bookAppointment",
        visible: true,
        data: {
          heroTitle: "Book an Appointment",
          heroSubtitle:
            "Please fill out the appointment form below to make appointment",
          heroImage: img("gallery/img-08-400x500.jpg")
        }
      }
    ]
  },
  {
    id: "page-signin",
    title: "Sign In",
    slug: "/signin",
    status: "published",
    updatedAt: "2026-06-13",
    seo: {
      title: "Sign In — Reine",
      description: "Access your Reine account.",
      ogImage: ""
    },
    blocks: [
      {
        id: "b-si1",
        type: "signin",
        visible: true,
        data: {
          eyebrow: "WELCOME BACK",
          heading: "Sign in to your account",
          subtitle: "Enter your details to access your bookings.",
          buttonLabel: "Sign In",
          forgotText: "Forgot password?",
          footerText: "Don't have an account?",
          footerLinkLabel: "Sign up",
          footerLinkUrl: "/signup",
          image: img("woman_01.jpg"),
          fields: [
            { label: "Email", placeholder: "you@example.com", type: "email" },
            { label: "Password", placeholder: "••••••••", type: "password" }
          ]
        }
      }
    ]
  },
  {
    id: "page-signup",
    title: "Sign Up",
    slug: "/signup",
    status: "published",
    updatedAt: "2026-06-13",
    seo: {
      title: "Sign Up — Reine",
      description: "Create your Reine account.",
      ogImage: ""
    },
    blocks: [
      {
        id: "b-su1",
        type: "signup",
        visible: true,
        data: {
          eyebrow: "GET STARTED",
          heading: "Create your account",
          subtitle: "Join us to book and manage your appointments.",
          buttonLabel: "Create Account",
          termsText: "By signing up you agree to our Terms & Privacy Policy.",
          footerText: "Already have an account?",
          footerLinkLabel: "Sign in",
          footerLinkUrl: "/signin",
          image: "",
          fields: [
            { label: "Full name", placeholder: "Jane Doe", type: "text" },
            { label: "Email", placeholder: "you@example.com", type: "email" },
            { label: "Password", placeholder: "••••••••", type: "password" },
            {
              label: "Confirm password",
              placeholder: "••••••••",
              type: "password"
            }
          ]
        }
      }
    ]
  },
  {
    id: "page-account",
    title: "My Account",
    slug: "/account",
    status: "published",
    updatedAt: "2026-06-13",
    seo: {
      title: "My Account — Reine",
      description: "Manage your profile and bookings.",
      ogImage: ""
    },
    blocks: [
      {
        id: "b-ac1",
        type: "account",
        visible: true,
        data: {
          heading: "My Account",
          welcomeText: "Welcome back, Hannah",
          userName: "Hannah Price",
          userEmail: "hannah.price@email.com",
          avatar: "",
          sectionHeading: "Profile details",
          buttonLabel: "Save changes",
          menu: [
            { label: "Profile", icon: "User" },
            { label: "My Appointments", icon: "Calendar" },
            { label: "Favourites", icon: "Heart" },
            { label: "Settings", icon: "Settings" },
            { label: "Log out", icon: "LogOut" }
          ]
        }
      }
    ]
  },
  ...systemCmsPages
];

// ---- Media library --------------------------------------------------------

export const mediaAssets: MediaAsset[] = [
  {
    id: "m-1",
    name: "slide-1.jpg",
    url: img("slide-1.jpg"),
    sizeKb: 420,
    width: 1920,
    height: 1280,
    uploadedAt: "2026-05-01"
  },
  {
    id: "m-2",
    name: "woman_01.jpg",
    url: img("woman_01.jpg"),
    sizeKb: 210,
    width: 800,
    height: 1000,
    uploadedAt: "2026-05-01"
  },
  {
    id: "m-3",
    name: "woman_02.jpg",
    url: img("woman_02.jpg"),
    sizeKb: 198,
    width: 800,
    height: 1000,
    uploadedAt: "2026-05-01"
  },
  {
    id: "m-4",
    name: "woman_03.jpg",
    url: img("woman_03.jpg"),
    sizeKb: 224,
    width: 800,
    height: 1040,
    uploadedAt: "2026-05-02"
  },
  {
    id: "m-5",
    name: "salon_02.jpg",
    url: img("salon_02.jpg"),
    sizeKb: 332,
    width: 1200,
    height: 800,
    uploadedAt: "2026-05-02"
  },
  {
    id: "m-6",
    name: "salon_03.jpg",
    url: img("salon_03.jpg"),
    sizeKb: 318,
    width: 1200,
    height: 800,
    uploadedAt: "2026-05-02"
  },
  {
    id: "m-7",
    name: "img-02.jpg",
    url: img("gallery/img-02-400x500.jpg"),
    sizeKb: 140,
    width: 400,
    height: 500,
    uploadedAt: "2026-05-04"
  },
  {
    id: "m-8",
    name: "img-08.jpg",
    url: img("gallery/img-08-400x500.jpg"),
    sizeKb: 152,
    width: 400,
    height: 500,
    uploadedAt: "2026-05-04"
  },
  {
    id: "m-9",
    name: "hair_01.jpg",
    url: img("gallery/hair_01-400x500.jpg"),
    sizeKb: 138,
    width: 400,
    height: 500,
    uploadedAt: "2026-05-05"
  },
  {
    id: "m-10",
    name: "hair_04.jpg",
    url: img("gallery/hair_04-400x500.jpg"),
    sizeKb: 144,
    width: 400,
    height: 500,
    uploadedAt: "2026-05-05"
  },
  {
    id: "m-11",
    name: "hair_07.jpg",
    url: img("gallery/hair_07-400x500.jpg"),
    sizeKb: 149,
    width: 400,
    height: 500,
    uploadedAt: "2026-05-05"
  },
  {
    id: "m-12",
    name: "logo-white.png",
    url: img("logo-white.png"),
    sizeKb: 22,
    width: 300,
    height: 90,
    uploadedAt: "2026-04-20"
  },
  {
    id: "m-13",
    name: "woman_05.jpg",
    url: img("woman_05.jpg"),
    sizeKb: 206,
    width: 800,
    height: 1000,
    uploadedAt: "2026-05-02"
  },
  {
    id: "m-14",
    name: "hair_02.jpg",
    url: img("gallery/hair_02-400x500.jpg"),
    sizeKb: 141,
    width: 400,
    height: 500,
    uploadedAt: "2026-05-05"
  },
  {
    id: "m-15",
    name: "post-1.jpg",
    url: img("instagram/post-1.jpg"),
    sizeKb: 96,
    width: 600,
    height: 600,
    uploadedAt: "2026-05-06"
  },
  {
    id: "m-16",
    name: "post-2.jpg",
    url: img("instagram/post-2.jpg"),
    sizeKb: 92,
    width: 600,
    height: 600,
    uploadedAt: "2026-05-06"
  },
  {
    id: "m-17",
    name: "post-3.jpg",
    url: img("instagram/post-3.jpg"),
    sizeKb: 88,
    width: 600,
    height: 600,
    uploadedAt: "2026-05-06"
  },
  {
    id: "m-18",
    name: "post-4.jpg",
    url: img("instagram/post-4.jpg"),
    sizeKb: 94,
    width: 600,
    height: 600,
    uploadedAt: "2026-05-06"
  },
  {
    id: "m-19",
    name: "post-5.jpg",
    url: img("instagram/post-5.jpg"),
    sizeKb: 90,
    width: 600,
    height: 600,
    uploadedAt: "2026-05-06"
  },
  {
    id: "m-20",
    name: "post-6.jpg",
    url: img("instagram/post-6.jpg"),
    sizeKb: 95,
    width: 600,
    height: 600,
    uploadedAt: "2026-05-06"
  }
];

// ---- Menus ----------------------------------------------------------------

export const headerMenu: MenuLink[] = [
  { id: "h-1", label: "Home", url: "/" },
  { id: "h-2", label: "Services", url: "/services" },
  { id: "h-3", label: "About Us", url: "/about" },
  { id: "h-4", label: "Contact Us", url: "/contact" }
];

export const headerButtons: NavButton[] = [
  { id: "hb-1", label: "Book Online", type: "link", url: "/book-appointment", dividerBefore: false },
  { id: "hb-2", label: "Sign In", type: "signin", url: "", dividerBefore: true }
];

export const footerColumns: FooterColumn[] = [
  {
    id: "fc-1",
    title: "Explore",
    links: [
      { id: "fl-1", label: "About Us", url: "/about" },
      { id: "fl-2", label: "Services", url: "/services" },
      { id: "fl-3", label: "Contact", url: "/contact" }
    ]
  },
  {
    id: "fc-2",
    title: "Contact",
    links: [
      { id: "fl-4", label: "14 Mayfair Lane, London", url: "#" },
      { id: "fl-5", label: "+44 20 7946 0000", url: "tel:+442079460000" },
      { id: "fl-6", label: "hello@reine.com", url: "mailto:hello@reine.com" }
    ]
  }
];

export const socialLinks: SocialLink[] = [
  { id: "so-1", platform: "facebook", url: "https://facebook.com/reine" },
  {
    id: "so-2",
    platform: "instagram",
    url: "https://instagram.com/reine_studio"
  },
  { id: "so-3", platform: "tiktok", url: "https://tiktok.com/@reine" }
];

export const footerCopyright = "© {year} Reine Studio. All rights reserved.";

// ---- Appearance / site settings -------------------------------------------

export const siteAppearance: SiteAppearance = {
  brandName: "Reine Studio",
  logoLight: img("logo-white.png"),
  logoDark: img("logo.png"),
  favicon: "/favicon.ico",
  primaryColor: "#2d3b64",
  accentColor: "#a06f55",
  fontFamily: "Open Sans",
  seoTitleTemplate: "%s · Reine Studio",
  seoDescription: "Where beauty meets serenity — luxury salon & spa.",
  ogImage: img("slide-1.jpg")
};
