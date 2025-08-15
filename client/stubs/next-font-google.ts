type FontConfig = { variable?: string } & Record<string, unknown>

function makeFont(name: string) {
  return function fontLoader(config: FontConfig = {}) {
    return {
      className: name,
      variable: config.variable ?? `--font-${name.toLowerCase()}`,
    } as any
  }
}

export const Inter = makeFont("Inter")
export const Lato = makeFont("Lato")
export const Merriweather = makeFont("Merriweather")
export const Montserrat = makeFont("Montserrat")
export const Open_Sans = makeFont("Open_Sans")
export const Oswald = makeFont("Oswald")
export const Poppins = makeFont("Poppins")
export const Raleway = makeFont("Raleway")
export const Roboto = makeFont("Roboto")
export const Source_Sans_3 = makeFont("Source_Sans_3")
export const Urbanist = makeFont("Urbanist")
export const Manrope = makeFont("Manrope")
export const Lexend = makeFont("Lexend")
export const Newsreader = makeFont("Newsreader")




