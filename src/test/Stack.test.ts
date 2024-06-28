import Stack from "../entity/Stack";

describe('Stack', () => {
    let stack: Stack<number>;

    beforeEach(() => {
        stack = new Stack<number>();
    });

    it('should add item to stack', () => {
        stack.push(1);
        expect(stack.peek()).toBe(1);
    });

    it('should remove item from stack', () => {
        stack.push(1);
        expect(stack.pop()).toBe(1);
    });

    it('should remove item from empty stack', () => {
        expect(stack.pop()).toBeUndefined();
    });

    it('should peek at top of stack', () => {
        stack.push(1);
        expect(stack.peek()).toBe(1);
    });

    it('should peek at top of empty stack', () => {
        expect(stack.peek()).toBeUndefined();
    });
});