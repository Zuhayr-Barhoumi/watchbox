# Watchbox Implementation Plan

## Current State (Completed)

- ✅ Vue 3 + TypeScript + Vite 5 frontend
- ✅ Go backend with SQLite database + CRUD operations
- ✅ Wails bindings generated & wired
- ✅ Theme toggle (dark/light) with localStorage persistence
- ✅ Job modal (add/edit) with Teleport to body
- ✅ StatusBar (thin bottom bar: X active · Y failed · watchbox)
- ✅ EmptyState when no jobs
- ✅ Toolbar with "Add job" / "Run all" buttons
- ✅ Full build pipeline: `npm run build`, `npx tsc`, `wails build`

---

## Remaining Work

### 1. Job Execution Engine (Core Feature)
| Task | Details |
|------|---------|
| **Folder watcher** | Use `fsnotify` to watch `LocalPath` for file changes |
| **S3 upload** | Add `aws-sdk-go-v2` for S3 PutObject |
| **RunJobNow implementation** | Trigger immediate sync of folder → S3 |
| **Debouncing** | Batch rapid file changes (e.g., 500ms) |

### 2. Scheduler
| Task | Details |
|------|---------|
| **Cron scheduler** | Parse `Schedule` (HH:MM) → run daily at specified time |
| **Background goroutine** | Start on app startup, stop on shutdown |
| **Emit events** | `runtime.EventsEmit("job:updated", job)` after each run |

### 3. Settings Persistence
| Task | Details |
|------|---------|
| **Config struct** | `AWSConfig{KeyID, Secret, Region}` + DB path |
| **Go methods** | `SaveConfig`, `LoadConfig`, `TestAWSConnection` |
| **Wire SettingsPanel** | Connect test/save buttons to Go backend |

### 4. Real-time Updates
| Task | Details |
|------|---------|
| **Go emits** | After Create/Update/Delete/RunJobNow |
| **Frontend listens** | Already has `EventsOn` handlers in App.vue |

### 5. Polish
| Task | Details |
|------|---------|
| **Toast notifications** | Success/error feedback |
| **Loading states** | On RunJobNow, TestConnection |
| **Validation** | Path exists, S3 bucket accessible |

---

## Open Questions

1. **Priority order** - Start with job execution (1) → scheduler (2) → settings (3)?
2. **S3 upload behavior** - Sync entire folder on each run, or only changed files?
3. **Schedule format** - Keep `HH:MM` daily, or add cron expressions?
4. **Error handling** - Show failed files in UI, or just log?

---

## Dependencies to Add

**Go:**
- `github.com/fsnotify/fsnotify` - file watching
- `github.com/aws/aws-sdk-go-v2` - S3 operations
- `github.com/robfig/cron/v3` - scheduling

**Frontend:**
- May need toast library (or build simple one)