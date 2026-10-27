/**
 * Philosophy reading atlas — Host half.
 *
 * Keeps a durable lexicon of books, their three key philosophical terms, the
 * reader's ratings, and one SEP-grounded term per day. The Web UI talks to this
 * module over a small same-origin JSON route; no session is required, so the
 * lexicon survives across books, sessions, and restarts.
 */
import { randomUUID } from 'node:crypto'

const DOMAIN_NAME = 'philosophy_reading'
const API_BASE = '/philosophy/api'
const SEP_ORIGIN = 'https://plato.stanford.edu'
const SLUG = /^[a-z0-9][a-z0-9-]*$/
const DAY_FORMATTER = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Shanghai' })

const RATINGS = new Set(['interested', 'neutral', 'not-interested'])

/** Turn a search hit (often an entry section with a #anchor) into a fetchable SEP entry URL. */
function sepEntryUrl(value) {
  try {
    const parsed = new URL(String(value || ''))
    if (parsed.protocol !== 'https:' || parsed.hostname !== 'plato.stanford.edu') return ''
    const match = parsed.pathname.match(/^\/entries\/([a-z0-9-]+)\/?$/)
    return match ? `${SEP_ORIGIN}/entries/${match[1]}/` : ''
  } catch {
    return ''
  }
}

class AppError extends Error {
  constructor(code, message, status = 400) {
    super(message)
    this.name = 'AppError'
    this.code = code
    this.status = status
  }
}

const isNonEmpty = (value) => typeof value === 'string' && value.trim().length > 0

const isBookRecord = (value) =>
  value &&
  typeof value === 'object' &&
  isNonEmpty(value.id) &&
  isNonEmpty(value.title) &&
  Array.isArray(value.termIds) &&
  typeof value.createdAt === 'string'

const isTermRecord = (value) =>
  value &&
  typeof value === 'object' &&
  isNonEmpty(value.id) &&
  isNonEmpty(value.bookId) &&
  isNonEmpty(value.termEn) &&
  isNonEmpty(value.termZh) &&
  isNonEmpty(value.definition) &&
  typeof value.createdAt === 'string'

const isDailyRecord = (value) =>
  value &&
  typeof value === 'object' &&
  /^\d{4}-\d{2}-\d{2}$/.test(value.date) &&
  isNonEmpty(value.termEn) &&
  isNonEmpty(value.termZh) &&
  isNonEmpty(value.definition)

const isConceptRecord = (value) =>
  value &&
  typeof value === 'object' &&
  isNonEmpty(value.key) &&
  (isNonEmpty(value.termEn) || isNonEmpty(value.termZh)) &&
  isNonEmpty(value.definition)

/** Stable cache key for a queried concept, independent of which surface opened it. */
function conceptKeyOf(termEn, termZh) {
  const ascii = String(termEn || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
  if (ascii) return ascii
  return `zh-${Buffer.from(String(termZh || '')).toString('hex').slice(0, 64)}`
}

/** Minimal schema surface: ctx.storageDomain opens with `parse`, so a checked identity is enough. */
function table(check) {
  return {
    valueSchema: {
      parse(value) {
        if (!check(value)) throw new Error('stored philosophy record is malformed')
        return value
      },
    },
  }
}

const SPEC = {
  name: DOMAIN_NAME,
  version: 1,
  tables: {
    books: table(isBookRecord),
    terms: table(isTermRecord),
    daily: table(isDailyRecord),
    concepts: table(isConceptRecord),
  },
}

/** All model prompts are deliberately Chinese-first: the product is a Chinese philosophical lexicon. */
const ANALYST_SYSTEM = [
  '你是一位精通西方哲学史、欧陆哲学与分析哲学的研究者，长期为中文读者写作。',
  '你的判断克制、准确，不把“思想随笔”或“哲学小说”误判为哲学著作，也不把常识格言当成哲学概念。',
  '你只输出一个合法的 JSON 对象，不输出 markdown、解释或前后缀。',
].join('\n')

const WRITER_SYSTEM = [
  '你是一位以中文写作的哲学研究者，熟悉斯坦福哲学百科（SEP）的论证风格。',
  '你的文字精确、克制、概念密度高：先界定，再展开区分与争议，避免词典式平铺直叙。',
  '你不编造引文，不把 SEP 摘要改写成营销文案。你只输出一个合法的 JSON 对象。',
].join('\n')

const DAILY_SYSTEM = [
  '你是一位哲学阅读顾问，熟悉西方哲学各传统及其核心概念，也熟悉中文哲学译名。',
  '你的推荐必须与读者已有的阅读和评价相关，同时避免重复他已经见过的词。',
  '你只输出一个合法的 JSON 对象，不输出 markdown、解释或前后缀。',
].join('\n')

const CURATED_FALLBACKS = [
  { termEn: 'Recognition', termZh: '承认', sepSlug: 'recognition' },
  { termEn: 'Epistemic Injustice', termZh: '认识论不义', sepSlug: 'epistemic-injustice' },
  { termEn: 'Authenticity', termZh: '本真性', sepSlug: 'authenticity' },
  { termEn: 'Nihilism', termZh: '虚无主义', sepSlug: 'nihilism' },
  { termEn: 'Phenomenology', termZh: '现象学', sepSlug: 'phenomenology' },
  { termEn: 'Hermeneutics', termZh: '诠释学', sepSlug: 'hermeneutics' },
  { termEn: 'Free Will', termZh: '自由意志', sepSlug: 'freewill' },
  { termEn: 'Personal Identity', termZh: '人格同一性', sepSlug: 'personal-identity' },
  { termEn: 'Consciousness', termZh: '意识', sepSlug: 'consciousness' },
]

const now = () => new Date().toISOString()
const today = () => DAY_FORMATTER.format(new Date())

function normalizeTitle(value) {
  return String(value || '')
    .trim()
    .toLowerCase()
    .replace(/[《》〈〉「」『』\s:：,，.。;；'"“”‘’·\-—_]/g, '')
}

function charCount(value) {
  return [...String(value || '').replace(/\s+/g, '')].length
}

function cleanText(value, max = 12000) {
  return String(value || '')
    .replace(/^#{1,6}\s*/gm, '')
    .replace(/\*\*/g, '')
    .replace(/__/g, '')
    .replace(/\r\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
    .slice(0, max)
}

function oneLine(value, max = 240) {
  return String(value || '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, max)
}

function parseJsonObject(raw) {
  const source = String(raw || '').replace(/```json/gi, '```').trim()
  const fenced = source.match(/```([\s\S]*?)```/)
  const body = fenced ? fenced[1] : source
  const start = body.indexOf('{')
  const end = body.lastIndexOf('}')
  if (start < 0 || end <= start) throw new Error('no JSON object in model output')
  return JSON.parse(body.slice(start, end + 1))
}

function decodeEntities(value) {
  const named = {
    amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ',
    mdash: '—', ndash: '–', hellip: '…', rsquo: '’', lsquo: '‘',
    ldquo: '“', rdquo: '”', times: '×', middot: '·',
  }
  return String(value || '').replace(/&(#x?[0-9a-f]+|[a-z]+);/gi, (match, entity) => {
    const key = entity.toLowerCase()
    if (key.startsWith('#x')) {
      const code = Number.parseInt(key.slice(2), 16)
      return Number.isFinite(code) ? String.fromCodePoint(code) : match
    }
    if (key.startsWith('#')) {
      const code = Number.parseInt(key.slice(1), 10)
      return Number.isFinite(code) ? String.fromCodePoint(code) : match
    }
    return Object.prototype.hasOwnProperty.call(named, key) ? named[key] : match
  })
}

function stripTags(value) {
  return decodeEntities(String(value || '').replace(/<[^>]*>/g, ' '))
    .replace(/\s+/g, ' ')
    .trim()
}

/** Isolate SEP's article body, drop navigation and apparatus, and flatten the prose. */
function sepText(html) {
  let body = String(html || '')
  const start = body.search(/<div[^>]*id=["']aueditable["']/i)
  if (start >= 0) body = body.slice(start)
  const end = body.search(/<div[^>]*id=["']article-footer["']/i)
  if (end > 2000) body = body.slice(0, end)
  body = body
    .replace(/<script\b[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style\b[\s\S]*?<\/style>/gi, ' ')
    .replace(/<noscript\b[\s\S]*?<\/noscript>/gi, ' ')
    .replace(/<svg\b[\s\S]*?<\/svg>/gi, ' ')
    .replace(/<nav\b[\s\S]*?<\/nav>/gi, ' ')
    .replace(/<header\b[\s\S]*?<\/header>/gi, ' ')
    .replace(/<footer\b[\s\S]*?<\/footer>/gi, ' ')
    .replace(/<form\b[\s\S]*?<\/form>/gi, ' ')
    .replace(/<(p|div|section|article|h[1-6]|li|blockquote|br|tr)\b[^>]*>/gi, '\n')
    .replace(/<[^>]+>/g, ' ')
  let text = decodeEntities(body)
    .replace(/[ \t\f\v]+/g, ' ')
    .replace(/\n\s*\n+/g, '\n')
    .trim()
  const bib = text.search(/\n\s*Bibliography\s*\n/i)
  if (bib > 3000) text = text.slice(0, bib)
  const tools = text.search(/\n\s*Academic Tools\s*\n/i)
  if (tools > 3000) text = text.slice(0, tools)
  return text.replace(/[ \t]+/g, ' ').slice(0, 16000)
}

function sepTitleOf(html) {
  const h1 = String(html || '').match(/<h1[^>]*>([\s\S]*?)<\/h1>/i)
  if (h1) {
    const title = stripTags(h1[1])
    if (title) return title
  }
  const docTitle = String(html || '').match(/<title[^>]*>([\s\S]*?)<\/title>/i)
  return docTitle ? stripTags(docTitle[1]).replace(/\s*\(Stanford Encyclopedia of Philosophy\).*$/i, '') : ''
}

function trimToRange(definition) {
  const text = cleanText(definition)
  if (charCount(text) <= 1000) return text
  const chars = [...text]
  let cut = chars.slice(0, 1000).join('')
  const boundary = Math.max(cut.lastIndexOf('。'), cut.lastIndexOf('；'), cut.lastIndexOf('！'), cut.lastIndexOf('？'))
  if (boundary > 600) cut = cut.slice(0, boundary + 1)
  return cut.trim()
}

async function withTimeout(operation, ms, code, message) {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), ms)
  try {
    return await operation(controller.signal)
  } catch (error) {
    if (error?.name === 'AbortError') throw new AppError(code, message, 504)
    throw error
  } finally {
    clearTimeout(timer)
  }
}

function readJson(req) {
  return new Promise((resolve, reject) => {
    const chunks = []
    let size = 0
    req.on('data', (chunk) => {
      size += chunk.length
      if (size > 128 * 1024) {
        reject(new AppError('BODY_TOO_LARGE', '请求内容过大。'))
        req.destroy()
        return
      }
      chunks.push(chunk)
    })
    req.on('end', () => {
      try {
        const text = Buffer.concat(chunks).toString('utf8')
        resolve(text ? JSON.parse(text) : {})
      } catch {
        reject(new AppError('BAD_JSON', '请求格式无法解析。'))
      }
    })
    req.on('error', reject)
  })
}

function sendJson(res, status, payload) {
  const body = JSON.stringify(payload)
  res.writeHead(status, {
    'content-type': 'application/json; charset=utf-8',
    'content-length': Buffer.byteLength(body),
    'cache-control': 'no-store',
  })
  res.end(body)
}

export const inject = ['storageDomain', 'agentDefaultModel', 'llm', 'webServer', 'web']

export async function apply(ctx) {
  const domain = await ctx.storageDomain.open(SPEC)
  ctx.effect(() => () => domain.close())

  const books = domain.table('books')
  const terms = domain.table('terms')
  const daily = domain.table('daily')
  const concepts = domain.table('concepts')

  let dailyJob = null
  const analysisJobs = new Map()
  const conceptJobs = new Map()
  const mentionJobs = new Map()

  const getBook = (id) => books.get(id)
  const getTerm = (id) => terms.get(id)

  function listBooks() {
    return [...books.entries()]
      .map(([, book]) => book)
      .sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)))
  }

  function listTerms() {
    return [...terms.entries()].map(([, term]) => term)
  }

  function buildState() {
    const allBooks = listBooks().map((book) => ({
      ...book,
      terms: book.termIds
        .map((id) => getTerm(id))
        .filter(Boolean)
        .sort((a, b) => (a.order || 0) - (b.order || 0)),
    }))
    const allTerms = allBooks.flatMap((book) => book.terms)
    const stats = {
      books: allBooks.length,
      terms: allTerms.length,
      interested: allTerms.filter((term) => term.rating === 'interested').length,
      neutral: allTerms.filter((term) => term.rating === 'neutral').length,
      notInterested: allTerms.filter((term) => term.rating === 'not-interested').length,
    }
    return {
      books: allBooks,
      daily: daily.get(today()) || null,
      today: today(),
      stats,
    }
  }

  function findBookByTitle(title) {
    const normalized = normalizeTitle(title)
    return listBooks().find((book) => normalizeTitle(book.title) === normalized)
  }

  async function deleteBook(id) {
    const book = getBook(id)
    if (!book) return false
    for (const termId of book.termIds) await terms.delete(termId)
    await books.delete(id)
    return true
  }

  async function callModel(system, user, { maxTokens = 2200, temperature = 0.4 } = {}) {
    const selection = ctx.agentDefaultModel.currentSelection()
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), 180_000)
    let text = ''
    try {
      const call = await ctx.llm.prepareCall(
        { provider: selection.provider, model: selection.model, maxTokens, temperature },
        controller.signal,
        (controls, model) => {
          const effort = model.reasoning?.efforts?.[0]?.id
          return { ...controls, ...(effort === undefined ? {} : { reasoningEffort: effort }) }
        },
      )
      const stream = call.stream({
        ...call.config,
        system,
        messages: [{ role: 'user', content: [{ type: 'text', text: user }] }],
        signal: controller.signal,
      })
      for await (const chunk of stream) {
        if (chunk.type === 'text-delta') text += chunk.text
        if (chunk.type === 'finish') {
          if (chunk.reason.kind === 'error') {
            throw new AppError('MODEL_ERROR', `模型返回错误：${oneLine(chunk.reason.failure?.message || '未知错误', 300)}`, 502)
          }
          if (chunk.reason.kind === 'aborted') {
            throw new AppError('MODEL_ABORTED', '模型调用被中止或超时。', 504)
          }
          if (chunk.reason.kind === 'max-tokens' && !text.trim()) {
            throw new AppError('MODEL_TOKEN_LIMIT', '模型的推理耗尽了输出额度，没有留下正文。请稍后重试。', 502)
          }
        }
      }
    } finally {
      clearTimeout(timer)
    }
    if (!text.trim()) throw new AppError('MODEL_EMPTY', '模型没有返回文本。', 502)
    return text
  }

  async function callJson(system, user, options = {}) {
    let lastError
    for (let attempt = 0; attempt < 2; attempt += 1) {
      const suffix = attempt === 0
        ? ''
        : '\n\n上一次输出不是合法 JSON。请只输出一个 JSON 对象，不要任何解释、markdown 代码块或前后缀。'
      const raw = await callModel(system, `${user}${suffix}`, options)
      try {
        return parseJsonObject(raw)
      } catch (error) {
        lastError = error
      }
    }
    throw new AppError('BAD_MODEL_JSON', `模型输出无法解析为 JSON：${oneLine(lastError?.message, 160)}`, 502)
  }

  function assertTerm(value) {
    if (!value || typeof value !== 'object') throw new AppError('BAD_MODEL_JSON', '模型没有给出可用的术语。', 502)
    const termEn = oneLine(value.termEn, 120)
    const termZh = oneLine(value.termZh, 80)
    if (!termEn || !termZh) throw new AppError('BAD_MODEL_JSON', '模型给出的术语缺少中英文名称。', 502)
    const slug = oneLine(value.sepSlug, 120).toLowerCase().replace(/^https?:\/\/plato\.stanford\.edu\/entries\//, '').replace(/\/$/, '')
    return {
      termEn,
      termZh,
      sepSlug: SLUG.test(slug) ? slug : '',
      why: oneLine(value.why, 360),
      tradition: oneLine(value.tradition, 60),
    }
  }

  function normalizeConceptRef(value) {
    if (!value || typeof value !== 'object') return null
    const termEn = oneLine(value.termEn, 120)
    const termZh = oneLine(value.termZh, 80)
    if (!termEn && !termZh) return null
    const slug = oneLine(value.sepSlug, 120)
      .toLowerCase()
      .replace(/^https?:\/\/plato\.stanford\.edu\/entries\//, '')
      .replace(/\/$/, '')
    return {
      termEn,
      termZh: termZh || termEn,
      sepSlug: SLUG.test(slug) ? slug : '',
      tradition: oneLine(value.tradition, 60),
    }
  }

  function normalizeConceptList(value, definition, mainTerm, { mustAppear = false, limit = 8 } = {}) {
    const text = String(definition || '')
    const lower = text.toLowerCase()
    const mainKeys = new Set([
      String(mainTerm?.termEn || '').toLowerCase(),
      String(mainTerm?.termZh || '').toLowerCase(),
    ].filter(Boolean))
    const seen = new Set()
    const result = []
    for (const raw of Array.isArray(value) ? value : []) {
      const ref = normalizeConceptRef(raw)
      if (!ref) continue
      const key = (ref.termEn || ref.termZh).toLowerCase()
      if (!key || mainKeys.has(key) || seen.has(key)) continue
      if (mustAppear) {
        const appears = (ref.termZh && text.includes(ref.termZh))
          || (ref.termEn && lower.includes(ref.termEn.toLowerCase()))
        if (!appears) continue
      }
      seen.add(key)
      result.push(ref)
      if (result.length >= limit) break
    }
    return result
  }

  async function identifyBook(title, author) {
    const prompt = [
      '请判断下面这本书是否属于哲学类书籍，并提炼全书最关键的三个哲学词汇。',
      '',
      `书名：《${title}》`,
      author ? `作者：${author}` : '作者：未知（请根据书名判断；不确定就留空）',
      '',
      '判断标准：',
      '1. 它必须是一部以哲学论证、概念分析、存在论/伦理学/认识论/政治哲学/美学/宗教哲学等为核心的著作；纯文学、成功学、科普、历史叙事不算。',
      '2. 若它是借文学形式表达哲学问题（如加缪、陀思妥耶夫斯基、卡夫卡），可以算，但必须在 note 中说明其哲学性来自何处。',
      '3. 三个词必须是理解全书论证结构的关键概念，不要选泛泛的主题词（如“自由”“死亡”单独出现还不够，要说明它在本书中的特殊含义）。',
      '4. 每个词给出最可能对应的 SEP 词条 slug（只写 slug，如 existentialism、heidegger、recognition），不确定就留空字符串。',
      '',
      '输出 JSON，结构严格如下：',
      '{"isPhilosophy":true,"book":{"title":"规范书名","author":"作者或空字符串","field":"所属哲学领域","note":"一句话说明哲学性"},"terms":[{"termEn":"英文术语","termZh":"中文译名","sepSlug":"sep-entry-slug 或空字符串","why":"为什么它是全书的关键概念（40-90字）","tradition":"思想传统或学派"}]}',
      'terms 必须恰好三个，按重要性排序。若判断不是哲学书，输出 {"isPhilosophy":false,"note":"为什么不属于哲学（30-80字）"}。',
    ].join('\n')
    const data = await callJson(ANALYST_SYSTEM, prompt, { maxTokens: 1600, temperature: 0.25 })
    if (data.isPhilosophy === false || data.philosophy === false) {
      throw new AppError('NOT_PHILOSOPHY', oneLine(data.note, 300) || '这本书看起来不属于哲学类书籍。', 422)
    }
    const rawTerms = Array.isArray(data.terms) ? data.terms : []
    if (rawTerms.length < 3) throw new AppError('BAD_MODEL_JSON', '模型没有给出三个关键术语。', 502)
    const cleaned = rawTerms.slice(0, 3).map(assertTerm)
    return {
      title: oneLine(data.book?.title, 200) || title,
      author: oneLine(data.book?.author || author, 160),
      field: oneLine(data.book?.field, 120),
      note: oneLine(data.book?.note, 300),
      terms: cleaned,
    }
  }

  async function searchSep(term, signal) {
    const queries = [
      `site:plato.stanford.edu/entries ${term.termEn}`,
      `site:plato.stanford.edu/entries "${term.termEn}" ${term.termZh}`,
      `site:plato.stanford.edu ${term.termEn} ${term.termZh}`,
    ]
    const found = []
    for (const query of queries) {
      try {
        const result = await ctx.web.search({ query, maxResults: 6 }, signal)
        for (const source of result.sources || []) {
          const url = sepEntryUrl(source.url)
          if (url && !found.includes(url)) found.push(url)
        }
        if (found.length > 0) return found.slice(0, 5)
      } catch {
        // A search provider failure is not fatal: the model's slug may still work.
      }
    }
    return found.slice(0, 5)
  }

  async function searchSepSite(term, signal) {
    const query = encodeURIComponent(term.termEn || term.termZh || '')
    const result = await ctx.web.fetch({
      url: `${SEP_ORIGIN}/search/searcher.py?query=${query}&n=10`,
    }, signal)
    if (!result || result.statusCode !== 200) return []
    const html = result.body?.content || ''
    const urls = []
    for (const match of html.matchAll(/\/entries\/([a-z0-9-]+)\//gi)) {
      const url = `${SEP_ORIGIN}/entries/${match[1].toLowerCase()}/`
      if (!urls.includes(url)) urls.push(url)
      if (urls.length >= 5) break
    }
    return urls
  }

  async function fetchSepPage(url, signal) {
    const result = await ctx.web.fetch({ url }, signal)
    if (!result || result.statusCode !== 200) return null
    const html = result.body?.content || ''
    if (!html || html.length < 500) return null
    const text = sepText(html)
    if (text.length < 800) return null
    const finalUrl = sepEntryUrl(result.url || '') || sepEntryUrl(url) || url
    return { url: finalUrl, title: sepTitleOf(html), text }
  }

  async function lookupSep(term) {
    const candidates = []
    const slugs = [...new Set([
      term.sepSlug,
      ...(Array.isArray(term.sepSlugs) ? term.sepSlugs : []),
    ].filter((slug) => SLUG.test(slug || '')))]
    for (const slug of slugs) {
      candidates.push(`${SEP_ORIGIN}/entries/${slug}/`)
    }
    for (const url of candidates) {
      try {
        const page = await withTimeout(
          (signal) => fetchSepPage(url, signal),
          25_000,
          'SEP_TIMEOUT',
          '斯坦福哲学百科响应超时。',
        )
        if (page) return page
      } catch {
        // Try search and the next candidate.
      }
    }
    let urls = []
    try {
      urls = await withTimeout(
        (signal) => searchSep(term, signal),
        25_000,
        'SEP_SEARCH_TIMEOUT',
        'SEP 词条检索超时。',
      )
    } catch {
      urls = []
    }
    if (urls.length === 0) {
      try {
        urls = await withTimeout(
          (signal) => searchSepSite(term, signal),
          20_000,
          'SEP_SEARCH_TIMEOUT',
          'SEP 站内检索超时。',
        )
      } catch {
        urls = []
      }
    }
    for (const url of urls.slice(0, 4)) {
      try {
        const page = await withTimeout(
          (signal) => fetchSepPage(url, signal),
          25_000,
          'SEP_TIMEOUT',
          '斯坦福哲学百科响应超时。',
        )
        if (page) return page
      } catch {
        // Next candidate.
      }
    }
    return null
  }

  async function writeDefinition(book, term, sep) {
    const bookLine = `《${book.title}》${book.author ? `（${book.author}）` : ''}${book.field ? `，${book.field}` : ''}`
    const sourceBlock = sep
      ? [
          `SEP 词条：${sep.title || term.termEn}`,
          `URL：${sep.url}`,
          'SEP 原文节选：',
          '"""',
          sep.text.slice(0, 12000),
          '"""',
        ].join('\n')
      : [
          'SEP 直连检索失败。请依据你掌握的哲学史与 SEP 相关词条的通识写作，不要编造具体引文。',
        ].join('\n')

    const basePrompt = [
      `你正在为中文读者编写一份哲学阅读词谱。书籍：${bookLine}`,
      `全书关键概念：${term.termZh}（${term.termEn}）`,
      `选取理由：${term.why || '它是理解全书论证的关键概念。'}`,
      '',
      sourceBlock,
      '',
      '写作任务：写一段可以直接阅读的哲学释义。',
      '要求：',
      '1. 篇幅 350–650 个汉字，硬性范围 200–1000 字，不要写成条目罗列。',
      '2. 用哲学语言展开：先给出概念的界定，再说明它回应的问题、关键区分、以及至少一个理论争议或思想史转折；不要只给词典式定义。',
      '3. 首次出现的外文术语用括号保留原文（如“此在（Dasein）”），中文表达要准确、克制、有概念密度。',
      '4. 可以转述 SEP 的论证，但不要大段直译，不要以“根据斯坦福哲学百科”开头，也不要编造引文。',
      '5. 另写一句 30–80 字的“在本书中”，说明该词在《' + book.title + '》语境中的特殊用法。',
      '6. mentions 列出释义正文中逐字出现的 3–8 个其他哲学概念，每个概念必须真的出现在定义里；不要收录本词、普通词或只出现在括号注释里的英文人名。',
      '7. related 列出 3–6 个适合继续查询的相关概念，不要求出现在正文中；尽量给出可对应的 SEP 词条 slug，不确定就留空。',
      '',
      '输出 JSON：',
      '{"definition":"350-650个汉字的释义","inBook":"30-80字，该词在本书中的特殊用法","tradition":"思想传统或学派","mentions":[{"termZh":"释义中逐字出现的概念","termEn":"英文名或空字符串","sepSlug":"sep-entry-slug 或空字符串"}],"related":[{"termZh":"相关概念","termEn":"英文名或空字符串","sepSlug":"sep-entry-slug 或空字符串"}]}',
    ].join('\n')

    let data = await callJson(WRITER_SYSTEM, basePrompt, { maxTokens: 2000, temperature: 0.45 })
    let definition = trimToRange(data.definition)
    if (charCount(definition) < 200) {
      const retryPrompt = `${basePrompt}\n\n你上一次只写了 ${charCount(definition)} 字。请扩写到 400–600 字，仍然只输出 JSON，并保持同样的结构。`
      data = await callJson(WRITER_SYSTEM, retryPrompt, { maxTokens: 2200, temperature: 0.45 })
      definition = trimToRange(data.definition)
    }
    if (charCount(definition) < 200) {
      throw new AppError('DEFINITION_TOO_SHORT', `模型生成的释义只有 ${charCount(definition)} 字，未达到 200 字下限。`, 502)
    }
    const keywordFallback = (Array.isArray(data.keywords) ? data.keywords : [])
      .map((item) => oneLine(item, 40))
      .filter(Boolean)
    const related = normalizeConceptList(
      data.related ?? keywordFallback.map((termZh) => ({ termZh })),
      definition,
      term,
      { limit: 6 },
    )
    let mentions = normalizeConceptList(data.mentions, definition, term, { mustAppear: true, limit: 8 })
    if (mentions.length === 0) {
      mentions = normalizeConceptList(
        keywordFallback.map((termZh) => ({ termZh })),
        definition,
        term,
        { mustAppear: true, limit: 8 },
      )
    }
    return {
      definition,
      inBook: oneLine(data.inBook, 220),
      tradition: oneLine(data.tradition || term.tradition, 80),
      keywords: related.map((item) => item.termZh).slice(0, 6),
      mentions,
      related,
      sepUrl: sep?.url || '',
      sepTitle: sep?.title || '',
      sourceStatus: sep ? 'sep' : 'fallback',
    }
  }

  async function enrichTerm(book, term) {
    let sep = null
    try {
      sep = await lookupSep(term)
    } catch (error) {
      ctx.logger.warn(`philosophy-terms: SEP lookup failed for ${term.termEn}: ${String(error)}`)
    }
    const written = await writeDefinition(book, term, sep)
    return { ...term, ...written }
  }

  function normalizeSlugList(values) {
    const list = []
    for (const value of Array.isArray(values) ? values : []) {
      const slug = oneLine(value, 120)
        .toLowerCase()
        .replace(/^https?:\/\/plato\.stanford\.edu\/entries\//, '')
        .replace(/\/$/, '')
      if (SLUG.test(slug) && !list.includes(slug)) list.push(slug)
      if (list.length >= 4) break
    }
    return list
  }

  async function resolveConceptRef(input) {
    const direct = normalizeConceptRef(input)
    if (!direct) throw new AppError('BAD_CONCEPT', '请给出一个可查询的概念名称。')
    if (direct.termEn && input.remap !== true) return direct
    const prompt = [
      '请把下面这个概念映射到规范的英文哲学名、中文名和最可能对应的斯坦福哲学百科词条。',
      `概念：${direct.termZh}${direct.termEn ? `（${direct.termEn}）` : ''}`,
      input.context?.bookTitle ? `它出现在对《${oneLine(input.context.bookTitle, 200)}》的阅读笔记中。` : '',
      input.context?.termZh ? `它属于对「${oneLine(input.context.termZh, 80)}」的释义。` : '',
      '',
      '只输出 JSON：',
      '{"termEn":"标准英文名","termZh":"中文名","sepSlugs":["最可能的SEP词条","备选词条1","备选词条2"],"tradition":"思想传统或学派"}',
      'sepSlugs 必须是 SEP 实际存在的独立词条路径片段（如 recognition、heidegger、epistemic-injustice），按相关性排序，最多 4 个。',
      '若概念本身没有独立词条，选择最能承载它的既有词条（例如“主体性”可以依次考虑 hegel、lacan、self-consciousness），不要生造一个泛词。',
    ].filter(Boolean).join('\n')
    const data = await callJson(ANALYST_SYSTEM, prompt, { maxTokens: 800, temperature: 0.2 })
    const slugs = normalizeSlugList([
      ...(Array.isArray(data.sepSlugs) ? data.sepSlugs : []),
      data.sepSlug,
      direct.sepSlug,
    ])
    return {
      ...normalizeConceptRef({ ...data, termZh: data.termZh || direct.termZh }) || direct,
      sepSlug: slugs[0] || '',
      sepSlugs: slugs,
    }
  }

  async function writeConceptDefinition(concept, sep, context = {}) {
    const bookLine = context.bookTitle ? `《${oneLine(context.bookTitle, 200)}》` : ''
    const sourceLine = context.termZh
      ? `这个概念出现在对${bookLine ? `${bookLine}的` : ''}术语「${oneLine(context.termZh, 80)}」的释义中。`
      : bookLine
        ? `这个概念与${bookLine}的阅读有关。`
        : '这是读者从释义中点开的一个哲学概念。'
    const sourceBlock = sep
      ? [
          `SEP 词条：${sep.title || concept.termEn}`,
          `URL：${sep.url}`,
          'SEP 原文节选：',
          '"""',
          sep.text.slice(0, 12000),
          '"""',
        ].join('\n')
      : [
          'SEP 直连检索失败。请依据你掌握的哲学史与 SEP 相关词条的通识写作，不要编造具体引文。',
        ].join('\n')

    const basePrompt = [
      '你正在为一个中文哲学阅读词谱解释一个次级概念。',
      sourceLine,
      `概念：${concept.termZh}（${concept.termEn}）${concept.tradition ? `，传统：${concept.tradition}` : ''}`,
      '',
      sourceBlock,
      '',
      '写作任务：写一段可以独立阅读的哲学释义。',
      '要求：',
      '1. 篇幅 350–650 个汉字，硬性范围 200–1000 字，不要写成条目罗列。',
      '2. 用哲学语言展开：先界定，再说明它回应的问题、关键区分、至少一个理论争议或思想史转折；不要只给词典式定义。',
      '3. 首次出现的外文术语用括号保留原文（如“承认（Anerkennung）”），中文表达准确、克制、有概念密度。',
      '4. 可以转述 SEP 的论证，但不要大段直译，不要以“根据斯坦福哲学百科”开头，也不要编造引文。',
      '5. relation 用 30–80 字说明它与当前术语的关系；若没有当前术语，就写它与读者阅读兴趣的关系。',
      '6. mentions 列出释义正文中逐字出现的 3–8 个其他哲学概念，必须真的出现在定义里；不要收录本词或普通人名。',
      '7. related 列出 3–6 个适合继续查询的相关概念，尽量给出 SEP slug，不确定就留空。',
      '',
      '输出 JSON：',
      '{"termEn":"英文名","termZh":"中文名","definition":"350-650个汉字的释义","relation":"30-80字，与当前术语的关系","tradition":"思想传统或学派","mentions":[{"termZh":"释义中逐字出现的概念","termEn":"英文名或空字符串","sepSlug":"sep-entry-slug 或空字符串"}],"related":[{"termZh":"相关概念","termEn":"英文名或空字符串","sepSlug":"sep-entry-slug 或空字符串"}]}',
    ].join('\n')

    let data = await callJson(WRITER_SYSTEM, basePrompt, { maxTokens: 2200, temperature: 0.42 })
    let definition = trimToRange(data.definition)
    if (charCount(definition) < 200) {
      const retryPrompt = `${basePrompt}\n\n你上一次只写了 ${charCount(definition)} 字。请扩写到 400–600 字，仍然只输出 JSON，并保持同样的结构。`
      data = await callJson(WRITER_SYSTEM, retryPrompt, { maxTokens: 2400, temperature: 0.42 })
      definition = trimToRange(data.definition)
    }
    if (charCount(definition) < 200) {
      throw new AppError('DEFINITION_TOO_SHORT', `模型生成的释义只有 ${charCount(definition)} 字，未达到 200 字下限。`, 502)
    }
    const related = normalizeConceptList(
      data.related ?? (Array.isArray(data.keywords) ? data.keywords : []).map((termZh) => ({ termZh })),
      definition,
      concept,
      { limit: 6 },
    )
    let mentions = normalizeConceptList(data.mentions, definition, concept, { mustAppear: true, limit: 8 })
    if (mentions.length === 0) {
      mentions = normalizeConceptList(
        (Array.isArray(data.keywords) ? data.keywords : []).map((termZh) => ({ termZh })),
        definition,
        concept,
        { mustAppear: true, limit: 8 },
      )
    }
    return {
      termEn: oneLine(data.termEn || concept.termEn, 120),
      termZh: oneLine(data.termZh || concept.termZh, 80),
      definition,
      relation: oneLine(data.relation, 240),
      tradition: oneLine(data.tradition || concept.tradition, 80),
      mentions,
      related,
      keywords: related.map((item) => item.termZh).slice(0, 6),
      sepUrl: sep?.url || '',
      sepTitle: sep?.title || '',
      sourceStatus: sep ? 'sep' : 'fallback',
    }
  }

  async function queryConcept(input) {
    const ref = await resolveConceptRef(input)
    const key = conceptKeyOf(ref.termEn, ref.termZh)
    const cached = concepts.get(key)
    if (cached && input.refresh !== true) return { concept: cached, cached: true }
    if (conceptJobs.has(key)) return conceptJobs.get(key)

    const job = (async () => {
      let sep = null
      try {
        sep = await lookupSep(ref)
      } catch (error) {
        ctx.logger.warn(`philosophy-terms: concept SEP lookup failed for ${ref.termEn}: ${String(error)}`)
      }
      const written = await writeConceptDefinition(ref, sep, input.context || {})
      const sepSlug = sep?.url?.match(/\/entries\/([a-z0-9-]+)\/?/i)?.[1] || ref.sepSlug
      const record = {
        key,
        termEn: written.termEn || ref.termEn,
        termZh: written.termZh || ref.termZh,
        sepSlug: SLUG.test(sepSlug || '') ? sepSlug : '',
        sepUrl: written.sepUrl,
        sepTitle: written.sepTitle,
        definition: written.definition,
        relation: written.relation,
        tradition: written.tradition,
        mentions: written.mentions,
        related: written.related,
        keywords: written.keywords,
        sourceStatus: written.sourceStatus,
        sourceTerm: oneLine(input.context?.termZh, 80),
        sourceBook: oneLine(input.context?.bookTitle, 200),
        createdAt: now(),
        updatedAt: now(),
      }
      await concepts.put(key, record)
      return { concept: record, cached: false }
    })()
    conceptJobs.set(key, job)
    try {
      return await job
    } finally {
      conceptJobs.delete(key)
    }
  }

  async function enrichTermMentions(term) {
    if (term.mentions && term.mentions.length > 0) {
      return { mentions: term.mentions, related: term.related || [] }
    }
    if (mentionJobs.has(term.id)) return mentionJobs.get(term.id)
    const job = (async () => {
      const prompt = [
        '下面是一段中文哲学释义。请找出其中逐字出现的、值得进一步查询的哲学概念。',
        `术语：${term.termZh}（${term.termEn}）`,
        `释义：${term.definition}`,
        '',
        '要求：',
        '1. mentions 3–8 个：必须逐字出现在释义正文中，排除本词和普通人名；优先选择有独立 SEP 词条的概念。',
        '2. related 3–6 个：适合继续阅读的相关概念，不要求出现在正文中。',
        '3. sepSlug 只写路径片段，如 recognition、heidegger；不确定就留空，不要编造。',
        '',
        '输出 JSON：',
        '{"mentions":[{"termZh":"释义中逐字出现的概念","termEn":"英文名或空字符串","sepSlug":"sep-entry-slug 或空字符串"}],"related":[{"termZh":"相关概念","termEn":"英文名或空字符串","sepSlug":"sep-entry-slug 或空字符串"}]}',
      ].join('\n')
      const data = await callJson(WRITER_SYSTEM, prompt, { maxTokens: 1400, temperature: 0.2 })
      let mentions = normalizeConceptList(data.mentions, term.definition, term, { mustAppear: true, limit: 8 })
      if (mentions.length === 0) {
        mentions = normalizeConceptList(
          (term.keywords || []).map((termZh) => ({ termZh })),
          term.definition,
          term,
          { mustAppear: true, limit: 8 },
        )
      }
      const related = normalizeConceptList(
        data.related ?? (term.keywords || []).map((termZh) => ({ termZh })),
        term.definition,
        term,
        { limit: 6 },
      )
      await terms.update(term.id, (current) => ({
        ...current,
        mentions,
        related,
        updatedAt: now(),
      }))
      return { mentions, related }
    })()
    mentionJobs.set(term.id, job)
    try {
      return await job
    } finally {
      mentionJobs.delete(term.id)
    }
  }

  async function analyze(title, author) {
    const trimmedTitle = oneLine(title, 200)
    if (trimmedTitle.length < 1 || trimmedTitle.length > 200) {
      throw new AppError('BAD_TITLE', '请输入有效的书名（1–200 个字符）。')
    }
    const key = normalizeTitle(trimmedTitle)
    const existing = findBookByTitle(trimmedTitle)
    if (existing) return { existing: true, bookId: existing.id }

    if (analysisJobs.has(key)) return analysisJobs.get(key)
    const job = (async () => {
      const identified = await identifyBook(trimmedTitle, oneLine(author, 120))
      const enriched = await Promise.all(
        identified.terms.map((term) => enrichTerm(
          { title: identified.title, author: identified.author, field: identified.field },
          term,
        )),
      )
      const bookId = randomUUID()
      const createdAt = now()
      const termIds = []
      for (let index = 0; index < enriched.length; index += 1) {
        const term = enriched[index]
        const termId = randomUUID()
        termIds.push(termId)
        await terms.put(termId, {
          id: termId,
          bookId,
          order: index + 1,
          termEn: term.termEn,
          termZh: term.termZh,
          sepSlug: term.sepSlug || '',
          sepUrl: term.sepUrl,
          sepTitle: term.sepTitle,
          why: term.why || '',
          definition: term.definition,
          inBook: term.inBook,
          tradition: term.tradition,
          keywords: term.keywords,
          mentions: term.mentions || [],
          related: term.related || [],
          sourceStatus: term.sourceStatus,
          rating: null,
          createdAt,
          updatedAt: createdAt,
        })
      }
      await books.put(bookId, {
        id: bookId,
        title: identified.title,
        author: identified.author,
        field: identified.field,
        note: identified.note,
        normTitle: key,
        termIds,
        createdAt,
      })
      return { existing: false, bookId }
    })()
    analysisJobs.set(key, job)
    try {
      return await job
    } finally {
      analysisJobs.delete(key)
    }
  }

  function buildProfile() {
    const allBooks = listBooks().map((book) => ({
      title: book.title,
      field: book.field || '',
      terms: book.termIds
        .map((id) => getTerm(id))
        .filter(Boolean)
        .map((term) => ({
          term: term.termZh,
          en: term.termEn,
          tradition: term.tradition || '',
          rating: term.rating || 'unrated',
        })),
    }))
    const allTerms = allBooks.flatMap((book) => book.terms)
    const traditions = new Map()
    for (const term of allTerms) {
      if (!term.tradition) continue
      const weight = term.rating === 'interested' ? 3 : term.rating === 'not-interested' ? -2 : 1
      traditions.set(term.tradition, (traditions.get(term.tradition) || 0) + weight)
    }
    return {
      books: allBooks,
      interested: allTerms.filter((term) => term.rating === 'interested').map((term) => `${term.term}（${term.en}）`),
      neutral: allTerms.filter((term) => term.rating === 'neutral').map((term) => `${term.term}（${term.en}）`),
      notInterested: allTerms.filter((term) => term.rating === 'not-interested').map((term) => `${term.term}（${term.en}）`),
      traditions: [...traditions.entries()]
        .filter(([, weight]) => weight !== 0)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 6)
        .map(([name, weight]) => ({ name, weight })),
    }
  }

  async function chooseDailyTerm(used) {
    const profile = buildProfile()
    const prompt = [
      '读者档案（JSON）：',
      JSON.stringify(profile).slice(0, 12000),
      '',
      `已经出现在词谱中的词（不得重复）：${used.length ? used.join('、') : '无'}。`,
      '',
      '请推荐一个读者可能感兴趣、但尚未出现在其词谱中的哲学词汇。推荐原则：',
      '1. 优先靠近标记为 interested 的词及其思想传统，避开 not-interested 的方向。',
      '2. 如果读者对某个传统表现出兴趣，优先推荐该传统内部但更基础或更前沿的概念，而不是换一个不相干的方向。',
      '3. 如果评价很少，就从其书目的论证缺口出发，推荐一个能反过来照亮这些书的词。',
      '4. 不要推荐过于宽泛的词（如“真理”“善”“存在”本身），要推荐有明确 SEP 词条、可被界定的概念。',
      '',
      '输出 JSON：',
      '{"termEn":"英文术语","termZh":"中文译名","sepSlug":"sep-entry-slug 或空字符串","reason":"为什么读者可能感兴趣（60-120字）","sourceBookTitle":"从读者书目中选择一本最相关的书，或空字符串","tradition":"思想传统或学派"}',
    ].join('\n')
    return callJson(DAILY_SYSTEM, prompt, { maxTokens: 900, temperature: 0.55 })
  }

  async function generateDaily() {
    const existing = daily.get(today())
    if (existing) return existing
    if (listBooks().length === 0) {
      throw new AppError('NO_BOOKS', '先输入一本书，词谱才能根据你的阅读生成每日一词。', 409)
    }
    const allTerms = listTerms()
    const usedSet = new Set(allTerms.map((term) => term.termEn.toLowerCase()))
    const used = allTerms.map((term) => term.termZh)
    let pick = null
    for (let attempt = 0; attempt < 2; attempt += 1) {
      const candidate = await chooseDailyTerm(used)
      const termEn = oneLine(candidate.termEn, 120)
      const termZh = oneLine(candidate.termZh, 80)
      if (termEn && termZh && !usedSet.has(termEn.toLowerCase())) {
        const slug = oneLine(candidate.sepSlug, 120).toLowerCase().replace(/^https?:\/\/plato\.stanford\.edu\/entries\//, '').replace(/\/$/, '')
        pick = {
          termEn,
          termZh,
          sepSlug: SLUG.test(slug) ? slug : '',
          why: oneLine(candidate.reason, 400),
          tradition: oneLine(candidate.tradition, 80),
          sourceBookTitle: oneLine(candidate.sourceBookTitle, 200),
        }
        break
      }
      if (attempt === 0) used.push(`${termZh}（${termEn}）`)
    }
    if (!pick) {
      const fallback = CURATED_FALLBACKS.find((item) => !usedSet.has(item.termEn.toLowerCase()))
      if (!fallback) throw new AppError('DAILY_EXHAUSTED', '暂时没有可推荐的新词，请先添加更多书目。', 409)
      pick = { ...fallback, why: '与你已经读过的哲学问题相邻，但尚未进入你的词谱。', tradition: '', sourceBookTitle: '' }
    }
    const bookTitle = listBooks().find((book) => normalizeTitle(book.title) === normalizeTitle(pick.sourceBookTitle))?.title
      || listBooks()[0]?.title
      || '你的阅读谱系'
    const enriched = await enrichTerm(
      { title: bookTitle, author: '', field: pick.tradition },
      pick,
    )
    const record = {
      date: today(),
      termEn: enriched.termEn,
      termZh: enriched.termZh,
      definition: enriched.definition,
      inBook: enriched.inBook,
      tradition: enriched.tradition,
      keywords: enriched.keywords,
      mentions: enriched.mentions || [],
      related: enriched.related || [],
      reason: pick.why,
      sourceBook: bookTitle,
      sepSlug: pick.sepSlug,
      sepUrl: enriched.sepUrl,
      sepTitle: enriched.sepTitle,
      sourceStatus: enriched.sourceStatus,
      createdAt: now(),
    }
    await daily.put(record.date, record)
    return record
  }

  async function ensureDaily() {
    const existing = daily.get(today())
    if (existing) return existing
    if (dailyJob) return dailyJob
    dailyJob = generateDaily().finally(() => {
      dailyJob = null
    })
    return dailyJob
  }

  async function handle(req, res) {
    const url = new URL(req.url || '/', 'http://localhost')
    const path = url.pathname
    if (!path.startsWith(API_BASE)) {
      sendJson(res, 404, { ok: false, error: { code: 'NOT_FOUND', message: 'Not found.' } })
      return
    }

    if (req.method !== 'GET') {
      const origin = req.headers.origin
      if (origin && origin !== ctx.webServer.getOrigin()) {
        sendJson(res, 403, { ok: false, error: { code: 'BAD_ORIGIN', message: '跨站请求被拒绝。' } })
        return
      }
    }

    try {
      if (req.method === 'GET' && path === `${API_BASE}/state`) {
        sendJson(res, 200, { ok: true, state: buildState() })
        return
      }

      if (req.method === 'POST' && path === `${API_BASE}/analyze`) {
        const body = await readJson(req)
        const result = await analyze(body.title, body.author)
        sendJson(res, 200, { ok: true, ...result, state: buildState() })
        return
      }

      if (req.method === 'POST' && path === `${API_BASE}/rate`) {
        const body = await readJson(req)
        const termId = oneLine(body.termId, 80)
        const rating = oneLine(body.rating, 40)
        if (!RATINGS.has(rating)) throw new AppError('BAD_RATING', '评价必须是 interested、neutral 或 not-interested。')
        const term = getTerm(termId)
        if (!term) throw new AppError('NOT_FOUND', '找不到这个词。', 404)
        await terms.update(termId, (current) => ({ ...current, rating, updatedAt: now() }))
        sendJson(res, 200, { ok: true, state: buildState() })
        return
      }

      if (req.method === 'POST' && path === `${API_BASE}/mentions`) {
        const body = await readJson(req)
        const termId = oneLine(body.termId, 80)
        const term = getTerm(termId)
        if (!term) throw new AppError('NOT_FOUND', '找不到这个词。', 404)
        await enrichTermMentions(term)
        sendJson(res, 200, { ok: true, state: buildState() })
        return
      }

      if (req.method === 'POST' && path === `${API_BASE}/concept`) {
        const body = await readJson(req)
        const sourceTerm = body.sourceTermId ? getTerm(oneLine(body.sourceTermId, 80)) : null
        const sourceBook = sourceTerm ? getBook(sourceTerm.bookId) : null
        const result = await queryConcept({
          termZh: oneLine(body.termZh, 80),
          termEn: oneLine(body.termEn, 120),
          sepSlug: oneLine(body.sepSlug, 120),
          context: {
            termZh: sourceTerm?.termZh || '',
            termEn: sourceTerm?.termEn || '',
            bookTitle: sourceBook?.title || oneLine(body.bookTitle, 200),
          },
          refresh: body.refresh === true,
          remap: body.remap === true,
        })
        sendJson(res, 200, { ok: true, ...result })
        return
      }

      if (req.method === 'POST' && path === `${API_BASE}/daily`) {
        await ensureDaily()
        sendJson(res, 200, { ok: true, state: buildState() })
        return
      }

      if (req.method === 'DELETE' && path.startsWith(`${API_BASE}/books/`)) {
        const id = decodeURIComponent(path.slice(`${API_BASE}/books/`.length))
        const removed = await deleteBook(id)
        if (!removed) throw new AppError('NOT_FOUND', '找不到这本书。', 404)
        sendJson(res, 200, { ok: true, state: buildState() })
        return
      }

      sendJson(res, 404, { ok: false, error: { code: 'NOT_FOUND', message: 'Not found.' } })
    } catch (error) {
      const appError = error instanceof AppError
        ? error
        : new AppError('INTERNAL', '处理请求时发生错误。', 500)
      if (!(error instanceof AppError)) {
        ctx.logger.error(`philosophy-terms: ${error?.stack || String(error)}`)
      }
      sendJson(res, appError.status, {
        ok: false,
        error: { code: appError.code, message: appError.message },
      })
    }
  }

  ctx.effect(() => ctx.webServer.register({
    kind: 'prefix',
    path: API_BASE,
    handler: handle,
  }))
}
