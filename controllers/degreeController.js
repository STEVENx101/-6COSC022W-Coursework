const { Degree } = require("../models");

exports.createDegree = async (req, res) => {
  try {
    const { degree_name, institution, year } = req.body;

    const item = await Degree.create({
      user_id: req.user.id,
      degree_name,
      institution,
      year
    });

    res.status(201).json({
      message: "Degree created successfully",
      item
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getMyDegrees = async (req, res) => {
  try {
    const items = await Degree.findAll({
      where: { user_id: req.user.id },
      order: [["id", "DESC"]]
    });

    res.json(items);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.updateDegree = async (req, res) => {
  try {
    const item = await Degree.findOne({
      where: { id: req.params.id, user_id: req.user.id }
    });

    if (!item) {
      return res.status(404).json({ message: "Degree not found" });
    }

    await item.update(req.body);

    res.json({
      message: "Degree updated successfully",
      item
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.deleteDegree = async (req, res) => {
  try {
    const item = await Degree.findOne({
      where: { id: req.params.id, user_id: req.user.id }
    });

    if (!item) {
      return res.status(404).json({ message: "Degree not found" });
    }

    await item.destroy();

    res.json({
      message: "Degree deleted successfully"
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};