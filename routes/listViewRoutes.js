// //listViewRoutes.js

// const express = require("express");
// const router = express.Router();
// const { getDB } = require("../db/mongo");
// const { ObjectId } = require("mongodb");

// router.get("/", async (req, res) => {
//   try {
//     const db = getDB();
//     let result = await db
//       .collection("post")
//       .find()
//       .sort({ score: -1 }) // score를 기준으로 내림차순 정렬
//       .toArray();

//     res.render("list.ejs", { users: result });
//   } catch (err) {
//     console.error(err);
//     res.status(500).send("Server Error");
//   }
// });

// module.exports = router;

const express = require("express");
const router = express.Router();
const listViewController = require("../controllers/listViewController");

router.get("/", listViewController.getList);

module.exports = router;
