export const Layout = (title: string, body: string) => `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title} - Chatify</title>
    <style>
        body { font-family: system-ui, sans-serif; background: #f4f4f5; margin: 0; padding: 0; display: flex; align-items: center; justify-content: center; min-height: 100vh; }
        .container { background: white; padding: 2rem; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); width: 100%; max-width: 600px; }
        h1 { margin-top: 0; }
        input, button { width: 100%; padding: 0.5rem; margin-bottom: 1rem; border: 1px solid #d4d4d8; border-radius: 4px; box-sizing: border-box; }
        button { background: #3b82f6; color: white; border: none; cursor: pointer; font-weight: bold; }
        button:hover { background: #2563eb; }
        #chat-window { height: 400px; overflow-y: auto; border: 1px solid #d4d4d8; padding: 1rem; margin-bottom: 1rem; border-radius: 4px; background: #fafafa; display: flex; flex-direction: column; }
        .message { margin-bottom: 0.5rem; }
        .message strong { color: #3b82f6; }
        .error { color: red; margin-bottom: 1rem; }
    </style>
</head>
<body>
    <div class="container">
        ${body}
    </div>
</body>
</html>
`;
