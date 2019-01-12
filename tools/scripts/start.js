const webpackConfig = require('../webpack.config.development');
const createDevServerConfig = require('../webpack.config.development.server');
const config = require('../config');
const webpack = require('webpack');
const chalk = require('chalk');
const WebpackDevServer = require('webpack-dev-server');
const clearConsole = require('react-dev-utils/clearConsole');
const {
    choosePort,
    createCompiler,
    prepareProxy,
    prepareUrls,
} = require('react-dev-utils/WebpackDevServerUtils');
const openBrowser = require('react-dev-utils/openBrowser');

const DEFAULT_PORT = parseInt(process.env.PORT, 10) || 3001;
const HOST = process.env.HOST || '0.0.0.0';

const isInteractive = process.stdout.isTTY;

// We attempt to use the default port but if it is busy, we offer the user to
// run on a different port. `detect()` Promise resolves to the next free port.
choosePort(HOST, DEFAULT_PORT)
    .then((port) => {
        // We have not found a port.
        if (port === null) {
            return;
        }

        const protocol = process.env.HTTPS === 'true' ? 'https' : 'http';
        const appName = require(config.appPackageJson).name;
        const urls = prepareUrls(protocol, HOST, port);

        const compiler = createCompiler(webpack, webpackConfig, appName, urls, false);

        const proxySetting = require(config.appPackageJson).proxy;
        const proxyConfig = prepareProxy(proxySetting, config.dist);

        // Serve webpack assets generated by the compiler over a web sever.
        const serverConfig = createDevServerConfig(
            proxyConfig,
            urls.lanUrlForConfig
        );

        const devServer = new WebpackDevServer(compiler, serverConfig);

        // Launch WebpackDevServer.
        devServer.listen(port, HOST, (error) => {
            if (error) {
                return console.log(error);
            }

            if (isInteractive) {
                clearConsole();
            }

            console.log(chalk.cyan('Starting the development server...\n'));

            openBrowser(urls.localUrlForBrowser);
        });

        ['SIGINT', 'SIGTERM'].forEach((sig) => {
            process.on(sig, () => {
                devServer.close();
                process.exit();
            });
        });
    })
    .catch((error) => {
        if (error && error.message) {
            console.log(error.message);
        }

        process.exit(1);
    });