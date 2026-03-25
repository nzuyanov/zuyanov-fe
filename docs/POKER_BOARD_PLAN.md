# План реализации Poker Tournament Board

## Фаза 0: Подготовка

1. Создать структуру файлов:
   - `app/pages/apps/poker-board.vue` — страница
   - `app/components/apps/poker-board/` — компоненты
   - `app/stores/usePokerStore.ts` — Pinia-стор
   - `app/composables/usePokerTimer.ts` — логика таймеров
   - `app/composables/usePokerSound.ts` — Web Audio API звуки
   - `app/composables/usePokerStorage.ts` — localStorage автосохранение
   - `app/types/poker.ts` — все интерфейсы
2. Определить CSS-переменные покерной темы (зелёный, золотой, тёмный фон) — локально в scoped-стилях или в отдельном файле переменных для poker-board
3. Подобрать и установить библиотеку аватарок (DiceBear)

---

## Фаза 1: Типы и стор ✅

1. **`types/poker.ts`** — все интерфейсы:
   - `PokerConfig` (buyIn, maxRebuys, rebuyPeriodMinutes, gameDurationMinutes, prizes, blinds, chips)
   - `PokerPlayer` (id, name, avatarId, totalContributed, rebuysUsed, addOnUsed, isEliminated, eliminationOrder)
   - `PokerGameState` (status, elapsedSeconds, currentBlindLevel, blindTimerSeconds, dealerIndex, players, totalPot, eliminationCounter)
   - `PokerSaveData` (version, savedAt, config, gameState)

2. **`stores/usePokerStore.ts`** — Setup Store:
   - State: config + gameState
   - Getters: activePlayers, currentBlinds, nextBlinds, prizeAmounts, chipRates, isRebuyPeriod, dealerPlayer, sbPlayer, bbPlayer
   - Actions: initGame, rebuy, addOn, eliminatePlayer, nextDeal, advanceBlinds, pause/resume, finishGame

---

## Фаза 2: Composables ✅

1. **`usePokerTimer.ts`**:
   - Управление двумя таймерами (игра + уровень блайндов)
   - setInterval каждую секунду
   - Пауза/возобновление
   - Коллбэки при достижении 0 (повышение блайндов, конец игры)
   - Предупреждения (5 мин до конца, 1 мин до повышения)

2. **`usePokerSound.ts`**:
   - Web Audio API: генерация тонов
   - Набор звуков: blindsUp, rebuyEnd, gameEnd, warning5min, warning1min
   - Переключатель вкл/выкл (muted по умолчанию)

3. **`usePokerStorage.ts`**:
   - save() — сериализация в localStorage
   - load() — проверка и десериализация
   - clear() — очистка
   - Автосохранение каждые 60 сек + beforeunload + после значимых действий
   - try/catch для переполнения localStorage

---

## Фаза 3: Модалка настройки турнира ✅

1. **`PokerSetupModal.vue`** — полноэкранная модалка с секциями:
   - Секция «Основные параметры» (кол-во игроков, buy-in, длительность, ребаи)
   - Секция «Призовые» (3 поля %, валидация суммы = 100%, превью в ₽)
   - Секция «Блайнды» (SB, BB, интервал, множитель + превью таблицы уровней)
   - Секция «Фишки» (динамический список номиналов, расчёт курса в реальном времени)
   - Секция «Игроки» (таблица имён + аватарки, валидация уникальности)
2. Кнопка «Начать турнир» — активна только при полной валидации
3. Вынести секции в подкомпоненты если они станут громоздкими

---

## Фаза 4: Игровая доска — Layout и статика ✅

1. **`PokerBoard.vue`** — основной layout `100vw × 100vh`, overflow hidden
2. **`PokerHeader.vue`** — кнопка «Назад», заголовок, пауза, звук
3. **`PokerPlayerCard.vue`** — карточка игрока (аватарка, имя, сумма, ребаи, кнопки)
4. **`PokerPlayersGrid.vue`** — сетка карточек, адаптация под 2–20 игроков
5. **`PokerInfoPanel.vue`** — правая панель (блайнды, таймеры, банк, призовые, курс)
6. **`PokerPositionsBar.vue`** — нижняя полоса D / SB / BB
7. Бейджи ролей (D, SB, BB) на карточках игроков

---

## Фаза 5: Игровая механика ✅

1. Запуск таймеров при старте игры
2. Автоматическое повышение блайндов по таймеру + округление до номинала фишки
3. Ребай: увеличение банка, пересчёт призовых, обновление счётчика
4. Add-on: логика «после ребай-периода, 1 раз независимо от ребаев»
5. Ротация позиций: сдвиг D → SB → BB, пропуск выбывших, хедз-ап правило
6. Выбывание: модалка подтверждения, затемнение карточки, фиксация порядка
7. Завершение игры: по таймеру / по 1 игроку / вручную

---

## Фаза 6: Пауза, звук, анимации ✅

1. Пауза: оверлей «ПАУЗА», остановка таймеров, кнопки остаются доступными
2. Звуковые события через `usePokerSound`
3. Анимации:
   - Пульсация при повышении блайндов + текст «БЛАЙНДЫ ПОВЫШЕНЫ!»
   - Уведомление об окончании ребай-периода
   - Красный цвет таймера при < 5 мин
   - Переход позиций при «Следующей раздаче»

---

## Фаза 7: Автосохранение и восстановление ✅

1. Интеграция `usePokerStorage` в стор
2. Стартовый экран: проверка localStorage → модалка «Продолжить / Начать новую»
3. Восстановление в режиме паузы
4. Очистка при завершении игры

---

## Фаза 8: Навигация и краевые случаи ✅

1. Кнопка «Назад»: модалка подтверждения во время игры, свободный переход до старта
2. Экран результатов: 1/2/3 место + остальные по порядку выбывания
3. Краевые случаи:
   - Время вышло, игроков > 1 — уведомление
   - Ребай-период = 0 — сразу add-on
   - localStorage заполнен — предупреждение
   - Дублирующиеся имена — блокировка

---

## Фаза 9: Полировка ✅

1. Проверка на разрешении 1920×1080
2. Моноширинный шрифт для всех числовых значений
3. Контрастность и читаемость с расстояния
4. Финальная проверка всех сценариев из раздела «Краевые случаи»

---

## Фазы 10–15: Интеграция аддона (POKER_BOARD_SPEC_ADDON.md)

> Фазы ниже реализуют дополнения из `docs/POKER_BOARD_SPEC_ADDON.md`.
> Порядок выбран по принципу: сначала фундамент (типы, данные), потом логика, потом UI.
> Каждая фаза самодостаточна — после неё приложение работает без ошибок.

---

### Фаза 10: Типы и подготовка данных ✅

**Цель:** обновить типы и стор под новые фичи, не ломая существующий UI.

1. **`types/poker.ts`** — изменения:
   - Добавить `GameSpeed = 'slow' | 'standard' | 'fast'`
   - Добавить `TournamentStage = 'early' | 'middle' | 'bubble' | 'in-prizes' | 'final-table' | 'heads-up'`
   - Добавить `ChipCaseEntry { denomination: number; color?: string; totalCount: number }`
   - Добавить `ChipDistribution { perPlayer: { denomination: number; count: number }[]; totalValue: number; totalChips: number; isValid: boolean; deficit: number }`
   - Добавить `ChipAvailability { totalDistributions: number; enoughForStart: boolean; enoughForRebuys: boolean; enoughForAddOns: boolean; bottleneck?: string }`
   - Добавить `BlindLevel { level: number; smallBlind: number; bigBlind: number; durationMinutes: number }` (расширить существующий `PokerBlindLevel`)
   - Изменить `PokerConfig`:
     - Удалить поле `blinds: PokerBlindsConfig` (startSB, startBB, intervalMinutes, multiplier)
     - Добавить `gameSpeed: GameSpeed`
     - Добавить `chipCase: ChipCaseEntry[]` (содержимое чемодана)
     - Оставить `buyInChips` (стартовый стек в фишках — нужен для расчёта раздачи)
   - Изменить `PokerGameState`:
     - Добавить `handNumber: number` (номер раздачи, стартует с 1)
     - Добавить `totalAddOns: number` (счётчик использованных аддонов для расчёта среднего стека)
   - Удалить тип `PokerBlindsConfig` (больше не нужен)

2. **`stores/usePokerStore.ts`** — новые геттеры (заглушки, пока без UI):
   - `minBet` — `currentBlinds.bb`
   - `minRaise` — `currentBlinds.bb * 2`
   - `averageStackBB` — средний стек в BB (с учётом ребаев и аддонов)
   - `tournamentStage` — стадия турнира по количеству активных игроков
   - `allBlindLevels` — полная таблица уровней (заглушка, будет заменена в фазе 11)

3. **`stores/usePokerStore.ts`** — изменения в экшенах:
   - `nextDeal()` — добавить `gameState.handNumber++`
   - `rebuy()` — при аддоне инкрементировать `gameState.totalAddOns`
   - `initGame()` — инициализировать `handNumber: 1`, `totalAddOns: 0`

4. **`usePokerStorage.ts`** — добавить `handNumber` и `totalAddOns` в сериализацию/восстановление. Обеспечить обратную совместимость: если в localStorage нет этих полей, подставить дефолты (`handNumber: 1`, `totalAddOns: 0`).

**Риски:** Удаление `PokerBlindsConfig` сломает модалку настроек (секция блайндов) и расчёт блайндов в сторе. Нужно временно оставить заглушку или сразу делать вместе с фазой 11. **Решение:** в этой фазе НЕ удалять старые поля, а добавить новые параллельно. Удаление старых — в фазе 11 после замены UI.

**Итого файлы:**
- Изменить: `app/types/poker.ts`, `app/stores/usePokerStore.ts` (файл `poker.ts`), `app/composables/usePokerStorage.ts`

---

### Фаза 11: Автоматический расчёт блайндов (ЗАМЕНА секции 3.3) ✅

**Цель:** заменить ручной ввод блайндов на автогенерацию по скорости игры.

1. **Новый composable `app/composables/useBlindStructure.ts`**:
   - Функция `generateBlindLevels(params)`:
     - Входные: `startingStack`, `playerCount`, `gameDurationMinutes`, `speed: GameSpeed`, `chipDenominations: number[]`
     - Алгоритм из SPEC_ADDON секция «Автоматический расчёт блайндов» (шаги 1–6)
     - Возвращает `BlindLevel[]`
   - Функция `roundToChip(value, denominations)`:
     - Округление вверх до ближайшего кратного минимальному номиналу
   - Дедупликация соседних уровней с одинаковым BB

2. **`stores/usePokerStore.ts`** — замена логики блайндов:
   - Геттер `allBlindLevels` → использует `generateBlindLevels()` вместо формулы `startBB × multiplier^level`
   - Геттеры `currentBlinds`, `nextBlinds` → читают из `allBlindLevels[currentBlindLevel]`
   - Геттер `blindLevelsPreview` → удалить (заменён на `allBlindLevels`)
   - Экшен `advanceBlinds()` → инкремент `currentBlindLevel`, чтение из таблицы вместо формулы
   - Убрать зависимость от `config.blinds.*`

3. **`PokerSetupModal.vue`** — секция «Блайнды»:
   - Удалить 4 поля ввода (startSB, startBB, interval, multiplier)
   - Добавить 3 кнопки-переключателя скорости: 🐢 Медленная / ⚡ Стандартная / 🚀 Быстрая
   - По умолчанию: ⚡ Стандартная
   - Под кнопками: полная таблица уровней с вертикальным скроллом
     - Колонки: №, SB, BB, мин. рейз (2×BB), длительность
     - Запасные уровни помечены приглушённым цветом
     - Подпись: «Стартовая глубина: X BB», «Ожидаемое завершение: уровень Y»
   - Таблица пересчитывается реактивно при смене скорости, кол-ва игроков, стека, номиналов фишек

4. **Очистка:** удалить `PokerBlindsConfig` из типов, удалить `config.blinds` из стора и storage.

**Зависимости:** требует данные о номиналах фишек → нужно выполнять после или параллельно с фазой 12 (фишки). Если фишки ещё не переделаны, использовать текущие `buyInChips` как единственный номинал.

**Итого файлы:**
- Создать: `app/composables/useBlindStructure.ts`
- Изменить: `app/types/poker.ts`, `app/stores/usePokerStore.ts`, `app/components/apps/poker-board/PokerSetupModal.vue`

---

### Фаза 12: Чемодан фишек и автораздача (секции 21, 22)

**Цель:** заменить простой «buy-in в фишках» на полноценный чемодан с автораздачей.

1. **Новый composable `app/composables/useChipDistribution.ts`**:
   - Функция `calculateChipDistribution(chipCase, playerCount, startingStack, maxRebuys, addOnEnabled)`:
     - Жадный алгоритм из SPEC_ADDON секция 21.3
     - Возвращает `ChipDistribution`
   - Функция `calculateChipAvailability(chipCase, playerCount, startingStack, maxRebuys, addOnEnabled)`:
     - Проверка хватает ли фишек на всех
     - Возвращает `ChipAvailability`

2. **`stores/usePokerStore.ts`** — новые геттеры:
   - `chipDistribution` — рассчитанная раздача на игрока (через composable)
   - `chipAvailability` — хватает ли фишек
   - Обновить `chipRate` — использовать номиналы из `chipCase` вместо старого `buyInChips`
   - Обновить `averageStackBB` — учитывать общее количество фишек с ребаями/аддонами

3. **`PokerSetupModal.vue`** — секция «Фишки» (полная переделка):
   - Ввод содержимого чемодана: таблица `{ номинал, цвет (опционально), количество }`
   - Кнопки «+ Добавить номинал» / «Удалить»
   - Ввод стартового стека (в фишках)
   - Блок «Раздача на игрока»:
     - Автоподсчёт: сколько фишек каждого номинала дать
     - Итого фишек и стоимость
     - Индикация: ✅ хватает / ⚠️ не хватит на ребаи / ❌ не хватает на старт
   - Предупреждение если стек нельзя набрать точно

4. **`PokerPlayerCard.vue`** — изменения в модалке ребая:
   - Показывать состав набора фишек для выдачи: «Выдать: 8×25, 8×50, 5×100, 1×500»
   - Отличие текста «Ребай» / «Add-on»

5. **Связка с фазой 11:** после изменения номиналов фишек в чемодане — пересчёт таблицы блайндов (передача `chipDenominations` в `generateBlindLevels`).

**Итого файлы:**
- Создать: `app/composables/useChipDistribution.ts`
- Изменить: `app/stores/usePokerStore.ts`, `app/components/apps/poker-board/PokerSetupModal.vue`, `app/components/apps/poker-board/PokerPlayerCard.vue`

---

### Фаза 13: UI-дополнения на борде (секции 13, 14, 15, 17)

**Цель:** добавить новую информацию на игровую доску.

1. **`PokerInfoPanel.vue`** — дополнения:
   - **Мин. рейз** — под текущими блайндами: «Мин. рейз: 200» (цвет `--text-secondary`)
   - **Превью 2–3 следующих уровней** — под «След. уровень»: «→ 200 / 400», «→ 400 / 800»
   - **Средний стек в BB** — в блоке статистики рядом с банком:
     - «Игроков: 5 / 8»
     - «Ср. стек: ~42 BB»
     - Цвет по диапазону: >40 зелёный, 20–40 золотой, 10–20 оранжевый, <10 красный
   - **Кнопка «📋 Все уровни»** — открывает модалку с полной таблицей

2. **`PokerHeader.vue`** — дополнения:
   - **Номер раздачи** — мелким шрифтом рядом с названием: «Раздача #47» (цвет `--text-muted`, моноширинный)

3. **Новый `PokerBlindsModal.vue`**:
   - Модалка с полной таблицей всех уровней блайндов
   - Текущий уровень подсвечен зелёным
   - Пройденные уровни затемнены
   - Таймеры НЕ останавливаются (не пауза, а справка)
   - Колонки: №, SB, BB, мин. рейз, длительность

**Итого файлы:**
- Создать: `app/components/apps/poker-board/PokerBlindsModal.vue`
- Изменить: `app/components/apps/poker-board/PokerInfoPanel.vue`, `app/components/apps/poker-board/PokerHeader.vue`, `app/components/apps/poker-board/PokerBoard.vue` (пробросить открытие модалки)

---

### Фаза 14: Стадия турнира и звуки баббла (секция 16)

**Цель:** визуальная индикация стадии + звуковые события баббла.

1. **`PokerHeader.vue`** — бейдж стадии турнира:
   - Расположение: в хедере, между заголовком и кнопками
   - Стадии и стили:
     - «Ранняя стадия» → зелёный бейдж
     - «Средняя стадия» → золотой бейдж
     - «🔴 Баббл!» → красный бейдж с пульсирующей анимацией
     - «В призах» → синий бейдж
     - «🏆 Финальный стол» → золотой бейдж с иконкой трофея
     - «Хедз-ап» → красный бейдж с особым стилем

2. **`usePokerSound.ts`** — 2 новых звука:
   - `bubbleReached` — особый тройной тон при наступлении баббла
   - `bubbleBurst` — победный аккорд при лопании баббла (все в призах)

3. **`PokerBoard.vue`** — отслеживание смены стадии:
   - Watcher на `tournamentStage`: при переходе в `'bubble'` → играть `bubbleReached`
   - При переходе из `'bubble'` в `'in-prizes'`/`'final-table'` → играть `bubbleBurst`
   - Тост-уведомления: «🔴 БАББЛ!», «🎉 ВСЕ В ПРИЗАХ!»

**Итого файлы:**
- Изменить: `app/components/apps/poker-board/PokerHeader.vue`, `app/composables/usePokerSound.ts`, `app/components/apps/poker-board/PokerBoard.vue`

---

### Фаза 15: Финальная интеграция и полировка

**Цель:** убедиться, что всё работает вместе, обновить автосохранение, проверить краевые случаи.

1. **`usePokerStorage.ts`** — обновить схему сохранения:
   - Версия `version: 2`
   - Сериализация новых полей: `gameSpeed`, `chipCase`, `handNumber`, `totalAddOns`
   - Обратная совместимость: миграция `version: 1` → `version: 2` (подставить дефолты для новых полей)
   - Убрать старые поля `blinds` из десериализации

2. **Проверка краевых случаев:**
   - Блайнды корректно генерируются при разных скоростях и количествах игроков
   - Чемодан с 1 номиналом фишки → раздача работает
   - Стек нельзя набрать точно → предупреждение, ближайшее большее значение
   - Фишек не хватает на ребаи → жёлтое предупреждение
   - Баббл при 4 активных (3 приза) → бейдж + звук
   - Номер раздачи сохраняется/восстанавливается
   - Средний стек корректно считается с ребаями и аддонами

3. **Чистка кода:**
   - Удалить весь мёртвый код, связанный со старыми блайндами
   - Убедиться что `PokerSetupModal` не содержит остатков старых полей
   - Проверить, что таблица уровней в модалке и на борде используют один источник данных (`allBlindLevels`)

**Итого файлы:**
- Изменить: `app/composables/usePokerStorage.ts`, возможно финальные правки во всех затронутых файлах

---

## Порядок реализации фаз 10–15

```
Фаза 10 (типы и данные)
   │
   ├──→ Фаза 11 (блайнды)  ──┐
   │                          ├──→ Фаза 13 (UI на борде) ──→ Фаза 15 (интеграция)
   └──→ Фаза 12 (фишки)   ──┘         │
                                        │
                              Фаза 14 (стадии) ─────────────┘
```

- **Фаза 10** — первая, фундамент для всех остальных
- **Фазы 11 и 12** — можно делать параллельно, но 12 частично зависит от 11 (номиналы → расчёт блайндов)
- **Фазы 13 и 14** — зависят от геттеров из 10, можно параллельно
- **Фаза 15** — последняя, финальная проверка

---

## Сводка новых файлов

| Файл | Описание |
|------|----------|
| `app/composables/useBlindStructure.ts` | Алгоритм генерации таблицы блайндов по скорости игры |
| `app/composables/useChipDistribution.ts` | Алгоритм раздачи фишек из чемодана |
| `app/components/apps/poker-board/PokerBlindsModal.vue` | Модалка полной таблицы уровней (для просмотра во время игры) |

## Сводка изменяемых файлов

| Файл | Что меняется |
|------|-------------|
| `app/types/poker.ts` | Новые типы, удаление `PokerBlindsConfig`, изменение `PokerConfig` и `PokerGameState` |
| `app/stores/usePokerStore.ts` | 5 новых геттеров, изменение логики блайндов, `handNumber`, `totalAddOns` |
| `app/composables/usePokerSound.ts` | 2 новых звука: `bubbleReached`, `bubbleBurst` |
| `app/composables/usePokerStorage.ts` | Версия 2, новые поля, миграция |
| `app/components/apps/poker-board/PokerSetupModal.vue` | Переделка секций «Блайнды» и «Фишки» |
| `app/components/apps/poker-board/PokerInfoPanel.vue` | Мин. рейз, ср. стек, превью уровней, кнопка таблицы |
| `app/components/apps/poker-board/PokerHeader.vue` | Номер раздачи, бейдж стадии |
| `app/components/apps/poker-board/PokerPlayerCard.vue` | Состав набора фишек в модалке ребая |
| `app/components/apps/poker-board/PokerBoard.vue` | Пробросить модалку уровней, watcher стадий, тосты |

---

**Зависимости:** без новых npm-пакетов. Все новые фичи реализуются средствами существующего стека.
