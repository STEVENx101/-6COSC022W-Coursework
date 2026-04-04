const { Course } = require("../models");

exports.createCourse = async (req, res) => {
  try {
    const { course_name, provider, year } = req.body;

    const item = await Course.create({
      user_id: req.user.id,
      course_name,
      provider,
      year
    });

    res.status(201).json({
      message: "Course created successfully",
      item
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getMyCourses = async (req, res) => {
  try {
    const items = await Course.findAll({
      where: { user_id: req.user.id },
      order: [["id", "DESC"]]
    });

    res.json(items);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.updateCourse = async (req, res) => {
  try {
    const item = await Course.findOne({
      where: { id: req.params.id, user_id: req.user.id }
    });

    if (!item) {
      return res.status(404).json({ message: "Course not found" });
    }

    await item.update(req.body);

    res.json({
      message: "Course updated successfully",
      item
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.deleteCourse = async (req, res) => {
  try {
    const item = await Course.findOne({
      where: { id: req.params.id, user_id: req.user.id }
    });

    if (!item) {
      return res.status(404).json({ message: "Course not found" });
    }

    await item.destroy();

    res.json({
      message: "Course deleted successfully"
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};