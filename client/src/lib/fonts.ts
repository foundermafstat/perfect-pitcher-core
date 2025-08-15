import {
  Inter,
  Lato,
  Merriweather,
  Montserrat,
  Open_Sans,
  Oswald,
  Poppins,
  Raleway,
  Roboto,
} from "next/font/google"

const inter = Inter({
  subsets: ["cyrillic", "latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-inter",
  display: "swap",
})
const roboto = Roboto({
  weight: ["300", "400", "500", "700"],
  subsets: ["cyrillic", "latin"],
  variable: "--font-roboto",
  display: "swap",
})
const openSans = Open_Sans({
  weight: ["300", "400", "600", "700"],
  subsets: ["latin"],
  variable: "--font-open-sans",
  display: "swap",
})
const lato = Lato({
  weight: ["300", "400", "700"],
  subsets: ["latin"],
  variable: "--font-lato",
  display: "swap",
})
const montserrat = Montserrat({
  weight: ["300", "400", "500", "600", "700"],
  subsets: ["cyrillic", "latin"],
  variable: "--font-montserrat",
  display: "swap",
})
const raleway = Raleway({
  weight: ["300", "400", "500", "600", "700"],
  subsets: ["cyrillic", "latin"],
  variable: "--font-raleway",
  display: "swap",
})
const poppins = Poppins({
  weight: ["300", "400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-poppins",
  display: "swap",
})
const oswald = Oswald({
  weight: ["300", "400", "500", "600", "700"],
  subsets: ["cyrillic", "latin"],
  variable: "--font-oswald",
  display: "swap",
})
const merriweather = Merriweather({
  weight: ["300", "400", "700"],
  subsets: ["latin"],
  variable: "--font-merriweather",
  display: "swap",
})

// Google Fonts list
export const googleFonts = [
  { name: "Inter", variable: inter.variable, subsets: ["cyrillic", "latin"] },
  { name: "Roboto", variable: roboto.variable, subsets: ["cyrillic", "latin"] },
  { name: "Open Sans", variable: openSans.variable, subsets: ["latin"] },
  { name: "Lato", variable: lato.variable, subsets: ["cyrillic", "latin"] },
  {
    name: "Montserrat",
    variable: montserrat.variable,
    subsets: ["cyrillic", "latin"],
  },
  {
    name: "Raleway",
    variable: raleway.variable,
    subsets: ["cyrillic", "latin"],
  },
  {
    name: "Poppins",
    variable: poppins.variable,
    subsets: ["cyrillic", "latin"],
  },
  { name: "Oswald", variable: oswald.variable, subsets: ["cyrillic", "latin"] },
  {
    name: "Merriweather",
    variable: merriweather.variable,
    subsets: ["latin"],
  },
  
]

// Custom fonts (these should match the font files in your project's fonts directory)
export const customFonts = [
  "CustomFont1",
  "CustomFont2",
  "CustomFont3",
  // Add more custom fonts here
]
