import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import UserModel from '../models/User.js';

// Регистрация пользователя
export const register = async (req, res) => {
  try {
    // Шифровка пароля с помощью bcrypt
    const password = req.body.password;
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);

    // Запись данных пользователя в документ
    const doc = new UserModel({
      fullName: req.body.fullName,
      email: req.body.email,
      passwordHash: hash,
      avatarUrl: req.body.avatarUrl,
    });

    // Запись пользователя в БД
    const user = await doc.save();

    const token = jwt.sign(
      {
        _id: user._id,
      },
      'secret123',
      {
        expiresIn: '30d', // Через  30 дней токен перестанет быть валидным
      }
    );

    const { passwordHash, ...userData } = user._doc;

    res.json({ ...userData, token });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: 'Не удалось зарегестрировать пользователя',
    });
  }
};

// Авторизация пользователя
export const login = async (req, res) => {
  try {
    // Поиск по Email
    const user = await UserModel.findOne({ email: req.body.email });

    if (!user) {
      return req.status(400).json({
        message: 'Неверный логин или пароль',
      });
    }

    // Сходятся ли пароли, который вписал пользователь с паролем, находящимся в БД
    const isValidPass = await bcrypt.compare(
      req.body.password,
      user._doc.passwordHash
    );

    if (!isValidPass) {
      return req.status(400).json({
        message: 'Неверный логин или пароль',
      });
    }

    const token = jwt.sign(
      {
        _id: user._id,
      },
      'secret123',
      {
        expiresIn: '30d', // Через  30 дней токен перестанет быть валидным
      }
    );

    const { passwordHash, ...userData } = user._doc;

    res.json({ ...userData, token });
  } catch (error) {
    console.log(error);
    res.status(404).json({
      message: 'Неверный логин или пароль',
    });
  }
};

// Получение информации о пользователе
export const getMe = async (req, res) => {
  try {
    // Поиск по id пользователя
    const user = await UserModel.findById(req.userId);

    if (!user) {
      return req.status(400).json({
        message: 'Пользователь не найден',
      });
    }

    const { passwordHash, ...userData } = user._doc;

    res.json(userData);
  } catch (error) {
    console.log(error);
    res.status(404).json({
      message: 'Нет доступа',
    });
  }
};

// Получение информации о пользователе
export const deleteUser = async (req, res) => {
  try {
    // Поиск по id пользователя
    const user = await UserModel.findByIdAndDelete(req.userId);

    if (!user) {
      return req.status(400).json({
        message: 'Пользователь не найден',
      });
    }

    const { userData } = user._doc;

    res.json({ message: 'Пользователь удален!', userData });
  } catch (error) {
    console.log(error);
    res.status(404).json({
      message: 'Нет доступа',
    });
  }
};
