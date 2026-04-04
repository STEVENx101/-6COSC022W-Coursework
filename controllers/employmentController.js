const { EmploymentHistory } = require("../models");

exports.createEmployment = async (req, res) => {
  try {
    const { company, role, start_date, end_date } = req.body;

    const item = await EmploymentHistory.create({
      user_id: req.user.id,
      company,
      role,
      start_date,
      end_date
    });

    res.status(201).json({
      message: "Employment history created successfully",
      item
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getMyEmployment = async (req, res) => {
  try {
    const items = await EmploymentHistory.findAll({
      where: { user_id: req.user.id },
      order: [["id", "DESC"]]
    });

    res.json(items);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.updateEmployment = async (req, res) => {
  try {
    const item = await EmploymentHistory.findOne({
      where: { id: req.params.id, user_id: req.user.id }
    });

    if (!item) {
      return res.status(404).json({ message: "Employment record not found" });
    }

    await item.update(req.body);

    res.json({
      message: "Employment history updated successfully",
      item
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.deleteEmployment = async (req, res) => {
  try {
    const item = await EmploymentHistory.findOne({
      where: { id: req.params.id, user_id: req.user.id }
    });

    if (!item) {
      return res.status(404).json({ message: "Employment record not found" });
    }

    await item.destroy();

    res.json({
      message: "Employment history deleted successfully"
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};