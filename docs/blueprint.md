# **App Name**: CursorSync

## Core Features:

- Room Management: User authentication and room selection/creation screen.
- Cursor and Coordinate Display: Canvas to capture and display cursor movements, text area to log the current location
- Cursor Synchronization: Synchronize the host's cursor movements across all connected guest screens.
- Real-time Communication: SignalR self-host to establish and maintain real-time connections.
- Room Scalability: Redis pub/sub backplane to manage the multi-room state.

## Style Guidelines:

- Primary color: Deep purple (#673AB7), for a modern, engaging feel. 
- Background color: Light gray (#F5F5F5). The background hue comes from the purple primary, desaturated to approximately 20% saturation and lightened to maximum brightness, creating a subtle backdrop.
- Accent color: Bright teal (#00BCD4) used to provide a pop of contrast and highlight interactive elements.
- Font pairing: 'Space Grotesk' (sans-serif) for headlines and short content, and 'Inter' (sans-serif) for body text. This pairing blends a techy headline font with a readable body text.
- Use minimalist icons representing real-time connectivity and synchronization to illustrate data flow within the app.
- Clean, modular layout with a clear division between the cursor canvas, text log, and any control panels.
- Smooth cursor transition animations on the canvas to visually represent the real-time movement updates.