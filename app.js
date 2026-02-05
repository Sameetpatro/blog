//Work plan- npm init -y, npm i express, write server including "/", "/contact", "about" endopints, nodemon app.js.
import express from "express";
import bodyParser from "body-parser"; // Middleware
import ejs from "ejs";
import _ from "lodash";
import nodemailer from "nodemailer";
import path from "path";
import Swal from 'sweetalert2/dist/sweetalert2.all.min.js';
import serverless from 'serverless-http';
import pg from "pg";
import dotenv from 'dotenv';
import multer from "multer";

const homeStartingContent = "Hi Everyone.";
const aboutTitle = "About Me"; 
const contactTitle = "Contact";
const notification = "";

/*
Creating the application structure, including routes, views, and static files.
Setting up the Express.js server and defining the necessary routes.
*/

// Express.js server:
const app = express();
const port = process.env.PORT || 3000; // Use the PORT provided by the environment or default to 3000

dotenv.config();

app.set('view engine', 'ejs');


const db = new pg.Client({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_DATABASE,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});
db.connect();



// Body parser middleware
app.use(bodyParser.urlencoded({ extended: true }));
// Server static files
app.use(express.static("public"));

let posts = [
  { id: 1, subject: "Fitness", title: "How to get fit", content: "Eat healthy and exercise" }];


// defining the necessary routes:

// the client ask for a resource- the homepage.
app.get("/", async function(req, res){
  try {
    const result = await db.query("SELECT id, subject, title, content, published_at FROM posts ORDER BY id ASC");
    posts = result.rows;

    res.render("home", {
      startingContent: homeStartingContent, 
      posts: posts, // Pass the posts array to home.ejs
    });
  } catch (err) {
    console.log(err);
  }
});

// GET ABOUT:
app.get("/about", function(req, res){
  res.render("about", {aboutTitle: aboutTitle});  // render the about page and pass the aboutContent variable to it
});

// GET contact:
app.get("/contact", function(req, res){
  res.render("contact", {contactTitle: contactTitle, notification: notification});  // render the contact page and pass the contactContent variable to it 
});




// Multer configuration for handling file uploads
const upload = multer({ dest: 'uploads/' }); // Set the destination folder where uploaded files will be stored



// GET and POST compose (put together):
app.get("/compose", async function(req, res){
  res.render("compose");
});
app.post("/compose", async function(req, res){
  try {
    await db.query("INSERT INTO posts (subject, title, content) VALUES ($1, $2, $3)", [req.body.postSubject, req.body.postTitle, req.body.postBody]);
    const post = {subject:req.body.postSubject, title: req.body.postTitle, content: req.body.postBody};
    posts.push(post);   
    res.redirect("/");
  } catch (err) {
    console.log(err);
  }
});





// When a user clicks on an article, display the article's subject, title, and content
app.get("/articles/:articleName", async function(req, res){
  const requestedTitle = _.lowerCase(req.params.articleName);

  try {
    const result = await db.query("SELECT * FROM posts WHERE LOWER(title) = $1", [requestedTitle]);
    
    if (result.rows.length > 0) {
      const post = result.rows[0];
      res.render("post", {
        subject: post.subject, 
        title: post.title, 
        content: post.content,
        published_at: post.published_at
      });
    } else {
      res.status(404).send("Article not found");
    }
  } catch (err) {
    console.error("Error fetching article:", err);
    res.status(500).send("Error fetching article");
  }
});




// GET route to render the edit form for a specific article
app.get("/edit/:articleName", async function (req, res) {
  try {
    const requestedTitle = req.params.articleName;
    const result = await db.query("SELECT * FROM posts WHERE title = $1", [requestedTitle]);
    const post = result.rows[0];

    if (!post) {
      return res.status(404).send("Article not found");
    }
    res.render("edit", { post: post });
  } catch (err) {
    console.error("Error fetching article for edit:", err);
    res.status(500).send("Error fetching article for edit");
  }
});

// POST route to handle updating an article
app.post("/edit/:articleName", async function (req, res) {
  try {
    const requestedTitle = req.params.articleName;
    await db.query("UPDATE posts SET subject = $1, title = $2, content = $3 WHERE title = $4", 
      [req.body.postSubject, req.body.postTitle, req.body.postBody, requestedTitle]);
    res.redirect("/articles/" + _.lowerCase(req.body.postTitle));
  } catch (err) {
    console.error("Error updating article:", err);
    res.status(500).send("Error updating article");
  }
});


/* 
// Edit without database
app.get("/edit/:postName", function (req, res) {
  const requestedTitle = _.lowerCase(req.params.postName);
  posts.forEach(function (post) {
    const storedTitle = _.lowerCase(post.title);  // converts the post's title to lowercase for each post
    // If current post title matches the requested title, it renders the "edit" view, passing the post data to it.
    if (storedTitle === requestedTitle) {
      res.render("edit", { post: post });}
  });
});

// Edit post route - handle the form submission to update the post (when 'update' is clicked)
app.post("/edit/:postName", function (req, res) {
  const requestedTitle = _.lowerCase(req.params.postName);

  posts.forEach (function (post, index) {
    const storedTitle = _.lowerCase(post.title);
    // If current post title matches the requested title, it updates the corresponding post in the posts array with the data received from the form (req.body). Then redirects the user to the URL for viewing the updated post.
    if (storedTitle === requestedTitle) {
      posts [index] = { subject: req.body.postSubject, title: req.body.postTitle, content: req.body.postBody };
      res.redirect("/articles/" + _.lowerCase(req.body.postTitle));    
    }
  });
});*/






// Delete article route - handle article deletion
app.get("/delete/:articleName", async function (req, res) {
  const requestedTitle = _.lowerCase(req.params.articleName);
  try {
    await db.query("DELETE FROM posts WHERE LOWER(title) = $1", [requestedTitle]);
    res.redirect("/");
  } catch (err) {
    console.log(err);
  }
});


// Health check endpoint
app.get("/health", function(req, res) {
  res.status(200).send("OK");
});


// POST request for handling the form submission
app.post("/contact", function (req, res) {
  // Extract form data
  const name = req.body.name;
  const email = req.body.email;
  const inquiry = req.body.inquiry;
  const message = req.body.message;

  // Nodemailer configuration
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "shanibider@gmail.com", // 
      pass: "frbl yjwk gqvd prwa", // "App Password"- generated app password (provided by gmail)
    },
  });

  // Function to format camel case words with spaces
  function formatInquiry(inquiry) {
    return inquiry.replace(/([a-z])([A-Z])/g, '$1 $2');
  }

  // Email options
  const mailOptions = {
    from: email,
    to: "shanibider@gmail.com",
    subject: `New Message from ${name}`,
    text: `Inquiry: ${formatInquiry(inquiry)} \n\n\n ${message} \n\n Email sent from: ${email}`,
  };


  // Send the email
  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      console.error(error);
      res.redirect("/contact?notification=Error: Unable to send the message.");      
    } else {
      console.log("Email sent: " + info.response);
    
      // Show SweetAlert for success
      const successNotification = 'Email sent successfully!';
      res.render("contact", { contactTitle: contactTitle, notification: successNotification });
    }
  });
});




app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});




// Export the app object. This is required for the serverless function.
const router = express.Router();

router.get('/', (req, res) => {
  res.json({ message: 'Hello from Express.js!' });
});

app.use('/.netlify/functions/app', router);  // path must route to lambda

export const handler = serverless(app);