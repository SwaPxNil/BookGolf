const AdminLog = require('../models/AdminLog');

const createAdminLog = async (actorId, action, metadata) => {
  const adminLog = await AdminLog.create({
    actor_id: actorId,
    action,
    metadata,
  });
  return adminLog;
};

const getAdminLogs = async () => {
    const adminLogs = await AdminLog.find().populate('actor_id', 'full_name email');
    return adminLogs;
};

module.exports = {
  createAdminLog,
  getAdminLogs,
};
