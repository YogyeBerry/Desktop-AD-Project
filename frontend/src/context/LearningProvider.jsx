import { useState } from 'react'
import { sampleLearningPaths, sampleResources, sampleStudySessions } from '../data/sampleData'
import { LearningContext } from './LearningContext'

export function LearningProvider({ children }) {
  const [learningPaths, setLearningPaths] = useState(sampleLearningPaths)

  function createLearningPath({ title, description, estimatedMinutes }) {
    const id = `path-${Date.now()}`
    setLearningPaths((paths) => [...paths, { id, title, description, estimatedMinutes, topics: [] }])
    return id
  }

  function updateLearningPath(id, updates) {
    setLearningPaths((paths) => paths.map((path) => path.id === id ? { ...path, ...updates } : path))
  }

  function deleteLearningPath(id) {
    setLearningPaths((paths) => paths.filter((path) => path.id !== id))
  }

  function toggleTopicComplete(topicId) {
    setLearningPaths((paths) => paths.map((path) => ({
      ...path,
      topics: path.topics.map((topic) => topic.id === topicId ? { ...topic, completed: !topic.completed } : topic),
    })))
  }

  const value = {
    learningPaths,
    resources: sampleResources,
    studySessions: sampleStudySessions,
    createLearningPath,
    updateLearningPath,
    deleteLearningPath,
    toggleTopicComplete,
  }

  return <LearningContext.Provider value={value}>{children}</LearningContext.Provider>
}
