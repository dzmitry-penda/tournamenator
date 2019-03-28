import testSchema from "../models/test.schema";


export const getTest = (req, res, next) => {
  res.json({ message: 'hello world'});
}

export const postTest = async (req, res, next) => {
  try {
    const { body } = req;

    res.json(await testSchema.create(body));
  } catch (error) {
    next(error);
  }
};
