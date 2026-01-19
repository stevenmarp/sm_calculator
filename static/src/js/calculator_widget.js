/** @odoo-module **/

import { Component, useState, useRef, onMounted, onWillUnmount } from "@odoo/owl";
import { registry } from "@web/core/registry";
import { useService } from "@web/core/utils/hooks";

/**
 * SM Calculator Systray Widget
 */
export class CalculatorSystray extends Component {
    static template = "sm_calculator.CalculatorSystray";
    static props = {};

    setup() {
        this.notification = useService("notification");
        this.calcRef = useRef("calculatorPopup");
        
        this.state = useState({
            isOpen: false,
            display: "0",
            expression: "",
            memory: 0,
            hasMemory: false,
            history: [],
            showHistory: false,
            waitingForOperand: false,
            pendingOperator: null,
            pendingOperand: null,
        });
        
        // Dragging state
        this.isDragging = false;
        this.dragOffset = { x: 0, y: 0 };
        this.position = { x: null, y: null };
        
        // Bind keyboard handler
        this.handleKeyDown = this.handleKeyDown.bind(this);
        
        onMounted(() => {
            document.addEventListener('keydown', this.handleKeyDown);
        });
        
        onWillUnmount(() => {
            document.removeEventListener('keydown', this.handleKeyDown);
        });
    }

    toggleCalculator() {
        this.state.isOpen = !this.state.isOpen;
        if (this.state.isOpen) {
            this.position = { x: null, y: null };
        }
    }

    closeCalculator() {
        this.state.isOpen = false;
    }

    toggleHistory() {
        this.state.showHistory = !this.state.showHistory;
    }

    // Dragging functionality
    onMouseDown(ev) {
        if (ev.target.closest('.calc-header') && !ev.target.closest('button')) {
            this.isDragging = true;
            const popup = this.calcRef.el;
            if (popup) {
                const rect = popup.getBoundingClientRect();
                this.dragOffset = {
                    x: ev.clientX - rect.left,
                    y: ev.clientY - rect.top
                };
                
                document.addEventListener('mousemove', this.onMouseMove.bind(this));
                document.addEventListener('mouseup', this.onMouseUp.bind(this));
            }
        }
    }

    onMouseMove(ev) {
        if (this.isDragging && this.calcRef.el) {
            const popup = this.calcRef.el;
            const x = ev.clientX - this.dragOffset.x;
            const y = ev.clientY - this.dragOffset.y;
            
            popup.style.left = `${x}px`;
            popup.style.top = `${y}px`;
            popup.style.right = 'auto';
            
            this.position = { x, y };
        }
    }

    onMouseUp() {
        this.isDragging = false;
        document.removeEventListener('mousemove', this.onMouseMove.bind(this));
        document.removeEventListener('mouseup', this.onMouseUp.bind(this));
    }

    // Keyboard support
    handleKeyDown(ev) {
        if (!this.state.isOpen) return;
        
        const key = ev.key;
        
        if (key >= '0' && key <= '9') {
            this.inputDigit(key);
        } else if (key === '.') {
            this.inputDecimal();
        } else if (key === '+') {
            this.handleOperator('+');
        } else if (key === '-') {
            this.handleOperator('-');
        } else if (key === '*') {
            this.handleOperator('×');
        } else if (key === '/') {
            ev.preventDefault();
            this.handleOperator('÷');
        } else if (key === '%') {
            this.handlePercent();
        } else if (key === 'Enter' || key === '=') {
            this.handleEquals();
        } else if (key === 'Escape') {
            this.clear();
        } else if (key === 'Backspace') {
            this.handleBackspace();
        }
    }

    // Calculator logic
    inputDigit(digit) {
        if (this.state.waitingForOperand) {
            this.state.display = digit;
            this.state.waitingForOperand = false;
        } else {
            this.state.display = this.state.display === '0' ? digit : this.state.display + digit;
        }
    }

    inputDecimal() {
        if (this.state.waitingForOperand) {
            this.state.display = '0.';
            this.state.waitingForOperand = false;
            return;
        }
        
        if (!this.state.display.includes('.')) {
            this.state.display += '.';
        }
    }

    handleOperator(operator) {
        const inputValue = parseFloat(this.state.display);
        
        if (this.state.pendingOperator && !this.state.waitingForOperand) {
            const result = this.calculate(this.state.pendingOperand, inputValue, this.state.pendingOperator);
            this.state.display = String(this.formatResult(result));
            this.state.pendingOperand = result;
        } else {
            this.state.pendingOperand = inputValue;
        }
        
        this.state.pendingOperator = operator;
        this.state.expression = `${this.state.pendingOperand} ${operator}`;
        this.state.waitingForOperand = true;
    }

    handleEquals() {
        if (!this.state.pendingOperator) return;
        
        const inputValue = parseFloat(this.state.display);
        const result = this.calculate(this.state.pendingOperand, inputValue, this.state.pendingOperator);
        
        const expression = `${this.state.pendingOperand} ${this.state.pendingOperator} ${inputValue}`;
        const formattedResult = this.formatResult(result);
        
        // Add to history
        this.state.history.unshift({
            expression: expression,
            result: formattedResult,
        });
        
        // Keep only last 20 items
        if (this.state.history.length > 20) {
            this.state.history = this.state.history.slice(0, 20);
        }
        
        this.state.display = String(formattedResult);
        this.state.expression = `${expression} =`;
        this.state.pendingOperator = null;
        this.state.pendingOperand = null;
        this.state.waitingForOperand = true;
    }

    calculate(a, b, operator) {
        switch (operator) {
            case '+': return a + b;
            case '-': return a - b;
            case '×': return a * b;
            case '÷': return b !== 0 ? a / b : 'Error';
            default: return b;
        }
    }

    formatResult(result) {
        if (result === 'Error') return result;
        if (!isFinite(result)) return 'Error';
        
        // Round to avoid floating point issues
        const rounded = Math.round(result * 1e10) / 1e10;
        
        // Format large/small numbers
        if (Math.abs(rounded) >= 1e12 || (Math.abs(rounded) < 1e-10 && rounded !== 0)) {
            return rounded.toExponential(6);
        }
        
        return rounded;
    }

    handlePercent() {
        const value = parseFloat(this.state.display);
        this.state.display = String(value / 100);
    }

    handleBackspace() {
        if (this.state.display.length > 1) {
            this.state.display = this.state.display.slice(0, -1);
        } else {
            this.state.display = '0';
        }
    }

    clear() {
        this.state.display = '0';
        this.state.expression = '';
        this.state.pendingOperator = null;
        this.state.pendingOperand = null;
        this.state.waitingForOperand = false;
    }

    clearEntry() {
        this.state.display = '0';
        this.state.waitingForOperand = false;
    }

    toggleSign() {
        const value = parseFloat(this.state.display);
        this.state.display = String(value * -1);
    }

    // Memory functions
    memoryClear() {
        this.state.memory = 0;
        this.state.hasMemory = false;
    }

    memoryRecall() {
        this.state.display = String(this.state.memory);
        this.state.waitingForOperand = true;
    }

    memoryAdd() {
        this.state.memory += parseFloat(this.state.display);
        this.state.hasMemory = true;
        this.state.waitingForOperand = true;
    }

    memorySubtract() {
        this.state.memory -= parseFloat(this.state.display);
        this.state.hasMemory = true;
        this.state.waitingForOperand = true;
    }

    // History functions
    clearHistory() {
        this.state.history = [];
    }

    useHistoryItem(item) {
        this.state.display = String(item.result);
        this.state.waitingForOperand = true;
    }

    // Copy to clipboard
    copyResult() {
        navigator.clipboard.writeText(this.state.display).then(() => {
            this.notification.add("Copied to clipboard!", { type: "success" });
        }).catch(() => {
            this.notification.add("Failed to copy", { type: "danger" });
        });
    }
}

// Register systray item
export const calculatorSystrayItem = {
    Component: CalculatorSystray,
};

registry.category("systray").add("sm_calculator.CalculatorSystray", calculatorSystrayItem, { sequence: 90 });
