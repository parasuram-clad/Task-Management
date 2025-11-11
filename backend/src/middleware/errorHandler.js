const notFound = (req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  res.status(404);
  next(error);
};

const errorHandler = (err, req, res, next) => {
  console.error(err);
  const statusCode = res.statusCode !== 200 ? res.statusCode : 500;
  res.status(statusCode).json({
    message: err.message || 'Server Error',
    ...(process.env.NODE_ENV === 'production' ? {} : { stack: err.stack }),
  });
};

module.exports = { notFound, errorHandler };
