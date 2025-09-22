package db

import (
 "context"
 "fmt"
 "os"

 "github.com/jackc/pgx/v5/pgxpool"
)

var DB *pgxpool.Pool

//For Render
func ConnectDB() error {
	dsn := os.Getenv("DATABASE_URL")

	if dsn == "" {
		return fmt.Errorf("DATABASE_URL environment variable not set")
	}

	pool, err := pgxpool.New(context.Background(), dsn)
	if err != nil {
		return err
	}

	DB = pool
	fmt.Println("Connected to Postgres")
	return nil
}

//For Local Host
// func ConnectDB() error {
//  dsn := fmt.Sprintf("postgres://%s:%s@%s:%s/%s",
//   os.Getenv("DB_USER"),
//   os.Getenv("DB_PASSWORD"),
//   os.Getenv("DB_HOST"),
//   os.Getenv("DB_PORT"),
//   os.Getenv("DB_NAME"))

//  pool, err := pgxpool.New(context.Background(), dsn)
//  if err != nil {
//   return err
//  }

//  DB = pool
//  fmt.Println("Connected to Postgres")
//  return nil
// }