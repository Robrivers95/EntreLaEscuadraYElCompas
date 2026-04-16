import { db } from '@/core/firebase'
import { collection, addDoc, updateDoc, deleteDoc, doc, getDocs, query, where, QueryConstraint } from 'firebase/firestore'
import type { Question } from './types'

const questionsCollection = collection(db, 'questions')

export const questionsService = {
  async addQuestion(question: Omit<Question, 'id' | 'createdAt'>): Promise<string> {
    const docRef = await addDoc(questionsCollection, {
      ...question,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    })
    return docRef.id
  },

  async updateQuestion(id: string, updates: Partial<Question>): Promise<void> {
    const docRef = doc(questionsCollection, id)
    await updateDoc(docRef, {
      ...updates,
      updatedAt: Date.now(),
    })
  },

  async deleteQuestion(id: string): Promise<void> {
    const docRef = doc(questionsCollection, id)
    await deleteDoc(docRef)
  },

  async getQuestions(...constraints: QueryConstraint[]): Promise<Question[]> {
    const q = query(questionsCollection, ...constraints)
    const snapshot = await getDocs(q)
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Question[]
  },

  async getQuestionsByCategory(category: string): Promise<Question[]> {
    return this.getQuestions(where('category', '==', category))
  },

  async getQuestionsByDifficulty(difficulty: string): Promise<Question[]> {
    return this.getQuestions(where('difficulty', '==', difficulty))
  },

  async getQuestionsByCategoryAndDifficulty(
    category: string,
    difficulty: string,
  ): Promise<Question[]> {
    return this.getQuestions(where('category', '==', category), where('difficulty', '==', difficulty))
  },
}
