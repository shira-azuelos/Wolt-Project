import bcrypt from 'bcryptjs';
import User, { generateToken } from "../models/users.model.js";

export const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: "User not found" }); 
        }
        const result = await bcrypt.compare(password, user.password);
        if (result) {
            const token = generateToken(user);
            return res.json({ username: user.firstname, token: token , userId: user._id, status: user.status });
        } else {
            return res.status(401).json({ message: "Invalid credentials" }); 
        }
    } catch (error) {
        console.error("Login error:", error);
        next({ message: 'Internal Server Error', status: 500 }); 
    }
}

export const register = async (req, res, next) => {
    try {
        const user = new User(req.body);
        await user.save();
        const token = generateToken(user);
        return res.status(201).json({ username: user.firstname, token: token , userId: user._id, status: user.status });
    } catch (error) {
        console.error("Register error:", error);
        next(error);
    }
};

export const getUserById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const user = await User.findById(id).select('-password'); 
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.status(200).json(user);
    } catch (error) {
        console.error('Error fetching user by ID:', error.message);
        if (error.kind === 'ObjectId') {
             return res.status(400).json({ message: 'Invalid User ID format' });
        }
        next({ message: 'Failed to fetch user', error: error.message });
    }
};

export const putUsers = async (req, res, next) => { 
    try {
        const { id } = req.params;
            const updatedUser = await User.findByIdAndUpdate(id, req.body, { 
            new: true, 
            runValidators: true 
        }).select('-password'); 
        if (!updatedUser) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.status(200).json(updatedUser);
        
    } catch (error) {
        console.error('שגיאה בעדכון משתמש:', error.message);
        next({ message: 'Failed to update user status', error: error.message });
    }
};