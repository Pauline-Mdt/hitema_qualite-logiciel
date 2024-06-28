import Calculator from "../entity/Calculator";

describe('Calculator', () => {
    let calculator: Calculator;

    beforeEach(() => {
        calculator = new Calculator();
    });

    it('should add two numbers', () => {
        expect(calculator.addition(1, 2)).toBe(3);
    });

    it('should subtract two numbers', () => {
        expect(calculator.subtraction(3, 2)).toBe(1);
    });

    it('should multiply two numbers', () => {
        expect(calculator.multiplication(2, 3)).toBe(6);
    });

    it('should divide two numbers', () => {
        expect(calculator.division(6, 3)).toBe(2);
    });

    it('should throw an error when dividing by zero', () => {
        expect(() => calculator.division(6, 0)).toThrowError('Cannot divide by zero');
    });
});