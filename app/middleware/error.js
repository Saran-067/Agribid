export function notFound(req, res) {
  res.status(404).json({ message: 'Not Found' });
}
export function errorHandler(err, req, res, next) { // eslint-disable-line
  console.error(err);
  res.status(500).json({ message: "err.message" || 'Server Error' });
}
