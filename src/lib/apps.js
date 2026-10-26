// The apps an Admin switches on for the whole company (all off to begin with). A Channel or Connection stops for everyone the moment its app is off.
export const APPS = [
  { id: 'line', label: 'LINE' },
  { id: 'email', label: 'อีเมล' },
  { id: 'office365', label: 'Office365' },
  { id: 'addin', label: 'Office Add-in' },
]
export const appById = (id) => APPS.find((a) => a.id === id)
export const noApps = () => Object.fromEntries(APPS.map((a) => [a.id, false]))

/** Which app each kind of Outward action goes through. */
export const OUTWARD_APP = { email: 'email', excel: 'office365', 'line-group': 'line' }
