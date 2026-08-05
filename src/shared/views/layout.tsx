import { Html } from '@elysiajs/html';

interface customScriptType {
    src: string;
    defer: boolean;
}

export interface Scripts {
    alpine?: boolean;
    htmx?: boolean;
    htmxWebSocket?: boolean;
    customScript?: customScriptType[];
}

interface LayoutArgument {
    title: string;
    script?: Scripts;
    children: any;
}

export const Layout = (data: LayoutArgument) => {
    return (
        <html lang="en">
            <head>
                <meta charset="UTF-8" />
                <meta name="viewport" content="width=device-width, initial-scale=1.0" />
                <title>{data.title} | Chatify</title>
                <link rel="stylesheet" href="/public/style.css" />

                {data.script?.alpine && <script src="/public/alpine.js"></script>}
                {data.script?.htmx && <script src="/public/htmx.js"></script>}
                {data.script?.htmxWebSocket && <script src="/public/htmx-ws.js"></script>}
                {data.script?.customScript?.map((s) => (
                    <script defer={s.defer} src={s.src}></script>
                ))}
            </head>
            <body>{data.children}</body>
        </html>
    );
};
