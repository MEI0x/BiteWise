require('dotenv').config();
const express = require('express');
const cors = require('cors');
const pool = require('./db'); // Import our DB connection
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// A secret key used to sign our secure tokens. 
//const JWT_SECRET = "bitewise_super_secret_key_123";

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json()); // Allows our server to parse JSON bodies sent by the frontend

// Test Route to verify server is running
app.get('/test-server', (req, res) => {
    res.send('🚀 BiteWise backend server is up and running!');
});

// Test Route to verify Database Connection
app.get('/test-db', async (req, res) => {
    try {
        const result = await pool.query('SELECT NOW();');
        res.json({ message: '🔌 Connected to Postgres successfully!', time: result.rows[0] });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('❌ Database connection failed!');
    }
});

// ==========================================
// AUTHENTICATION MIDDLEWARE
// ==========================================
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // "Bearer TOKEN_STRING"

    if (!token) return res.status(401).json({ message: "Access Denied: No Token Provided" });

    try {
        const verified = jwt.verify(token, process.env.JWT_SECRET);
        req.user = verified; // Attaches { userId: X } to the req object
        next();
    } catch (err) {
        res.status(403).json({ message: "Invalid or Expired Token" });
    }
};

// ==========================================
// USER AUTHENTICATION ROUTES
// ==========================================

// USER REGISTRATION
// ⚡ ONE SINGLE, PERFECTLY MERGED REGISTRATION ROUTE
app.post('/api/auth/register', async (req, res) => {
    try {
        const { username, email, password } = req.body;

        // 1. Verify all fields exist in the incoming request payload
        if (!email || !password || !username) {
            return res.status(400).json({ error: "All fields are required." });
        }

        // 2. Strict Structural Email Validation Regex Pattern
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ error: "Please enter a valid email address (e.g., user@domain.com)." });
        }

        // 3. Enforce password rules (Frontend rules matched: Capital, Number, Symbol, Min 8 chars)
        const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,}$/;
        if (!passwordRegex.test(password)) {
            return res.status(400).json({ 
                error: "Password must be at least 8 characters long, contain an uppercase letter, a number, and a special character." 
            });
        }

        // 4. Schema Duplication Guard: Query PostgreSQL pool to see if email is claimed
        const userCheck = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        if (userCheck.rows.length > 0) {
            return res.status(400).json({ error: "User with this email already exists" });
        }

        // 5. Securely Hash Password
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // 6. Run the SQL Insertion into your PostgreSQL database schema
        const newUser = await pool.query(
            'INSERT INTO users (username, email, password_hash) VALUES ($1, $2, $3) RETURNING id, username, email',
            [username, email, hashedPassword]
        );

        // 7. Sign and Dispatch Security Token using your Env key string
        const token = jwt.sign({ userId: newUser.rows[0].id }, process.env.JWT_SECRET, { expiresIn: '24h' });
        
        // 8. Return data payload cleanly back to front-end handler
        res.json({ token, user: newUser.rows[0] });

    } catch (err) {
        console.error("Backend Registration Failure Log:", err.message);
        res.status(500).json({ error: "Server error during registration process." });
    }
}); // 💡 This is now the ONLY closing bracket at the absolute end of the logic tree!




// USER LOGIN
app.post('/api/auth/login', async (req, res) => {
    try {
        // 1. Accept an identifier (which can be either a username or an email)
        const { identifier, password } = req.body;

        if (!identifier || !password) {
            return res.status(400).json({ error: "All login fields are required." });
        }

        // 2. Expanded SQL check: Match against the email column OR the username column
        const userCheck = await pool.query(
            'SELECT * FROM users WHERE email = $1 OR username = $1', 
            [identifier.trim()]
        );

        // 3. Guard clause if no user account matches
        if (userCheck.rows.length === 0) {
            return res.status(400).json({ error: "Invalid credentials. Account not found." });
        }

        const user = userCheck.rows[0];

        // 4. Verify hashed password match matrix
        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) {
            return res.status(400).json({ error: "Invalid credentials. Incorrect password." });
        }

        // 5. Generate validation token
        const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '24h' });

        res.json({ 
            token, 
            user: { id: user.id, username: user.username, email: user.email } 
        });

    } catch (err) {
        console.error("Login route error:", err.message);
        res.status(500).json({ error: "Server error during authentication." });
    }
});

// ==========================================
// SECURED PANTRY ROUTES
// ==========================================

app.get('/api/pantry', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.userId;
        const allItems = await pool.query(
            'SELECT * FROM pantry_items WHERE user_id = $1 ORDER BY id DESC', 
            [userId]
        );
        res.json(allItems.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server Error fetching pantry");
    }
});

app.post('/api/pantry', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.userId;
        // Ensure your backend is pulling these variables out of the request body:
        const { name, quantity, unit, expiration_date, category, subcategory } = req.body;

        const newItem = await pool.query(
            'INSERT INTO pantry_items (name, quantity, unit, expiration_date, user_id, category, subcategory) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
            [name, quantity, unit, expiration_date, userId, category || '🥫 Center Store (Pantry Staples)', subcategory || 'Other']
        );

        res.json(newItem.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server Error writing item categorizations");
    }
});

app.delete('/api/pantry/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.userId;
        
        await pool.query('DELETE FROM pantry_items WHERE id = $1 AND user_id = $2', [id, userId]);
        res.json({ message: "Item successfully removed" });
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server Error deleting pantry item");
    }
});

// AUTOMATION: Move to list safely (Kept the verified version)
app.post('/api/pantry/move-to-list/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.userId;

        const itemResult = await pool.query(
            'SELECT * FROM pantry_items WHERE id = $1 AND user_id = $2', 
            [id, userId]
        );
        if (itemResult.rows.length === 0) return res.status(404).json({ message: "Item not found" });

        const item = itemResult.rows[0];

        // Delete from pantry
        await pool.query('DELETE FROM pantry_items WHERE id = $1', [id]);

        // Insert into shopping list with user_id
        const newShoppingItem = await pool.query(
            'INSERT INTO shopping_list (name, quantity, unit, user_id) VALUES ($1, $2, $3, $4) RETURNING *',
            [item.name, 1, item.unit, userId]
        );

        res.json({
            message: `🔄 ${item.name} moved to shopping list!`,
            shoppingItem: newShoppingItem.rows[0]
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server Error during automation step");
    }
});

// ==========================================
// SECURED SHOPPING LIST ROUTES
// ==========================================

app.get('/api/shopping', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.userId;
        const items = await pool.query('SELECT * FROM shopping_list WHERE user_id = $1 ORDER BY id DESC', [userId]);
        res.json(items.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server Error fetching shopping list");
    }
});

app.post('/api/shopping', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.userId;
        const { name, quantity, unit } = req.body;
        const newItem = await pool.query(
            'INSERT INTO shopping_list (name, quantity, unit, user_id) VALUES ($1, $2, $3, $4) RETURNING *',
            [name, quantity, unit, userId]
        );
        res.json(newItem.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server Error creating shopping item");
    }
});

// --- UPDATE PANTRY ITEM QUANTITY ---
app.put('/api/shopping/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.userId;
        // Accept the status toggle, custom quantity, AND custom expiration date from the client
        const { is_purchased, actual_quantity, actual_expiry } = req.body;

        const updatedShopping = await pool.query(
            'UPDATE shopping_list SET is_purchased = $1 WHERE id = $2 AND user_id = $3 RETURNING *',
            [is_purchased, id, userId]
        );

        if (updatedShopping.rows.length === 0) {
            return res.status(404).json({ message: "Shopping item not found" });
        }

        const shopItem = updatedShopping.rows[0];

        if (is_purchased) {
            const finalQuantity = actual_quantity !== undefined ? parseFloat(actual_quantity) : parseFloat(shopItem.quantity);
            // Fallback to null if the user leaves the purchase calendar blank
            const finalExpiry = actual_expiry || null; 

            if (finalQuantity > 0) {
                const existingPantryItem = await pool.query(
                    'SELECT * FROM pantry_items WHERE LOWER(name) = LOWER($1) AND user_id = $2',
                    [shopItem.name, userId]
                );

                if (existingPantryItem.rows.length > 0) {
                    const currentPantryId = existingPantryItem.rows[0].id;
                    const newQuantity = Number(existingPantryItem.rows[0].quantity) + finalQuantity;
                    
                    // Update quantity AND update the expiration date to the newest fresh batch date
                    await pool.query(
                        'UPDATE pantry_items SET quantity = $1, expiration_date = $2 WHERE id = $3',
                        [newQuantity, finalExpiry, currentPantryId]
                    );
                } else {
                    await pool.query(
                        'INSERT INTO pantry_items (name, quantity, unit, expiration_date, user_id, category, subcategory) VALUES ($1, $2, $3, $4, $5, $6, $7)',
                        [shopItem.name, finalQuantity, shopItem.unit, finalExpiry, userId, req.body.category, req.body.subcategory]
                    );
                }
            }
        }

        res.json(shopItem);
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server Error processing grocery list checkout data models");
    }
});

app.delete('/api/shopping/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.userId;
        await pool.query('DELETE FROM shopping_list WHERE id = $1 AND user_id = $2', [id, userId]);
        res.json({ message: "Removed" });
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server Error deleting shopping item");
    }
});

// --- UPDATE PANTRY ITEM QUANTITY DIRECTLY ---
app.put('/api/pantry/:id/quantity', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.userId;
        const { quantity } = req.body;

        const parsedQuantity = parseFloat(quantity);
        
        // Handle empty typing states safely, otherwise validate the number
        if (isNaN(parsedQuantity) && quantity !== '') {
            return res.status(400).json({ message: "Invalid quantity value provided" });
        }

        // Default to 0 if the user entirely backspaces the input box while typing
        const finalQuantity = isNaN(parsedQuantity) ? 0 : parsedQuantity;

        const updatedItem = await pool.query(
            'UPDATE pantry_items SET quantity = $1 WHERE id = $2 AND user_id = $3 RETURNING *',
            [finalQuantity, id, userId]
        );

        if (updatedItem.rows.length === 0) {
            return res.status(404).json({ message: "Inventory item not found" });
        }

        // Convert the Postgres string numeric representation back to a clean JS float number
        const returnedRow = updatedItem.rows[0];
        returnedRow.quantity = Number(returnedRow.quantity);

        res.json(returnedRow);
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server Error updating inventory balances");
    }
});


// 👤 Drop this into your main server file (e.g., server.js)
app.put('/api/user/update', async (req, res) => {
    const { username, email } = req.body;
    
    // Try to find a user ID passed from the frontend safely
    // If your app stores user id in req.user, we check that too!
    const userId = req.body.id || (req.user && req.user.id); 
  
    if (!username || !email) {
      return res.status(400).json({ error: 'Username and email field data are required.' });
    }
  
    try {
      // 💡 IMPORTANT: Change 'pool.query' or 'db.query' below to match 
      // the exact name of your database variable at the top of your server file!
      const queryText = `
        UPDATE users 
        SET username = $1, email = $2 
        WHERE id = $3 
        RETURNING id, username, email;
      `;
      
      // Replace 'pool' with whatever your database client variable is named
      const result = await pool.query(queryText, [username, email, userId]);
  
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Target user record not found.' });
      }
  
      res.json({
        message: 'Profile updated successfully',
        username: result.rows[0].username,
        email: result.rows[0].email
      });
    } catch (err) {
      console.error('Database error during profile update:', err);
      if (err.code === '23505') { 
        return res.status(400).json({ error: 'That username or email address is already taken.' });
      }
      res.status(500).json({ error: 'Internal server database update failure.' });
    }
  });

  app.delete("/auth/delete-account", authenticateToken, async (req, res) => {
    try {
      // 1. Fallback extraction: check both common middleware placement keys
      const userId = req.user?.id || req.user?.userId; 
      
      if (!userId) {
        return res.status(401).json({ error: "Unauthorized: Missing user payload in token." });
      }

      console.log(`Executing safe purge for User ID: ${userId}`);
  
      // 2. Clear pantry dependencies safely
      // 💡 CHANGE "pantry" BELOW IF YOUR TABLE IS NAMED DIFFERENTLY (e.g., "pantry_items")
      try {
        await pool.query("DELETE FROM pantry WHERE user_id = $1", [userId]);
      } catch (pantryErr) {
        console.error("Pantry deletion skip logic:", pantryErr.message);
      }

      // 3. Clear shopping dependencies safely
      // 💡 CHANGE "shopping" BELOW IF YOUR TABLE IS NAMED DIFFERENTLY (e.g., "shopping_list")
      try {
        await pool.query("DELETE FROM shopping WHERE user_id = $1", [userId]);
      } catch (shopErr) {
        console.error("Shopping deletion skip logic:", shopErr.message);
      }
      
      // 4. Delete the core user profile checking both potential primary keys ("id" vs "user_id")
      let deleteUser = await pool.query(
        "DELETE FROM users WHERE id = $1 RETURNING username",
        [userId]
      );

      // If matching on "id" failed, try matching on "user_id" column structure
      if (deleteUser.rows.length === 0) {
        console.log("Primary key 'id' column returned empty. Trying alternative 'user_id' column path...");
        deleteUser = await pool.query(
          "DELETE FROM users WHERE user_id = $1 RETURNING username",
          [userId]
        );
      }
  
      if (deleteUser.rows.length === 0) {
        return res.status(404).json({ error: "User profile record not found in system storage." });
      }
  
      res.json({ message: `Account for ${deleteUser.rows[0].username} successfully removed.` });
    } catch (err) {
      console.error("CRITICAL DELETE HANDLER CRASH:", err); 
      res.status(500).json({ error: `Server space exception: ${err.message}` });
    }
});
app.listen(PORT, () => {
    console.log(`Server has started on port ${PORT}`);
});