import Book from "./Book";
import User from "./User";
import NotificationService from "../service/NotificationService";

export default class Library {
    private books: Book[] = [];
    private users: User[] = [];
    private borrowedBooks: Map<User, Book[]> = new Map();
    private notificationService: NotificationService;

    constructor(notificationService: NotificationService) {
        this.notificationService = notificationService;
    }

    addBook(book: Book) {
        this.books.push(book);
    }

    getBooks() {
        return this.books;
    }

    registerUser(user: User) {
        this.users.push(user);
    }

    getUsers() {
        return this.users;
    }

    borrowBook(user: User, book: Book) {
        if (!this.books.includes(book)) {
            throw new Error('Book is not available');
        }

        if (!this.users.includes(user)) {
            throw new Error('User is not registered');
        }

        const borrowedBooks = this.borrowedBooks.get(user) || [];
        if (borrowedBooks.includes(book)) {
            throw new Error('Book is already borrowed');
        }

        this.books = this.books.filter(b => b !== book);
        borrowedBooks.push(book);
        this.borrowedBooks.set(user, borrowedBooks);
    }

    getBorrowedBooks(user: User) {
        return this.borrowedBooks.get(user) || [];
    }

    returnBook(user: User, book: Book) {
        let borrowedBooks = this.borrowedBooks.get(user) || [];
        if (!borrowedBooks.includes(book)) {
            throw new Error('Book was not borrowed');
        }

        borrowedBooks = borrowedBooks.filter(b => b !== book);
        this.borrowedBooks.set(user, borrowedBooks);
        this.books.push(book);

        this.users.forEach(user =>{
            this.notificationService.notifyUser(user, 'Book has been returned');
        })
    }

    searchBooksByTitle(title: string, books: Book[] = this.books): Book[] {
        return books.filter(book => book.title.includes(title));
    }

    searchBooksByAuthor(author: string, books: Book[] = this.books): Book[] {
        return books.filter(book => book.author.includes(author));
    }

    getAvailableBooks(): Book[] {
        return this.books;
    }

    sortBooksByTitle(books: Book[] = this.books): Book[] {
        return books.sort((a, b) => a.title.localeCompare(b.title));
    }

    sortBooksByAuthor(books: Book[] = this.books): Book[] {
        return books.sort((a, b) => a.author.localeCompare(b.author));
    }
}