const getPagination = (query) => {
  const { page, limit } = query;
  const pageNum = Math.abs(parseInt(page)) || 1;
  const limitNum = Math.abs(parseInt(limit)) || 10;
  const skip = (pageNum - 1) * limitNum;
  return { skip, limit: limitNum };
};

module.exports = {
  getPagination,
};