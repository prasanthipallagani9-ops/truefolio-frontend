import type { DemoDatabaseState } from '../types/truefolio';

function makeSvgDocPreview(title: string, subtitle: string, code: string): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="840" height="540" viewBox="0 0 840 540">
    <rect width="840" height="540" fill="#FAF7F2"/>
    <rect x="28" y="28" width="784" height="484" fill="#FFFFFF" stroke="#D2C6B4" stroke-width="2"/>
    <rect x="44" y="44" width="752" height="452" fill="none" stroke="#E5DDD0" stroke-width="1"/>
    <text x="72" y="102" font-family="Georgia, serif" font-size="16" fill="#B45309" letter-spacing="2">VERIFIED ACADEMIC RECORD</text>
    <line x1="72" y1="122" x2="768" y2="122" stroke="#E5DDD0" stroke-width="1"/>
    <text x="72" y="182" font-family="Georgia, serif" font-size="30" font-weight="bold" fill="#291D15">${title}</text>
    <text x="72" y="222" font-family="sans-serif" font-size="18" fill="#544134">${subtitle}</text>
    <rect x="72" y="270" width="696" height="110" fill="#F4EFE6" stroke="#E5DDD0"/>
    <text x="96" y="314" font-family="monospace" font-size="15" fill="#3C2C21">DOCUMENT REFERENCE: ${code}</text>
    <text x="96" y="346" font-family="sans-serif" font-size="14" fill="#6E594A">Prototype evidence preview generated for TRUEFOLIO demonstration.</text>
    <line x1="72" y1="436" x2="300" y2="436" stroke="#291D15" stroke-width="1"/>
    <text x="72" y="458" font-family="sans-serif" font-size="13" fill="#6E594A">Faculty &amp; Program Coordinator Sign-Off</text>
    <text x="640" y="458" font-family="monospace" font-size="13" fill="#92400E">TRUEFOLIO DEMO</text>
  </svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

function makeTextNotePreview(content: string): string {
  return `data:text/plain;charset=utf-8,${encodeURIComponent(content)}`;
}

export const DEMO_IDS = {
  facultyKavita: 'fac-kavita-sharma',
  studentAarav: 'stu-aarav-mehta',
  studentPriya: 'stu-priya-nair',
  studentRohan: 'stu-rohan-kulkarni',
} as const;

export const INITIAL_DEMO_STATE: DemoDatabaseState = {
  version: 1,
  profiles: [
    {
      id: DEMO_IDS.facultyKavita,
      full_name: 'Dr. Kavita Sharma',
      email: 'kavita.sharma@truefolio.edu',
      avatar_url: '/src/assets/images/avatar_faculty_kavita_1795526825675.jpg',
      department: 'Computer Science & Design',
      designation: 'Associate Professor & Cohort Mentor',
      office_hours: 'Tue & Thu · 10:00 – 12:30 IST · Room B-204',
      portfolio_headline: 'Faculty Reviewer for Applied Systems & Human-Centered Computing',
      bio: 'Mentoring undergraduate capstone researchers, community engineering fellowships, and interdisciplinary design studios. Reviews submitted portfolio hours and verifies external project deliverables.',
      skills: ['Distributed Systems', 'Capstone Assessment', 'Research Mentorship', 'Curriculum Design'],
      github_url: 'https://github.com/kavitasharma-lab',
      linkedin_url: 'https://linkedin.com/in/dr-kavita-sharma',
      updated_at: '2026-10-12T09:15:00Z',
    },
    {
      id: DEMO_IDS.studentAarav,
      full_name: 'Aarav Mehta',
      email: 'aarav.mehta@truefolio.edu',
      avatar_url: '/src/assets/images/avatar_student_aarav_1795526824345.jpg',
      department: 'Computer Science & Engineering',
      academic_year: 'Year 3 · Semester VI',
      roll_number: 'CS-2024-041',
      portfolio_headline: 'Building accessible civic telemetry tools & embedded sensor networks',
      bio: 'Undergraduate researcher focused on low-power edge sensing, public transit accessibility data, and clean full-stack tooling. Documenting experiential credits toward the Honours Engineering Track.',
      skills: ['TypeScript', 'React', 'Python', 'Embedded C', 'PostgreSQL', 'Accessibility'],
      github_url: 'https://github.com/aaravmehta',
      linkedin_url: 'https://linkedin.com/in/aaravmehta',
      updated_at: '2026-11-18T11:20:00Z',
    },
    {
      id: DEMO_IDS.studentPriya,
      full_name: 'Priya Nair',
      email: 'priya.nair@truefolio.edu',
      avatar_url: '/src/assets/images/avatar_student_priya_1795526824204.jpg',
      department: 'Interaction & Product Design',
      academic_year: 'Year 4 · Semester VII',
      roll_number: 'ID-2023-018',
      portfolio_headline: 'Service designer exploring multilingual healthcare interfaces',
      bio: 'Final-year design fellow collaborating with rural health clinics on visual triage guides and low-literacy appointment workflows.',
      skills: ['Service Design', 'Figma', 'Usability Testing', 'Information Architecture', 'CSS'],
      github_url: 'https://github.com/priyanair-design',
      linkedin_url: 'https://linkedin.com/in/priyanair',
      updated_at: '2026-11-16T14:05:00Z',
    },
    {
      id: DEMO_IDS.studentRohan,
      full_name: 'Rohan Kulkarni',
      email: 'rohan.kulkarni@truefolio.edu',
      avatar_url: '/src/assets/images/avatar_student_rohan_1795526824341.jpg',
      department: 'Computer Science & Engineering',
      academic_year: 'Year 2 · Semester IV',
      roll_number: 'CS-2025-112',
      portfolio_headline: 'Systems programmer interested in compilers & open-source developer tools',
      bio: 'Sophomore contributor to campus open-source infrastructure and peer algorithms tutoring lead.',
      skills: ['Rust', 'TypeScript', 'Linux', 'Algorithms', 'Technical Writing'],
      github_url: 'https://github.com/rohankulkarni',
      linkedin_url: 'https://linkedin.com/in/rohankulkarni',
      updated_at: '2026-11-10T08:40:00Z',
    },
  ],
  user_roles: [
    { id: 'role-1', user_id: DEMO_IDS.facultyKavita, role: 'faculty' },
    { id: 'role-2', user_id: DEMO_IDS.studentAarav, role: 'student' },
    { id: 'role-3', user_id: DEMO_IDS.studentPriya, role: 'student' },
    { id: 'role-4', user_id: DEMO_IDS.studentRohan, role: 'student' },
  ],
  faculty_student_assignments: [
    {
      id: 'assign-1',
      faculty_id: DEMO_IDS.facultyKavita,
      student_id: DEMO_IDS.studentAarav,
      cohort_term: 'Autumn 2026',
      assigned_at: '2026-08-01T08:00:00Z',
    },
    {
      id: 'assign-2',
      faculty_id: DEMO_IDS.facultyKavita,
      student_id: DEMO_IDS.studentPriya,
      cohort_term: 'Autumn 2026',
      assigned_at: '2026-08-01T08:00:00Z',
    },
    {
      id: 'assign-3',
      faculty_id: DEMO_IDS.facultyKavita,
      student_id: DEMO_IDS.studentRohan,
      cohort_term: 'Autumn 2026',
      assigned_at: '2026-08-01T08:00:00Z',
    },
  ],
  activities: [
    {
      id: 'act-101',
      student_id: DEMO_IDS.studentAarav,
      title: 'Urban Air Quality Sensor Calibration Study',
      category: 'Research',
      organization: 'Campus Environmental Sensing Lab',
      activity_date: '2026-09-18',
      hours: 48,
      credits: 2.0,
      description:
        'Designed and ran a 6-week field co-location experiment comparing low-cost PM2.5 optical sensors against reference-grade municipal monitors across three campus junctions.',
      outcomes:
        'Published calibration curve dataset (R² = 0.91 after humidity compensation) and presented findings at the Autumn Undergraduate Symposium.',
      status: 'approved',
      created_at: '2026-09-20T10:00:00Z',
      updated_at: '2026-10-02T15:30:00Z',
      submitted_at: '2026-09-25T09:15:00Z',
      reviewed_at: '2026-10-02T15:30:00Z',
    },
    {
      id: 'act-102',
      student_id: DEMO_IDS.studentAarav,
      title: 'Civic Transit Accessibility Audit Internship',
      category: 'Internship',
      organization: 'Metro Mobility Open Data Collective',
      activity_date: '2026-07-30',
      hours: 80,
      credits: 3.0,
      description:
        'Built GTFS-flex data validators and audited 140 bus stop accessibility records with commuter advocacy volunteers during summer placement.',
      outcomes:
        'Reduced missing tactile-paving metadata by 68% across priority corridors and shipped an open validation script.',
      status: 'approved',
      created_at: '2026-08-05T11:00:00Z',
      updated_at: '2026-08-22T16:10:00Z',
      submitted_at: '2026-08-12T12:00:00Z',
      reviewed_at: '2026-08-22T16:10:00Z',
    },
    {
      id: 'act-103',
      student_id: DEMO_IDS.studentAarav,
      title: 'National Civic Tech Hackathon — Transit Route Planner',
      category: 'Competition',
      organization: 'OpenGov India',
      activity_date: '2026-11-08',
      hours: 36,
      credits: 1.5,
      description:
        'Led frontend engineering for a 4-person team building an offline-capable step-free route advisor for commuter rail stations.',
      outcomes:
        'Awarded 2nd Runner-Up among 64 university teams; prototype open-sourced under MIT license.',
      status: 'submitted',
      created_at: '2026-11-10T09:30:00Z',
      updated_at: '2026-11-19T14:20:00Z',
      submitted_at: '2026-11-19T14:20:00Z',
      reviewed_at: null,
    },
    {
      id: 'act-104',
      student_id: DEMO_IDS.studentAarav,
      title: 'Weekend Digital Literacy Clinic for Senior Citizens',
      category: 'Community',
      organization: 'Neighborhood Public Library',
      activity_date: '2026-10-25',
      hours: 18,
      credits: 1.0,
      description:
        'Co-facilitated three Sunday morning clinics helping 42 senior residents configure smartphone accessibility settings, UPI safety checks, and telehealth portals.',
      outcomes:
        'Created a bilingual large-print troubleshooting booklet now stocked at the library reference desk.',
      status: 'changes_requested',
      created_at: '2026-10-27T17:00:00Z',
      updated_at: '2026-11-04T10:45:00Z',
      submitted_at: '2026-10-29T08:50:00Z',
      reviewed_at: '2026-11-04T10:45:00Z',
    },
    {
      id: 'act-105',
      student_id: DEMO_IDS.studentAarav,
      title: 'Embedded Rust & Edge Telemetry Workshop Series',
      category: 'Workshop',
      organization: 'IEEE Student Chapter',
      activity_date: '2026-11-21',
      hours: 12,
      credits: 0.5,
      description:
        'Preparing a hands-on 2-session introductory lab teaching STM32 timers and DMA serial logging to second-year students.',
      outcomes:
        'Drafting lab handout and starter repository prior to final submission.',
      status: 'draft',
      created_at: '2026-11-21T16:15:00Z',
      updated_at: '2026-11-22T09:00:00Z',
      submitted_at: null,
      reviewed_at: null,
    },
    {
      id: 'act-201',
      student_id: DEMO_IDS.studentPriya,
      title: 'Rural Primary Clinic Triage Signage Field Study',
      category: 'Research',
      organization: 'Community Health Design Studio',
      activity_date: '2026-10-14',
      hours: 54,
      credits: 2.5,
      description:
        'Conducted contextual inquiry across four district primary health centers to redesign bilingual color-and-icon wayfinding boards.',
      outcomes:
        'Reduced patient intake desk redirections by 41% in a 2-week pilot evaluation.',
      status: 'approved',
      created_at: '2026-10-16T10:00:00Z',
      updated_at: '2026-10-24T11:20:00Z',
      submitted_at: '2026-10-18T14:00:00Z',
      reviewed_at: '2026-10-24T11:20:00Z',
    },
    {
      id: 'act-202',
      student_id: DEMO_IDS.studentPriya,
      title: 'Design Systems Mentorship Lead — Freshers Studio',
      category: 'Leadership',
      organization: 'Department Design Guild',
      activity_date: '2026-11-15',
      hours: 24,
      credits: 1.0,
      description:
        'Organized weekly critique circles and typography fundamentals workshops for 35 incoming interaction design students.',
      outcomes:
        'Reviewed 35 foundational portfolio spreads and compiled a shared grid-system starter kit.',
      status: 'submitted',
      created_at: '2026-11-16T09:00:00Z',
      updated_at: '2026-11-18T17:10:00Z',
      submitted_at: '2026-11-18T17:10:00Z',
      reviewed_at: null,
    },
    {
      id: 'act-301',
      student_id: DEMO_IDS.studentRohan,
      title: 'Campus Algorithms & Systems Peer Tutoring',
      category: 'Community',
      organization: 'Academic Support Center',
      activity_date: '2026-10-30',
      hours: 28,
      credits: 1.0,
      description:
        'Ran twice-weekly office hours covering graph traversal, memory allocation, and debugging with Valgrind.',
      outcomes:
        'Supported 26 first- and second-year students across midterm preparation.',
      status: 'approved',
      created_at: '2026-11-01T10:30:00Z',
      updated_at: '2026-11-09T13:15:00Z',
      submitted_at: '2026-11-02T12:00:00Z',
      reviewed_at: '2026-11-09T13:15:00Z',
    },
    {
      id: 'act-302',
      student_id: DEMO_IDS.studentRohan,
      title: 'Self-Paced Online Video Course Completion',
      category: 'Workshop',
      organization: 'External MOOC Platform',
      activity_date: '2026-09-05',
      hours: 10,
      credits: 0.5,
      description:
        'Watched introductory shell scripting lectures without graded lab project deliverables.',
      outcomes: 'Completed lecture videos.',
      status: 'rejected',
      created_at: '2026-09-08T10:00:00Z',
      updated_at: '2026-09-14T16:40:00Z',
      submitted_at: '2026-09-09T11:00:00Z',
      reviewed_at: '2026-09-14T16:40:00Z',
    },
    {
      id: 'act-303',
      student_id: DEMO_IDS.studentRohan,
      title: 'Open-Source CLI Log Parser Contribution',
      category: 'Research',
      organization: 'Campus Systems Lab',
      activity_date: '2026-11-17',
      hours: 22,
      credits: 1.0,
      description:
        'Implemented zero-copy JSON line streaming benchmarks and added regression tests for malformed UTF-8 payloads.',
      outcomes:
        'Merged PR #148 into departmental telemetry toolkit with 35% throughput improvement.',
      status: 'submitted',
      created_at: '2026-11-18T11:10:00Z',
      updated_at: '2026-11-20T09:30:00Z',
      submitted_at: '2026-11-20T09:30:00Z',
      reviewed_at: null,
    },
  ],
  activity_evidence: [
    {
      id: 'ev-101',
      activity_id: 'act-101',
      student_id: DEMO_IDS.studentAarav,
      file_name: 'symposium-calibration-certificate.svg',
      file_path: 'activity-evidence/stu-aarav-mehta/act-101/symposium-calibration-certificate.svg',
      mime_type: 'image/svg+xml',
      file_size: 2480,
      uploaded_at: '2026-09-25T09:10:00Z',
      preview_data_url: makeSvgDocPreview(
        'Autumn Research Symposium',
        'Aarav Mehta · Urban Air Quality Sensor Calibration Study',
        'SYM-2026-ENV-041'
      ),
    },
    {
      id: 'ev-102',
      activity_id: 'act-102',
      student_id: DEMO_IDS.studentAarav,
      file_name: 'metro-mobility-completion-letter.svg',
      file_path: 'activity-evidence/stu-aarav-mehta/act-102/metro-mobility-completion-letter.svg',
      mime_type: 'image/svg+xml',
      file_size: 2510,
      uploaded_at: '2026-08-12T11:55:00Z',
      preview_data_url: makeSvgDocPreview(
        'Internship Completion Certificate',
        'Metro Mobility Open Data Collective · 80 Verified Hours',
        'MM-INT-2026-19'
      ),
    },
    {
      id: 'ev-103',
      activity_id: 'act-103',
      student_id: DEMO_IDS.studentAarav,
      file_name: 'opengov-hackathon-award.svg',
      file_path: 'activity-evidence/stu-aarav-mehta/act-103/opengov-hackathon-award.svg',
      mime_type: 'image/svg+xml',
      file_size: 2430,
      uploaded_at: '2026-11-19T14:15:00Z',
      preview_data_url: makeSvgDocPreview(
        'OpenGov Civic Tech Citation',
        '2nd Runner-Up · Step-Free Commuter Route Planner',
        'OGI-HACK-2026-03'
      ),
    },
    {
      id: 'ev-104',
      activity_id: 'act-104',
      student_id: DEMO_IDS.studentAarav,
      file_name: 'library-clinic-attendance-notes.txt',
      file_path: 'activity-evidence/stu-aarav-mehta/act-104/library-clinic-attendance-notes.txt',
      mime_type: 'text/plain',
      file_size: 412,
      uploaded_at: '2026-10-29T08:45:00Z',
      preview_data_url: makeTextNotePreview(
        'NEIGHBORHOOD PUBLIC LIBRARY — DIGITAL LITERACY CLINIC LOG\n' +
          'Facilitator: Aarav Mehta (CS-2024-041)\n' +
          'Session 1 (Oct 11): 14 attendees · Accessibility font & screen reader setup\n' +
          'Session 2 (Oct 18): 15 attendees · Telehealth & safe payments orientation\n' +
          'Session 3 (Oct 25): 13 attendees · Q&A and bilingual guide distribution\n' +
          'Note: Pending signed librarian endorsement sheet.'
      ),
    },
    {
      id: 'ev-201',
      activity_id: 'act-201',
      student_id: DEMO_IDS.studentPriya,
      file_name: 'clinic-wayfinding-pilot-report.svg',
      file_path: 'activity-evidence/stu-priya-nair/act-201/clinic-wayfinding-pilot-report.svg',
      mime_type: 'image/svg+xml',
      file_size: 2490,
      uploaded_at: '2026-10-18T13:50:00Z',
      preview_data_url: makeSvgDocPreview(
        'Field Study Verification',
        'Priya Nair · Rural Clinic Triage Wayfinding Pilot (41% reduction)',
        'CHDS-2026-088'
      ),
    },
    {
      id: 'ev-202',
      activity_id: 'act-202',
      student_id: DEMO_IDS.studentPriya,
      file_name: 'design-guild-roster-summary.txt',
      file_path: 'activity-evidence/stu-priya-nair/act-202/design-guild-roster-summary.txt',
      mime_type: 'text/plain',
      file_size: 320,
      uploaded_at: '2026-11-18T17:05:00Z',
      preview_data_url: makeTextNotePreview(
        'DEPARTMENT DESIGN GUILD — FRESHERS MENTORSHIP LOG\n' +
          'Lead Mentor: Priya Nair (ID-2023-018)\n' +
          'Sessions Conducted: 6 critique circles (4 hrs each)\n' +
          'Cohort Size: 35 first-year interaction design students'
      ),
    },
    {
      id: 'ev-301',
      activity_id: 'act-301',
      student_id: DEMO_IDS.studentRohan,
      file_name: 'tutoring-center-timesheet.svg',
      file_path: 'activity-evidence/stu-rohan-kulkarni/act-301/tutoring-center-timesheet.svg',
      mime_type: 'image/svg+xml',
      file_size: 2390,
      uploaded_at: '2026-11-02T11:50:00Z',
      preview_data_url: makeSvgDocPreview(
        'Academic Support Center Log',
        'Rohan Kulkarni · 28 Verified Peer Tutoring Hours',
        'ASC-TUT-2026-112'
      ),
    },
    {
      id: 'ev-303',
      activity_id: 'act-303',
      student_id: DEMO_IDS.studentRohan,
      file_name: 'benchmark-results-pr148.txt',
      file_path: 'activity-evidence/stu-rohan-kulkarni/act-303/benchmark-results-pr148.txt',
      mime_type: 'text/plain',
      file_size: 380,
      uploaded_at: '2026-11-20T09:25:00Z',
      preview_data_url: makeTextNotePreview(
        'CAMPUS SYSTEMS LAB — PR #148 BENCHMARK SUMMARY\n' +
          'Author: Rohan Kulkarni (CS-2025-112)\n' +
          'Baseline throughput: 410 MB/s\n' +
          'Zero-copy streaming parser: 554 MB/s (+35.1%)\n' +
          'Unit & fuzz test suite: 48/48 passing'
      ),
    },
  ],
  activity_reviews: [
    {
      id: 'rev-101',
      activity_id: 'act-101',
      reviewer_id: DEMO_IDS.facultyKavita,
      decision: 'approved',
      feedback:
        'Strong experimental rigor and clear humidity compensation methodology. Symposium citation verified. Full 2.0 research credits approved.',
      created_at: '2026-10-02T15:30:00Z',
    },
    {
      id: 'rev-102',
      activity_id: 'act-102',
      reviewer_id: DEMO_IDS.facultyKavita,
      decision: 'approved',
      feedback:
        'Completion letter and GTFS validation deliverables confirmed with host supervisor. Approved for 3.0 internship credits.',
      created_at: '2026-08-22T16:10:00Z',
    },
    {
      id: 'rev-104',
      activity_id: 'act-104',
      reviewer_id: DEMO_IDS.facultyKavita,
      decision: 'changes_requested',
      feedback:
        'Great community impact. Please upload a signed confirmation scan or photo from the Public Library branch coordinator before resubmitting.',
      created_at: '2026-11-04T10:45:00Z',
    },
    {
      id: 'rev-201',
      activity_id: 'act-201',
      reviewer_id: DEMO_IDS.facultyKavita,
      decision: 'approved',
      feedback:
        'Well-documented field observations with measurable intake improvement. Approved for 2.5 research credits.',
      created_at: '2026-10-24T11:20:00Z',
    },
    {
      id: 'rev-301',
      activity_id: 'act-301',
      reviewer_id: DEMO_IDS.facultyKavita,
      decision: 'approved',
      feedback:
        'Verified directly with the Academic Support Center coordinator. Consistent mentoring record.',
      created_at: '2026-11-09T13:15:00Z',
    },
    {
      id: 'rev-302',
      activity_id: 'act-302',
      reviewer_id: DEMO_IDS.facultyKavita,
      decision: 'rejected',
      feedback:
        'Passive video completion without an assessed capstone artifact or verifiable supervisor sign-off does not qualify for portfolio credit under department guidelines.',
      created_at: '2026-09-14T16:40:00Z',
    },
  ],
  projects: [
    {
      id: 'proj-101',
      student_id: DEMO_IDS.studentAarav,
      title: 'AirSense Campus Mesh',
      tagline: 'Real-time microclimate & PM2.5 calibration dashboard for campus walkways',
      description:
        'Aggregates readings from six ESP32 particulate nodes, applies humidity regression models developed during the Autumn calibration study, and surfaces hourly exposure advisories.',
      tech_stack: ['TypeScript', 'React', 'Python', 'MQTT', 'ESP32'],
      role_label: 'Lead Hardware & Frontend Developer',
      demo_url: 'https://airsense-demo.example.edu',
      repo_url: 'https://github.com/aaravmehta/airsense-campus-mesh',
      semester: 'Autumn 2026',
      featured: true,
      linked_activity_id: 'act-101',
      created_at: '2026-09-28T12:00:00Z',
      updated_at: '2026-10-15T10:00:00Z',
    },
    {
      id: 'proj-102',
      student_id: DEMO_IDS.studentAarav,
      title: 'StepFree Transit Map',
      tagline: 'Offline-first commuter rail accessibility & elevator outage companion',
      description:
        'Built during the OpenGov Civic Tech Hackathon using GTFS-flex data to flag step-free station entrances, tactile paths, and crowd-verified ramp conditions.',
      tech_stack: ['React', 'IndexedDB', 'GTFS', 'Tailwind CSS'],
      role_label: 'Frontend & Data Pipeline Lead',
      demo_url: 'https://stepfree-transit.example.edu',
      repo_url: 'https://github.com/aaravmehta/stepfree-transit',
      semester: 'Autumn 2026',
      featured: false,
      linked_activity_id: 'act-103',
      created_at: '2026-11-09T18:00:00Z',
      updated_at: '2026-11-12T09:20:00Z',
    },
    {
      id: 'proj-201',
      student_id: DEMO_IDS.studentPriya,
      title: 'Swasthya Wayfinder Kit',
      tagline: 'Modular bilingual triage signage system for rural primary health centers',
      description:
        'Printable and digital iconographic navigation suite tested across four primary clinics to help first-time patients locate registration, pharmacy, and maternal care wings.',
      tech_stack: ['Figma', 'SVG Systems', 'Print Specs', 'User Research'],
      role_label: 'Lead Service Designer',
      demo_url: 'https://swasthya-wayfinder.example.edu',
      repo_url: 'https://github.com/priyanair-design/swasthya-wayfinder',
      semester: 'Autumn 2026',
      featured: true,
      linked_activity_id: 'act-201',
      created_at: '2026-10-20T11:00:00Z',
      updated_at: '2026-10-28T15:30:00Z',
    },
    {
      id: 'proj-301',
      student_id: DEMO_IDS.studentRohan,
      title: 'LogStream Zero',
      tagline: 'SIMD-friendly zero-copy NDJSON telemetry parser written in Rust',
      description:
        'Streaming command-line parser designed for high-volume embedded sensor logs with strict UTF-8 recovery and deterministic memory ceilings.',
      tech_stack: ['Rust', 'Criterion', 'CLI', 'GitHub Actions'],
      role_label: 'Core Contributor',
      demo_url: 'https://logstream-bench.example.edu',
      repo_url: 'https://github.com/rohankulkarni/logstream-zero',
      semester: 'Autumn 2026',
      featured: true,
      linked_activity_id: 'act-303',
      created_at: '2026-11-18T14:00:00Z',
      updated_at: '2026-11-20T09:40:00Z',
    },
  ],
};
