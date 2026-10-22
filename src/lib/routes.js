// Skills have no page or tab of their own (spec story 40): a Skill's detail opens over the Agents page.

/** The Agents page with one Skill's detail open, or just the Agents page when no id is given. */
export const skillLink = (id) => (id ? `/agents?skill=${encodeURIComponent(id)}` : '/agents')
