window.__ModuleLoader__.load({
  id: '@local/philosophy-terms',
  factory(require) {
    const React = require('react')
    const h = React.createElement
    const NS = 'philosophy-terms'
    const API = '/philosophy/api'

    let localeService = null
    let translate = (key) => key

    const RATINGS = [
      { id: 'interested', key: 'rating.interested', tone: 'interested' },
      { id: 'neutral', key: 'rating.neutral', tone: 'neutral' },
      { id: 'not-interested', key: 'rating.not', tone: 'not' },
    ]

    const DICT = {
      zh: {
        'panel.label': '哲学词谱',
        'hero.kicker': 'PHILOSOPHY READING ATLAS',
        'hero.title': '哲学词谱',
        'hero.subtitle': '输入一本哲学书，凝练全书最关键的三个概念；再让 SEP 把它们写成可读的哲学释义。你的每一次评价，都会改变下一天的那个词。',
        'input.title': '书名',
        'input.titlePlaceholder': '例如：存在与时间',
        'input.author': '作者（可选）',
        'input.authorPlaceholder': '例如：海德格尔',
        'action.analyze': '凝练三个词',
        'action.analyzing': '正在凝练',
        'sample.label': '试例',
        'sample.1': '存在与时间',
        'sample.2': '西西弗神话',
        'sample.3': '沉思录',
        'stage.1': '正在辨认全书的核心问题与概念结构',
        'stage.2': '正在检索斯坦福哲学百科的相关词条',
        'stage.3': '正在以哲学语言重写这三个词',
        'loading': '正在打开词谱…',
        'error.title': '这一次没有完成',
        'error.dismiss': '知道了',
        'empty.title': '从一本书开始',
        'empty.body': '词谱会为这本书找出三个关键概念，并让它们彼此照亮。之后，你可以对每个词作出判断。',
        'empty.step1.title': '输入书名',
        'empty.step1.body': '中英文皆可；不确定作者就留空。',
        'empty.step2.title': '三个关键词',
        'empty.step2.body': '每个词附 200–1000 字的 SEP 释义与本书语境。',
        'empty.step3.title': '每日一词',
        'empty.step3.body': '根据你的阅读与评价，每天推荐一个尚未见过的词。',
        'book.terms': '三个关键词',
        'book.noNote': '暂无领域说明',
        'book.delete': '删除这本书',
        'book.deleteTitle': '从词谱中删除',
        'library.confirm': '从词谱中删除《{title}》及其三个词？',
        'term.inBook': '在本书中',
        'term.charCount': '约 {n} 字',
        'term.sep': 'SEP 词条',
        'term.fallback': 'SEP 未直连 · 依据哲学史知识',
        'term.openSep': '阅读 SEP 原词条',
        'term.keywords': '相关概念',
        'term.why': '入选理由',
        'term.conceptHint': '带下划线的概念可以直接点击，继续查询 SEP 释义。',
        'term.mentionsLoading': '正在补充概念链接',
        'concept.kicker': 'SEP CONCEPT',
        'concept.loading': '正在检索 SEP，并以哲学语言重写这个概念…',
        'concept.error': '这个概念没有查询成功',
        'concept.retry': '重试',
        'concept.back': '返回',
        'concept.close': '关闭',
        'concept.cached': '已缓存',
        'concept.retrySep': '重试 SEP',
        'concept.source': '从「{term}」出发',
        'concept.relation': '与当前词的关系',
        'concept.related': '继续探索',
        'rating.label': '你的判断',
        'rating.interested': '感兴趣',
        'rating.neutral': '一般',
        'rating.not': '不感兴趣',
        'daily.title': '每日一词',
        'daily.subtitle': '根据你的书目与评价，一天一个。',
        'daily.empty': '今天还没有词。让词谱从你读过的书里，挑一个你可能感兴趣、但还没遇见的概念。',
        'daily.generate': '领取今日一词',
        'daily.generating': '正在从你的阅读谱系里挑词',
        'daily.reason': '为什么是它',
        'daily.source': '从《{title}》出发',
        'daily.done': '今日已领取',
        'profile.title': '阅读口味',
        'profile.body': '评价只影响推荐，不改变你已经读到的释义。',
        'profile.interested': '感兴趣',
        'profile.neutral': '一般',
        'profile.not': '不感兴趣',
        'profile.traditions': '偏向的传统',
        'profile.empty': '还没有评价。点开一个词，给出第一个判断。',
        'library.title': '我的书目',
        'library.empty': '还没有书目。',
        'library.terms': '{n} 个词',
        'rail.daily': '今日',
        'notice.existing': '这本书已经在你的词谱里，已为你打开。',
        'notice.rated': '已记录。',
        'char.unit': '字',
      },
      en: {
        'panel.label': 'Philosophy Lexicon',
        'hero.kicker': 'PHILOSOPHY READING ATLAS',
        'hero.title': 'A Lexicon of Reading',
        'hero.subtitle': 'Enter a philosophy book and distill its three decisive concepts. SEP-grounded definitions follow. Every rating quietly reshapes tomorrow’s word.',
        'input.title': 'Book title',
        'input.titlePlaceholder': 'e.g. Being and Time',
        'input.author': 'Author (optional)',
        'input.authorPlaceholder': 'e.g. Heidegger',
        'action.analyze': 'Distill three terms',
        'action.analyzing': 'Distilling',
        'sample.label': 'Try',
        'sample.1': 'Being and Time',
        'sample.2': 'The Myth of Sisyphus',
        'sample.3': 'Meditations',
        'stage.1': 'Finding the book’s central problem and conceptual structure',
        'stage.2': 'Retrieving the relevant Stanford Encyclopedia entries',
        'stage.3': 'Rewriting the three terms in philosophical prose',
        'loading': 'Opening the lexicon…',
        'error.title': 'This one did not finish',
        'error.dismiss': 'Dismiss',
        'empty.title': 'Begin with a book',
        'empty.body': 'The lexicon finds three decisive concepts and lets them illuminate one another. After that, you can judge each one.',
        'empty.step1.title': 'Enter a title',
        'empty.step1.body': 'Chinese or English; leave the author blank if unsure.',
        'empty.step2.title': 'Three terms',
        'empty.step2.body': 'Each with a 200–1000 character SEP definition and its work in the book.',
        'empty.step3.title': 'One word a day',
        'empty.step3.body': 'A new term, chosen from your reading and ratings, once a day.',
        'book.terms': 'Three key terms',
        'book.noNote': 'No field note',
        'book.delete': 'Delete this book',
        'book.deleteTitle': 'Delete from lexicon',
        'library.confirm': 'Delete “{title}” and its three terms from the lexicon?',
        'term.inBook': 'In this book',
        'term.charCount': '~{n} characters',
        'term.sep': 'SEP entry',
        'term.fallback': 'SEP unavailable · from philosophical scholarship',
        'term.openSep': 'Read the SEP entry',
        'term.keywords': 'Related concepts',
        'term.why': 'Why this term',
        'term.conceptHint': 'Underlined concepts can be opened for a SEP-grounded definition.',
        'term.mentionsLoading': 'Adding concept links',
        'concept.kicker': 'SEP CONCEPT',
        'concept.loading': 'Retrieving SEP and rewriting this concept in philosophical prose…',
        'concept.error': 'This concept could not be opened',
        'concept.retry': 'Retry',
        'concept.back': 'Back',
        'concept.close': 'Close',
        'concept.cached': 'Cached',
        'concept.retrySep': 'Retry SEP',
        'concept.source': 'From “{term}”',
        'concept.relation': 'Relation to this term',
        'concept.related': 'Keep exploring',
        'rating.label': 'Your judgment',
        'rating.interested': 'Interested',
        'rating.neutral': 'Neutral',
        'rating.not': 'Not interested',
        'daily.title': 'Word of the day',
        'daily.subtitle': 'One term a day, drawn from your books and judgments.',
        'daily.empty': 'No word yet today. Let the lexicon choose a concept from your reading that you have not met, but might want to.',
        'daily.generate': 'Draw today’s word',
        'daily.generating': 'Choosing from your reading landscape',
        'daily.reason': 'Why this one',
        'daily.source': 'From “{title}”',
        'daily.done': 'Drawn today',
        'profile.title': 'Reading taste',
        'profile.body': 'Ratings shape recommendations; they never alter a definition you have already read.',
        'profile.interested': 'Interested',
        'profile.neutral': 'Neutral',
        'profile.not': 'Not interested',
        'profile.traditions': 'Leaning toward',
        'profile.empty': 'No judgments yet. Open a term and make the first call.',
        'library.title': 'My books',
        'library.empty': 'No books yet.',
        'library.terms': '{n} terms',
        'rail.daily': 'Today',
        'notice.existing': 'This book is already in your lexicon; it has been opened for you.',
        'notice.rated': 'Saved.',
        'char.unit': 'chars',
      },
    }

    const ICON_PATHS = {
      book: [
        ['path', { d: 'M4 19.5A2.5 2.5 0 0 1 6.5 17H20' }],
        ['path', { d: 'M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2Z' }],
        ['path', { d: 'M8 7h8M8 11h5' }],
      ],
      spark: [
        ['path', { d: 'M12 3v4M12 17v4M3 12h4M17 12h4' }],
        ['path', { d: 'm6.3 6.3 2.8 2.8M14.9 14.9l2.8 2.8M17.7 6.3l-2.8 2.8M9.1 14.9l-2.8 2.8' }],
        ['circle', { cx: 12, cy: 12, r: 2.6 }],
      ],
      link: [
        ['path', { d: 'M10 13a5 5 0 0 0 7.1.1l2-2a5 5 0 0 0-7.1-7.1l-1.1 1.1' }],
        ['path', { d: 'M14 11a5 5 0 0 0-7.1-.1l-2 2A5 5 0 0 0 12 20l1.1-1.1' }],
      ],
      trash: [
        ['path', { d: 'M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6' }],
        ['path', { d: 'M10 11v5M14 11v5' }],
      ],
      arrow: [
        ['path', { d: 'M5 12h14M13 6l6 6-6 6' }],
      ],
      check: [
        ['path', { d: 'M20 6 9 17l-5-5' }],
      ],
      clock: [
        ['circle', { cx: 12, cy: 12, r: 9 }],
        ['path', { d: 'M12 7v5l3 2' }],
      ],
    }

    function Icon({ name, size = 18, strokeWidth = 1.6 }) {
      return h(
        'svg',
        {
          width: size,
          height: size,
          viewBox: '0 0 24 24',
          fill: 'none',
          stroke: 'currentColor',
          strokeWidth,
          strokeLinecap: 'round',
          strokeLinejoin: 'round',
          'aria-hidden': true,
          focusable: 'false',
        },
        (ICON_PATHS[name] || []).map(([tag, attrs], index) => h(tag, { key: index, ...attrs })),
      )
    }

    function charCount(value) {
      return [...String(value || '').replace(/\s+/g, '')].length
    }

    function formatDate(value) {
      if (!value) return ''
      try {
        return new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric' }).format(new Date(value))
      } catch {
        return ''
      }
    }

    function useLocaleRevision() {
      const subscribe = React.useCallback((callback) => localeService.subscribe(callback), [])
      const snapshot = React.useCallback(() => localeService.getSnapshot(), [])
      React.useSyncExternalStore(subscribe, snapshot, snapshot)
    }

    async function request(path, options = {}) {
      let response
      try {
        response = await fetch(`${API}${path}`, {
          ...options,
          headers: { 'content-type': 'application/json', ...(options.headers || {}) },
        })
      } catch {
        throw new Error('无法连接到词谱服务，请确认 Harness 仍在运行。')
      }
      let payload = null
      try {
        payload = await response.json()
      } catch {
        // The status below carries the useful fact.
      }
      if (!response.ok || !payload || payload.ok === false) {
        const error = new Error(payload?.error?.message || `请求失败（HTTP ${response.status}）`)
        error.code = payload?.error?.code
        throw error
      }
      return payload
    }

    function replaceTermRating(state, termId, rating) {
      if (!state) return state
      return {
        ...state,
        books: state.books.map((book) => ({
          ...book,
          terms: book.terms.map((term) => (term.id === termId ? { ...term, rating } : term)),
        })),
      }
    }

    function conceptCacheKey(ref) {
      const ascii = String(ref?.termEn || '')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
      if (ascii) return ascii
      return `zh:${String(ref?.termZh || '').trim().toLowerCase()}`
    }

    function uniqueConcepts(list, mainTerm) {
      const seen = new Set([
        String(mainTerm?.termEn || '').toLowerCase(),
        String(mainTerm?.termZh || '').toLowerCase(),
      ].filter(Boolean))
      const result = []
      for (const item of Array.isArray(list) ? list : []) {
        const termZh = String(item?.termZh || '').trim()
        const termEn = String(item?.termEn || '').trim()
        if (!termZh && !termEn) continue
        const key = (termEn || termZh).toLowerCase()
        if (!key || seen.has(key)) continue
        seen.add(key)
        result.push({
          termZh: termZh || termEn,
          termEn,
          sepSlug: String(item?.sepSlug || ''),
          tradition: String(item?.tradition || ''),
        })
      }
      return result
    }

    function relatedConcepts(term) {
      const structured = Array.isArray(term.related) && term.related.length
        ? term.related
        : (term.keywords || []).map((termZh) => ({ termZh, termEn: '', sepSlug: '' }))
      return uniqueConcepts(structured, term)
    }

    function mentionConcepts(term) {
      const structured = Array.isArray(term.mentions) && term.mentions.length
        ? term.mentions
        : (term.keywords || []).map((termZh) => ({ termZh, termEn: '', sepSlug: '' }))
      return uniqueConcepts(structured, term)
    }

    function escapeRegExp(value) {
      return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    }

    function definitionSegments(text, concepts) {
      const source = String(text || '')
      const usable = concepts.filter((concept) =>
        (concept.termZh && source.includes(concept.termZh))
        || (concept.termEn && source.toLowerCase().includes(concept.termEn.toLowerCase())),
      )
      if (!usable.length) return [{ text: source }]
      const alternatives = []
      for (const concept of usable) {
        if (concept.termZh) {
          alternatives.push({ pattern: escapeRegExp(concept.termZh), plain: concept.termZh, concept })
        }
        if (concept.termEn) {
          const pattern = /^[A-Za-z]/.test(concept.termEn)
            ? `(?<![A-Za-z])${escapeRegExp(concept.termEn)}(?![A-Za-z])`
            : escapeRegExp(concept.termEn)
          alternatives.push({ pattern, plain: concept.termEn, concept })
        }
      }
      alternatives.sort((a, b) => b.pattern.length - a.pattern.length)
      const regex = new RegExp(alternatives.map((item) => `(${item.pattern})`).join('|'), 'gi')
      const segments = []
      const linked = new Set()
      let last = 0
      for (const match of source.matchAll(regex)) {
        const matched = match[0]
        const index = match.index ?? 0
        const concept = alternatives.find((item) => item.plain.toLowerCase() === matched.toLowerCase())?.concept
        if (!concept) continue
        const key = (concept.termEn || concept.termZh).toLowerCase()
        if (linked.has(key)) continue
        linked.add(key)
        if (index > last) segments.push({ text: source.slice(last, index) })
        segments.push({ text: matched, concept })
        last = index + matched.length
      }
      if (last < source.length) segments.push({ text: source.slice(last) })
      return segments.length ? segments : [{ text: source }]
    }

    function RichDefinition({ text, concepts, onConcept, sourceTerm, className = '' }) {
      const segments = definitionSegments(text, concepts)
      return h(
        'p',
        { className: `phil-definition ${className}`.trim() },
        segments.map((segment, index) =>
          segment.concept
            ? h(
                'button',
                {
                  key: `${segment.text}-${index}`,
                  type: 'button',
                  className: 'phil-concept-link',
                  onClick: () => onConcept(segment.concept, sourceTerm),
                },
                segment.text,
              )
            : h(React.Fragment, { key: `text-${index}` }, segment.text),
        ),
      )
    }

    function PanelIcon({ size = 18, active = false }) {
      return h(
        'svg',
        {
          width: size,
          height: size,
          viewBox: '0 0 24 24',
          fill: 'none',
          stroke: 'currentColor',
          strokeWidth: active ? 1.75 : 1.5,
          strokeLinecap: 'round',
          strokeLinejoin: 'round',
          style: { display: 'block', opacity: active ? 1 : 0.72 },
          'aria-hidden': true,
        },
        h('path', { d: 'M4 19.2A2.2 2.2 0 0 1 6.2 17H20' }),
        h('path', { d: 'M6.2 3H20v18H6.2A2.2 2.2 0 0 1 4 18.8V5.2A2.2 2.2 0 0 1 6.2 3Z' }),
        h('path', { d: 'M12 7v6M9 10h6' }),
      )
    }

    function RatingGroup({ term, onRate, busy }) {
      return h(
        'div',
        { className: 'phil-rating', role: 'group', 'aria-label': translate('rating.label') },
        RATINGS.map((rating) =>
          h(
            'button',
            {
              key: rating.id,
              type: 'button',
              className: `phil-rate ${term.rating === rating.id ? 'is-active' : ''}`,
              'data-tone': rating.tone,
              'aria-pressed': term.rating === rating.id,
              disabled: busy,
              onClick: () => onRate(term, rating.id),
            },
            h('span', { className: 'phil-rate-dot', 'aria-hidden': true }),
            translate(rating.key),
          ),
        ),
      )
    }

    function TermCard({ term, index, onRate, busy, onConcept }) {
      const characters = charCount(term.definition)
      const mentions = mentionConcepts(term)
      const related = relatedConcepts(term)
      return h(
        'article',
        { className: 'phil-term' },
        h(
          'div',
          { className: 'phil-term-top' },
          h('span', { className: 'phil-term-index' }, String(index + 1).padStart(2, '0')),
          h('span', { className: 'phil-chip' }, term.tradition || translate('book.noNote')),
          h(
            'span',
            { className: `phil-source ${term.sourceStatus === 'sep' ? 'is-sep' : ''}` },
            term.sourceStatus === 'sep' ? translate('term.sep') : translate('term.fallback'),
          ),
        ),
        h(
          'h3',
          { className: 'phil-term-title' },
          term.termZh,
          h('span', { className: 'phil-term-en' }, term.termEn),
        ),
        term.why
          ? h(
              'p',
              { className: 'phil-term-why' },
              h('span', { className: 'phil-term-why-label' }, translate('term.why')),
              term.why,
            )
          : null,
        h(RichDefinition, {
          text: term.definition,
          concepts: mentions,
          onConcept,
          sourceTerm: term,
        }),
        mentions.length
          ? h('p', { className: 'phil-concept-hint' }, translate('term.conceptHint'))
          : null,
        term.inBook
          ? h(
              'div',
              { className: 'phil-inbook' },
              h('span', { className: 'phil-inbook-label' }, translate('term.inBook')),
              h('p', null, term.inBook),
            )
          : null,
        h(
          'div',
          { className: 'phil-term-foot' },
          h(
            'div',
            { className: 'phil-term-links' },
            term.sepUrl
              ? h(
                  'a',
                  {
                    className: 'phil-sep-link',
                    href: term.sepUrl,
                    target: '_blank',
                    rel: 'noreferrer noopener',
                  },
                  h(Icon, { name: 'link', size: 14 }),
                  term.sepTitle || translate('term.openSep'),
                )
              : null,
            h('span', { className: 'phil-characters' }, translate('term.charCount', { n: characters })),
          ),
          h(RatingGroup, { term, onRate, busy }),
        ),
        related.length
          ? h(
              'div',
              { className: 'phil-keywords' },
              h('span', { className: 'phil-keywords-label' }, translate('term.keywords')),
              related.map((concept, conceptIndex) =>
                h(
                  'button',
                  {
                    type: 'button',
                    className: 'phil-keyword phil-keyword-button',
                    key: `${concept.termZh}-${conceptIndex}`,
                    title: concept.termEn || concept.termZh,
                    onClick: () => onConcept(concept, term),
                  },
                  concept.termZh,
                  concept.termEn ? h('span', { className: 'phil-keyword-en' }, concept.termEn) : null,
                ),
              ),
            )
          : null,
      )
    }

    function ConceptDialog({ dialog, canGoBack, onClose, onBack, onRetry, onRefresh, onNavigate }) {
      const closeRef = React.useRef(null)
      const closeHandler = React.useRef(onClose)
      closeHandler.current = onClose
      React.useEffect(() => {
        if (!dialog) return undefined
        closeRef.current?.focus()
        const onKeyDown = (event) => {
          if (event.key === 'Escape') closeHandler.current()
        }
        window.addEventListener('keydown', onKeyDown)
        return () => window.removeEventListener('keydown', onKeyDown)
      }, [dialog])

      if (!dialog) return null
      const concept = dialog.concept

      return h(
        'div',
        {
          className: 'phil-modal-backdrop',
          onMouseDown: (event) => {
            if (event.target === event.currentTarget) onClose()
          },
        },
        h(
          'div',
          {
            className: 'phil-modal',
            role: 'dialog',
            'aria-modal': 'true',
            'aria-labelledby': 'phil-concept-title',
          },
          h(
            'div',
            { className: 'phil-modal-head' },
            h(
              'div',
              { className: 'phil-modal-kicker' },
              h('span', { className: 'phil-kicker' }, translate('concept.kicker')),
              dialog.cached ? h('span', { className: 'phil-chip' }, translate('concept.cached')) : null,
            ),
            h(
              'div',
              { className: 'phil-modal-actions' },
              canGoBack
                ? h('button', { type: 'button', className: 'phil-modal-text-button', onClick: onBack }, '← ', translate('concept.back'))
                : null,
              h(
                'button',
                {
                  ref: closeRef,
                  type: 'button',
                  className: 'phil-modal-close',
                  onClick: onClose,
                  'aria-label': translate('concept.close'),
                  title: translate('concept.close'),
                },
                '×',
              ),
            ),
          ),
          h(
            'div',
            { className: 'phil-modal-body' },
            dialog.status === 'loading'
              ? h(
                  'div',
                  { className: 'phil-modal-loading', role: 'status', 'aria-live': 'polite' },
                  h('span', { className: 'phil-spinner' }),
                  h('p', null, translate('concept.loading')),
                )
              : dialog.status === 'error'
                ? h(
                    'div',
                    { className: 'phil-modal-error', role: 'alert' },
                    h('h2', { id: 'phil-concept-title' }, translate('concept.error')),
                    h('p', null, dialog.error),
                    h(
                      'button',
                      { type: 'button', className: 'phil-primary', onClick: onRetry },
                      translate('concept.retry'),
                    ),
                  )
                : h(
                    React.Fragment,
                    null,
                    h(
                      'div',
                      { className: 'phil-modal-title-row' },
                      h(
                        'div',
                        null,
                        h('h2', { id: 'phil-concept-title' }, concept?.termZh || concept?.termEn),
                        h('p', { className: 'phil-modal-en' }, concept?.termEn || ''),
                      ),
                      h(
                        'span',
                        { className: `phil-source ${concept?.sourceStatus === 'sep' ? 'is-sep' : ''}` },
                        concept?.sourceStatus === 'sep' ? translate('term.sep') : translate('term.fallback'),
                      ),
                    ),
                    concept?.tradition
                      ? h('div', { className: 'phil-modal-chips' }, h('span', { className: 'phil-chip' }, concept.tradition))
                      : null,
                    concept?.sourceTerm
                      ? h('p', { className: 'phil-modal-source' }, translate('concept.source', { term: concept.sourceTerm }))
                      : null,
                    concept?.relation
                      ? h(
                          'div',
                          { className: 'phil-modal-relation' },
                          h('span', { className: 'phil-inbook-label' }, translate('concept.relation')),
                          h('p', null, concept.relation),
                        )
                      : null,
                    h(RichDefinition, {
                      text: concept?.definition || '',
                      concepts: uniqueConcepts(concept?.mentions, concept),
                      onConcept: onNavigate,
                      sourceTerm: dialog.sourceTerm,
                    }),
                    h(
                      'div',
                      { className: 'phil-modal-links' },
                      concept?.sepUrl
                        ? h(
                            'a',
                            {
                              className: 'phil-sep-link',
                              href: concept.sepUrl,
                              target: '_blank',
                              rel: 'noreferrer noopener',
                            },
                            h(Icon, { name: 'link', size: 14 }),
                            concept.sepTitle || translate('term.openSep'),
                          )
                        : h(
                            'div',
                            { className: 'phil-modal-fallback' },
                            h('span', { className: 'phil-source' }, translate('term.fallback')),
                            h(
                              'button',
                              { type: 'button', className: 'phil-modal-text-button', onClick: onRefresh },
                              translate('concept.retrySep'),
                            ),
                          ),
                      h('span', { className: 'phil-characters' }, translate('term.charCount', { n: charCount(concept?.definition) })),
                    ),
                    concept?.related && concept.related.length
                      ? h(
                          'div',
                          { className: 'phil-modal-related' },
                          h('span', { className: 'phil-keywords-label' }, translate('concept.related')),
                          h(
                            'div',
                            { className: 'phil-chip-row' },
                            uniqueConcepts(concept.related, concept).map((item, index) =>
                              h(
                                'button',
                                {
                                  type: 'button',
                                  className: 'phil-keyword phil-keyword-button',
                                  key: `${item.termZh}-${index}`,
                                  onClick: () => onNavigate(item, dialog.sourceTerm),
                                },
                                item.termZh,
                                item.termEn ? h('span', { className: 'phil-keyword-en' }, item.termEn) : null,
                              ),
                            ),
                          ),
                        )
                      : null,
                  ),
          ),
        ),
      )
    }

    function Stat({ label, value, tone }) {
      return h(
        'div',
        { className: 'phil-stat' },
        h('strong', { className: `phil-stat-value ${tone ? `is-${tone}` : ''}` }, String(value)),
        h('span', null, label),
      )
    }

    function DailyCard({ state, loading, onGenerate, onConcept }) {
      const daily = state.daily
      return h(
        'section',
        { className: 'phil-card phil-daily' },
        h(
          'div',
          { className: 'phil-card-head' },
          h(
            'div',
            null,
            h('p', { className: 'phil-eyebrow' }, translate('rail.daily')),
            h('h2', null, translate('daily.title')),
            h('p', { className: 'phil-card-sub' }, translate('daily.subtitle')),
          ),
          h('span', { className: 'phil-daily-mark', 'aria-hidden': true }, h(Icon, { name: 'spark', size: 22 })),
        ),
        loading
          ? h(
              'div',
              { className: 'phil-daily-loading', role: 'status', 'aria-live': 'polite' },
              h('span', { className: 'phil-spinner' }),
              h('p', null, translate('daily.generating')),
            )
          : daily
            ? h(
                'div',
                { className: 'phil-daily-body' },
                h(
                  'div',
                  { className: 'phil-daily-termline' },
                  h('h3', null, daily.termZh),
                  h('span', null, daily.termEn),
                ),
                h(
                  'div',
                  { className: 'phil-daily-meta' },
                  h('span', { className: 'phil-chip' }, daily.tradition || translate('daily.done')),
                  h('span', { className: 'phil-characters' }, translate('term.charCount', { n: charCount(daily.definition) })),
                ),
                h(RichDefinition, {
                  text: daily.definition,
                  concepts: uniqueConcepts(daily.mentions, daily),
                  onConcept,
                  sourceTerm: null,
                  className: 'phil-daily-definition',
                }),
                daily.reason
                  ? h(
                      'div',
                      { className: 'phil-daily-reason' },
                      h('span', { className: 'phil-inbook-label' }, translate('daily.reason')),
                      h('p', null, daily.reason),
                    )
                  : null,
                h(
                  'div',
                  { className: 'phil-daily-foot' },
                  daily.sourceBook ? h('span', { className: 'phil-daily-source' }, translate('daily.source', { title: daily.sourceBook })) : h('span'),
                  daily.sepUrl
                    ? h(
                        'a',
                        { className: 'phil-sep-link', href: daily.sepUrl, target: '_blank', rel: 'noreferrer noopener' },
                        h(Icon, { name: 'link', size: 14 }),
                        translate('term.openSep'),
                      )
                    : h('span', { className: 'phil-source' }, translate('term.fallback')),
                ),
              )
            : h(
                'div',
                { className: 'phil-daily-empty' },
                h('p', null, translate('daily.empty')),
                h(
                  'button',
                  {
                    type: 'button',
                    className: 'phil-primary phil-daily-button',
                    onClick: onGenerate,
                    disabled: !state.books.length || loading,
                  },
                  h(Icon, { name: 'spark', size: 16 }),
                  translate('daily.generate'),
                ),
                !state.books.length ? h('p', { className: 'phil-hint' }, translate('library.empty')) : null,
              ),
      )
    }

    function ProfileCard({ state }) {
      const stats = state.stats
      const traditions = state.books.length
        ? (() => {
            const weights = new Map()
            for (const book of state.books) {
              for (const term of book.terms) {
                if (!term.tradition) continue
                const weight = term.rating === 'interested' ? 3 : term.rating === 'not-interested' ? -2 : 1
                weights.set(term.tradition, (weights.get(term.tradition) || 0) + weight)
              }
            }
            return [...weights.entries()]
              .filter(([, weight]) => weight !== 0)
              .sort((a, b) => b[1] - a[1])
              .slice(0, 4)
              .map(([name]) => name)
          })()
        : []
      return h(
        'section',
        { className: 'phil-card' },
        h('h2', { className: 'phil-rail-title' }, translate('profile.title')),
        h('p', { className: 'phil-card-sub' }, translate('profile.body')),
        h(
          'div',
          { className: 'phil-stats' },
          h(Stat, { label: translate('profile.interested'), value: stats.interested, tone: 'interested' }),
          h(Stat, { label: translate('profile.neutral'), value: stats.neutral, tone: 'neutral' }),
          h(Stat, { label: translate('profile.not'), value: stats.notInterested, tone: 'not' }),
        ),
        traditions.length
          ? h(
              'div',
              { className: 'phil-traditions' },
              h('span', { className: 'phil-keywords-label' }, translate('profile.traditions')),
              h(
                'div',
                { className: 'phil-chip-row' },
                traditions.map((tradition) => h('span', { className: 'phil-chip', key: tradition }, tradition)),
              ),
            )
          : h('p', { className: 'phil-hint' }, translate('profile.empty')),
      )
    }

    function LibraryCard({ state, selectedId, onSelect, onDelete }) {
      return h(
        'section',
        { className: 'phil-card phil-library' },
        h('h2', { className: 'phil-rail-title' }, translate('library.title')),
        !state.books.length
          ? h('p', { className: 'phil-hint' }, translate('library.empty'))
          : h(
              'div',
              { className: 'phil-library-list' },
              state.books.map((book) =>
                h(
                  'div',
                  {
                    key: book.id,
                    className: `phil-library-row ${selectedId === book.id ? 'is-selected' : ''}`,
                  },
                  h(
                    'button',
                    { type: 'button', className: 'phil-library-main', onClick: () => onSelect(book.id) },
                    h('span', { className: 'phil-library-title' }, book.title),
                    h(
                      'span',
                      { className: 'phil-library-meta' },
                      formatDate(book.createdAt),
                      ' · ',
                      translate('library.terms', { n: book.terms.length }),
                    ),
                  ),
                  h(
                    'button',
                    {
                      type: 'button',
                      className: 'phil-icon-button',
                      title: translate('book.delete'),
                      'aria-label': `${translate('book.deleteTitle')}: ${book.title}`,
                      onClick: () => onDelete(book),
                    },
                    h(Icon, { name: 'trash', size: 15 }),
                  ),
                ),
              ),
            ),
      )
    }

    function HowItWorks() {
      const steps = [
        ['empty.step1.title', 'empty.step1.body'],
        ['empty.step2.title', 'empty.step2.body'],
        ['empty.step3.title', 'empty.step3.body'],
      ]
      return h(
        'section',
        { className: 'phil-how' },
        h('p', { className: 'phil-eyebrow' }, translate('hero.kicker')),
        h('h2', null, translate('empty.title')),
        h('p', { className: 'phil-how-body' }, translate('empty.body')),
        h(
          'div',
          { className: 'phil-how-grid' },
          steps.map(([title, body], index) =>
            h(
              'div',
              { className: 'phil-how-step', key: title },
              h('span', { className: 'phil-how-number' }, String(index + 1).padStart(2, '0')),
              h('h3', null, translate(title)),
              h('p', null, translate(body)),
            ),
          ),
        ),
      )
    }

    const CSS = `
      .phil-root {
        height: 100%;
        overflow: auto;
        background: var(--dsw-alias-bg-base);
        color: var(--dsw-alias-label-primary);
        font-family: inherit;
      }
      .phil-wrap {
        max-width: 1120px;
        margin: 0 auto;
        padding: 34px 30px 90px;
      }
      .phil-hero {
        position: relative;
        padding: 8px 0 26px;
        border-bottom: 1px solid var(--dsw-alias-border-l1);
      }
      .phil-topline {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 16px;
        margin-bottom: 14px;
      }
      .phil-kicker, .phil-eyebrow {
        margin: 0;
        font-size: 10px;
        font-weight: 650;
        letter-spacing: 0.18em;
        text-transform: uppercase;
        color: var(--dsw-alias-label-secondary);
      }
      .phil-hero h1 {
        margin: 0;
        font-family: ui-serif, Georgia, "Songti SC", "Noto Serif CJK SC", serif;
        font-size: clamp(30px, 4vw, 42px);
        line-height: 1.12;
        font-weight: 560;
        letter-spacing: -0.015em;
      }
      .phil-hero-sub {
        max-width: 720px;
        margin: 12px 0 0;
        font-size: 14px;
        line-height: 1.75;
        color: var(--dsw-alias-label-secondary);
      }
      .phil-date {
        flex: none;
        font-size: 12px;
        color: var(--dsw-alias-label-secondary);
        font-variant-numeric: tabular-nums;
      }
      .phil-search {
        display: grid;
        grid-template-columns: minmax(0, 1fr) 190px auto;
        gap: 10px;
        align-items: stretch;
        margin-top: 22px;
        padding: 8px;
        border: 1px solid var(--dsw-alias-border-l1);
        border-radius: 16px;
        background: var(--dsw-alias-bg-layer-1);
        box-shadow: 0 1px 2px color-mix(in srgb, var(--dsw-alias-label-primary) 5%, transparent);
      }
      .phil-field {
        display: flex;
        align-items: center;
        gap: 9px;
        min-width: 0;
        padding: 0 11px;
        color: var(--dsw-alias-label-secondary);
      }
      .phil-field + .phil-field {
        border-left: 1px solid var(--dsw-alias-border-l1);
      }
      .phil-field input {
        width: 100%;
        min-width: 0;
        border: 0;
        outline: 0;
        background: transparent;
        color: var(--dsw-alias-label-primary);
        font: inherit;
        font-size: 14px;
        padding: 11px 0;
      }
      .phil-field input::placeholder { color: var(--dsw-alias-label-secondary); opacity: 0.75; }
      .phil-primary {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 7px;
        border: 1px solid var(--dsw-alias-brand-primary);
        border-radius: 11px;
        background: var(--dsw-alias-brand-primary);
        color: var(--dsw-alias-bg-base);
        padding: 0 17px;
        min-height: 42px;
        font: inherit;
        font-size: 13px;
        font-weight: 620;
        cursor: pointer;
        white-space: nowrap;
        transition: opacity 0.15s ease, transform 0.15s ease;
      }
      .phil-primary:hover:not(:disabled) { opacity: 0.9; }
      .phil-primary:active:not(:disabled) { transform: translateY(1px); }
      .phil-primary:disabled { opacity: 0.45; cursor: default; }
      .phil-samples {
        display: flex;
        align-items: center;
        flex-wrap: wrap;
        gap: 7px;
        margin-top: 12px;
        font-size: 12px;
        color: var(--dsw-alias-label-secondary);
      }
      .phil-sample {
        border: 1px solid var(--dsw-alias-border-l1);
        border-radius: 999px;
        background: transparent;
        color: var(--dsw-alias-label-secondary);
        font: inherit;
        font-size: 12px;
        padding: 4px 10px;
        cursor: pointer;
      }
      .phil-sample:hover { border-color: var(--dsw-alias-border-l2); color: var(--dsw-alias-label-primary); }
      .phil-grid {
        display: grid;
        grid-template-columns: minmax(0, 1fr) 340px;
        gap: 26px;
        align-items: start;
        margin-top: 26px;
      }
      .phil-main { min-width: 0; }
      .phil-rail {
        display: flex;
        flex-direction: column;
        gap: 16px;
        position: sticky;
        top: 18px;
        min-width: 0;
      }
      .phil-section-head {
        display: flex;
        align-items: flex-end;
        justify-content: space-between;
        gap: 16px;
        margin-bottom: 12px;
      }
      .phil-section-head h2 {
        margin: 0;
        font-family: ui-serif, Georgia, "Songti SC", "Noto Serif CJK SC", serif;
        font-size: 24px;
        font-weight: 560;
        line-height: 1.25;
      }
      .phil-section-head p {
        margin: 4px 0 0;
        font-size: 12px;
        color: var(--dsw-alias-label-secondary);
        line-height: 1.6;
      }
      .phil-delete {
        border: 1px solid var(--dsw-alias-border-l1);
        border-radius: 9px;
        background: transparent;
        color: var(--dsw-alias-label-secondary);
        font: inherit;
        font-size: 12px;
        padding: 7px 10px;
        cursor: pointer;
        display: inline-flex;
        align-items: center;
        gap: 6px;
      }
      .phil-delete:hover { color: var(--dsw-alias-state-error-primary); border-color: color-mix(in srgb, var(--dsw-alias-state-error-primary) 35%, var(--dsw-alias-border-l1)); }
      .phil-card {
        border: 1px solid var(--dsw-alias-border-l1);
        border-radius: 16px;
        background: var(--dsw-alias-bg-layer-1);
        padding: 17px;
      }
      .phil-card-head {
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        gap: 12px;
      }
      .phil-card h2, .phil-rail-title {
        margin: 3px 0 0;
        font-size: 15px;
        font-weight: 640;
        line-height: 1.35;
      }
      .phil-card-sub {
        margin: 5px 0 0;
        font-size: 11.5px;
        line-height: 1.6;
        color: var(--dsw-alias-label-secondary);
      }
      .phil-daily {
        background:
          radial-gradient(circle at 100% 0%, color-mix(in srgb, var(--dsw-alias-brand-primary) 12%, transparent), transparent 42%),
          var(--dsw-alias-bg-layer-1);
        border-color: color-mix(in srgb, var(--dsw-alias-brand-primary) 30%, var(--dsw-alias-border-l1));
      }
      .phil-daily-mark {
        flex: none;
        display: grid;
        place-items: center;
        width: 38px;
        height: 38px;
        border-radius: 12px;
        color: var(--dsw-alias-brand-primary);
        background: color-mix(in srgb, var(--dsw-alias-brand-primary) 10%, transparent);
      }
      .phil-daily-body { margin-top: 15px; }
      .phil-daily-termline {
        display: flex;
        align-items: baseline;
        gap: 9px;
        flex-wrap: wrap;
      }
      .phil-daily-termline h3 {
        margin: 0;
        font-family: ui-serif, Georgia, "Songti SC", "Noto Serif CJK SC", serif;
        font-size: 24px;
        font-weight: 560;
      }
      .phil-daily-termline span { font-size: 12px; color: var(--dsw-alias-label-secondary); letter-spacing: 0.02em; }
      .phil-daily-meta { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; margin-top: 8px; }
      .phil-daily-definition { margin-top: 12px; font-size: 13px; line-height: 1.9; }
      .phil-daily-reason, .phil-inbook {
        margin-top: 13px;
        padding: 10px 12px;
        border-left: 2px solid color-mix(in srgb, var(--dsw-alias-brand-primary) 55%, transparent);
        background: color-mix(in srgb, var(--dsw-alias-brand-primary) 6%, transparent);
        border-radius: 0 9px 9px 0;
      }
      .phil-daily-reason p, .phil-inbook p {
        margin: 4px 0 0;
        font-size: 12.5px;
        line-height: 1.8;
        color: var(--dsw-alias-label-secondary);
      }
      .phil-inbook-label {
        font-size: 10px;
        font-weight: 680;
        letter-spacing: 0.12em;
        text-transform: uppercase;
        color: var(--dsw-alias-brand-primary);
      }
      .phil-daily-foot {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 10px;
        flex-wrap: wrap;
        margin-top: 13px;
        padding-top: 11px;
        border-top: 1px solid var(--dsw-alias-border-l1);
      }
      .phil-daily-source { font-size: 11px; color: var(--dsw-alias-label-secondary); }
      .phil-daily-empty { margin-top: 14px; }
      .phil-daily-empty > p {
        margin: 0;
        font-size: 12.5px;
        line-height: 1.8;
        color: var(--dsw-alias-label-secondary);
      }
      .phil-daily-button { width: 100%; margin-top: 13px; }
      .phil-daily-loading {
        display: flex;
        align-items: center;
        gap: 10px;
        margin-top: 16px;
        font-size: 12px;
        color: var(--dsw-alias-label-secondary);
      }
      .phil-daily-loading p { margin: 0; }
      .phil-spinner {
        width: 14px;
        height: 14px;
        flex: none;
        border: 1.5px solid color-mix(in srgb, var(--dsw-alias-brand-primary) 28%, transparent);
        border-top-color: var(--dsw-alias-brand-primary);
        border-radius: 50%;
        animation: phil-spin 0.8s linear infinite;
      }
      @keyframes phil-spin { to { transform: rotate(360deg); } }
      .phil-term {
        border: 1px solid var(--dsw-alias-border-l1);
        border-radius: 16px;
        background: var(--dsw-alias-bg-layer-1);
        padding: 20px 20px 17px;
        margin-bottom: 14px;
      }
      .phil-term-top {
        display: flex;
        align-items: center;
        gap: 8px;
        flex-wrap: wrap;
      }
      .phil-term-index {
        font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
        font-size: 11px;
        color: var(--dsw-alias-label-secondary);
        letter-spacing: 0.06em;
        margin-right: 2px;
      }
      .phil-chip {
        display: inline-flex;
        align-items: center;
        border: 1px solid var(--dsw-alias-border-l1);
        border-radius: 999px;
        padding: 3px 8px;
        font-size: 10.5px;
        color: var(--dsw-alias-label-secondary);
        white-space: nowrap;
      }
      .phil-source {
        margin-left: auto;
        font-size: 10px;
        color: var(--dsw-alias-label-secondary);
        letter-spacing: 0.02em;
      }
      .phil-source.is-sep { color: var(--dsw-alias-state-success-primary); }
      .phil-term-title {
        display: flex;
        align-items: baseline;
        gap: 10px;
        flex-wrap: wrap;
        margin: 14px 0 0;
        font-family: ui-serif, Georgia, "Songti SC", "Noto Serif CJK SC", serif;
        font-size: 27px;
        line-height: 1.25;
        font-weight: 560;
      }
      .phil-term-en {
        font-family: ui-serif, Georgia, serif;
        font-size: 12px;
        font-style: italic;
        font-weight: 400;
        color: var(--dsw-alias-label-secondary);
        letter-spacing: 0.02em;
      }
      .phil-term-why {
        display: flex;
        align-items: baseline;
        gap: 8px;
        margin: 9px 0 0;
        font-size: 11.5px;
        line-height: 1.7;
        color: var(--dsw-alias-label-secondary);
      }
      .phil-term-why-label {
        flex: none;
        font-size: 9.5px;
        font-weight: 680;
        letter-spacing: 0.1em;
        text-transform: uppercase;
        color: var(--dsw-alias-brand-primary);
      }
      .phil-definition {
        margin: 12px 0 0;
        font-size: 13.5px;
        line-height: 1.95;
        text-align: justify;
        white-space: pre-wrap;
      }
      .phil-concept-link {
        display: inline;
        border: 0;
        padding: 0;
        margin: 0;
        background: transparent;
        color: var(--dsw-alias-brand-primary);
        font: inherit;
        line-height: inherit;
        text-align: inherit;
        text-decoration: underline;
        text-decoration-thickness: 1px;
        text-decoration-color: color-mix(in srgb, var(--dsw-alias-brand-primary) 42%, transparent);
        text-underline-offset: 3px;
        cursor: pointer;
      }
      .phil-concept-link:hover {
        text-decoration-color: var(--dsw-alias-brand-primary);
        background: color-mix(in srgb, var(--dsw-alias-brand-primary) 7%, transparent);
      }
      .phil-concept-hint {
        margin: 8px 0 0;
        font-size: 10.5px;
        line-height: 1.6;
        color: var(--dsw-alias-label-secondary);
      }
      .phil-term-foot {
        display: flex;
        align-items: flex-end;
        justify-content: space-between;
        gap: 14px;
        flex-wrap: wrap;
        margin-top: 16px;
        padding-top: 13px;
        border-top: 1px solid var(--dsw-alias-border-l1);
      }
      .phil-term-links { display: flex; align-items: center; gap: 11px; flex-wrap: wrap; min-width: 0; }
      .phil-sep-link {
        display: inline-flex;
        align-items: center;
        gap: 5px;
        max-width: 300px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        font-size: 11.5px;
        color: var(--dsw-alias-brand-primary);
        text-decoration: none;
      }
      .phil-sep-link:hover { text-decoration: underline; }
      .phil-characters { font-size: 10.5px; color: var(--dsw-alias-label-secondary); font-variant-numeric: tabular-nums; }
      .phil-rating {
        display: inline-flex;
        align-items: center;
        padding: 3px;
        gap: 2px;
        border: 1px solid var(--dsw-alias-border-l1);
        border-radius: 10px;
        background: var(--dsw-alias-bg-layer-2);
      }
      .phil-rate {
        display: inline-flex;
        align-items: center;
        gap: 5px;
        border: 0;
        border-radius: 7px;
        background: transparent;
        color: var(--dsw-alias-label-secondary);
        font: inherit;
        font-size: 11px;
        padding: 5px 8px;
        cursor: pointer;
        white-space: nowrap;
      }
      .phil-rate:hover:not(:disabled) { color: var(--dsw-alias-label-primary); }
      .phil-rate:disabled { cursor: default; opacity: 0.6; }
      .phil-rate-dot {
        width: 5px;
        height: 5px;
        border-radius: 50%;
        background: currentColor;
        opacity: 0.55;
      }
      .phil-rate.is-active { color: var(--dsw-alias-label-primary); }
      .phil-rate.is-active[data-tone="interested"] {
        background: color-mix(in srgb, var(--dsw-alias-state-success-primary) 13%, transparent);
        color: var(--dsw-alias-state-success-primary);
      }
      .phil-rate.is-active[data-tone="neutral"] {
        background: color-mix(in srgb, var(--dsw-alias-label-primary) 8%, transparent);
      }
      .phil-rate.is-active[data-tone="not"] {
        background: color-mix(in srgb, var(--dsw-alias-state-error-primary) 11%, transparent);
        color: var(--dsw-alias-state-error-primary);
      }
      .phil-rate.is-active .phil-rate-dot { opacity: 1; }
      .phil-keywords {
        display: flex;
        align-items: center;
        gap: 6px;
        flex-wrap: wrap;
        margin-top: 12px;
      }
      .phil-keywords-label { font-size: 10px; letter-spacing: 0.08em; text-transform: uppercase; color: var(--dsw-alias-label-secondary); }
      .phil-keyword {
        font-size: 10.5px;
        color: var(--dsw-alias-label-secondary);
        background: var(--dsw-alias-bg-layer-2);
        border-radius: 5px;
        padding: 2px 6px;
      }
      .phil-keyword-button {
        display: inline-flex;
        align-items: baseline;
        gap: 4px;
        border: 1px solid transparent;
        font-family: inherit;
        font-size: 10.5px;
        cursor: pointer;
        transition: border-color 0.15s ease, color 0.15s ease, background 0.15s ease;
      }
      .phil-keyword-button:hover {
        color: var(--dsw-alias-brand-primary);
        border-color: color-mix(in srgb, var(--dsw-alias-brand-primary) 28%, transparent);
        background: color-mix(in srgb, var(--dsw-alias-brand-primary) 7%, var(--dsw-alias-bg-layer-2));
      }
      .phil-keyword-en {
        font-size: 9px;
        font-style: italic;
        opacity: 0.72;
      }
      .phil-stats {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 8px;
        margin-top: 13px;
      }
      .phil-stat {
        display: flex;
        flex-direction: column;
        gap: 2px;
        padding: 9px 8px;
        border-radius: 10px;
        background: var(--dsw-alias-bg-layer-2);
      }
      .phil-stat-value {
        font-family: ui-serif, Georgia, serif;
        font-size: 21px;
        font-weight: 560;
        line-height: 1.2;
        font-variant-numeric: tabular-nums;
      }
      .phil-stat-value.is-interested { color: var(--dsw-alias-state-success-primary); }
      .phil-stat-value.is-not { color: var(--dsw-alias-state-error-primary); }
      .phil-stat span { font-size: 10px; color: var(--dsw-alias-label-secondary); }
      .phil-traditions { margin-top: 13px; }
      .phil-chip-row { display: flex; flex-wrap: wrap; gap: 5px; margin-top: 6px; }
      .phil-hint { margin: 10px 0 0; font-size: 11px; line-height: 1.7; color: var(--dsw-alias-label-secondary); }
      .phil-library-list { margin-top: 9px; display: flex; flex-direction: column; gap: 3px; max-height: 330px; overflow: auto; }
      .phil-library-row {
        display: flex;
        align-items: center;
        gap: 2px;
        border-radius: 9px;
      }
      .phil-library-row:hover { background: var(--dsw-alias-bg-layer-2); }
      .phil-library-row.is-selected { background: color-mix(in srgb, var(--dsw-alias-brand-primary) 8%, transparent); }
      .phil-library-main {
        flex: 1;
        min-width: 0;
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        gap: 2px;
        border: 0;
        background: transparent;
        color: inherit;
        font: inherit;
        text-align: left;
        padding: 8px 7px;
        cursor: pointer;
      }
      .phil-library-title {
        max-width: 100%;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        font-size: 12.5px;
        font-weight: 560;
      }
      .phil-library-meta { font-size: 10px; color: var(--dsw-alias-label-secondary); }
      .phil-icon-button {
        flex: none;
        display: grid;
        place-items: center;
        width: 27px;
        height: 27px;
        border: 0;
        border-radius: 7px;
        background: transparent;
        color: var(--dsw-alias-label-secondary);
        cursor: pointer;
        opacity: 0;
      }
      .phil-library-row:hover .phil-icon-button, .phil-library-row:focus-within .phil-icon-button { opacity: 1; }
      .phil-icon-button:hover { color: var(--dsw-alias-state-error-primary); background: color-mix(in srgb, var(--dsw-alias-state-error-primary) 9%, transparent); }
      .phil-how {
        border: 1px solid var(--dsw-alias-border-l1);
        border-radius: 18px;
        background: var(--dsw-alias-bg-layer-1);
        padding: 26px;
      }
      .phil-how h2 {
        margin: 6px 0 0;
        font-family: ui-serif, Georgia, "Songti SC", "Noto Serif CJK SC", serif;
        font-size: 26px;
        font-weight: 560;
      }
      .phil-how-body { max-width: 660px; margin: 9px 0 0; font-size: 13px; line-height: 1.8; color: var(--dsw-alias-label-secondary); }
      .phil-how-grid {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 10px;
        margin-top: 22px;
      }
      .phil-how-step {
        border-top: 1px solid var(--dsw-alias-border-l1);
        padding-top: 12px;
      }
      .phil-how-number { font-family: ui-monospace, Menlo, monospace; font-size: 10px; color: var(--dsw-alias-brand-primary); letter-spacing: 0.08em; }
      .phil-how-step h3 { margin: 7px 0 0; font-size: 13px; font-weight: 620; }
      .phil-how-step p { margin: 4px 0 0; font-size: 11.5px; line-height: 1.7; color: var(--dsw-alias-label-secondary); }
      .phil-progress {
        display: flex;
        align-items: flex-start;
        gap: 13px;
        border: 1px solid color-mix(in srgb, var(--dsw-alias-brand-primary) 26%, var(--dsw-alias-border-l1));
        border-radius: 16px;
        background: color-mix(in srgb, var(--dsw-alias-brand-primary) 5%, var(--dsw-alias-bg-layer-1));
        padding: 16px;
        margin-top: 16px;
      }
      .phil-progress .phil-spinner { margin-top: 4px; width: 16px; height: 16px; }
      .phil-progress strong { display: block; font-size: 13px; font-weight: 620; }
      .phil-progress p { margin: 4px 0 0; font-size: 11.5px; line-height: 1.65; color: var(--dsw-alias-label-secondary); }
      .phil-error {
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        gap: 14px;
        border: 1px solid color-mix(in srgb, var(--dsw-alias-state-error-primary) 32%, var(--dsw-alias-border-l1));
        border-radius: 13px;
        background: color-mix(in srgb, var(--dsw-alias-state-error-primary) 6%, var(--dsw-alias-bg-layer-1));
        padding: 12px 14px;
        margin-top: 14px;
      }
      .phil-error strong { display: block; font-size: 12px; color: var(--dsw-alias-state-error-primary); }
      .phil-error p { margin: 3px 0 0; font-size: 12px; line-height: 1.65; }
      .phil-error button {
        flex: none;
        border: 0;
        background: transparent;
        color: var(--dsw-alias-label-secondary);
        font: inherit;
        font-size: 11px;
        cursor: pointer;
      }
      .phil-notice {
        border: 1px solid color-mix(in srgb, var(--dsw-alias-state-success-primary) 30%, var(--dsw-alias-border-l1));
        border-radius: 11px;
        background: color-mix(in srgb, var(--dsw-alias-state-success-primary) 6%, transparent);
        color: var(--dsw-alias-label-primary);
        font-size: 12px;
        line-height: 1.6;
        padding: 9px 12px;
        margin-top: 14px;
      }
      .phil-skeleton {
        display: grid;
        grid-template-columns: minmax(0, 1fr) 340px;
        gap: 26px;
        margin-top: 26px;
      }
      .phil-skeleton-block {
        height: 220px;
        border-radius: 16px;
        background: linear-gradient(90deg, var(--dsw-alias-bg-layer-1), var(--dsw-alias-bg-layer-2), var(--dsw-alias-bg-layer-1));
        background-size: 200% 100%;
        animation: phil-shimmer 1.4s linear infinite;
        border: 1px solid var(--dsw-alias-border-l1);
      }
      @keyframes phil-shimmer { to { background-position: -200% 0; } }
      .phil-loading { display: flex; align-items: center; gap: 9px; margin-top: 26px; font-size: 12px; color: var(--dsw-alias-label-secondary); }
      .phil-modal-backdrop {
        position: fixed;
        inset: 0;
        z-index: 80;
        display: flex;
        align-items: flex-start;
        justify-content: center;
        padding: 6vh 20px 8vh;
        overflow: auto;
        background: color-mix(in srgb, #000000 48%, transparent);
        backdrop-filter: blur(4px);
      }
      .phil-modal {
        width: min(760px, 100%);
        border: 1px solid var(--dsw-alias-border-l2);
        border-radius: 18px;
        background: var(--dsw-alias-bg-overlay);
        color: var(--dsw-alias-label-primary);
        box-shadow: 0 24px 70px color-mix(in srgb, #000000 32%, transparent);
        overflow: hidden;
      }
      .phil-modal-head {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
        padding: 13px 18px;
        border-bottom: 1px solid var(--dsw-alias-border-l1);
        background: color-mix(in srgb, var(--dsw-alias-bg-layer-1) 82%, transparent);
      }
      .phil-modal-kicker { display: flex; align-items: center; gap: 8px; min-width: 0; }
      .phil-modal-actions { display: flex; align-items: center; gap: 6px; flex: none; }
      .phil-modal-text-button {
        border: 0;
        background: transparent;
        color: var(--dsw-alias-label-secondary);
        font: inherit;
        font-size: 11px;
        padding: 5px 7px;
        border-radius: 7px;
        cursor: pointer;
      }
      .phil-modal-text-button:hover { color: var(--dsw-alias-label-primary); background: var(--dsw-alias-bg-layer-2); }
      .phil-modal-close {
        display: grid;
        place-items: center;
        width: 29px;
        height: 29px;
        border: 1px solid var(--dsw-alias-border-l1);
        border-radius: 8px;
        background: transparent;
        color: var(--dsw-alias-label-secondary);
        font: inherit;
        font-size: 18px;
        line-height: 1;
        cursor: pointer;
      }
      .phil-modal-close:hover { color: var(--dsw-alias-label-primary); border-color: var(--dsw-alias-border-l2); }
      .phil-modal-body {
        max-height: min(76vh, 860px);
        overflow: auto;
        padding: 23px 26px 26px;
      }
      .phil-modal-title-row {
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        gap: 14px;
      }
      .phil-modal-title-row h2 {
        margin: 0;
        font-family: ui-serif, Georgia, "Songti SC", "Noto Serif CJK SC", serif;
        font-size: 30px;
        line-height: 1.2;
        font-weight: 560;
      }
      .phil-modal-en {
        margin: 5px 0 0;
        font-family: ui-serif, Georgia, serif;
        font-size: 13px;
        font-style: italic;
        color: var(--dsw-alias-label-secondary);
      }
      .phil-modal-chips { margin-top: 10px; }
      .phil-modal-source {
        margin: 8px 0 0;
        font-size: 11px;
        color: var(--dsw-alias-label-secondary);
      }
      .phil-modal-relation {
        margin-top: 15px;
        padding: 11px 13px;
        border-left: 2px solid color-mix(in srgb, var(--dsw-alias-brand-primary) 55%, transparent);
        background: color-mix(in srgb, var(--dsw-alias-brand-primary) 6%, transparent);
        border-radius: 0 9px 9px 0;
      }
      .phil-modal-relation p {
        margin: 4px 0 0;
        font-size: 12.5px;
        line-height: 1.8;
        color: var(--dsw-alias-label-secondary);
      }
      .phil-modal-body .phil-definition {
        margin-top: 18px;
        font-size: 14px;
        line-height: 1.95;
      }
      .phil-modal-links {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
        flex-wrap: wrap;
        margin-top: 18px;
        padding-top: 13px;
        border-top: 1px solid var(--dsw-alias-border-l1);
      }
      .phil-modal-related {
        margin-top: 17px;
      }
      .phil-modal-fallback {
        display: flex;
        align-items: center;
        gap: 8px;
        flex-wrap: wrap;
      }
      .phil-modal-loading {
        display: flex;
        align-items: center;
        gap: 11px;
        min-height: 180px;
        color: var(--dsw-alias-label-secondary);
        font-size: 12.5px;
        line-height: 1.7;
      }
      .phil-modal-loading p { margin: 0; }
      .phil-modal-error {
        padding: 18px 0 8px;
      }
      .phil-modal-error h2 {
        margin: 0;
        font-size: 18px;
        font-weight: 620;
      }
      .phil-modal-error p {
        margin: 8px 0 15px;
        font-size: 12.5px;
        line-height: 1.7;
        color: var(--dsw-alias-label-secondary);
      }
      @media (max-width: 620px) {
        .phil-modal-backdrop { padding: 3vh 10px 6vh; }
        .phil-modal-body { padding: 18px 17px 21px; }
        .phil-modal-title-row h2 { font-size: 25px; }
      }
      @media (max-width: 980px) {
        .phil-grid, .phil-skeleton { grid-template-columns: 1fr; }
        .phil-rail { position: static; }
        .phil-search { grid-template-columns: 1fr 150px; }
        .phil-search .phil-primary { grid-column: 1 / -1; min-height: 40px; }
        .phil-how-grid { grid-template-columns: 1fr; }
      }
      @media (max-width: 620px) {
        .phil-wrap { padding: 22px 16px 70px; }
        .phil-search { grid-template-columns: 1fr; }
        .phil-field + .phil-field { border-left: 0; border-top: 1px solid var(--dsw-alias-border-l1); }
        .phil-term { padding: 17px 15px 14px; }
        .phil-term-foot { align-items: flex-start; }
        .phil-rating { width: 100%; }
        .phil-rate { flex: 1; justify-content: center; }
        .phil-section-head { flex-direction: column; align-items: flex-start; }
      }
    `

    function Page() {
      useLocaleRevision()
      const [state, setState] = React.useState(null)
      const [title, setTitle] = React.useState('')
      const [author, setAuthor] = React.useState('')
      const [selectedId, setSelectedId] = React.useState(null)
      const [busy, setBusy] = React.useState(false)
      const [dailyLoading, setDailyLoading] = React.useState(false)
      const [error, setError] = React.useState(null)
      const [notice, setNotice] = React.useState('')
      const [stage, setStage] = React.useState(0)
      const [ratingBusy, setRatingBusy] = React.useState(false)
      const [conceptDialog, setConceptDialog] = React.useState(null)
      const [conceptHistory, setConceptHistory] = React.useState([])
      const [mentionsLoading, setMentionsLoading] = React.useState(false)
      const inputRef = React.useRef(null)
      const conceptCache = React.useRef(new Map())
      const mentionRequested = React.useRef(new Set())
      const conceptRequest = React.useRef(0)

      React.useEffect(() => {
        let alive = true
        request('/state')
          .then((payload) => {
            if (!alive) return
            setState(payload.state)
            const first = payload.state.books[0]
            if (first) setSelectedId(first.id)
          })
          .catch((caught) => {
            if (alive) setError(caught.message)
          })
        return () => {
          alive = false
        }
      }, [])

      React.useEffect(() => {
        if (!busy) return undefined
        const timer = setInterval(() => setStage((current) => (current + 1) % 3), 4200)
        return () => clearInterval(timer)
      }, [busy])

      React.useEffect(() => {
        if (!inputRef.current) return
        const timer = setTimeout(() => inputRef.current?.focus(), 40)
        return () => clearTimeout(timer)
      }, [])

      const selectedBook = React.useMemo(() => {
        if (!state) return null
        return state.books.find((book) => book.id === selectedId) || state.books[0] || null
      }, [state, selectedId])

      React.useEffect(() => {
        if (!selectedBook) return undefined
        const missing = selectedBook.terms.filter(
          (term) => !(Array.isArray(term.mentions) && term.mentions.length) && !mentionRequested.current.has(term.id),
        )
        if (!missing.length) return undefined
        let cancelled = false
        setMentionsLoading(true)
        ;(async () => {
          for (const term of missing) {
            try {
              const payload = await request('/mentions', {
                method: 'POST',
                body: JSON.stringify({ termId: term.id }),
              })
              mentionRequested.current.add(term.id)
              if (!cancelled) setState(payload.state)
            } catch {
              // A glossary remains usable without extra concept links.
            }
          }
          if (!cancelled) setMentionsLoading(false)
        })()
        return () => {
          cancelled = true
        }
      }, [selectedBook?.id])

      function openConcept(ref, sourceTerm, options = {}) {
        if (!ref) return
        const query = {
          termZh: ref.termZh || '',
          termEn: ref.termEn || '',
          sepSlug: ref.sepSlug || '',
        }
        const key = conceptCacheKey(query)
        if (options.push !== false && conceptDialog?.status === 'ready') {
          setConceptHistory((current) => [...current, conceptDialog])
        }
        const cached = conceptCache.current.get(key)
        if (cached && options.refresh !== true) {
          setConceptDialog({ status: 'ready', concept: cached, sourceTerm, cached: true })
          return
        }
        const token = conceptRequest.current + 1
        conceptRequest.current = token
        setConceptDialog({ status: 'loading', query, sourceTerm })
        request('/concept', {
          method: 'POST',
          body: JSON.stringify({
            ...query,
            sourceTermId: sourceTerm?.id || '',
            bookTitle: selectedBook?.title || '',
            refresh: options.refresh === true,
            remap: options.remap === true,
          }),
        })
          .then((payload) => {
            if (conceptRequest.current !== token) return
            const concept = payload.concept
            conceptCache.current.set(key, concept)
            conceptCache.current.set(conceptCacheKey(concept), concept)
            setConceptDialog({ status: 'ready', concept, sourceTerm, cached: payload.cached })
          })
          .catch((caught) => {
            if (conceptRequest.current !== token) return
            setConceptDialog({ status: 'error', query, sourceTerm, error: caught.message })
          })
      }

      function closeConcept() {
        conceptRequest.current += 1
        setConceptDialog(null)
        setConceptHistory([])
      }

      function backConcept() {
        conceptRequest.current += 1
        const previous = conceptHistory[conceptHistory.length - 1]
        if (!previous) {
          setConceptDialog(null)
          return
        }
        setConceptHistory((current) => current.slice(0, -1))
        setConceptDialog(previous)
      }

      function retryConcept() {
        if (!conceptDialog?.query) return
        openConcept(conceptDialog.query, conceptDialog.sourceTerm, { push: false })
      }

      function refreshConcept() {
        if (!conceptDialog?.concept) return
        openConcept(conceptDialog.concept, conceptDialog.sourceTerm, { push: false, refresh: true, remap: true })
      }

      async function analyze(event) {
        event?.preventDefault()
        if (busy) return
        const trimmed = title.trim()
        if (!trimmed) {
          setError('先写下书名，再开始凝练。')
          return
        }
        setBusy(true)
        setError(null)
        setNotice('')
        setStage(0)
        try {
          const payload = await request('/analyze', {
            method: 'POST',
            body: JSON.stringify({ title: trimmed, author: author.trim() }),
          })
          setState(payload.state)
          setSelectedId(payload.bookId)
          setTitle('')
          setAuthor('')
          if (payload.existing) setNotice(translate('notice.existing'))
          else setNotice('')
        } catch (caught) {
          setError(caught.message)
        } finally {
          setBusy(false)
        }
      }

      async function rate(term, rating) {
        if (ratingBusy) return
        const previous = term.rating || null
        setRatingBusy(true)
        setState((current) => replaceTermRating(current, term.id, rating))
        try {
          const payload = await request('/rate', {
            method: 'POST',
            body: JSON.stringify({ termId: term.id, rating }),
          })
          setState(payload.state)
        } catch (caught) {
          setState((current) => replaceTermRating(current, term.id, previous))
          setError(caught.message)
        } finally {
          setRatingBusy(false)
        }
      }

      async function drawDaily() {
        if (dailyLoading) return
        setDailyLoading(true)
        setError(null)
        try {
          const payload = await request('/daily', { method: 'POST', body: '{}' })
          setState(payload.state)
        } catch (caught) {
          setError(caught.message)
        } finally {
          setDailyLoading(false)
        }
      }

      async function removeBook(book) {
        if (!window.confirm(translate('library.confirm', { title: book.title }))) return
        try {
          const payload = await request(`/books/${encodeURIComponent(book.id)}`, { method: 'DELETE' })
          setState(payload.state)
          if (selectedId === book.id) {
            const next = payload.state.books[0]
            setSelectedId(next ? next.id : null)
          }
        } catch (caught) {
          setError(caught.message)
        }
      }

      const stageMessages = [translate('stage.1'), translate('stage.2'), translate('stage.3')]

      return h(
        'div',
        { className: 'phil-root' },
        h('style', null, CSS),
        h(
          'div',
          { className: 'phil-wrap' },
          h(
            'header',
            { className: 'phil-hero' },
            h(
              'div',
              { className: 'phil-topline' },
              h('p', { className: 'phil-kicker' }, translate('hero.kicker')),
              h('span', { className: 'phil-date' }, state?.today || ''),
            ),
            h('h1', null, translate('hero.title')),
            h('p', { className: 'phil-hero-sub' }, translate('hero.subtitle')),
            h(
              'form',
              { className: 'phil-search', onSubmit: analyze },
              h(
                'label',
                { className: 'phil-field' },
                h(Icon, { name: 'book', size: 17 }),
                h('input', {
                  ref: inputRef,
                  value: title,
                  onChange: (event) => setTitle(event.target.value),
                  placeholder: translate('input.titlePlaceholder'),
                  'aria-label': translate('input.title'),
                  maxLength: 200,
                  disabled: busy,
                }),
              ),
              h(
                'label',
                { className: 'phil-field' },
                h('input', {
                  value: author,
                  onChange: (event) => setAuthor(event.target.value),
                  placeholder: translate('input.authorPlaceholder'),
                  'aria-label': translate('input.author'),
                  maxLength: 120,
                  disabled: busy,
                }),
              ),
              h(
                'button',
                { type: 'submit', className: 'phil-primary', disabled: busy },
                h(Icon, { name: busy ? 'spark' : 'arrow', size: 16 }),
                busy ? translate('action.analyzing') : translate('action.analyze'),
              ),
            ),
            h(
              'div',
              { className: 'phil-samples' },
              h('span', null, `${translate('sample.label')} ·`),
              ['sample.1', 'sample.2', 'sample.3'].map((key) =>
                h(
                  'button',
                  {
                    key,
                    type: 'button',
                    className: 'phil-sample',
                    disabled: busy,
                    onClick: () => setTitle(translate(key)),
                  },
                  translate(key),
                ),
              ),
            ),
          ),
          error
            ? h(
                'div',
                { className: 'phil-error', role: 'alert' },
                h('div', null, h('strong', null, translate('error.title')), h('p', null, error)),
                h('button', { type: 'button', onClick: () => setError(null) }, translate('error.dismiss')),
              )
            : null,
          notice ? h('div', { className: 'phil-notice', role: 'status' }, notice) : null,
          busy
            ? h(
                'div',
                { className: 'phil-progress', role: 'status', 'aria-live': 'polite' },
                h('span', { className: 'phil-spinner' }),
                h(
                  'div',
                  null,
                  h('strong', null, stageMessages[stage]),
                  h('p', null, '检索 SEP、写作释义通常需要 30–90 秒。请让这个页面保持打开。'),
                ),
              )
            : null,
          !state && !error
            ? h(
                'div',
                { className: 'phil-loading', role: 'status' },
                h('span', { className: 'phil-spinner' }),
                translate('loading'),
              )
            : null,
          state
            ? h(
                'div',
                { className: 'phil-grid' },
                h(
                  'main',
                  { className: 'phil-main' },
                  selectedBook
                    ? h(
                        'section',
                        null,
                        h(
                          'div',
                          { className: 'phil-section-head' },
                          h(
                            'div',
                            null,
                            h('h2', null, selectedBook.title),
                            h(
                              'p',
                              null,
                              [selectedBook.author, selectedBook.field, selectedBook.note].filter(Boolean).join(' · ') || translate('book.noNote'),
                              mentionsLoading ? ` · ${translate('term.mentionsLoading')}` : '',
                            ),
                          ),
                          h(
                            'button',
                            { type: 'button', className: 'phil-delete', onClick: () => removeBook(selectedBook) },
                            h(Icon, { name: 'trash', size: 14 }),
                            translate('book.delete'),
                          ),
                        ),
                        h(
                          'div',
                          { className: 'phil-terms' },
                          selectedBook.terms.map((term, index) =>
                            h(TermCard, {
                              key: term.id,
                              term,
                              index,
                              onRate: rate,
                              busy: ratingBusy,
                              onConcept: openConcept,
                            }),
                          ),
                        ),
                      )
                    : h(HowItWorks),
                ),
                h(
                  'aside',
                  { className: 'phil-rail' },
                  h(DailyCard, { state, loading: dailyLoading, onGenerate: drawDaily, onConcept: openConcept }),
                  h(ProfileCard, { state }),
                  h(LibraryCard, {
                    state,
                    selectedId: selectedBook?.id || null,
                    onSelect: setSelectedId,
                    onDelete: removeBook,
                  }),
                ),
              )
            : null,
        ),
        conceptDialog
          ? h(ConceptDialog, {
              dialog: conceptDialog,
              canGoBack: conceptHistory.length > 0,
              onClose: closeConcept,
              onBack: backConcept,
              onRetry: retryConcept,
              onRefresh: refreshConcept,
              onNavigate: openConcept,
            })
          : null,
      )
    }

    return {
      inject: ['slots', 'locale'],
      apply(ctx) {
        localeService = ctx.locale
        translate = ctx.locale.bind(NS)
        try {
          const disposeDictionary = ctx.locale.register(NS, { zh: DICT.zh, en: DICT.en })
          ctx.effect(() => disposeDictionary)
        } catch (error) {
          // A hot reload can find the previous generation's namespace still present.
          if (!String(error?.message || error).includes('already has locale')) throw error
        }
        ctx.effect(() =>
          ctx.slots.inject('sidebar.panellist', () =>
            ctx.slots.register(
              {
                name: 'sidebar.panellist',
                id: 'philosophy-terms',
                order: 20,
                label: () => translate('panel.label'),
              },
              PanelIcon,
            ),
          ),
        )
        ctx.effect(() =>
          ctx.slots.inject('main', () =>
            ctx.slots.register(
              {
                name: 'main',
                key: 'philosophy-terms',
                locale: NS,
              },
              Page,
            ),
          ),
        )
      },
    }
  },
})
