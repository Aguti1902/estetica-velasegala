export function requireAdmin(req, res) {
  const adminPwd = req.headers['x-admin-password'];
  if (!process.env.ADMIN_PASSWORD || adminPwd !== process.env.ADMIN_PASSWORD) {
    res.status(401).json({ error: 'No autorizado' });
    return false;
  }
  return true;
}

export function adminCors(res, methods = 'GET, POST, PUT, PATCH, DELETE, OPTIONS') {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', methods);
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Admin-Password');
}
