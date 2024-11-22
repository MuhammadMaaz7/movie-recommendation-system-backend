const validateSearchParams = (req, res, next) => {
    const {
      minRating,
      maxRating,
      minYear,
      maxYear,
      decade,
      page,
      limit
    } = req.query;
  
    // Validate numeric parameters
    if (minRating) req.query.minRating = parseFloat(minRating);
    if (maxRating) req.query.maxRating = parseFloat(maxRating);
    if (minYear) req.query.minYear = parseInt(minYear);
    if (maxYear) req.query.maxYear = parseInt(maxYear);
    if (decade) req.query.decade = parseInt(decade);
    if (page) req.query.page = parseInt(page);
    if (limit) req.query.limit = parseInt(limit);
  
    // Validate date range
    if (req.query.minYear && req.query.maxYear && req.query.minYear > req.query.maxYear) {
      return res.status(400).json({ success: false, message: 'Invalid date range' });
    }
  
    // Validate rating range
    if (req.query.minRating && req.query.maxRating && req.query.minRating > req.query.maxRating) {
      return res.status(400).json({ success: false, message: 'Invalid rating range' });
    }
  
    next();
  };
  
  module.exports = {
    validateSearchParams
  };