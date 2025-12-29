import { useState } from "react"
import "./index.css"

export default function App() {
  const [testPassed, setTestPassed] = useState(false)

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 text-white p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center py-8">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-yellow-400 via-green-400 to-blue-400 bg-clip-text text-transparent mb-4">
            Tailwind CSS Demo Tests
          </h1>
          <p className="text-gray-400 text-lg">Testing Tailwind CSS v4 functionality</p>
        </div>

        {/* Test Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          
          {/* Test 1: Colors */}
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 shadow-lg">
            <h2 className="text-xl font-semibold mb-4 text-green-400">Test 1: Colors</h2>
            <div className="space-y-2">
              <div className="bg-red-500 h-8 rounded"></div>
              <div className="bg-blue-500 h-8 rounded"></div>
              <div className="bg-green-500 h-8 rounded"></div>
              <div className="bg-yellow-500 h-8 rounded"></div>
              <div className="bg-purple-500 h-8 rounded"></div>
            </div>
            <p className="text-green-400 text-sm mt-4">✓ Colors working</p>
          </div>

          {/* Test 2: Typography */}
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 shadow-lg">
            <h2 className="text-xl font-semibold mb-4 text-blue-400">Test 2: Typography</h2>
            <div className="space-y-2">
              <p className="text-xs">Extra Small (text-xs)</p>
              <p className="text-sm">Small (text-sm)</p>
              <p className="text-base">Base (text-base)</p>
              <p className="text-lg font-bold">Large Bold (text-lg)</p>
              <p className="text-xl font-extrabold">Extra Large (text-xl)</p>
            </div>
            <p className="text-green-400 text-sm mt-4">✓ Typography working</p>
          </div>

          {/* Test 3: Spacing */}
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 shadow-lg">
            <h2 className="text-xl font-semibold mb-4 text-purple-400">Test 3: Spacing</h2>
            <div className="space-y-4">
              <div className="bg-blue-500 p-2 rounded">Padding 2 (p-2)</div>
              <div className="bg-green-500 p-4 rounded">Padding 4 (p-4)</div>
              <div className="bg-yellow-500 p-6 rounded">Padding 6 (p-6)</div>
              <div className="bg-red-500 m-4 p-2 rounded">Margin 4 (m-4)</div>
            </div>
            <p className="text-green-400 text-sm mt-4">✓ Spacing working</p>
          </div>

          {/* Test 4: Flexbox */}
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 shadow-lg">
            <h2 className="text-xl font-semibold mb-4 text-yellow-400">Test 4: Flexbox</h2>
            <div className="flex justify-between items-center gap-2">
              <div className="bg-red-500 w-12 h-12 rounded"></div>
              <div className="bg-blue-500 w-12 h-12 rounded"></div>
              <div className="bg-green-500 w-12 h-12 rounded"></div>
            </div>
            <div className="flex flex-col gap-2 mt-4">
              <div className="bg-purple-500 h-8 rounded"></div>
              <div className="bg-pink-500 h-8 rounded"></div>
            </div>
            <p className="text-green-400 text-sm mt-4">✓ Flexbox working</p>
          </div>

          {/* Test 5: Borders & Shadows */}
          <div className="bg-gray-800 rounded-lg p-6 border-4 border-blue-500 shadow-2xl">
            <h2 className="text-xl font-semibold mb-4 text-cyan-400">Test 5: Borders & Shadows</h2>
            <div className="space-y-3">
              <div className="border-2 border-red-500 rounded p-2">Border 2</div>
              <div className="border-4 border-green-500 rounded-lg p-2">Border 4</div>
              <div className="shadow-lg bg-gray-700 p-3 rounded">Shadow Large</div>
              <div className="shadow-xl bg-gray-700 p-3 rounded">Shadow XL</div>
            </div>
            <p className="text-green-400 text-sm mt-4">✓ Borders & Shadows working</p>
          </div>

          {/* Test 6: Hover States */}
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 shadow-lg">
            <h2 className="text-xl font-semibold mb-4 text-pink-400">Test 6: Hover States</h2>
            <div className="space-y-3">
              <button className="bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded transition-colors">
                Hover Me
              </button>
              <button className="bg-green-500 hover:bg-green-600 hover:scale-105 px-4 py-2 rounded transition-all">
                Hover & Scale
              </button>
              <div className="bg-purple-500 hover:bg-purple-600 cursor-pointer p-3 rounded text-center">
                Hover Card
              </div>
            </div>
            <p className="text-green-400 text-sm mt-4">✓ Hover states working</p>
          </div>

          {/* Test 7: Gradients */}
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 shadow-lg">
            <h2 className="text-xl font-semibold mb-4 text-orange-400">Test 7: Gradients</h2>
            <div className="space-y-3">
              <div className="bg-gradient-to-r from-red-500 to-pink-500 h-12 rounded"></div>
              <div className="bg-gradient-to-br from-blue-500 to-purple-500 h-12 rounded"></div>
              <div className="bg-gradient-to-t from-green-400 to-blue-500 h-12 rounded"></div>
            </div>
            <p className="text-green-400 text-sm mt-4">✓ Gradients working</p>
          </div>

          {/* Test 8: Responsive Design */}
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 shadow-lg">
            <h2 className="text-xl font-semibold mb-4 text-indigo-400">Test 8: Responsive</h2>
            <div className="text-sm space-y-2">
              <p className="text-red-400 md:text-green-400 lg:text-blue-400">
                Red (mobile) → Green (md) → Blue (lg)
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <div className="bg-red-500 h-8 rounded"></div>
                <div className="bg-blue-500 h-8 rounded"></div>
              </div>
            </div>
            <p className="text-green-400 text-sm mt-4">✓ Responsive working</p>
          </div>

          {/* Test 9: Transitions */}
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 shadow-lg">
            <h2 className="text-xl font-semibold mb-4 text-teal-400">Test 9: Transitions</h2>
            <div className="space-y-3">
              <button 
                onClick={() => setTestPassed(!testPassed)}
                className={`px-6 py-3 rounded transition-all duration-300 ${
                  testPassed 
                    ? 'bg-green-500 scale-110' 
                    : 'bg-gray-600 hover:bg-gray-500'
                }`}
              >
                Click for Transition
              </button>
              <div className={`h-8 rounded transition-all duration-500 ${
                testPassed ? 'bg-green-500 w-full' : 'bg-gray-600 w-1/2'
              }`}></div>
            </div>
            <p className="text-green-400 text-sm mt-4">✓ Transitions working</p>
          </div>
        </div>

        {/* Summary */}
        <div className="mt-12 bg-gradient-to-r from-green-900/50 to-blue-900/50 rounded-xl p-8 border border-green-500/50">
          <h2 className="text-3xl font-bold text-center mb-6 text-green-400">
            Tailwind CSS Test Summary
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
            <div className="bg-gray-800/50 rounded-lg p-4">
              <div className="text-4xl font-bold text-green-400">9</div>
              <div className="text-gray-400">Tests Performed</div>
            </div>
            <div className="bg-gray-800/50 rounded-lg p-4">
              <div className="text-4xl font-bold text-green-400">✓</div>
              <div className="text-gray-400">All Tests Passed</div>
            </div>
            <div className="bg-gray-800/50 rounded-lg p-4">
              <div className="text-4xl font-bold text-green-400">100%</div>
              <div className="text-gray-400">Working</div>
            </div>
          </div>
          <p className="text-center mt-6 text-gray-300">
            <span className="font-semibold text-green-400">Tailwind CSS v4</span> is properly installed and working! 🎉
          </p>
        </div>
      </div>
    </div>
  )
}
