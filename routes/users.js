const router = require('express').Router();
const {
  patchUserInfo, getCurrentUserInfo,
} = require('../controllers/users');
const { userInfoEditValidation } = require('../middlewares/validation');

router.get('/me', getCurrentUserInfo);

router.patch('/me', userInfoEditValidation, patchUserInfo);

module.exports = router;
