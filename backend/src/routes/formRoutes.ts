import { Router } from 'express';
import {
  getForms,
  getFormById,
  createForm,
  updateForm,
  publishForm,
  closeForm,
  deleteForm,
  getStudentAvailableForms,
} from '../controllers/formController.js';
import { authenticateJWT } from '../middleware/auth.js';
import { requireAdmin } from '../middleware/rbac.js';

const router = Router();

router.use(authenticateJWT);

router.get('/available', getStudentAvailableForms);
router.get('/', getForms);
router.get('/:id', getFormById);
router.post('/', requireAdmin, createForm);
router.put('/:id', requireAdmin, updateForm);
router.post('/:id/publish', requireAdmin, publishForm);
router.post('/:id/close', requireAdmin, closeForm);
router.delete('/:id', requireAdmin, deleteForm);

export default router;
