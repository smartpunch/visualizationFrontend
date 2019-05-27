# Dashboard visualization
Use this repository to visualize your model stats and punch data.

## Getting started
### 1. Clone the repo
### 2. Navigate to the project folder
### 3. Install the neccessary node modules
In the command line of the project root run: `npm i` for a initial load of all node-modules.
### 4. Choose the address of your backend server
Open the file `proxy.js`.<br>
To choose the backend server url change the `proxyConfig.target` property to the url of your backend server. Example:<br>
`var proxyConfig = [{
    context: '/api',
    target: 'http://123.456.789:3000',
    secure: false
}];` 
### 5. Start the dev server (with a specific hostname)
In the command line of the project root, using npm, run the development server with the parameter for the chosen hostaddress like the example:<br>
`npm start --host 123.456.789`<br>
(Serves the angular application on host 123.456.789 at port 4200)
