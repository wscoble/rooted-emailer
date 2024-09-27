package main

import (
	"bytes"
	"context"
	"fmt"
	"html/template"
	"log"
	"os"
	"path/filepath"
	"regexp"
	"strings"
)

// App struct
type App struct {
	ctx context.Context
}

// NewApp creates a new App application struct
func NewApp() *App {
	return &App{}
}

// startup is called when the app starts. The context is saved
// so we can call the runtime methods
func (a *App) startup(ctx context.Context) {
	a.ctx = ctx
	log.Println("App started")
}

// TemplateData represents the data structure for template rendering
type TemplateData struct {
	Name         string
	Emails       []string
	Snacks       int
	CurrentWeek  int
	Facilitators string
}

// RenderedTemplate represents the structure of the rendered email
type RenderedTemplate struct {
	EmailAddresses []string `json:"emailAddresses"`
	Subject        string   `json:"subject"`
	Body           string   `json:"body"`
}

// RenderTemplate renders a template with the given data
func (a *App) RenderTemplate(data TemplateData) (RenderedTemplate, error) {
	log.Printf("RenderTemplate called with data: %+v", data)

	// Generate the template name based on CurrentWeek
	templateName := fmt.Sprintf("email-%d.gotmpl", data.CurrentWeek)
	log.Printf("Using template: %s", templateName)

	// Construct the path to the template file
	templatePath := filepath.Join("templates", templateName)
	log.Printf("Template path: %s", templatePath)

	// Check if the file exists
	if _, err := os.Stat(templatePath); os.IsNotExist(err) {
		log.Printf("Template file does not exist: %s", templatePath)
		return RenderedTemplate{}, fmt.Errorf("template file does not exist: %s", templatePath)
	}

	// Parse the template file
	tmpl, err := template.ParseFiles(templatePath, "templates/partials.gotmpl")
	if err != nil {
		log.Printf("Error parsing template: %v", err)
		return RenderedTemplate{}, fmt.Errorf("error parsing template: %v", err)
	}

	// Create a buffer to store the rendered template
	var buf bytes.Buffer

	// Execute the template with the provided data
	err = tmpl.ExecuteTemplate(&buf, templateName, data)
	if err != nil {
		log.Printf("Error executing template: %v", err)
		return RenderedTemplate{}, fmt.Errorf("error executing template: %v", err)
	}

	renderedContent := buf.String()
	log.Printf("Rendered template length: %d bytes", len(renderedContent))

	// Generate subject based on the current week
	subject := fmt.Sprintf("Rooted Week %d", data.CurrentWeek)

	return RenderedTemplate{
		EmailAddresses: data.Emails,
		Subject:        subject,
		Body:           renderedContent,
	}, nil
}

// ListTemplates returns a list of available email template names
func (a *App) ListTemplates() ([]string, error) {
	log.Println("ListTemplates called")

	files, err := os.ReadDir("templates")
	if err != nil {
		log.Printf("Error reading templates directory: %v", err)
		return nil, fmt.Errorf("error reading templates directory: %v", err)
	}

	var templates []string
	emailTemplateRegex := regexp.MustCompile(`^email-\d+\.gotmpl$`)

	for _, file := range files {
		if !file.IsDir() && emailTemplateRegex.MatchString(file.Name()) {
			templates = append(templates, strings.TrimSuffix(file.Name(), ".gotmpl"))
		}
	}

	log.Printf("Found templates: %v", templates)
	return templates, nil
}
