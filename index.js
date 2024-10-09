const express = require('express');
const app = express();
const path = require('path');
const fs = require('fs');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.set('view engine', 'ejs');

const port = 3000;

// Route to display the homepage with file previews
app.get("/", function (req, res) {
    fs.readdir('./files', function (err, files) {
        if (err) {
            return res.status(500).send('Unable to scan directory');
        }

        const filePreviews = files.map((file) => {
            const content = fs.readFileSync(`./files/${file}`, 'utf-8'); // Read file content
            const preview = content.split('\n').slice(0, 2).join(' '); // Get the first 2 lines
            return { filename: file, preview: preview };
        });

        res.render("index", { files: filePreviews });
    });
});

// Route to handle task creation and save it as a file
app.post("/create", function (req, res) {
    const filename = req.body.title.split(' ').join(''); // Sanitize filename
    fs.writeFile(`./files/${filename}.txt`, req.body.details, function (err) {
        if (err) {
            return res.status(500).send('Error creating task file');
        }
        res.redirect("/");
    });
});

// Route to display the full content of a file
app.get("/file/:filename", function (req, res) {
    const filename = req.params.filename;
    fs.readFile(`./files/${filename}`, 'utf-8', function (err, content) {
        if (err) {
            return res.status(500).send('Error reading the file');
        }
        res.render("file", { content: content, filename: filename });
    });
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
