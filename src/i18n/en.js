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
import { intensiveDetailsEn } from './intensiveDetails.en'

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
          { id: 'projects', label: 'Projects', href: '#projects' },
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
    // Nút trên thanh menu (tối đa 2). Hành động do admin chọn — xem buttonSchema.
    buttons: [{ id: 'register', label: 'Enroll now', style: 'primary', action: 'register' }],
    openMenu: 'Open menu',
    closeMenu: 'Close menu',
    switchLanguage: 'Switch language',
  },

  hero: {
    eyebrow: 'Eastern International University',
    title: 'Proudly Serving the Community',
    description:
      'EIU FabLab is a typical digital fabrication workshop with many advanced technologies, machinery and equipment, dynamic and creative open spaces and diverse activities to serve the community.community.',
    // Nút có hành động do admin chọn (API 23): mở form đăng ký / form / popup tự tạo, hoặc link.
    buttons: [
      { id: 'primary', label: 'Explore courses', style: 'primary', arrow: true, action: 'link', href: '#courses' },
      { id: 'secondary', label: 'Visit the lab', style: 'secondary', action: 'link', href: '#facilities' },
    ],
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
    title: 'About EIU FabLab',
    description:
      'A fabrication laboratory that gives the community access to the equipment, techniques and technology they need — a shared space to learn, research, design, create and start up together.',
    missionTitle: 'Mission',
    vision: {
      title: 'Vision',
      body:
        'To become a model digital fabrication workshop with modern technology, a dynamic and creative open space, the best support for turning ideas into reality, and a driver of entrepreneurship that creates positive value for the community.',
    },
    visionHighlights: [
      { id: 'technology', label: 'Modern technology and equipment' },
      { id: 'open-space', label: 'A dynamic, creative open space' },
      { id: 'startup', label: 'Turning ideas into reality and start-ups' },
    ],
    valuesTitle: 'Core values',
    // Condensed from the "Core Values" block on fablab.eiu.edu.vn/en/.
    values: [
      {
        id: 'open-space',
        title: 'Open technology space',
        description:
          'Easy access to modern equipment helps turn early ideas into reality and drives learning and innovation in the community.',
      },
      {
        id: 'experiment',
        title: 'Experimentation',
        description: 'Daring to experiment builds knowledge and leads to better, more refined products.',
      },
      {
        id: 'problem-solving',
        title: 'Problem solving',
        description: 'Problem-solving skills are a key to success in any project.',
      },
      {
        id: 'creativity',
        title: 'Creativity',
        description: 'Creativity adds value to products and brings positive value to society.',
      },
      {
        id: 'collaboration',
        title: 'Sharing and collaboration',
        description: 'Sharing knowledge and experience, and working together, helps us go faster and farther.',
      },
      {
        id: 'achievement',
        title: 'Achievement',
        description: 'What EIU FabLab aims for: boosting creativity, development and positive values in the community.',
      },
    ],
    items: [
      {
        id: 'education',
        title: 'Education and training',
        description:
          'Access techniques and technology to turn ideas into reality; build knowledge and skills through learning that goes hand in hand with doing.',
      },
      {
        id: 'research',
        title: 'Research and development',
        description:
          'Search for new ideas and create innovative products that serve the community.',
      },
      {
        id: 'entrepreneurship',
        title: 'Entrepreneurship',
        description:
          'Drive the commercialisation of products built from successful pilot projects.',
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
          'Eight-session courses that go deep into one robotics or AIoT topic, for primary, lower and upper secondary students.',
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
      // Intensive courses for both primary and lower secondary (slides 36–39).
      { id: 'th-thcs', short: 'Primary/Secondary', label: 'Primary & lower secondary' },
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
    // Label for courses flagged `comingSoon` (since API 21).
    comingSoon: 'Coming soon',
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
    details: { ...courseDetailsEn, ...experienceDetailsEn, ...intensiveDetailsEn },
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

      // --- STEM courses: intensive courses (slides 35–42 of "Giới thiệu STEMLab") ---
      {
        id: 'the-gioi-robot',
        group: 'stem',
        stage: 'th-thcs',
        topic: 'robotics',
        icon: 'humanoid',
        title: 'World of Robots',
        description:
          'Eight sessions from humanoid robots and mobile robots to robotic arms in manufacturing, wrapped up with a final project.',
      },
      {
        id: 'xe-robot-chuyen-sau',
        group: 'stem',
        stage: 'th-thcs',
        topic: 'robotics',
        icon: 'robot-car',
        title: 'Robot Car Discovery',
        description:
          'Program a robot car in mBlock through sensors, colours, sound and motion, wrapped up with a final project.',
      },
      {
        id: 'lap-trinh-ai',
        group: 'stem',
        stage: 'th-thcs',
        topic: 'aiot',
        icon: 'scratch',
        title: 'Coding with AI',
        description:
          'Get started with Pictoblox, code games and basic AI, then control characters, build a virtual assistant and a self-driving car.',
      },
      {
        id: 'the-gioi-3d',
        group: 'stem',
        stage: 'th-thcs',
        topic: 'aiot',
        icon: 'process',
        title: 'Conquering the 3D World',
        description:
          '3D design from architecture and interiors to a Newton\'s cradle and animated characters in SimLab, wrapped up with a final project.',
      },
      {
        id: 'website-chuyen-sau',
        group: 'stem',
        stage: 'thpt',
        topic: 'aiot',
        icon: 'scratch',
        title: 'Website Design',
        description:
          'Interface design in Figma with Gestalt, grids, colour, typography, components, AutoLayout and prototypes, finishing with a landing page.',
      },
      {
        id: 'ai-khoa-hoc-du-lieu',
        group: 'stem',
        stage: 'thpt',
        topic: 'aiot',
        icon: 'photonics',
        title: 'AI and Data Science',
        description:
          'From artificial intelligence and Python to object detection with YOLO: training and evaluating models and building an AI app.',
      },
      {
        id: 'the-gioi-dien-tu',
        group: 'stem',
        stage: 'thpt',
        topic: 'robotics',
        icon: 'electronics',
        comingSoon: true,
        title: 'World of Electronics',
        description:
          'Three modules: Mini Drone, Mini Robot and IoT smart kit.',
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

  // Per-machine specification popup in the Facilities section. Source:
  // fablab.eiu.edu.vn/en/devices/. DS460 is a scroll saw (the source page says "wire
  // saw"); the oscilloscope type is corrected from "pulse meter". The three
  // electronics machines have no published specs — `specs` stays empty on purpose.
  equipment: {
    listLabel: 'Machines in this area',
    openLabel: 'View specifications of',
    specsTitle: 'Technical specifications',
    noSpecs: 'FabLab has not published detailed specifications for this machine yet.',
    close: 'Close',
    imageAlt: 'Photo of {name}',
    source: 'See the FabLab equipment page',
    sourceUrl: 'https://fablab.eiu.edu.vn/en/devices/',
    items: [
      {
        id: 'form-3',
        facility: 'printer-3d',
        name: 'Formlabs Form 3',
        type: 'Resin 3D printer',
        specs: [
          { id: 'technology', label: 'Printing technology', detail: 'SLA – Stereolithography Apparatus; LFS – Low Force Stereolithography' },
          { id: 'print-size', label: 'Maximum print size', detail: '145x145x185 mm (W – D – H)' },
          { id: 'layer', label: 'Layer thickness', detail: '25 – 300 µm' },
          { id: 'material', label: 'Material', detail: 'Resin' },
        ],
      },
      {
        id: 'cubicon-210f',
        facility: 'printer-3d',
        name: 'Cubicon 210F',
        type: '3D printer',
        specs: [
          { id: 'technology', label: 'Printing technology', detail: 'FFF – Fused Filament Fabrication' },
          { id: 'print-size', label: 'Maximum print size', detail: '150x150x150 mm (W – D – H)' },
          { id: 'layer', label: 'Layer thickness', detail: '150 – 300 µm (minimum 100 µm)' },
          { id: 'material-diameter', label: 'Material diameter', detail: '1.75 mm' },
          { id: 'material', label: 'Material', detail: 'ABS, PLA, TPU' },
          { id: 'nozzle', label: 'Nozzle diameter', detail: '0.4 mm' },
          { id: 'accuracy-xy', label: 'XY-axis accuracy', detail: '6.25 µm' },
          { id: 'accuracy-z', label: 'Z-axis accuracy', detail: '1.25 µm' },
          { id: 'nozzle-temp', label: 'Nozzle temperature (max)', detail: '260 °C' },
          { id: 'bed-temp', label: 'Bed temperature (max)', detail: '120 °C' },
        ],
      },
      {
        id: 'cubicon-310f',
        facility: 'printer-3d',
        name: 'Cubicon 310F',
        type: '3D printer',
        specs: [
          { id: 'technology', label: 'Printing technology', detail: 'FFF – Fused Filament Fabrication' },
          { id: 'print-size', label: 'Maximum print size', detail: '240x190x200 mm (W – D – H)' },
          { id: 'layer', label: 'Layer thickness', detail: '150 – 300 µm (minimum 100 µm)' },
          { id: 'material-diameter', label: 'Material diameter', detail: '1.75 mm' },
          { id: 'material', label: 'Material', detail: 'ABS, PLA, TPU' },
          { id: 'nozzle', label: 'Nozzle diameter', detail: '0.4 mm' },
          { id: 'accuracy-xy', label: 'XY-axis accuracy', detail: '6.25 µm' },
          { id: 'accuracy-z', label: 'Z-axis accuracy', detail: '1.25 µm' },
          { id: 'nozzle-temp', label: 'Nozzle temperature (max)', detail: '260 °C' },
          { id: 'bed-temp', label: 'Bed temperature (max)', detail: '120 °C' },
        ],
      },
      {
        id: 'shining-3d',
        facility: 'printer-3d',
        name: 'Shining 3D',
        type: '3D scanner',
        specs: [
          { id: 'mode', label: 'Mode', detail: 'Fixed scan – Automatic scan' },
          { id: 'min-size', label: 'Minimum object size', detail: '30x30x30 mm' },
          { id: 'max-size', label: 'Maximum object size', detail: '200x200x200 mm' },
          { id: 'speed', label: 'Scanning speed', detail: '4 s' },
          { id: 'formats', label: 'Output formats', detail: 'OBJ, STL, ASC, PLY' },
          { id: 'camera', label: 'Camera resolution', detail: '1.3 megapixels' },
          { id: 'light', label: 'Light source', detail: 'White light' },
          { id: 'connection', label: 'Connection', detail: 'USB' },
        ],
      },
      {
        id: 'epilog-mini-helix-18',
        facility: 'laser',
        name: 'Epilog Mini Helix 18',
        type: 'Laser cutter',
        specs: [
          { id: 'table-size', label: 'Table size', detail: '18″ x 12″ (457 x 305 mm)' },
          { id: 'thickness', label: 'Material thickness (max)', detail: '4″ (102 mm)' },
          { id: 'power', label: 'Laser power', detail: '40 W' },
          { id: 'resolution', label: 'Resolution', detail: '75 – 1200 DPI' },
          { id: 'connection', label: 'Connection', detail: 'Ethernet T-Base cable or USB' },
        ],
      },
      {
        id: 'roland-srm-20',
        facility: 'cnc',
        name: 'Roland SRM-20',
        type: 'CNC milling machine',
        specs: [
          { id: 'table-size', label: 'Table size', detail: '100 x 100 mm' },
          { id: 'connection', label: 'Connection', detail: 'Ethernet T-Base cable or USB' },
        ],
      },
      {
        id: 'proxxon-ff500',
        facility: 'cnc',
        name: 'Proxxon FF500',
        type: 'Milling machine',
        specs: [
          { id: 'machine-size', label: 'Machine size', detail: '400 x 125 x 780 mm (W – D – H)' },
          { id: 'workpiece-size', label: 'Workpiece size', detail: '450 x 270 x 60 mm (W – D – H)' },
          { id: 'power', label: 'Spindle power', detail: 'BLDC 400 W' },
        ],
      },
      {
        id: 'proxxon-pd400',
        facility: 'cnc',
        name: 'Proxxon PD400',
        type: 'Lathe',
        specs: [
          { id: 'machine-size', label: 'Machine size', detail: '900 x 400 x 300 mm (W – D – H)' },
          { id: 'workpiece-size', label: 'Workpiece size', detail: '450 x 270 mm (L – D)' },
          { id: 'power', label: 'Spindle power', detail: '550 W' },
        ],
      },
      {
        id: 'proxxon-ds460',
        facility: 'cnc',
        name: 'Proxxon DS460',
        type: 'Scroll saw',
        specs: [
          { id: 'machine-size', label: 'Machine size', detail: '900 x 400 x 300 mm (W – D – H)' },
          { id: 'workpiece-size', label: 'Workpiece size', detail: '450 x 270 x 60 mm (W – D – H)' },
          { id: 'power', label: 'Power', detail: '550 W' },
        ],
      },
      {
        id: 'gwinstek-gfg-8255a',
        facility: 'electronics-lab',
        name: 'GW Instek GFG-8255A',
        type: 'Function generator',
        specs: [],
      },
      {
        id: 'gwinstek-gds-2204a',
        facility: 'electronics-lab',
        name: 'GW Instek GDS-2204A',
        type: 'Digital oscilloscope',
        specs: [],
      },
      {
        id: 'gwinstek-gpd-2303s',
        facility: 'electronics-lab',
        name: 'GW Instek GPD-2303S',
        type: '2-channel DC power supply',
        specs: [],
      },
    ],
  },

  // FabLab projects. Source: fablab.eiu.edu.vn/en/projects/. The source page gives no
  // status, so `status` is deliberately absent everywhere (absent = no label).
  projects: {
    eyebrow: 'Projects',
    title: 'Made in our workshop',
    description: 'Models and products designed and built at FabLab EIU — from STEM teaching kits to robots and medical models.',
    imageAlt: 'Photo of the {title} project',
    previous: 'Previous project',
    next: 'Next project',
    goTo: 'Go to project',
    statuses: {
      ongoing: 'In progress',
      done: 'Completed',
    },
    items: [
      {
        id: 'cobot',
        title: 'Cobot',
        description:
          'Cobot is a multifunctional robot that supports people in public areas with tasks such as delivery and security.',
      },
      {
        id: 'plane',
        title: 'Plane model',
        description:
          'The aircraft model is designed to be simple, easy to assemble and easy to use in STEM classes.',
      },
      {
        id: 'microbit-kit',
        title: 'Micro:bit starter kit',
        description:
          'Helps students access technology and programming, and promotes scientific and technical research activities among students.',
      },
      {
        id: 'jaw-model',
        title: 'Skull model for surgery',
        description:
          'A skull model made by 3D printing so that doctors can practise before operating on a real patient.',
      },
      {
        id: 'smart-light',
        title: 'Micro:bit smart light',
        description:
          'The light changes colour and brightness with a push button or from a phone, or turns on automatically when someone is present in low light.',
      },
      {
        id: 'refraction-model',
        title: 'Physics training kit',
        description:
          'A physics teaching kit for the Laser & Fibre Optics STEM class that shows the refraction of light.',
      },
      {
        id: 'mcr-racing-car',
        title: 'EIU – MCR racing car',
        description:
          'Racing car models help students improve their specialised knowledge.',
      },
      {
        id: 'hydroponic-garden',
        title: 'Hydroponic garden',
        description:
          'The hydroponic growing model has automatic functions such as a misting timer, remote control, lights that simulate sunlight, scheduled fertilisation and a pH sensor.',
      },
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
    pause: 'Pause slideshow',
    play: 'Play slideshow',
    // Registration button on each slide, by `kind` (since API 22). No label = no button.
    registerCta: {
      competition: 'Register for the competition',
      workshop: 'Register for the workshop',
      seminar: 'Register for the seminar',
    },
    // Popup chi tiết của banner Cuộc thi (từ API 19).
    viewDetails: 'View details',
    detailLink: 'Visit the competition page',
    closeDetails: 'Close',
    // `{title}` is replaced with the activity name at render time.
    imageAlt: 'Photo from {title}',
    timeLabel: 'Time',
    venueLabel: 'Venue',
    feeLabel: 'Fee',
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
        // Full-width video banner (each competition's video is attached in the dashboard).
        videoBanner: true,
      },
      {
        id: 'events',
        title: 'Events & seminars',
        description:
          'Technical workshops for students, hands-on DIY craft workshops and FabLab orientation sessions in 2026.',
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
        id: 'ws26-fablab-intro',
        kind: 'workshop',
        date: '21 Oct 2026',
        title: 'Getting started with FabLab',
        description:
          'An introduction to the FabLab creative space for students. Participants got to know the technology equipment, learned how to use it and how to apply it in study, research and practice — turning ideas into real products.',
        venue: 'EIU FabLab, Block B11',
        registerClosed: true,
      },
      {
        id: 'ws26-lantern',
        kind: 'workshop',
        date: '23 Sep 2026',
        title: 'Mid-Autumn lantern making',
        description:
          'Make your own Mid-Autumn lantern from wood and acrylic, cut and engraved on the laser cutter. Participants were guided through sketching ideas and choosing a design, assembling it, then decorating and finishing the lantern.',
        time: 'Wednesday, 2:00–4:00 pm',
        venue: 'Room 204, Block B11, EIU FabLab',
        fee: '60,000 VND',
        registerClosed: true,
      },
      {
        id: 'ws26-bouquet',
        kind: 'workshop',
        date: '12 Aug 2026',
        title: 'Youthful bouquets',
        description:
          'A DIY workshop making handmade bouquets for loved ones or for yourself. Participants combined small flower stems with hand-modelled characters into a bouquet of their own, with a wish carried in every detail.',
        time: 'Wednesday, 2:00–4:00 pm',
        venue: 'Room 202, Block B11, EIU FabLab',
        registerClosed: true,
      },
      {
        id: 'ws26-decoden',
        kind: 'workshop',
        date: '22 Jul 2026',
        title: 'Decoden cream-glue decorating',
        description:
          'A DIY workshop decorating everyday items with cream glue and charms. Participants decorated hairbrushes, phone cases, mirrors and other accessories, each with its own personality.',
        time: 'Wednesday, morning 9:00–11:00 am, afternoon 2:00–4:00 pm',
        venue: 'Room 202, Block B11, EIU FabLab',
        fee: '35,000 VND per person',
        registerClosed: true,
      },
      {
        id: 'ws26-beads',
        kind: 'workshop',
        date: '1 Jul 2026',
        title: 'Beaded bracelets',
        description:
          'Part of the DIY craft workshop series. Participants designed and strung beads into a bracelet of their own, free to choose colours and details, and took it home. Each piece is a small gift showing the care and personality of its maker.',
        time: 'Wednesday, morning and afternoon sessions',
        venue: 'Room 305, Block B11, EIU FabLab',
        registerClosed: true,
      },
      {
        id: 'ws26-glass',
        kind: 'workshop',
        date: '10 Jun 2026',
        title: 'Glass painting',
        description:
          'A cheerful, relaxing DIY workshop for students after class. Everyone designed and decorated a glass in their own style. The session was lively, and every glass became a piece bearing its maker’s mark.',
        time: 'Wednesday, morning 9:00–11:00 am, afternoon 2:00–4:00 pm',
        venue: 'Room 305, Block B11, EIU FabLab',
        fee: '35,000 VND per person (materials included)',
        registerClosed: true,
      },
      {
        id: 'ws26-clay',
        kind: 'workshop',
        date: '27 May 2026',
        title: 'Creating with Clay',
        description:
          'A DIY workshop to unwind and connect after class. Participants used Mont Marte air-dry clay and acrylic paint to model small, cute pieces to take home. Students and university staff joined in together.',
        time: 'Wednesday, session 1 9:00–11:00 am, session 2 2:00–4:00 pm',
        venue: 'Room 209, Block B11, EIU FabLab',
        fee: '35,000 VND per person (materials included)',
        registerClosed: true,
      },
      {
        id: 'ws26-git',
        kind: 'workshop',
        date: '20 May 2026',
        title: 'Getting started with Git and GitHub',
        description:
          'A workshop on managing source code, working in teams and “rescuing code” for course projects. Participants learned Git and GitHub from scratch: the pull → add → commit → push workflow, working with branches (branch, merge) and hands-on teamwork. Many programming enthusiasts took part.',
        time: 'Wednesday, 2:00–4:00 pm',
        venue: 'Room 305, Block B11, EIU FabLab',
        registerClosed: true,
      },
      {
        id: 'ws26-mech-design',
        kind: 'workshop',
        date: '15 Apr 2026',
        title: 'Mechanical design basics',
        description:
          'For engineering-minded students who need mechanical design for course or personal projects. Topics covered mechanical design thinking, technical standards and hands-on design in software, with a sharing session and plenty of focused practice.',
        time: 'Wednesday, 2:00–4:00 pm',
        venue: 'Room 305, Block B11, EIU FabLab',
        registerClosed: true,
      },
      {
        id: 'uav-f1tenth',
        kind: 'workshop',
        date: '27 Jan 2026',
        title: 'UAV & F1TENTH workshop series',
        description:
          'A long-running workshop series for students interested in autonomous robots, starting 27 January 2026. Phase 1 builds the foundations: Ubuntu and Linux, core maths, ROS 2 and its key concepts, and ROS 2 programming in simulation before moving to real drones and F1TENTH cars — preparing for the advanced phase 2.',
        details:
          'Getting started with Ubuntu and the Linux environment.\n\nCore maths review: calculus, linear algebra, probability and statistics.\n\nROS 2 and its core concepts: Workspace, Package, Node, Topic, Service, Action.\n\nROS 2 programming in simulation, then connecting to real models such as drones and F1TENTH cars.',
        registerClosed: true,
      },
      {
        id: 'ws26-machines',
        kind: 'workshop',
        date: '14 Jan 2026',
        title: 'Using the FabLab workshop machines',
        description:
          'For students who love making, engineering and DIY, or who need machines for course and personal projects. Participants learned the procedures and safety rules for working at FabLab and practised hands-on with basic mechanical machines, so they can use them confidently for study, research and building products.',
        time: 'Wednesday, morning 9:00–11:00 am, afternoon 2:00–4:00 pm',
        venue: 'Room 204, Block B11, EIU FabLab',
        registerClosed: true,
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
    buttons: [
      { id: 'primary', label: 'Enroll in a course', style: 'primary', arrow: true, action: 'register' },
      { id: 'secondary', label: 'Get in touch', style: 'secondary', action: 'link', href: '#contact' },
    ],
  },

  // Course registration form. {email}, {phone}, {count} are replaced at render time.
  register: {
    title: 'Register',
    description: 'Leave your details and EIU FabLab will get back to you with advice on a suitable course.',
    tabs: {
      label: 'Registration type',
      member: 'FabLab membership',
      course: 'Courses',
    },
    course: 'Course of interest',
    courseNone: 'Not sure yet — please advise',
    studentHeading: 'Student',
    studentName: 'Student full name',
    studentGrade: 'Year of birth or grade',
    studentGradeHint: 'E.g. 2014 or grade 6',
    school: 'Current school',
    parentHeading: 'Parent or guardian',
    parentName: 'Parent full name',
    phone: 'Phone number',
    email: 'Email',
    note: 'Note',
    notePlaceholder: 'Preferred schedule, questions for FabLab…',
    required: 'required',
    optional: 'optional',
    consent: 'I agree that EIU FabLab may process the information above to contact me about courses.',
    privacy:
      'Your information is used only for course advice and class placement, is managed by EIU FabLab (Eastern International University) and kept for at most 12 months. You can withdraw consent or ask for deletion at {email} (Decree 13/2023/ND-CP).',
    submit: 'Send registration',
    submitting: 'Sending…',
    close: 'Close',
    errorSummary: 'Please check {count} fields below.',
    errors: {
      required: 'Please fill in this field.',
      phone: 'Phone number looks wrong (e.g. 0912 345 678).',
      email: 'Email address looks wrong.',
      consent: 'We need your consent to contact you.',
      tooLong: 'This is too long.',
      rateLimited: 'Too many attempts in a row. Please try again in a few minutes.',
      paused: 'Online registration is paused. Please call {phone}.',
      network: 'Could not send. Please try again or call {phone}.',
      age: 'Members must be 16 or older. Younger students, please register for a course.',
      birthYear: 'Year of birth looks wrong (e.g. 2004).',
      role: 'Please choose one.',
      event: 'This event is not taking online registrations right now. Please reload the page or contact FabLab.',
    },
    success: {
      title: 'Registration received!',
      message: 'Thank you. EIU FabLab will contact you on the phone number you provided.',
      close: 'Close',
    },
    member: {
      description:
        'Members can use the workshop space and equipment. Leave your details and EIU FabLab will contact you about the next steps.',
      ageNote: 'For people aged 16 and over. Younger students, please ask a parent to register for a course.',
      heading: 'About you',
      fullName: 'Full name',
      birthYear: 'Year of birth',
      birthYearHint: 'E.g. 2004',
      role: 'You are',
      roleNone: 'Choose one',
      organization: 'School or organisation',
      interests: 'Areas of interest',
      notePlaceholder: 'Projects you want to build, when you can come to the lab…',
      consent: 'I agree that EIU FabLab may process the information above to contact me about membership.',
      privacy:
        'Your information is used only for contacting you and managing membership, is managed by EIU FabLab (Eastern International University) and kept for at most 12 months. You can withdraw consent or ask for deletion at {email} (Decree 13/2023/ND-CP).',
    },
    event: {
      description: 'Leave your details and EIU FabLab will contact you to confirm your place.',
      eventLabel: 'Registering for',
      heading: 'Participant',
      fullName: 'Participant full name',
      birthYear: 'Year of birth',
      birthYearHint: 'E.g. 2008',
      organization: 'School or organisation',
      parentName: 'Parent or guardian full name',
      parentNote:
        'Participants under 16: a parent or guardian fills in their own name and phone number and gives consent on their behalf.',
      notePlaceholder: 'Questions for FabLab, support you need…',
      consent:
        'I am the participant and aged 16 or over, or the parent / guardian of the participant, and I agree that EIU FabLab may process the information above to contact me about the event.',
      privacy:
        'Your information is used only for contacting you and running the event, is managed by EIU FabLab (Eastern International University) and kept for at most 12 months. You can withdraw consent or ask for deletion at {email} (Decree 13/2023/ND-CP).',
    },
    memberRoles: {
      'eiu-student': 'EIU student',
      'eiu-staff': 'EIU lecturer or staff',
      student: 'School student',
      worker: 'Working professional',
      other: 'Other',
    },
    memberInterests: {
      '3d-printing': '3D printing',
      laser: 'Laser cutting and engraving',
      cnc: 'CNC machining',
      electronics: 'Electronics and programming',
      robotics: 'Robotics and automation',
      other: 'Other',
    },
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
          { id: 'projects', label: 'Projects', href: '#projects' },
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
    // Seasonal events — see the note in vi.js.
  seasonal: {
    close: 'Close',
    dismiss: 'Maybe later',
    effectOff: 'Turn off effects',
    effectOn: 'Turn on effects',
    items: [
      {
        id: 'tet-2027',
        name: 'Lunar New Year',
        popup: true,
        start: '2027-01-28',
        end: '2027-02-14',
        title: 'Happy Lunar New Year 2027',
        body: 'EIU FabLab wishes you and your family a peaceful new year full of fresh ideas. Start the year with a creative course at FabLab.',
        ctaAction: 'register',
        ctaLabel: 'Register for a course',
        href: '#',
        colorPrimary: '#c8102e',
        colorSurface: '#fff3d6',
        colorDark: '#7a0c1e',
        colorAccent: '#e8a317',
        motif: 'mai',
        fall: true,
      },
      {
        id: 'trung-thu-2027',
        name: 'Mid-Autumn Festival',
        popup: true,
        start: '2027-09-08',
        end: '2027-09-16',
        title: 'A joyful Mid-Autumn Festival with EIU FabLab',
        body: 'Wishing every child a happy moon festival. Explore our hands-on STEM programmes for school students.',
        ctaAction: 'link',
        ctaLabel: 'See programmes',
        href: '#courses-experience',
        colorPrimary: '#b34700',
        colorSurface: '#fff1dc',
        colorDark: '#3b2a5c',
        colorAccent: '#f2b134',
        motif: 'lantern',
        fall: true,
      },
      {
        id: 'noel-2026',
        name: 'Christmas',
        popup: true,
        start: '2026-12-15',
        end: '2026-12-26',
        title: 'Merry Christmas',
        body: 'EIU FabLab wishes you a warm Christmas season. Take a look at the projects made in our workshop.',
        ctaAction: 'link',
        ctaLabel: 'See projects',
        href: '#projects',
        colorPrimary: '#1f7a4d',
        colorSurface: '#eef7f0',
        colorDark: '#7f1d1d',
        colorAccent: '#c0392b',
        motif: 'snow',
        fall: true,
      },
      {
        id: 'halloween-2026',
        name: 'Halloween',
        popup: true,
        start: '2026-10-25',
        end: '2026-11-01',
        title: 'A creative Halloween with EIU FabLab',
        body: 'EIU FabLab wishes you a fun Halloween. Explore our hands-on STEM programmes and make something of your very own.',
        ctaAction: 'link',
        ctaLabel: 'See programmes',
        href: '#courses-experience',
        colorPrimary: '#c2410c',
        colorSurface: '#fff7ed',
        colorDark: '#3b0764',
        colorAccent: '#7c3aed',
        motif: 'halloween',
        fall: true,
      },
    ],
  },
  motifs: {
    shapes: [],
    items: [
      {
        id: 'tuyet-day',
        name: 'Heavy snow (sample)',
        particles: [
          { id: 'snowflake', shape: 'snowflake', weight: 45, sizeMin: 11, sizeMax: 18 },
          { id: 'snowdot', shape: 'snowdot', weight: 55, sizeMin: 5, sizeMax: 9 },
        ],
        direction: 'down',
        motion: 'spin',
        speedMin: 18,
        speedMax: 40,
        sway: 26,
        density: 200,
        ornamentShape: 'snowflake',
        ornamentCorner: 'right',
        ornamentSize: 16,
      },
    ],
  },
  // Custom popups — opened only by a button pointing at them. See vi.js.
  popups: {
    close: 'Close',
    items: [
      {
        id: 'popup-mau',
        title: 'Sample popup',
        body: 'This is a sample popup. Edit the title and text, add an image and buttons, then set a button on the page to "Open popup" so visitors can open it.',
        buttons: [
          { id: 'courses', label: 'See courses', style: 'primary', action: 'link', href: '#courses' },
        ],
      },
    ],
  },
  // Custom forms — see vi.js.
  forms: {
    birthYear: 'Year of birth',
    birthYearHint: 'E.g. 2004',
    parentName: 'Parent or guardian full name',
    parentNote: 'Under 16: a parent or guardian fills in their own name and gives consent on their behalf.',
    adultOnly: 'This form is for people aged 16 or over.',
    closedMessage: 'This form is no longer accepting submissions.',
    invalid: 'This value is not valid.',
    selectPlaceholder: 'Choose one',
    items: [
      {
        id: 'gop-y',
        title: 'Feedback / Contact',
        description:
          'Send EIU FabLab a question or feedback. We will get back to you by the phone number or email you leave.',
        submitLabel: 'Send',
        successTitle: 'Sent',
        successBody: 'Thank you. EIU FabLab will get back to you soon.',
        consent: 'I agree that EIU FabLab may process the information above to get back to me.',
        privacy:
          'Your information is used only to get back to you, is managed by EIU FabLab (Eastern International University) and kept for at most 12 months. You can withdraw consent or ask for deletion at {email} (Decree 13/2023/ND-CP).',
        closed: true,
        fields: [
          { id: 'ho-ten', label: 'Full name', help: '', fieldType: 'text', required: true },
          { id: 'dien-thoai', label: 'Phone number', help: '', fieldType: 'phone', required: true },
          { id: 'email', label: 'Email', help: '', fieldType: 'email' },
          { id: 'noi-dung', label: 'Message', help: '', fieldType: 'textarea', required: true },
        ],
      },
    ],
  },
}
