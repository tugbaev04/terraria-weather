# 🌦️ Weather App

**Weather App** — это современное погодное приложение, написанное на React с использованием API Open-Meteo. Оно предоставляет актуальную информацию о погоде на сегодня и 5-дневный прогноз для выбранного города, а также позволяет сохранять избранные локации и переключаться между градусами Цельсия и Фаренгейта.

## Возможности

- Поиск города по названию
- Отображение текущей погоды: температура, иконка, описание
- 5-дневный прогноз
- Добавление городов в избранное
- Переключатель температуры: °C / °F
- Локальное сохранение избранных через `localStorage`
- Эстетичный UI с использованием TailwindCSS

## Технологии

- **React**
- **TypeScript**
- **Open-Meteo API**
- **Tailwind CSS**
- **date-fns**
- **LocalStorage API**

## Структура проекта

src/
├── components/
│   ├── ForecastCard.tsx
│   ├── FavoritesManager.tsx
│   ├── SearchBar.tsx
│   └── TemperatureToggle.tsx
├── assets/
│   ├── images-icon/
│   └── images-bg/
├── App.tsx
├── App.css
└── index.tsx

## Установка

1. **Клонируй репозиторий:**

```bash
git clone https://github.com/твой-юзернейм/weather-app.git
cd weather-app

npm install
# или
yarn install

http://localhost:5173/

Этот проект не требует ключа API, так как Open-Meteo предоставляет открытые данные.

### Что нужно сделать дополнительно:

1. Заменить `твой-юзернейм` на свой GitHub логин.
2. Добавить `screenshot.png` в корень проекта или в `public/`, чтобы показать интерфейс.
3. При желании, подключить бейджи (Vercel, License, etc.).
4. Убедиться, что в `.gitignore` указан `node_modules`.