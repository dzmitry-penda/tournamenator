import client from '../client';

export const getTest = (req, res, next) => {
  res.json({ message: 'hello world'});
};

export const postTest = async(req, res, next) => {
  console.log('sending1', req)
  client
    .sendMessage(req.body.message.chat.id, 'I am GROOT?')
    .promise()
    .then(function(){
      res.json({ ok: true });
    })
    .catch(next);
};
