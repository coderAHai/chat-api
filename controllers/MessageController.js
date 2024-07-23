import Message from "../models/MessageModel.js";

export const getMessages = async (request, response, next) => {
  try {
    const sender = request.userId;
    const recipient = request.body.id;

    if (!sender || !recipient) {
      return response.status(400).send("Both User ID are required.");
    }

    const message = await Message.find({
      $or: [
        { sender: sender, recipient: recipient },
        { sender: recipient, recipient: sender },
      ],
    }).sort({ timestamp: 1 });

    return response.status(200).json(message);
  } catch (error) {
    console.log(error);
    return response.status(500).send("Internal Server Error");
  }
};
