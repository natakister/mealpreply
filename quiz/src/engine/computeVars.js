/**
 * Computed variables engine for quiz content files.
 *
 * Two definition formats:
 * 1. Expression: { expr: "adults + kids" }
 * 2. Switch:     { switch: "field", cases: {...}, default: value }
 *
 * Variables resolve top-to-bottom; each can reference answers + prior vars.
 */

function safeEval(expr, ctx) {
  const keys = Object.keys(ctx)
  const vals = Object.values(ctx)
  try {
    const fn = new Function(...keys, `return (${expr})`)
    const result = fn(...vals)
    return result ?? undefined
  } catch {
    return undefined
  }
}

export function resolveVars(computedVarsDef, answers) {
  if (!computedVarsDef) return {}
  const ctx = { ...answers }
  for (const [name, def] of Object.entries(computedVarsDef)) {
    if (def.expr) {
      ctx[name] = safeEval(def.expr, ctx)
    } else if (def.switch) {
      const key = ctx[def.switch]
      const raw = def.cases?.[key] ?? def.default
      ctx[name] = typeof raw === 'string' ? interpolate(raw, ctx) : raw
    }
  }
  // Return only computed vars (not answers)
  const vars = {}
  for (const name of Object.keys(computedVarsDef)) {
    vars[name] = ctx[name]
  }
  return vars
}

export function interpolate(template, ctx) {
  if (!template || typeof template !== 'string') return template
  return template.replace(/\{(\w+)\}/g, (match, key) => {
    const val = ctx[key]
    return val != null ? String(val) : match
  })
}
