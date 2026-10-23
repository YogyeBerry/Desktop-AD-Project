export const sampleLearningPaths = [
  {
    id: 'product-design',
    title: 'Product Design Foundations',
    description: 'Build a practical foundation in user research, interaction design, and prototyping.',
    estimatedMinutes: 900,
    topics: [
      { id: 'design-principles', title: 'Principles of great design', description: 'Explore the fundamentals behind clear, useful, and inclusive products.', estimatedMinutes: 35, completed: true },
      { id: 'user-research', title: 'Getting started with user research', description: 'Learn how to ask better questions and understand user needs.', estimatedMinutes: 50, completed: true },
      { id: 'wireframing', title: 'Wireframing your ideas', description: 'Turn early concepts into simple, testable layouts.', estimatedMinutes: 45, completed: false },
      { id: 'prototyping', title: 'Interactive prototyping', description: 'Connect screens and test the flow of a product experience.', estimatedMinutes: 60, completed: false },
    ],
  },
  {
    id: 'react-development',
    title: 'React Development',
    description: 'Learn to build responsive interfaces with reusable React components.',
    estimatedMinutes: 720,
    topics: [
      { id: 'react-components', title: 'Components and props', description: 'Understand component composition and passing data through props.', estimatedMinutes: 40, completed: true },
      { id: 'react-state', title: 'State and interactions', description: 'Make interfaces respond to user actions with state.', estimatedMinutes: 55, completed: false },
      { id: 'react-routing', title: 'Routing an application', description: 'Create clear navigation for multi-page React applications.', estimatedMinutes: 45, completed: false },
    ],
  },
  {
    id: 'focus-and-learning',
    title: 'Focus & Learning Habits',
    description: 'Develop sustainable routines for focused, effective study sessions.',
    estimatedMinutes: 480,
    topics: [
      { id: 'focus-routines', title: 'Designing a focus routine', description: 'Create a simple routine that helps you get started.', estimatedMinutes: 30, completed: true },
      { id: 'active-recall', title: 'Active recall and review', description: 'Use retrieval practice to strengthen what you learn.', estimatedMinutes: 40, completed: true },
      { id: 'rest-and-recovery', title: 'Rest and recovery', description: 'Balance focused work with breaks and reflection.', estimatedMinutes: 25, completed: true },
    ],
  },
  {
    id: 'visual-storytelling',
    title: 'Visual Storytelling',
    description: 'Use composition, color, and hierarchy to communicate ideas with confidence.',
    estimatedMinutes: 600,
    topics: [
      { id: 'visual-hierarchy', title: 'Visual hierarchy', description: 'Guide attention with scale, contrast, and placement.', estimatedMinutes: 35, completed: false },
      { id: 'color-in-context', title: 'Color in context', description: 'Build thoughtful palettes and use color with intention.', estimatedMinutes: 45, completed: false },
    ],
  },
]

export const sampleResources = [
  { id: 'design-checklist', title: 'Design critique checklist', description: 'A quick framework for reviewing a design with useful questions.', type: 'Document', topicId: 'design-principles', pathId: 'product-design' },
  { id: 'research-guide', title: 'A field guide to user interviews', description: 'Practical guidance for planning and running effective interviews.', type: 'PDF', topicId: 'user-research', pathId: 'product-design' },
  { id: 'figma-prototyping', title: 'Figma prototyping basics', description: 'A short video introduction to interactive prototypes.', type: 'Video', topicId: 'prototyping', pathId: 'product-design' },
  { id: 'react-docs', title: 'React: Thinking in React', description: 'An official guide to breaking a UI into a component hierarchy.', type: 'Website', url: 'https://react.dev/learn/thinking-in-react', topicId: 'react-components', pathId: 'react-development' },
  { id: 'active-recall-notes', title: 'Active recall study notes', description: 'Prompts and examples for making review sessions more effective.', type: 'Document', topicId: 'active-recall', pathId: 'focus-and-learning' },
  { id: 'color-basics', title: 'Color theory essentials', description: 'A visual introduction to color relationships and accessible contrast.', type: 'Video', topicId: 'color-in-context', pathId: 'visual-storytelling' },
]

export const sampleStudySessions = [
  { id: 'session-1', topicId: 'design-principles', date: '2026-10-23', durationMinutes: 35 },
  { id: 'session-2', topicId: 'react-components', date: '2026-10-22', durationMinutes: 40 },
  { id: 'session-3', topicId: 'active-recall', date: '2026-10-21', durationMinutes: 25 },
  { id: 'session-4', topicId: 'user-research', date: '2026-10-20', durationMinutes: 48 },
  { id: 'session-5', topicId: 'focus-routines', date: '2026-10-19', durationMinutes: 30 },
  { id: 'session-6', topicId: 'react-state', date: '2026-10-17', durationMinutes: 35 },
  { id: 'session-7', topicId: 'wireframing', date: '2026-10-16', durationMinutes: 45 },
]

export function getPathProgress(path) {
  if (!path?.topics?.length) return 0
  return Math.round((path.topics.filter((topic) => topic.completed).length / path.topics.length) * 100)
}

export function getPathStatus(path) {
  const progress = getPathProgress(path)
  if (progress === 100) return 'Completed'
  return progress > 0 ? 'In Progress' : 'Not Started'
}

export function formatDuration(minutes = 0) {
  const hours = Math.floor(minutes / 60)
  const remainingMinutes = minutes % 60
  if (!hours) return `${remainingMinutes} min`
  if (!remainingMinutes) return `${hours} hr`
  return `${hours} hr ${remainingMinutes} min`
}
