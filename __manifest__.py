# -*- coding: utf-8 -*-
{
    'name': 'Calculator Widget',
    'version': '17.0.1.0.0',
    'category': 'Productivity',
    'summary': 'Floating calculator widget in systray for quick calculations',
    'description': """
Calculator Widget for Odoo
==========================

A powerful floating calculator accessible from the systray, designed for quick 
calculations without leaving your current work.

Features
-----------
* **Basic Arithmetic** - Addition, Subtraction, Multiplication, Division
* **Percentage Calculations** - Quick percentage operations
* **Memory Functions** - MC, MR, M+, M- for storing values
* **Calculation History** - Review your previous calculations
* **Copy to Clipboard** - Easily copy results
* **Keyboard Support** - Full keyboard navigation
* **Draggable Window** - Position the calculator anywhere on screen
* **Dark/Light Theme** - Adapts to your Odoo theme

How to Use
-------------
1. Click the calculator icon in the systray (top right)
2. Perform calculations using buttons or keyboard
3. Use memory functions to store intermediate results
4. View calculation history
5. Copy results to clipboard with one click

Keyboard Shortcuts
---------------------
* Numbers (0-9) - Input numbers
* +, -, *, / - Operators
* Enter - Calculate result
* Escape - Clear/Close
* Backspace - Delete last digit

Perfect For
--------------
* Quick calculations while creating invoices
* Price calculations in sales orders
* Budget calculations
* Any time you need a calculator!

Technical
------------
* No database dependencies
* Pure JavaScript (OWL framework)
* Works with Odoo 16, 17, and 18
* Minimal performance impact
    """,
    'author': 'Steven Marp',
    'website': 'https://apps.odoo.com/apps/browse?repo_maintainer_id=512936',
    'license': 'OPL-1',
    'depends': ['web'],
    'data': [],
    'assets': {
        'web.assets_backend': [
            'sm_calculator/static/src/scss/calculator.scss',
            'sm_calculator/static/src/js/calculator_widget.js',
            'sm_calculator/static/src/xml/calculator.xml',
        ],
    },
    'images': ['static/description/banner.gif'],
    'installable': True,
    'auto_install': False,
    'application': True,
    'price': 0.00,
    'currency': 'USD',
}
