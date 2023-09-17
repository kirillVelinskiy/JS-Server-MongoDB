import PostModel from '../models/Post.js';

// Создаем пост
export const create = async (req, res) => {
  try {
    const doc = new PostModel({
      title: req.body.title,
      text: req.body.text,
      imageUrl: req.body.imageUrl,
      tags: req.body.tags,
      user: req.userId,
    });

    const post = await doc.save();

    res.json(post);
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: 'Не удалось создать пост',
    });
  }
};

// Удаляем пост
export const remove = async (req, res) => {
  const postId = req.params.id;

  PostModel.findOneAndDelete({
    _id: postId,
  })
    .then((doc) => {
      if (!doc) {
        return res.status(500).json({ message: 'Не удалось вернуть пост' });
      }
      res.json({
        message: 'Пост удален',
      });
    })
    .catch((error) => {
      if (error) {
        return res.status(404).json({ message: 'Посты не найдены' });
      }
    });
};

// Обновление поста
export const update = async (req, res) => {
  try {
    const postId = req.params.id;

    await PostModel.updateOne(
      {
        _id: postId,
      },
      {
        title: req.body.title,
        text: req.body.text,
        imageUrl: req.body.imageUrl,
        user: req.userId,
        tags: req.body.tags,
      }
    );

    res.json({
      success: true,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: 'Не удалось обновить пост',
    });
  }
};

// Получаем тэги
export const getLastTags = async (req, res) => {
  try {
    const posts = await PostModel.find().limit(5).exec();

    const tags = posts
      .map((obj) => obj.tags)
      .flat()
      .slice(0, 5);

    res.json(tags);
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: 'Не удалось получить список тэгов',
    });
  }
};

// Получаем список всех постов
export const getAllPosts = async (req, res) => {
  try {
    const posts = await PostModel.find().populate('user').exec();
    res.json(posts);
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: 'Не удалось получить список постов',
    });
  }
};

// Получаем один пост
export const getOnePost = async (req, res) => {
  const postId = req.params.id;

  PostModel.findOneAndUpdate(
    {
      _id: postId,
    },
    {
      $inc: { viewsCount: 1 },
    },
    {
      returnDocument: 'after',
    }
  )
    .then((doc) => {
      if (!doc) {
        return res
          .status(404)
          .json({ message: 'Не удалось вернуть пост', error: error });
      }
      res.json(doc);
    })
    .catch((error) => {
      if (error) {
        return res
          .status(403)
          .json({ message: 'Пост не найдена', error: error });
      }
    });
};
