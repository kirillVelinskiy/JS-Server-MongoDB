import mongoose from 'mongoose';
import express from 'express';
import multer from 'multer';
import cors from 'cors';
import colors from 'colors';

import {
  registerValidation,
  loginValidation,
  postCreateValidation,
} from './Validations.js';

import { checkAuth } from './src/utils/CheckAuth.js';
import { handleValidationErrors } from './src/utils/HandleValidationErrors.js';

import * as UserController from './src/controllers/UserController.js';
import * as PostController from './src/controllers/PostController.js';

// Подключение к БД
mongoose
  .connect(
    'mongodb+srv://admin:wwwwww@blog-mern.asotabq.mongodb.net/blog?retryWrites=true&w=majority'
  )
  .then(() => {
    console.log('DB connected!'.bgMagenta);
  })
  .catch((error) => {
    console.log('DB error...'.brightRed, error);
  });

// Записываем Express в переменную app
const app = express();

// Сервер понимает, что статические файлы отправляются в эту дерикторию
app.use('/uploads', express.static('uploads'));

// Хранилище картинок
const storage = multer.diskStorage({
  destination: (_, __, cb) => {
    cb(null, './src/uploads');
  },
  filename: (_, file, cb) => {
    cb(null, file.originalname);
  },
});

const upload = multer({ storage });

// Парсим входящие запросы в формате JSON
app.use(express.json());

// Разрешаем сторонним доменам отправлять запросы на наш сервер
app.use(cors());

// запуск сервера
app.listen(4444, (error) => {
  if (error) {
    return console.log('Server startup error: '.brightRed, error);
  }

  console.log('Server started!'.rainbow.bold);
});

// Регистрация пользователя
app.post(
  '/auth/register',
  registerValidation,
  handleValidationErrors,
  UserController.register
);

// Авторизация пользователя
app.post(
  '/auth/login',
  loginValidation,
  handleValidationErrors,
  UserController.login
);

// Удаление пользователя
app.delete('/auth/me', checkAuth, UserController.deleteUser);

// Получение информации о пользователе
app.get('/auth/me', checkAuth, UserController.getMe);

// Загрузка картинки на сервер
app.post('/upload', checkAuth, upload.single('image'), (req, res) => {
  res.json({
    url: `./src/uploads/${req.file.originalname}`,
  });
});

// Создание поста
app.post(
  '/posts',
  checkAuth,
  postCreateValidation,
  handleValidationErrors,
  PostController.create
);

// Удаление поста
app.delete('/posts/:id', checkAuth, PostController.remove);

// Редактирование поста
app.patch(
  '/posts/:id',
  checkAuth,
  postCreateValidation,
  handleValidationErrors,
  PostController.update
);

// Получение списка постов
app.get('/posts', PostController.getAllPosts);

// Получение одного поста
app.get('/posts/:id', PostController.getOnePost);
