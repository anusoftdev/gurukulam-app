import { useQuery } from '@tanstack/react-query'
import { BarChart2 } from 'lucide-react'
import { getMyResults } from '../api/index.ts'
import type { ExamType } from '../types/index.ts'
import { EXAM_TYPE_LABELS } from '../types/index.ts'

const EXAM_TYPES: ExamType[] = ['UNIT_TEST_1', 'UNIT_TEST_2', 'MIDTERM', 'FINAL']

function grade(obtained: number, max: number): { label: string; color: string } {
  const pct = (obtained / max) * 100
  if (pct >= 90) return { label: 'A+', color: 'text-green-700' }
  if (pct >= 75) return { label: 'A',  color: 'text-green-600' }
  if (pct >= 60) return { label: 'B',  color: 'text-blue-600' }
  if (pct >= 45) return { label: 'C',  color: 'text-yellow-600' }
  if (pct >= 33) return { label: 'D',  color: 'text-orange-600' }
  return { label: 'F', color: 'text-red-600' }
}

export default function MyResultsPage() {
  const { data: results = [], isLoading } = useQuery({
    queryKey: ['my-results'], queryFn: getMyResults,
  })

  if (isLoading) return <div className="card animate-pulse h-64" />

  if (results.length === 0) {
    return (
      <div className="space-y-5">
        <h1 className="text-2xl font-bold text-gray-900">My Results</h1>
        <div className="card py-16 text-center">
          <BarChart2 className="w-10 h-10 text-gray-200 mx-auto mb-3" />
          <p className="text-gray-400">No results published yet.</p>
        </div>
      </div>
    )
  }

  // Group results by examType, then by subject
  const byExam: Record<ExamType, typeof results> = {
    UNIT_TEST_1: [], UNIT_TEST_2: [], MIDTERM: [], FINAL: [],
  }
  for (const r of results) byExam[r.examType].push(r)

  // All unique subjects across all results
  const subjectNames = Array.from(new Set(results.map(r => r.subject.name))).sort()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">My Results</h1>
        <p className="text-gray-500 text-sm">Your exam performance — {results[0]?.academicYear?.label}</p>
      </div>

      {EXAM_TYPES.filter(et => byExam[et].length > 0).map(et => {
        const examResults = byExam[et]
        const totalObtained = examResults.reduce((s, r) => s + r.marksObtained, 0)
        const totalMax      = examResults.reduce((s, r) => s + r.maxMarks, 0)
        const pct           = totalMax > 0 ? Math.round((totalObtained / totalMax) * 100) : 0
        const g             = grade(totalObtained, totalMax)

        // build subjectMap for this exam
        const subjectMap: Record<string, typeof results[0]> = {}
        for (const r of examResults) subjectMap[r.subject.name] = r

        return (
          <div key={et} className="card p-0 overflow-hidden">
            {/* Exam header */}
            <div className="px-5 py-4 border-b bg-gray-50 flex items-center justify-between flex-wrap gap-3">
              <h2 className="font-bold text-gray-900">{EXAM_TYPE_LABELS[et]}</h2>
              <div className="flex items-center gap-4 text-sm">
                <span className="text-gray-500">
                  Total: <strong className="text-gray-800">{totalObtained}/{totalMax}</strong>
                </span>
                <span className="text-gray-500">
                  Percentage: <strong className={pct >= 33 ? 'text-green-700' : 'text-red-600'}>{pct}%</strong>
                </span>
                <span className={`font-bold text-lg ${g.color}`}>{g.label}</span>
              </div>
            </div>

            <table className="w-full text-sm">
              <thead className="bg-white border-b">
                <tr>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Subject</th>
                  <th className="px-5 py-3 text-center text-xs font-semibold text-gray-500 uppercase">Marks Obtained</th>
                  <th className="px-5 py-3 text-center text-xs font-semibold text-gray-500 uppercase">Max Marks</th>
                  <th className="px-5 py-3 text-center text-xs font-semibold text-gray-500 uppercase">%</th>
                  <th className="px-5 py-3 text-center text-xs font-semibold text-gray-500 uppercase">Grade</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {examResults.map(r => {
                  const pctSub = Math.round((r.marksObtained / r.maxMarks) * 100)
                  const gr = grade(r.marksObtained, r.maxMarks)
                  return (
                    <tr key={r.id} className="hover:bg-gray-50">
                      <td className="px-5 py-3 font-medium text-gray-900">{r.subject.name}</td>
                      <td className="px-5 py-3 text-center font-semibold text-gray-800">{r.marksObtained}</td>
                      <td className="px-5 py-3 text-center text-gray-500">{r.maxMarks}</td>
                      <td className="px-5 py-3 text-center">
                        <span className={pctSub >= 33 ? 'text-green-700 font-semibold' : 'text-red-600 font-semibold'}>
                          {pctSub}%
                        </span>
                      </td>
                      <td className="px-5 py-3 text-center">
                        <span className={`font-bold ${gr.color}`}>{gr.label}</span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )
      })}
    </div>
  )
}
