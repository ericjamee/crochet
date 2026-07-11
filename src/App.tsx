import { FormEvent, ReactNode, useMemo, useState } from 'react';

type WaitlistAudience = 'Me' | 'Gift' | 'Child or teen' | 'Not sure';
type WaitlistEntry = {
  firstName: string;
  email: string;
  audience: WaitlistAudience;
  createdAt: string;
};

type ButtonProps = {
  children: ReactNode;
  href?: string;
  variant?: 'primary' | 'secondary';
  className?: string;
};

type SectionProps = {
  eyebrow?: string;
  title: string;
  copy?: string;
  id?: string;
  children: ReactNode;
};

type CardProps = {
  title: string;
  children: ReactNode;
  accent?: string;
};

type PricingTier = {
  name: string;
  price: string;
  description: string;
  features: string[];
  cta: string;
  featured?: boolean;
};

const howItWorks = [
  {
    title: 'Pick your plan',
    body: 'Choose a simple monthly kit for yourself or a giftable option with a few extra treats.',
  },
  {
    title: 'Get your kit in the mail',
    body: 'A tiny package arrives with yarn, printed guidance, and the bits you need for the month.',
  },
  {
    title: 'Crochet something tiny and cute',
    body: 'Finish an adorable project without getting buried in a giant blanket-sized commitment.',
  },
];

const kitContents = [
  'Pre-measured yarn',
  'Beginner-friendly printed pattern',
  'Mini crochet hook when needed',
  'Simple step-by-step instructions',
  'Optional video tutorial QR code',
  'Cute monthly project',
];

const audiences = [
  'Total beginners',
  'Teens and adults',
  'Cozy hobby lovers',
  'Gift subscriptions',
  'People who want small, finishable projects',
];

const faqs = [
  {
    question: 'Do I need to know how to crochet?',
    answer: 'No. Kits are designed to be beginner-friendly.',
  },
  {
    question: 'Is a crochet hook included?',
    answer:
      'Hooks are included in Deluxe kits and when needed. Starter kits may assume you already have a basic hook.',
  },
  {
    question: 'What age is this for?',
    answer: 'Best for teens and adults; younger kids may need help from an adult.',
  },
  {
    question: 'Can I give it as a gift?',
    answer: 'Yes, it is designed to be giftable.',
  },
  {
    question: 'When will the first kits ship?',
    answer: 'We’re preparing our first batch now. Join the waitlist to get first access.',
  },
  {
    question: 'Can I cancel anytime?',
    answer: 'Yes, subscriptions will be cancelable anytime once subscriptions are live.',
  },
];

const pricingTiers: PricingTier[] = [
  {
    name: 'Starter Kit',
    price: '$15/month',
    description: 'A simple, cheerful monthly project for new crocheters.',
    features: ['One tiny crochet project', 'Yarn included', 'Printed pattern', 'Great for beginners'],
    cta: 'Join waitlist',
  },
  {
    name: 'Deluxe Kit',
    price: '$20/month',
    description: 'A giftable version with helpful extras tucked inside.',
    features: [
      'Everything in Starter',
      'Hook included when needed',
      'Bonus embellishment or extra color',
      'Best gift option',
    ],
    cta: 'Join waitlist',
    featured: true,
  },
  {
    name: 'Founding Member',
    price: '$12/month',
    description: 'An early-bird spot for the first makers joining the club.',
    features: [
      'Limited early-bird price',
      'Help shape future kits',
      'Locked-in discount while subscribed',
    ],
    cta: 'Claim early-bird spot',
  },
];

const configuredApiBaseUrl = (import.meta.env.VITE_API_BASE_URL as string | undefined)?.replace(/\/$/, '');
const hostedApiFallbackUrl = 'https://crochet-mail-club-api.onrender.com';

function isHostedFrontend(hostname: string) {
  return hostname.endsWith('.vercel.app');
}

function getApiBaseUrl() {
  if (configuredApiBaseUrl) {
    return configuredApiBaseUrl;
  }

  if (typeof window !== 'undefined') {
    return isHostedFrontend(window.location.hostname) ? hostedApiFallbackUrl : '';
  }

  return '';
}

function storeWaitlistEntry(entry: WaitlistEntry) {
  try {
    const existing = localStorage.getItem('crochet-mail-club-waitlist');
    const parsed = existing ? (JSON.parse(existing) as WaitlistEntry[]) : [];
    localStorage.setItem('crochet-mail-club-waitlist', JSON.stringify([...parsed, entry]));
  } catch {
    // TODO: Replace local fallback storage after the backend is connected to durable waitlist storage.
  }
}

function App() {
  const apiBaseUrl = getApiBaseUrl();
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    email: '',
    audience: 'Me' as WaitlistAudience,
  });

  const year = useMemo(() => new Date().getFullYear(), []);

  const scrollToWaitlist = () => {
    document.getElementById('waitlist')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const entry: WaitlistEntry = {
      ...formData,
      createdAt: new Date().toISOString(),
    };

    setIsSubmitting(true);

    try {
      if (apiBaseUrl) {
        const response = await fetch(`${apiBaseUrl}/api/waitlist`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            firstName: entry.firstName,
            email: entry.email,
            audience: entry.audience,
          }),
        });

        if (!response.ok && response.status !== 409) {
          throw new Error('Waitlist request failed.');
        }
      } else {
        storeWaitlistEntry(entry);
      }
    } catch {
      storeWaitlistEntry(entry);
    }

    // TODO: Connect Stripe checkout once subscriptions are ready to launch.
    setSubmitted(true);
    setFormData({
      firstName: '',
      email: '',
      audience: 'Me',
    });
    setIsSubmitting(false);
  };

  return (
    <div className="overflow-x-hidden">
      <header className="section-shell pt-6 sm:pt-8">
        <div className="flex items-center justify-between gap-3 rounded-full border border-bark/10 bg-white/70 px-4 py-3 shadow-sm backdrop-blur sm:px-5">
          <div>
            <p className="font-display text-xl text-bark">Crochet Mail Club</p>
            <p className="text-sm text-bark/60">Tiny crochet projects by mail.</p>
          </div>
          <button
            type="button"
            onClick={scrollToWaitlist}
            className="rounded-full bg-clay px-4 py-2 text-center text-xs font-bold text-white transition hover:bg-clay/90 sm:px-5 sm:py-2.5 sm:text-sm"
          >
            Join the waitlist
          </button>
        </div>
      </header>

      <main>
        <section className="section-shell grid gap-10 pb-20 pt-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:pb-24 lg:pt-16">
          <div>
            <p className="inline-flex rounded-full border border-clay/20 bg-white/80 px-4 py-2 text-sm font-bold uppercase tracking-[0.18em] text-clay shadow-sm">
              Cozy craft mail
            </p>
            <h1 className="mt-6 max-w-xl font-display text-4xl leading-tight text-bark sm:text-5xl lg:text-6xl">
              Tiny crochet kits, delivered by mail.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-bark/75 sm:text-xl">
              Each month, get a beginner-friendly crochet project with yarn, simple instructions,
              and everything you need to make something adorable.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button href="#waitlist">Join the waitlist</Button>
              <Button href="#how-it-works" variant="secondary">
                See how it works
              </Button>
            </div>
            <div className="mt-8 flex flex-wrap gap-3 text-sm text-bark/65">
              <Badge>Beginner-friendly</Badge>
              <Badge>Giftable</Badge>
              <Badge>Finishable in a cozy weekend</Badge>
            </div>
          </div>

          <div className="relative">
            <div className="absolute -left-4 top-10 h-24 w-24 rounded-full bg-honey/25 blur-2xl" />
            <div className="absolute -right-8 top-0 h-32 w-32 rounded-full bg-blush/40 blur-3xl" />
            <div className="relative animate-bob rounded-[2rem] border border-white/80 bg-white/80 p-5 shadow-float backdrop-blur">
              <div className="rounded-[1.75rem] bg-oat p-4 sm:p-6">
                <div className="rounded-[1.5rem] border-2 border-dashed border-bark/15 bg-cream p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="rounded-[1.5rem] bg-white px-4 py-3 shadow-card">
                      <div className="relative h-28 w-36 rounded-[1.25rem] bg-[#fff8ef]">
                        <div className="absolute left-3 right-3 top-3 h-16 rounded-xl border-2 border-bark/15 bg-oat" />
                        <div className="absolute left-3 right-3 top-3 h-16 border-t-[26px] border-l-[55px] border-r-[55px] border-t-blush border-l-transparent border-r-transparent" />
                        <div className="absolute bottom-3 left-4 right-4 rounded-lg bg-white px-2 py-1 text-center text-[10px] font-bold uppercase tracking-[0.2em] text-clay">
                          Happy mail
                        </div>
                      </div>
                    </div>

                    <div className="relative mt-2 h-28 w-28 shrink-0">
                      <div className="absolute inset-0 rounded-full border-[10px] border-honey bg-honey/25" />
                      <div className="absolute inset-[1.05rem] rounded-full border-[10px] border-bark bg-bark/90" />
                      <div className="absolute inset-0">
                        {[0, 1, 2, 3, 4, 5, 6, 7].map((petal) => (
                          <span
                            key={petal}
                            className="absolute left-1/2 top-1/2 h-7 w-11 -translate-x-1/2 -translate-y-[3.4rem] rounded-full bg-honey shadow-sm"
                            style={{ transform: `translate(-50%, -3.4rem) rotate(${petal * 45}deg)` }}
                          />
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="mt-5 grid grid-cols-[1fr_auto] gap-4">
                    <div className="rounded-[1.5rem] bg-white p-4 shadow-card">
                      <div className="flex items-end gap-3">
                        <div className="h-14 w-14 rounded-full border-[10px] border-moss bg-transparent" />
                        <div className="mb-2 h-1 w-16 rounded-full bg-moss" />
                      </div>
                      <div className="mt-4 flex gap-3">
                        <span className="h-5 w-5 rounded-full bg-honey" />
                        <span className="h-5 w-5 rounded-full bg-clay" />
                        <span className="h-5 w-5 rounded-full bg-moss" />
                      </div>
                    </div>

                    <div className="flex flex-col items-center gap-3">
                      <div className="h-28 w-5 rounded-full bg-gradient-to-b from-[#d8ab6f] to-[#b27a38]" />
                      <div className="h-14 w-14 rounded-full border-4 border-clay/40 border-t-transparent border-l-transparent" />
                    </div>
                  </div>

                  <p className="mt-5 rounded-2xl bg-white/90 px-4 py-3 text-sm leading-6 text-bark/70 shadow-sm">
                    Month 1 peeks out with a tiny sunflower, warm yarn, and a sweet little envelope
                    of instructions.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <Section
          id="how-it-works"
          eyebrow="How it works"
          title="A tiny monthly ritual that actually feels doable."
          copy="Crochet Mail Club is built for cozy momentum: a small project, a friendly plan, and a happy bit of mail to look forward to."
        >
          <div className="grid gap-5 md:grid-cols-3">
            {howItWorks.map((step, index) => (
              <Card key={step.title} title={step.title} accent={['bg-honey/40', 'bg-blush/50', 'bg-moss/30'][index]}>
                <p className="text-bark/75">{step.body}</p>
              </Card>
            ))}
          </div>
        </Section>

        <Section
          eyebrow="Inside the kit"
          title="Everything you need, without the overwhelming pile."
          copy="Each kit keeps the materials simple, tidy, and beginner-friendly so you can start with confidence and finish with something adorable."
        >
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {kitContents.map((item) => (
              <div
                key={item}
                className="flex items-center gap-3 rounded-3xl border border-white/80 bg-white/85 px-5 py-4 shadow-card"
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-honey/25 text-lg">
                  yarn
                </span>
                <p className="font-semibold text-bark">{item}</p>
              </div>
            ))}
          </div>
        </Section>

        <Section
          eyebrow="First kit preview"
          title="Month 1: Tiny Sunflower Kit"
          copy="A cheerful beginner project with yellow, brown, and green yarn, simple instructions, and a cute finished sunflower you can keep, gift, or attach to a bag."
        >
          <div className="grid gap-6 rounded-[2rem] border border-bark/10 bg-white/80 p-6 shadow-float backdrop-blur lg:grid-cols-[1fr_1.1fr] lg:p-8">
            <div className="rounded-[1.75rem] bg-oat p-5">
              <div className="grid h-full place-items-center rounded-[1.5rem] bg-cream bg-stitches bg-[length:16px_16px] p-6">
                <div className="relative h-56 w-56">
                  {[0, 1, 2, 3, 4, 5, 6, 7].map((petal) => (
                    <span
                      key={petal}
                      className="absolute left-1/2 top-1/2 h-14 w-24 -translate-x-1/2 -translate-y-[5.1rem] rounded-full bg-honey shadow-md"
                      style={{ transform: `translate(-50%, -5.1rem) rotate(${petal * 45}deg)` }}
                    />
                  ))}
                  <div className="absolute left-1/2 top-1/2 h-28 w-28 -translate-x-1/2 -translate-y-1/2 rounded-full bg-bark ring-8 ring-[#6f513c]" />
                  <div className="absolute left-1/2 top-[68%] h-24 w-3 -translate-x-1/2 rounded-full bg-moss" />
                  <div className="absolute left-[38%] top-[74%] h-10 w-16 rounded-full bg-moss/90" />
                  <div className="absolute left-[50%] top-[76%] h-10 w-16 rounded-full bg-moss/80" />
                </div>
              </div>
            </div>

            <div className="flex flex-col justify-center">
              <p className="text-sm font-bold uppercase tracking-[0.2em] text-clay">Sunshine starter</p>
              <h3 className="mt-3 font-display text-3xl text-bark">A happy first finish for brand-new crocheters.</h3>
              <p className="mt-4 text-lg leading-8 text-bark/75">
                Soft yarn in sunflower shades, a tiny project scope, and simple instructions make
                this the kind of win you can actually finish and feel proud of.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Badge>Bag charm ready</Badge>
                <Badge>Giftable</Badge>
                <Badge>Weekend friendly</Badge>
              </div>
            </div>
          </div>
        </Section>

        <Section
          eyebrow="Pricing"
          title="Choose your cozy little plan."
          copy="All plans are designed around small, approachable projects, with room for extras if you want a more giftable experience."
        >
          <div className="grid gap-6 lg:grid-cols-3">
            {pricingTiers.map((tier) => (
              <div
                key={tier.name}
                className={`rounded-[2rem] border p-6 shadow-card transition hover:-translate-y-1 ${
                  tier.featured
                    ? 'border-clay/30 bg-[#fff7ef] shadow-float'
                    : 'border-white/80 bg-white/85'
                }`}
              >
                <p className="font-display text-2xl text-bark">{tier.name}</p>
                <p className="mt-4 text-4xl font-extrabold text-bark">{tier.price}</p>
                <p className="mt-3 min-h-14 text-bark/70">{tier.description}</p>
                <ul className="mt-6 space-y-3 text-bark/80">
                  {tier.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3">
                      <span className="mt-1 h-2.5 w-2.5 rounded-full bg-clay" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button href="#waitlist" className="mt-8 w-full justify-center">
                  {tier.cta}
                </Button>
              </div>
            ))}
          </div>
        </Section>

        <Section
          eyebrow="Why tiny projects?"
          title="Small projects make it easier to keep going."
          copy="Big crochet projects can feel overwhelming. Crochet Mail Club keeps it small, cute, and finishable so you actually complete something each month."
        >
          <div className="rounded-[2rem] border border-bark/10 bg-white/80 p-8 shadow-card">
            <p className="max-w-3xl text-lg leading-8 text-bark/75">
              You still get the cozy joy of making with your hands, but without a half-finished
              mountain of yarn staring at you from a basket for six months.
            </p>
          </div>
        </Section>

        <Section
          eyebrow="Who it’s for"
          title="Made for curious beginners and cozy gift-givers."
          copy="Whether you’re learning for yourself or mailing a sweet surprise, the club is designed to feel approachable, warm, and easy to enjoy."
        >
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
            {audiences.map((audience) => (
              <div
                key={audience}
                className="rounded-[1.75rem] border border-white/80 bg-white/90 p-5 text-center shadow-card"
              >
                <p className="font-semibold text-bark">{audience}</p>
              </div>
            ))}
          </div>
        </Section>

        <Section
          eyebrow="FAQ"
          title="Questions you might have before the first stitch."
        >
          <div className="grid gap-4 lg:grid-cols-2">
            {faqs.map((faq) => (
              <details
                key={faq.question}
                className="group rounded-[1.75rem] border border-white/80 bg-white/90 p-5 shadow-card"
              >
                <summary className="cursor-pointer list-none font-semibold text-bark">
                  <span>{faq.question}</span>
                </summary>
                <p className="mt-3 leading-7 text-bark/75">{faq.answer}</p>
              </details>
            ))}
          </div>
        </Section>

        <Section
          id="waitlist"
          eyebrow="Waitlist"
          title="Want the first kit?"
          copy="Join the waitlist and we’ll send you launch details, early-bird pricing, and a peek at the first tiny crochet project."
        >
          <div className="grid gap-6 rounded-[2rem] border border-clay/15 bg-[#fff7ef] p-6 shadow-float lg:grid-cols-[0.9fr_1.1fr] lg:p-8">
            <div>
              <p className="font-display text-3xl text-bark">Join the Crochet Mail Club waitlist</p>
              <p className="mt-4 text-lg leading-8 text-bark/75">
                Be first to hear when subscriptions open and when the tiny sunflower kit is ready
                to ship.
              </p>
              <div className="mt-6 space-y-3 text-bark/75">
                <p>Early-bird pricing updates</p>
                <p>Launch announcements</p>
                <p>First project sneak peeks</p>
              </div>
            </div>

            <div className="rounded-[1.75rem] bg-white p-5 shadow-card sm:p-6">
              {submitted ? (
                <div
                  className="rounded-[1.5rem] border border-moss/20 bg-moss/10 p-6"
                  aria-live="polite"
                >
                  <p className="font-display text-2xl text-bark">You’re on the list!</p>
                  <p className="mt-3 text-bark/75">We’ll send crochet goodness soon.</p>
                  <button
                    type="button"
                    onClick={() => setSubmitted(false)}
                    className="mt-5 rounded-full border border-bark/15 px-4 py-2 text-sm font-bold text-bark transition hover:bg-cream"
                  >
                    Add another email
                  </button>
                </div>
              ) : (
                <form className="space-y-5" onSubmit={handleSubmit}>
                  <div>
                    <label htmlFor="firstName" className="mb-2 block text-sm font-bold text-bark">
                      First name
                    </label>
                    <input
                      id="firstName"
                      name="firstName"
                      type="text"
                      autoComplete="given-name"
                      value={formData.firstName}
                      onChange={(event) =>
                        setFormData((current) => ({ ...current, firstName: event.target.value }))
                      }
                      className="w-full rounded-2xl border border-bark/15 bg-cream px-4 py-3 outline-none transition focus:border-clay focus:ring-4 focus:ring-clay/15"
                    />
                  </div>

                  <div>
                    <label htmlFor="email" className="mb-2 block text-sm font-bold text-bark">
                      Email
                    </label>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      required
                      value={formData.email}
                      onChange={(event) =>
                        setFormData((current) => ({ ...current, email: event.target.value }))
                      }
                      className="w-full rounded-2xl border border-bark/15 bg-cream px-4 py-3 outline-none transition focus:border-clay focus:ring-4 focus:ring-clay/15"
                    />
                  </div>

                  <div>
                    <label htmlFor="audience" className="mb-2 block text-sm font-bold text-bark">
                      Who is this for?
                    </label>
                    <select
                      id="audience"
                      name="audience"
                      value={formData.audience}
                      onChange={(event) =>
                        setFormData((current) => ({
                          ...current,
                          audience: event.target.value as WaitlistAudience,
                        }))
                      }
                      className="w-full rounded-2xl border border-bark/15 bg-cream px-4 py-3 outline-none transition focus:border-clay focus:ring-4 focus:ring-clay/15"
                    >
                      <option>Me</option>
                      <option>Gift</option>
                      <option>Child or teen</option>
                      <option>Not sure</option>
                    </select>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex w-full items-center justify-center rounded-full bg-clay px-6 py-3.5 text-base font-extrabold text-white transition hover:bg-clay/90 focus:outline-none focus:ring-4 focus:ring-clay/20"
                  >
                    {isSubmitting ? 'Joining...' : 'Join the Crochet Mail Club waitlist'}
                  </button>
                </form>
              )}
            </div>
          </div>
        </Section>
      </main>

      <footer className="section-shell pb-10 pt-6">
        <div className="flex flex-col gap-4 rounded-[1.75rem] border border-bark/10 bg-white/70 px-6 py-5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-display text-2xl text-bark">Crochet Mail Club</p>
            <p className="text-bark/65">Tiny crochet projects by mail.</p>
          </div>
          <div className="flex flex-wrap gap-5 text-sm font-semibold text-bark/70">
            <a href="/" onClick={(event) => event.preventDefault()} className="hover:text-clay">
              Privacy
            </a>
            <a href="/" onClick={(event) => event.preventDefault()} className="hover:text-clay">
              Terms
            </a>
            <a href="/" onClick={(event) => event.preventDefault()} className="hover:text-clay">
              Contact
            </a>
          </div>
        </div>
        <p className="mt-4 text-center text-xs text-bark/50">© {year} Crochet Mail Club</p>
      </footer>
    </div>
  );
}

function Button({ children, href = '#waitlist', variant = 'primary', className = '' }: ButtonProps) {
  const baseClasses =
    'inline-flex items-center rounded-full px-6 py-3.5 text-base font-extrabold transition focus:outline-none focus:ring-4';
  const styles =
    variant === 'primary'
      ? 'bg-clay text-white hover:bg-clay/90 focus:ring-clay/20'
      : 'border border-bark/15 bg-white/80 text-bark hover:bg-white focus:ring-bark/10';

  return (
    <a href={href} className={`${baseClasses} ${styles} ${className}`}>
      {children}
    </a>
  );
}

function Section({ eyebrow, title, copy, id, children }: SectionProps) {
  return (
    <section id={id} className="section-shell py-10 sm:py-14">
      <div className="mb-8 max-w-3xl">
        {eyebrow ? (
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-clay">{eyebrow}</p>
        ) : null}
        <h2 className="section-heading mt-3">{title}</h2>
        {copy ? <p className="section-copy">{copy}</p> : null}
      </div>
      {children}
    </section>
  );
}

function Card({ title, children, accent = 'bg-honey/30' }: CardProps) {
  return (
    <div className="rounded-[2rem] border border-white/80 bg-white/85 p-6 shadow-card">
      <div className={`mb-5 h-12 w-12 rounded-2xl ${accent}`} />
      <h3 className="font-display text-2xl text-bark">{title}</h3>
      <div className="mt-3 leading-7 text-bark/75">{children}</div>
    </div>
  );
}

function Badge({ children }: { children: ReactNode }) {
  return (
    <span className="rounded-full border border-bark/10 bg-white/80 px-4 py-2 font-semibold shadow-sm">
      {children}
    </span>
  );
}

export default App;
