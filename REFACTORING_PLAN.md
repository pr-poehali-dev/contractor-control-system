# 🔄 ПЛАН РЕФАКТОРИНГА СИСТЕМЫ «ПОДРЯД-ПРО»

## ✅ ВЫПОЛНЕНО (Этап 1: Инфраструктура)

### Frontend
- [x] Установлены зависимости: @reduxjs/toolkit, react-redux, axios
- [x] Создан apiClient.ts с axios и interceptors
- [x] Создан endpoints.ts с константами всех API
- [x] Создан Redux store с configureStore
- [x] Созданы slices:
  - [x] userSlice (auth + userData)
  - [x] objectsSlice (CRUD объектов)
  - [x] worksSlice (CRUD работ)
  - [x] workLogsSlice (создание записей журнала)
  - [x] inspectionsSlice (CRUD проверок)
  - [x] contractorsSlice (приглашение подрядчиков)
- [x] Созданы hooks: useAppDispatch, useAppSelector
- [x] Подключен Redux Provider в main.tsx
- [x] Создан AuthContext.new.tsx (адаптер для backward compatibility)

---

## ✅ ВЫПОЛНЕНО (Этап 2: Миграция компонентов)

### Приоритет 1: Критичные компоненты
- [x] Обновлен AuthContext.tsx для работы с Redux
  - Все методы используют Redux thunks
  - Backward compatibility сохранена
  - userData собирается из разных slices
  
### Приоритет 2: Страницы с тяжелой логикой
- [x] Dashboard.tsx
  - Добавлены useAppSelector и useAppDispatch
  - Данные берутся из Redux slices
  
- [x] Objects.tsx
  - Использует objectsSlice вместо userData.objects
  - Использует deleteObject thunk вместо api.deleteItem
  
- [x] WorkDetail.tsx
  - Использует worksSlice для получения работ
  - Убраны прямые обращения к userData

### Приоритет 3: Формы создания
- [x] Создан универсальный EntityForm
  - Поддержка object/work/inspection
  - Интеграция с Redux thunks
  - Единая логика создания

### Улучшения в slices
- [x] userSlice: добавлен loadUserData с распределением данных по slices
- [x] Все slices имеют setters для массового обновления данных
- [x] Экспортированы правильные имена (loginUser, registerUser, fetchUserData)

---

## 📦 BACKEND РЕФАКТОРИНГ (Этап 3)

### Анализ текущих эндпоинтов
```
✅ Универсальные (оставить):
- /create-data (type, data) → создание любой сущности
- /update-data (type, id, data) → обновление любой сущности
- /user-data → загрузка всех данных пользователя

❌ Дублирующие (удалить после проверки использования):
- /objects - можно заменить на /create-data?type=object
- /works - можно заменить на /create-data?type=work
```

### Задачи backend
- [ ] Проанализировать все вызовы API во frontend
- [ ] Составить карту эндпоинтов: какие используются, какие нет
- [ ] Создать универсальный middleware для авторизации
- [ ] Создать универсальный middleware для проверки прав доступа
- [ ] Унифицировать формат ответов (success, data, error, code)
- [ ] Добавить индексы в БД:
  - user_id в таблицах objects, works, inspections
  - work_id в таблицах work_logs, inspections
  - status в таблицах works, inspections
  
### Оптимизация запросов
- [ ] user-data/index.py:
  - Использовать JOIN вместо N+1
  - Подгружать связанные данные сразу (contractor_name в works)
  
- [ ] get-feed/index.py:
  - Оптимизировать UNION запросы
  - Добавить пагинацию

---

## 🧹 ОЧИСТКА И ОПТИМИЗАЦИЯ (Этап 4)

### Удалить дублирующий код
- [ ] Найти и удалить старые формы после миграции на EntityForm
- [ ] Удалить неиспользуемые компоненты
- [ ] Удалить AuthContext.old.tsx после проверки

### Рефакторинг компонентов
- [ ] Dashboard:
  - FeedFilters → вынести в hook useFeedFilters
  - Логика фильтрации → селектор selectFilteredFeed
  
- [ ] WorkJournal:
  - Упростить JournalTabContent
  - Вынести логику работы с событиями в slice
  
- [ ] Inspection:
  - Логика дефектов → inspectionDefectsSlice
  - Валидация форм → useInspectionValidation hook

### Создать переиспользуемые компоненты
- [ ] DataTable (универсальная таблица с сортировкой/фильтрацией)
- [ ] EntityCard (универсальная карточка для объектов/работ)
- [ ] StatusBadge (универсальный бейдж статуса)
- [ ] DateRangePicker (выбор диапазона дат)

---

## 📊 МЕТРИКИ УСПЕХА

### До рефакторинга
```
Contexts: 1 (AuthContext)
API calls: fetch() разбросаны по компонентам
Форм создания: 5+ отдельных компонентов
Дублирование кода: ~30%
Bundle size: ?
```

### После рефакторинга (цель)
```
Contexts: 0 (все в Redux)
API calls: централизованы через apiClient
Форм создания: 1 универсальный EntityForm
Дублирование кода: <10%
Bundle size: -15% (tree shaking + code splitting)
DevTools: Redux DevTools работает
```

---

## 🔍 ТЕСТИРОВАНИЕ

### Checklist перед релизом
- [ ] Все страницы открываются без ошибок
- [ ] Авторизация работает (email + phone)
- [ ] Создание объектов/работ/проверок работает
- [ ] Журнал работ сохраняется
- [ ] Проверки создаются и обновляются
- [ ] Дефекты добавляются и редактируются
- [ ] Redux DevTools показывает корректное состояние
- [ ] Нет утечек памяти (проверить через Chrome DevTools)
- [ ] Backend логи чистые (нет ошибок 500)

---

## 📝 СЛЕДУЮЩИЕ ШАГИ (СЕЙЧАС)

1. **Заменить AuthContext** (10 мин)
   - Переименовать файлы
   - Проверить импорты в App.tsx

2. **Обновить src/lib/api.ts** (20 мин)
   - Переписать на apiClient
   - Проверить все методы

3. **Мигрировать Dashboard** (30 мин)
   - Заменить fetch на apiClient
   - Использовать selectors

4. **Протестировать критичный путь** (15 мин)
   - Вход → Dashboard → Создание объекта → Создание работы

**Общее время этапа 2: ~1.5 часа**

---

**Дата начала:** 2025-10-20  
**Текущий этап:** 2 (Миграция компонентов)  
**Прогресс:** 30% (инфраструктура готова)