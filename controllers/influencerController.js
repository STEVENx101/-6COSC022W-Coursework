const { Op } = require("sequelize");
const { InfluencerDay, User, Profile } = require("../models");

function getTodayDate() {
  return new Date().toISOString().split("T")[0];
}

exports.getInfluencerOfTheDay = async (req, res) => {
  try {
    const today = getTodayDate();

    const influencer = await InfluencerDay.findOne({
      where: {
        active_date: today,
        is_active: true
      },
      include: [
        {
          model: User,
          attributes: ["id", "email", "attended_event"]
        }
      ]
    });

    if (!influencer) {
      return res.status(404).json({
        message: "No influencer assigned for today"
      });
    }

    const profile = await Profile.findOne({
      where: { user_id: influencer.user_id }
    });

    // Calculate monthly win count for this user
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split("T")[0];
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split("T")[0];

    const monthlyWins = await InfluencerDay.count({
      where: {
        user_id: influencer.user_id,
        active_date: { [Op.between]: [monthStart, monthEnd] }
      }
    });

    const maxWins = influencer.User?.attended_event ? 4 : 3;

    res.json({
      active_date: influencer.active_date,
      appearance_count: influencer.appearance_count,
      is_active: influencer.is_active,
      user: influencer.User,
      profile,
      monthlyWins,
      maxWins
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "Server error"
    });
  }
};

exports.activateWinningProfile = async (req, res) => {
  try {
    const { userId } = req.params;
    const today = getTodayDate();

    const existing = await InfluencerDay.findOne({
      where: { active_date: today }
    });

    if (existing) {
      await existing.update({
        user_id: userId,
        appearance_count: 0,
        is_active: true
      });

      return res.json({
        message: "Winning alumni profile updated for today",
        influencer: existing
      });
    }

    const influencer = await InfluencerDay.create({
      user_id: userId,
      active_date: today,
      appearance_count: 0,
      is_active: true
    });

    res.status(201).json({
      message: "Winning alumni profile activated successfully",
      influencer
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "Server error"
    });
  }
};

exports.updateAppearanceCount = async (req, res) => {
  try {
    const { userId } = req.params;
    const today = getTodayDate();

    const influencer = await InfluencerDay.findOne({
      where: {
        user_id: userId,
        active_date: today,
        is_active: true
      }
    });

    if (!influencer) {
      return res.status(404).json({
        message: "Active influencer not found for today"
      });
    }

    await influencer.update({
      appearance_count: influencer.appearance_count + 1
    });

    res.json({
      message: "Appearance count updated successfully",
      influencer
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "Server error"
    });
  }
};

exports.resetAppearanceCount = async (req, res) => {
  try {
    const { userId } = req.params;
    const today = getTodayDate();

    const influencer = await InfluencerDay.findOne({
      where: {
        user_id: userId,
        active_date: today,
        is_active: true
      }
    });

    if (!influencer) {
      return res.status(404).json({
        message: "Active influencer not found for today"
      });
    }

    await influencer.update({
      appearance_count: 0
    });

    res.json({
      message: "Appearance count reset successfully",
      influencer
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "Server error"
    });
  }
};