import { Router } from 'express';
import {
  createChallenge,
  getChallengeBoard,
  getSocialOverview,
  joinChallenge,
  respondFriendRequest,
  sendFriendRequest
} from '../controllers/socialController.js';

const router = Router();

router.get('/overview', getSocialOverview);
router.post('/friend-request', sendFriendRequest);
router.post('/friend-request/respond', respondFriendRequest);
router.post('/challenges', createChallenge);
router.post('/challenges/:id/join', joinChallenge);
router.get('/challenges/:id/board', getChallengeBoard);

export default router;
