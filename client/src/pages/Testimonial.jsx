import React from 'react'
// Using a custom vertical marquee since react-fast-marquee is horizontal-only

// 20 cards of donor/patient stories for a blood donation platform
const CARDS = [
  { name: 'Joey W.', role: 'Donor', quote: 'Booked a nearby camp and donated O+. Smooth and welcoming staff.' },
  { name: 'Amanda S.', role: 'Patient', quote: 'We needed A-. Three donors responded within an hour. Absolute lifesavers.' },
  { name: 'Brendan M.', role: 'Donor', quote: 'The app reminded me when I became eligible again. Donated the same day.' },
  { name: 'Sonia K.', role: 'Patient', quote: 'Emergency request for O-. Verified donors reached us quickly and safely.' },
  { name: 'Kramer P.', role: 'Donor', quote: 'Set my location and matched with requests that truly needed my type.' },
  { name: 'Alex N.', role: 'Patient', quote: 'Coordinating with donors was easy using in-app chat and status updates.' },
  { name: 'Mark G.', role: 'Donor', quote: 'Eligibility checklist made me confident about donating regularly.' },
  { name: 'Avery N.', role: 'Patient', quote: 'Found a B+ donor near our hospital. Process was fast and transparent.' },
  { name: 'Neha V.', role: 'Patient', quote: 'The verification built trust. We received AB+ in time for surgery.' },
  { name: 'Rohan S.', role: 'Donor', quote: 'I love the reminders and badges. Keeps me motivated to help.' },
  { name: 'Priya D.', role: 'Patient', quote: 'Postpartum transfusion needed O+. Help arrived in minutes.' },
  { name: 'Kabir T.', role: 'Donor', quote: 'Booked, donated, recovered — all under 30 minutes. Great flow.' },
  { name: 'Ishita L.', role: 'Patient', quote: 'Simple request form; we quickly found two matching B- donors.' },
  { name: 'Vikram H.', role: 'Donor', quote: 'Filters by blood type and distance are super useful.' },
  { name: 'Simran G.', role: 'Patient', quote: 'Volunteers were kind and punctual. Couldn’t be more grateful.' },
  { name: 'Devansh C.', role: 'Donor', quote: 'Paired with a thalassemia patient for regular donations.' },
  { name: 'Fatima N.', role: 'Patient', quote: 'Guided steps helped us coordinate smoothly with the hospital.' },
  { name: 'Harsh V.', role: 'Donor', quote: 'Clear hydration/rest tips. Donation center staff was amazing.' },
  { name: 'Nisha P.', role: 'Patient', quote: 'Five B- volunteers responded within 30 minutes. Incredible community.' },
  { name: 'Yash M.', role: 'Donor', quote: 'Cause-based milestones make helping others feel even better.' }
]

const initialsOf = (fullName) => fullName.split(' ').map(p => p[0]).slice(0, 2).join('').toUpperCase()

const Card = ({ name, role, quote }) => (
  <div className="w-72 bg-white rounded-3xl shadow-sm ring-1 ring-gray-200 p-6 backdrop-blur-sm">
    <div className="flex items-center gap-3 mb-4">
      <div className="h-11 w-11 rounded-full bg-[#EEFFD6] text-[#68F432] flex items-center justify-center font-semibold">
        {initialsOf(name)}
      </div>
      <div>
        <p className="text-sm font-semibold text-gray-900">{name}</p>
        <p className="text-xs text-gray-500">{role}</p>
      </div>
    </div>
    <p className="text-[15px] leading-6 text-gray-700">{quote}</p>
  </div>
)

// Split into 4 columns and slightly vary lengths so the loops don’t sync
const toColumns = (arr, count) => {
  const cols = Array.from({ length: count }, () => [])
  arr.forEach((item, i) => cols[i % count].push(item))
  return cols.map((c, i) => (i % 2 === 0 ? [...c, ...c.slice(0, 4)] : [...c, ...c.slice(0, 2)]))
}

// Vertical marquee using rotate trick (react-fast-marquee is horizontal only)
const VerticalMarquee = ({ children, reverse = false, speed = 30, className = '' }) => {
  // speed controls duration; higher speed value → faster → shorter duration
  const duration = Math.max(8, Math.round(60 - speed))
  const animationName = reverse ? 'scroll-down' : 'scroll-up'
  const [isPaused, setIsPaused] = React.useState(false)
  return (
    <div
      className={`relative h-[680px] overflow-hidden ${className} marquee`}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div
        className="absolute inset-0 flex flex-col gap-5 marquee-content"
        style={{
          animation: `${animationName} ${duration}s linear infinite`,
          animationPlayState: isPaused ? 'paused' : 'running'
        }}
      >
        {children}
        {children}
      </div>
      <div className="pointer-events-none absolute inset-x-0 top-0 h-16 z-10 bg-gradient-to-b from-white to-transparent" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 z-10 bg-gradient-to-t from-white to-transparent" />
    </div>
  )
}

const Testimonial = () => {
  const cols = toColumns(CARDS, 4)

  return (
    <section className="w-full pb-16 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-5">
        <div className="text-center">
          <h2 className="text-7xl font-bold tracking-tight text-gray-900 font-[Alice]">What our community says</h2>
          <p className="mt-4 text-lg text-gray-600">Real stories of requesting and donating blood.</p>
        </div>

        <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <VerticalMarquee speed={34}>
            {cols[0].map((c, i) => (<Card key={`c0-${i}`} {...c} />))}
          </VerticalMarquee>
          <VerticalMarquee reverse speed={28} className="pt-10">
            {cols[1].map((c, i) => (<Card key={`c1-${i}`} {...c} />))}
          </VerticalMarquee>
          <VerticalMarquee speed={36} className="pt-20">
            {cols[2].map((c, i) => (<Card key={`c2-${i}`} {...c} />))}
          </VerticalMarquee>
          <VerticalMarquee reverse speed={30} className="pt-6">
            {cols[3].map((c, i) => (<Card key={`c3-${i}`} {...c} />))}
          </VerticalMarquee>
        </div>
      </div>
      {/* local utility to hide any scrollbars from the rotated marquee containers */}
      <style>{`
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        .hide-scrollbar::-webkit-scrollbar { display: none; }
      `}</style>
      {/* local keyframes for smooth vertical marquee and pause-on-hover */}
      <style>{`
        @keyframes scroll-up { 0% { transform: translateY(0); } 100% { transform: translateY(-50%); } }
        @keyframes scroll-down { 0% { transform: translateY(-50%); } 100% { transform: translateY(0); } }
        .marquee-content { will-change: transform; }
        /* CSS fallback pause (JS also handles pause) */
        .marquee:hover .marquee-content, .marquee .marquee-content:hover { animation-play-state: paused !important; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        .hide-scrollbar::-webkit-scrollbar { display: none; }
      `}</style>
    </section>
  )
}

export default Testimonial


