import User from "../models/UserModel.js";

// 搜索联系人
export const searchContacts = async (request, response, next) => {
  try {
    const { search } = request.body;
    const { userId } = request;
    if (search === undefined || search === null) {
      return response.status(400).send("search is required.");
    }
    const filterSearch = search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regex = new RegExp(filterSearch, "i");
    const contacts = await User.find({
      $and: [
        { _id: { $ne: userId } },
        { $or: [{ userName: regex }, { email: regex }] },
      ],
    });
    return response.status(200).json(contacts);
  } catch (error) {
    console.log(error);
    return response.status(500).send("Internal Server Error");
  }
};
