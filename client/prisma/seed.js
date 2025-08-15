// prisma/seed.js
import { PrismaClient } from '@prisma/client';
import { defaultStories, defaultBlueprints } from './default-data.js';

const prisma = new PrismaClient();

// Функция для генерации уникальных идентификаторов
function generateUniqueId(prefix, storyId, index) {
  return `${prefix}-${storyId}-${index}`;
}

async function main() {
  console.log('Seeding database...');
  
  // Проверяем, что можем подключиться к базе данных
  try {
    await prisma.$queryRaw`SELECT 1`;
    console.log('Database connection successful');
  } catch (error) {
    console.error('Database connection failed:', error);
    return;
  }
  
  try {
    // Очищаем существующие данные в правильном порядке
    console.log('Clearing existing data...');
    
    // Сначала удаляем элементы
    console.log('Deleting elements...');
    await prisma.element.deleteMany();
    
    // Затем удаляем слайды
    console.log('Deleting slides...');
    await prisma.slide.deleteMany();
    
    // Затем удаляем истории
    console.log('Deleting stories...');
    await prisma.story.deleteMany();
    
    // И наконец удаляем шаблоны
    console.log('Deleting blueprints...');
    await prisma.blueprint.deleteMany();
    
    console.log('Creating stories...');
    // Создаем истории с их слайдами и элементами
    for (const storyData of defaultStories) {
      try {
        console.log(`Creating story ${storyData.id}...`);
        // Создаем историю
        const story = await prisma.story.create({
          data: {
            id: storyData.id,
            title: storyData.title,
            description: storyData.description,
            thumbnail: storyData.thumbnail,
            createdAt: storyData.createdAt,
            updatedAt: storyData.updatedAt,
          }
        });
        
        // Создаем слайды для этой истории
        for (let slideIndex = 0; slideIndex < storyData.slides.length; slideIndex++) {
          const slideData = storyData.slides[slideIndex];
          const uniqueSlideId = generateUniqueId('slide', storyData.id, slideIndex);
          console.log(`Creating slide ${uniqueSlideId} for story ${storyData.id}...`);
          
          const slide = await prisma.slide.create({
            data: {
              id: uniqueSlideId,
              title: slideData.title,
              background: slideData.background,
              storyId: story.id
            }
          });
          
          // Создаем элементы для этого слайда
          for (let elementIndex = 0; elementIndex < slideData.elements.length; elementIndex++) {
            const elementData = slideData.elements[elementIndex];
            const uniqueElementId = generateUniqueId('element', uniqueSlideId, elementIndex);
            
            await prisma.element.create({
              data: {
                id: uniqueElementId,
                type: elementData.type,
                x: elementData.x,
                y: elementData.y,
                width: elementData.width,
                height: elementData.height,
                content: elementData.content,
                style: elementData.style || {},
                slideId: slide.id
              }
            });
          }
        }
      } catch (error) {
        console.error(`Error creating story ${storyData.id}:`, error);
        throw error; // Прерываем выполнение, чтобы исправить ошибку
      }
    }
    
    console.log('Creating blueprints...');
    // Создаем шаблоны (blueprints)
    for (const blueprint of defaultBlueprints) {
      try {
        console.log(`Creating blueprint ${blueprint.id}...`);
        await prisma.blueprint.create({
          data: {
            id: blueprint.id,
            name: blueprint.name,
            type: blueprint.type,
            category: blueprint.category,
            defaultWidth: blueprint.defaultWidth,
            defaultHeight: blueprint.defaultHeight,
            defaultContent: blueprint.defaultContent,
            defaultStyle: blueprint.defaultStyle || {},
            fill: blueprint.fill
          }
        });
      } catch (error) {
        console.error(`Error creating blueprint ${blueprint.id}:`, error);
        throw error; // Прерываем выполнение, чтобы исправить ошибку
      }
    }
    
    console.log('Seed completed successfully!');
  } catch (error) {
    console.error('Error seeding database:', error);
  }
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
