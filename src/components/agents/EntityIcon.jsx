import {
  BookOpen, Briefcase, Calculator, ChartColumn, ClipboardCheck, Code, FileText, FlagTriangleRight, GitBranch, Globe,
  Image as ImageIcon, Languages, LifeBuoy, Puzzle, Search, ShieldAlert, ShieldCheck, SquareCheck, Target, Ticket, UserRound, Zap, Bot, Sparkles,
} from 'lucide-react'
import { cn } from '../../lib/utils'

const ICONS = {
  // agent / step kinds
  research: Search, sales: Briefcase, document: FileText, image: ImageIcon, review: ClipboardCheck, data: ChartColumn,
  coding: Code, translate: Languages, hr: UserRound, it: LifeBuoy, security: ShieldAlert, accounting: Calculator,
  skill: Puzzle, condition: GitBranch, trigger: Zap, output: FlagTriangleRight, agent: Bot, chat: Sparkles,
  // skill icons
  globe: Globe, book: BookOpen, file: FileText, check: SquareCheck, chart: ChartColumn, shield: ShieldCheck, target: Target,
  calculator: Calculator, ticket: Ticket, code2: Code,
}

export const iconFor = (key) => ICONS[key] ?? Bot

const SIZES = { sm: 'size-7 rounded-md [&>svg]:size-3.5', md: 'size-9 rounded-lg [&>svg]:size-[18px]', lg: 'size-12 rounded-xl [&>svg]:size-6' }
const TONES = {
  agent: 'bg-brand-50 text-brand-600 ring-1 ring-inset ring-brand-100',
  skill: 'bg-slate-100 text-slate-600 ring-1 ring-inset ring-slate-200',
  muted: 'bg-slate-50 text-slate-400 ring-1 ring-inset ring-slate-200',
}

/** Square icon tile. Agents use the brand tint, skills stay neutral so the two are distinguishable at a glance. */
export default function EntityIcon({ icon, size = 'md', tone = 'agent', className }) {
  const Icon = iconFor(icon)
  return (
    <span className={cn('inline-flex shrink-0 items-center justify-center', SIZES[size], TONES[tone], className)}>
      <Icon aria-hidden />
    </span>
  )
}
