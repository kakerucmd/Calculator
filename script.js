document.addEventListener('DOMContentLoaded', function() {
    const display = document.getElementById('display');
    const historyDisplay = document.getElementById('history');
    const buttons = Array.from(document.getElementsByClassName('btn'));

    let currentInput = '';
    let expression = '';
    let lastInput = '';
    let hasDecimal = false;

    buttons.forEach(button => {
        button.addEventListener('click', () => {
            const value = button.getAttribute('data-value');

            if (value === 'C') {
                currentInput = '';
                expression = '';
                display.innerText = '0';
                historyDisplay.innerText = '';
                hasDecimal = false;
            } else if (value === '=') {
                if (currentInput !== '') {
                    try {
                        if (isValidExpression(currentInput)) {
                            expression += currentInput;
                            const result = calculate(expression);
                            display.innerText = result.toString().slice(0, 14);
                            currentInput = result.toString();
                            if (currentInput.length > 14) {
                                currentInput = currentInput.slice(0, 14);
                            }
                            expression = '';
                            historyDisplay.innerText = '';
                            hasDecimal = currentInput.includes('.');
                        } else {
                            throw new Error("Invalid expression");
                        }
                    } catch {
                        display.innerText = 'ERROR';
                        currentInput = '';
                        expression = '';
                        historyDisplay.innerText = '';
                        hasDecimal = false;
                    }
                }
            } else {
                if ('+-*/'.includes(value)) {
                    if (currentInput !== '') {
                        if (currentInput === '' || '+-*/'.includes(lastInput)) {
                            currentInput = currentInput.slice(0, -1); 
                        }
                        expression += currentInput + value;
                        historyDisplay.innerText = expression.replace(/\*/g, '×').replace(/\//g, '÷');
                        currentInput = '';
                        hasDecimal = false;
                    }
                } else {
                    if (currentInput.length < 14) {
                        if (value === '*') {
                            currentInput += '×';
                        } else if (value === '/') {
                            currentInput += '÷';
                        } else {
                            currentInput += value;
                        }
                    }
                    hasDecimal = currentInput.includes('.') ? true : hasDecimal;
                    display.innerText = currentInput;
                }
            }
            lastInput = value;
        });
    });

    function isValidExpression(expression) {
        return !('+/*'.includes(expression.slice(-1)) || expression === '');
    }

    function calculate(expression) {
        expression = expression.replace(/×/g, '*').replace(/÷/g, '/');
        const tokens = tokenize(expression);
        const rpn = toRPN(tokens);
        return evaluateRPN(rpn);
    }

    function tokenize(expression) {
        const regex = /\d+(\.\d+)?|[+\-*/]/g;
        return expression.match(regex);
    }

    function toRPN(tokens) {
        const precedence = { '+': 1, '-': 1, '*': 2, '/': 2 };
        const outputQueue = [];
        const operatorStack = [];

        tokens.forEach(token => {
            if (/\d/.test(token)) {
                outputQueue.push(token);
            } else if ('+-*/'.includes(token)) {
                while (operatorStack.length && precedence[operatorStack[operatorStack.length - 1]] >= precedence[token]) {
                    outputQueue.push(operatorStack.pop());
                }
                operatorStack.push(token);
            }
        });

        while (operatorStack.length) {
            outputQueue.push(operatorStack.pop());
        }

        return outputQueue;
    }

    function evaluateRPN(rpn) {
        const stack = [];

        rpn.forEach(token => {
            if (/\d/.test(token)) {
                stack.push(parseFloat(token));
            } else {
                const b = stack.pop();
                const a = stack.pop();
                switch (token) {
                    case '+':
                        stack.push(a + b);
                        break;
                    case '-':
                        stack.push(a - b);
                        break;
                    case '*':
                        stack.push(a * b);
                        break;
                    case '/':
                        if (b === 0) {
                            throw new Error("Division by zero");
                        }
                        stack.push(a / b);
                        break;
                }
            }
        });

        if (stack.length !== 1) {
            throw new Error("Invalid expression");
        }

        return stack.pop();
    }
});