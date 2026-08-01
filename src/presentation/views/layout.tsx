import { Html } from '@elysiajs/html';

export const Layout = (title: string, body: string) => {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title} | Chatify</title>
    <style>
        :root {
            --bg: #f8fafc;
            --surface: #ffffff;
            --primary: #6366f1;
            --text-main: #1e293b;
            --text-muted: #64748b;
            --border: #e2e8f0;
            --radius: 12px;
        }
        body { 
            font-family: 'Inter', system-ui, sans-serif; 
            background: var(--bg); 
            color: var(--text-main);
            margin: 0; display: flex; justify-content: center; height: 100vh;
        }
        .container { 
            width: 100%; max-width: 600px; background: var(--surface);
            display: flex; flex-direction: column; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1);
        }
        input { 
            padding: 0.75rem; border: 1px solid var(--border); border-radius: var(--radius);
            font-size: 1rem; transition: border-color 0.2s;
        }
        input:focus { outline: none; border-color: var(--primary); }
        button {
            background: var(--primary); color: white; border: none; font-weight: 600;
            padding: 0.75rem 1.5rem; border-radius: var(--radius); cursor: pointer;
            transition: opacity 0.2s;
        }
        button:hover { opacity: 0.9; }
        .error { color: #ef4444; background: #fee2e2; padding: 0.75rem; border-radius: var(--radius); margin-bottom: 1rem; font-size: 0.875rem; }
    </style>
</head>
<body>
    <div class="container">${body}</div>
</body>
</html>
`;
};

export const WrapWithLayout = (title: string, body: JSX.Element) => {
    return (
        <html lang="en">
            <head>
                <meta charset="UTF-8" />
                <meta name="viewport" content="width=device-width, initial-scale=1.0" />
                <title>{title} | Chatify</title>
            </head>
            <body>
                <div class="container">{body}</div>
            </body>
        </html>
    );
};
