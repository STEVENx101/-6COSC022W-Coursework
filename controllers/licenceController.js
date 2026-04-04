const { Licence } = require("../models");

exports.createLicence = async (req, res) => {
  try {
    const { title, issuer, year } = req.body;

    const item = await Licence.create({
      user_id: req.user.id,
      title,
      issuer,
      year
    });

    res.status(201).json({
      message: "Licence created successfully",
      item
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getMyLicences = async (req, res) => {
  try {
    const items = await Licence.findAll({
      where: { user_id: req.user.id },
      order: [["id", "DESC"]]
    });

    res.json(items);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.updateLicence = async (req, res) => {
  try {
    const item = await Licence.findOne({
      where: { id: req.params.id, user_id: req.user.id }
    });

    if (!item) {
      return res.status(404).json({ message: "Licence not found" });
    }

    await item.update(req.body);

    res.json({
      message: "Licence updated successfully",
      item
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.deleteLicence = async (req, res) => {
  try {
    const item = await Licence.findOne({
      where: { id: req.params.id, user_id: req.user.id }
    });

    if (!item) {
      return res.status(404).json({ message: "Licence not found" });
    }

    await item.destroy();

    res.json({
      message: "Licence deleted successfully"
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};