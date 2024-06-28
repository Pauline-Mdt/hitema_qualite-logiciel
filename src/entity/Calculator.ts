export default class Calculator {
    public addition(a: number, b: number) {
        return a + b;
    }

    public subtraction(a: number, b: number) {
        return a - b;
    }

    public multiplication(a: number, b: number) {
        return a * b;
    }

    public division(a: number, b: number) {
        if (b === 0) {
            throw new Error('Cannot divide by zero');
        }
        return a / b;
    }
}