import React, { useState, useEffect, useRef } from 'react';
import { screens } from '../data/quizData';
import WelcomeHero from './WelcomeHero';
import { getOrCreateSessionId, trackEvent, trackEventOnce } from '../lib/gsheetsTelemetry';

const QuizFunnel = () => {
  const sessionIdRef = useRef(null);
  if (sessionIdRef.current === null) {
    sessionIdRef.current = getOrCreateSessionId();
  }
  const sessionId = sessionIdRef.current;

  // Telemetry-only: don't export default family size until user reaches and confirms that screen
  const familySizeConfirmedRef = useRef(false);

  const [currentScreen, setCurrentScreen] = useState(0);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisStep, setAnalysisStep] = useState(0);
  const [answers, setAnswers] = useState({
    mainGoal: null,
    idealOutcome: null,
    adults: 2,
    kids: 2,
    dietary: [],
    allergies: [],
    customAllergies: '',
    nutritionPriorities: [],
    eatingGoal: null,
    kidsChallenge: null,
    kitchenEquipment: [],
    mealComplexity: [],
    prepComfort: null,
    currentFrequency: null,
    midweekPattern: null,
    priority: null,
    email: ''
  });

  const hasKids = answers.kids > 0;
  const totalPeople = answers.adults + answers.kids;

  // Calculated insights
  const getCalculatedInsights = () => {
    const weeklyMeals = totalPeople * 21;
    const hoursPerWeek = answers.currentFrequency === 'always' ? 14 :
                         answers.currentFrequency === 'often' ? 10 :
                         answers.currentFrequency === 'sometimes' ? 6 : 3;
    const hoursPerYear = hoursPerWeek * 52;
    const daysPerYear = Math.round(hoursPerYear / 24);
    const wastedFoodPerMonth = answers.midweekPattern === 'food_spoils' ? 180 :
                               answers.midweekPattern === 'improvise' ? 120 : 80;
    const wastedFoodPerYear = wastedFoodPerMonth * 12;
    const decisionsPerDay = totalPeople > 2 ? 12 : 8;
    const decisionsPerYear = decisionsPerDay * 365;

    return {
      weeklyMeals,
      hoursPerWeek,
      hoursPerYear,
      daysPerYear,
      wastedFoodPerMonth,
      wastedFoodPerYear,
      decisionsPerDay,
      decisionsPerYear,
      recipesFiltered: 2847 - (answers.dietary?.length || 0) * 200 - (answers.allergies?.length || 0) * 150,
      recipesMatched: 2847 - (2847 - (answers.dietary?.length || 0) * 200 - (answers.allergies?.length || 0) * 150) - 194,
      weeklyTimeSaved: Math.round(hoursPerWeek * 0.6),
      monthlySavings: Math.round(wastedFoodPerMonth * 0.7)
    };
  };

  const getDynamicContent = () => {
    const { mainGoal, kidsChallenge, midweekPattern } = answers;
    const insights = getCalculatedInsights();

    return {
      interstitial3: {
        mental_load: `You're making ${insights.decisionsPerDay}+ food decisions daily. Let's find where the system breaks down.`,
        healthy_eating: kidsChallenge === 'picky'
          ? "Getting picky eaters to try new foods is hard. Let's see what's actually happening."
          : "Eating healthy as a family is challenging. Let's understand your current patterns.",
        food_waste: `Families like yours waste ~$${insights.wastedFoodPerMonth}/month on spoiled food. Let's find out why.`,
        time_saving: `You're spending ${insights.hoursPerWeek}+ hours weekly on food. Let's see where it's going.`,
        default: "To build a system that works, we need to understand what's not working now."
      },

      mainChallenge: {
        mental_load: `You're making ${insights.decisionsPerYear.toLocaleString()}+ food decisions per year. That's ${insights.daysPerYear} full days of mental energy — just on "what should we eat?"`,
        healthy_eating: `You want your family to eat healthier, but getting everyone on board${kidsChallenge === 'picky' ? ' — especially the picky eaters —' : ''} feels like a daily battle.`,
        food_waste: `Based on your pattern, you're likely wasting $${insights.wastedFoodPerYear.toLocaleString()}/year on food that spoils before you use it. That's not a willpower problem — it's a freshness cycle problem.`,
        time_saving: `You're spending ${insights.hoursPerYear.toLocaleString()} hours per year on food — that's ${insights.daysPerYear} full days. What would you do with that time back?`
      },

      patternInsight: {
        on_track: "Your planning works, but you want to optimize and make it effortless.",
        improvise: "You start strong, but by Wednesday you're improvising — which brings back all the stress you were trying to avoid.",
        food_spoils: "Your plans derail when food spoils. This isn't about planning better — it's about a 4-day freshness cycle instead of 7.",
        exhausted: "By midweek, you're too exhausted to cook. That's exactly when the guilt kicks in.",
        never_tried: "You haven't found a system realistic enough to try. Most meal plans assume you have time you don't have."
      },

      solutionHeadline: {
        mental_load: "Zero daily food decisions. Here's how:",
        healthy_eating: "Healthy meals everyone actually eats. Here's how:",
        food_waste: "Nothing spoils. Nothing wasted. Here's how:",
        time_saving: `${insights.weeklyTimeSaved} hours back every week. Here's how:`
      },

      priorityBenefit: {
        decisions: "Your entire week is planned. Just open the app and assemble. No thinking required.",
        picky_eaters: "Same base ingredients, different presentations. Everyone eats, nobody complains.",
        no_waste: "4-day freshness cycle. Two prep sessions mean nothing sits long enough to spoil.",
        save_time: "5-minute assembly. Components are ready. You just combine and serve.",
        school_lunches: "Every meal packs perfectly. No reheating needed. Mornings become easy.",
        flexibility: "Swap meals, adjust portions, life happens — the system adapts with you.",
        healthy: "Nutritious meals disguised as comfort food. No fights. No complaints."
      }
    };
  };

  const getPriorityOptions = () => {
    const { mainGoal, midweekPattern, kidsChallenge } = answers;
    let options = [];

    const goalOptions = {
      mental_load: { id: 'decisions', text: "Take all daily food decisions off my plate", icon: '🧠' },
      healthy_eating: { id: 'healthy', text: "Help my family eat nutritious meals without fights", icon: '🥗' },
      food_waste: { id: 'no_waste', text: "Stop throwing away food that spoiled", icon: '♻️' },
      time_saving: { id: 'save_time', text: "Cut cooking time in half", icon: '⏱️' }
    };

    if (mainGoal && goalOptions[mainGoal]) {
      options.push(goalOptions[mainGoal]);
    }

    if (midweekPattern === 'food_spoils' && mainGoal !== 'food_waste') {
      options.push({ id: 'no_waste', text: "A system where nothing goes bad", icon: '🥬' });
    }
    if (midweekPattern === 'exhausted' && mainGoal !== 'time_saving') {
      options.push({ id: 'save_time', text: "5-minute meals on tired days", icon: '😴' });
    }
    if (midweekPattern === 'improvise') {
      options.push({ id: 'flexibility', text: "A flexible plan that survives real life", icon: '🔄' });
    }
    if (kidsChallenge === 'picky' && mainGoal !== 'healthy_eating') {
      options.push({ id: 'picky_eaters', text: "Get my kids to actually eat", icon: '👶' });
    }
    if (kidsChallenge === 'school_lunches') {
      options.push({ id: 'school_lunches', text: "Easy packable lunches", icon: '🎒' });
    }

    const defaults = [
      { id: 'decisions', text: "Take all daily food decisions off my plate", icon: '🧠' },
      { id: 'save_time', text: "Spend less time cooking", icon: '⏱️' },
      { id: 'no_waste', text: "Stop wasting food and money", icon: '♻️' },
      { id: 'flexibility', text: "A plan that adapts to chaos", icon: '🔄' }
    ];

    for (const def of defaults) {
      if (options.length >= 4) break;
      if (!options.find(o => o.id === def.id)) {
        options.push(def);
      }
    }

    return options.slice(0, 4);
  };

  // screens imported from quizData.js for single source of truth

  const getVisibleScreens = () => {
    return screens.filter(screen => {
      if (screen.conditional === 'hasKids') return hasKids;
      return true;
    });
  };

  const visibleScreens = getVisibleScreens();
  const screen = visibleScreens[currentScreen];
  const progress = ((currentScreen) / (visibleScreens.length - 1)) * 100;

  const getTelemetryAnswers = () => {
    const telemetryAnswers = { ...answers };
    if (!familySizeConfirmedRef.current) {
      telemetryAnswers.adults = null;
      telemetryAnswers.kids = null;
    }
    return telemetryAnswers;
  };

  const confirmFamilySizeIfNeeded = () => {
    if (familySizeConfirmedRef.current) return;
    if (screen?.type !== 'number' || !Array.isArray(screen.fields)) return;
    const fieldIds = screen.fields.map(f => f?.id).filter(Boolean);
    if (fieldIds.includes('adults') || fieldIds.includes('kids')) {
      familySizeConfirmedRef.current = true;
    }
  };

  // Telemetry: send minimal events to Google Sheets (never blocks UI / logic)
  useEffect(() => {
    trackEventOnce(`quiz_start:${sessionId}`, 'quiz_start', { sessionId });
  }, [sessionId]);

  useEffect(() => {
    trackEventOnce(`user_init:${sessionId}`, 'user_snapshot', {
      sessionId,
      currentScreenId: screen?.id ?? '',
      currentScreenIndex: currentScreen,
      answers: getTelemetryAnswers()
    });
  }, [sessionId]);

  useEffect(() => {
    if (!screen?.id) return;
    trackEventOnce(`screen_view:${sessionId}:${screen.id}`, 'screen_view', {
      sessionId,
      screenId: screen.id,
      screenIndex: currentScreen
    });
  }, [sessionId, screen?.id, currentScreen]);

  const handleAnswer = (field, value) => {
    setAnswers(prev => ({ ...prev, [field]: value }));
  };

  const handleMultiAnswer = (field, value) => {
    setAnswers(prev => {
      const current = prev[field] || [];
      // "none" and "skip" are exclusive options that clear others
      if (value === 'none' || value === 'skip') return { ...prev, [field]: [value] };
      const withoutExclusive = current.filter(v => v !== 'none' && v !== 'skip');
      if (current.includes(value)) {
        return { ...prev, [field]: withoutExclusive.filter(v => v !== value) };
      }
      return { ...prev, [field]: [...withoutExclusive, value] };
    });
  };

  const handleNumber = (field, delta) => {
    setAnswers(prev => ({
      ...prev,
      [field]: Math.max(0, Math.min(10, (prev[field] || 0) + delta))
    }));
  };

  const next = () => {
    if (currentScreen < visibleScreens.length - 1) {
      confirmFamilySizeIfNeeded();
      trackEvent('user_snapshot', {
        sessionId,
        currentScreenId: screen?.id ?? '',
        currentScreenIndex: currentScreen,
        answers: getTelemetryAnswers()
      });
      setCurrentScreen(prev => prev + 1);
      setIsAnalyzing(false);
      setAnalysisStep(0);
    }
  };

  const prev = () => {
    if (currentScreen > 0) {
      setCurrentScreen(prev => prev - 1);
      setIsAnalyzing(false);
      setAnalysisStep(0);
    }
  };

  const getPhaseColor = (phase) => {
    const colors = {
      engagement: 'bg-blue-500',
      context: 'bg-cyan-500',
      reality: 'bg-amber-500',
      diagnosis: 'bg-orange-500',
      insight: 'bg-pink-500',
      solution: 'bg-[#4D49D2]',
      conversion: 'bg-green-500',
      monetization: 'bg-purple-500'
    };
    return colors[phase] || 'bg-gray-500';
  };

  const dynamicContent = getDynamicContent();
  const insights = getCalculatedInsights();

  const getAnalysisChecks = () => [
    { text: `Analyzed ${insights.weeklyMeals} weekly meals for ${totalPeople} people`, done: false },
    { text: `Filtered ${insights.recipesFiltered.toLocaleString()} incompatible recipes`, done: false },
    { text: `Found ${insights.recipesMatched} recipes that match your family`, done: false },
    { text: `Calculated ${insights.weeklyTimeSaved} hours/week potential time savings`, done: false },
    { text: `Estimated $${insights.monthlySavings}/month in reduced food waste`, done: false }
  ];

  useEffect(() => {
    if (screen?.type === 'analyzing' && !isAnalyzing) {
      const checks = getAnalysisChecks();
      let step = 0;
      const interval = setInterval(() => {
        step++;
        setAnalysisStep(step);
        if (step >= checks.length) {
          clearInterval(interval);
          setTimeout(() => setIsAnalyzing(true), 600);
        }
      }, 500);
      return () => clearInterval(interval);
    }
  }, [currentScreen, screen?.type]);

  const renderScreen = () => {
    if (!screen) return null;

    switch (screen.type) {
      case 'welcome':
        return (
          <div className="text-center space-y-6">
            <img src={`${import.meta.env.BASE_URL}logo.png`} alt="Meal Prep" className="w-9 h-9 mx-auto rounded-lg" />
            <h1 className="quiz-title-main">{screen.title}</h1>
            <p className="quiz-subtitle">{screen.subtitle}</p>
            <WelcomeHero className="w-full" />
            <div className="quiz-card text-left">
              <p className="quiz-text mb-2">What you'll get:</p>
              <ul className="space-y-2">
                {screen.bullets.map((bullet, i) => (
                  <li key={i} className="quiz-text flex items-center gap-2">
                    <span className="text-[#4D49D2]">✓</span> {bullet}
                  </li>
                ))}
              </ul>
            </div>
            <p className="quiz-social-proof">{screen.socialProof}</p>
            <button onClick={next} className="quiz-btn">{screen.cta}</button>
            <p className="quiz-text-small">{screen.trustBadge}</p>
          </div>
        );

      case 'goal_entry':
        return (
          <div className="space-y-6">
            <h1 className="quiz-title">{screen.title}</h1>
            {screen.description && <p className="quiz-subtitle">{screen.description}</p>}
            <div className="space-y-3">
              {screen.options.map(opt => (
                <button
                  key={opt.id}
                  onClick={() => { handleAnswer(screen.field, opt.id); setTimeout(next, 300); }}
                  className={`quiz-option ${answers[screen.field] === opt.id ? 'quiz-option-selected' : ''}`}
                >
                  <span className="text-2xl">{opt.icon}</span>
                  <span className="quiz-text">{opt.text}</span>
                </button>
              ))}
            </div>
          </div>
        );

      case 'micro_reward':
        return (
          <div className="text-center space-y-6">
            <div className="text-6xl font-light text-[#4D49D2]">{screen.stat}</div>
            <p className="quiz-subtitle">{screen.statText}</p>
            <div className="quiz-card">
              <p className="text-[#4D49D2] font-light">{screen.title}</p>
            </div>
            <button onClick={next} className="quiz-btn">{screen.cta}</button>
          </div>
        );

      case 'micro_reward_progress':
        const customAllergyCount = (answers.customAllergies || '').split(',').filter(s => s.trim()).length;
        const totalExcluded = (answers.allergies?.filter(a => a !== 'none')?.length || 0) + customAllergyCount;
        const progressItems = [
          { label: 'Family', value: `${totalPeople} people`, done: true },
          { label: 'Dietary filters', value: `${answers.dietary?.filter(d => d !== 'none')?.length || 0} applied`, done: (answers.dietary?.filter(d => d !== 'none')?.length || 0) > 0 },
          { label: 'Excluded ingredients', value: `${totalExcluded} items`, done: totalExcluded > 0 },
          { label: 'Kitchen setup', value: `${answers.kitchenEquipment?.length || 0} items`, done: answers.kitchenEquipment?.length > 0 }
        ];
        const completedPercent = Math.round((progressItems.filter(p => p.done).length / progressItems.length) * 60);

        return (
          <div className="text-center space-y-6">
            <h2 className="quiz-title">{screen.title}</h2>
            <div className="relative pt-1">
              <div className="flex mb-2 items-center justify-between">
                <span className="quiz-text-small text-[#3d39b8]">{completedPercent}% personalized</span>
              </div>
              <div className="h-3 bg-gray-200 rounded-full">
                <div className="h-3 bg-[#4D49D2] rounded-full transition-all" style={{ width: `${completedPercent}%` }}></div>
              </div>
            </div>
            <div className="bg-gray-50 rounded-xl p-4 space-y-2">
              {progressItems.map((item, i) => (
                <div key={i} className="flex justify-between text-sm font-light">
                  <span className="text-[#757575]">{item.label}</span>
                  <span className={item.done ? 'text-[#3d39b8]' : 'text-gray-400'}>{item.value}</span>
                </div>
              ))}
            </div>
            <div className="quiz-card">
              <p className="text-[#4D49D2] font-light text-lg">{insights.recipesMatched.toLocaleString()}</p>
              <p className="text-[#3d39b8] text-sm font-light">{screen.recipesText}</p>
            </div>
            <button onClick={next} className="quiz-btn">{screen.cta}</button>
          </div>
        );

      case 'single':
        return (
          <div className="space-y-6">
            <h2 className="quiz-title">{screen.title}</h2>
            {screen.description && <p className="quiz-subtitle">{screen.description}</p>}
            <div className="space-y-3">
              {screen.options.map(opt => (
                <button
                  key={opt.id}
                  onClick={() => { handleAnswer(screen.field, opt.id); setTimeout(next, 300); }}
                  className={`quiz-option ${answers[screen.field] === opt.id ? 'quiz-option-selected' : ''}`}
                >
                  <span className="text-2xl">{opt.icon}</span>
                  <span className="quiz-text">{opt.text}</span>
                </button>
              ))}
            </div>
          </div>
        );

      case 'single_dynamic':
        const priorityOptions = getPriorityOptions();
        return (
          <div className="space-y-6">
            <h2 className="quiz-title">{screen.title}</h2>
            {screen.description && <p className="quiz-subtitle">{screen.description}</p>}
            <div className="space-y-3">
              {priorityOptions.map(opt => (
                <button
                  key={opt.id}
                  onClick={() => { handleAnswer(screen.field, opt.id); setTimeout(next, 300); }}
                  className={`quiz-option ${answers[screen.field] === opt.id ? 'quiz-option-selected' : ''}`}
                >
                  <span className="text-2xl">{opt.icon}</span>
                  <span className="quiz-text">{opt.text}</span>
                </button>
              ))}
            </div>
          </div>
        );

      case 'multi_with_custom':
        const hasAllergySelection = (answers[screen.field] || []).length > 0 || (answers[screen.customField] || '').trim().length > 0;
        return (
          <div className="space-y-6">
            <h2 className="quiz-title">{screen.title}</h2>
            {screen.description && <p className="quiz-subtitle">{screen.description}</p>}
            <div className="grid grid-cols-2 gap-3">
              {screen.options.map(opt => (
                <button
                  key={opt.id}
                  onClick={() => handleMultiAnswer(screen.field, opt.id)}
                  className={`quiz-option-grid ${(answers[screen.field] || []).includes(opt.id) ? 'quiz-option-selected' : ''}`}
                >
                  <span className="text-xl block mb-1">{opt.icon}</span>
                  <span className="quiz-text-small text-[#1E1E1E]">{opt.text}</span>
                </button>
              ))}
            </div>
            <div className="pt-2">
              <p className="quiz-text-small mb-2">Not in the list? Add your own (one item or comma-separated):</p>
              <input
                type="text"
                placeholder={screen.customPlaceholder}
                value={answers[screen.customField] || ''}
                onChange={(e) => handleAnswer(screen.customField, e.target.value)}
                className="quiz-input"
              />
            </div>
            <button
              onClick={next}
              disabled={!hasAllergySelection}
              className={`quiz-btn ${!hasAllergySelection ? 'quiz-btn-disabled' : ''}`}
            >
              {screen.cta}
            </button>
          </div>
        );

      case 'multi':
        const hasMultiSelection = (answers[screen.field] || []).length > 0;
        return (
          <div className="space-y-6">
            <h2 className="quiz-title">{screen.title}</h2>
            {screen.description && <p className="quiz-subtitle">{screen.description}</p>}
            <div className="grid grid-cols-2 gap-3">
              {screen.options.map(opt => (
                <button
                  key={opt.id}
                  onClick={() => handleMultiAnswer(screen.field, opt.id)}
                  className={`quiz-option-grid ${(answers[screen.field] || []).includes(opt.id) ? 'quiz-option-selected' : ''}`}
                >
                  <span className="text-xl block mb-1">{opt.icon}</span>
                  <span className="quiz-text-small text-[#1E1E1E]">{opt.text}</span>
                </button>
              ))}
            </div>
            <button
              onClick={next}
              disabled={!hasMultiSelection}
              className={`quiz-btn ${!hasMultiSelection ? 'quiz-btn-disabled' : ''}`}
            >
              {screen.cta}
            </button>
          </div>
        );

      case 'number':
        return (
          <div className="space-y-6">
            <h2 className="quiz-title">{screen.title}</h2>
            {screen.description && <p className="quiz-subtitle">{screen.description}</p>}
            <div className="space-y-4">
              {screen.fields.map(field => (
                <div key={field.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{field.icon}</span>
                    <span className="quiz-text">{field.label}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <button onClick={() => handleNumber(field.id, -1)} className="quiz-number-btn">-</button>
                    <span className="w-8 text-center text-xl font-light text-[#1E1E1E]">{answers[field.id]}</span>
                    <button onClick={() => handleNumber(field.id, 1)} className="quiz-number-btn">+</button>
                  </div>
                </div>
              ))}
            </div>
            <button onClick={next} className="quiz-btn">{screen.cta}</button>
          </div>
        );

      case 'interstitial_dynamic':
        const dynamicText = dynamicContent[screen.dynamicKey]?.[answers.mainGoal] || dynamicContent[screen.dynamicKey]?.default;
        return (
          <div className="text-center space-y-6">
            <div className="text-5xl mb-4">🔍</div>
            <h2 className="quiz-title">{screen.title}</h2>
            <p className="quiz-text bg-amber-50 p-4 rounded-xl border border-amber-200">{dynamicText}</p>
            <button onClick={next} className="quiz-btn">{screen.cta}</button>
          </div>
        );

      case 'analyzing':
        const analysisChecks = getAnalysisChecks();
        return (
          <div className="text-center space-y-6">
            <div className="text-5xl mb-4">⚙️</div>
            <h2 className="quiz-title">{screen.title}</h2>
            <div className="bg-gray-50 rounded-xl p-5 text-left space-y-3">
              {analysisChecks.map((check, i) => (
                <div key={i} className={`flex items-center gap-2 transition-all duration-300 ${analysisStep > i ? 'opacity-100' : 'opacity-30'}`}>
                  <span className={analysisStep > i ? 'text-[#4D49D2]' : 'text-gray-300'}>{analysisStep > i ? '✓' : '○'}</span>
                  <span className="quiz-text-small text-[#1E1E1E]">{check.text}</span>
                </div>
              ))}
            </div>
            {isAnalyzing && (
              <div className="space-y-4">
                <div className="quiz-card">
                  <p className="text-[#4D49D2] font-light">✨ Your personalized system is ready</p>
                </div>
                <button onClick={next} className="quiz-btn">{screen.cta}</button>
              </div>
            )}
          </div>
        );

      case 'insight':
        const priorityLabels = {
          decisions: 'eliminating daily decisions', healthy: 'healthier eating', no_waste: 'zero food waste',
          save_time: 'saving time', picky_eaters: 'kid-approved meals', school_lunches: 'easy lunches', flexibility: 'flexible planning'
        };
        return (
          <div className="space-y-4">
            <div className="text-center">
              <div className="text-4xl mb-2">💡</div>
              <h2 className="quiz-title">{screen.title}</h2>
            </div>

            <div className="bg-gradient-to-br from-red-50 to-orange-50 p-4 rounded-xl border border-red-200">
              <h3 className="font-light text-red-800 mb-2 text-sm">📊 The Real Cost</h3>
              <p className="text-red-700 text-sm font-light">{dynamicContent.mainChallenge[answers.mainGoal]}</p>
            </div>

            {answers.midweekPattern && answers.midweekPattern !== 'on_track' && (
              <div className="bg-amber-50 p-4 rounded-xl border border-amber-200">
                <h3 className="font-light text-amber-800 mb-2 text-sm">🔄 The Pattern</h3>
                <p className="text-amber-700 text-sm font-light">{dynamicContent.patternInsight[answers.midweekPattern]}</p>
              </div>
            )}

            <div className="quiz-card border border-[#d1d0f0]">
              <h3 className="font-light text-[#4D49D2] mb-2 text-sm">🎯 Your Priority</h3>
              <p className="text-[#4D49D2] text-sm font-light">We'll focus on: <span className="font-normal">{priorityLabels[answers.priority]}</span></p>
            </div>

            <div className="bg-blue-50 p-3 rounded-xl text-center">
              <p className="text-blue-700 text-sm font-light">This is exactly what our system solves.</p>
            </div>

            <button onClick={next} className="quiz-btn">{screen.cta}</button>
          </div>
        );

      case 'solution':
        return (
          <div className="space-y-5">
            <div className="text-center">
              <h2 className="quiz-title">{dynamicContent.solutionHeadline[answers.mainGoal]}</h2>
            </div>

            <div className="quiz-card">
              <div className="flex justify-around text-center">
                <div>
                  <div className="text-2xl mb-1">📅</div>
                  <div className="quiz-text-small text-[#1E1E1E]">Plan Once</div>
                  <div className="quiz-text-small">weekly</div>
                </div>
                <div className="text-lg text-gray-300 self-center">→</div>
                <div>
                  <div className="text-2xl mb-1">🥗</div>
                  <div className="quiz-text-small text-[#1E1E1E]">Prep Twice</div>
                  <div className="quiz-text-small">you pick the days</div>
                </div>
                <div className="text-lg text-gray-300 self-center">→</div>
                <div>
                  <div className="text-2xl mb-1">😋</div>
                  <div className="quiz-text-small text-[#1E1E1E]">Eat All Week</div>
                  <div className="quiz-text-small">5-min meals</div>
                </div>
              </div>
            </div>

            <div className="bg-purple-50 p-4 rounded-xl border border-purple-200">
              <p className="text-purple-800 font-light text-sm">
                ✨ {dynamicContent.priorityBenefit[answers.priority]}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-gray-50 p-3 rounded-xl text-center">
                <div className="text-2xl font-light text-[#3d39b8]">{insights.weeklyTimeSaved}h</div>
                <div className="quiz-text-small">saved weekly</div>
              </div>
              <div className="bg-[#eeeef9] p-3 rounded-xl text-center border-2 border-[#9997e6]">
                <div className="quiz-text-small text-[#4D49D2] mb-1">💰 You'll save</div>
                <div className="text-2xl font-light text-[#4D49D2]">${insights.monthlySavings}</div>
                <div className="quiz-text-small text-[#3d39b8]">per month</div>
              </div>
            </div>

            <button onClick={next} className="quiz-btn">{screen.cta}</button>
          </div>
        );

      case 'value_demo':
        const sampleRecipes = [
          { name: 'Mediterranean Chicken Bowls', time: '5 min', img: '🥗' },
          { name: 'Honey Garlic Shrimp Wraps', time: '5 min', img: '🌯' },
          { name: 'Teriyaki Beef Bowls', time: '5 min', img: '🍚' }
        ];
        return (
          <div className="space-y-4">
            <div className="text-center">
              <h2 className="quiz-title">{screen.title}</h2>
              <p className="quiz-text-small">Personalized for {totalPeople} people</p>
            </div>

            <div className="quiz-card flex justify-between text-sm">
              <span className="text-[#4D49D2]">🛒 Shopping list:</span>
              <span className="text-[#4D49D2]">$87 for the week</span>
            </div>

            <div className="space-y-2">
              <p className="quiz-text-small text-[#1E1E1E]">Sample meals from your plan:</p>
              {sampleRecipes.map((r, i) => (
                <div key={i} className="flex items-center gap-3 p-3 bg-white rounded-xl border border-gray-200">
                  <span className="text-3xl">{r.img}</span>
                  <div className="flex-1">
                    <div className="quiz-text-small text-[#1E1E1E]">{r.name}</div>
                    <div className="quiz-text-small text-[#3d39b8]">Assembly: {r.time}</div>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-gray-100 rounded-xl p-4 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-t from-gray-100 via-transparent to-transparent z-10"></div>
              <div className="blur-sm quiz-text-small space-y-1">
                <p>+ 18 more recipes tailored to your family...</p>
                <p>+ Full prep guides for both sessions...</p>
                <p>+ Organized shopping list...</p>
              </div>
            </div>

            <button onClick={next} className="quiz-btn">{screen.cta}</button>
          </div>
        );

      case 'email':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <div className="text-4xl mb-3">📧</div>
              <h2 className="quiz-title">{screen.title}</h2>
            </div>

            <div className="bg-gray-50 p-4 rounded-xl">
              <div className="flex items-start gap-3">
                <div className="text-2xl">👩</div>
                <div>
                  <p className="quiz-text-small text-[#1E1E1E] italic">"I got 4 hours of my week back. My kids actually eat dinner now without complaints."</p>
                  <p className="quiz-text-small mt-1">— Sarah, mom of 3</p>
                </div>
              </div>
            </div>

            <input
              type="email"
              placeholder="Enter your email"
              value={answers.email}
              onChange={(e) => handleAnswer('email', e.target.value)}
              className="quiz-input text-center"
            />

            <button onClick={next} disabled={!answers.email} className={`quiz-btn ${!answers.email ? 'quiz-btn-disabled' : ''}`}>{screen.cta}</button>

            <p className="quiz-text-small text-center">No spam. Unsubscribe anytime.</p>
          </div>
        );

      case 'paywall':
        const handleCheckoutInitiated = () => {
          trackEvent('checkout_initiated', {
            sessionId,
            currentScreenId: screen?.id ?? '',
            currentScreenIndex: currentScreen,
            email: answers.email || ''
          });
          alert('Demo completed! 🎉');
        };

        const withoutSystem = [
          { icon: '😰', text: 'Daily stress about what to cook' },
          { icon: '🥬', text: 'Food going bad in the fridge' },
          { icon: '😩', text: 'Exhausted by dinner time' },
          { icon: '💸', text: `~$${insights.wastedFoodPerMonth}/month wasted on food` }
        ];
        const withSystem = [
          { icon: '😌', text: 'Zero decisions — just open and assemble' },
          { icon: '✨', text: 'Fresh ingredients, zero waste' },
          { icon: '⚡', text: '5-minute meals, energy to spare' },
          { icon: '💰', text: `Save ~$${insights.monthlySavings}/month on groceries` }
        ];

        return (
          <div className="space-y-5">
            <h2 className="quiz-title">{screen.title}</h2>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-red-50 p-3 rounded-xl border border-red-200">
                <p className="quiz-text-small text-red-700 mb-2 text-center">❌ WITHOUT</p>
                <div className="space-y-2">
                  {withoutSystem.map((item, i) => (
                    <div key={i} className="flex items-center gap-2 quiz-text-small text-red-700">
                      <span>{item.icon}</span><span>{item.text}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="quiz-card border border-[#d1d0f0]">
                <p className="quiz-text-small text-[#4D49D2] mb-2 text-center">✓ WITH</p>
                <div className="space-y-2">
                  {withSystem.map((item, i) => (
                    <div key={i} className="flex items-center gap-2 quiz-text-small text-[#4D49D2]">
                      <span>{item.icon}</span><span>{item.text}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="text-center bg-gradient-to-r from-[#4D49D2] to-[#3d39b8] text-white p-5 rounded-xl">
              <div className="text-2xl font-light">14-day free trial</div>
              <div className="text-sm font-light opacity-90">then $14.99/month</div>
              <div className="quiz-text-small opacity-75 mt-1 text-white">Cancel anytime • 30-day money-back</div>
            </div>

            <div className="flex items-center justify-center gap-2 quiz-text-small">
              <span>⭐⭐⭐⭐⭐</span>
              <span>4.8 from 12,847 reviews</span>
            </div>

            <button onClick={handleCheckoutInitiated} className="quiz-btn shadow-lg">{screen.cta}</button>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex flex-col pb-20">
      {currentScreen > 0 && (
        <div className="sticky top-0 bg-white/90 backdrop-blur-sm border-b border-gray-100 px-4 py-3 z-10">
          <div className="max-w-md mx-auto">
            <div className="flex items-center justify-between mb-2">
              <button onClick={prev} className="text-gray-400 hover:text-gray-600 text-sm">← Back</button>
              <span className="text-xs text-gray-400">{currentScreen + 1} / {visibleScreens.length}</span>
            </div>
            <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full bg-[#4D49D2] transition-all duration-500 rounded-full" style={{ width: `${progress}%` }} />
            </div>
          </div>
        </div>
      )}

      <div className="flex-1 flex items-center justify-center p-5">
        <div className="w-full max-w-md">{renderScreen()}</div>
      </div>

    </div>
  );
};

export default QuizFunnel;
