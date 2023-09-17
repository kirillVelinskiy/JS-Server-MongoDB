import jwt from 'jsonwebtoken';

export const checkAuth = (req, res, next) => {
  // Если токен пришел или же нет передавай строчку
  const token = (req.headers.authorization || '').replace(/Bearer\s?/, '');

  if (token) {
    try {
      // Расшифровка токена с помощью verify
      const decoded = jwt.verify(token, 'secret123');

      // _id -> это id внутри самого токена
      req.userId = decoded._id;

      // Если запрос выполнился корреткно
      // (расшифровал токен и сохранил его в req.userId), выполняем следующую фун-ию
      next();
    } catch (error) {
      return res.status(404).json({
        message: 'Нет доступа',
      });
    }
  } else {
    return res.status(403).json({
      message: 'Нет доступа',
    });
  }
};
