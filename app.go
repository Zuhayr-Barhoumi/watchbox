package main

import (
	"context"
	"database/sql"
	"fmt"
	"os"
	"path/filepath"

	_ "modernc.org/sqlite"
)

// App struct
type App struct {
	ctx context.Context
	db  *sql.DB
}

// NewApp creates a new App application struct
func NewApp() *App {
	return &App{}
}

// startup is called when the app starts. The context is saved
// so we can call the runtime methods
func (a *App) startup(ctx context.Context) {
	a.ctx = ctx
	db, err := a.initDB()
	if err != nil {
		println("Failed to initialize database:", err.Error())
		return
	}
	a.db = db
}

func (a *App) initDB() (*sql.DB, error) {
	dataDir, err := os.UserConfigDir()
	if err != nil {
		return nil, err
	}
	appDir := filepath.Join(dataDir, "watchbox")
	if err := os.MkdirAll(appDir, 0755); err != nil {
		return nil, err
	}
	dbPath := filepath.Join(appDir, "jobs.db")

	db, err := sql.Open("sqlite", dbPath)
	if err != nil {
		return nil, err
	}

	createTableSQL := `CREATE TABLE IF NOT EXISTS jobs (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		name TEXT NOT NULL,
		local_path TEXT NOT NULL,
		s3_bucket TEXT NOT NULL,
		s3_key TEXT NOT NULL,
		schedule TEXT NOT NULL,
		enabled BOOLEAN NOT NULL CHECK (enabled IN (0, 1)),
		last_run TEXT,
		last_error TEXT,
		last_status TEXT,
		created_at TEXT NOT NULL
	);`

	_, err = db.Exec(createTableSQL)
	if err != nil {
		return nil, err
	}

	return db, nil
}

// Greet returns a greeting for the given name
func (a *App) Greet(name string) string {
	return fmt.Sprintf("Hello %s, It's show time!", name)
}

func (a *App) GetAllJobs() ([]Job, error) {
	return GetAllJobs(a.db)
}

func (a *App) GetJobByID(id int) (*Job, error) {
	return GetJobByID(a.db, id)
}

func (a *App) CreateJob(job Job) (int64, error) {
	return CreateJob(a.db, job)
}

func (a *App) UpdateJob(job Job) error {
	return UpdateJob(a.db, job)
}

func (a *App) DeleteJob(id int) error {
	return DeleteJob(a.db, id)
}

func (a *App) RunJobNow(id int) error {
	job, err := GetJobByID(a.db, id)
	if err != nil {
		return err
	}
	// TODO: Implement actual job execution (watch folder, upload to S3)
	status := "running"
	job.LastStatus = &status
	UpdateJob(a.db, *job)
	return nil
}
