// REST API URL
const API_URL = "http://localhost:5000/api/books";


// DOM ELEMENTS
const bookForm = document.getElementById("bookForm");
const bookTableBody = document.getElementById("bookTableBody");
const searchInput = document.getElementById("searchInput");

const totalBooks = document.getElementById("totalBooks");
const availableBooks = document.getElementById("availableBooks");
const issuedBooks = document.getElementById("issuedBooks");

const message = document.getElementById("message");


// STORE BOOKS
let books = [];


// LOAD BOOKS WHEN PAGE OPENS

document.addEventListener("DOMContentLoaded", () => {
    loadBooks();
});


// READ - GET ALL BOOKS

async function loadBooks() {

    try {

        const response = await fetch(API_URL);

        if (!response.ok) {
            throw new Error("Unable to fetch books");
        }

        books = await response.json();

        displayBooks(books);
        updateDashboard();

    } catch (error) {

        console.error(error);

        showMessage(
            "Backend connection failed. Please start the server.",
            "red"
        );
    }
}


// DISPLAY BOOKS

function displayBooks(bookList) {

    bookTableBody.innerHTML = "";

    if (bookList.length === 0) {

        bookTableBody.innerHTML = `
            <tr>
                <td colspan="8" style="text-align:center;">
                    No books found
                </td>
            </tr>
        `;

        return;
    }


    bookList.forEach(book => {

        const row = document.createElement("tr");

        const statusClass =
            book.status === "Available"
                ? "status-available"
                : "status-issued";


        row.innerHTML = `

            <td>${book.id}</td>

            <td>${escapeHTML(book.title)}</td>

            <td>${escapeHTML(book.author)}</td>

            <td>${escapeHTML(book.isbn)}</td>

            <td>${escapeHTML(book.category)}</td>

            <td>${book.year}</td>

            <td class="${statusClass}">
                ${escapeHTML(book.status)}
            </td>

            <td>

                <button
                    class="edit-btn"
                    onclick="editBook(${book.id})"
                >
                    Edit
                </button>

                <button
                    class="delete-btn"
                    onclick="deleteBook(${book.id})"
                >
                    Delete
                </button>

            </td>
        `;

        bookTableBody.appendChild(row);

    });
}


// CREATE / UPDATE

bookForm.addEventListener("submit", async function(event) {

    event.preventDefault();


    const id = document.getElementById("bookId").value;

    const title = document.getElementById("title").value.trim();
    const author = document.getElementById("author").value.trim();
    const isbn = document.getElementById("isbn").value.trim();
    const category = document.getElementById("category").value;
    const year = document.getElementById("year").value;
    const status = document.getElementById("status").value;


    // CLIENT-SIDE VALIDATION

    if (!title || !author || !isbn || !category || !year) {

        showMessage(
            "Please fill all required fields.",
            "red"
        );

        return;
    }


    const currentYear = new Date().getFullYear();

    if (year < 1000 || year > currentYear) {

        showMessage(
            `Year must be between 1000 and ${currentYear}.`,
            "red"
        );

        return;
    }


    const bookData = {

        title: title,
        author: author,
        isbn: isbn,
        category: category,
        year: Number(year),
        status: status

    };


    try {

        let response;

        // UPDATE

        if (id) {

            response = await fetch(`${API_URL}/${id}`, {

                method: "PUT",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify(bookData)

            });

        }

        // CREATE

        else {

            response = await fetch(API_URL, {

                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify(bookData)

            });

        }


        if (!response.ok) {

            const errorData = await response.json();

            throw new Error(
                errorData.message || "Operation failed"
            );
        }


        if (id) {

            showMessage(
                "Book updated successfully!",
                "green"
            );

        } else {

            showMessage(
                "Book added successfully!",
                "green"
            );

        }


        resetForm();

        loadBooks();


    } catch (error) {

        console.error(error);

        showMessage(
            error.message,
            "red"
        );

    }

});


// EDIT BOOK

function editBook(id) {

    const book = books.find(
        item => item.id === id
    );

    if (!book) {
        return;
    }


    document.getElementById("bookId").value = book.id;

    document.getElementById("title").value = book.title;

    document.getElementById("author").value = book.author;

    document.getElementById("isbn").value = book.isbn;

    document.getElementById("category").value = book.category;

    document.getElementById("year").value = book.year;

    document.getElementById("status").value = book.status;


    document.getElementById("formTitle").textContent =
        "Edit Book";


    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });

}


// DELETE BOOK

async function deleteBook(id) {

    const confirmed = confirm(
        "Are you sure you want to delete this book?"
    );


    if (!confirmed) {
        return;
    }


    try {

        const response = await fetch(
            `${API_URL}/${id}`,
            {
                method: "DELETE"
            }
        );


        if (!response.ok) {
            throw new Error("Failed to delete book");
        }


        showMessage(
            "Book deleted successfully!",
            "green"
        );


        loadBooks();


    } catch (error) {

        console.error(error);

        showMessage(
            "Unable to delete the book.",
            "red"
        );

    }

}


// SEARCH / FILTER

searchInput.addEventListener("input", function() {

    const searchTerm =
        searchInput.value.toLowerCase().trim();


    const filteredBooks = books.filter(book =>

        book.title.toLowerCase().includes(searchTerm) ||

        book.author.toLowerCase().includes(searchTerm) ||

        book.isbn.toLowerCase().includes(searchTerm)

    );


    displayBooks(filteredBooks);

});


// DASHBOARD

function updateDashboard() {

    totalBooks.textContent = books.length;


    const available =
        books.filter(
            book => book.status === "Available"
        ).length;


    const issued =
        books.filter(
            book => book.status === "Issued"
        ).length;


    availableBooks.textContent = available;

    issuedBooks.textContent = issued;

}


// RESET FORM

function resetForm() {

    bookForm.reset();

    document.getElementById("bookId").value = "";

    document.getElementById("formTitle").textContent =
        "Add New Book";

}


// MESSAGE

function showMessage(text, color) {

    message.textContent = text;

    message.style.color = color;

    setTimeout(() => {

        message.textContent = "";

    }, 3000);

}


// SECURITY - PREVENT HTML INJECTION

function escapeHTML(value) {

    const div = document.createElement("div");

    div.textContent = value;

    return div.innerHTML;

}
