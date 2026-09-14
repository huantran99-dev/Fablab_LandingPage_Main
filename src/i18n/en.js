/**
 * English content.
 *
 * Must mirror the exact shape of `vi.js` — components read by key path and
 * never hardcode copy. When you add a string here, add its counterpart there.
 *
 * Course `id` values are stable, untranslated identifiers used as React keys
 * and icon lookup keys, so they must match `vi.js` exactly.
 */
import { courseDetailsEn } from './courseDetails.en'
import { experienceDetailsEn } from './experienceDetails.en'

export const en = {
  nav: {
    brandTagline: 'Digital fabrication lab',
    /**
     * Two-level menu. An entry with `children` is a branch that opens a submenu
     * and has NO `href` — it is a toggle button, not a link, because neither
     * branch maps to a section of its own.
     *
     * Every `href` must point at an `id` that really exists in the DOM; four of
     * these anchors were created for this menu (the two course groups and the
     * two activity blocks).
     */
    links: [
      { id: 'about', label: 'About', href: '#about' },
      {
        id: 'fablab',
        label: 'FabLab',
        children: [
          { id: 'facilities', label: 'Facilities', href: '#facilities' },
          { id: 'competitions', label: 'Competitions', href: '#competitions' },
        ],
      },
      {
        id: 'stemlab',
        label: 'StemLab',
        children: [
          { id: 'courses-stem', label: 'STEM Courses', href: '#courses-stem' },
          {
            id: 'courses-experience',
            label: 'STEM Experience Programs',
            href: '#courses-experience',
          },
        ],
      },
      // Promoted out of the FabLab branch to the top level: it is the most
      // sought-after entry, so it should not sit behind an extra click. Still
      // targets the "Events & seminars" block inside the Activities section.
      { id: 'events', label: 'Events', href: '#events' },
    ],
    cta: 'Enroll now',
    openMenu: 'Open menu',
    closeMenu: 'Close menu',
    switchLanguage: 'Switch language',
  },

  hero: {
    eyebrow: 'Eastern International University',
    title: 'Proudly Serving the Community',
    description:
      'EIU FabLab is a typical digital fabrication workshop with many advanced technologies, machinery and equipment, dynamic and creative open spaces and diverse activities to serve the community.community.',
    primaryCta: 'Explore courses',
    secondaryCta: 'Visit the lab',
    imageAlt:
      'A FabLab EIU instructor helping three children assemble a STEM kit at a workbench.',
    floatingBadges: [
      { id: 'open', label: 'Open to the community' },
      { id: 'hands-on', label: '100% hands-on learning' },
    ],
  },

  stats: {
    // TODO: replace with real FabLab EIU figures
    items: [
      { id: 'visitors', value: 20000, suffix: '+', label: 'Student visits' },
      { id: 'courses', value: 30, suffix: '+', label: 'STEM courses' },
      { id: 'learners', value: 12000, suffix: '+', label: 'Learners trained' },
      { id: 'partners', value: 20, suffix: '+', label: 'Community projects' },
    ],
  },

  pillars: {
    eyebrow: 'About us',
    title: 'Mission of EIU FabLab',
    description:
      'An open, dynamic space where technology is shared to create real value for society.',
    items: [
      {
        id: 'education',
        title: 'Education',
        description:
          'Hands-on learning with modern equipment. Learners design, machine and finish their own products from start to end.',
      },
      {
        id: 'research',
        title: 'Research',
        description:
          'Turning creative ideas into products, and prototypes into complete engineering solutions.',
      },
      {
        id: 'entrepreneurship',
        title: 'Entrepreneurship',
        description:
          'Support in commercialising successful prototypes and taking products from the workshop to the market.',
      },
    ],
  },

  courses: {
    eyebrow: 'STEM courses',
    title: 'Find the path that fits you',
    description:
      'From your first lines of code to operating industrial machines — every course begins by getting your hands on the work.',
    /**
     * The two course groups, in the order they appear on the page.
     *
     * `id` matches each course's `group` in `items` below and is **not
     * translated** — these are the real categories on fablab.eiu.edu.vn, read
     * from the breadcrumb on each course page.
     */
    groups: [
      {
        id: 'stem',
        title: 'STEM Courses',
        description:
          'Full programmes of 5–10 weeks, carrying one project from first sketch through to a finished build.',
      },
      {
        id: 'experience',
        title: 'STEM Experience Programs',
        description:
          'Thirty short programmes that dive straight into a single field. Filter by school level and topic to find the right fit fast.',
        // Only this group shows filters — driven by a flag, never guessed from count.
        filterable: true,
      },
    ],

    /**
     * The two axes the experience group is classified by, taken from FabLab EIU's
     * official catalogue. Array order is chip order on the filter row; `id` is not
     * translated because it keys each programme's `stage` / `topic`.
     *
     * `short` is what fits on the card, `label` is the full name on the filter row.
     */
    stages: [
      { id: 'th', short: 'Primary', label: 'Primary school' },
      { id: 'thcs', short: 'Secondary', label: 'Lower secondary school' },
      { id: 'thpt', short: 'High school', label: 'Upper secondary school' },
    ],
    topics: [
      { id: 'science', label: 'Natural science & life' },
      { id: 'robotics', label: 'Engineering & robotics' },
      { id: 'aiot', label: 'AIoT & digital technology' },
    ],
    filters: {
      all: 'All',
      stage: 'School level',
      topic: 'Topic',
      empty: 'No programme matches this selection.',
    },

    // Only the four `stem` courses use `levels` / `duration` / `age`; the experience
    // group uses `stage` / `topic` instead. The card renders whichever is present.
    levels: {
      basic: 'Beginner',
      intermediate: 'Intermediate',
      advanced: 'Advanced',
    },
    ageLabel: 'Ages',
    cardCta: 'Learn more',
    // `{title}` is replaced with the course name at render time.
    imageAlt: 'Activity at FabLab EIU illustrating the {title} course',

    // Labels for the course detail modal. Real content lives in `details` below.
    modal: {
      close: 'Close',
      overview: 'About this course',
      audience: 'Who it is for',
      knowledge: 'What you will know',
      skills: 'What you will be able to do',
      curriculum: 'Course curriculum',
      source: 'View the original course page',
      register: 'Enroll in this course',
      empty: 'Detailed content for this course has not been published yet.',
      viOnly: 'Detailed content for this course is currently only available in Vietnamese.',
    },

    /**
     * Two sources, merged:
     * - `courseDetailsEn` — GENERATED by the LearnPress scraper (4 STEM courses)
     * - `experienceDetailsEn` — HAND-WRITTEN from the official catalogue (30 programmes)
     * See the header of each file for which one may be edited by hand.
     */
    details: { ...courseDetailsEn, ...experienceDetailsEn },
    showMore: 'Show more courses',
    showLess: 'Show less',
    emptyState: 'No courses in this track yet.',

    // `duration` and `age` are real figures taken from the course pages.
    // TODO: the Scratch course's `age` ('8+') is still a guess — not stated upstream.
    items: [
      // --- Natural science & life -----------------------------------------
      {
        id: 'thien-nhien',
        group: 'experience',
        stage: 'th',
        topic: 'science',
        icon: 'energy',
        title: 'The power of nature',
        description:
          'The seasons, weather phenomena and natural disasters, then build a simulation model to understand how to prepare.',
      },
      {
        id: 'nang-luong-cuoc-song',
        group: 'experience',
        stage: 'thcs',
        topic: 'science',
        icon: 'energy',
        title: 'Energy and life',
        description:
          'The forms and sources of energy, how it travels and converts, through the "One-touch machine" challenge.',
      },
      {
        id: 'am-thanh',
        group: 'experience',
        stage: 'thcs',
        topic: 'science',
        icon: 'electronics',
        title: 'The secrets of sound',
        description:
          'From sound sources and vibration to how the ear receives sound, with hands-on transmission through an interactive game.',
      },
      {
        id: 'nam-cham',
        group: 'experience',
        stage: 'thcs',
        topic: 'science',
        icon: 'electrical',
        title: 'Magnets and magnetic fields',
        description:
          'Magnetic fields and magnets in nature, experiments on their basic properties and the "Magnetic force" challenge.',
      },
      {
        id: 'cap-quang',
        group: 'experience',
        stage: 'thcs',
        topic: 'science',
        icon: 'photonics',
        title: 'Fiber optics and lasers',
        description:
          'Refraction and total internal reflection, how light travels through optical fibre, closing with a Morse code challenge.',
      },
      {
        id: 'polymer',
        group: 'experience',
        stage: 'thcs',
        topic: 'science',
        icon: 'plastics',
        title: 'Decoding polymers',
        description:
          'The characteristics and uses of polymer material families, hands-on experiments and a biopolymer-making challenge.',
      },
      {
        id: 'nang-luong-tai-tao',
        group: 'experience',
        stage: 'thpt',
        topic: 'science',
        icon: 'energy',
        title: 'Renewable energy',
        description:
          'Renewable energy sources and how a wind turbine works, measuring the electricity a model actually produces.',
      },
      {
        id: 'moi-truong-nuoc',
        group: 'experience',
        stage: 'thpt',
        topic: 'science',
        icon: 'water',
        title: 'Water environment technology',
        description:
          'What causes water pollution and how it is treated; measuring pH, disinfecting, decolourising and testing pool water.',
      },
      {
        id: 'nganh-nhua',
        group: 'experience',
        stage: 'thpt',
        topic: 'science',
        icon: 'plastics',
        title: 'Exploring the plastics industry',
        description:
          'Classifying polymers, their physical and chemical properties, synthesis versus processing, plus making experiments.',
      },

      // --- Engineering & robotics -------------------------------------------
      {
        id: 'xe-robot',
        group: 'experience',
        stage: 'th',
        topic: 'robotics',
        icon: 'robot-car',
        title: 'Exploring robot cars',
        description:
          'How a robot car is built and driven by voice and remote control, closing with the "Robot race track" challenge.',
      },
      {
        id: 'drone',
        group: 'experience',
        stage: 'thcs',
        topic: 'robotics',
        icon: 'automation',
        title: 'Drone programming',
        description:
          'How drones fly and where they are used, hands-on flight programming and the Drone Soccer challenge.',
      },
      {
        id: 'canh-tay-robot',
        group: 'experience',
        stage: 'thcs',
        topic: 'robotics',
        icon: 'robotic-arm',
        title: 'Robot arms in manufacturing',
        description:
          'How a robot arm is built and works, with hands-on programming through the "Colour sorting station" game.',
      },
      {
        id: 'robot-sinh-hoc',
        group: 'experience',
        stage: 'thcs',
        topic: 'robotics',
        icon: 'humanoid',
        title: 'Biological robots',
        description:
          'Recognising animal and plant species, assembling and operating a biological robot model, then playing with it.',
      },
      {
        id: 'kham-pha-dien',
        group: 'experience',
        stage: 'thcs',
        topic: 'robotics',
        icon: 'electronics',
        title: 'Exploring electricity',
        description:
          'Power sources, components and electrical safety; assembling a basic circuit and testing that it works.',
      },
      {
        id: 'thiet-ke-co-khi',
        group: 'experience',
        stage: 'thpt',
        topic: 'robotics',
        icon: 'mechanics',
        title: 'Exploring mechanical design',
        description:
          'Reading and analysing technical drawings, projections and conventions; designing, machining and assembling.',
      },
      {
        id: 'co-dien-tu',
        group: 'experience',
        stage: 'thpt',
        topic: 'robotics',
        icon: 'mechatronics',
        title: 'Exploring mechatronics',
        description:
          'Production lines and mechatronic components, the programming software and hands-on module control.',
      },
      {
        id: 'co-hoc-sang-tao',
        group: 'experience',
        stage: 'thpt',
        topic: 'robotics',
        icon: 'stress',
        title: 'Creative mechanics',
        description:
          'Force and moment of force, how simple machines work, applied to a lifting model and a working lift.',
      },
      {
        id: 'cnc',
        group: 'experience',
        stage: 'thpt',
        topic: 'robotics',
        icon: 'cnc',
        title: 'CNC machining technology',
        description:
          'How a CNC mill is built and works, drawing a simple mechanical part then running the machine to make it.',
      },
      {
        id: 'in-3d',
        group: 'experience',
        stage: 'thpt',
        topic: 'robotics',
        icon: 'process',
        title: '3D printing technology',
        description:
          'How a 3D printer is built and works, preparing files and print settings, then running the printer.',
      },
      {
        id: 'muc-nuoc-thong-minh',
        group: 'experience',
        stage: 'thpt',
        topic: 'robotics',
        icon: 'water',
        title: 'Smart water level monitoring',
        description:
          'Pump motor control and sensor data, using feedback control and voice recognition to manage water level.',
      },

      // --- AIoT & digital technology ----------------------------------------
      {
        id: 'lam-quen-ai',
        group: 'experience',
        stage: 'th',
        topic: 'aiot',
        icon: 'scratch',
        title: 'Getting to know artificial intelligence',
        description:
          'What AI is and where it appears in daily life; simulating how an AI learns through the "What did the AI learn?" game.',
      },
      {
        id: 'the-gioi-ao',
        group: 'experience',
        stage: 'thcs',
        topic: 'aiot',
        icon: 'scratch',
        title: 'Virtual worlds and robots',
        description:
          'What programming does in robot control, moving a robot around a simulated field in the "Master farm engineer" project.',
      },
      {
        id: 'noi-dung-so',
        group: 'experience',
        stage: 'thcs',
        topic: 'aiot',
        icon: 'photonics',
        title: 'Digital content creator',
        description:
          'Generative versus traditional AI, writing prompts to generate images and assembling video into a short story.',
      },
      {
        id: 'cau-truc-may-tinh',
        group: 'experience',
        stage: 'thpt',
        topic: 'aiot',
        icon: 'electronics',
        title: 'Computer architecture',
        description:
          'The role of the CPU, mainboard, RAM and SSD/HDD, and how to pick hardware that fits a given need.',
      },
      {
        id: 'thiet-ke-3d',
        group: 'experience',
        stage: 'thpt',
        topic: 'aiot',
        icon: 'process',
        title: '3D design',
        description:
          'The coordinate system in three-dimensional space and the tools for designing 3D prints, with hands-on practice.',
      },
      {
        id: 'blockchain',
        group: 'experience',
        stage: 'thpt',
        topic: 'aiot',
        icon: 'process',
        title: 'Blockchain and digital data secrets',
        description:
          'From the history of money to blockchain, how hash links keep blocks secure, and simulating block validation.',
      },
      {
        id: 'iot',
        group: 'experience',
        stage: 'thpt',
        topic: 'aiot',
        icon: 'automation',
        title: 'Smart data connectivity',
        description:
          'Connecting and controlling IoT devices, designing an app interface and driving a model through the cloud.',
      },
      {
        id: 'thi-giac-may-tinh',
        group: 'experience',
        stage: 'thpt',
        topic: 'aiot',
        icon: 'photonics',
        title: 'Getting to know computer vision',
        description:
          'What machine learning is for and how it is categorised, working a pipeline with a convolutional neural network.',
      },
      {
        id: 'xac-suat-hoc-may',
        group: 'experience',
        stage: 'thpt',
        topic: 'aiot',
        icon: 'process',
        title: 'Probability in machine learning',
        description:
          'Applying Naïve Bayes to historical customer data to predict behaviour, then evaluating the accuracy.',
      },
      {
        id: 'thiet-ke-website',
        group: 'experience',
        stage: 'thpt',
        topic: 'aiot',
        icon: 'scratch',
        title: 'Website design',
        description:
          'The basics of user interface and user experience, the design process and building a simple website.',
      },

      // --- STEM courses -------------------------------------------------------
      {
        id: 'robotic-arm',
        group: 'stem',
        level: 'intermediate',
        duration: '10 weeks · 30 hours',
        age: '15–18',
        title: 'Robotic Arms',
        description:
          'Assemble and program a robotic arm to carry out a full pick-and-place routine.',
      },
      {
        id: 'humanoid',
        group: 'stem',
        level: 'intermediate',
        duration: '5 weeks · 15 hours',
        age: '6–12',
        title: 'Humanoid Robots',
        description:
          'Discover how robots keep their balance, walk, and interact with the people around them.',
      },
      {
        id: 'scratch',
        group: 'stem',
        level: 'basic',
        duration: '7 weeks · 24 hours',
        age: '8+',
        title: 'Scratch Programming',
        description:
          'A first step into coding with visual blocks — telling stories, building games and animations.',
      },
      {
        id: 'robot-car',
        group: 'stem',
        level: 'basic',
        duration: '8 weeks · 24 hours',
        age: '12–15',
        title: 'Robot Vehicles',
        description:
          'Build a self-driving car that follows lines, avoids obstacles and responds to your phone.',
      },
    ],
  },

  facilities: {
    eyebrow: 'Facilities',
    title: 'An open workshop for digital fabrication',
    description:
      'Every machine is open to learners and the community, with technicians on hand to guide you.',
    // `{title}` is replaced with the equipment name at render time.
    imageAlt: '{title} in the FabLab EIU workshop',
    items: [
      {
        id: 'printer-3d',
        title: '3D printers',
        description:
          'Turn a digital design into a physical model within hours, across a range of materials.',
      },
      { id: 'cnc', title: 'CNC machines', description: 'Precision milling and turning in wood, plastic and metal.' },
      { id: 'laser', title: 'Laser cutters', description: 'Fine cutting and engraving across many sheet materials.' },
      { id: 'electronics-lab', title: 'Electronics bay', description: 'Soldering stations, test gear and PCB design.' },
    ],
  },

  partners: {
    eyebrow: 'Partners',
    title: 'The organisations behind FabLab EIU',
    description:
      'The institutions and schools cooperate with EIU FabLab to bring technology closer to the community.',
    // `{name}` is replaced with the partner name at render time.
    logoAlt: '{name} logo',

    /**
     * Only organisations evidenced on the university's own website. A partner
     * with no logo simply has no key in PARTNER_LOGOS and renders as text —
     * do NOT source a logo elsewhere and attach it here.
     */
    items: [
      { id: 'eiu', name: 'Trường Đại học Quốc tế Miền Đông' },
      // { id: 'becamex', name: 'Becamex' },
      // { id: 'bbi', name: 'Becamex Business Incubator' },
      { id: 'vietanh', name: 'Hệ thống trường Việt Anh' },
      { id: 'little', name: 'Trường mầm non Little People' },
      { id: 'tvbd', name: 'Thư viện tỉnh Bình Dương' },
      { id: 'tvtphcm', name: 'Thư viện Khoa học tổng hợp thành phố Hồ Chí Minh' },
      { id: 'hoasen', name: 'Trường THCS-THPT Hoa Sen' },
      { id: 'petrusky', name: 'Trường THCS-THPT Pétrus Ký' },
      { id: 'talent', name: 'Talent Academy' },
    ],
  },

  activities: {
    eyebrow: 'Events',
    title: 'Annual activities & competitions',
    description:
      'Competitions, seminars and workshops run by FabLab EIU for students, pupils and the wider community.',
    previous: 'Previous activity',
    next: 'Next activity',
    goTo: 'Go to activity',
    // `{title}` is replaced with the activity name at render time.
    imageAlt: 'Photo from {title}',
    kinds: {
      competition: 'Competition',
      seminar: 'Seminar',
      workshop: 'Workshop',
      partnership: 'Partnership',
    },

    /**
     * Two blocks shown side by side; ARRAY ORDER IS PAGE ORDER — same convention
     * as `courses.groups`.
     *
     * Which block an item belongs to is NOT recorded here: it follows from each
     * activity's `kind` (see `KIND_GROUP` in Activities.jsx). `kind` already
     * decides that, and a second field would only invite the two to drift apart.
     */
    groups: [
      {
        id: 'competitions',
        title: 'Competitions',
        description:
          'Two annual contests run by FabLab EIU, open to university and high-school students across southern Vietnam.',
        kinds: ['competition'],
      },
      {
        id: 'events',
        title: 'Events & seminars',
        description:
          'Specialist seminars, hands-on workshops and partnership signings hosted at the lab between 2019 and 2023.',
        kinds: ['seminar', 'workshop', 'partnership'],
      },
    ],

    /**
     * Mostly taken from the university's own events page
     * (fablab.eiu.edu.vn/vi/su-kien/). The two 2026 competitions come from the
     * official posters supplied by FabLab — every date, time and venue is read
     * straight off the poster, never inferred.
     *
     * Competitions first, newest first within each kind.
     */
    items: [
      {
        id: 'drone-soccer',
        kind: 'competition',
        date: '6 Jun 2026',
        title: 'EIU Drone Soccer Championship 2026',
        description:
          'A drone soccer tournament hosted by EIU FabLab. Official matches run from 07:00 to 12:00 in room 101, building B3, Eastern International University.',
      },
      {
        id: 'mcr-2026',
        kind: 'competition',
        date: '21–29 Mar 2026',
        title: 'EIU MCR 2026 — Autonomous car programming',
        description:
          'EIU Microcontroller Car Rally, 2026 season: heat 1 on 21 March, heat 2 on 22 March and the grand final on 29 March. Registration runs from 4 January to 28 February 2026.',
      },
      {
        id: 'racing-cup',
        kind: 'competition',
        date: '',
        title: 'FabLab Racing Cup',
        description:
          'A model car racing competition run by EIU FabLab together with the EIU School of Engineering for engineering students.',
      },
      {
        id: 'stm32',
        kind: 'seminar',
        date: 'Every Wednesday afternoon',
        title: 'STM32 programming basics',
        description:
          'Guiding students through microcontroller peripherals such as ADC, PWM and I2C. Held in room 202, block 11.',
      },
      {
        id: 'print-3d',
        kind: 'workshop',
        date: '20 July 2022',
        title: '3D printing technology and applications',
        description:
          'Learning about 3D printing, the types of printer available and how to run them. Led by Vo Doan Linh, at the EIU Library.',
      },
      {
        id: 'viet-anh',
        kind: 'partnership',
        date: '19 July 2022',
        title: 'Strategic partnership: EIU – Viet Anh',
        description:
          'A strategic partnership with the Viet Anh School System covering STEM experience programmes, research support and entering pupils into science and technology competitions.',
      },
      {
        id: 'laser-cnc',
        kind: 'workshop',
        date: '21 June 2022',
        title: 'Get creative with 3D printers and laser CNC',
        description:
          'Cutting wood and acrylic on the laser cutter, engraving circuit boards, designing and 3D printing. Led by Bui Quang Tien.',
      },
      {
        id: 'industrial-design',
        kind: 'seminar',
        date: '20 June 2022',
        title: 'The role of industrial design',
        description:
          'On engineering design and prototyping of industrial products. Speaker: Nguyen Tran Bao Hien, Anco Company – Binh Duong.',
      },
      {
        id: 'print-3d-medical',
        kind: 'seminar',
        date: '',
        title: '3D printing in healthcare',
        description:
          '3D printing applied to maxillofacial surgery. Speaker: Dr Tran Tuan Anh, DDS, Becamex International Hospital.',
      },
      {
        id: 'nano',
        kind: 'seminar',
        date: '15 March',
        title: 'Nanomaterials in healthcare',
        description:
          'Stretchable tension sensors built from nanomaterials for medical use. Speaker: Dr Tran Quang Trung, Sungkyunkwan University, Korea.',
      },
      {
        id: 'machine-learning',
        kind: 'seminar',
        date: '23 August',
        title: 'Machine learning',
        description:
          'Neural network basics, TensorFlow, convolutional networks and where deep learning is heading. Speaker: Dr Cuong Pham.',
      },
      {
        id: 'design-workshop',
        kind: 'workshop',
        date: '7 August 2019',
        title: 'Industrial design',
        description:
          'How a product travels from idea to sketch to prototype, with hands-on sketching practice.',
      },
      {
        id: 'pcb',
        kind: 'workshop',
        date: '',
        title: 'Designing and prototyping circuits',
        description:
          'Using resistors, diodes, transistors, FETs and optocouplers to build real applications, plus basic PCB layout technique.',
      },
      {
        id: 'design-3d',
        kind: 'workshop',
        date: '',
        title: '3D design with SolidWorks',
        description:
          'The 3D design process and the factors that shape a product from first drawing through to finished part.',
      },
    ],
  },

  team: {
    eyebrow: 'Our team',
    title: 'Our Team',
    description:
      'Engineers, STEM specialists and instructors who teach the classes, run the machines and stay with you through every project.',
    // `{name}` is replaced with the member name at render time.
    photoAlt: 'Portrait of {name}',

    /**
     * Names and titles taken VERBATIM from FabLab's own "Về chúng tôi" page on
     * Google Sites: sites.google.com/eiu.edu.vn/fablab.
     *
     * Order and grouping follow the source: organisation → STEM Lab members (10)
     * → FabLab members (4). Titles are translated; names are left as written.
     *
     * `id` is a stable, untranslated key used for React keys and photo lookup —
     * it must match `vi.js` exactly.
     *
     * `education` comes from the same page, shortened only to fit the card. The
     * director's page entry lists three degrees with universities and years; only
     * the highest is shown here.
     *
     * ⚠️ The source page has ONE gap, deliberately not filled in here: the FabLab
     * group has a fifth tile with a photo but no name or title, so only the four
     * named people are listed.
     *
     * "Hoàng Ngọc Phương" (full name and MSc in Mechatronics) was supplied
     * directly by the user; the source page shows only "Phương" with a BEng in
     * Software Engineering.
     */
    members: [
      // `lead` lifts this person out into their own card above the two marquee
      // rows. Flagged in the data rather than hardcoding an `id` in the component,
      // so handing over the role is a one-line change.
      { id: 'hung', name: 'Nguyễn Xuân Hùng', role: 'FabLab Director', education: 'PhD in Energy Engineering', lead: true },
      { id: 'tuan', name: 'Đỗ Nguyễn Anh Tuấn', role: 'STEM Specialist', education: 'MSc in Information Technology' },
      { id: 'ngan', name: 'Trần Ngọc Kim Ngân', role: 'STEM Specialist', education: 'MA in Education Management' },
      { id: 'phuoc', name: 'Nguyễn Hữu Phước', role: 'STEM Specialist', education: 'MSc in Materials Science' },
      { id: 'hien', name: 'Lư Thị Thu Hiền', role: 'STEM Specialist', education: 'MSc in Inorganic Chemistry' },
      { id: 'minh', name: 'Trần Hán Minh', role: 'STEM Specialist', education: 'BEng in Software Engineering' },
      { id: 'manh', name: 'Đinh Thế Mạnh', role: 'STEM Specialist', education: 'BSc in Electrical & Electronics' },
      { id: 'thy', name: 'Nguyễn Nam Thy', role: 'STEM Specialist', education: 'BSc in Physics' },
      { id: 'tran', name: 'Thạch Thị Huyền Trân', role: 'STEM Specialist', education: 'BSc in Theoretical Physics' },
      { id: 'huan', name: 'Trần Khắc Huân', role: 'STEM Specialist', education: 'BEng in Software Engineering' },
      { id: 'phuong', name: 'Hoàng Ngọc Phương', role: 'STEM Specialist', education: 'MSc in Mechatronics' },
      { id: 'linh', name: 'Võ Đoàn Linh', role: 'Technician', education: 'BEng in Automation Engineering' },
      { id: 'nhat', name: 'Trần Duy Nhất', role: 'Technician', education: 'BEng in Automation Engineering' },
      { id: 'tinh', name: 'Đỗ Trung Tính', role: 'Technician', education: 'BEng in Electrical & Electronics' },
      { id: 'nhi', name: 'Võ Hoàng Yến Nhi', role: 'Technician', education: 'BEng in Automation Engineering' },
    ],
  },

  testimonials: {
    eyebrow: 'Testimonials',
    title: 'What learners say about FabLab EIU',
    previous: 'Previous testimonial',
    next: 'Next testimonial',
    goTo: 'Go to testimonial',
    // TODO: fictional content — replace with real learner testimonials
    items: [
      {
        id: 't1',
        quote:
          'It was the first time I saw my own drawing become something I could hold in my hand. That feeling is why I want to study engineering.',
        name: 'Nguyen Minh Anh',
        role: 'CNC Machining course',
      },
      {
        id: 't2',
        quote:
          'FabLab does not teach theory in the abstract. On day one we were standing at the machine, and we fixed our mistakes right where we made them.',
        name: 'Tran Quoc Bao',
        role: 'Third-year Mechatronics student',
      },
      {
        id: 't3',
        quote:
          'My child started with Scratch and now builds line-following robot cars. What matters most is that they learned the patience to try again.',
        name: 'Le Thu Ha',
        role: 'Parent of a learner',
      },
    ],
  },

  finalCta: {
    title: 'Your idea deserves to be built',
    description:
      'Enroll in a course, or simply drop by to see what we are making. The door at FabLab EIU is always open.',
    primaryCta: 'Enroll in a course',
    secondaryCta: 'Get in touch',
  },

  footer: {
    description:
      'The digital fabrication workshop of Eastern International University — open for education, research and entrepreneurship.',
    columns: [
      {
        id: 'explore',
        title: 'Explore',
        links: [
          { id: 'about', label: 'About us', href: '#about' },
          // Points at the whole section; the label must stay generic so it does
          // not clash with the "STEM Courses" link in the Programmes column,
          // which targets the `#courses-stem` anchor specifically.
          { id: 'courses', label: 'Courses', href: '#courses' },
          { id: 'facilities', label: 'Facilities', href: '#facilities' },
          { id: 'activities', label: 'Activities & competitions', href: '#activities' },
        ],
      },
      {
        id: 'programs',
        title: 'Programs',
        links: [
          { id: 'stem', label: 'STEM Courses', href: '#courses-stem' },
          { id: 'experience', label: 'STEM Experience Programs', href: '#courses-experience' },
          { id: 'community', label: 'Community projects', href: '#about' },
          { id: 'research', label: 'Research & Startups', href: '#about' },
        ],
      },
    ],
    // TODO: confirm the official contact details
    contact: {
      title: 'Contact',
      address: 'Eastern International University, Binh Duong New City, Vietnam',
      email: 'fablab@eiu.edu.vn',
      phone: '(0274) 222 0176',
    },
    social: {
      title: 'Connect',
      items: [
        { id: 'facebook', label: 'Facebook', href: '#' },
        { id: 'youtube', label: 'YouTube', href: '#' },
        { id: 'website', label: 'EIU website', href: '#' },
      ],
    },
    copyright: 'FabLab EIU. Proudly serving the community.',
  },
}
