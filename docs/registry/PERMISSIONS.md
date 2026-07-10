# Permissions

Generated 2026-07-10T01:31:28.660Z.

Roles: anonymous · listener · student · researcher · creator · moderator · editor · admin · superadmin

| role | accessible routes |
|---|---|
| anonymous | 143 |
| listener | 155 |
| student | 155 |
| researcher | 155 |
| creator | 165 |
| moderator | 155 |
| editor | 177 |
| admin | 197 |
| superadmin | 197 |

## Non-public routes

| route | requires |
|---|---|
| `podcasts.bookmark` | listener |
| `academy.my-learning` | listener |
| `community.profile` | listener |
| `user.profile` | listener |
| `user.profile.edit` | listener |
| `user.bookmarks` | listener |
| `user.history` | listener |
| `user.downloads` | listener |
| `user.notifications` | listener |
| `user.settings` | listener |
| `premium.history` | listener |
| `premium.library` | listener |
| `analytics` | admin, superadmin |
| `analytics.listeners` | admin, superadmin |
| `analytics.live` | admin, superadmin |
| `analytics.streams` | admin, superadmin |
| `analytics.content` | admin, superadmin |
| `analytics.geography` | admin, superadmin |
| `analytics.revenue` | admin, superadmin |
| `studio` | creator, editor, admin |
| `studio.live` | creator, editor, admin |
| `studio.record` | creator, editor, admin |
| `studio.upload` | creator, editor, admin |
| `studio.editor` | creator, editor, admin |
| `studio.script` | creator, editor, admin |
| `studio.caller` | creator, editor, admin |
| `studio.queue` | creator, editor, admin |
| `studio.automation` | creator, editor, admin |
| `studio.assets` | creator, editor, admin |
| `cms` | editor, admin, superadmin |
| `cms.dashboard` | editor, admin, superadmin |
| `cms.articles` | editor, admin, superadmin |
| `cms.shows` | editor, admin, superadmin |
| `cms.podcasts` | editor, admin, superadmin |
| `cms.research` | editor, admin, superadmin |
| `cms.media` | editor, admin, superadmin |
| `cms.users` | editor, admin, superadmin |
| `cms.comments` | editor, admin, superadmin |
| `cms.moderation` | editor, admin, superadmin |
| `cms.workflows` | editor, admin, superadmin |
| `cms.scheduler` | editor, admin, superadmin |
| `admin` | admin, superadmin |
| `admin.users` | admin, superadmin |
| `admin.roles` | admin, superadmin |
| `admin.permissions` | admin, superadmin |
| `admin.api` | admin, superadmin |
| `admin.settings` | admin, superadmin |
| `admin.logs` | admin, superadmin |
| `admin.audit` | admin, superadmin |
| `admin.security` | admin, superadmin |
| `admin.storage` | admin, superadmin |
| `admin.backups` | admin, superadmin |
| `admin.integrations` | admin, superadmin |
| `admin.registry-explorer` | admin, superadmin |
