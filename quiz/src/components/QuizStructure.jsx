import React, { useState } from 'react';
import { screens, phases, dynamicContent, priorityOptionsConfig, paywallContent, sampleRecipes, typeLabels } from '../data/quizData';

const QuizStructure = () => {
  const [expandedScreens, setExpandedScreens] = useState(new Set(screens.map(s => s.id)));
  const [filterPhase, setFilterPhase] = useState(null);

  const toggleScreen = (id) => {
    setExpandedScreens(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const expandAll = () => setExpandedScreens(new Set(screens.map(s => s.id)));
  const collapseAll = () => setExpandedScreens(new Set());

  const getPhaseInfo = (phaseId) => phases.find(p => p.id === phaseId);

  const filteredScreens = filterPhase
    ? screens.filter(s => s.phase === filterPhase)
    : screens;

  const renderOptions = (options) => {
    if (!options || options.length === 0) return null;
    return (
      <div className="mt-3">
        <div className="text-xs font-medium text-gray-500 mb-2">OPTIONS:</div>
        <div className="space-y-1">
          {options.map((opt, i) => (
            <div key={i} className="flex items-center gap-2 text-sm bg-gray-50 px-3 py-2 rounded-lg">
              <span className="text-lg">{opt.icon}</span>
              <span className="text-gray-700 font-medium">{opt.id}</span>
              <span className="text-gray-400">—</span>
              <span className="text-gray-600">{opt.text}</span>
              {opt.desc && <span className="text-gray-400 text-xs ml-auto">{opt.desc}</span>}
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderDynamicContent = (screen) => {
    if (screen.dynamicKey && dynamicContent[screen.dynamicKey]) {
      return (
        <div className="mt-3">
          <div className="text-xs font-medium text-amber-600 mb-2">DYNAMIC TEXT (by mainGoal):</div>
          <div className="space-y-1">
            {Object.entries(dynamicContent[screen.dynamicKey]).map(([key, value]) => (
              <div key={key} className="text-sm bg-amber-50 px-3 py-2 rounded-lg border border-amber-200">
                <span className="font-medium text-amber-700">{key}:</span>
                <span className="text-amber-800 ml-2">{value}</span>
              </div>
            ))}
          </div>
        </div>
      );
    }
    return null;
  };

  const renderScreenContent = (screen) => {
    const content = [];

    // Title
    if (screen.title) {
      content.push(
        <div key="title" className="mb-2">
          <div className="text-xs font-medium text-gray-500">TITLE:</div>
          <div className="text-lg font-medium text-gray-800">{screen.title}</div>
        </div>
      );
    }

    // Subtitle / Description
    if (screen.subtitle || screen.description) {
      content.push(
        <div key="desc" className="mb-2">
          <div className="text-xs font-medium text-gray-500">{screen.subtitle ? 'SUBTITLE' : 'DESCRIPTION'}:</div>
          <div className="text-sm text-gray-600">{screen.subtitle || screen.description}</div>
        </div>
      );
    }

    // Bullets
    if (screen.bullets) {
      content.push(
        <div key="bullets" className="mb-2">
          <div className="text-xs font-medium text-gray-500">BULLETS:</div>
          <ul className="list-disc list-inside text-sm text-gray-600">
            {screen.bullets.map((b, i) => <li key={i}>{b}</li>)}
          </ul>
        </div>
      );
    }

    // Fields for number type
    if (screen.fields) {
      content.push(
        <div key="fields" className="mb-2">
          <div className="text-xs font-medium text-gray-500">FIELDS:</div>
          <div className="flex gap-4 mt-1">
            {screen.fields.map((f, i) => (
              <div key={i} className="flex items-center gap-2 text-sm bg-gray-50 px-3 py-2 rounded-lg">
                <span>{f.icon}</span>
                <span className="font-medium">{f.label}</span>
                <span className="text-gray-400">({f.id})</span>
              </div>
            ))}
          </div>
        </div>
      );
    }

    // Field name
    if (screen.field) {
      content.push(
        <div key="field" className="mb-2">
          <div className="text-xs font-medium text-gray-500">SAVES TO:</div>
          <code className="text-sm bg-purple-100 text-purple-700 px-2 py-1 rounded">{screen.field}</code>
          {screen.customField && (
            <code className="text-sm bg-purple-100 text-purple-700 px-2 py-1 rounded ml-2">{screen.customField}</code>
          )}
        </div>
      );
    }

    // Stat for micro_reward
    if (screen.stat) {
      content.push(
        <div key="stat" className="mb-2">
          <div className="text-xs font-medium text-gray-500">STAT:</div>
          <div className="text-3xl font-bold text-indigo-600">{screen.stat}</div>
          <div className="text-sm text-gray-600">{screen.statText}</div>
        </div>
      );
    }

    // Social proof
    if (screen.socialProof) {
      content.push(
        <div key="social" className="mb-2">
          <div className="text-xs font-medium text-gray-500">SOCIAL PROOF:</div>
          <div className="text-sm text-gray-600 italic">{screen.socialProof}</div>
        </div>
      );
    }

    // Trust badge
    if (screen.trustBadge) {
      content.push(
        <div key="trust" className="mb-2">
          <div className="text-xs font-medium text-gray-500">TRUST BADGE:</div>
          <div className="text-sm text-gray-600">{screen.trustBadge}</div>
        </div>
      );
    }

    // Options
    if (screen.options) {
      content.push(<div key="options">{renderOptions(screen.options)}</div>);
    }

    // Dynamic options indicator
    if (screen.dynamicOptions) {
      content.push(
        <div key="dynopt" className="mt-3">
          <div className="text-xs font-medium text-orange-600 mb-2">DYNAMIC OPTIONS:</div>
          <div className="text-sm bg-orange-50 px-3 py-2 rounded-lg border border-orange-200">
            <p className="text-orange-700 mb-2">Options generated based on:</p>
            <ul className="list-disc list-inside text-orange-600 text-xs space-y-1">
              <li>mainGoal (primary option)</li>
              <li>midweekPattern (additional options)</li>
              <li>kidsChallenge (if applicable)</li>
              <li>Defaults to fill up to 4 options</li>
            </ul>
          </div>
        </div>
      );
    }

    // Dynamic content
    if (screen.dynamicKey) {
      content.push(<div key="dynamic">{renderDynamicContent(screen)}</div>);
    }

    // Conditional
    if (screen.conditional) {
      content.push(
        <div key="cond" className="mt-2">
          <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded">
            CONDITIONAL: {screen.conditional}
          </span>
        </div>
      );
    }

    // CTA
    if (screen.cta) {
      content.push(
        <div key="cta" className="mt-3 pt-3 border-t border-gray-200">
          <div className="text-xs font-medium text-gray-500">CTA:</div>
          <div className="inline-block bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm mt-1">
            {screen.cta}
          </div>
        </div>
      );
    }

    // Special content for specific types
    if (screen.type === 'insight') {
      content.push(
        <div key="insight-content" className="mt-3">
          <div className="text-xs font-medium text-pink-600 mb-2">INSIGHT SECTIONS:</div>
          <div className="space-y-2">
            <div className="bg-red-50 p-3 rounded-lg border border-red-200">
              <div className="font-medium text-red-700 text-sm">1. The Real Cost (mainChallenge)</div>
              <div className="text-xs text-red-600 mt-1">Dynamic text based on mainGoal</div>
            </div>
            <div className="bg-amber-50 p-3 rounded-lg border border-amber-200">
              <div className="font-medium text-amber-700 text-sm">2. The Pattern (patternInsight)</div>
              <div className="text-xs text-amber-600 mt-1">Dynamic text based on midweekPattern</div>
            </div>
            <div className="bg-indigo-50 p-3 rounded-lg border border-indigo-200">
              <div className="font-medium text-indigo-700 text-sm">3. Your Priority</div>
              <div className="text-xs text-indigo-600 mt-1">Shows selected priority</div>
            </div>
          </div>
        </div>
      );
    }

    if (screen.type === 'solution') {
      content.push(
        <div key="solution-content" className="mt-3">
          <div className="text-xs font-medium text-emerald-600 mb-2">SOLUTION VISUALIZATION:</div>
          <div className="flex items-center justify-around bg-emerald-50 p-4 rounded-lg border border-emerald-200">
            <div className="text-center">
              <div className="text-2xl">📅</div>
              <div className="text-xs font-medium">Plan Once</div>
            </div>
            <div className="text-gray-300">→</div>
            <div className="text-center">
              <div className="text-2xl">🥗</div>
              <div className="text-xs font-medium">Prep Twice</div>
            </div>
            <div className="text-gray-300">→</div>
            <div className="text-center">
              <div className="text-2xl">😋</div>
              <div className="text-xs font-medium">Eat All Week</div>
            </div>
          </div>
          <div className="mt-2 text-xs text-emerald-600">
            + Dynamic headline (solutionHeadline) + Priority benefit (priorityBenefit)
          </div>
        </div>
      );
    }

    if (screen.type === 'value_demo') {
      content.push(
        <div key="value-content" className="mt-3">
          <div className="text-xs font-medium text-green-600 mb-2">SAMPLE RECIPES:</div>
          <div className="space-y-1">
            {sampleRecipes.map((r, i) => (
              <div key={i} className="flex items-center gap-2 bg-green-50 px-3 py-2 rounded-lg text-sm">
                <span className="text-xl">{r.img}</span>
                <span className="font-medium text-green-700">{r.name}</span>
                <span className="text-green-500 text-xs ml-auto">Assembly: {r.time}</span>
              </div>
            ))}
          </div>
          <div className="mt-2 text-xs text-green-600">+ Blurred preview of additional content</div>
        </div>
      );
    }

    if (screen.type === 'paywall') {
      content.push(
        <div key="paywall-content" className="mt-3">
          <div className="text-xs font-medium text-purple-600 mb-2">COMPARISON:</div>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-red-50 p-3 rounded-lg border border-red-200">
              <div className="font-medium text-red-700 text-sm mb-2">WITHOUT:</div>
              {paywallContent.withoutSystem.map((item, i) => (
                <div key={i} className="flex items-center gap-1 text-xs text-red-600">
                  <span>{item.icon}</span><span>{item.text}</span>
                </div>
              ))}
            </div>
            <div className="bg-green-50 p-3 rounded-lg border border-green-200">
              <div className="font-medium text-green-700 text-sm mb-2">WITH:</div>
              {paywallContent.withSystem.map((item, i) => (
                <div key={i} className="flex items-center gap-1 text-xs text-green-600">
                  <span>{item.icon}</span><span>{item.text}</span>
                </div>
              ))}
            </div>
          </div>
          {screen.pricing && (
            <div className="mt-3 bg-purple-100 p-3 rounded-lg text-center">
              <div className="font-bold text-purple-700">{screen.pricing.trial}</div>
              <div className="text-sm text-purple-600">{screen.pricing.price}</div>
              <div className="text-xs text-purple-500">{screen.pricing.guarantee}</div>
            </div>
          )}
        </div>
      );
    }

    if (screen.type === 'analyzing') {
      content.push(
        <div key="analyzing-content" className="mt-3">
          <div className="text-xs font-medium text-orange-600 mb-2">ANALYSIS CHECKS (animated):</div>
          <div className="space-y-1 bg-orange-50 p-3 rounded-lg border border-orange-200">
            <div className="text-xs text-orange-700">1. Analyzed {'{weeklyMeals}'} weekly meals for {'{totalPeople}'} people</div>
            <div className="text-xs text-orange-700">2. Filtered {'{recipesFiltered}'} incompatible recipes</div>
            <div className="text-xs text-orange-700">3. Found {'{recipesMatched}'} recipes that match your family</div>
            <div className="text-xs text-orange-700">4. Calculated {'{weeklyTimeSaved}'} hours/week potential time savings</div>
            <div className="text-xs text-orange-700">5. Estimated ${'{monthlySavings}'}/month in reduced food waste</div>
          </div>
          <div className="mt-2 text-xs text-orange-500">Timing: 500ms between checks, 600ms before CTA appears</div>
        </div>
      );
    }

    if (screen.testimonial) {
      content.push(
        <div key="testimonial" className="mt-3">
          <div className="text-xs font-medium text-gray-500">TESTIMONIAL:</div>
          <div className="bg-gray-50 p-3 rounded-lg mt-1">
            <p className="text-sm text-gray-700 italic">"{screen.testimonial.text}"</p>
            <p className="text-xs text-gray-500 mt-1">— {screen.testimonial.author}</p>
          </div>
        </div>
      );
    }

    return content;
  };

  // Stats
  const totalScreens = screens.length;
  const questionScreens = screens.filter(s => s.field).length;
  const phaseCounts = phases.map(p => ({
    ...p,
    count: screens.filter(s => s.phase === p.id).length
  }));

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="sticky top-0 bg-white shadow-sm z-20 border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-gray-800">Quiz Funnel Structure</h1>
              <p className="text-sm text-gray-500">
                {totalScreens} screens | {questionScreens} questions | {phases.length} phases
              </p>
            </div>
            <div className="flex items-center gap-3">
              <a
                href="/"
                className="text-sm text-indigo-600 hover:text-indigo-800 underline"
              >
                View Quiz
              </a>
              <button
                onClick={expandAll}
                className="text-sm bg-gray-100 hover:bg-gray-200 px-3 py-1 rounded"
              >
                Expand All
              </button>
              <button
                onClick={collapseAll}
                className="text-sm bg-gray-100 hover:bg-gray-200 px-3 py-1 rounded"
              >
                Collapse All
              </button>
            </div>
          </div>

          {/* Phase filters */}
          <div className="flex flex-wrap gap-2 mt-3">
            <button
              onClick={() => setFilterPhase(null)}
              className={`text-xs px-3 py-1 rounded-full transition-colors ${
                filterPhase === null
                  ? 'bg-gray-800 text-white'
                  : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
              }`}
            >
              All ({totalScreens})
            </button>
            {phaseCounts.map(phase => (
              <button
                key={phase.id}
                onClick={() => setFilterPhase(phase.id)}
                className={`text-xs px-3 py-1 rounded-full transition-colors ${
                  filterPhase === phase.id
                    ? `${phase.color} text-white`
                    : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                }`}
              >
                {phase.name} ({phase.count})
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="space-y-4">
          {filteredScreens.map((screen, index) => {
            const phase = getPhaseInfo(screen.phase);
            const isExpanded = expandedScreens.has(screen.id);

            return (
              <div
                key={screen.id}
                className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200"
              >
                {/* Screen header */}
                <div
                  className="flex items-center gap-4 p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => toggleScreen(screen.id)}
                >
                  <div className={`w-10 h-10 ${phase.color} rounded-lg flex items-center justify-center text-white font-bold`}>
                    {screen.id}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-800">{screen.block}</span>
                      <span className={`text-xs px-2 py-0.5 rounded ${phase.color} text-white`}>
                        {phase.name}
                      </span>
                      <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                        {typeLabels[screen.type] || screen.type}
                      </span>
                      {screen.conditional && (
                        <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded">
                          Conditional
                        </span>
                      )}
                      {screen.field && (
                        <code className="text-xs bg-purple-100 text-purple-600 px-2 py-0.5 rounded">
                          → {screen.field}
                        </code>
                      )}
                    </div>
                    {screen.title && (
                      <div className="text-sm text-gray-500 mt-1 truncate max-w-xl">
                        {screen.title}
                      </div>
                    )}
                  </div>
                  <div className="text-gray-400">
                    {isExpanded ? '▼' : '▶'}
                  </div>
                </div>

                {/* Screen content */}
                {isExpanded && (
                  <div className="px-4 pb-4 pt-0 border-t border-gray-100">
                    <div className="pl-14">
                      {renderScreenContent(screen)}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Dynamic Content Reference */}
        <div className="mt-8 bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <h2 className="text-lg font-bold text-gray-800 mb-4">Dynamic Content Reference</h2>

          <div className="grid md:grid-cols-2 gap-6">
            {/* mainChallenge */}
            <div>
              <h3 className="font-medium text-red-700 mb-2">mainChallenge (Insight #18)</h3>
              <div className="space-y-1 text-sm">
                {Object.entries(dynamicContent.mainChallenge).map(([key, value]) => (
                  <div key={key} className="bg-red-50 p-2 rounded">
                    <span className="font-medium text-red-600">{key}:</span>
                    <span className="text-red-700 ml-1 text-xs">{value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* patternInsight */}
            <div>
              <h3 className="font-medium text-amber-700 mb-2">patternInsight (Insight #18)</h3>
              <div className="space-y-1 text-sm">
                {Object.entries(dynamicContent.patternInsight).map(([key, value]) => (
                  <div key={key} className="bg-amber-50 p-2 rounded">
                    <span className="font-medium text-amber-600">{key}:</span>
                    <span className="text-amber-700 ml-1 text-xs">{value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* solutionHeadline */}
            <div>
              <h3 className="font-medium text-emerald-700 mb-2">solutionHeadline (Solution #19)</h3>
              <div className="space-y-1 text-sm">
                {Object.entries(dynamicContent.solutionHeadline).map(([key, value]) => (
                  <div key={key} className="bg-emerald-50 p-2 rounded">
                    <span className="font-medium text-emerald-600">{key}:</span>
                    <span className="text-emerald-700 ml-1 text-xs">{value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* priorityBenefit */}
            <div>
              <h3 className="font-medium text-purple-700 mb-2">priorityBenefit (Solution #19)</h3>
              <div className="space-y-1 text-sm">
                {Object.entries(dynamicContent.priorityBenefit).map(([key, value]) => (
                  <div key={key} className="bg-purple-50 p-2 rounded">
                    <span className="font-medium text-purple-600">{key}:</span>
                    <span className="text-purple-700 ml-1 text-xs">{value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Priority Options Logic */}
        <div className="mt-6 bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <h2 className="text-lg font-bold text-gray-800 mb-4">Priority Options Logic (#16)</h2>

          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <h3 className="font-medium text-blue-700 mb-2">By mainGoal (first)</h3>
              <div className="space-y-1">
                {Object.entries(priorityOptionsConfig.goalOptions).map(([key, opt]) => (
                  <div key={key} className="flex items-center gap-2 text-xs bg-blue-50 p-2 rounded">
                    <span>{opt.icon}</span>
                    <span className="font-medium text-blue-600">{key}:</span>
                    <span className="text-blue-700">{opt.id}</span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="font-medium text-amber-700 mb-2">By midweekPattern</h3>
              <div className="space-y-1">
                {Object.entries(priorityOptionsConfig.patternOptions).map(([key, opt]) => (
                  <div key={key} className="flex items-center gap-2 text-xs bg-amber-50 p-2 rounded">
                    <span>{opt.icon}</span>
                    <span className="font-medium text-amber-600">{key}:</span>
                    <span className="text-amber-700">{opt.id}</span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="font-medium text-pink-700 mb-2">By kidsChallenge</h3>
              <div className="space-y-1">
                {Object.entries(priorityOptionsConfig.kidsOptions).map(([key, opt]) => (
                  <div key={key} className="flex items-center gap-2 text-xs bg-pink-50 p-2 rounded">
                    <span>{opt.icon}</span>
                    <span className="font-medium text-pink-600">{key}:</span>
                    <span className="text-pink-700">{opt.id}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>This page auto-updates when quiz data changes (Hot Reload)</p>
          <p className="mt-1">
            Data source: <code className="bg-gray-200 px-2 py-0.5 rounded">src/data/quizData.js</code>
          </p>
        </div>
      </div>
    </div>
  );
};

export default QuizStructure;
