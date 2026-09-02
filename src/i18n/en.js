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

export const en = {
  nav: {
    brandTagline: 'Digital fabrication lab',
    links: [
      { id: 'about', label: 'About', href: '#about' },
      { id: 'courses', label: 'Courses', href: '#courses' },
      { id: 'facilities', label: 'Facilities', href: '#facilities' },
      { id: 'process', label: 'Process', href: '#process' },
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
      'FabLab EIU is an open digital fabrication workshop where any idea can become a real product. We bring technology, equipment and knowledge closer to students and the community.',
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
      { id: 'learners', value: 2400, suffix: '+', label: 'Learners trained' },
      { id: 'courses', value: 16, suffix: '', label: 'STEM courses' },
      { id: 'machines', value: 40, suffix: '+', label: 'Fabrication machines' },
      { id: 'projects', value: 180, suffix: '+', label: 'Community projects' },
    ],
  },

  pillars: {
    eyebrow: 'About us',
    title: 'The three pillars of FabLab EIU',
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
          'Short 3–6 week courses that dive straight into a single engineering field, to try it before committing.',
      },
    ],
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

    /** Detail scraped from the real course pages — see courseDetails.en.js */
    details: courseDetailsEn,
    showMore: 'Show more courses',
    showLess: 'Show less',
    emptyState: 'No courses in this track yet.',

    // `duration` and `age` are real figures taken from the course pages.
    // TODO: the Scratch course's `age` ('8+') is still a guess — not stated upstream.
    items: [
      {
        id: 'automation',
        group: 'experience',
        level: 'advanced',
        duration: '5 weeks · 15 hours',
        age: '16–18',
        title: 'Automation & Robotics',
        description:
          'Design and program automated systems, from sensors and PLCs through to industrial robot arms.',
      },
      {
        id: 'plastics',
        group: 'experience',
        level: 'intermediate',
        duration: '5 weeks · 15 hours',
        age: '12–18',
        title: 'Plastics Industry',
        description:
          'Explore polymer materials, mould design and the injection moulding process in manufacturing.',
      },
      {
        id: 'process',
        group: 'experience',
        level: 'advanced',
        duration: '4 weeks · 12 hours',
        age: '12–18',
        title: 'Process Engineering',
        description:
          'Operate and optimise technological processes, measuring and controlling production parameters.',
      },
      {
        id: 'photonics',
        group: 'experience',
        level: 'advanced',
        duration: '4 weeks · 12 hours',
        age: '12–18',
        title: 'Fiber Optics & Laser',
        description:
          'Optical transmission principles, fibre splicing and laser applications in material processing.',
      },
      {
        id: 'mechatronics',
        group: 'experience',
        level: 'advanced',
        duration: '3 weeks · 9 hours',
        age: '16–18',
        title: 'Mechatronics',
        description:
          'Combine mechanics, electronics and programming to build complete intelligent systems.',
      },
      {
        id: 'mechanics',
        group: 'experience',
        level: 'intermediate',
        duration: '5 weeks · 20 hours',
        age: '16–18',
        title: 'Mechanics',
        description:
          'Read technical drawings, design machine components and master power transmission principles.',
      },
      {
        id: 'electrical',
        group: 'experience',
        level: 'intermediate',
        duration: '6 weeks · 18 hours',
        age: '16–18',
        title: 'Electrical Systems',
        description:
          'Design control panels, wire them safely and operate industrial power distribution systems.',
      },
      {
        id: 'electronics',
        group: 'experience',
        level: 'basic',
        duration: '5 weeks · 15 hours',
        age: '16–18',
        title: 'Electronics',
        description:
          'From basic components to PCB design, soldering and testing with professional instruments.',
      },
      {
        id: 'water',
        group: 'experience',
        level: 'intermediate',
        duration: '5 weeks · 15 hours',
        age: '6–18',
        title: 'Water Environmental Technology',
        description:
          'Treat and monitor water quality, and design filtration systems that serve the community.',
      },
      {
        id: 'stress',
        group: 'experience',
        level: 'advanced',
        duration: '4 weeks · 12 hours',
        age: '12–18',
        title: 'Stress Analysis',
        description:
          'Simulate and validate structural strength using finite element analysis methods.',
      },
      {
        id: 'cnc',
        group: 'experience',
        level: 'advanced',
        duration: '3 weeks · 9 hours',
        age: '16–18',
        title: 'CNC Machining',
        description:
          'Write G-code, operate CNC mills and lathes, and machine parts to tight tolerances.',
      },
      {
        id: 'energy',
        group: 'experience',
        level: 'intermediate',
        duration: '4 weeks · 12 hours',
        age: '11–18',
        title: 'Alternative Energy',
        description:
          'Harness solar and wind power, and design storage and grid-tied energy systems.',
      },
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

  process: {
    eyebrow: 'How to join',
    title: 'Four steps to get started',
    description: 'No prior experience needed. All you have to bring is an idea.',
    steps: [
      { id: 'register', title: 'Register', description: 'Pick the course that fits you and submit the online form.' },
      { id: 'orientation', title: 'Orientation', description: 'Meet the instructors, tour the lab and get your roadmap.' },
      { id: 'practice', title: 'Practice', description: 'Operate the machines yourself and build your first prototype.' },
      { id: 'project', title: 'Complete a project', description: 'Present your product and receive your FabLab EIU certificate.' },
    ],
  },

  team: {
    eyebrow: 'Our team',
    title: 'Our Team',
    description:
      'Engineers, STEM specialists and instructors who teach the classes, run the machines and stay with you through every project.',
    joinCta: 'Careers at EIU',
    joinHref: 'https://eiu.edu.vn/career.aspx',
    // `{name}` is replaced with the member name at render time.
    photoAlt: 'Portrait of {name}',

    /**
     * Names and titles taken from the university's own "About us" page
     * (fablab.eiu.edu.vn/vi/ve-chung-toi/); titles translated, names left as
     * written. `id` is a stable, untranslated key used for React keys and photo
     * lookup — it must match `vi.js` exactly.
     */
    members: [
      { id: 'hung', name: 'Nguyễn Xuân Hùng', role: 'PhD · Head of FabLab / STEM Lab' },
      { id: 'hien', name: 'Lư Thị Thu Hiền', role: 'MSc · STEM Specialist' },
      { id: 'phuoc', name: 'Nguyễn Hữu Phước', role: 'MSc · STEM Specialist' },
      { id: 'ngan', name: 'Trần Ngọc Kim Ngân', role: 'BA in Education' },
      { id: 'nhat', name: 'Trần Duy Nhất', role: 'FabLab Specialist' },
      { id: 'linh', name: 'Võ Đoàn Linh', role: 'FabLab Specialist' },
      { id: 'tuan', name: 'Đỗ Nguyễn Anh Tuấn', role: 'Software Engineer' },
      { id: 'minh', name: 'Trần Hán Minh', role: 'Software Engineering' },
      { id: 'manh', name: 'Đinh Thế Mạnh', role: 'BEng in Electrical & Electronics' },
      { id: 'uyen', name: 'Võ Phạm Mai Uyên', role: 'Automation Engineer' },
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
          { id: 'courses', label: 'STEM courses', href: '#courses' },
          { id: 'facilities', label: 'Facilities', href: '#facilities' },
          { id: 'process', label: 'How to join', href: '#process' },
        ],
      },
      {
        id: 'programs',
        title: 'Programs',
        links: [
          { id: 'stem', label: 'STEM Courses', href: '#courses' },
          { id: 'experience', label: 'STEM Experience Programs', href: '#courses' },
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
