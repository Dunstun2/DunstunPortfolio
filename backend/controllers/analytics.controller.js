const { AnalyticsEvent } = require('../models');
const { Op } = require('sequelize');
const crypto = require('crypto');

// POST /api/analytics/track
exports.trackEvent = async (req, res) => {
  try {
    const { event_type, action_name, path, referrer, device_type } = req.body;
    
    // Create an anonymized session ID based on IP and User Agent, rotating daily
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown';
    const userAgent = req.headers['user-agent'] || 'unknown';
    const today = new Date().toISOString().split('T')[0];
    const rawString = `${ip}-${userAgent}-${today}`;
    const session_id = crypto.createHash('sha256').update(rawString).digest('hex').substring(0, 16);

    await AnalyticsEvent.create({
      event_type: event_type || 'page_view',
      action_name,
      path: path || '/',
      referrer: referrer || null,
      device_type: device_type || 'desktop',
      session_id
    });

    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Failed to track event:', error);
    res.status(500).json({ success: false }); // Don't leak errors for tracking
  }
};

// GET /api/analytics/stats
exports.getStats = async (req, res) => {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Get basic counts
    const totalViews = await AnalyticsEvent.count({
      where: { event_type: 'page_view' }
    });

    const recentViews = await AnalyticsEvent.count({
      where: {
        event_type: 'page_view',
        createdAt: { [Op.gte]: thirtyDaysAgo }
      }
    });

    // Count unique sessions in last 30 days
    const uniqueVisitors = await AnalyticsEvent.count({
      distinct: true,
      col: 'session_id',
      where: {
        createdAt: { [Op.gte]: thirtyDaysAgo }
      }
    });

    // Top paths (last 30 days)
    const topPathsRaw = await AnalyticsEvent.findAll({
      attributes: ['path', [AnalyticsEvent.sequelize.fn('COUNT', AnalyticsEvent.sequelize.col('id')), 'views']],
      where: {
        event_type: 'page_view',
        createdAt: { [Op.gte]: thirtyDaysAgo }
      },
      group: ['path'],
      order: [[AnalyticsEvent.sequelize.literal('views'), 'DESC']],
      limit: 5,
      raw: true
    });

    // Device breakdown (last 30 days)
    const deviceStatsRaw = await AnalyticsEvent.findAll({
      attributes: ['device_type', [AnalyticsEvent.sequelize.fn('COUNT', AnalyticsEvent.sequelize.col('id')), 'count']],
      where: {
        event_type: 'page_view',
        createdAt: { [Op.gte]: thirtyDaysAgo }
      },
      group: ['device_type'],
      raw: true
    });

    // Action tracking
    const topActionsRaw = await AnalyticsEvent.findAll({
      attributes: ['action_name', [AnalyticsEvent.sequelize.fn('COUNT', AnalyticsEvent.sequelize.col('id')), 'count']],
      where: {
        event_type: 'action',
        createdAt: { [Op.gte]: thirtyDaysAgo }
      },
      group: ['action_name'],
      order: [[AnalyticsEvent.sequelize.literal('count'), 'DESC']],
      limit: 5,
      raw: true
    });

    res.json({
      success: true,
      data: {
        totalViews,
        recentViews,
        uniqueVisitors,
        topPaths: topPathsRaw,
        devices: deviceStatsRaw,
        topActions: topActionsRaw
      }
    });
  } catch (error) {
    console.error('Failed to get stats:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};
