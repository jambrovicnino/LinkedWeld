import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ROUTES } from '@/router/routes';
import {
  Flame, ArrowRight, FolderKanban, Users, Receipt, BarChart3,
  Shield, Clock, CheckCircle, Star, Zap, Globe,
} from 'lucide-react';

const FEATURES = [
  {
    icon: Users,
    title: 'Worker Management',
    desc: 'Track TRC expirations, welding certificates, and employment documents for every worker in one place.',
    color: 'bg-blue-50 text-blue-500',
  },
  {
    icon: FolderKanban,
    title: 'Project Cost Control',
    desc: 'Budget breakdown per project — labor, transport, accommodation, tools — with real-time tracking.',
    color: 'bg-cyan-50 text-cyan-500',
  },
  {
    icon: Receipt,
    title: 'Expense Management',
    desc: 'Track all costs by project and worker. Recurring expenses, per diem, fuel, and permits in one view.',
    color: 'bg-sky-50 text-sky-500',
  },
  {
    icon: BarChart3,
    title: 'Recruitment Pipeline',
    desc: 'From first contact to visa approval — track candidates, collect documents, and manage the hiring flow.',
    color: 'bg-indigo-50 text-indigo-500',
  },
];

const STATS = [
  { value: '200+', label: 'Workers Managed' },
  { value: '50+', label: 'EU Projects' },
  { value: '15+', label: 'Countries' },
  { value: '100%', label: 'TRC Compliance' },
];

const PRICING = [
  {
    name: 'Free',
    price: '\u20AC0',
    period: '/month',
    desc: 'For individual welders getting started',
    features: ['1 active project', 'Basic profile', 'Time tracking', 'Mobile check-in'],
    cta: 'Get Started',
    popular: false,
  },
  {
    name: 'Pro',
    price: '\u20AC50',
    period: '/month',
    desc: 'For small welding teams',
    features: ['10 active projects', 'Team management (up to 15)', 'Expense tracking', 'Document storage', 'Basic reports'],
    cta: 'Start Free Trial',
    popular: false,
  },
  {
    name: 'Business',
    price: '\u20AC200',
    period: '/month',
    desc: 'For growing subcontractors',
    features: ['Unlimited projects', 'Unlimited team members', 'Advanced analytics', 'Client portal', 'Priority support', 'Custom branding'],
    cta: 'Start Free Trial',
    popular: true,
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    period: '',
    desc: 'For large operations',
    features: ['Everything in Business', 'Dedicated account manager', 'API access', 'SSO & compliance', 'On-premise option', 'SLA guarantee'],
    cta: 'Contact Sales',
    popular: false,
  },
];

export function LandingPage() {
  return (
    <div className='min-h-screen bg-white text-gray-800'>
      {/* Nav */}
      <header className='fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100'>
        <div className='max-w-7xl mx-auto flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8'>
          <Link to='/' className='flex items-center gap-2'>
            <div className='h-9 w-9 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center'>
              <Flame className='h-5 w-5 text-white' />
            </div>
            <span className='text-xl font-bold text-gray-800'>LinkedWeld</span>
          </Link>
          <nav className='hidden md:flex items-center gap-8'>
            <a href='#features' className='text-sm text-gray-500 hover:text-blue-500 transition-colors'>Features</a>
            <a href='#pricing' className='text-sm text-gray-500 hover:text-blue-500 transition-colors'>Pricing</a>
            <a href='#about' className='text-sm text-gray-500 hover:text-blue-500 transition-colors'>About</a>
          </nav>
          <div className='flex items-center gap-3'>
            <Link to={ROUTES.LOGIN}>
              <Button variant='ghost' className='text-gray-600 hover:text-blue-500'>Sign In</Button>
            </Link>
            <Link to={ROUTES.REGISTER}>
              <Button className='gap-2 bg-blue-500 hover:bg-blue-600 text-white'>
                Get Started <ArrowRight className='h-4 w-4' />
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className='relative pt-32 pb-20 sm:pt-40 sm:pb-28 bg-gradient-to-b from-blue-50 to-white'>
        <div className='absolute inset-0 overflow-hidden'>
          <div className='absolute top-1/4 left-1/4 w-96 h-96 bg-blue-100/50 rounded-full blur-3xl' />
          <div className='absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-100/50 rounded-full blur-3xl' />
        </div>
        <div className='relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center'>
          <div className='inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 border border-blue-100 text-blue-600 text-sm mb-8'>
            <Zap className='h-4 w-4' />
            <span>Built for welding subcontractors managing foreign workers in the EU</span>
          </div>
          <h1 className='text-4xl sm:text-5xl lg:text-7xl font-bold tracking-tight text-gray-900'>
            Your welding crew,{' '}
            <span className='text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-cyan-500'>
              fully managed.
            </span>
          </h1>
          <p className='mt-6 text-lg sm:text-xl text-gray-500 max-w-2xl mx-auto leading-relaxed'>
            TRC tracking, document vault, project budgets, expense control, and recruitment pipeline — everything a welding subcontractor needs in one tool.
          </p>
          <div className='mt-10 flex flex-col sm:flex-row items-center justify-center gap-4'>
            <Link to={ROUTES.REGISTER}>
              <Button size='lg' className='gap-2 text-lg px-8 py-6 bg-blue-500 hover:bg-blue-600 text-white shadow-lg shadow-blue-500/25'>
                Start for Free <ArrowRight className='h-5 w-5' />
              </Button>
            </Link>
            <a href='#features'>
              <Button size='lg' variant='outline' className='text-lg px-8 py-6 border-gray-200 text-gray-600 hover:text-blue-500 hover:border-blue-200 hover:bg-blue-50'>
                See Features
              </Button>
            </a>
          </div>
        </div>
      </section>

      {/* Stats bar */}
      <section className='border-y border-gray-100 bg-gray-50'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12'>
          <div className='grid grid-cols-2 lg:grid-cols-4 gap-8'>
            {STATS.map((s) => (
              <div key={s.label} className='text-center'>
                <p className='text-3xl sm:text-4xl font-bold text-blue-500'>{s.value}</p>
                <p className='text-sm text-gray-500 mt-1'>{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id='features' className='py-20 sm:py-28'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='text-center mb-16'>
            <h2 className='text-3xl sm:text-4xl font-bold text-gray-900'>Everything you need to run your welding business</h2>
            <p className='mt-4 text-gray-500 max-w-2xl mx-auto'>
              From small teams to enterprise operations — LinkedWeld scales with you.
            </p>
          </div>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
            {FEATURES.map((f) => (
              <div
                key={f.title}
                className='group p-8 rounded-2xl bg-white border border-gray-100 hover:border-blue-200 hover:shadow-lg hover:shadow-blue-500/5 transition-all duration-300'
              >
                <div className={`h-12 w-12 rounded-xl ${f.color} flex items-center justify-center mb-4`}>
                  <f.icon className='h-6 w-6' />
                </div>
                <h3 className='text-xl font-semibold text-gray-800 mb-2'>{f.title}</h3>
                <p className='text-gray-500 leading-relaxed'>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust / Social proof */}
      <section id='about' className='py-20 border-y border-gray-100 bg-gray-50'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center'>
          <h2 className='text-3xl sm:text-4xl font-bold text-gray-900 mb-6'>Built for the real challenges of welding subcontractors</h2>
          <p className='text-gray-500 max-w-2xl mx-auto mb-12'>
            Managing foreign workers across EU countries means tracking TRCs, welding certs, A1 forms, and project budgets — we handle all of it.
          </p>
          <div className='grid grid-cols-1 sm:grid-cols-3 gap-8'>
            <div className='p-6 rounded-xl bg-white border border-gray-100 shadow-sm'>
              <div className='h-12 w-12 rounded-xl bg-blue-50 flex items-center justify-center mx-auto mb-3'>
                <Globe className='h-6 w-6 text-blue-500' />
              </div>
              <h4 className='font-semibold text-lg text-gray-800 mb-1'>Multi-Country TRC</h4>
              <p className='text-sm text-gray-500'>Track temporary residence cards across EU countries with automatic expiry alerts.</p>
            </div>
            <div className='p-6 rounded-xl bg-white border border-gray-100 shadow-sm'>
              <div className='h-12 w-12 rounded-xl bg-cyan-50 flex items-center justify-center mx-auto mb-3'>
                <Shield className='h-6 w-6 text-cyan-500' />
              </div>
              <h4 className='font-semibold text-lg text-gray-800 mb-1'>Document Vault</h4>
              <p className='text-sm text-gray-500'>Passports, welding certs, employment contracts, A1 forms — all organized per worker.</p>
            </div>
            <div className='p-6 rounded-xl bg-white border border-gray-100 shadow-sm'>
              <div className='h-12 w-12 rounded-xl bg-sky-50 flex items-center justify-center mx-auto mb-3'>
                <Clock className='h-6 w-6 text-sky-500' />
              </div>
              <h4 className='font-semibold text-lg text-gray-800 mb-1'>Expiry Alerts</h4>
              <p className='text-sm text-gray-500'>Never miss a TRC renewal or cert expiration again. Get notified 90, 30, and 7 days before.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id='pricing' className='py-20 sm:py-28'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='text-center mb-16'>
            <h2 className='text-3xl sm:text-4xl font-bold text-gray-900'>Simple, transparent pricing</h2>
            <p className='mt-4 text-gray-500'>Start free. Upgrade as you grow.</p>
          </div>
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
            {PRICING.map((plan) => (
              <div
                key={plan.name}
                className={`relative p-8 rounded-2xl border transition-all duration-300 ${
                  plan.popular
                    ? 'bg-blue-50 border-blue-200 scale-[1.02] shadow-lg shadow-blue-500/10'
                    : 'bg-white border-gray-100 hover:border-blue-200 hover:shadow-md'
                }`}
              >
                {plan.popular && (
                  <div className='absolute -top-3 left-1/2 -translate-x-1/2'>
                    <span className='inline-flex items-center gap-1 px-3 py-1 rounded-full bg-blue-500 text-white text-xs font-medium'>
                      <Star className='h-3 w-3' /> Most Popular
                    </span>
                  </div>
                )}
                <h3 className='text-lg font-semibold text-gray-800'>{plan.name}</h3>
                <div className='mt-4 flex items-baseline gap-1'>
                  <span className='text-4xl font-bold text-gray-900'>{plan.price}</span>
                  {plan.period && <span className='text-gray-400'>{plan.period}</span>}
                </div>
                <p className='mt-2 text-sm text-gray-500'>{plan.desc}</p>
                <ul className='mt-6 space-y-3'>
                  {plan.features.map((f) => (
                    <li key={f} className='flex items-start gap-2 text-sm'>
                      <CheckCircle className='h-4 w-4 text-blue-500 mt-0.5 shrink-0' />
                      <span className='text-gray-600'>{f}</span>
                    </li>
                  ))}
                </ul>
                <Link to={ROUTES.REGISTER} className='block mt-8'>
                  <Button
                    className={`w-full ${
                      plan.popular
                        ? 'bg-blue-500 hover:bg-blue-600 text-white'
                        : 'bg-white border border-gray-200 text-gray-700 hover:bg-blue-50 hover:border-blue-200 hover:text-blue-600'
                    }`}
                  >
                    {plan.cta}
                  </Button>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className='border-t border-gray-100 py-12 bg-gray-50'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='flex flex-col md:flex-row items-center justify-between gap-6'>
            <div className='flex items-center gap-2'>
              <div className='h-8 w-8 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center'>
                <Flame className='h-4 w-4 text-white' />
              </div>
              <span className='font-bold text-lg text-gray-800'>LinkedWeld</span>
            </div>
            <p className='text-sm text-gray-400'>
              &copy; {new Date().getFullYear()} LinkedWeld. Built for the welding industry.
            </p>
            <div className='flex items-center gap-6 text-sm text-gray-400'>
              <a href='#' className='hover:text-blue-500 transition-colors'>Privacy</a>
              <a href='#' className='hover:text-blue-500 transition-colors'>Terms</a>
              <a href='#' className='hover:text-blue-500 transition-colors'>Contact</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
