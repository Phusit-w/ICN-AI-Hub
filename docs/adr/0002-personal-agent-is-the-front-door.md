# Each person has one Personal agent as the front door; the Agent library stays

Most staff cannot build an Agent from scratch, so every User gets one Personal agent that learns what they do, takes over the old "อัตโนมัติ" choice in the composer, and borrows Agents from the library instead of asking the User to pick or build one. This follows Hermes Agent, a personal agent that keeps a model of its user, writes reusable skills, and talks to people through the apps they already use. We keep the library, ADR-0001 (Agents with Steps) and Save for reuse, because the champion of a department still builds shared Agents and the Personal agent has to have something to borrow.

Two rules go with it. A Personal agent never writes or sends anything outside the app (email, a LINE group, an Excel file) without the User's yes, unless the User has turned that kind of action to automatic. And what it learns about a User is private to that User: it is shown and editable, it does not travel with an Agent the User shares, and it is not used in a LINE group unless the User allows it for that message.

## Considered options

- Replace the Agent library with the Personal agent alone. Rejected: shared, versioned Agents are how a department's know-how reaches the people who cannot write it down, and the work already built on them would be thrown away.
- Let each Agent hold its own Schedule and its own app permissions, as now. Rejected: writing to someone's Excel or LINE uses that person's rights, so a borrowed Agent must not carry them. They belong to the Personal agent.
- Let the Personal agent create its own skills and Steps silently. Rejected: a behaviour nobody saw being added is hard to explain or audit. It offers Save for reuse and the User accepts.

## Consequences

- "อัตโนมัติ" in the composer is the Personal agent; there is no second automatic choice next to it.
- Using another User's Agent copies it to the borrower (keeping a link to the original and showing "มีเวอร์ชันใหม่"), so the owner's later edits never change the borrower's results unseen.
- An Admin switches each outside app and channel on or off for the whole company (all off to begin with) and can cut one person's connection. When a staff account is closed, that person's memory and connections are deleted.
- Anything that reaches outside the company (LINE, Office365, a cloud model) gets only what the request needs, and the Run shows which memories were used. Requests the sensitive-data check catches are refused on LINE and sent to the web app.
