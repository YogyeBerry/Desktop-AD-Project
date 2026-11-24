const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Seeding initial SkillPath database...');

  // Clean existing records if any
  await prisma.studySession.deleteMany();
  await prisma.resource.deleteMany();
  await prisma.progress.deleteMany();
  await prisma.topic.deleteMany();
  await prisma.learningPath.deleteMany();

  // 1. Learning Path: Product Design Foundations
  const path1 = await prisma.learningPath.create({
    data: {
      id: 'path-product-design',
      title: 'Product Design Foundations',
      description: 'Build a practical foundation in user research, interaction design, and prototyping.',
      topics: {
        create: [
          {
            id: 'topic-design-principles',
            title: 'Principles of great design',
            description: 'Explore the fundamentals behind clear, useful, and inclusive products.',
            estimatedDuration: 35,
            order: 1,
            isCompleted: true,
            progress: { create: { isCompleted: true, completedAt: new Date('2026-10-23T10:00:00Z') } },
            resources: {
              create: [
                {
                  id: 'res-design-checklist',
                  title: 'Design critique checklist',
                  type: 'DOCUMENT',
                  filePath: 'critique-checklist.pdf',
                },
              ],
            },
            studySessions: {
              create: [
                {
                  id: 'session-1',
                  startTime: new Date('2026-10-23T09:00:00Z'),
                  endTime: new Date('2026-10-23T09:35:00Z'),
                  durationSeconds: 2100, // 35 min
                },
              ],
            },
          },
          {
            id: 'topic-user-research',
            title: 'Getting started with user research',
            description: 'Learn how to ask better questions and understand user needs.',
            estimatedDuration: 50,
            order: 2,
            isCompleted: true,
            progress: { create: { isCompleted: true, completedAt: new Date('2026-10-24T14:30:00Z') } },
            resources: {
              create: [
                {
                  id: 'res-research-guide',
                  title: 'A field guide to user interviews',
                  type: 'PDF',
                  filePath: 'user-interviews-guide.pdf',
                },
              ],
            },
            studySessions: {
              create: [
                {
                  id: 'session-user-res',
                  startTime: new Date('2026-10-24T13:40:00Z'),
                  endTime: new Date('2026-10-24T14:30:00Z'),
                  durationSeconds: 3000, // 50 min
                },
              ],
            },
          },
          {
            id: 'topic-wireframing',
            title: 'Wireframing your ideas',
            description: 'Turn early concepts into simple, testable layouts.',
            estimatedDuration: 45,
            order: 3,
            isCompleted: false,
            progress: { create: { isCompleted: false } },
            resources: {
              create: [
                {
                  id: 'res-wireframe-tips',
                  title: 'Wireframing best practices',
                  type: 'WEBSITE',
                  url: 'https://www.interaction-design.org/literature/topics/wireframing',
                },
              ],
            },
          },
          {
            id: 'topic-prototyping',
            title: 'Interactive prototyping',
            description: 'Connect screens and test the flow of a product experience.',
            estimatedDuration: 60,
            order: 4,
            isCompleted: false,
            progress: { create: { isCompleted: false } },
            resources: {
              create: [
                {
                  id: 'res-figma-proto',
                  title: 'Figma prototyping basics',
                  type: 'VIDEO',
                  url: 'https://www.youtube.com/watch?v=mock-figma-video',
                },
              ],
            },
          },
        ],
      },
    },
  });

  // 2. Learning Path: React Development
  const path2 = await prisma.learningPath.create({
    data: {
      id: 'path-react-dev',
      title: 'React Development',
      description: 'Learn to build responsive interfaces with reusable React components.',
      topics: {
        create: [
          {
            id: 'topic-react-components',
            title: 'Components and props',
            description: 'Understand component composition and passing data through props.',
            estimatedDuration: 40,
            order: 1,
            isCompleted: true,
            progress: { create: { isCompleted: true, completedAt: new Date('2026-10-22T11:00:00Z') } },
            resources: {
              create: [
                {
                  id: 'res-react-docs',
                  title: 'React: Thinking in React',
                  type: 'WEBSITE',
                  url: 'https://react.dev/learn/thinking-in-react',
                },
              ],
            },
            studySessions: {
              create: [
                {
                  id: 'session-2',
                  startTime: new Date('2026-10-22T10:20:00Z'),
                  endTime: new Date('2026-10-22T11:00:00Z'),
                  durationSeconds: 2400, // 40 min
                },
              ],
            },
          },
          {
            id: 'topic-react-state',
            title: 'State and interactions',
            description: 'Make interfaces respond to user actions with state.',
            estimatedDuration: 55,
            order: 2,
            isCompleted: false,
            progress: { create: { isCompleted: false } },
          },
          {
            id: 'topic-react-routing',
            title: 'Routing an application',
            description: 'Create clear navigation for multi-page React applications.',
            estimatedDuration: 45,
            order: 3,
            isCompleted: false,
            progress: { create: { isCompleted: false } },
          },
        ],
      },
    },
  });

  // 3. Learning Path: Focus & Learning Habits
  const path3 = await prisma.learningPath.create({
    data: {
      id: 'path-focus-habits',
      title: 'Focus & Learning Habits',
      description: 'Develop sustainable routines for focused, effective study sessions.',
      topics: {
        create: [
          {
            id: 'topic-focus-routines',
            title: 'Designing a focus routine',
            description: 'Create a simple routine that helps you get started.',
            estimatedDuration: 30,
            order: 1,
            isCompleted: true,
            progress: { create: { isCompleted: true, completedAt: new Date('2026-10-20T08:30:00Z') } },
          },
          {
            id: 'topic-active-recall',
            title: 'Active recall and review',
            description: 'Use retrieval practice to strengthen what you learn.',
            estimatedDuration: 40,
            order: 2,
            isCompleted: true,
            progress: { create: { isCompleted: true, completedAt: new Date('2026-10-21T09:00:00Z') } },
            resources: {
              create: [
                {
                  id: 'res-active-recall-notes',
                  title: 'Active recall study notes',
                  type: 'DOCUMENT',
                  filePath: 'active-recall-notes.pdf',
                },
              ],
            },
            studySessions: {
              create: [
                {
                  id: 'session-3',
                  startTime: new Date('2026-10-21T08:35:00Z'),
                  endTime: new Date('2026-10-21T09:00:00Z'),
                  durationSeconds: 1500, // 25 min
                },
              ],
            },
          },
          {
            id: 'topic-rest-recovery',
            title: 'Rest and recovery',
            description: 'Balance focused work with breaks and reflection.',
            estimatedDuration: 25,
            order: 3,
            isCompleted: true,
            progress: { create: { isCompleted: true, completedAt: new Date('2026-10-25T16:00:00Z') } },
          },
        ],
      },
    },
  });

  console.log(`Successfully seeded:`);
  console.log(`- Learning Paths: 3`);
  console.log(`- Topics: 10`);
  console.log(`- Study Sessions: 3`);
  console.log(`- Resources: 5`);
}

main()
  .catch((e) => {
    console.error('Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
