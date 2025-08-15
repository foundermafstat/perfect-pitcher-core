// @ts-nocheck
// prisma/seed.ts
import { PrismaClient } from '@prisma/client';
import { defaultStories, defaultBlueprints } from '../src/lib/default-data.js';

const prisma = new PrismaClient()

async function main() {
  await prisma.$transaction([
    prisma.story.deleteMany(),
    prisma.blueprint.deleteMany(),
  ])

  for (const storyData of defaultStories) {
    await prisma.story.create({
      data: {
        ...storyData,
        slides: {
          create: storyData.slides.map(slide => ({
            ...slide,
            elements: {
              create: slide.elements.map(el => ({
                ...el,
                content: el.content,
                style: el.style || {},
              }))
            }
          }))
        }
      }
    })
  }

  await prisma.blueprint.createMany({
    data: defaultBlueprints.map(bp => ({
      ...bp,
      defaultContent: bp.defaultContent,
      defaultStyle: bp.defaultStyle || {},
    }))
  })
}

main()
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })