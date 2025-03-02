const Task = require('../models/Task');
const { validationResult } = require('express-validator');

exports.createTask = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const task = new Task(req.body);
    await task.save();
    res.status(201).json(task);
  } catch (err) {
    next(err);
  }
};

exports.getTasks = async (req, res) => {
  const { completed, sortBy, category, tags } = req.query;
  let filter = { userId: req.user.userId }; // Filtra por el ID del usuario

  if (completed !== undefined) {
    filter.completed = completed === 'true';
  }
  if (category) {
    filter.category = category;
  }
  if (tags) {
    filter.tags = { $in: tags.split(',') };
  }

  try {
    const tasks = await Task.find(filter).sort(sortBy ? { [sortBy]: 1 } : {});
    res.status(200).json(tasks);
  } catch (err) {
    console.error("Error al obtener las tareas:", err); // Depuración
    res.status(500).json({ error: 'Something went wrong!' });
  }
};

exports.getTaskById = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    res.status(200).json(task);
  } catch (err) {
    next(err);
  }
};

exports.updateTask = async (req, res, next) => {
  const { title, description, completed } = req.body;
  try {
    const task = await Task.findByIdAndUpdate(
      req.params.id,
      { title, description, completed },
      { new: true }
    );
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    res.status(200).json(task);
  } catch (err) {
    next(err);
  }
};

exports.deleteTask = async (req, res, next) => {
  try {
    const task = await Task.findByIdAndDelete(req.params.id);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    res.status(200).json({ message: 'Task deleted' });
  } catch (err) {
    next(err);
  }
};

exports.addSubtask = async (req, res, next) => {
  const { title } = req.body;
  try {
    const task = await Task.findById(req.params.taskId);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    task.subtasks.push({ title });
    await task.save();
    res.status(201).json(task);
  } catch (err) {
    next(err);
  }
};

exports.updateSubtask = async (req, res) => {
  const { taskId, subtaskId } = req.params;
  const { completed } = req.body;

  try {
    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    console.log("Buscando subtarea:", subtaskId); // Depuración
    console.log("Subtareas disponibles:", task.subtasks); // Depuración

    const subtask = task.subtasks.id(subtaskId); // Busca la subtarea por su ID
    if (!subtask) {
      return res.status(404).json({ message: 'Subtask not found' });
    }

    subtask.completed = completed; // Actualiza el estado de la subtarea
    await task.save(); // Guarda los cambios en la base de datos

    res.status(200).json(task); // Devuelve la tarea actualizada
  } catch (err) {
    console.error("Error updating subtask:", err);
    res.status(500).json({ error: 'Something went wrong!' });
  }
};