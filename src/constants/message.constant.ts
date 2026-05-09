import exp from 'constants';
import ConstantService from '../common/config';
const PROJECT_NAME = ConstantService.config.PROJECT_NAME;
export const httpStatusCodes = {
  OK: 200,
  BAD_REQUEST: 400,
  NOT_FOUND: 404,
  INTERNAL_SERVER: 500,
};
export const CONNECTION_NOT_FOUND =
  'Connection provider not found in application context';

export const SOMETHING_WENT_WRONG =
  'Something went wrong. Please try again later.';

export const COMMON = {
  WRONG_RESULT:
    'Something went wrong while processing your request. Please try again later.',
};

export const DATA_SENT = 'Data sent successfully.';

export const SETTING_UPDATED = 'Settings updated successfully.';

export const SESSION_EXPIRED = 'Your session is expired, please login again.';

export const LOGIN_SUCCESS = 'Login success!';

export const INVALID_BODY_TOKEN = 'Invalid body token.';
export const RECORD_NOT_FOUND = 'Record not found.';
