// Базовая структура переводов
const translations = {
  en: {
    common: {
      welcome: "Welcome to Perfect Pitcher",
      start: "Start",
      settings: "Settings",
      save: "Save",
      cancel: "Cancel",
      loading: "Loading...",
      error: "An error occurred",
      success: "Success!",
    },
    pitch: {
      create: "Create Pitch",
      edit: "Edit Pitch",
      delete: "Delete Pitch",
      preview: "Preview",
      present: "Present",
    },
  },
  ru: {
    common: {
      welcome: "Добро пожаловать в Perfect Pitcher",
      start: "Начать",
      settings: "Настройки",
      save: "Сохранить",
      cancel: "Отмена",
      loading: "Загрузка...",
      error: "Произошла ошибка",
      success: "Успешно!",
    },
    pitch: {
      create: "Создать презентацию",
      edit: "Редактировать презентацию",
      delete: "Удалить презентацию",
      preview: "Предпросмотр",
      present: "Представить",
    },
  },
};

// Функция для получения переводов по локали
export function getTranslation(locale: string = 'en') {
  return translations[locale as keyof typeof translations] || translations.en;
}

export { translations };
