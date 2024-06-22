import DB_connect from "../db/index.js";
import { User } from "../models/userModel.js";

(async () => {
    try {
        await DB_connect("mongodb://localhost:27017");
        const user = new User({ name: "Admin", email: "admin@gmail.com", password: "Admin", isVerified: true, userType: "admin" });
        await user.save();
        console.log('Admin user created successfully');
        process.exit();
    } catch (error) {
        console.error('Failed to create admin user:', error);
    }
})();
