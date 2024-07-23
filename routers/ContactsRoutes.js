import { Router } from "express";
import { verifyToken } from "../middlewares/AuthMiddleware.js";
import {
  getContactsList,
  searchContacts,
} from "../controllers/ContactsController.js";

const contactsRoutes = Router();

contactsRoutes.post("/search", verifyToken, searchContacts);
contactsRoutes.get("/getContacts", verifyToken, getContactsList);

export default contactsRoutes;
