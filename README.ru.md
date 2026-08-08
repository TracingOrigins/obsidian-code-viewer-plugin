<div align="center">
    <h1>Code Viewer</h1>
    <p>
        <img src="https://img.shields.io/badge/dynamic/json?logo=obsidian&color=%23483699&label=downloads&query=%24%5B%22code-viewer%22%5D.downloads&url=https%3A%2F%2Fraw.githubusercontent.com%2Fobsidianmd%2Fobsidian-releases%2Fmaster%2Fcommunity-plugin-stats.json" alt="Obsidian Downloads">
        <img src="https://img.shields.io/github/downloads/TracingOrigins/obsidian-code-viewer-plugin/total?logo=github" alt="GitHub Downloads">
    </p>
    <p>[<a href="https://github.com/TracingOrigins/obsidian-code-viewer-plugin/blob/master/README.zh.md">中文</a> | <a href="https://github.com/TracingOrigins/obsidian-code-viewer-plugin/blob/master/README.md">English</a> | Русский]</p>
    <p><a href="https://community.obsidian.md/account/plugins/code-viewer" target="_blank">Code Viewer</a> — это плагин Obsidian для просмотра и редактирования файлов с кодом. Нажмите на любой поддерживаемый файл, чтобы открыть его с нативной подсветкой синтаксиса, или используйте встроенный редактор для быстрых изменений — без внешних зависимостей.</p>
</div>

## Возможности

- **Нативная подсветка синтаксиса** — использует встроенный `MarkdownRenderer` Obsidian, поэтому цвета всегда соответствуют текущей теме
- **Автоматическая регистрация расширений** — `.py`, `.ts`, `.js`, `.sh`, `.rs`, `.go` и более 50 других расширений открываются напрямую в Code Viewer
- **Номера строк** — опциональная панель с настраиваемыми номерами строк
- **Ноль зависимостей** — никаких внешних библиотек во время выполнения, только API Obsidian
- **Только для чтения** — предотвращает случайное редактирование файлов с кодом
- **Редактирование кода** — изменяйте файлы с кодом через временный Markdown с кнопками сохранения и просмотра
- **Декларативные настройки** — использует API настроек Obsidian 1.13+ для нативного поиска и единообразия
- **Многоязычный интерфейс** — English, 中文, Русский

## Использование

1. Установите и включите плагин
2. Нажмите на любой поддерживаемый файл (`.py`, `.ts`, `.sh` и т. д.) в проводнике файлов
3. Файл откроется в режиме Code View только для чтения с подсветкой синтаксиса
4. Нажмите кнопку **редактирования** (справа вверху), чтобы создать временный `.md` файл
5. Используйте кнопки **Save** и **View** в редакторе для синхронизации изменений

Вы можете настроить, какие расширения обрабатываются, через **Настройки → Code Viewer**.

## Настройки

| Настройка | По умолчанию | Описание |
|-----------|-------------|----------|
| **Расширения файлов** | 50+ расширений | Список расширений через запятую для открытия в Code Viewer |
| **Показывать номера строк** | Вкл | Переключение панели номеров строк |
| **Включить редактирование** | Вкл | Показать кнопку редактирования для изменения кода |
| **Режим открытия** | Текущая вкладка | Где открыть редактор: текущая или новая вкладка |

> **Требования:** Obsidian 1.13.0 или новее.
>
> **Примечание:** Изменение списка расширений требует перезагрузки Obsidian (Ctrl+R).

## Поддерживаемые языки

Python, PowerShell, Bash, TypeScript, TSX, JavaScript, JSX, C#, C, C++, SQL, YAML, TOML, Rust, Go, Lua, GDScript, Batch, Ruby, PHP, Perl, R, Dart, Kotlin, Swift, Vue, Svelte, INI, XML, HTML, CSS, SCSS, Less, JSON, JSON5, HCL, Protobuf, GraphQL и другие.

## Установка

### Из сообщества плагинов Obsidian

1. Откройте **Настройки → Сторонние плагины**
2. Отключите **Безопасный режим**
3. Нажмите **Обзор** и найдите "Code Viewer"
4. Установите и включите

### Вручную

```bash
cd /path/to/vault/.obsidian/plugins
git clone https://github.com/TracingOrigins/obsidian-code-viewer-plugin.git code-viewer
cd code-viewer
npm install && npm run build
```

Затем включите плагин в **Настройки → Сторонние плагины**.

## Разработка

1. Скопируйте `.env.example` в `.env` и укажите `VAULT_PATH` — путь к вашему хранилищу Obsidian:
   ```
   VAULT_PATH=C:/Users/YourName/Documents/MyVault
   ```
2. Установите зависимости и начните разработку:

```bash
npm install        # установка зависимостей
npm run dev        # режим отслеживания (авто-деплой в хранилище)
npm run build      # production сборка (авто-деплой в хранилище)
npm run lint       # запуск eslint
```
