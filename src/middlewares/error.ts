import * as httpStatuses from 'http-status-codes';
import * as _ from 'lodash';


export const errorHandler = (error, req, res, next) => {
  console.log(error.stack || error.message || error);

  const { statusCode, message, additions } = error;

  if (statusCode && message) {
    res.status(statusCode).json({ message, ...additions });
  } else if (error.errors) {
    res.status(httpStatuses.BAD_REQUEST).json({
      message: _.values(error.errors)[0].message
    });
  } else {
    res.status(httpStatuses.INTERNAL_SERVER_ERROR).json({
      message: httpStatuses.getStatusText(httpStatuses.INTERNAL_SERVER_ERROR)
    });
  }
};