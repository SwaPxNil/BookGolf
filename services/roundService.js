const Round = require('../models/Round');

const createRound = async (roundData) => {
  const round = await Round.create(roundData);
  return round;
};

const getUserRounds = async (userId) => {
    const rounds = await Round.find({ user_id: userId }).populate('course_id');
    return rounds;
};

const getRoundById = async (roundId) => {
    const round = await Round.findById(roundId).populate('course_id');
    return round;
};

module.exports = {
  createRound,
  getUserRounds,
  getRoundById,
};
