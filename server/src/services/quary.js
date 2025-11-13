const getPagination = (query) => {
  const { page, limit } = query;
  const pageNum = Math.abs(parseInt(page)) || 1;
  // When the client doesn't provide a limit, return all launches by default
  // (limit 0 means no limit in MongoDB). This ensures the frontend receives
  // both upcoming and historical launches so the Upcoming and History pages
  // can render correctly.
  const limitNum =
    typeof limit === "undefined" ? 0 : Math.abs(parseInt(limit)) || 0;
  const skip = (pageNum - 1) * limitNum;
  return { skip, limit: limitNum };
};

module.exports = {
  getPagination,
};
