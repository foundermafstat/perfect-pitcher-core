"use client"

import { useMemo } from "react"
import { toast } from "sonner"
import confetti from 'canvas-confetti'
import { animate as framerAnimate } from "framer-motion"
import { useTranslations } from "@/providers/translations-context"
import FirecrawlApp, { ScrapeResponse } from '@mendable/firecrawl-js';
import { useRouter } from 'next/navigation';

export const useToolsFunctions = () => {
  const { t } = useTranslations();
  const router = useRouter();

  const timeFunction = () => {
    const now = new Date()
    return {
      success: true,
      time: now.toLocaleTimeString(),
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      message: t('tools.time') + now.toLocaleTimeString() + " in " + Intl.DateTimeFormat().resolvedOptions().timeZone + " timezone."
    }
  }

  const backgroundFunction = () => {
    try {
      const html = document.documentElement;
      const currentTheme = html.classList.contains('dark') ? 'dark' : 'light';
      const newTheme = currentTheme === 'dark' ? 'light' : 'dark';

      // Принудительно убираем текущую тему и добавляем новую
      html.classList.remove('dark', 'light');
      html.classList.add(newTheme);
      
      // Сохраняем в localStorage
      localStorage.setItem('theme', newTheme);
      
      // Принудительно обновляем CSS переменные
      const event = new CustomEvent('themeChange', { detail: { theme: newTheme } });
      window.dispatchEvent(event);

      toast(`Тема изменена на ${newTheme === 'dark' ? 'тёмную' : 'светлую'}! 🌓`, {
        description: `Активирована ${newTheme === 'dark' ? 'тёмная' : 'светлая'} тема`,
      })

      return { 
        success: true, 
        theme: newTheme,
        message: `Тема изменена на ${newTheme === 'dark' ? 'тёмную' : 'светлую'}`
      };
    } catch (error) {
      const errorMsg = `Ошибка смены темы: ${error}`;
      toast.error("Ошибка смены темы", { description: errorMsg });
      return { 
        success: false, 
        message: errorMsg
      };
    }
  }

  const partyFunction = () => {
    try {
      const duration = 5 * 1000
      const colors = ["#a786ff", "#fd8bbc", "#eca184", "#f8deb1", "#3b82f6", "#14b8a6", "#f97316", "#10b981", "#facc15"]
      
      const confettiConfig = {
        particleCount: 30,
        spread: 100,
        startVelocity: 90,
        colors,
        gravity: 0.5
      }

      const shootConfetti = (angle: number, origin: { x: number, y: number }) => {
        confetti({
          ...confettiConfig,
          angle,
          origin
        })
      }

      const animate = () => {
        const now = Date.now()
        const end = now + duration
        
        const elements = document.querySelectorAll('div, p, button, h1, h2, h3')
        elements.forEach((element) => {
          framerAnimate(element, 
            { 
              scale: [1, 1.1, 1],
              rotate: [0, 5, -5, 0],
            }, 
            { 
              duration: 0.5,
              repeat: 10,
              ease: "easeInOut"
            }
          )
        })

        const frame = () => {
          if (Date.now() > end) return
          shootConfetti(60, { x: 0, y: 0.5 })
          shootConfetti(120, { x: 1, y: 0.5 })
          requestAnimationFrame(frame)
        }

        const mainElement = document.querySelector('main')
        if (mainElement) {
          mainElement.classList.remove('bg-gradient-to-b', 'from-gray-50', 'to-white')
          const originalBg = mainElement.style.backgroundColor
          
          const changeColor = () => {
            const now = Date.now()
            const end = now + duration
            
            const colorCycle = () => {
              if (Date.now() > end) {
                framerAnimate(mainElement, 
                  { backgroundColor: originalBg },
                  { duration: 0.5 }
                )
                return
              }
              const newColor = colors[Math.floor(Math.random() * colors.length)]
              framerAnimate(mainElement,
                { backgroundColor: newColor },
                { duration: 0.2 }
              )
              setTimeout(colorCycle, 200)
            }
            
            colorCycle()
          }
          
          changeColor()
        }
        
        frame()
      }

      animate()
      toast.success(t('tools.partyMode.toast') + " 🎉", {
        description: t('tools.partyMode.description'),
      })
      return { success: true, message: t('tools.partyMode.success') + " 🎉" }
    } catch (error) {
      return { success: false, message: t('tools.partyMode.failed') + ": " + error }
    }
  }

  const launchWebsite = ({ url }: { url: string }) => {
    window.open(url, '_blank')
    toast(t('tools.launchWebsite') + " 🌐", {
      description: t('tools.launchWebsiteSuccess') + url + ", tell the user it's been launched.",
    })
    return {
      success: true,
      message: `Launched the site${url}, tell the user it's been launched.`
    }
  }

  const copyToClipboard = ({ text }: { text: string }) => {
    navigator.clipboard.writeText(text)
    toast(t('tools.clipboard.toast') + " 📋", {
      description: t('tools.clipboard.description'),
    })
    return {
      success: true,
      text,
      message: t('tools.clipboard.success')
    }
  }

  const scrapeWebsite = async ({ url }: { url: string }) => {
    const apiKey = process.env.NEXT_PUBLIC_FIRECRAWL_API_KEY;
    try {
      const app = new FirecrawlApp({ apiKey: apiKey });
      const scrapeResult = await app.scrapeUrl(url, { formats: ['markdown', 'html'] }) as ScrapeResponse;

      if (!scrapeResult.success) {
        console.log(scrapeResult.error)
        return {
          success: false,
          message: `Failed to scrape: ${scrapeResult.error}`
        };
      }

      toast.success(t('tools.scrapeWebsite.toast') + " 📋", {
        description: t('tools.scrapeWebsite.success'),
      })
    
      return {
        success: true,
        message: "Here is the scraped website content: " + JSON.stringify(scrapeResult.markdown) + "Summarize and explain it to the user now in a response."
      };

    } catch (error) {
      return {
        success: false,
        message: `Error scraping website: ${error}`
      };
    }
  }

  // --- Tasks CRUD ---
  const createTask = async ({ title, description, priority, dueDate }: { title: string; description?: string; priority?: number; dueDate?: string }) => {
    try {
      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, description, priority, dueDate })
      })
      const data = await res.json()
      if (!res.ok || !data.success) throw new Error(data.error || 'Failed to create task')
      toast.success(t('tools.tasks.created') || 'Task created')
      return { success: true, task: data.task }
    } catch (error) {
      toast.error(t('tools.tasks.createFailed') || 'Create task failed')
      return { success: false, message: String(error) }
    }
  }

  const listTasks = async () => {
    try {
      const res = await fetch('/api/tasks')
      const data = await res.json()
      if (!res.ok || !data.success) throw new Error(data.error || 'Failed to list tasks')
      return { success: true, tasks: data.tasks }
    } catch (error) {
      return { success: false, message: String(error), tasks: [] }
    }
  }

  const updateTask = async ({ id, ...rest }: { id: string; title?: string; description?: string; status?: string; priority?: number; dueDate?: string }) => {
    try {
      const res = await fetch(`/api/tasks/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(rest)
      })
      const data = await res.json()
      if (!res.ok || !data.success) throw new Error(data.error || 'Failed to update task')
      toast.success(t('tools.tasks.updated') || 'Task updated')
      return { success: true, task: data.task }
    } catch (error) {
      toast.error(t('tools.tasks.updateFailed') || 'Update task failed')
      return { success: false, message: String(error) }
    }
  }

  const deleteTask = async ({ id }: { id: string }) => {
    try {
      const res = await fetch(`/api/tasks/${id}`, { method: 'DELETE' })
      const data = await res.json()
      if (!res.ok || !data.success) throw new Error(data.error || 'Failed to delete task')
      toast.success(t('tools.tasks.deleted') || 'Task deleted')
      return { success: true }
    } catch (error) {
      toast.error(t('tools.tasks.deleteFailed') || 'Delete task failed')
      return { success: false, message: String(error) }
    }
  }

  // Получить контекст агента для проекта
  const getAgentProjectContext = async (projectId?: string) => {
    try {
      if (!projectId) return { success: false, message: "projectId не указан" }
      const res = await fetch(`/api/projects/${projectId}`)
      if (!res.ok) return { success: false, message: `HTTP ${res.status}` }
      const p = await res.json()
      return {
        success: true,
        message: p?.agentContext ? String(p.agentContext) : "",
        context: p,
      }
    } catch (error) {
      return { success: false, message: String(error) }
    }
  }

  // Навигация по страницам
  const navigateToPage = ({ page, reason }: { page: string; reason?: string }) => {
    try {
      const pageMap: Record<string, string> = {
        'home': '/',
        'my-stories': '/my-stories',
        'stories': '/stories',
        'projects': '/projects',
        'products': '/products',
        'editor': '/editor/new',
        'agent': '/agent',
        'dashboard': '/dashboard',
        'charts': '/charts',
        'forms': '/forms',
        'ui': '/ui',
        'account': '/account',
        'login': '/login',
        'help': '/help'
      }

      const targetPath = pageMap[page]
      if (!targetPath) {
        throw new Error(`Неизвестная страница: ${page}`)
      }

      router.push(targetPath)
      
      const message = reason 
        ? `Переход на страницу "${page}" - ${reason}`
        : `Переход на страницу "${page}"`
      
      toast.success("Навигация 🧭", {
        description: message,
      })

      return {
        success: true,
        page,
        path: targetPath,
        message
      }
    } catch (error) {
      const errorMessage = `Ошибка навигации: ${error}`
      toast.error("Ошибка навигации", {
        description: errorMessage,
      })
      return {
        success: false,
        message: errorMessage
      }
    }
  }

  // Функции управления презентацией
  const nextSlide = () => {
    try {
      // Проверяем если мы на странице презентации
      if (!window.location.pathname.includes('/presentation/')) {
        const message = "Функция доступна только на странице презентации";
        toast.error("Недоступно", { description: message });
        return { success: false, message };
      }

      // Ищем Swiper и используем API
      const swiperEl = document.querySelector('.swiper') as any;
      if (swiperEl && swiperEl.swiper) {
        swiperEl.swiper.slideNext();
        toast.success("Следующий слайд 👉");
        return { success: true, message: "Переход к следующему слайду" };
      }

      // Альтернативный способ - через кнопку
      const nextButton = document.querySelector('.swiper-button-next') as HTMLElement;
      if (nextButton && !nextButton.classList.contains('swiper-button-disabled')) {
        nextButton.click();
        toast.success("Следующий слайд 👉");
        return { success: true, message: "Переход к следующему слайду" };
      }

      // Попробуем симуляцию клавиши стрелки
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight' }));
      toast.success("Следующий слайд 👉");
      return { success: true, message: "Переход к следующему слайду" };
    } catch (error) {
      const errorMsg = `Ошибка перехода к следующему слайду: ${error}`;
      toast.error("Ошибка", { description: errorMsg });
      return { success: false, message: errorMsg };
    }
  };

  const previousSlide = () => {
    try {
      // Проверяем если мы на странице презентации
      if (!window.location.pathname.includes('/presentation/')) {
        const message = "Функция доступна только на странице презентации";
        toast.error("Недоступно", { description: message });
        return { success: false, message };
      }

      // Ищем Swiper и используем API
      const swiperEl = document.querySelector('.swiper') as any;
      if (swiperEl && swiperEl.swiper) {
        swiperEl.swiper.slidePrev();
        toast.success("Предыдущий слайд 👈");
        return { success: true, message: "Переход к предыдущему слайду" };
      }

      // Альтернативный способ - через кнопку
      const prevButton = document.querySelector('.swiper-button-prev') as HTMLElement;
      if (prevButton && !prevButton.classList.contains('swiper-button-disabled')) {
        prevButton.click();
        toast.success("Предыдущий слайд 👈");
        return { success: true, message: "Переход к предыдущему слайду" };
      }

      // Попробуем симуляцию клавиши стрелки
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft' }));
      toast.success("Предыдущий слайд 👈");
      return { success: true, message: "Переход к предыдущему слайду" };
    } catch (error) {
      const errorMsg = `Ошибка перехода к предыдущему слайду: ${error}`;
      toast.error("Ошибка", { description: errorMsg });
      return { success: false, message: errorMsg };
    }
  };

  const goToSlide = ({ slideNumber }: { slideNumber: number }) => {
    try {
      // Проверяем если мы на странице презентации
      if (!window.location.pathname.includes('/presentation/')) {
        const message = "Функция доступна только на странице презентации";
        toast.error("Недоступно", { description: message });
        return { success: false, message };
      }

      // Валидация номера слайда
      if (slideNumber < 1) {
        const message = "Номер слайда должен быть больше 0";
        toast.error("Неверный номер", { description: message });
        return { success: false, message };
      }

      const targetIndex = slideNumber - 1; // Преобразуем в 0-based индекс

      // Ищем Swiper и используем API
      const swiperEl = document.querySelector('.swiper') as any;
      if (swiperEl && swiperEl.swiper) {
        const slides = swiperEl.swiper.slides;
        if (targetIndex >= slides.length) {
          const message = `Слайд ${slideNumber} не существует. Доступно слайдов: ${slides.length}`;
          toast.error("Неверный номер", { description: message });
          return { success: false, message };
        }
        
        swiperEl.swiper.slideTo(targetIndex);
        toast.success(`Переход к слайду ${slideNumber} 🎯`);
        return { success: true, message: `Переход к слайду ${slideNumber}` };
      }

      // Альтернативный способ - через пагинацию
      const paginationItems = document.querySelectorAll('.swiper-pagination-bullet');
      if (targetIndex >= paginationItems.length) {
        const message = `Слайд ${slideNumber} не существует. Доступно слайдов: ${paginationItems.length}`;
        toast.error("Неверный номер", { description: message });
        return { success: false, message };
      }

      const targetBullet = paginationItems[targetIndex] as HTMLElement;
      if (targetBullet) {
        targetBullet.click();
        toast.success(`Переход к слайду ${slideNumber} 🎯`);
        return { success: true, message: `Переход к слайду ${slideNumber}` };
      }

      const message = "Не удалось найти Swiper или элементы управления";
      toast.error("Ошибка", { description: message });
      return { success: false, message };
    } catch (error) {
      const errorMsg = `Ошибка перехода к слайду ${slideNumber}: ${error}`;
      toast.error("Ошибка", { description: errorMsg });
      return { success: false, message: errorMsg };
    }
  };

  return useMemo(() => ({
    timeFunction,
    backgroundFunction,
    partyFunction,
    launchWebsite,
    copyToClipboard,
    scrapeWebsite,
    createTask,
    listTasks,
    updateTask,
    deleteTask,
    getAgentProjectContext,
    navigateToPage,
    nextSlide,
    previousSlide,
    goToSlide,
  }), [t, router])
}