const express = require("express");
const path = require("path");
const sqlite = require("sqlite");
const sqlite3 = require("sqlite3");

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;
const dbPath = path.join(__dirname, "books.db");
let db;

// GET all books
app.get("/books/", async (req, res) => {
  try {
    const books = await db.all("SELECT * FROM book ORDER BY id");
    res.status(200).json(books);
  } catch (error) {
    res.status(500).json({ error: "Unable to retrieve books" });
  }
});

// GET one book
app.get("/books/:bookId/", async (req, res) => {
  try {
    const book = await db.get("SELECT * FROM book WHERE id = ?", [req.params.bookId]);
    if (!book) return res.status(404).json({ error: "Book not found" });
    res.status(200).json(book);
  } catch (error) {
    res.status(500).json({ error: "Unable to retrieve book" });
  }
});

// POST a book
app.post("/books/", async (req, res) => {
  try {
    const { title, author, price, pages } = req.body;
    if (typeof title !== "string" || !title.trim() ||
        typeof author !== "string" || !author.trim() ||
        !Number.isInteger(price) || price < 0 ||
        !Number.isInteger(pages) || pages <= 0) {
      return res.status(400).json({ error: "Provide title, author, non-negative integer price, and positive integer pages" });
    }
    const result = await db.run(
      "INSERT INTO book (title, author, price, pages) VALUES (?, ?, ?, ?)",
      [title.trim(), author.trim(), price, pages]
    );
    res.status(201).json({ message: "Book added successfully", bookId: result.lastID });
  } catch (error) {
    res.status(500).json({ error: "Unable to add book" });
  }
});

// PUT a book
app.put("/books/:bookId/", async (req, res) => {
  try {
    const { title, author, price, pages } = req.body;
    if (typeof title !== "string" || !title.trim() ||
        typeof author !== "string" || !author.trim() ||
        !Number.isInteger(price) || price < 0 ||
        !Number.isInteger(pages) || pages <= 0) {
      return res.status(400).json({ error: "Provide title, author, non-negative integer price, and positive integer pages" });
    }
    const result = await db.run(
      "UPDATE book SET title = ?, author = ?, price = ?, pages = ? WHERE id = ?",
      [title.trim(), author.trim(), price, pages, req.params.bookId]
    );
    if (result.changes === 0) return res.status(404).json({ error: "Book not found" });
    res.status(200).json({ message: "Book updated successfully" });
  } catch (error) {
    res.status(500).json({ error: "Unable to update book" });
  }
});

// DELETE a book
app.delete("/books/:bookId/", async (req, res) => {
  try {
    const result = await db.run("DELETE FROM book WHERE id = ?", [req.params.bookId]);
    if (result.changes === 0) return res.status(404).json({ error: "Book not found" });
    res.status(200).json({ message: "Book deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Unable to delete book" });
  }
});

app.use((req, res) => res.status(404).json({ error: "Route not found" }));

async function initializeDBAndServer() {
  try {
    db = await sqlite.open({ filename: dbPath, driver: sqlite3.Database });
    await db.run("PRAGMA foreign_keys = ON");
    app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));
  } catch (error) {
    console.error("Database connection failed:", error.message);
    process.exit(1);
  }
}

initializeDBAndServer();
