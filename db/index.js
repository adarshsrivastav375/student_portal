import mongoose from "mongoose";
const DB_NAME = "user";

const DB_connect = async (DB_URI_LOCAL = null) => {
  try {
    const connectionInstance = await mongoose.connect(
      `${DB_URI_LOCAL || process.env.DB_URI_LOCAL}/${DB_NAME}`
    );
    console.log(
      `\n app is connected to mongoDB... DB_Host ${connectionInstance.connection.host}`
    );
  } catch (error) {
    console.log("failed to connect to the database", error);
    process.exit(1);
  }
};
export default DB_connect;
