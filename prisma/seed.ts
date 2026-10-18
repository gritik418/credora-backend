import 'dotenv/config';
import { createHash } from 'node:crypto';
import { PrismaPg } from '@prisma/adapter-pg';
import bcrypt from 'bcrypt';
import { PrismaClient } from '../generated/prisma/client';

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('DATABASE_URL is required to run the seeder.');
}

const parsedUrl = new URL(connectionString);

console.log('Database host:', parsedUrl.hostname);
console.log('Database port:', parsedUrl.port || '5432');
console.log('Database name:', parsedUrl.pathname.slice(1));

const prisma = new PrismaClient({
  adapter: new PrismaPg({
    connectionString,
  }),
});

const MAIN_USER_ID = 'cmtbdx7d300002zpfujr3r93h';
const UNTOUCHED_USER_ID = 'cmusfi2bd00002zmup11dvotr';

const ADMIN_USERNAME = 'credora_demo_admin';
const ADMIN_EMAIL = process.env.SEED_ADMIN_EMAIL ?? 'admin@credora.test';
const ADMIN_PASSWORD = process.env.SEED_ADMIN_PASSWORD;

const TOTAL_EMPLOYEES = 199;
const TOTAL_POSTS = 450;

const firstNames = [
  'Aarav',
  'Aditi',
  'Aditya',
  'Ananya',
  'Arjun',
  'Diya',
  'Ishaan',
  'Kavya',
  'Krishna',
  'Meera',
  'Neha',
  'Nikhil',
  'Priya',
  'Rahul',
  'Riya',
  'Rohan',
  'Saanvi',
  'Sahil',
  'Shreya',
  'Varun',
  'Vikram',
  'Yash',
  'Simran',
  'Karan',
  'Ankit',
  'Isha',
  'Dev',
  'Pooja',
  'Manav',
  'Tanya',
];

const lastNames = [
  'Sharma',
  'Verma',
  'Gupta',
  'Singh',
  'Patel',
  'Kumar',
  'Malhotra',
  'Mehta',
  'Kapoor',
  'Joshi',
  'Yadav',
  'Reddy',
  'Shah',
  'Mishra',
  'Arora',
  'Bansal',
  'Saxena',
  'Chopra',
  'Saini',
  'Khanna',
];

const cities = [
  'Gurugram',
  'Delhi',
  'Noida',
  'Bengaluru',
  'Hyderabad',
  'Pune',
  'Mumbai',
  'Chandigarh',
  'Jaipur',
  'Chennai',
];

const professions = [
  {
    profession: 'Software Developer',
    industry: 'IT',
    headline: 'Building reliable web applications',
    skills: ['javascript', 'typescript', 'react', 'nodejs'],
  },
  {
    profession: 'Frontend Developer',
    industry: 'IT',
    headline: 'Creating thoughtful digital experiences',
    skills: ['javascript', 'typescript', 'react', 'tailwind-css'],
  },
  {
    profession: 'Backend Developer',
    industry: 'IT',
    headline: 'Building scalable backend systems',
    skills: ['nodejs', 'nestjs', 'postgresql', 'redis'],
  },
  {
    profession: 'Full Stack Developer',
    industry: 'IT',
    headline: 'Turning ideas into full-stack products',
    skills: ['javascript', 'react', 'nodejs', 'mongodb'],
  },
  {
    profession: 'UI/UX Designer',
    industry: 'Design',
    headline: 'Designing intuitive user experiences',
    skills: ['figma', 'ui-design', 'ux-design', 'prototyping'],
  },
  {
    profession: 'Data Analyst',
    industry: 'Analytics',
    headline: 'Making data useful for better decisions',
    skills: ['python', 'sql', 'excel', 'data-analysis'],
  },
  {
    profession: 'AI Engineer',
    industry: 'Artificial Intelligence',
    headline: 'Exploring practical applications of AI',
    skills: ['python', 'machine-learning', 'llm', 'langchain'],
  },
  {
    profession: 'Product Manager',
    industry: 'Product',
    headline: 'Connecting user needs with product strategy',
    skills: ['product-management', 'analytics', 'communication'],
  },
  {
    profession: 'DevOps Engineer',
    industry: 'IT',
    headline: 'Improving deployment and infrastructure reliability',
    skills: ['docker', 'aws', 'linux', 'ci-cd'],
  },
  {
    profession: 'Mobile Developer',
    industry: 'IT',
    headline: 'Building useful mobile experiences',
    skills: ['javascript', 'react-native', 'typescript', 'git'],
  },
];

const institutions = [
  'Chandigarh University',
  'Kurukshetra University',
  'Delhi University',
  'Guru Gobind Singh Indraprastha University',
  'Lovely Professional University',
  'Amity University',
  'Panjab University',
  'Thapar Institute of Engineering and Technology',
  'National Institute of Technology Kurukshetra',
  'Chitkara University',
  'Maharishi Markandeshwar University',
  'Dr. A.P.J. Abdul Kalam Technical University',
];

const companies = [
  'TechNova Solutions',
  'PixelCraft Labs',
  'CloudBridge Technologies',
  'NextWave Digital',
  'Vertex Software',
  'InnovateX Labs',
  'BrightPath Systems',
  'Nexora Technologies',
  'BlueOrbit Solutions',
  'ScaleUp Digital',
  'CodeSphere Technologies',
  'QuantumStack Labs',
];

const skillDefinitions = [
  ['JavaScript', 'javascript'],
  ['TypeScript', 'typescript'],
  ['React', 'react'],
  ['Next.js', 'nextjs'],
  ['Node.js', 'nodejs'],
  ['NestJS', 'nestjs'],
  ['Express.js', 'expressjs'],
  ['Python', 'python'],
  ['Django', 'django'],
  ['PostgreSQL', 'postgresql'],
  ['MongoDB', 'mongodb'],
  ['MySQL', 'mysql'],
  ['Redis', 'redis'],
  ['Docker', 'docker'],
  ['AWS', 'aws'],
  ['Git', 'git'],
  ['Tailwind CSS', 'tailwind-css'],
  ['Figma', 'figma'],
  ['UI Design', 'ui-design'],
  ['UX Design', 'ux-design'],
  ['Prototyping', 'prototyping'],
  ['SQL', 'sql'],
  ['Excel', 'excel'],
  ['Data Analysis', 'data-analysis'],
  ['Machine Learning', 'machine-learning'],
  ['Large Language Models', 'llm'],
  ['LangChain', 'langchain'],
  ['React Native', 'react-native'],
  ['CI/CD', 'ci-cd'],
  ['Linux', 'linux'],
  ['Product Management', 'product-management'],
  ['Communication', 'communication'],
];

const hashtags = [
  'webdevelopment',
  'technology',
  'careergrowth',
  'softwareengineering',
  'productivity',
  'learning',
  'programming',
  'design',
  'artificialintelligence',
  'opensource',
  'networking',
  'buildinpublic',
];

const postTemplates = [
  (name: string, skill: string) =>
    `${name} here! Recently, I've been exploring ${skill}. The biggest takeaway so far is that consistent practice and building real projects make a huge difference. What has helped you improve in this area?`,
  (name: string, skill: string) =>
    `A small reminder from my learning journey: getting better at ${skill} takes patience. I've been focusing on understanding the fundamentals instead of rushing through tutorials. Sharing this in case someone else needs the reminder. — ${name}`,
  (name: string, skill: string) =>
    `I've been working on improving my ${skill} workflow lately. Breaking larger problems into smaller, manageable steps has made my work much more structured. Always learning, always improving. #buildinpublic`,
  (name: string, skill: string) =>
    `One thing I appreciate about working in technology is how much there is to learn. This week, ${name} is focusing on ${skill} and finding better ways to turn ideas into practical solutions.`,
  (name: string, skill: string) =>
    `Progress update: I've been investing time in ${skill}, experimenting with different approaches, and documenting what I learn. The small improvements add up. What are you currently learning?`,
  (name: string, skill: string) =>
    `Good software isn't just about making something work. It's about making it understandable, maintainable, and useful. I've been keeping that in mind while improving my ${skill} skills. — ${name}`,
  (name: string, skill: string) =>
    `A lesson I've learned recently: feedback is part of the process, not the end of it. I'm applying that mindset while working with ${skill} and trying to improve one iteration at a time.`,
  (name: string, skill: string) =>
    `Sharing a little career update: I'm continuing to grow my skills in ${skill}, learn from other developers, and build projects that solve real problems. Looking forward to connecting with people on a similar journey.`,
];

const profileBios = [
  'I enjoy solving problems, learning new technologies, and collaborating with people who care about building useful products.',
  'Curious professional who values continuous learning, thoughtful collaboration, and turning ideas into practical solutions.',
  'Focused on developing strong fundamentals, sharing knowledge, and contributing to meaningful projects.',
  'I believe in learning by building, staying open to feedback, and improving a little every day.',
  'Interested in technology, product development, and finding simple solutions to complex problems.',
];

const getDeterministicUuid = (value: string) => {
  const chars = createHash('sha256')
    .update(value)
    .digest('hex')
    .slice(0, 32)
    .split('');

  chars[12] = '4';
  chars[16] = ((parseInt(chars[16], 16) & 3) | 8).toString(16);

  const hex = chars.join('');

  return [
    hex.slice(0, 8),
    hex.slice(8, 12),
    hex.slice(12, 16),
    hex.slice(16, 20),
    hex.slice(20),
  ].join('-');
};

const getProfileForIndex = (index: number) =>
  professions[index % professions.length];

const getMockUser = (index: number) => {
  const firstName = firstNames[index % firstNames.length];
  const lastName =
    lastNames[Math.floor(index / firstNames.length) % lastNames.length];

  const username = `credora_user_${String(index + 1).padStart(3, '0')}`;
  const profession = getProfileForIndex(index);

  return {
    id: `credora-seed-user-${String(index + 1).padStart(3, '0')}`,
    name: `${firstName} ${lastName}`,
    username,
    email: `${username}@credora.test`,
    profession,
    city: cities[index % cities.length],
    institution: institutions[index % institutions.length],
    company: companies[index % companies.length],
    avatar: null as string | null,
    bio: profileBios[index % profileBios.length],
  };
};

const main = async () => {
  if (!ADMIN_PASSWORD || ADMIN_PASSWORD.length < 12) {
    throw new Error(
      'Set SEED_ADMIN_PASSWORD to a password of at least 12 characters.',
    );
  }

  console.log('Starting Credora seeder...');

  const mainAccount = await prisma.user.updateMany({
    where: {
      id: MAIN_USER_ID,
    },
    data: {
      isVerified: true,
    },
  });

  if (mainAccount.count === 0) {
    console.warn(
      'Main account was not found. No account was created or modified for that ID.',
    );
  } else {
    console.log('Verified the main account without changing other fields.');
  }

  const untouchedAccount = await prisma.user.findUnique({
    where: {
      id: UNTOUCHED_USER_ID,
    },
    select: {
      id: true,
      username: true,
    },
  });

  if (untouchedAccount) {
    console.log(
      `Preserving existing account "${untouchedAccount.username}" without modifications.`,
    );
  }

  const skillNames = skillDefinitions.map(([name]) => name);
  const duplicateSkillNames = skillNames.filter(
    (name, index) => skillNames.indexOf(name) !== index,
  );

  if (duplicateSkillNames.length > 0) {
    throw new Error(
      `Duplicate skill names: ${[...new Set(duplicateSkillNames)].join(', ')}`,
    );
  }

  const skillRecords = await Promise.all(
    skillDefinitions.map(([name, slug]) =>
      prisma.skill.upsert({
        where: { name },
        update: { slug },
        create: { name, slug },
      }),
    ),
  );
  const skillsBySlug = new Map(
    skillRecords.map((skill) => [skill.slug, skill]),
  );

  const hashedAdminPassword = await bcrypt.hash(ADMIN_PASSWORD, 12);

  const admin = await prisma.user.upsert({
    where: {
      username: ADMIN_USERNAME,
    },
    update: {
      name: 'Credora Demo Admin',
      email: ADMIN_EMAIL,
      password: hashedAdminPassword,
      role: 'ADMIN',
      isEmailVerified: true,
      isActive: true,
      isVerified: true,
    },
    create: {
      id: 'credora-seed-admin',
      name: 'Credora Demo Admin',
      username: ADMIN_USERNAME,
      email: ADMIN_EMAIL,
      password: hashedAdminPassword,
      role: 'ADMIN',
      isEmailVerified: true,
      isActive: true,
      isVerified: true,
      verifiedAt: new Date(),
    },
  });

  type DemoUser = {
    id: string;
    name: string;
    username: string;
    email: string;
    profession: (typeof professions)[number];
  };

  const demoUsers: DemoUser[] = [];

  for (let index = 0; index < TOTAL_EMPLOYEES; index++) {
    const data = getMockUser(index);

    const user = await prisma.user.upsert({
      where: {
        username: data.username,
      },
      update: {
        name: data.name,
        email: data.email,
        isEmailVerified: true,
        isActive: true,
        role: 'EMPLOYEE',
      },
      create: {
        id: data.id,
        name: data.name,
        username: data.username,
        email: data.email,
        isEmailVerified: true,
        isActive: true,
        role: 'EMPLOYEE',
      },
    });

    const selectedSkills = data.profession.skills
      .map((slug) => skillsBySlug.get(slug))
      .filter((skill) => skill !== undefined);

    const skillConnections = selectedSkills.map((skill) => ({
      id: skill.id,
    }));

    const profileData = {
      headline: data.profession.headline,
      profession: data.profession.profession,
      industry: data.profession.industry,
      bio: data.bio,
      city: data.city,
      state: 'Haryana',
      country: 'India',
      isOpenToWork: index % 3 === 0,
      isOpenToCollaborate: index % 4 === 0,
    };

    const profile = await prisma.profile.upsert({
      where: {
        userId: user.id,
      },
      update: {
        ...profileData,
        skills: {
          set: skillConnections,
        },
      },
      create: {
        userId: user.id,
        ...profileData,
        skills: {
          connect: skillConnections,
        },
      },
      select: {
        id: true,
      },
    });

    await prisma.education.deleteMany({
      where: {
        profileId: profile.id,
      },
    });

    await prisma.experience.deleteMany({
      where: {
        profileId: profile.id,
      },
    });

    await prisma.education.createMany({
      data: [
        {
          id: `seed-edu-${index + 1}-1`,
          profileId: profile.id,
          institution: data.institution,
          degree:
            index % 2 === 0
              ? 'Bachelor of Technology'
              : 'Bachelor of Computer Applications',
          fieldOfStudy:
            index % 2 === 0 ? 'Computer Science' : 'Information Technology',
          startDate: new Date('2020-07-01'),
          endDate: new Date('2024-06-30'),
          grade: `${7 + (index % 3) * 0.5} CGPA`,
          description:
            'Focused on core concepts, projects, and practical learning.',
          isCurrentlyStudying: false,
        },
      ],
    });

    await prisma.experience.createMany({
      data: [
        {
          id: `seed-exp-${index + 1}-1`,
          profileId: profile.id,
          company: data.company,
          position: data.profession.profession,
          employmentType: 'FULL_TIME',
          startDate: new Date('2024-07-01'),
          endDate: index % 3 === 0 ? null : new Date('2026-06-30'),
          isCurrentlyWorking: index % 3 === 0,
          location: data.city,
          description:
            'Contributing to product development, collaborating with teammates, and improving technical skills.',
        },
      ],
    });

    demoUsers.push({
      id: user.id,
      name: user.name,
      username: user.username,
      email: user.email,
      profession: data.profession,
    });

    if ((index + 1) % 25 === 0) {
      console.log(`Seeded ${index + 1}/${TOTAL_EMPLOYEES} employee accounts.`);
    }
  }

  type PostAuthor = {
    id: string;
    name: string;
    profession: (typeof professions)[number];
  };

  const postAuthors: PostAuthor[] = [
    {
      id: admin.id,
      name: admin.name,
      profession: professions[0],
    },
    ...demoUsers.map((user) => ({
      id: user.id,
      name: user.name,
      profession: user.profession,
    })),
  ];

  const hashtagRecords = await Promise.all(
    hashtags.map((name) =>
      prisma.hashtag.upsert({
        where: {
          slug: name,
        },
        update: {},
        create: {
          name: `#${name}`,
          slug: name,
        },
        select: {
          id: true,
          slug: true,
        },
      }),
    ),
  );

  const postHashtagRows: {
    postId: string;
    hashtagId: string;
  }[] = [];

  for (let index = 0; index < TOTAL_POSTS; index++) {
    const author = postAuthors[index % postAuthors.length];
    const template = postTemplates[index % postTemplates.length];
    const skill =
      author.profession.skills[index % author.profession.skills.length];
    const postId = getDeterministicUuid(`credora-seed-post-${index + 1}`);

    const content = template(author.name, skill);

    const publishedAt = new Date(
      Date.now() - (index % 180) * 24 * 60 * 60 * 1000,
    );

    await prisma.post.upsert({
      where: {
        id: postId,
      },
      update: {
        content,
        visibility: 'PUBLIC',
        status: 'PUBLISHED',
        publishedAt,
      },
      create: {
        id: postId,
        content,
        authorId: author.id,
        visibility: 'PUBLIC',
        status: 'PUBLISHED',
        publishedAt,
      },
    });

    const firstHashtag = hashtagRecords[index % hashtagRecords.length];
    const secondHashtag = hashtagRecords[(index + 3) % hashtagRecords.length];

    postHashtagRows.push(
      {
        postId,
        hashtagId: firstHashtag.id,
      },
      {
        postId,
        hashtagId: secondHashtag.id,
      },
    );

    if ((index + 1) % 50 === 0) {
      console.log(`Seeded ${index + 1}/${TOTAL_POSTS} posts.`);
    }
  }

  await prisma.postHashtag.createMany({
    data: postHashtagRows,
    skipDuplicates: true,
  });

  console.log('');
  console.log('Credora seeding completed successfully.');
  console.log(`Admin username: ${admin.username}`);
  console.log(`Admin email: ${admin.email}`);
  console.log(`Demo employee accounts: ${demoUsers.length}`);
  console.log(`Posts created or updated: ${TOTAL_POSTS}`);
  console.log(`Skills available: ${skillRecords.length}`);
  console.log(`Hashtags available: ${hashtagRecords.length}`);
  console.log('Existing ritik_dev account was not modified.');
};

const runSeeder = async () => {
  try {
    await prisma.$connect();

    const result = await prisma.$queryRaw<
      { current_database: string; server_addr: string | null }[]
    >`SELECT current_database(), inet_server_addr()::text AS server_addr`;

    console.log('Database connection verified:', result);

    await main();
  } catch (error) {
    console.error('Credora seeding failed:', error);
    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
  }
};

void runSeeder();
