import { Router, Request, Response } from 'express';
import fs from 'fs/promises';
import path from 'path';

const router = Router();

router.get('/', async (req: Request, res: Response) => {
  try {
    const logFilePath = path.join(__dirname, '../Logger/combined.log'); 
    const data = await fs.readFile(logFilePath, 'utf-8');

    const escapeHtml = (unsafe: string) =>
      unsafe.replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");

  const logsHtml = data
  .split('\n')
  .filter(line => line.trim() !== '') // skip empty lines
  .map(line => {
    try {
      const json = JSON.parse(line);
      const prettyJson = JSON.stringify(json, null, 2)
        .replace(/\n/g, '<br>')
        .replace(/ /g, '&nbsp;');
      return `<pre style="font-family: monospace; background: #2d2d2d; padding: 10px; border-radius: 5px; margin-bottom: 10px;">${prettyJson}</pre>`;
    } catch {
      return `<p style="font-family: monospace; margin:0; padding: 2px;">${escapeHtml(line)}</p>`;
    }
  })
  .join('');


    res.status(200).send(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <title>Server Logs</title>
         <style>
  body {
    background-color: #1e1e1e;
    color: #d4d4d4;
    font-family: monospace;
    padding: 20px;
    white-space: pre-wrap;
    overflow-wrap: break-word;
    margin: 0;
  }
  h1 {
    font-family: Arial, sans-serif;
    color: #61dafb;
    margin-bottom: 20px;
  }
  pre, p {
    word-break: break-word;     /* NEW */
    overflow-wrap: anywhere;    /* NEW */
    white-space: pre-wrap;      /* NEW */
  }
</style>
      </head>
      <body>
          <h1>Server Logs</h1>
          <div>${logsHtml}</div>
      </body>
      </html>
    `);
  } catch (error: any) {
    res.status(500).send(`
      <h1>Failed to read logs</h1>
      <pre>${error.message}</pre>
    `);
  }
});





export default router;



