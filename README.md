# Kenya Seizure Support Chatbot

A simple web-based chatbot for Kenyan parents of children with epilepsy and special needs. The app helps log seizure events and review past records.

## Setup

1. Open the project folder in VS Code.
2. In a terminal, run:

```bash
npm install
```

3. Start the server:

```bash
npm start
```

4. Open `http://localhost:3000` in your browser.

## How it works

- The chat interface guides the user through logging seizure information.
- Each seizure entry is saved to `data/logs.json`.
- The log panel shows saved seizure records.

## Usage

- Type `new` to begin logging a new seizure.
- Type `view logs` to refresh and view saved entries.
- The chatbot collects:
  - child name
  - seizure date and time
  - duration
  - location
  - description
  - notes

## Notes

This prototype is designed to be a first step. For a production version, consider:
- secure storage and authentication
- offline support for limited internet access
- Kenyan language support (Swahili/Kiswahili)
- medical guidance disclaimers
