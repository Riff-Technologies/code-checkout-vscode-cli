# Code Checkout VSCode CLI

A command-line interface for integrating your VSCode Extension with the code-checkout platform.

## Installation

```bash
npm install -g code-checkout-vscode-cli
```

## Usage

### Interactive Setup (Recommended)

Simply run:

```bash
code-checkout
```

This will guide you through all the steps:

1. Authentication (login or create account)
2. Stripe account integration
3. Software registration
4. Pricing setup
5. Project initialization

### Individual Commands

If you need to run specific steps individually:

```bash
# Interactive setup (same as running without command)
code-checkout init

# Log in or create an account
code-checkout login

# Link Stripe account
code-checkout link-stripe

# Create software record
code-checkout create-software

# Set up pricing
code-checkout create-pricing

# Run initialization script
code-checkout run-script

# Log out
code-checkout logout
```

## Development

1. Clone the repository
2. Install dependencies: `npm install`
3. Build the project: `npm run build`
4. Link for local development: `npm link`

## License

ISC
