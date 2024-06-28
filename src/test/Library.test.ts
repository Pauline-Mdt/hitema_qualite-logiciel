import Library from "../entity/Library";
import User from "../entity/User";
import Book from "../entity/Book";
import NotificationService from "../service/NotificationService";

describe('Library', () => {
    let library: Library;
    let mockNotificationService: jest.Mocked<NotificationService>;

    beforeEach(() => {
        mockNotificationService = {
            notifyUser: jest.fn(),
        };
        library = new Library(mockNotificationService);
    });

    it('should add a book', () => {
        const book = new Book('Title', 'Author');
        library.addBook(book);
        expect(library.getBooks()).toContain(book);
    });

    it('should register a user', () => {
        const user = new User('John Doe');
        library.registerUser(user);
        expect(library.getUsers()).toContain(user);
    });

    it('should allow a user to borrow a book', () => {
        const user = new User('John Doe');
        library.registerUser(user);
        const book = new Book('Harry Potter', 'J.K. Rowling');
        library.addBook(book);
        library.borrowBook(user, book);
        expect(library.getBorrowedBooks(user)).toContain(book);
    });

    it('should not allow a book to be borrowed twice at the same time', () => {
        const user1 = new User('John Doe');
        const user2 = new User('Jane Doe');
        library.registerUser(user1);
        library.registerUser(user2);
        const book = new Book('Harry Potter', 'J.K. Rowling');
        library.addBook(book);
        library.borrowBook(user1, book);
        expect(() => library.borrowBook(user2, book)).toThrowError('Book is not available');
    });

    it('should not allow a non-registered user to borrow a book', () => {
        const user = new User('John Doe');
        const book = new Book('Harry Potter', 'J.K. Rowling');
        library.addBook(book);
        expect(() => library.borrowBook(user, book)).toThrowError('User is not registered');
    });

    it('should not allow a user to borrow a book that is not available', () => {
        const user = new User('John Doe');
        library.registerUser(user);
        const book = new Book('Harry Potter', 'J.K. Rowling');
        expect(() => library.borrowBook(user, book)).toThrowError('Book is not available');
    });

    it('should allow a user to return a book', () => {
        const user = new User('John Doe');
        library.registerUser(user);
        const book = new Book('Harry Potter', 'J.K. Rowling');
        library.addBook(book);
        library.borrowBook(user, book);
        library.returnBook(user, book);
        expect(library.getBorrowedBooks(user)).not.toContain(book);
        expect(library.getBooks()).toContain(book);
    });

    it('should not allow a user to return a book that was not borrowed', () => {
        const user = new User('John Doe');
        library.registerUser(user);
        const book = new Book('Harry Potter', 'J.K. Rowling');
        expect(() => library.returnBook(user, book)).toThrowError('Book was not borrowed');
        expect(() => library.returnBook(user, book)).toThrowError('Book was not borrowed');
    });

    it('should notify all users when a book is returned', () => {
        const user1 = new User('John Doe');
        const user2 = new User('Jane Doe');
        library.registerUser(user1);
        library.registerUser(user2);
        const book = new Book('Harry Potter', 'J.K. Rowling');
        library.addBook(book);
        library.borrowBook(user1, book);
        library.returnBook(user1, book);
        expect(mockNotificationService.notifyUser).toHaveBeenCalledTimes(2);
        expect(mockNotificationService.notifyUser).toHaveBeenCalledWith(user1, 'Book has been returned');
        expect(mockNotificationService.notifyUser).toHaveBeenCalledWith(user2, 'Book has been returned');
    });

    it('should search books by title', () => {
        const book1 = new Book('Harry Potter', 'J.K. Rowling');
        const book2 = new Book('The Hobbit', 'J.R.R. Tolkien');
        library.addBook(book1);
        library.addBook(book2);
        const results = library.searchBooksByTitle('Harry');
        expect(results).toContain(book1);
        expect(results).not.toContain(book2);
    });

    it('should search books by author', () => {
        const book1 = new Book('Harry Potter', 'J.K. Rowling');
        const book2 = new Book('The Hobbit', 'J.R.R. Tolkien');
        library.addBook(book1);
        library.addBook(book2);
        const results = library.searchBooksByAuthor('Rowling');
        expect(results).toContain(book1);
        expect(results).not.toContain(book2);
    });

    it('should get available books', () => {
        const book1 = new Book('Harry Potter', 'J.K. Rowling');
        const book2 = new Book('The Hobbit', 'J.R.R. Tolkien');
        library.addBook(book1);
        library.addBook(book2);
        const user = new User('John Doe');
        library.registerUser(user);
        library.borrowBook(user, book1);
        const results = library.getAvailableBooks();
        expect(results).toContain(book2);
        expect(results).not.toContain(book1);
    });

    it('should sort books by title', () => {
        const book1 = new Book('The Hobbit', 'J.R.R. Tolkien');
        const book2 = new Book('Harry Potter', 'J.K. Rowling');
        library.addBook(book1);
        library.addBook(book2);
        const results = library.sortBooksByTitle();
        expect(results).toEqual([book2, book1]);
    });

    it('should sort books by author', () => {
        const book1 = new Book('The Hobbit', 'J.R.R. Tolkien');
        const book2 = new Book('Harry Potter', 'J.K. Rowling');
        library.addBook(book1);
        library.addBook(book2);
        const results = library.sortBooksByAuthor();
        expect(results).toEqual([book2, book1]);
    });

    it('should filter and sort books by title', () => {
        const book1 = new Book('Harry Potter', 'J.K. Rowling');
        const book2 = new Book('The Hobbit', 'J.R.R. Tolkien');
        const book3 = new Book('Harry Potter and the Chamber of Secrets', 'J.K. Rowling');
        library.addBook(book1);
        library.addBook(book2);
        library.addBook(book3);
        const results = library.sortBooksByTitle(library.searchBooksByTitle('Harry'));
        expect(results).toEqual([book1, book3]);
    });

    it('should filter and sort books by author', () => {
        const book1 = new Book('Harry Potter', 'J.K. Rowling');
        const book2 = new Book('The Hobbit', 'J.R.R. Tolkien');
        const book3 = new Book('Harry Potter and the Chamber of Secrets', 'J.K. Rowling');
        library.addBook(book1);
        library.addBook(book2);
        library.addBook(book3);
        const results = library.sortBooksByAuthor(library.searchBooksByAuthor('Rowling'));
        expect(results).toEqual([book1, book3]);
    });
});