require('dotenv').config({ path: __dirname + '/.env' })
const express = require('express');
const path = require('path');
const fs = require('fs');
const cheerio = require('cheerio');
const cors = require('cors');
const { pool } = require('./db');
const bcrypt = require('bcrypt');
const app = express();
const port = 7777;
const jwt = require('jsonwebtoken');
const { v4 } = require('uuid');
const { prev } = require('./node_modules/cheerio/lib/api/traversing');

app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(cors());
/*
PAGE NAV
*/
//change back to type blocks?

function verifyToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    console.log("SHITTER12")
    if (token == null) return res.sendStatus(401);
    
    
    jwt.verify(token, process.env.SECRET_ACCESS_TOKEN, (err, user) => {
        console.log(req)
        if (err) return res.sendStatus(403);

        req.user = user;
        req.user_id = user.user_id;

        next();
    });
}

app.post("/signup", async (req, res) => {
    const { email, username, password } = req.body;

    try {
        const hash = await bcrypt.hash(password, 10);
        const result = await pool.query('INSERT INTO users (user_id, username, email, password_hash) VALUES (uuid_generate_v4(), \$1, \$2, \$3)', [username, email, hash]);
        const user = await pool.query('SELECT * FROM users WHERE email = \$1', [email]);
        const userForToken = {
            user_id: user.rows[0].user_id
        };
        const token = jwt.sign(userForToken, process.env.SECRET_ACCESS_TOKEN);
        res.status(201).json({ message: "User created and signed in", token: token });
    } catch (error) {
        res.status(500).json({ message: "Error creating user", error: error.message });
    }
});

/*
app.post("/deleteAccount", verifyToken, async (req, res) => {
    try {
        const email = req.body.email;
        await pool.query('DELETE * FROM users WHERE email = \$1', [email]);
        res.status(201).json({ message: "User deleted", token: token });
    } catch (error) {
        res.status(500).json({ message: "Error deleting user", error: error.message });
    }
});
*/

app.post("/signin", async (req, res) => {
    console.log("PISS");
    const { email, password } = req.body;
    try {
        const user = await pool.query('SELECT * FROM users WHERE email = \$1', [email]);

        if (user.rows.length === 0) {
            return res.status(401).json({ message: "User does not exist" });
        }

        const storedPasswordHash = user.rows[0].password_hash;
        const isPasswordValid = await bcrypt.compare(password, storedPasswordHash);

        if (!isPasswordValid) {
            return res.status(401).json({ message: "Invalid password" });
        }
        //TOKEN AUTH
        const userForToken = {
            user_id: user.rows[0].user_id
        };
        const token = jwt.sign(userForToken, process.env.SECRET_ACCESS_TOKEN);
        res.status(200).json({ message: "User signed in successfully", token: token });
    } catch (error) {
        res.status(500).json({ message: "Error signing in", error: error.message });
    }
});

app.post("/signout", async (req, res) => {

});

app.get("/api/note", verifyToken, async (req, res) => {
    try {
        const user_id = req.user_id
        const page_uid = await pool.query(`SELECT page_uid FROM users WHERE user_id = \$1`, [user_id])
        res.status(200).json({ uid: page_uid.rows[0].page_uid })
    } catch (error) {
        console.error(error);
        res.sendStatus(500);
    }
});
//Give user page HTML
app.get("/api/note/:UUID", verifyToken, async (req, res) => {
    try {
        const UUID = req.params.UUID;
        const user_id = req.user_id
        //have blocks as type and send all rooms
        //console.log(UUID)
        const page = await pool.query(`SELECT * FROM pages WHERE page_uid = \$1`, [UUID])
        if (page.rows.length > 0) { // Check if page exists
            console.log("HI");
            const block_order = page.rows[0].block_order;
            const room_uid = page.rows[0].room_uid;

            const room = await pool.query('SELECT page_order, title FROM rooms WHERE room_uid = $1', [room_uid]);
            const page_order = room.rows[0].page_order;
            const title = room.rows[0].title;

            const pages = await pool.query('SELECT page_uid, title FROM pages WHERE room_uid = $1', [room_uid]);
            const sortedPages = page_order.map(pageUid => pages.rows.find(page => page.page_uid === pageUid));

            const blocks = await pool.query('SELECT block_uid, content FROM blocks WHERE page_uid = $1', [UUID]);
            const sortedBlocks = block_order.map(blockUid => blocks.rows.find(block => block.block_uid === blockUid));

            await pool.query('UPDATE users SET room_uid = $1, page_uid = $2 WHERE user_id = $3', [room_uid, UUID, user_id]);

            res.json({ page: page.rows[0], blocks: sortedBlocks, pages: sortedPages, title: title });
        } else {
            res.status(404).json({ message: "Page not found" }); // Return 404 if page not found
        }
        
    } catch (error) {
        console.error(error);
        res.sendStatus(500);
    }
});

app.post("/api/note/:UUID/requestLink", verifyToken, async (req, res) => {
    try {
        const UUID = req.params.UUID;
        const reqTitle = req.body.title; // Assuming title is sent in the request body
        const room_uid_result = await pool.query(`SELECT room_uid FROM pages WHERE page_uid = \$1`, [UUID]);
        const room_uid = room_uid_result.rows[0].room_uid;
        const page_result = await pool.query(`SELECT * FROM pages WHERE title = \$1 AND room_uid = \$2`, [reqTitle, room_uid]);

        const page = page_result.rows[0];
        console.log(page_result.rows[0])
        res.json({ page });
    } catch (error) {
        console.error(error);
        res.sendStatus(500);
    }
});


app.post("/api/note/:UUID/createBlock", verifyToken, async (req, res) => {
    try {
        const UUID = req.params.UUID
        const user_id = req.user_id;
        block_uid = v4();
        const parent_uid = req.body.parent_uid
        const pre = req.body.pre
        const post = req.body.post
        await pool.query(`UPDATE blocks SET content = jsonb_set(content, '{content}', to_jsonb(\$1::jsonb), false) WHERE block_uid = \$2`, [JSON.stringify(pre), parent_uid])
        await pool.query(`INSERT INTO blocks(block_uid, content, page_uid) VALUES (\$1, jsonb_build_object('type', 'text', 'content', to_jsonb(\$2::jsonb)), \$3)`, [block_uid, JSON.stringify(post), UUID])
        const currentBlockOrder = await pool.query('SELECT block_order FROM pages WHERE page_uid = \$1', [UUID]);
        blockOrder = currentBlockOrder.rows[0].block_order
        const desiredIndex = blockOrder.indexOf(parent_uid) + 1;
        blockOrder.splice(desiredIndex, 0, block_uid);
        const updatedBlockOrder = blockOrder;
        await pool.query('UPDATE pages SET block_order = \$1 WHERE page_uid = \$2', [updatedBlockOrder, UUID]);
        res.status(200).json({ new_uid: block_uid })
    } catch (error) {
        console.error(error)
        res.sendStatus(500)
    }
});


app.post("/api/note/:UUID/deleteBlock", verifyToken, async (req, res) => {
    try {
        const UUID = req.params.UUID
        const user_id = req.user_id;
        const parent_uid = req.body.parent_uid
        const post = req.body.post
        console.log(post)
        const currentBlockOrder = await pool.query('SELECT block_order FROM pages WHERE page_uid = \$1', [UUID]);
        blockOrder = currentBlockOrder.rows[0].block_order
        const prev_uid = blockOrder[blockOrder.indexOf(parent_uid) - 1];
        await pool.query(`DELETE FROM blocks WHERE block_uid = \$1`, [parent_uid]);
        await pool.query(`UPDATE pages SET block_order = (SELECT array_agg(element) FROM unnest(block_order) AS element WHERE element <> \$1)`, [parent_uid]);
        await pool.query(`UPDATE blocks SET content = jsonb_set(content, '{content}', to_jsonb((content->>'content' || \$1)::text), false) WHERE block_uid = \$2`, [post, prev_uid]);
        
        res.status(200).json({ new_uid: prev_uid })
    } catch (error) {
        console.error(error)
        res.sendStatus(500)
    }
});

//Save page change content
app.post("/api/note/:UUID/saveData", verifyToken, async (req, res) => {
    try {
        const UUID = req.params.UUID
        const user_id = req.user_id;
        const block_uid = req.body.block_uid;
        const content = req.body.content;
        //If block uid is title uid change title, else change block
        if (block_uid === UUID) {
            await pool.query(`UPDATE pages SET title = \$1 WHERE page_uid = \$2`, [content, UUID])
        } else {

            await pool.query(`UPDATE blocks SET content = jsonb_set(content, '{content}', to_jsonb(\$1::jsonb), false) WHERE block_uid = \$2`, [JSON.stringify(content), block_uid])
        }
        res.sendStatus(200)
    } catch (error) {
        console.error(error)
        res.sendStatus(500)
    }
});

app.post("/createRoom", verifyToken, async (req, res) => {
    try {

        const user_id = req.user_id
        //type solo or team
        const type = req.type
        const room_uid = v4();
        const page_uid = v4();
        const block_uid = v4();
        //Create new room
        console.log("YO")
        await pool.query(`INSERT INTO rooms(room_uid, title, page_order) VALUES (\$1, 'New Room', ARRAY[]::UUID[])`, [room_uid]);
        //Add room to workspace_roles
        await pool.query(`insert into workspace_roles(workspace_role_id, user_uid, room_uid, role_id) values (uuid_generate_v4(), \$1, \$2, 1)`, [user_id, room_uid])
        
        //Create new page
        await pool.query(`INSERT INTO pages(page_uid, title, room_uid, block_order) VALUES (\$1, '', \$2, ARRAY[]::UUID[])`, [page_uid, room_uid])
        //await pool.query(`INSERT INTO pages(page_uid, title, room_uid, blocks) VALUES (\$1, '', \$2, ARRAY[ROW(\$1, '{"content":""}')::block])`, [page_uid, room_uid])

        //Create room_order
        await pool.query(`UPDATE rooms SET page_order = array_append(page_order, \$1) WHERE room_uid = \$2`, [page_uid, room_uid])
        //Create new block
        await pool.query(`INSERT INTO blocks(block_uid, content, page_uid) VALUES (\$1, jsonb_build_object('type', 'text', 'content', ''), \$2)`, [block_uid, page_uid])
        //Create block_order
        await pool.query(`UPDATE pages SET block_order = array_append(block_order, \$1) WHERE page_uid = \$2`, [block_uid, page_uid])
        //Set active room and page for user
        await pool.query('UPDATE users SET room_uid = \$1, page_uid = \$2 WHERE user_id = \$3', [room_uid, page_uid, user_id]);
        res.status(201).json({ success: true, message: 'Data inserted successfully', page_uid: page_uid });
    } catch (error) {
        console.error(error)
        res.sendStatus(500)
    }
});

app.post("/createPage", verifyToken, async (req, res) => {
    try {
        const user_id = req.user_id
        let room_uid = await pool.query(`SELECT room_uid FROM users WHERE user_id = \$1`, [user_id])
        room_uid = room_uid.rows[0].room_uid
        const page_uid = v4();
        const title = 'Untitled';
        const block_uid = v4();
        await pool.query(`INSERT INTO pages(page_uid, title, room_uid, block_order) VALUES (\$1, '', \$2, ARRAY[]::UUID[])`, [page_uid, room_uid])
        await pool.query(`UPDATE rooms SET page_order = array_append(page_order, \$1) WHERE room_uid = \$2`, [page_uid, room_uid])
        await pool.query(`INSERT INTO blocks(block_uid, content, page_uid) VALUES (\$1, jsonb_build_object('type', 'text', 'content', ''), \$2)`, [block_uid, page_uid])
        await pool.query(`UPDATE pages SET block_order = array_append(block_order, \$1) WHERE page_uid = \$2`, [block_uid, page_uid])

        res.status(200).json({ page_uid: page_uid, title: title})
    } catch (error) {
        console.error(error)
        res.sendStatus(500)
    }
    
});
//delete pages

app.post("/deletePage", verifyToken, async (req, res) => {
    try {

        const user_id = req.user_id;
        const page_uid = req.body.page_uid;
        let room_uid = await pool.query(`SELECT room_uid FROM users WHERE user_id = \$1`, [user_id])
        room_uid = room_uid.rows[0].room_uid
        await pool.query(`DELETE FROM blocks WHERE page_uid = \$1`, [page_uid])
        await pool.query(`DELETE FROM pages WHERE page_uid = \$1`, [page_uid])
        await pool.query(`UPDATE rooms SET page_order = array_remove(page_order, \$1) WHERE room_uid = \$2`, [page_uid, room_uid]);
        res.status(200).json({})
    } catch (error) {
        console.error(error)
        res.sendStatus(500)
    }

});

app.listen(port, () => {
    console.log(`SERVER LISTENING ON ${port}`);
});
