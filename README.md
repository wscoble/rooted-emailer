# Rooted Emailer

## About

Rooted Emailer is a desktop application built with Wails and Go, designed to simplify the process of sending weekly emails for Rooted groups. It allows facilitators to easily manage participant information and generate personalized emails based on templates.

## Features

- Manage participant information (name, email, snack week)
- Generate personalized emails using templates
- Update facilitator information and current week
- Copy email content, subject, and recipient addresses with a single click
- Save and load participant data locally

## Development

To run the application in development mode:

1. Ensure you have Go and Node.js installed on your system.
2. Install Wails by running: `go install github.com/wailsapp/wails/v2/cmd/wails@latest`
3. In the project directory, run: `wails dev`

This will start a Vite development server for fast hot reloading of frontend changes. You can also access Go methods through the dev server at http://localhost:34115.

## Building

To build a redistributable, production-mode package:

1. In the project directory, run: `wails build`
2. The built application will be available in the `build/bin` directory.

## Configuration

You can configure the project by editing `wails.json`. For more information about project settings, visit: https://wails.io/docs/reference/project-config

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License.
