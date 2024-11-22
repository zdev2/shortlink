package logger

import (
	"fmt"
	"log"
	"os"
	"sync"
	"time"
)

const (
	Red    = "\033[31m"
	Green  = "\033[32m"
	Yellow = "\033[33m"
	Blue   = "\033[34m"
	Bold   = "\033[1m"
	Reset  = "\033[0m"
)

type LogEntry struct {
	StatusCode string
	Status string
	Message    string
	File       string
	Line       int
	Timestamp  string
}

type Logger struct {

	consoleLogger	*log.Logger
	fileLogger	*log.Logger
}

var (
	logger *Logger
	once   sync.Once
)

func InitLog(logFileName string) {
	once.Do(func() {
		var err error
		logger, err = NewLogger(logFileName)
		if err != nil {
			panic(fmt.Sprintf("Failed to initialize logger: %v", err))
		}
	})
}


func GetLogger() *Logger {
    if logger == nil {
        panic("Logger not initialized. Call InitLogger first.")
    }
    return logger
}

func NewLogger(logFileName string) (*Logger, error) {
	file, err := os.OpenFile(logFileName, os.O_APPEND|os.O_CREATE|os.O_WRONLY, 0644)
	if err != nil {
		return nil, fmt.Errorf("failed to open log file: %w", err)

	}

	consoleLogger := log.New(os.Stdout, "", 0)
	fileLogger := log.New(file, "", 0)

	return &Logger{
		consoleLogger: consoleLogger,
		fileLogger: fileLogger,
	}, nil
}

func (l *Logger) Log(statusCode string, status, message, color string) {

	timestamp := time.Now().Format("2006-01-02/15:04")

	logEntry := LogEntry{
		StatusCode: statusCode,
		Status: status,
		Message: message,
		Timestamp: timestamp,
	}

	coloredStatusCode := fmt.Sprintf("%s%s[%s]%s", Bold, color, logEntry.StatusCode, Reset)

	logMessage := fmt.Sprintf("%s[%s] %s:%s ", coloredStatusCode, logEntry.Timestamp, logEntry.Status, logEntry.Message, )
	plainLogMessage := fmt.Sprintf("[%s][%s] %s:%s ", logEntry.StatusCode, logEntry.Timestamp, logEntry.Status, logEntry.Message, )

	l.consoleLogger.Println(logMessage)
	l.fileLogger.Println(plainLogMessage)
}

func (l *Logger) Fatalf(format string, args ...interface{}) {
	// Get the caller file and line number


	// Create a timestamp
	timestamp := time.Now().Format("2006-01-02/15:04")

	// Format the message
	message := fmt.Sprintf(format, args...)
	logEntry := fmt.Sprintf("[%s][%s] %s ", Bold+Red+"FATAL"+Reset, timestamp, message,)

	// Log to console
	l.consoleLogger.Println(logEntry)

	// Log to file (plain text)
	plainLogEntry := fmt.Sprintf("[FATAL][%s] %s ", timestamp, message,)
	l.fileLogger.Println(plainLogEntry)

	// Exit the program
	os.Exit(1)
}

// Info logs an informational message with a blue status code
func (l *Logger) Info(status, message string) {
	l.Log("INFO", status, message, Blue)
}

// Success logs a success message with a green status code
func (l *Logger) Success(status, message string) {
	l.Log("SUCCESS", status, message, Green)
}

// Warning logs a warning message with a yellow status code
func (l *Logger) Warning(status, message string) {
	l.Log("WARNING", status, message, Yellow)
}

// Error logs an error message with a red status code
func (l *Logger) Error(status, message string) {
	l.Log("ERROR", status, message, Red)
}