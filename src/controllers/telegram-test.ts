import client from "../client";

export const getTest = (req, res, next) => {
  res.json({ message: 'hello world'});
};

export const postTest = async(req, res, next) => {
  client
    .sendMessage(req.body.message.chat.id, 'I am GROOT?')
    .promise()
    .then(function(){
      client
        .sendMessage(req.body.message.chat.id, 'I am GROOT!')
      res.json({ ok: true });
    })
    .catch(next);
};
