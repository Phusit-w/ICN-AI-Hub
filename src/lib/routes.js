// Skills live in the "ทักษะ" tab of the Agents page. Link there instead of the old /skills route.
export const SKILLS_TAB = '/agents?tab=skills'

/** The Skills tab with one Skill's detail open, or just the tab when no id is given. */
export const skillLink = (id) => (id ? `${SKILLS_TAB}&open=${encodeURIComponent(id)}` : SKILLS_TAB)
