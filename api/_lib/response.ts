export function ok(res: any, data: any, status = 200) {
  return res.status(status).json({ success: true, data });
}

export function err(res: any, message: string, status = 400) {
  return res.status(status).json({ success: false, error: message });
}

export function handleCors(req: any, res: any): boolean {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return true;
  }
  return false;
}
