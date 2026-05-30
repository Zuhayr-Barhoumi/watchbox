package main

import (
	"database/sql"

	_ "modernc.org/sqlite"
)

type Job struct {
	ID         int
	Name       string
	LocalPath  string
	S3Bucket   string
	S3Key      string
	Schedule   string
	Enabled    bool
	LastRun    *string
	LastError  *string
	LastStatus *string
	CreatedAt  string
}

// Initialize the database connection and create the jobs table if it doesn't exist
func initDB(filepath string) (*sql.DB, error) {
	db, err := sql.Open("sqlite", filepath)
	if err != nil {
		return nil, err
	}
	createTableSQL := `CREATE TABLE IF NOT EXISTS jobs (
	"id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
	"name" TEXT,
	"local_path" TEXT,
	"s3_bucket" TEXT,
	"s3_key" TEXT,
	"schedule" TEXT,
	"enabled" BOOLEAN,
	"last_run" TEXT,
	"last_error" TEXT,
	"last_status" TEXT,
	"created_at" TEXT
);`
	_, err = db.Exec(createTableSQL)
	if err != nil {
		return nil, err
	}

	return db, nil
}

func GetAllJobs(db *sql.DB) ([]Job, error) {
	rows, err := db.Query("SELECT id, name, local_path, s3_bucket, s3_key, schedule, enabled, last_run, last_error, last_status, created_at FROM jobs")
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var jobs []Job
	for rows.Next() {
		var job Job
		err := rows.Scan(&job.ID, &job.Name, &job.LocalPath, &job.S3Bucket, &job.S3Key, &job.Schedule, &job.Enabled, &job.LastRun, &job.LastError, &job.LastStatus, &job.CreatedAt)
		if err != nil {
			return nil, err
		}
		jobs = append(jobs, job)
	}
	return jobs, nil
}

func GetJobByID(db *sql.DB, id int) (*Job, error) {
	row := db.QueryRow("SELECT id, name, local_path, s3_bucket, s3_key, schedule, enabled, last_run, last_error, last_status, created_at FROM jobs WHERE id = ?", id)
	var job Job
	err := row.Scan(&job.ID, &job.Name, &job.LocalPath, &job.S3Bucket, &job.S3Key, &job.Schedule, &job.Enabled, &job.LastRun, &job.LastError, &job.LastStatus, &job.CreatedAt)
	if err != nil {
		return nil, err
	}
	return &job, nil
}

func CreateJob(db *sql.DB, job Job) (int64, error) {
	result, err := db.Exec("INSERT INTO jobs (name, local_path, s3_bucket, s3_key, schedule, enabled, last_run, last_error, last_status, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
		job.Name, job.LocalPath, job.S3Bucket, job.S3Key, job.Schedule, job.Enabled, job.LastRun, job.LastError, job.LastStatus, job.CreatedAt)
	if err != nil {
		return 0, err
	}
	return result.LastInsertId()
}

func UpdateJob(db *sql.DB, job Job) error {
	_, err := db.Exec("UPDATE jobs SET name = ?, local_path = ?, s3_bucket = ?, s3_key = ?, schedule = ?, enabled = ?, last_run = ?, last_error = ?, last_status = ? WHERE id = ?",
		job.Name, job.LocalPath, job.S3Bucket, job.S3Key, job.Schedule, job.Enabled, job.LastRun, job.LastError, job.LastStatus, job.ID)
	return err
}

func DeleteJob(db *sql.DB, id int) error {
	_, err := db.Exec("DELETE FROM jobs WHERE id = ?", id)
	return err
}
